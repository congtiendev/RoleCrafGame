// Luoi the hanh dong / o tinh — chi the dang trong man hinh moi chay animation
import { rangeText } from '../shared/sprites.js';
import { itemFrames } from './catalog.js';
import { state, frameAt } from '../shared/state.js';
import { drawCell } from '../shared/cell.js';
import { esc, TAG } from '../shared/ui.js';

const CARD = 'cursor-pointer overflow-hidden rounded-xl border border-line bg-panel transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-none';

const live = new Set();
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) live.add(e.target._p); else live.delete(e.target._p);
}), { rootMargin: '200px' });
let cards = [];

const metaHtml = (it, frames, isAnim) =>
  `<div class="font-mono text-[13px] font-semibold break-all">${esc(it.name)}</div>` +
  `<div class="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-mute">${rangeText(frames)}` +
  (isAnim ? ` · ${it.fps} fps <span class="${TAG} ${it.loop ? 'text-loop' : 'text-once'}">${it.loop ? 'loop' : 'once'}</span> <span class="${TAG}">${frames.length} khung</span>` : '') +
  '</div>';

// onOpen(it, frames, isAnim): bam vao the
export function renderGrid(main, list, isAnim, onOpen) {
  if (!list.length) { main.innerHTML = '<div class="py-10 text-center text-mute">Không có kết quả.</div>'; return; }
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-[repeat(auto-fill,minmax(var(--card,190px),1fr))] gap-3';
  cards = list.map(it => {
    const frames = itemFrames(it, isAnim);
    const card = document.createElement('div'); card.className = CARD; card.tabIndex = 0;
    const cv = document.createElement('canvas'); cv.className = 'stage aspect-square w-full'; cv.width = cv.height = 256;
    const meta = document.createElement('div'); meta.className = 'px-2.5 pt-2 pb-2.5'; meta.innerHTML = metaHtml(it, frames, isAnim);
    card.append(cv, meta); grid.append(card);
    const p = { frames, ctx: cv.getContext('2d'), t0: performance.now(), last: -1, fps: isAnim ? it.fps : 1, loop: isAnim ? it.loop : true, k: isAnim ? it.k : 1 };
    card._p = p; io.observe(card);
    const open = () => onOpen(it, frames, isAnim);
    card.onclick = open; card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
    drawCell(p.ctx, frames[0], state.border, p.k);
    return p;
  });
  main.replaceChildren(grid);
}

export function resetGrid() { io.disconnect(); live.clear(); cards = []; }

export function updateGrid(now) {
  for (const p of live) {
    const i = frameAt(p, now);
    if (i !== p.last) { p.last = i; drawCell(p.ctx, p.frames[i], state.border, p.k); }
  }
}

export function redrawGrid() {
  cards.forEach(p => p.last = -1);
  updateGrid(performance.now());
}
