// MOCK may chu realtime cho FE khi dev / test (KHONG dung chay that): dat dung giao thuc src/live/protocol.ts de man trinh chieu
// va game chay duoc truoc khi BE xong. May chu that do BE lam theo docs/BE_REALTIME_TRINH_CHIEU.md.
// npm run dev tu gan mock vao chinh dev server (vite.config.ts: cung cong, duong dan /live); test tao may chu rieng (port 0).
// Luu trong bo nho (tat dev server = mat danh sach). Mock KHONG kiem tra quyen admin (may chu that phai kiem tra).
//   - Mot danh sach chung: nguoi choi doc lap, khong phong; man trinh chieu (host) chi xem.
//   - Nguoi choi: join {id, name} sau khi nhap ten, gui state khi doi; mat ket noi qua GRACE_MS (khong noi lai) -> "Da roi".
//   - Nguoi choi khong nhan danh sach (chi ket noi host moi nhan players / event).
//   - Heartbeat ping 15 giay (dong ket noi chet), tin nhan toi da 2 KB, ten toi da NAME_MAX ky tu, toi da MAX_PLAYERS nguoi;
//     nguoi da roi xoa khoi danh sach sau LEFT_TTL.
import { createServer } from 'node:http';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import type { EventEmitter } from 'node:events';
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import { GRACE_MS, LIVE_PATH, NAME_MAX } from '../src/live/protocol.ts';
import type { ClientMsg, LiveEvent, LivePlayer, LiveResult, ServerMsg } from '../src/live/protocol.ts';

const MAX_PLAYERS = 2000, EVENTS_KEPT = 30, LEFT_TTL = 3600_000, HEARTBEAT = 15_000;
interface Meta { alive: boolean; host?: boolean; id?: string }

const send = (ws: WebSocket, m: ServerMsg) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(m)); };
// ten: chuan hoa, bo ky tu dieu khien, cat do dai (game da kiem tra, may chu kiem tra lai)
const cleanName = (v: unknown) => String(v ?? '').normalize('NFC').replace(/[\p{Cc}\p{Cf}]/gu, '').trim().replace(/\s+/g, ' ').slice(0, NAME_MAX);
const smallInt = (v: unknown, max: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max ? v as number : undefined);
function cleanResult(r: unknown): LiveResult | null {
  if (!r || typeof r !== 'object') return null;
  const { code, label, mood } = r as Record<string, unknown>;
  if (typeof code !== 'string' || typeof label !== 'string' || !['good', 'mid', 'bad'].includes(mood as string)) return null;
  return { code: code.slice(0, 40), label: label.slice(0, 60), mood: mood as LiveResult['mood'] };
}
// Thu tu danh sach: dang choi (vao truoc len truoc) -> hoan thanh -> da roi
const ORDER = { playing: 0, finished: 1, left: 2 } as const;

