// HUD man choi: nut huong dan, level + ngay, 7 chi so theo nhom, nut tam dung (goc phai: mo bang tuy chon). Man ngang = hang tren cung (o level/ngay dat duoi
// nut menu, ngoai khung header, de hang chi so du cho so tien day du); man doc / hep (variant hud-col) = 2 cot doc hai ben.
// Co chu co gian theo be ngang man hinh (clamp theo vw); khoang cach giua 2 nhom = giua cac o (gap-x-3).
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { METRICS, METRIC_GROUPS } from '../../content/metrics.ts';
import { isGood, fmtNum, fmtDelta } from '../../game/format.ts';
import { Icon } from '../../components/Icon.tsx';
import { SheetIcon } from '../../components/canvases.tsx';
import { useMedia, useViewport } from '../../hooks/index.ts';
import type { Metric } from '../../content/schema.ts';
import type { Change } from '../../game/types.ts';
import type { Fx, HudState } from './playTypes.ts';

export const HUD_COL_Q = '(orientation: portrait), (width < 48rem)';        // cung dieu kien voi variant hud-col (styles/base.css)
// Thanh chi so mini (.hud-meter): moi chi so tinh tren thang 100 (quy bat dau 100, du hon thi day thanh).
// Mau theo muc co loi: rui ro (bad) cao = do.
const meter = (m: Metric, v: number) => {
  const p = Math.max(0, Math.min(1, v / 100)), good = m.bad ? 1 - p : p;
  return { width: `${p * 100}%`, tone: good >= 0.6 ? 'green' : good >= 0.35 ? 'yellow' : 'red' };
};

export function Hud({ hud, fx, onPause, onTour, hudRef }: {
  hud: HudState; fx: Fx[]; onPause: () => void; onTour: () => void; hudRef: (el: HTMLElement | null) => void;
}) {
  const vp = useViewport(), col = useMedia(HUD_COL_Q);
  // icon co theo be ngang man hinh nhu chu HUD (clamp ~1.9vw, 20–28px); man thap toi da 22px
  const iconSize = col ? 20 :Math.min(vp.h <= 560 ? 22 : 28, Math.max(20, Math.round(vp.w * 0.019)));
  return (
    <header ref={hudRef} id="hud" className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 pt-safe-3 px-safe-3 max-md:p-2 max-md:pt-safe-2 max-md:px-safe-2">
      <div className="flex shrink-0 items-center gap-3 max-sm:gap-2">
        <button id="tourBtn" className="px-btn px-btn-blue px-btn-sq max-sm:size-10" title="Hướng dẫn chỉ số" aria-label="Hướng dẫn chỉ số" onClick={onTour}>
          <Icon name="questionMarkCircle" className="size-6 max-sm:size-5" stroke={2.25} />
        </button>
        {/* ten level + ngay tren mot dong; PC (hud-row): dat duoi nut menu, khong day san khau xuong */}
        <div className="px-hud hud-row:absolute hud-row:top-full hud-row:left-3 flex items-baseline gap-2.5 px-2.5 py-1.5 whitespace-nowrap max-sm:gap-2 max-sm:px-2">
          <p className="font-pixel text-[length:clamp(1.1rem,1.5vw,1.45rem)] leading-none tracking-wider text-px-hi">{hud.lv}</p>
          <p id="hudDay" className="text-[length:clamp(0.7rem,0.9vw,0.875rem)] leading-none font-bold tracking-wider text-white/85">NGÀY {hud.day}/60</p>
        </div>
      </div>
      <div id="hudStats" className="ml-auto flex gap-x-3 hud-col:contents [@media(max-height:560px)]:gap-x-2">
        {METRIC_GROUPS.map((g, i) => (
          <ul key={g.id} data-group={g.id} aria-label={`Chỉ số ${g.label.toLowerCase()}`} className={`flex items-center gap-x-3 [@media(max-height:560px)]:gap-x-2
              hud-col:absolute hud-col:top-full hud-col:mt-2 hud-col:flex-col hud-col:items-stretch hud-col:gap-y-2 ${i ? 'hud-col:right-3' : 'hud-col:left-3'}`}>
            <li aria-hidden="true" className="px-hud hidden px-1.5 pt-1 pb-1.5 text-[0.62rem] leading-none font-bold tracking-wider whitespace-nowrap text-white/80 uppercase hud-col:block">{g.label}</li>
            {METRICS.filter(m => m.group === g.id).map(m => (
              <HudStat key={m.key} m={m} value={hud.metrics?.[m.key] ?? m.init} fx={fx} iconSize={iconSize} />
            ))}
          </ul>
        ))}
      </div>
      <button id="pauseBtn" className="px-btn px-btn-blue px-btn-sq shrink-0 max-sm:size-10" title="Tạm dừng (Esc)" aria-label="Tạm dừng · tuỳ chọn" onClick={onPause}>
        <Icon name="pause" className="size-6 max-sm:size-5" stroke={2.5} />
      </button>
    </header>
  );
}

