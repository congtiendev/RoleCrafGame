// PM dung cho (idle) cho cac man cua trang game: dai 4 khung da to lai cham neo va can chan san
// (build_preview.py -> sheets/start_pm_idle.webp). Ve thang tung khung, khong doc diem anh luc chay
// (file:// cam getImageData).
import { ANIM } from '../shared/sprites.js';

const STRIP = new Image(), FRAMES = 4, FPS = ANIM.idle.fps;
const waiting = [];
STRIP.onload = () => waiting.splice(0).forEach(f => f());
STRIP.src = 'sheets/start_pm_idle.webp';

const ready = () => STRIP.complete && STRIP.naturalWidth > 0;
export const onPmReady = f => (ready() ? f() : waiting.push(f));
const frame = () => [(STRIP.naturalWidth || 456) / FRAMES, STRIP.naturalHeight || 175];

// Dat kich thuoc canvas cho PM cao ~cssH px. He so gan nguyen thi lam tron de giu diem anh sac (pixel),
// he so le thi ve co lam min de khong meo. Tra ve kich thuoc CSS { w, h }.
export function fitPm(cv, cssH) {
  const dpr = devicePixelRatio || 1, [fw, fh] = frame();
  let s = cssH * dpr / fh;
  if (s >= 1 && Math.abs(s - Math.round(s)) < 0.2) s = Math.round(s);
  cv._smooth = s % 1 !== 0;
  cv.width = Math.round(fw * s); cv.height = Math.round(fh * s);
  const w = fw * s / dpr, h = fh * s / dpr;
  Object.assign(cv.style, { width: `${w}px`, height: `${h}px` });
  return { w, h };
}

// Ve khung idle tai thoi diem now (t0 = luc bat dau phat)
export function drawPm(cv, now, t0) {
  if (!ready()) return;
  const [fw, fh] = frame(), ctx = cv.getContext('2d');
  const i = Math.floor(Math.max(0, now - t0) * FPS / 1000) % FRAMES;   // rAF co the som hon t0
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.imageSmoothingEnabled = !!cv._smooth; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(STRIP, i * fw, 0, fw, fh, 0, 0, cv.width, cv.height);
}
