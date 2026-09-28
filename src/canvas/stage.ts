// San khau man tinh huong: canvas phu ca man, ve PM, emote, phu toi canh dem. Atlas sheets/game_pm.webp (build_preview.py) da xoa
// cham neo va ghep san do cam tay + noi that theo `bind` trong manifest (but long, bang trang, ban lam viec, ban hop...).
// NPC co sprite (npcAtlas.ts) dung chung Actor + drawActor, ve tren canvas rieng cua tung NPC (play/director.ts); chua co -> the UI tam.
import ATLAS from '../generated/atlas.ts';
import { DATA } from '../lib/sprites.ts';
import { IMG, ready, loadSheets } from '../lib/images.ts';
import { asset } from '../lib/ui.ts';
import type { AtlasAnim, PmAtlas, Rect } from '../lib/spriteTypes.ts';

// Trang thai ve san khau (director.ts): foot = day chan (px CSS), ch = cao nhan vat (px), night 0..1, emo = ten icon sheet F
export interface StageView { foot: number; ch: number; night: number; emo: string | null; reach?: number; home?: boolean }
interface Layer { a: AtlasAnim; i: number }
interface Walk { from: number; to: number; t0: number; ms: number; done: () => void }

// Anh nap luc dung lan dau (khong nap luc import – ban nhung dat assetBase truoc): atlas PM + sheet F (emote, icon HUD)
let PM_IMG: HTMLImageElement | null = null;
function images(): HTMLImageElement {
  if (!PM_IMG) { PM_IMG = new Image(); PM_IMG.src = asset('sheets/game_pm.webp'); loadSheets(() => {}, () => {}, ['F']); }
  return PM_IMG;
}
const EMO: Record<string, Rect> = {};
DATA.cells.filter(c => c.s === 'F').forEach(c => { EMO[c.name] = DATA.rects.F[`${c.r},${c.c}`]; });

const STAND = ATLAS.stand;                                // cao dang dung chuan (idle_01) tren atlas, px

// Lam muot ma khong can them anh: sprite AI ve it khung, nhay thang giua 2 dong tac se giat.
export const FADE_MS = 140;        // do mo dan tu khung cu sang dong tac moi
const SETTLE_MS = 220;             // nhun nhe khi vao dong tac moi (nen xuong roi bat len)
const SETTLE = 0.018;              // bien do nhun, ti le chieu cao
const BREATH_MS = 2600, BREATH = 0.007;   // tho: phong nhe theo chieu cao quanh goc chan khi dung yen

// Nhan vat: vi tri x (ti le be ngang), animation dang phat, di chuyen. atlas: PM (mac dinh) hoac NPC (npcAtlas.ts)
// alias = bang thay dong tac (vd PM kiet suc: { idle: 'tired_idle', talk: 'tired_talk', walk: 'tired_walk' }), null = khong thay
export class Actor {
  atlas: PmAtlas; x: number; anim: string; t0: number; walk: Walk | null; then: string | null; flip: boolean;
  last: Layer | null; prev: (Layer & { t0: number }) | null;
  alias: Record<string, string> | null;
  clock: () => number = () => performance.now();   // dong ho game (director: dung khi tam dung)
  constructor(x: number, atlas: PmAtlas = ATLAS) {
    this.atlas = atlas; this.x = x; this.anim = 'idle'; this.t0 = 0; this.walk = null; this.then = null; this.flip = false;
    this.last = null; this.prev = null;           // khung vua ve / khung cu dang mo dan
    this.alias = null;
  }
  play(anim: string, then: string | null = null) {
    anim = this.alias?.[anim] || anim;
    if (this.anim !== anim || then !== this.then) {
      const now = this.clock();
      if (this.anim !== anim && this.last) this.prev = { ...this.last, t0: now };
      this.anim = anim; this.t0 = now;
    }
    this.then = then;
  }
  // Lop can ve tai now: khung cu (mo dan) + khung hien tai, kem he so tho/nhun (scaleY quanh goc chan)
  layers(now: number) {
    const cur = this.frame(now), out: (Layer & { alpha: number })[] = [];
    const p = this.prev ? (now - this.prev.t0) / FADE_MS : 1;
    if (p < 1 && this.prev) out.push({ a: this.prev.a, i: this.prev.i, alpha: 1 - p });
    else this.prev = null;
    out.push({ ...cur, alpha: 1 });
    const settle = Math.max(0, 1 - (now - this.t0) / SETTLE_MS);
    const breath = this.walk ? 0 : Math.sin(now / BREATH_MS * Math.PI * 2) * BREATH;
    return { layers: out, sy: 1 + breath - SETTLE * Math.sin(settle * Math.PI) };
  }
  // Di toi x trong ms; tra ve Promise khi toi noi
  walkTo(x: number, ms: number) {
    return new Promise<void>(done => {
      this.walk = { from: this.x, to: x, t0: this.clock(), ms, done };
      this.flip = x < this.x; this.play('walk');
    });
  }
  // Chi so khung tai now; once = giu khung cuoi, co `then` thi chuyen sang animation do
  frame(now: number): Layer {
    if (this.walk) {
      const w = this.walk, p = Math.min(1, (now - w.t0) / w.ms);
      this.x = p >= 1 ? w.to : w.from + (w.to - w.from) * p;    // toi noi thi dat dung dich (tranh sai so 0.2999...)
      if (p >= 1) { this.walk = null; this.flip = false; this.play('idle'); w.done(); }
    }
    let a = this.atlas.anims[this.anim] || this.atlas.anims.idle;     // NPC thieu dong tac -> dung yen
    const i = Math.floor(Math.max(0, now - this.t0) * a.fps / 1000);
    if (!a.loop && i >= a.n && this.then) {
      const next = this.then; this.then = null; this.play(next); return this.frame(now);
    }
    this.last = { a, i: a.loop ? i % a.n : Math.min(a.n - 1, i) };
    return this.last;
  }
}