// O chi so. So + thanh ve thang vao DOM (khong qua state) de chay dan tung khung hinh:
// chi so doi (fx) -> giu gia tri cu toi luot minh (cach nhau 350ms), roi o nhay mau xanh/do + icon nay len, so chay dan,
// the +/- noi canh o (xem .hud-stat trong styles/game/hud.css); khong co fx thi hien thang gia tri moi.
function HudStat({ m, value, fx, iconSize }: { m: Metric; value: number; fx: Fx[]; iconSize: number }) {
  const li = useRef<HTMLLIElement>(null), v = useRef<HTMLSpanElement>(null), fill = useRef<HTMLElement>(null);
  const [pops, setPops] = useState<{ id: number; good: boolean; d: number }[]>([]);
  const seen = useRef(new Set<number>()), busy = useRef(0), timers = useRef<ReturnType<typeof setTimeout>[]>([]), alive = useRef(true);
  const write = (x: number) => {
    v.current!.textContent = fmtNum(m.key, x);
    const { width, tone } = meter(m, x); fill.current!.style.width = width; fill.current!.dataset.tone = tone;
  };
  // StrictMode (trang dev) chay effect mount -> cleanup -> mount lai: phai bat lai alive, khong thi moi hieu ung bi bo qua
  // va busy ket (HUD dung o gia tri cu)
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; timers.current.forEach(clearTimeout); };
  }, []);
  useLayoutEffect(() => {
    const mine = fx.filter(f => f.key === m.key && !seen.current.has(f.id));
    if (!mine.length) { if (!busy.current) write(value); return; }
    for (const f of mine) {
      seen.current.add(f.id);
      if (!busy.current) write(f.from);
      busy.current++;
      timers.current.push(setTimeout(() => start(f), Math.max(0, f.at - performance.now())));
    }
  }, [fx, value]);                                               // eslint-disable-line react-hooks/exhaustive-deps

  function start(c: Fx & Change) {
    if (!alive.current) return;
    const el = li.current!, good = isGood(c), d = c.to - c.from, t0 = performance.now();
    el.dataset.fx = good ? 'good' : 'bad'; el.dataset.side = m.group;
    v.current!.classList.add(good ? 'text-[#9cf07f]' : 'text-[#ff8a7a]');
    setPops(p => [...p, { id: c.id, good, d }]);
    // so dem + thanh chi so tang/giam tung khung hinh (ease-out), mau thanh doi dung luc vuot nguong
    const step = (now: number) => {
      if (!alive.current) return;
      const p = Math.min(1, (now - t0) / 900), e = 1 - (1 - p) ** 3;
      write(c.from + (c.to - c.from) * e);
      if (p < 1) requestAnimationFrame(step); else busy.current--;
    };
    requestAnimationFrame(step);
    timers.current.push(setTimeout(() => {
      if (!alive.current) return;
      setPops(p => p.filter(x => x.id !== c.id)); delete el.dataset.fx;
      v.current?.classList.remove('text-[#9cf07f]', 'text-[#ff8a7a]');
    }, 2600));
  }

  return (
    // hud-col (man doc): o gon mot hang icon + so, thanh duoi (cao ~36px) -> 2 cot ngan, nhan vat dung duoi cot, khong bi che
    <li ref={li} className="hud-stat px-hud flex flex-wrap items-center gap-x-1.5 gap-y-1 px-1.5 py-1 [@media(max-height:560px)]:gap-x-1 [@media(max-height:560px)]:px-1 [@media(max-height:560px)]:py-0.5 hud-col:min-w-[58px] hud-col:gap-x-1 hud-col:gap-y-0 hud-col:px-1 hud-col:pt-0.5 hud-col:pb-1 hud-col:flex-wrap" title={m.label} data-stat={m.key}>
      <SheetIcon name={m.icon} size={iconSize} />
      <span className="sr-only">{m.label}</span>
      <span ref={v} className={`min-w-[3ch] text-[length:clamp(0.85rem,1.05vw,1.2rem)] leading-none font-bold tabular-nums transition-colors duration-300 hud-col:min-w-0 hud-col:flex-1 hud-col:text-center ${m.unit === '%' ? 'hud-col:text-[length:clamp(0.78rem,3.3vw,0.9rem)]' : 'hud-col:text-[length:clamp(0.62rem,2.7vw,0.75rem)]'}`} />
      {m.unit !== '%' && <span className="text-[length:clamp(0.6rem,0.7vw,0.75rem)] leading-none font-bold text-white/60 hud-col:hidden">{m.unit}</span>}
      <span className="text-[length:clamp(0.6rem,0.7vw,0.75rem)] font-semibold text-white/65 max-xl:hidden">{m.short}</span>
      <span className="hud-meter basis-full" aria-hidden="true"><i ref={fill} /></span>
      {pops.map(p => (
        <span key={p.id} className={`hud-delta gm-tag ${p.good ? 'gm-green' : 'gm-red'}`}>
          <Icon name={p.d > 0 ? 'arrowUp' : 'arrowDown'} className="size-3.5" stroke={3} />{fmtDelta(m.key, p.d)}
        </span>
      ))}
    </li>
  );
}
