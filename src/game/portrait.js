// Chan dung PM (sheet D – 20 bieu cam, khung vang ve san) cho hop thoai / doan dan truyen cua trang game.
// Chi nap sheet D; ve thang tu anh sheet (khong doc diem anh nen chay duoc ca file://).
import { DATA } from '../shared/sprites.js';
import { IMG, ready, loadSheets } from '../shared/images.js';

const waiting = [];
loadSheets(() => waiting.splice(0).forEach(f => f()), () => {}, ['D']);

const FACE = {};                       // ten bieu cam -> [x, y, w, h] tren sheet D
DATA.cells.filter(c => c.s === 'D').forEach(c => { FACE[c.name] = DATA.rects.D[`${c.r},${c.c}`]; });

// Ve bieu cam `name` vua khit canvas (kich thuoc CSS size px)
export function drawFace(cv, name, size) {
  const dpr = devicePixelRatio || 1;
  if (cv.width !== Math.round(size * dpr)) {
    cv.width = cv.height = Math.round(size * dpr);
    Object.assign(cv.style, { width: `${size}px`, height: `${size}px` });
  }
  if (!ready('D')) { waiting.push(() => drawFace(cv, name, size)); return; }
  const [x, y, w, h] = FACE[name] || FACE.face_neutral, s = Math.min(cv.width / w, cv.height / h);
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(IMG.D, x, y, w, h, (cv.width - w * s) / 2, (cv.height - h * s) / 2, w * s, h * s);
}
