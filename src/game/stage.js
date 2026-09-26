// San khau man tinh huong: canvas phu ca man, ve PM, emote, phu toi canh dem. Atlas sheets/game_pm.webp (build_preview.py) da xoa
// cham neo va ghep san do cam tay + noi that theo `bind` trong manifest (but long, bang trang, ban lam viec, ban hop...).
// NPC chua co sprite -> the UI tam (LevelScreen), khong ve o day.
import ATLAS from './atlas.js';
import { DATA } from '../shared/sprites.js';
import { IMG, ready, loadSheets } from '../shared/images.js';

const PM_IMG = new Image();
PM_IMG.src = 'sheets/game_pm.webp';
loadSheets(() => {}, () => {}, ['F']);                  // emote (sheet F)
const EMO = {};
DATA.cells.filter(c => c.s === 'F').forEach(c => { EMO[c.name] = DATA.rects.F[`${c.r},${c.c}`]; });

const STAND = ATLAS.stand;                                // cao dang dung chuan (idle_01) tren atlas, px

// PM: vi tri x (ti le be ngang), animation dang phat, di chuyen
export class Actor {
  constructor(x) { this.x = x; this.anim = 'idle'; this.t0 = 0; this.walk = null; this.then = null; this.flip = false; }
  play(anim, then = null) {
    if (this.anim !== anim || then !== this.then) { this.anim = anim; this.t0 = performance.now(); }
    this.then = then;
  }
  // Di toi x trong ms; tra ve Promise khi toi noi
  walkTo(x, ms) {
    return new Promise(done => {
      this.walk = { from: this.x, to: x, t0: performance.now(), ms, done };
      this.flip = x < this.x; this.play('walk');
    });
  }
  // Chi so khung tai now; once = giu khung cuoi, co `then` thi chuyen sang animation do
  frame(now) {
    if (this.walk) {
      const w = this.walk, p = Math.min(1, (now - w.t0) / w.ms);
      this.x = p >= 1 ? w.to : w.from + (w.to - w.from) * p;    // toi noi thi dat dung dich (tranh sai so 0.2999...)
      if (p >= 1) { this.walk = null; this.flip = false; this.play('idle'); w.done(); }
    }
    let a = ATLAS.anims[this.anim];
    const i = Math.floor(Math.max(0, now - this.t0) * a.fps / 1000);
    if (!a.loop && i >= a.n && this.then) {
      const next = this.then; this.then = null; this.play(next); return this.frame(now);
    }
    return { a, i: a.loop ? i % a.n : Math.min(a.n - 1, i) };
  }
}

// view: { foot (px, CSS), ch (cao nhan vat px), night (0..1), emo: name | null }
export function drawStage(cv, pm, view, now) {
  const dpr = devicePixelRatio || 1, W = innerWidth, H = innerHeight;
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }
  const ctx = cv.getContext('2d');
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
  if (!PM_IMG.complete || !PM_IMG.naturalWidth) return;

  // khung cua animation: goc (ox, oy) = giua day chan dat tai (pm.x, view.foot); lat quanh goc khi di sang trai
  const { a, i } = pm.frame(now), { fw, fh, ox, oy } = a, cx = Math.round(pm.x * W);
  ctx.save();
  ctx.translate(cx, Math.round(view.foot));
  if (pm.flip) ctx.scale(-1, 1);                         // sprite ve huong phai; di sang trai thi lat
  ctx.drawImage(PM_IMG, i * fw, a.y, fw, fh, -ox * s, -oy * s, fw * s, fh * s);
  ctx.restore();

  // Emote = PM dang nghi: icon trong bong bong suy nghi (mat kinh vien muc nhu .px-bubble) + 2 cham tron dan xuong dau,
  // nhun em. Khong co bong bong thi icon (vd ly ca phe) trong nhu do vat lo lung trong canh.
  if (view.emo && ready('F') && EMO[view.emo]) {
    const [x, y, w, h] = EMO[view.emo], size = view.ch * 0.26, sc = size / Math.max(w, h);
    const bob = Math.sin(now / 320) * 3, pad = size * 0.22, bw = size + 2 * pad, bh = size + 2 * pad;
    const bx = cx + view.ch * 0.16, by = view.foot - view.ch * 1.34 + bob;
    const lw = Math.max(2, view.ch * 0.012);
    const bubble = path => {
      const g = ctx.createLinearGradient(0, by, 0, by + bh);
      g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e4f0ff');
      ctx.fillStyle = g; ctx.fill(path);
      ctx.lineWidth = lw; ctx.strokeStyle = '#0b1d4d'; ctx.stroke(path);
    };
    ctx.save();
    ctx.shadowColor = 'rgba(8,16,51,.3)'; ctx.shadowOffsetY = 3;
    const dot = (px, py, r) => { const p = new Path2D(); p.arc(px, py, r, 0, Math.PI * 2); bubble(p); };
    dot(bx + bw * 0.12, by + bh + size * 0.2, size * 0.1);          // cham lon gan bong bong
    dot(bx - size * 0.06, by + bh + size * 0.46, size * 0.065);     // cham nho gan dau
    const box = new Path2D(); box.roundRect(bx, by, bw, bh, bw * 0.3); bubble(box);
    ctx.restore();
    ctx.drawImage(IMG.F, x, y, w, h, bx + (bw - w * sc) / 2, by + (bh - h * sc) / 2, w * sc, h * sc);
  }
}

// Ve mot icon sheet F vua khit canvas (HUD chi so, bang ket qua)
export function drawIcon(cv, name, size) {
  const dpr = devicePixelRatio || 1;
  cv.width = cv.height = Math.round(size * dpr);
  Object.assign(cv.style, { width: `${size}px`, height: `${size}px` });
  const paint = () => {
    const [x, y, w, h] = EMO[name], sc = cv.width / Math.max(w, h), ctx = cv.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(IMG.F, x, y, w, h, (cv.width - w * sc) / 2, (cv.height - h * sc) / 2, w * sc, h * sc);
  };
  if (ready('F')) paint(); else IMG.F.addEventListener('load', paint, { once: true });
}
