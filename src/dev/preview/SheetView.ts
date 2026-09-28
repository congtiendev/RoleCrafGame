// Tab Sheet goc: anh sheet + khung o, re chuot de xem ten o
import { DATA, SHEET_LABEL, NAME_AT } from '../../lib/sprites.ts';
import { state } from '../../lib/state.ts';
import { drawSheet, cellAt } from './sheetCanvas.ts';
import { $, KBD } from '../../lib/ui.ts';

export function mountTip(el: HTMLElement) {
  el.className = 'pointer-events-none fixed z-10 hidden rounded-md bg-ink px-2 py-1 font-mono text-xs text-page';
}

export function renderSheets(main: HTMLElement) {
  const tip = $('tip');
  const wrap = document.createElement('div'); wrap.className = 'grid gap-6';
  DATA.sheets.forEach(s => {
    const box = document.createElement('section');
    box.innerHTML = `<h2 class="mb-2 text-[15px] font-bold">${s.id} · ${SHEET_LABEL[s.id]} <span class="${KBD} font-normal">${s.file} · lưới ${s.cols}×${s.rows} · khung đỏ/xanh = ô dò theo khe trong suốt</span></h2>`;
    const w = document.createElement('div'); w.className = 'max-w-[900px]';
    const cv = document.createElement('canvas'); cv.className = 'stage h-auto w-full rounded-[10px]';
    w.append(cv); box.append(w); wrap.append(box);
    if (!drawSheet(cv, s.id, state.q)) return;
    cv.onmousemove = e => {
      const b = cv.getBoundingClientRect();
      const hit = cellAt(s.id, (e.clientX - b.left) * cv.width / b.width, (e.clientY - b.top) * cv.height / b.height);
      if (!hit) { tip.classList.add('hidden'); return; }
      const [r, c] = hit;
      tip.textContent = `${s.id} r${r} c${c} · ${NAME_AT[[s.id, r, c].join()] || '(trống)'}`;
      tip.classList.remove('hidden'); tip.style.left = e.clientX + 12 + 'px'; tip.style.top = e.clientY + 12 + 'px';
    };
    cv.onmouseleave = () => tip.classList.add('hidden');
  });
  main.replaceChildren(wrap);
}
