// Hop chi tiet mot hanh dong / o tinh: xem tung khung, doi fps, bat/tat lap
import { rangeText } from '../shared/sprites.js';
import { state, frameAt } from '../shared/state.js';
import { D, openD, stepIndex, resync } from './detailPlayer.js';
import { drawCell } from '../shared/cell.js';
import { $, esc } from '../shared/ui.js';
import { icon } from '../shared/icons.js';

const STRIP_CELL = 'stage size-[72px] flex-none cursor-pointer rounded-md border-2 border-transparent data-cur:border-accent';

const template = () => `
  <div class="flex flex-wrap items-center gap-2 border-b border-line px-3.5 py-3">
    <span class="font-mono text-[15px] font-semibold break-all" id="dName"></span>
    <span class="flex flex-wrap items-center gap-1.5 text-xs text-mute" id="dSub"></span>
    <button class="btn ml-auto inline-flex items-center" id="dClose" aria-label="Đóng">${icon('xMark', 'size-5')}</button>
  </div>
  <div class="grid gap-3 p-3.5">
    <canvas class="stage aspect-square w-[min(420px,100%)] justify-self-center rounded-[10px]" id="dCanvas" width="420" height="420"></canvas>
    <div class="flex flex-wrap items-center gap-2">
      <button class="btn inline-flex items-center gap-1" id="dPrev">${icon('chevronLeft', 'size-4')}Khung trước</button>
      <button class="btn inline-flex items-center gap-1.5" id="dPlay"></button>
      <button class="btn inline-flex items-center gap-1" id="dNext">Khung sau${icon('chevronRight', 'size-4')}</button>
      <label class="ctl">FPS <input type="range" id="dFps" min="1" max="24" step="1"> <span id="dFpsV"></span></label>
      <label class="ctl"><input type="checkbox" id="dLoop"> lặp</label>
      <span class="inline-flex items-center gap-1 text-xs text-mute">Phím: ${icon('arrowLeft', 'size-3.5')}${icon('arrowRight', 'size-3.5')} Space</span>
    </div>
    <div class="flex gap-1.5 overflow-x-auto pb-1" id="dStrip"></div>
    <div class="text-xs text-mute" id="dCode"></div>
  </div>`;

let dlg, dCtx;

export function mountDetail(el) {
  dlg = el;
  dlg.className = 'm-auto max-h-[calc(100vh-32px)] w-[min(760px,calc(100vw-32px))] rounded-[14px] border border-line bg-panel p-0 text-ink backdrop:bg-black/45';
  dlg.innerHTML = template();
  dCtx = $('dCanvas').getContext('2d');

  $('dPrev').onclick = () => step(-1);
  $('dNext').onclick = () => step(1);
  $('dPlay').onclick = () => { D.playing = !D.playing; syncPlayBtn(); if (D.playing) resync(); };
  $('dFps').oninput = e => { D.fps = +e.target.value; $('dFpsV').textContent = D.fps; resync(); };
  $('dLoop').onchange = e => { D.loop = e.target.checked; D.t0 = performance.now(); };
  $('dClose').onclick = () => dlg.close();
  dlg.addEventListener('close', () => D.open = false);
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === ' ') { e.preventDefault(); $('dPlay').click(); }
  });
}

const syncPlayBtn = () => $('dPlay').innerHTML = D.playing ? `${icon('pause', 'size-4')}Tạm dừng` : `${icon('play', 'size-4')}Phát`;
function step(d) { const i = stepIndex(d); syncPlayBtn(); setFrame(i); }

function setFrame(i) {
  D.i = i; drawCell(dCtx, D.frames[i], state.border, D.k);
  [...$('dStrip').children].forEach((c, k) => c.toggleAttribute('data-cur', k === i));
}

const codeHtml = (it, frames, isAnim) => isAnim
  ? `Manifest: <code class="code">${'ABCDEF'.includes(frames[0][0]) ? 'pm' : frames[0][0].toLowerCase()}/${esc(it.name)}</code> — ${frames.length} khung: ${frames.map(f => `<code class="code">${f[0]} r${f[1]} c${f[2]}</code>`).join(' ')}`
  : `Manifest: <code class="code">${esc(it.key)}</code>`;

export function openDetail(it, frames, isAnim) {
  openD(it, frames, isAnim);
  $('dName').textContent = it.name;
  $('dSub').textContent = rangeText(frames) + (isAnim ? ` · mặc định ${it.fps} fps ${it.loop ? 'loop' : 'once'}` : '');
  $('dFps').value = D.fps; $('dFpsV').textContent = D.fps; $('dLoop').checked = D.loop;
  syncPlayBtn();
  const strip = $('dStrip'); strip.innerHTML = '';
  frames.forEach((f, i) => {
    const c = document.createElement('canvas'); c.className = STRIP_CELL; c.width = c.height = 144;
    drawCell(c.getContext('2d'), f, false, D.k); c.title = `${f[0]} r${f[1]} c${f[2]}`;
    c.onclick = () => { D.playing = false; syncPlayBtn(); setFrame(i); };
    strip.append(c);
  });
  $('dCode').innerHTML = codeHtml(it, frames, isAnim);
  setFrame(0);
  dlg.showModal();
}

export function updateDetail(now) {
  if (D.open && D.playing) { const i = frameAt(D, now); if (i !== D.i) setFrame(i); }
}
