// Tour huong dan HUD: lam toi man hinh, khoet sang quanh tung chi so va hien bong bong giai thich canh no.
// Chay lan dau vao man tinh huong (LevelScreen luu co session.hudTourDone); nut "?" tren HUD mo lai.
import { esc } from '../shared/ui.js';
import { icon } from '../shared/icons.js';

// steps: [{ target: Element, title, text, group?, lead?, side?: 'right' | 'left' | 'below' }] -> Promise khi xong / bo qua
export function hudTour(root, steps) {
  const wrap = document.createElement('div');
  wrap.className = 'absolute inset-0 z-[35]';
  wrap.innerHTML = `
    <div data-hole class="pointer-events-none absolute rounded-xl shadow-[0_0_0_9999px_rgb(4_7_20/.72),0_0_20px_4px_rgb(94_200_255/.6)] outline-[3px] outline-offset-2 outline-[#5ec8ff] transition-all duration-300"></div>
    <div data-tip role="dialog" aria-live="polite" class="px-panel absolute w-[min(340px,calc(100vw-24px))] px-5 py-4 transition-[left,top] duration-300">
      <span data-arrow class="tip-arrow"></span>
      <p data-step class="text-xs font-bold tracking-widest text-px-panel/55 uppercase"></p>
      <p data-lead class="mt-2 text-sm leading-snug font-semibold text-px-panel/80"></p>
      <h2 data-title class="mt-1 text-lg leading-snug font-extrabold text-brand-red"></h2>
      <p data-text class="mt-1.5 text-[0.95rem] leading-relaxed text-px-panel/90"></p>
      <div class="mt-4 flex items-center justify-between gap-3">
        <button data-skip class="cursor-pointer text-sm font-bold text-px-panel/60 underline-offset-4 hover:text-px-panel hover:underline">Bỏ qua</button>
        <button data-next class="px-btn px-btn-primary w-auto px-5 py-2 text-base"></button>
      </div>
    </div>`;
  root.append(wrap);
  const q = s => wrap.querySelector(`[data-${s}]`);
  let i = 0;

  // Dat lo sang quanh muc tieu, bong bong ben canh (mobile: cot chi so hai ben -> bong bong phia trong man hinh)
  function place() {
    const st = steps[i], r = st.target.getBoundingClientRect(), pad = 6, W = innerWidth, H = innerHeight;
    Object.assign(q('hole').style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + 2 * pad}px`, height: `${r.height + 2 * pad}px` });
    const tip = q('tip'), tw = tip.offsetWidth, th = tip.offsetHeight, gap = 20, arrow = q('arrow');
    // Mui ten .tip-arrow (tam giac 28x15 huong len, xoay theo data-dir): dinh vi theo vung padding nen tru do day vien card;
    // day tam giac lan 4px vao mep khung de liem vao vien -> lien khoi voi the
    const cs = getComputedStyle(tip), bt = parseFloat(cs.borderTopWidth), bl = parseFloat(cs.borderLeftWidth);
    const AW = 28, AH = 15, IN = 4;
    let side = st.side || 'below';
    if (side === 'right' && r.right + gap + tw > W - 8) side = 'below';
    if (side === 'left' && r.left - gap - tw < 8) side = 'below';
    let x, y;
    if (side === 'below') {
      x = Math.max(12, Math.min(W - tw - 12, r.left + r.width / 2 - tw / 2)); y = Math.min(H - th - 12, r.bottom + gap);
      const cx = Math.max(32, Math.min(tw - 32, r.left + r.width / 2 - x));
      arrow.dataset.dir = 'up';
      Object.assign(arrow.style, { left: `${cx - bl - AW / 2}px`, top: `${-bt - AH + IN}px` });
    } else {
      x = side === 'right' ? r.right + gap : r.left - gap - tw;
      y = Math.max(12, Math.min(H - th - 12, r.top + r.height / 2 - th / 2));
      const cy = Math.max(32, Math.min(th - 32, r.top + r.height / 2 - y));
      // xoay 90 do: hop hien thi AH x AW, tam trung tam phan tu
      const vx = side === 'right' ? -AH + IN + AH / 2 : tw + AH - IN - AH / 2;
      arrow.dataset.dir = side === 'right' ? 'left' : 'right';
      Object.assign(arrow.style, { left: `${vx - bl - AW / 2}px`, top: `${cy - bt - AH / 2}px` });
    }
    Object.assign(tip.style, { left: `${x}px`, top: `${y}px` });
  }
  function show() {
    const st = steps[i], last = i === steps.length - 1;
    q('step').textContent = ['Hướng dẫn', st.group, `${i + 1}/${steps.length}`].filter(Boolean).join(' · ');
    q('lead').textContent = st.lead || ''; q('lead').hidden = !st.lead;
    q('title').textContent = st.title;
    q('text').innerHTML = esc(st.text);
    q('next').innerHTML = last ? 'Bắt đầu' : `Tiếp${icon('arrowRight', 'size-5', { stroke: 2.5 })}`;
    q('skip').hidden = last;
    place();
    q('next').focus({ preventScroll: true });
  }

  return new Promise(done => {
    const close = () => { removeEventListener('resize', place); removeEventListener('keydown', onKey, true); wrap.remove(); done(); };
    const next = () => { if (++i >= steps.length) close(); else show(); };
    // bat phim o pha capture: Enter/Space/phai = tiep, Esc = bo qua; khong de phim lot xuong man choi
    const onKey = e => {
      if (['Enter', ' ', 'ArrowRight'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); next(); }
      else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); e.stopPropagation(); i--; show(); }
      else if (e.key === 'Escape') { e.stopPropagation(); close(); }
    };
    wrap.addEventListener('click', e => {
      e.stopPropagation();                                 // cham ngoai bong bong khong lam troi thoai phia sau
      if (e.target.closest('[data-next]')) next();
      else if (e.target.closest('[data-skip]')) close();
    });
    addEventListener('resize', place); addEventListener('keydown', onKey, true);
    show();
  });
}
