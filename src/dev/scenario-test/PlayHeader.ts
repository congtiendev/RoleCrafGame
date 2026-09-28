// Thanh tren trang TEST kich ban (khong phai gameplay): toc do, nen, tam dung, link ve trang xem nhan vat
import { state } from '../../lib/state.ts';
import { setSpeed } from './scriptPlayer.ts';
import { sceneCount } from './flow.ts';
import { $ } from '../../lib/ui.ts';
import { icon } from '../../lib/icons.ts';

const opts = (list: string[][], cur: string) => list.map(([v, t]) => `<option value="${v}"${v === cur ? ' selected' : ''}>${t}</option>`).join('');

export function mountPlayHeader(el: HTMLElement) {
  el.className = 'sticky top-0 z-5 border-b border-line bg-page px-4 py-3';
  el.innerHTML = `
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="mr-3 text-[17px] font-bold">Test kịch bản</h1>
      <span class="rounded-full bg-chip px-2 py-0.5 text-xs text-mute">chỉ để kiểm tra thoại, câu hỏi, nhánh — không phải gameplay</span>
      <label class="ctl">Tốc độ <select id="speed" class="field px-1.5 py-1">${opts([['0.5', '0.5'], ['1', '1'], ['1.5', '1.5'], ['2', '2']], '1')}</select>×</label>
      <label class="ctl">Nền <select id="bg" class="field px-1.5 py-1">${opts([['checker', 'ô caro'], ['light', 'sáng'], ['dark', 'tối'], ['office', 'văn phòng']], 'office')}</select></label>
      <label class="ctl"><input type="checkbox" id="border"> viền ô</label>
      <span class="text-[13px] text-mute">${sceneCount()} cảnh</span>
      <a class="btn ml-auto inline-flex items-center gap-1.5 no-underline" href="./preview.html">${icon('arrowLeft', 'size-4')}Xem nhân vật</a>
      <a class="btn inline-flex items-center gap-1.5 no-underline border-brand-red bg-brand-red font-bold text-white hover:bg-[#bd2a33]" href="../index.html">Vào game${icon('play', 'size-4')}</a>
    </div>`;
  document.body.dataset.bg = 'office';
  const input = (e: Event) => e.target as HTMLInputElement;
  $('speed').onchange = e => setSpeed(+input(e).value);
  $('bg').onchange = e => { document.body.dataset.bg = input(e).value; };
  $('border').onchange = e => { state.border = input(e).checked; };
  const sync = () => document.documentElement.style.setProperty('--hh', el.offsetHeight + 12 + 'px');
  addEventListener('resize', sync); sync();
}
