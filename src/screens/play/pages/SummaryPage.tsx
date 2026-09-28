import { MOOD, TierBadge } from '../../../components/TierBadge.tsx';
import { at, MetricTiles, tileCount, Card, Timeline, Entry, Step } from './parts.tsx';
import type { Level } from '../../../content/schema.ts';
import type { LevelSummaryReport } from '../../../game/summary.ts';

// ---------- tong ket level ----------
// (1) ket luan (xep loai) + du 7 o chi so; (2) 3 the noi bat + hanh trinh quyet dinh + hau qua quay lai
export function summaryPage({ r, level }: { r: LevelSummaryReport; level: Level }, page: number) {
  const head = `TỔNG KẾT LV${level.no} · ${level.days.toUpperCase()}`;
  if (page === 0) return {
    cta: 'Xem đánh giá', ctaAt: 400 + tileCount() * 60,
    body: <>
      <div className="relative flex items-center justify-center gap-4 px-8 max-sm:gap-3 max-sm:px-0">
        <TierBadge no={level.no} mood={r.tier.mood} className="size-[68px] max-sm:size-[52px]" numClass="text-[2rem] text-px-panel max-sm:text-[1.6rem]" />
        <div className="min-w-0">
          <p className="font-pixel text-[1.25rem] leading-none tracking-[0.2em] text-px-panel/55 max-sm:text-[0.95rem] max-sm:tracking-[0.04em]">{head}</p>
          <p className={`gm-tag ${MOOD[r.tier.mood]} mt-2 inline-block px-3 pt-1.5 pb-2 text-xl leading-none font-extrabold whitespace-nowrap uppercase max-sm:px-2 max-sm:text-sm`}>{r.tier.label}</p>
        </div>
        <Step n={1} of={2} />
      </div>
      <MetricTiles changes={r.changes} />
    </>,
  };
  const dz = r.dangers.length;
  return {
    cta: level.summary?.cta || 'Tiếp tục', ctaAt: 750,
    body: <>
      <div className="relative flex flex-col items-center text-center">
        <div className="min-w-0 px-10 max-sm:px-0">
          <p className="font-pixel text-[1.25rem] leading-none tracking-[0.2em] text-px-panel/55 max-sm:text-[1.05rem] max-sm:tracking-[0.06em]">{head}</p>
          <p className="mt-2 text-xl leading-tight font-extrabold text-px-panel max-sm:text-lg">Đánh giá quyết định</p>
        </div>
        <Step n={2} of={2} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        <Card i={0} ic="trophy" badge="rosette_blue" label="Quyết định tốt nhất" big={r.best ? `${r.best.no} · ${r.best.choice}` : '—'} sub={r.best ? r.best.label : 'Chưa có quyết định'} />
        <Card i={1} ic="academicCap" badge="shield_gold" label="Năng lực nổi bật"
          big={r.topCompetency ? <>{r.topCompetency.score}<span className="text-base text-white/45">/100</span></> : '—'} sub={r.topCompetency?.label || ''} />
        <Card i={2} ic={dz ? 'exclamationTriangle' : 'checkCircle'} badge={dz ? 'hexagon_bronze' : 'hexagon_silver'} label="Rủi ro tích lũy" big={dz} bad={dz > 0}
          sub={dz ? <>{r.dangers[0].text}{dz > 1 && <b> +{dz - 1}</b>}</> : 'Chưa có quyết định nào để lại rủi ro.'} />
      </div>
      <p className="sm-h animate-rise text-center" style={at(550)}>Hành trình quyết định</p>
      <Timeline decisions={r.decisions} style={at(600)} />
      {r.returned.length > 0 && <>
        <p className="sm-h animate-rise text-center" style={at(700)}>Hậu quả quay lại từ quyết định trước</p>
        <ul className="flex animate-rise flex-col gap-2" style={at(750)} aria-label="Hậu quả quay lại">
          {r.returned.map((f, i) => <Entry key={i} tone="link" i={i} head={f.from} text={f.text} />)}
        </ul>
      </>}
    </>,
  };
}