// view: { foot (px, CSS), ch (cao nhan vat px), night (0..1), emo: name | null }
export function drawStage(cv: HTMLCanvasElement, pm: Actor, view: StageView, now: number) {
  const pmImg = images();
  const dpr = devicePixelRatio || 1, W = innerWidth, H = innerHeight;
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }
  const ctx = cv.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const s = view.ch / STAND;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

  // canh dem: phu xanh toi len nen + quang den ban quanh PM
  if (view.night > 0) {
    ctx.fillStyle = `rgba(8,12,40,${0.62 * view.night})`; ctx.fillRect(0, 0, W, H);
    const cx = pm.x * W, cy = view.foot - view.ch * 0.5, r = view.ch * 1.6;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255,214,140,${0.28 * view.night})`); g.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  }
  if (!pmImg.complete || !pmImg.naturalWidth) return;

  const cx = Math.round(pm.x * W);
  drawActor(ctx, pm, pmImg, s, cx, view.foot, now);

  // Emote = PM dang nghi: icon trong bong bong suy nghi (mat kinh vien muc nhu .px-bubble) + 2 cham tron dan xuong dau,
  // nhun em. Khong co bong bong thi icon (vd ly ca phe) trong nhu do vat lo lung trong canh.
  if (view.emo && ready('F') && EMO[view.emo]) {
    const [x, y, w, h] = EMO[view.emo], size = view.ch * 0.26, sc = size / Math.max(w, h);
    const bob = Math.sin(now / 320) * 3, pad = size * 0.22, bw = size + 2 * pad, bh = size + 2 * pad;
    const bx = cx + view.ch * 0.16, by = view.foot - view.ch * 1.34 + bob;
    const lw = Math.max(2, view.ch * 0.012);
    const bubble = (path: Path2D) => {
      const g = ctx.createLinearGradient(0, by, 0, by + bh);
      g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e4f0ff');
      ctx.fillStyle = g; ctx.fill(path);
      ctx.lineWidth = lw; ctx.strokeStyle = '#0b1d4d'; ctx.stroke(path);
    };
    ctx.save();
    ctx.shadowColor = 'rgba(8,16,51,.3)'; ctx.shadowOffsetY = 3;
    const dot = (px: number, py: number, r: number) => { const p = new Path2D(); p.arc(px, py, r, 0, Math.PI * 2); bubble(p); };
    dot(bx + bw * 0.12, by + bh + size * 0.2, size * 0.1);          // cham lon gan bong bong
    dot(bx - size * 0.06, by + bh + size * 0.46, size * 0.065);     // cham nho gan dau
    const box = new Path2D(); box.roundRect(bx, by, bw, bh, bw * 0.3); bubble(box);
    ctx.restore();
    ctx.drawImage(IMG.F, x, y, w, h, bx + (bw - w * sc) / 2, by + (bh - h * sc) / 2, w * sc, h * sc);
  }
}

// Ve nhan vat: khung cua animation, goc (ox, oy) = giua day chan dat tai (x, foot) px, s = ti le atlas -> man hinh;
// lat quanh goc khi actor.flip. Doi dong tac: khung cu mo dan (FADE_MS); dung yen: tho nhe; vao dong tac moi: nhun.
export function drawActor(ctx: CanvasRenderingContext2D, actor: Actor, img: CanvasImageSource, s: number, x: number, foot: number, now: number) {
  const { layers, sy } = actor.layers(now);
  ctx.save();
  ctx.translate(x, Math.round(foot));
  ctx.scale(actor.flip ? -1 : 1, sy);                    // sprite ve huong phai; di sang trai / NPC nhin sang PM thi lat
  for (const { a, i, alpha } of layers) {
    const { fw, fh, ox, oy } = a;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, i * fw, a.y, fw, fh, -ox * s, -oy * s, fw * s, fh * s);
  }
  ctx.restore();
}

// Ve mot icon sheet F vua khit canvas (HUD chi so, bang ket qua)
export function drawIcon(cv: HTMLCanvasElement, name: string, size: number) {
  images();
  const dpr = devicePixelRatio || 1;
  cv.width = cv.height = Math.round(size * dpr);
  Object.assign(cv.style, { width: `${size}px`, height: `${size}px` });
  const paint = () => {
    const [x, y, w, h] = EMO[name], sc = cv.width / Math.max(w, h), ctx = cv.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(IMG.F, x, y, w, h, (cv.width - w * sc) / 2, (cv.height - h * sc) / 2, w * sc, h * sc);
  };
  if (ready('F')) paint(); else IMG.F.addEventListener('load', paint, { once: true });
}
