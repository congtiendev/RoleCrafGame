import { DATA, BOTTOM, MAXCELL } from './sprites.js';
import { IMG, ready } from './images.js';

// Ve o (sheet,row,col) vao hop (bx,by,bw,bh); khong xoa canvas
// norm: he so thu nho rieng cua animation (anim.k do build_preview.py do), xem normalize_height
export function blitCell(ctx, f, bx, by, bw, bh, border, norm) {
  const [id, r, c] = f; if (!ready(id)) return;
  const [sx, sy, sw, sh, foot] = DATA.rects[id][r + ',' + c], [mw, mh] = MAXCELL[id];
  const k = Math.min(bw / mw, bh / mh) * (norm || 1);
  // Lam tron ve pixel nguyen: toa do le lam anh bi lay mau lech moi khung -> vien nhoe/rung.
  // Day khung = mot duong nguyen co dinh, nen chan khong nhich len xuong 1px giua cac khung.
  const dw = Math.round(sw * k), dh = Math.round(sh * k);
  const dx = Math.round(BOTTOM[id] ? bx + bw / 2 - foot * k : bx + (bw - dw) / 2);
  const dy = BOTTOM[id] ? Math.round(by + bh) - dh : Math.round(by + (bh - dh) / 2);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(IMG[id], sx, sy, sw, sh, dx, dy, dw, dh);
  if (border) {
    ctx.strokeStyle = 'rgba(47,111,222,.8)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.strokeRect(dx + .5, dy + .5, dw - 1, dh - 1); ctx.setLineDash([]);
  }
}

// Xoa canvas roi ve mot o vua khit
export function drawCell(ctx, f, border, norm) {
  const c = ctx.canvas; ctx.clearRect(0, 0, c.width, c.height);
  const pad = c.width * .02;
  blitCell(ctx, f, pad, pad, c.width - 2 * pad, c.height - 2 * pad, border, norm);
}
