// Kiem tra may chu realtime man trinh chieu theo giao thuc src/live/protocol.ts (docs/BE_REALTIME_TRINH_CHIEU.md).
// Mac dinh chay tren mock (dev/mock-live-server.ts, GRACE rut con 300ms). BE kiem tra may chu that (danh sach chung co the
// da co nguoi khac: moi test chi xet nguoi choi cua minh, ma ngau nhien):
//   LIVE_URL=ws://localhost:3000/live GRACE_MS=10000 node --test tests/live.test.ts
// May chu that kiem tra quyen admin cho tin 'host': dat LIVE_HOST_URL = URL co kem the admin (vd ws://…/live?token=...) –
// WebSocket cua Node khong gui cookie / header tuy y.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createLiveServer } from '../dev/mock-live-server.ts';
import type { ClientMsg, LiveEvent, LivePlayer, ServerMsg } from '../src/live/protocol.ts';

const EXTERNAL = process.env.LIVE_URL;
const GRACE = EXTERNAL ? +(process.env.GRACE_MS || 10_000) : 300;
let url = EXTERNAL || '', hostUrl = process.env.LIVE_HOST_URL || '', mock: ReturnType<typeof createLiveServer> | null = null;
before(async () => {
  if (!EXTERNAL) {
    mock = createLiveServer({ graceMs: GRACE, log: () => {} });
    url = `ws://127.0.0.1:${await mock.ready}/live`;
  }
  hostUrl ||= url;
});
after(() => mock?.close());

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const pid = () => 'test' + randomBytes(8).toString('hex');
type Players = Extract<ServerMsg, { t: 'players' }>;
type Ev = Extract<ServerMsg, { t: 'event' }>;

// Ket noi thu: ghi lai moi tin nhan; wait(pred) cho tin nhan thoa dieu kien (tinh ca tin da den)
async function client(to = url) {
  const ws = new WebSocket(to), inbox: ServerMsg[] = [];
  const waiters: { pred: (m: ServerMsg) => boolean; res: (m: ServerMsg) => void }[] = [];
  ws.onmessage = e => {
    const m = JSON.parse(String(e.data)) as ServerMsg; inbox.push(m);
    for (const w of [...waiters]) if (w.pred(m)) { waiters.splice(waiters.indexOf(w), 1); w.res(m); }
  };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  return {
    ws, inbox,
    send: (m: ClientMsg) => ws.send(JSON.stringify(m)),
    wait<T extends ServerMsg>(pred: (m: ServerMsg) => boolean, ms = 3000): Promise<T> {
      const hit = inbox.find(pred);
      if (hit) return Promise.resolve(hit as T);
      return new Promise((res, rej) => {
        const t = setTimeout(() => rej(new Error('het thoi gian cho tin nhan')), ms);
        waiters.push({ pred, res: m => { clearTimeout(t); res(m as T); } });
      });
    },
    close: () => ws.close(),
  };
}
type Client = Awaited<ReturnType<typeof client>>;
async function host() { const h = await client(hostUrl); h.send({ t: 'host' }); await h.wait(m => m.t === 'players'); return h; }
async function player(id: string, name: string) { const p = await client(); p.send({ t: 'join', id, name }); await p.wait(m => m.t === 'joined'); return p; }
// Nguoi choi `id` trong danh sach moi nhat thoa dieu kien (may chu co the gop nhieu thay doi vao mot lan gui)
const seen = (h: Client, id: string, pred: (p: LivePlayer) => boolean = () => true, ms?: number) =>
  h.wait<Players>(m => m.t === 'players' && m.players.some(p => p.id === id && pred(p)), ms).then(m => m.players.find(p => p.id === id)!);
const latest = (h: Client, id: string) => (h.inbox.filter(m => m.t === 'players').at(-1) as Players).players.find(p => p.id === id);
const eventsOf = (h: Client, id: string) => h.inbox.filter((m): m is Ev => m.t === 'event' && m.event.id === id).map(m => m.event);

test('man trinh chieu: host -> nhan ca danh sach; nguoi choi join -> hien "dang choi" o sanh + su kien join', async () => {
  const h = await host(), id = pid();
  const p = await player(id, '  Nguyễn   Khánh An ');
  const a = await seen(h, id);
  assert.equal(a.name, 'Nguyễn Khánh An', 'ten duoc chuan hoa khoang trang');
  assert.deepEqual([a.status, a.where], ['playing', 'lobby']);
  assert.ok(a.joinedAt > 0 && a.updatedAt >= a.joinedAt);
  const ev = (await h.wait<Ev>(m => m.t === 'event' && m.event.id === id)).event;
  assert.deepEqual([ev.kind, ev.name], ['join', 'Nguyễn Khánh An']);
  p.close(); h.close();
});

