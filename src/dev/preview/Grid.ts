// Luoi the hanh dong / o tinh — chi the dang trong man hinh moi chay animation
import { rangeText } from '../../lib/sprites.ts';
import { itemFrames } from './catalog.ts';
import { state, frameAt } from '../../lib/state.ts';
import { drawCell } from '../../lib/cell.ts';
import { esc, TAG } from '../../lib/ui.ts';
import type { Frame } from '../../lib/spriteTypes.ts';
import type { Playback } from '../../lib/state.ts';
import type { Item } from './catalog.ts';

const CARD = 'cursor-pointer overflow-hidden rounded-xl border border-line bg-panel transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-none';

// Mot the dang chay: khung, canvas, khung vua ve
interface Card extends Playback { frames: Frame[]; ctx: CanvasRenderingContext2D; last: number; k: number | undefined }
const of = new WeakMap<Element, Card>();
const live = new Set<Card>();
const io = new IntersectionObserver(es => es.forEach(e => {
  const p = of.get(e.target); if (!p) return;
  if (e.isIntersecting) live.add(p); else live.delete(p);
}), { rootMargin: '200px' });
let cards: Card[] = [];

const metaHtml = (it: Item, frames: Frame[]) =>
  `<div class="font-mono text-[13px] font-semibold break-all">${esc(it.name)}</div>` +
  `<div class="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-mute">${rangeText(frames)}` +
  ('fps' in it ? ` · ${it.fps} fps <span class="${TAG} ${it.loop ? 'text-loop' : 'text-once'}">${it.loop ? 'loop' : 'once'}</span> <span class="${TAG}">${frames.length} khung</span>` : '') +
  '</div>';

// onOpen(it, frames, isAnim): bam vao the
export function renderGrid(main: HTMLElement, list: Item[], onOpen: (it: Item, frames: Frame[]) => void) {
  if (!list.length) { main.innerHTML = '<div class="py-10 text-center text-mute">Không có kết quả.</div>'; return; }
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-[repeat(auto-fill,minmax(var(--card,190px),1fr))] gap-3';
  cards = list.map(it => {
    const frames = itemFrames(it), anim = 'fps' in it ? it : null;
    const card = document.createElement('div'); card.className = CARD; card.tabIndex = 0;
    const cv = document.createElement('canvas'); cv.className = 'stage aspect-square w-full'; cv.width = cv.height = 256;
    const meta = document.createElement('div'); meta.className = 'px-2.5 pt-2 pb-2.5'; meta.innerHTML = metaHtml(it, frames);
    card.append(cv, meta); grid.append(card);
    const p: Card = { frames, ctx: cv.getContext('2d')!, t0: performance.now(), last: -1, fps: anim ? anim.fps : 1, loop: anim ? anim.loop : true, k: anim ? anim.k : 1 };
    of.set(card, p); io.observe(card);
    const open = () => onOpen(it, frames);
    card.onclick = open; card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
    drawCell(p.ctx, frames[0], state.border, p.k);
    return p;
  });
  main.replaceChildren(grid);
}

export function resetGrid() { io.disconnect(); live.clear(); cards = []; }

export function updateGrid(now: number) {
  for (const p of live) {
    const i = frameAt(p, now);
    if (i !== p.last) { p.last = i; drawCell(p.ctx, p.frames[i], state.border, p.k); }
  }
}

export function redrawGrid() {
  cards.forEach(p => { p.last = -1; });
  updateGrid(performance.now());
}
