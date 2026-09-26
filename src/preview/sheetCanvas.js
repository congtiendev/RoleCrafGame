// Sheet goc kem khung o do duoc
import { DATA, NAME_AT } from '../shared/sprites.js';
import { IMG, ready } from '../shared/images.js';

// Ve ca sheet, to dam o co ten khop query; false neu anh chua nap
export function drawSheet(cv, id, query) {
  if (!ready(id)) return false;
  const im = IMG[id], R = DATA.rects[id], q = query.trim().toLowerCase();
  cv.width = im.naturalWidth; cv.height = im.naturalHeight;
  const ctx = cv.getContext('2d'); ctx.drawImage(im, 0, 0);
  for (const k in R) {
    const [x, y, cw, ch] = R[k], [r, c] = k.split(',');
    const nm = NAME_AT[[id, r, c].join()] || '', hit = q && nm.toLowerCase().includes(q);
    ctx.strokeStyle = hit ? '#e8492f' : 'rgba(47,111,222,.5)'; ctx.lineWidth = hit ? 6 : 2;
    ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x + 2, y + 2, 44, 18);
    ctx.fillStyle = '#fff'; ctx.font = '12px ui-monospace,monospace'; ctx.fillText(`r${r}c${c}`, x + 6, y + 15);
  }
  return true;
}

// Toa do pixel tren sheet -> [row, col] cua o chua no, hoac null
export function cellAt(id, px, py) {
  const R = DATA.rects[id];
  for (const k in R) {
    const [x, y, cw, ch] = R[k];
    if (px >= x && px < x + cw && py >= y && py < y + ch) return k.split(',');
  }
  return null;
}
