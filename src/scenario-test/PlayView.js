// Trang TEST kich ban (khong phai gameplay): danh sach tinh huong ben trai, san khau + khung cau hoi ben phai
import { DATA, ANIM, rangeText } from '../shared/sprites.js';
import { state } from '../shared/state.js';
import { P, sitAt, colAt, startSit, startCol, choose, replay, branchLetter, togglePlay, seekBeat, frameState } from './scriptPlayer.js';
import { nextSit } from './flow.js';
import { drawCell } from '../shared/cell.js';
import { drawStage } from './stage.js';
import { $, esc, KBD, PANEL } from '../shared/ui.js';
import { icon } from '../shared/icons.js';

const SIT_BTN = 'cursor-pointer rounded-[7px] border border-line bg-page px-[9px] py-[3px] text-xs text-ink aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-ink';
const BEAT = 'cursor-pointer rounded-md border border-transparent bg-chip px-[7px] py-[3px] font-mono text-xs text-ink data-cur:border-accent data-cur:bg-accent data-cur:text-accent-ink';
const CHOICE = 'flex w-full cursor-pointer items-start gap-2.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-left text-[14px] text-white transition-colors hover:border-accent hover:bg-accent/25';

let lastBi = -1, lastPhase = '';

const levelHtml = (L, li) =>
  `<section class="mb-[22px]">
    <h3 class="mb-1 text-[15px] font-bold">${esc(L.title)}</h3>
    ${L.sits.map((s, si) => `
      <div class="mb-1.5 flex flex-wrap items-center gap-2 rounded-[10px] border border-line bg-panel px-2.5 py-2">
        <span class="flex-[1_1_160px] font-semibold">${esc(s.name)}</span>
        <span class="flex flex-wrap gap-1">${s.cols.map((c, ci) => {
          const letter = c.label.startsWith('Nhánh ') ? c.label.slice(6) : '';
          const tip = letter && s.ask ? s.ask[letter] : c.label;
          return `<button class="${SIT_BTN}" data-l="${li}" data-s="${si}" data-c="${ci}" title="${esc(tip)}">${esc(letter || c.label)}</button>`;
        }).join('')}</span>
      </div>`).join('')}
  </section>`;

const playerHtml = () => `
  <h2 class="text-[15px] font-bold" id="pTitle"></h2>
  <div class="relative">
    <canvas class="stage aspect-[4/5] w-full rounded-[10px]" id="pCanvas" width="960" height="1200"></canvas>
    <div id="pOverlay" class="absolute inset-x-2 bottom-2 hidden rounded-xl bg-[#12141c] p-4 text-white shadow-lg"></div>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <button class="btn inline-flex items-center gap-1.5" id="pPlay"></button>
    <button class="btn inline-flex items-center gap-1.5" id="pReplay">${icon('arrowPath', 'size-4')}Phát lại</button>
  </div>
  <div class="flex flex-wrap items-center gap-1" id="pBeats"></div>
  <div class="flex flex-wrap gap-1.5" id="pScene"></div>
  <div class="border-l-3 border-line pl-2 text-xs text-mute" id="pText"></div>`;

export function mountPlay(main) {
  const wrap = document.createElement('div');
  wrap.className = 'grid grid-cols-[minmax(0,1fr)_minmax(0,440px)] items-start gap-5 max-[860px]:grid-cols-1';
  const list = document.createElement('div');
  list.innerHTML = DATA.script.map(levelHtml).join('');
  list.onclick = e => {
    const b = e.target.closest('button[data-l]'); if (!b) return;
    const l = +b.dataset.l, s = +b.dataset.s, c = +b.dataset.c;
    if (c === 0) startSit(l, s); else startCol(l, s, c);
    showScene();
    if (matchMedia('(max-width:860px)').matches) window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const pl = document.createElement('section');
  pl.className = `sticky top-[var(--hh,80px)] grid gap-2.5 p-3.5 max-[860px]:static max-[860px]:order-first ${PANEL}`;
  pl.innerHTML = playerHtml();
  wrap.append(list, pl);
  main.replaceChildren(wrap);

  $('pPlay').onclick = () => { togglePlay(); syncPlayBtn(); };
  $('pReplay').onclick = () => { replay(); showScene(); };
  $('pBeats').onclick = e => { const b = e.target.closest('[data-i]'); if (b) seekBeat(+b.dataset.i); };
  $('pOverlay').onclick = e => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'replay') replay();
    else if (act === 'next') { const n = nextSit(P.lvl, P.sit, branchLetter()); if (n) startSit(n.lvl, n.sit); }
    else choose(act);
    showScene();
  };
  startSit(0, 0);
  showScene();
}

