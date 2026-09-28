// Ket noi realtime phia trinh duyet (giao thuc: protocol.ts). Dung cho game (nguoi choi) va man trinh chieu (PresenterScreen).
// Tu noi lai khi rot mang (1s, 2s, 4s… toi da 10s); moi lan (noi lai) mo ket noi goi hello() de gui lai join / host.
import { LIVE_PATH } from './protocol.ts';
import type { ClientMsg, PlayerState, ServerMsg } from './protocol.ts';

export type LiveStatus = 'connecting' | 'open' | 'closed';

// URL may chu: prop liveUrl (ws://, wss://, http(s):// hoac duong dan tuong doi); mac dinh cung may chu voi trang + /live
// (dev: vite.config.ts chuyen /live sang may chu mau cong 8787)
export function liveUrl(url?: string) {
  const u = new URL(url || LIVE_PATH, location.href);
  if (u.protocol === 'http:') u.protocol = 'ws:';
  if (u.protocol === 'https:') u.protocol = 'wss:';
  return u.href;
}

// Link trong ma QR (co dinh): base (qrUrl; duong dan tuong doi -> theo trang hien tai) hoac trang hien tai, bo #man
export function pageUrl(base?: string) {
  const u = new URL(base || location.href, location.href);
  u.hash = '';
  return u.href;
}

export function liveSocket(url: string, { hello, onMsg, onStatus }: {
  hello: (send: (m: ClientMsg) => void) => void; onMsg?: (m: ServerMsg) => void; onStatus?: (s: LiveStatus) => void;
}) {
  let ws: WebSocket | null = null, stopped = false, wait = 1000, timer: ReturnType<typeof setTimeout> | undefined;
  const send = (m: ClientMsg) => { if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(m)); };
  const retry = () => { if (stopped) return; onStatus?.('closed'); timer = setTimeout(open, wait); wait = Math.min(wait * 2, 10_000); };
  function open() {
    onStatus?.('connecting');
    try { ws = new WebSocket(url); } catch { retry(); return; }
    ws.onopen = () => { wait = 1000; onStatus?.('open'); hello(send); };
    ws.onmessage = e => { try { onMsg?.(JSON.parse(String(e.data))); } catch { /* bo qua tin hong */ } };
    ws.onclose = () => { ws = null; retry(); };
  }
  open();
  return {
    send,
    close() { stopped = true; clearTimeout(timer); if (ws) { ws.onclose = null; ws.close(); } },
  };
}

// Ma nguoi choi theo tab (sessionStorage): tai lai trang van la cung mot nguoi tren man trinh chieu; tab moi = nguoi moi.
// getRandomValues (khong dung randomUUID: can https, dien thoai mo qua http LAN khong co)
function playerId() {
  const k = 'rolecraft.live.id';
  try { const v = sessionStorage.getItem(k); if (v) return v; } catch { /* che do rieng tu */ }
  const id = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, '0')).join('');
  try { sessionStorage.setItem(k, id); } catch { /* bo qua */ }
  return id;
}

// Nguoi choi bao len man trinh chieu: join + trang thai moi nhat (gui lai sau moi lan noi lai). May chu tu choi (du lieu sai,
// day) -> dung han; mat mang -> tu noi lai. Game van choi binh thuong du khong ket noi duoc.
export function livePlayer({ url, name }: { url?: string; name: string }) {
  const id = playerId();
  let state: PlayerState = { where: 'lobby' };
  const sock = liveSocket(liveUrl(url), {
    hello: send => { send({ t: 'join', id, name }); send({ t: 'state', ...state }); },
    onMsg: m => { if (m.t === 'error') sock.close(); },
  });
  return {
    update(s: Partial<PlayerState>) { state = { ...state, ...s }; sock.send({ t: 'state', ...state }); },
    leave() { sock.send({ t: 'leave' }); sock.close(); },      // bam Thoat: man trinh chieu bao "Da roi" ngay
    close: () => sock.close(),                                  // go game (khong bam Thoat): may chu cho GRACE_MS roi bao roi
  };
}
export type LivePlayerHandle = ReturnType<typeof livePlayer>;
