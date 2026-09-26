// San khau kich ban: nhan vat o tren, hop thoai o duoi
import { SHEET } from '../shared/sprites.js';
import { ready } from '../shared/images.js';
import { blitCell } from '../shared/cell.js';
import { drawDialog } from './dialogBox.js';

// fs: ket qua frameState(); null -> canh chi co do vat, ve hang do vat `scene`
export function drawStage(cv, fs, scene, border) {
  const ctx = cv.getContext('2d'), Z = cv.width / 480, W = 480, H = cv.height / Z, SH = 470;
  ctx.setTransform(Z, 0, 0, Z, 0, 0);          // ve theo don vi 480, canvas that lon hon cho net
  ctx.clearRect(0, 0, W, H);
  if (!fs) {
    const n = scene.length || 1, s = Math.min(W / n, SH * .7);
    scene.forEach((x, i) => blitCell(ctx, x, (W - s * n) / 2 + i * s, (SH - s) / 2, s, s, border));
    return;
  }
  // San khau o tren (SH), hop thoai o duoi — thoai khong che nhan vat
  const bx = W * .08, by = 14, bw = W * .84, bh = SH - 24;
  if (!ready(fs.frame[0])) {
    ctx.fillStyle = '#888'; ctx.font = '16px system-ui,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Đang nạp ' + SHEET[fs.frame[0]].file + '…', W / 2, SH / 2); ctx.textAlign = 'start';
    return;
  }
  // Ve thang mot khung, giong A.spr cua game. Da thu hoa tron khung cu + co gian
  // "tho": ca hai deu de lai vet mo cua tu the truoc va lam anh nhap nhay.
  blitCell(ctx, fs.frame, bx, by, bw, bh, border, fs.anim.k);
  if (fs.beat.emo) blitCell(ctx, fs.beat.emo, W * .7, 14 + Math.round(Math.sin(fs.t / 180) * 4), W * .2, W * .2, false);
  drawDialog(ctx, W, SH, H - SH, fs.beat, fs.line, fs.lineT);
}
