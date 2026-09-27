// Bang ket qua lua chon: chu cai lua chon + tieu de, chip dem chi so tot/xau, canh bao tri hoan, the tung chi so
// (thanh: nen = gia tri giu nguyen, doan soc = phan tang/giam, chay dan toi gia tri moi). Rui ro: tang la xau.
// o = ket qua re nhanh cua lua chon (vd S07 C -> C1 thuong luong thanh cong): tieu de phu + mo ta theo ket qua do.
// Bang KHONG che nhan vat: ngang = the doc bam phai (PM dung ben trai, director.frame() dat left), doc = ngay duoi HUD.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { METRIC, isGood, fmtNum, fmtDelta } from '../rules.js';
import { Icon } from '../components/Icon.jsx';
import { SheetIcon } from '../components/canvases.jsx';
import { useMedia, useViewport } from '../components/hooks.js';

// cung dieu kien voi variant rs-sm (components.css): bang ket qua ban gon (them #result[data-fit])
const RS_SM_Q = '((orientation: portrait) and (width < 40rem)), (height <= 560px)';

export function Result({ data, onNext, boxRef }) {
  const { s, c, changes, o } = data;
  const vp = useViewport(), smMedia = useMedia(RS_SM_Q);
  const box = useRef(null), panel = useRef(null), next = useRef(null);
  const [small, setSmall] = useState(smMedia), [grown, setGrown] = useState(false);
  const good = changes.filter(isGood).length, bad = changes.length - good;

  // Bang khong bao gio cuon: tran cho trong thi gon dan tung muc – 1 = ban gon rs-sm (chi so 2 cot), 2 = chu mo ta nho,
  // 3 = an mo ta, 4 = an chip dem; van tran (dien thoai xoay ngang ~360px) thi zoom ca bang cho vua. Luc vua mo: do khi
  // tat animation (translateY lam sai do); luc resize animation da xong, khong tat.
  const opening = useRef(true);
  useLayoutEffect(() => {
    const r = box.current, p = panel.current;
    r.toggleAttribute('data-measure', opening.current); opening.current = false;
    r.removeAttribute('data-fit'); p.style.zoom = '';
    for (const lv of ['1', '2', '3', '4']) {
      if (r.scrollHeight <= r.clientHeight + 1) break;
      r.dataset.fit = lv;
    }
    const cs = getComputedStyle(r), pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    if (r.scrollHeight > r.clientHeight + 1) p.style.zoom = Math.max(0.7, (r.clientHeight - pad) / (r.scrollHeight - pad)).toFixed(3);
    r.removeAttribute('data-measure');
    setSmall(smMedia || r.hasAttribute('data-fit'));
  }, [vp, smMedia]);
  useEffect(() => {
    next.current?.focus({ preventScroll: true });
    const t = setTimeout(() => setGrown(true), 420);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={el => { box.current = el; boxRef(el); }} id="result" className="absolute z-20 flex overflow-y-auto p-4 pb-safe-4 px-safe-4 max-sm:p-2.5 max-sm:pb-safe-2.5 max-sm:px-safe-2.5 [@media(max-height:560px)]:p-2 [@media(max-height:560px)]:pb-safe-2 [@media(max-height:560px)]:px-safe-2
         landscape:top-(--hudb) landscape:right-0 landscape:bottom-0 landscape:w-[min(580px,54vw)] [@media(max-height:560px)]:landscape:w-[min(640px,64vw)] landscape:transition-[left] landscape:duration-500
         portrait:inset-x-0 portrait:top-(--hudb) portrait:max-h-[58%] portrait:justify-center">
      <div ref={panel} className="px-panel grid w-[min(1000px,100%)] animate-rise landscape:my-auto landscape:w-full landscape:!grid-cols-1 portrait:!grid-cols-1 grid-cols-[1fr_minmax(290px,340px)] gap-x-7 gap-y-4 px-7 py-6 max-md:grid-cols-1 rs-sm:gap-y-2.5 rs-sm:px-4 rs-sm:py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-3.5 rs-sm:gap-2.5">
            <span className="gm-tag gm-red grid size-12 shrink-0 place-items-center pb-0.5 text-[1.6rem] leading-none font-extrabold rs-sm:size-9 rs-sm:text-[1.2rem]">{o?.id || c.id}</span>
            <div className="min-w-0">
              <p className="text-xs leading-none font-bold tracking-[0.18em] text-brand-red uppercase">Kết quả · {s.no}{o ? ` · ${o.label}` : ''}</p>
              <h2 className="mt-1 text-[1.3rem] leading-snug font-extrabold text-px-panel rs-sm:mt-0.5 rs-sm:text-base rs-sm:leading-tight">{c.label}</h2>
            </div>
          </div>
          <div id="rsTally" className="mt-3 flex flex-wrap gap-2 rs-sm:mt-2 rs-sm:gap-1.5">
            {good > 0 && <Chip n={good} ic="arrowTrendingUp" text="cải thiện" cls="gm-green" />}
            {bad > 0 && <Chip n={bad} ic="arrowTrendingDown" text="xấu đi" cls="gm-red" />}
            {!changes.length && <span className="text-sm font-semibold text-px-panel/60">Không có chỉ số nào thay đổi.</span>}
          </div>
          <p id="rsText" className="mt-3 leading-relaxed portrait:hidden [@media(max-height:560px)]:hidden text-px-panel/85 max-sm:text-[0.95rem] [@media(max-height:560px)]:mt-2 [@media(max-height:560px)]:text-sm">{o?.result || c.result}</p>
          {(c.delayed?.length > 0 || o?.delayed?.length > 0) && (
            <p className="gm-yellow mt-3.5 flex items-center gap-3 rounded-lg border-2 border-(--ink) bg-[#fff1c7] px-3 py-2 text-sm leading-snug font-semibold text-[#4a2703] shadow-[inset_0_-3px_0_#f5cf6a] rs-sm:mt-2 rs-sm:gap-2 rs-sm:px-2 rs-sm:py-1 rs-sm:text-xs">
              <span className="gm-tag gm-yellow grid size-8 shrink-0 place-items-center rs-sm:size-6"><Icon name="clock" className="size-5 rs-sm:size-4" stroke={2.5} /></span>
              <span><b className="font-extrabold uppercase">Hậu quả trì hoãn</b><span className="rs-sm:hidden"><br />Quyết định này có thể quay lại ảnh hưởng ở giai đoạn sau.</span><span className="hidden rs-sm:inline"> · có thể quay lại ở giai đoạn sau</span></span>
            </p>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-3 rs-sm:gap-2">
          <p className="text-xs leading-none font-bold tracking-[0.18em] text-px-panel/55 uppercase rs-sm:hidden">Chỉ số thay đổi</p>
          {/* man thap (dien thoai xoay ngang): the chi so xep 2 cot de nut Tiep tuc van trong man hinh */}
          <ul id="rsList" className="flex flex-col gap-2 rs-sm:grid rs-sm:grid-flow-dense rs-sm:grid-cols-2 rs-sm:gap-1.5" aria-label="Thay đổi chỉ số">
            {changes.map((ch, i) => <MetricRow key={ch.key} ch={ch} i={i} small={small} grown={grown} />)}
          </ul>
          <button ref={next} id="rsNext" className="px-btn px-btn-primary px-btn-hint mt-auto rs-sm:py-2 rs-sm:text-base" onClick={onNext}>
            Tiếp tục<Icon name="arrowRight" className="size-6" stroke={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

const Chip = ({ n, ic, text, cls }) => (
  <span className={`gm-tag ${cls} inline-flex items-center gap-1.5 px-2 pt-1 pb-1.5 text-xs leading-none font-bold`}>
    <Icon name={ic} className="size-4" stroke={2.5} />{n} {text}
  </span>
);

// The chi so: icon tren de, ten, thanh (thang theo mien that cua chi so, vd quy -100..200), truoc -> sau, o +/-.
// Ban gon 2 cot: dong co so dai (tien VND) chiem ca hang de the +/- khong bi cat.
function MetricRow({ ch, i, small, grown }) {
  const m = METRIC[ch.key], d = ch.to - ch.from, tone = !d ? 'same' : isGood(ch) ? 'good' : 'bad';
  const pct = v => `${Math.max(0, Math.min(100, (v - m.min) * 100 / (m.max - m.min)))}%`, lo = Math.min(ch.from, ch.to);
  const [late, setLate] = useState(false);
  useEffect(() => { if (grown) { const t = setTimeout(() => setLate(true), i * 90); return () => clearTimeout(t); } }, [grown, i]);
  return (
    <li className={`px-hud rs-row animate-rise ${fmtDelta(ch.key, d, false).length > 8 ? 'rs-sm:col-span-2' : ''}`} style={{ animationDelay: `${120 + i * 90}ms` }} data-tone={tone}>
      <span className="rs-plate"><SheetIcon name={m.icon} size={small ? 22 : 30} /></span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[0.92rem] leading-tight font-bold text-white rs-sm:text-xs"><span className="rs-sm:hidden">{m.label}</span><span className="hidden rs-sm:inline">{m.short}</span></span>
        <div className="mt-1.5 flex items-center gap-2 rs-sm:mt-1 rs-sm:gap-1">
          <span className="gm-track rs-bar flex-1" aria-hidden="true">
            <i className="gm-fill gm-blue" data-base="" style={{ width: pct(lo) }} />
            <i className="gm-fill" data-delta="" data-stripes="" style={{ left: pct(lo), width: late ? `calc(${pct(Math.max(ch.from, ch.to))} - ${pct(lo)})` : '0%' }} />
          </span>
          <span className="shrink-0 text-xs font-semibold text-white/60 tabular-nums rs-sm:hidden">{fmtNum(ch.key, ch.from)} → <b className="text-white">{fmtNum(ch.key, ch.to)}</b></span>
        </div>
      </div>
      <span className={`gm-tag rs-delta ${{ good: 'gm-green', bad: 'gm-red', same: 'gm-blue' }[tone]}`}>
        {d !== 0 && <Icon name={d > 0 ? 'arrowUp' : 'arrowDown'} className="size-3.5" stroke={3} />}{fmtDelta(ch.key, d, false)}
      </span>
    </li>
  );
}
