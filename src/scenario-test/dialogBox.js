// Hop thoai kieu game ve duoi san khau kich ban
import { FACE_DEFAULT } from '../shared/sprites.js';
import { CPS } from './scriptPlayer.js';
import { blitCell } from '../shared/cell.js';

const NAME_COLOR = ['#f2b45a', '#7cc7ff', '#9be29b', '#ff9aa8', '#c6a7ff', '#ffd27a'];
function nameColor(who) { let h = 0; for (const ch of who) h = (h * 31 + ch.charCodeAt(0)) | 0; return NAME_COLOR[Math.abs(h) % NAME_COLOR.length]; }
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
function wrapText(ctx, text, maxW) {
  const out = []; let cur = '';
  for (const w of text.split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}

// b: nhip dang phat; line: cau thoai dang hien (co the khong co); lt: ms tu luc cau bat dau
export function drawDialog(ctx, W, y0, h, b, line, lt) {
  const x = 10, y = y0 + 6, w = W - 20, hh = h - 14;
  const who = line ? line.who : (b.face ? 'PM' : '');
  if (!who) return;
  ctx.fillStyle = 'rgba(18,20,28,.92)'; roundRect(ctx, x, y, w, hh, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1; ctx.stroke();
  const narr = who === 'Dẫn truyện';
  let tx = x + 16;
  const ps = hh - 20;
  if (who === 'PM') {                              // PM: chan dung theo nhip, khong co thi face_neutral
    const face = b.face || FACE_DEFAULT;
    if (face) { blitCell(ctx, face, x + 10, y + 10, ps, ps, false); tx = x + 20 + ps; }
  } else if (!narr) {                              // nguoi khac: chua co sprite -> vong tron chu cai dau
    const c = nameColor(who), r = ps * .36, cx = x + 10 + ps / 2, cy = y + 10 + ps / 2;
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#14161c'; ctx.font = `700 ${Math.round(r)}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(who.trim()[0].toUpperCase(), cx, cy + 1);
    ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    tx = x + 20 + ps;
  }
  const maxW = x + w - 14 - tx;
  if (!narr) {
    ctx.fillStyle = who === 'PM' ? '#ffffff' : nameColor(who); ctx.font = '700 16px system-ui,sans-serif';
    ctx.fillText(who, tx, y + 26);
  }
  if (!line) {                                     // nhip co chan dung ma khong co thoai
    ctx.fillStyle = '#8d90a0'; ctx.font = '13px ui-monospace,monospace';
    ctx.fillText(`${b.face[3]} · ${b.face[0]} r${b.face[1]} c${b.face[2]}`, tx, y + 50);
    return;
  }
  const shown = line.text.slice(0, Math.floor(lt * CPS / 1000));
  ctx.font = narr ? 'italic 16px system-ui,sans-serif' : '16px system-ui,sans-serif';
  ctx.fillStyle = narr ? '#c9cbd6' : '#eceef4';
  // Xuong dong theo cau DAY DU roi moi cat theo so ky tu: chu hien dan khong bi nhay dong
  const rows = wrapText(ctx, line.text, maxW);
  let left = shown.length, yy = y + (narr ? 34 : 52);
  for (const r of rows) {
    if (left <= 0) break;
    ctx.fillText(r.slice(0, left), tx, yy);
    left -= r.length + 1; yy += 22;
  }
}