function syncPlayBtn() {
  $('pPlay').innerHTML = P.playing ? `${icon('pause', 'size-4')}Tạm dừng` : `${icon('play', 'size-4')}Phát`;
}

function beatsHtml() {
  let html = '';
  P.seq.forEach((b, i) => {
    if (i) html += `<span class="text-xs text-mute">${b.alt ? 'hoặc' : icon('arrowRight', 'size-3.5')}</span>`;
    const a = ANIM[b.anim];
    html += `<span class="${BEAT}" data-i="${i}" title="${rangeText(a.frames)} · ${a.fps} fps ${a.loop ? 'loop' : 'once'}">${esc(b.anim)}${b.face ? icon('chatBubbleLeft', 'inline size-3.5 ml-1 -mt-0.5') : ''}${b.emo ? icon('sparkles', 'inline size-3.5 ml-1 -mt-0.5') : ''}</span>`;
  });
  return html || `<span class="${KBD}">Cảnh này chỉ đặt đồ vật, không có hành động nhân vật.</span>`;
}

// Hien canh vua nap vao trinh phat
function showScene() {
  lastBi = -1; lastPhase = '';
  const sit = sitAt(), col = colAt();
  document.querySelectorAll('button[data-l]').forEach(b =>
    b.setAttribute('aria-pressed', +b.dataset.l === P.lvl && +b.dataset.s === P.sit && +b.dataset.c === P.col));
  const letter = branchLetter();
  $('pTitle').textContent = `${sit.name} · ${letter && sit.ask ? `${letter}. ${sit.ask[letter]}` : col.label}`;
  $('pBeats').innerHTML = beatsHtml();
  $('pText').innerHTML = `<b>${esc(col.label)}:</b> ${esc(col.text)}`;
  redrawPlay();
  syncPlayBtn();
}

// Khung tren san khau: cau hoi + 3 lua chon, hoac nut sau khi het canh
function renderOverlay() {
  const el = $('pOverlay'), sit = sitAt();
  if (P.phase === 'play') { el.classList.add('hidden'); return; }
  if (P.phase === 'ask') {
    el.innerHTML = `<p class="mb-3 text-[15px] font-bold">${esc(sit.ask.hoi)}</p><div class="grid gap-2">` +
      ['A', 'B', 'C'].filter(x => sit.ask[x]).map(x =>
        `<button class="${CHOICE}" data-act="${x}"><b class="text-accent">${x}</b><span>${esc(sit.ask[x])}</span></button>`).join('') + '</div>';
  } else {
    const next = nextSit(P.lvl, P.sit, branchLetter());
    el.innerHTML = `<div class="flex flex-wrap items-center justify-end gap-2">
      <button class="btn inline-flex items-center gap-1.5" data-act="replay">${icon('arrowPath', 'size-4')}Phát lại</button>
      ${next ? `<button class="btn inline-flex items-center gap-1.5" data-act="next" aria-pressed="true">Tiếp: ${esc(DATA.script[next.lvl].sits[next.sit].name)}${icon('arrowRight', 'size-4')}</button>`
             : `<span class="text-sm text-white/70">Hết kịch bản — chọn kết thúc ở danh sách.</span>`}
    </div>`;
  }
  el.classList.remove('hidden');
}

// Hang do vat cua canh (ve lai khi anh nap xong)
export function redrawPlay() {
  const el = $('pScene'); if (!el) return;
  el.innerHTML = '';
  P.scene.forEach(x => {
    const f = document.createElement('figure'); f.className = 'w-[78px] text-center';
    const c = document.createElement('canvas'); c.className = 'stage size-[78px] rounded-lg'; c.width = c.height = 156;
    f.append(c); f.insertAdjacentHTML('beforeend', `<figcaption class="font-mono text-[11px] break-all text-mute">${esc(x[3])}<br>${x[0]} r${x[1]} c${x[2]}</figcaption>`);
    el.append(f); drawCell(c.getContext('2d'), x, false);
  });
}

export function updatePlay(now) {
  const cv = $('pCanvas'); if (!cv) return;
  const fs = frameState(now);
  if (fs && fs.bi !== lastBi) {
    lastBi = fs.bi;
    document.querySelectorAll('#pBeats [data-i]').forEach(el => el.toggleAttribute('data-cur', +el.dataset.i === fs.bi));
  }
  if (P.phase !== lastPhase) { lastPhase = P.phase; renderOverlay(); }
  drawStage(cv, fs, P.scene, state.border);
}
