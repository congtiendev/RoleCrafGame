// Thanh tren trang xem nhan vat: tab, tim kiem, loc sheet, toc do, nen, tam dung
import { DATA, SHEET_LABEL } from '../../lib/sprites.ts';
import { CAST } from './cast.ts';
import { sheetIds } from './catalog.ts';
import { state } from '../../lib/state.ts';
import { $ } from '../../lib/ui.ts';
import { icon } from '../../lib/icons.ts';

const TABS = [['anims', 'Hành động'], ['cells', 'Ô tĩnh'], ['sheets', 'Sheet gốc']];
const opts = (list: string[][], cur: string) => list.map(([v, t]) => `<option value="${v}"${v === cur ? ' selected' : ''}>${t}</option>`).join('');

const template = () => `
  <div class="flex flex-wrap items-center gap-2">
    <h1 class="mr-1 text-[17px] font-bold">Sprite Preview</h1>
    <label class="ctl mr-2" ${CAST.length < 2 ? 'hidden' : ''}>Nhân vật <select id="char" class="field px-1.5 py-1 font-semibold text-ink">${opts(CAST.map(c => [c.id, c.label]), 'PM')}</select></label>
    <div class="flex flex-wrap gap-1.5" id="tabs">
      ${TABS.map(([id, t]) => `<button class="btn" data-tab="${id}" aria-pressed="false">${t}</button>`).join('')}
    </div>
    <a class="btn ml-auto inline-flex items-center gap-1.5 no-underline" href="./scenario-test.html">Test kịch bản${icon('arrowRight', 'size-4')}</a>
    <a class="btn inline-flex items-center gap-1.5 no-underline border-brand-red bg-brand-red font-bold text-white hover:bg-[#bd2a33]" href="../index.html">Vào game${icon('play', 'size-4')}</a>
  </div>
  <div class="mt-2.5 flex flex-wrap items-center gap-2" id="filterRow">
    <input type="search" id="q" class="field min-w-0 flex-[1_1_180px] px-2.5 py-1.5" placeholder="Tìm tên: walk, meet, tired…">
    <div id="sheetChips"></div>
  </div>
  <div class="mt-2.5 flex flex-wrap items-center gap-2">
    <label class="ctl">Tốc độ <select id="speed" class="field px-1.5 py-1">${opts([['0.25', '0.25'], ['0.5', '0.5'], ['1', '1'], ['1.5', '1.5'], ['2', '2']], '1')}</select>×</label>
    <label class="ctl" id="sizeCtl">Cỡ ô <select id="size" class="field px-1.5 py-1">${opts([['140', 'nhỏ'], ['190', 'vừa'], ['260', 'lớn']], '190')}</select></label>
    <label class="ctl">Nền <select id="bg" class="field px-1.5 py-1">${opts([['checker', 'ô caro'], ['light', 'sáng'], ['dark', 'tối'], ['office', 'văn phòng']], 'checker')}</select></label>
    <label class="ctl"><input type="checkbox" id="border"> viền ô</label>
    <button class="btn inline-flex items-center gap-1.5" id="pause" aria-pressed="false">${icon('pause', 'size-4')}Tạm dừng</button>
    <span class="ml-auto text-[13px] text-mute max-[600px]:ml-0 max-[600px]:w-full" id="count"></span>
  </div>`;

let root: HTMLElement;
// o nhap / chon / hop kiem gay ra su kien
const input = (e: Event) => e.target as HTMLInputElement;
const btnIn = (e: Event) => (e.target as HTMLElement).closest('button');

// on.render(): dung lai noi dung tab; on.redraw(): ve lai canvas (doi vien o); on.character(id): doi nhan vat
export function mountHeader(el: HTMLElement, on: { render: () => void; redraw: () => void; character: (id: string) => void }) {
  root = el;
  el.className = 'sticky top-0 z-5 border-b border-line bg-page px-4 py-3';
  el.innerHTML = template();

  $('tabs').onclick = e => {
    const b = btnIn(e); if (!b) return;
    state.tab = b.dataset.tab!; state.sheet = 'all'; history.replaceState(null, '', '#' + state.tab);
    on.render();
  };
  $('char').onchange = e => on.character(input(e).value);
  $('sheetChips').onclick = e => { const b = btnIn(e); if (!b) return; state.sheet = b.dataset.s!; on.render(); };
  let qt: ReturnType<typeof setTimeout> | undefined;
  $('q').oninput = e => { clearTimeout(qt); qt = setTimeout(() => { state.q = input(e).value; on.render(); }, 120); };
  $('speed').onchange = e => { state.speed = +input(e).value; };
  $('size').onchange = e => document.body.style.setProperty('--card', input(e).value + 'px');
  $('bg').onchange = e => { document.body.dataset.bg = input(e).value; };
  $('border').onchange = e => { state.border = input(e).checked; on.redraw(); };
  $('pause').onclick = e => {
    const b = e.currentTarget as HTMLElement;
    state.paused = !state.paused; b.setAttribute('aria-pressed', String(state.paused));
    b.innerHTML = state.paused ? `${icon('play', 'size-4')}Phát tiếp` : `${icon('pause', 'size-4')}Tạm dừng`;
  };
  addEventListener('resize', syncOffset);
}

// Chieu cao header -> --hh, de khung phat kich ban dinh ngay duoi
function syncOffset() { document.documentElement.style.setProperty('--hh', root.offsetHeight + 12 + 'px'); }

// Cap nhat header theo state (tab dang chon, bo loc hien/an, nut loc sheet)
export function syncHeader() {
  // Nhan vat khong co o tinh (chi co animation) thi an tab O tinh
  const noCells = !DATA.cells.length;
  if (noCells && state.tab === 'cells') state.tab = 'anims';
  $('tabs').querySelector<HTMLElement>('[data-tab=cells]')!.hidden = noCells;
  $('tabs').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.tab === state.tab)));
  const grid = state.tab === 'anims' || state.tab === 'cells';
  $('sizeCtl').hidden = !grid;
  const chips = $('sheetChips');
  if (!grid) chips.innerHTML = '';
  else {
    const ids = sheetIds(state.tab === 'anims');
    if (state.sheet !== 'all' && !ids.includes(state.sheet)) state.sheet = 'all';
    chips.innerHTML = ['all', ...ids].map(id =>
      `<button class="btn" data-s="${id}" aria-pressed="${state.sheet === id}">${id === 'all' ? 'Tất cả' : id + ' · ' + SHEET_LABEL[id]}</button>`).join(' ');
  }
  syncOffset();
}

export function setCount(text: string) { $('count').textContent = text; }
