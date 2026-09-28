// Manh dung chung cua tong ket level va bao cao cuoi: o chi so, the noi bat, dong thoi gian, ghi chu, so trang.
import { Icon } from '../../../components/Icon.tsx';
import { SheetIcon } from '../../../components/canvases.tsx';
import { METRIC, METRIC_GROUPS } from '../../../content/metrics.ts';
import { isGood, fmt, fmtNum, fmtDelta } from '../../../game/format.ts';
import { asset } from '../../../lib/ui.ts';
import type { CSSProperties, ReactNode } from 'react';
import type { IconName } from '../../../lib/icons.ts';
import type { Change } from '../../../game/types.ts';

// Quyet dinh hien tren dong thoi gian (tong ket level / bao cao cuoi)
export interface TimelineDecision { no: string; title: string; choice: string; label: string; avg: number }

export const at = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });
export const tone = (d: { avg: number }) => (d.avg >= 2 ? 'art-green' : d.avg >= 1 ? 'art-yellow' : 'art-red');

// O chi so (tong ket level + bao cao cuoi): du 7 chi so, thu tu co dinh theo nhom (Du an | Con nguoi) de luoi luon deu;
// khong doi thi the "—"; rui ro (bad) nen do. Tien: man hep bo chu "VND" o gia tri (the +/- ben canh van ghi).
export function MetricTiles({ changes, top = 'mt-5 max-sm:mt-4' }: { changes: Change[]; top?: string }) {
  let n = 0;
  return (
    <div id="sumTiles" className={`${top} grid grid-cols-2 gap-x-4 gap-y-3 max-sm:grid-cols-1`}>
      {METRIC_GROUPS.map(g => (
        <div key={g.id} className="min-w-0">
          <p className="mb-1.5 text-center text-[0.65rem] leading-none font-bold tracking-[0.16em] text-px-panel/45 uppercase">{g.label}</p>
          <ul className="flex flex-col gap-1" aria-label={`Chỉ số ${g.label.toLowerCase()}`}>
            {changes.filter(c => METRIC[c.key].group === g.id).map(c => <Tile key={c.key} c={c} i={n++} />)}
          </ul>
        </div>
      ))}
    </div>
  );
}
export const tileCount = () => Object.keys(METRIC).length;
export function Tile({ c, i }: { c: Change; i: number }) {
  const m = METRIC[c.key], d = c.to - c.from, tag = !d ? 'gm-blue opacity-70' : isGood(c) ? 'gm-green' : 'gm-red';
  return (
    <li className="px-hud sm-tile animate-rise" style={at(250 + i * 60)} data-bad={m.bad ? '' : undefined} title={`${m.label}: ${fmt(c.key, c.from)} → ${fmt(c.key, c.to)}`}>
      <SheetIcon name={m.icon} size={22} />
      <span className="min-w-8 flex-1 truncate text-[0.8rem] font-medium text-white/70">{m.short}</span>
      <span className="shrink-0 text-[0.92rem] font-semibold tabular-nums max-sm:text-[0.85rem]">
        {m.unit === '%' || m.of ? fmt(c.key, c.to) : <>{fmtNum(c.key, c.to)}<span className="max-sm:hidden"> {m.unit}</span></>}
      </span>
      <span className={`gm-tag ${tag} shrink-0 px-1.5 pt-0.5 pb-1 text-xs leading-none font-bold tabular-nums max-sm:px-1 max-sm:text-[0.68rem]`}>{d ? fmtDelta(c.key, d) : '—'}</span>
    </li>
  );
}
// the noi bat: khung HUD (px-hud) + icon trong badge art (ui/badges/badge_<badge>); bad = nen do nhu o Rui ro
export const Card = ({ ic, badge, label, big, sub, i, bad }: {
  ic: IconName; badge: string; label: string; big: ReactNode; sub: ReactNode; i: number; bad?: boolean;
}) => (
  <div className="px-hud sm-card animate-rise" data-bad={bad ? '' : undefined} style={at(150 + i * 110)}>
    <span className="sm-badge"><img src={asset(`ui/badges/badge_${badge}.webp`)} alt="" draggable="false" /><Icon name={ic} className="size-5" stroke={2.25} /></span>
    <p className="pr-12 text-[0.68rem] font-bold tracking-[0.14em] text-white/60 uppercase">{label}</p>
    <p className="mt-1 text-[1.5rem] leading-none font-extrabold">{big}</p>
    <p className="mt-1.5 line-clamp-2 text-[0.8rem] leading-snug font-medium text-white/75">{sub}</p>
  </div>
);
// dong thoi gian quyet dinh: cham mau theo muc, nhan day du trong bong bong khi re / focus / cham
export const Timeline = ({ decisions, small, style, label = 'Các quyết định' }: {
  decisions: TimelineDecision[]; small?: boolean; style?: CSSProperties; label?: string;
}) => (
  <ol className={`sm-line ${small ? 'flex-1' : 'animate-rise'}`} style={style} aria-label={label}>
    {decisions.map(d => (
      <li key={d.no} className="sm-node group" tabIndex={0}>
        <span className={`art-sq ${tone(d)} grid ${small ? 'size-9 text-[0.9rem]' : 'size-10 text-base'} place-items-center pb-0.5 leading-none font-extrabold`}>{d.choice}</span>
        <span className={`${small ? 'mt-0.5 text-[0.7rem]' : 'mt-1 text-xs'} font-bold text-px-panel/60`}>{d.no}</span>
        <span className="sm-tip px-bubble" role="tooltip"><b>{d.no} · {d.title}</b><br />{d.label}</span>
      </li>
    ))}
  </ol>
);
// dong ghi chu: the nho (ma) + chu; mau nen / vien / chu theo loai
export const Note = ({ tag, text, tagTone = 'gm-yellow', bg = '#fff1c7', sh = '#f5cf6a', ink = '#4a2703' }: {
  tag?: ReactNode; text: ReactNode; tagTone?: string; bg?: string; sh?: string; ink?: string;
}) => (
  <li className="flex items-start gap-2.5 rounded-lg border-2 border-(--ink) px-3 py-1.5 text-[0.85rem] leading-snug font-semibold" style={{ background: bg, color: ink, boxShadow: `inset 0 -3px 0 ${sh}` }}>
    {tag && <span className={`gm-tag ${tagTone} shrink-0 px-1.5 pt-0.5 pb-1 text-[0.7rem] leading-none font-bold whitespace-nowrap`}>{tag}</span>}<span>{text}</span>
  </li>
);
// muc bao cao 2 tang (de doc tren mobile): dong nhan nho (icon + ma, mau theo loai) roi noi dung chiem tron be ngang.
// tone: good = quyet dinh tich cuc, bad = hau qua lon, link = quyet dinh cu -> hau qua ve sau (xem .sm-entry)
const ENTRY_IC: Record<'good' | 'bad' | 'link', IconName> = { good: 'checkCircle', bad: 'exclamationTriangle', link: 'clock' };
export const Entry = ({ tone, head, sub, text, i = 0 }: { tone: 'good' | 'bad' | 'link'; head: ReactNode; sub?: ReactNode; text: ReactNode; i?: number }) => (
  <li className="sm-entry animate-rise" data-tone={tone} style={at(200 + i * 60)}>
    <p className="sm-entry-head">
      <Icon name={ENTRY_IC[tone]} className="size-4 shrink-0" stroke={2.5} />
      <span className="shrink-0">{head}</span>
      {sub && <span className="min-w-0 truncate font-semibold tracking-normal normal-case opacity-75">{sub}</span>}
    </p>
    <p className="mt-1 text-[0.9rem] leading-snug font-semibold">{text}</p>
  </li>
);
// so trang goc tren-phai (an tren dien thoai: nut ben duoi da cho biet con trang sau)
export const Step = ({ n, of }: { n: number; of: number }) => <span className="absolute top-0 right-0 font-pixel text-[1.1rem] leading-none tracking-[0.2em] text-px-panel/40 max-sm:hidden">{n}/{of}</span>;
