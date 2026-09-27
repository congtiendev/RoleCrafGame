// Tour huong dan HUD: lam toi man hinh, khoet sang quanh tung chi so va hien bong bong giai thich canh no.
// Chay lan dau vao man tinh huong (director luu co session.hudTourDone); nut "?" tren HUD mo lai.
// Phim o pha capture: Enter/Space/phai = tiep, trai = lui, Esc = bo qua; khong de phim lot xuong man choi.
import { useLayoutEffect, useRef, useState } from 'react';
import { METRICS, METRIC_GROUPS } from '../rules.js';
import { Icon } from '../components/Icon.jsx';
import { useKey, useMedia, useViewport } from '../components/hooks.js';
import { HUD_COL_Q } from './Hud.jsx';

const GROUP = Object.fromEntries(METRIC_GROUPS.map(g => [g.id, g.label]));
const STEPS = METRIC_GROUPS.flatMap(g => METRICS.filter(m => m.group === g.id)).map((m, n) => ({
  key: m.key, title: m.label, text: m.hint, group: GROUP[m.group],
  lead: n ? '' : 'Mỗi quyết định sẽ làm các chỉ số này tăng hoặc giảm. Cùng xem nhanh từng chỉ số:',
}));

// root: phan tu chua HUD (tim o chi so [data-stat]); onDone: xong / bo qua
export function HudTour({ root, onDone }) {
  const [i, setI] = useState(0), col = useMedia(HUD_COL_Q), vp = useViewport();
  const hole = useRef(null), tip = useRef(null), arrow = useRef(null), next = useRef(null);
  const st = STEPS[i], last = i === STEPS.length - 1;
  const go = () => (last ? onDone() : setI(i + 1));
  // mobile: cot chi so hai ben -> bong bong phia trong man hinh; PC: duoi o chi so
  const sideOf = key => (col ? (METRICS.find(m => m.key === key).group === 'project' ? 'right' : 'left') : 'below');

  // Dat lo sang quanh muc tieu, bong bong ben canh
  useLayoutEffect(() => {
    const target = root?.querySelector(`[data-stat="${st.key}"]`);
    if (!target) return;
    const r = target.getBoundingClientRect(), pad = 6, W = innerWidth, H = innerHeight;
    Object.assign(hole.current.style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + 2 * pad}px`, height: `${r.height + 2 * pad}px` });
    const t = tip.current, tw = t.offsetWidth, th = t.offsetHeight, gap = 20, a = arrow.current;
    // Mui ten .tip-arrow (tam giac 28x15 huong len, xoay theo data-dir): dinh vi theo vung padding nen tru do day vien;
    // day tam giac lan 4px vao mep khung de liem vao vien -> lien khoi voi the
    const cs = getComputedStyle(t), bt = parseFloat(cs.borderTopWidth), bl = parseFloat(cs.borderLeftWidth);
    const AW = 28, AH = 15, IN = 4;
    let side = sideOf(st.key);
    if (side === 'right' && r.right + gap + tw > W - 8) side = 'below';
    if (side === 'left' && r.left - gap - tw < 8) side = 'below';
    let x, y;
    if (side === 'below') {
      x = Math.max(12, Math.min(W - tw - 12, r.left + r.width / 2 - tw / 2)); y = Math.min(H - th - 12, r.bottom + gap);
      const cx = Math.max(32, Math.min(tw - 32, r.left + r.width / 2 - x));
      a.dataset.dir = 'up';
      Object.assign(a.style, { left: `${cx - bl - AW / 2}px`, top: `${-bt - AH + IN}px` });
    } else {
      x = side === 'right' ? r.right + gap : r.left - gap - tw;
      y = Math.max(12, Math.min(H - th - 12, r.top + r.height / 2 - th / 2));
      const cy = Math.max(32, Math.min(th - 32, r.top + r.height / 2 - y));
      const vx = side === 'right' ? -AH + IN + AH / 2 : tw + AH - IN - AH / 2;   // xoay 90 do: hop hien thi AH x AW
      a.dataset.dir = side === 'right' ? 'left' : 'right';
      Object.assign(a.style, { left: `${vx - bl - AW / 2}px`, top: `${cy - bt - AH / 2}px` });
    }
    Object.assign(t.style, { left: `${x}px`, top: `${y}px` });
    next.current?.focus({ preventScroll: true });
  }, [i, vp, col, root]);                                          // eslint-disable-line react-hooks/exhaustive-deps

  useKey(e => {
    if (['Enter', ' ', 'ArrowRight'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); go(); }
    else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); e.stopPropagation(); setI(i - 1); }
    else if (e.key === 'Escape') { e.stopPropagation(); onDone(); }
  }, true);

  return (
    // cham ngoai bong bong khong lam troi thoai phia sau
    <div className="absolute inset-0 z-[35]" onClick={e => e.stopPropagation()}>
      <div ref={hole} className="pointer-events-none absolute rounded-xl shadow-[0_0_0_9999px_rgb(4_7_20/.72),0_0_20px_4px_rgb(94_200_255/.6)] outline-[3px] outline-offset-2 outline-[#5ec8ff] transition-all duration-300" />
      <div ref={tip} data-tip="" role="dialog" aria-live="polite" className="px-panel absolute w-[min(340px,calc(100vw-24px))] px-5 py-4 transition-[left,top] duration-300">
        <span ref={arrow} className="tip-arrow" />
        <p className="text-xs font-bold tracking-widest text-px-panel/55 uppercase">{['Hướng dẫn', st.group, `${i + 1}/${STEPS.length}`].filter(Boolean).join(' · ')}</p>
        {st.lead && <p className="mt-2 text-sm leading-snug font-semibold text-px-panel/80">{st.lead}</p>}
        <h2 className="mt-1 text-lg leading-snug font-extrabold text-brand-red">{st.title}</h2>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-px-panel/90">{st.text}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button className={`cursor-pointer text-sm font-bold text-px-panel/60 underline-offset-4 hover:text-px-panel hover:underline ${last ? 'invisible' : ''}`} onClick={onDone}>Bỏ qua</button>
          <button ref={next} data-next="" className="px-btn px-btn-primary w-auto px-5 py-2 text-base" onClick={go}>
            {last ? 'Bắt đầu' : <>Tiếp<Icon name="arrowRight" className="size-5" stroke={2.5} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