test('state: level/ngay; ket qua -> hoan thanh + su kien finish; choi lai -> dang choi', async () => {
  const h = await host(), id = pid();
  const p = await player(id, 'Bình');
  p.send({ t: 'state', where: 'play', level: 2, day: 18, result: null });
  const a = await seen(h, id, x => x.day === 18);
  assert.deepEqual([a.where, a.level, a.day, a.status], ['play', 2, 18, 'playing']);
  p.send({ t: 'state', where: 'play', level: 4, day: 60, result: { code: 'PASS', label: 'Pass', mood: 'good' } });
  const b = await seen(h, id, x => x.status === 'finished');
  assert.deepEqual(b.result, { code: 'PASS', label: 'Pass', mood: 'good' });
  const fin = (await h.wait<Ev>(m => m.t === 'event' && m.event.id === id && m.event.kind === 'finish')).event;
  assert.deepEqual([fin.label, fin.mood], ['Pass', 'good']);
  p.send({ t: 'state', where: 'play', level: 4, day: 46, result: null });          // choi lai giai doan cuoi
  const c = await seen(h, id, x => x.status === 'playing' && x.day === 46);
  assert.equal(c.result, null);
  p.close(); h.close();
});

test('leave -> da roi ngay; mat ket noi -> da roi sau GRACE; noi lai trong GRACE -> van dang choi, khong nhan doi', async () => {
  const h = await host(), [ia, ib, ic] = [pid(), pid(), pid()];
  const a = await player(ia, 'An'), b = await player(ib, 'Bình'), c = await player(ic, 'Châu');
  await seen(h, ic);
  a.send({ t: 'leave' });
  await seen(h, ia, x => x.status === 'left', 1000);                              // khong cho GRACE

  b.close();                                                                       // dong tab
  await sleep(GRACE / 2);
  assert.equal(latest(h, ib)?.status, 'playing', 'chua het GRACE');
  await seen(h, ib, x => x.status === 'left', GRACE + 2000);

  c.close();                                                                       // tai lai trang: ket noi moi cung id trong GRACE
  const c2 = await player(ic, 'Châu');
  await sleep(GRACE + 300);
  assert.equal(latest(h, ic)?.status, 'playing', 'noi lai kip -> van dang choi');
  const last = (h.inbox.filter(m => m.t === 'players').at(-1) as Players).players;
  assert.equal(last.filter(p => p.id === ic).length, 1, 'khong nhan doi nguoi choi');
  // thu tu: dang choi -> hoan thanh -> da roi
  const rank = { playing: 0, finished: 1, left: 2 };
  assert.ok(last.every((p, i) => i === 0 || rank[last[i - 1].status] <= rank[p.status]), 'sap xep theo trang thai');
  assert.deepEqual([...eventsOf(h, ia), ...eventsOf(h, ib)].map(e => e.kind), ['join', 'leave', 'join', 'leave']);
  c2.close(); h.close();
});

test('nguoi da roi join lai -> su kien back; man trinh chieu mo lai nhan lai danh sach + lich su hoat dong', async () => {
  const h = await host(), id = pid();
  const a = await player(id, 'Dũng');
  a.send({ t: 'leave' }); a.close();
  await seen(h, id, x => x.status === 'left');
  const a2 = await player(id, 'Dũng');
  await seen(h, id, x => x.status === 'playing');
  await h.wait(m => m.t === 'event' && m.event.id === id && m.event.kind === 'back');
  h.close();
  const h2 = await host();
  assert.equal(latest(h2, id)?.name, 'Dũng');
  await sleep(200);
  assert.deepEqual(eventsOf(h2, id).map((e: LiveEvent) => e.kind), ['join', 'leave', 'back'], 'lich su hoat dong theo thu tu cu -> moi');
  a2.close(); h2.close();
});

test('tu choi du lieu sai: ma nguoi choi / ten sai, tin nhan hong, so / ket qua ngoai mien; nguoi choi khong doc duoc danh sach', async () => {
  const h = await host(), id = pid();
  const q = await client();
  const errors = () => q.inbox.filter(m => m.t === 'error').length;
  q.send({ t: 'join', id: 'x', name: 'Hà' });
  assert.equal((await q.wait<Extract<ServerMsg, { t: 'error' }>>(m => m.t === 'error')).code, 'bad', 'ma nguoi choi qua ngan');
  q.send({ t: 'join', id, name: ' ' });
  await q.wait(m => m.t === 'error' && errors() === 2);
  q.ws.send('{hong');
  await q.wait(m => m.t === 'error' && errors() === 3);
  q.send({ t: 'join', id, name: 'Hà'.padEnd(40, 'a') });
  await q.wait(m => m.t === 'joined');
  assert.equal((await seen(h, id)).name.length, 24, 'ten cat con 24 ky tu');
  q.send({ t: 'state', where: 'play', level: 2, day: 999, result: { code: 'X', label: 'Y', mood: 'evil' } as never });
  const s = await seen(h, id, x => x.where === 'play');
  assert.equal(s.day, undefined, 'ngay ngoai 0..60 bi bo'); assert.equal(s.result, null, 'ket qua sai dinh dang bi bo');
  await sleep(200);
  assert.ok(!q.inbox.some(m => m.t === 'players' || m.t === 'event'), 'nguoi choi khong nhan danh sach');
  q.close(); h.close();
});