// server: gan vao may chu HTTP co san (dev server Vite) – chi nhan nang cap WebSocket o LIVE_PATH, cac ket noi khac (HMR cua Vite)
// de nguyen; khong co: tu tao may chu rieng o cong `port` (0 = cong ngau nhien, dung cho test)
export function createLiveServer({ server, port = 0, graceMs = GRACE_MS, log = console.log }: {
  server?: EventEmitter | null; port?: number; graceMs?: number; log?: (...a: unknown[]) => void;
} = {}) {
  const players = new Map<string, LivePlayer>(), hosts = new Set<WebSocket>();
  const sockets = new Map<string, Set<WebSocket>>();           // id nguoi choi -> ket noi dang mo (tai lai trang: moi truoc, cu dong sau)
  const timers = new Map<string, NodeJS.Timeout>();            // id -> hen danh dau "Da roi"
  let events: LiveEvent[] = [], flush: NodeJS.Timeout | undefined;
  const meta = new WeakMap<WebSocket, Meta>();
  const own = server ? null : createServer((_req, res) => { res.writeHead(404).end(); });
  const http: EventEmitter = server ?? own!;
  const wss = new WebSocketServer({ noServer: true, maxPayload: 2048 });
  const upgrade = (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    if (new URL(req.url || '/', 'http://x').pathname !== LIVE_PATH) return;
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
  };
  http.on('upgrade', upgrade);

  const list = () => [...players.values()].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.joinedAt - b.joinedAt);
  // Gui danh sach cho man trinh chieu: gop cac thay doi trong 100ms thanh mot lan
  const push = () => { flush ??= setTimeout(() => { flush = undefined; const m: ServerMsg = { t: 'players', players: list() }; hosts.forEach(h => send(h, m)); }, 100); };
  const event = (e: Omit<LiveEvent, 'at'>) => {
    const ev = { ...e, at: Date.now() };
    events = [...events, ev].slice(-EVENTS_KEPT);
    hosts.forEach(h => send(h, { t: 'event', event: ev }));
  };
  const markLeft = (id: string) => {
    const p = players.get(id);
    clearTimeout(timers.get(id)); timers.delete(id);
    if (!p || p.status === 'left') return;
    p.status = 'left'; p.updatedAt = Date.now();
    event({ kind: 'leave', id, name: p.name }); push();
  };
  // Ket noi cua nguoi choi dong: con ket noi khac cung id thi thoi; khong thi hen GRACE roi "Da roi"
  const detach = (ws: WebSocket, id: string) => {
    const set = sockets.get(id); set?.delete(ws);
    if (set?.size) return;
    sockets.delete(id);
    timers.set(id, setTimeout(() => markLeft(id), graceMs));
  };

  function onMessage(ws: WebSocket, m: Meta, msg: ClientMsg) {
    if (msg.t === 'host') {                                           // may chu that: kiem tra quyen admin truoc (loi 'auth')
      hosts.add(ws); m.host = true;
      send(ws, { t: 'players', players: list() });
      events.forEach(event => send(ws, { t: 'event', event }));
      return;
    }
    if (msg.t === 'join') {
      const id = String(msg.id), name = cleanName(msg.name);
      if (!/^[\w-]{8,40}$/.test(id) || name.length < 2) return send(ws, { t: 'error', code: 'bad', message: 'Thiếu tên hoặc mã người chơi.' });
      let p = players.get(id);
      if (!p && players.size >= MAX_PLAYERS) return send(ws, { t: 'error', code: 'full', message: 'Đã đủ số người chơi.' });
      if (m.id && m.id !== id) detach(ws, m.id);
      m.id = id;
      clearTimeout(timers.get(id)); timers.delete(id);
      const set = sockets.get(id) ?? new Set(); set.add(ws); sockets.set(id, set);
      const now = Date.now();
      if (!p) {
        p = { id, name, status: 'playing', where: 'lobby', joinedAt: now, updatedAt: now };
        players.set(id, p); event({ kind: 'join', id, name });
      } else {
        if (p.status === 'left') { p.status = p.result ? 'finished' : 'playing'; event({ kind: 'back', id, name }); }
        p.name = name; p.updatedAt = now;
      }
      send(ws, { t: 'joined' }); push();
      return;
    }
    const p = m.id ? players.get(m.id) : undefined;
    if (!p) return;
    if (msg.t === 'leave') { sockets.get(p.id)?.delete(ws); m.id = undefined; markLeft(p.id); return; }
    if (msg.t === 'state') {
      p.where = msg.where === 'play' ? 'play' : 'lobby';
      p.level = smallInt(msg.level, 99); p.day = smallInt(msg.day, 60);
      const result = cleanResult(msg.result);
      if (result && p.status !== 'finished') event({ kind: 'finish', id: p.id, name: p.name, label: result.label, mood: result.mood });
      p.result = result;
      p.status = result ? 'finished' : 'playing';                       // choi lai sau khi xong -> dang choi
      p.updatedAt = Date.now(); push();
    }
  }

  wss.on('connection', ws => {
    const m: Meta = { alive: true };
    meta.set(ws, m);
    ws.on('pong', () => { m.alive = true; });
    ws.on('message', raw => {
      let msg: ClientMsg;
      try { msg = JSON.parse(String(raw)); } catch { return send(ws, { t: 'error', code: 'bad', message: 'Tin nhắn không hợp lệ.' }); }
      if (msg && typeof msg === 'object') onMessage(ws, m, msg);
    });
    ws.on('close', () => { if (m.host) hosts.delete(ws); else if (m.id) detach(ws, m.id); });
  });

  const beat = setInterval(() => {
    for (const ws of wss.clients) {
      const m = meta.get(ws);
      if (!m) continue;
      if (!m.alive) { ws.terminate(); continue; }
      m.alive = false; ws.ping();
    }
    const old = Date.now() - LEFT_TTL;                                 // don nguoi da roi lau
    let pruned = false;
    for (const [id, p] of players) if (p.status === 'left' && p.updatedAt < old) { players.delete(id); pruned = true; }
    if (pruned) push();
  }, HEARTBEAT);
  log(`mock realtime ${LIVE_PATH}`);

  const ready = own ? new Promise<number>(res => own.listen(port, () => res((own.address() as { port: number }).port))) : Promise.resolve(0);
  return {
    ready,                                                              // may chu rieng -> cong that
    players,
    close: () => new Promise<void>(res => {
      clearInterval(beat); clearTimeout(flush); timers.forEach(clearTimeout);
      wss.clients.forEach(ws => ws.terminate());
      wss.close(); http.off('upgrade', upgrade);
      if (own) own.close(() => res()); else res();
    }),
  };
}
