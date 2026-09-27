// Modal nhieu trang: tong ket level (2 trang) va bao cao thu viec cuoi (3 trang). Thiet ke "it chu": khung dung yen,
// noi dung can giua, nut dung rieng ngay duoi khung (khong nen). Khong cuon: cao hon man hinh thi thu nho ca cum (zoom,
// toi thieu 0.6); van tran (man qua thap) moi de vung noi dung cuon lam du phong. Doi trang = chay lai hieu ung mo panel.
import { useEffect, useLayoutEffect, useRef } from 'react';
import { METRIC, METRIC_GROUPS, isGood, fmt, fmtNum, fmtDelta } from '../rules.js';
import { asset } from '../../shared/ui.js';
import { Icon } from '../components/Icon.jsx';
import { SheetIcon } from '../components/canvases.jsx';
import { MOOD, TierBadge } from '../components/TierBadge.jsx';
import { useViewport } from '../components/hooks.js';
import { LEVELS } from './director.js';

const at = ms => ({ animationDelay: `${ms}ms` });
const tone = d => (d.avg >= 2 ? 'art-green' : d.avg >= 1 ? 'art-yellow' : 'art-red');

// pages = { kind: 'summary' | 'report', data, page }
export function Pages({ pages, onNext }) {
  const { kind, data, page } = pages;
  const content = kind === 'summary' ? summaryPage(data, page) : reportPage(data, page);
  return <Modal key={`${kind}-${page}`} cta={content.cta} ctaAt={content.ctaAt} onNext={onNext}>{content.body}</Modal>;
}

function Modal({ children, cta, ctaAt, onNext }) {
  const wrap = useRef(null), sum = useRef(null), next = useRef(null), vp = useViewport();
  useLayoutEffect(() => {
    const w = wrap.current, s = sum.current;
    w.style.zoom = ''; w.style.maxHeight = 'none';
    const cs = getComputedStyle(s), avail = s.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const k = Math.min(1, avail / w.offsetHeight);
    if (k < 1) w.style.zoom = Math.max(0.6, k).toFixed(3);
    if (k < 0.6) w.style.maxHeight = '';                          // qua thap: giu khung trong man, noi dung cuon
  }, [vp]);
  useEffect(() => { next.current?.focus({ preventScroll: true }); }, []);
  return (
    <div ref={sum} id="sum" className="absolute inset-0 z-20 flex bg-px-ink/55 p-safe-4 max-sm:p-safe-2.5">
      <div ref={wrap} id="sumWrap" className="m-auto flex max-h-full w-[min(920px,100%)] animate-rise flex-col items-center">
        <div className="px-panel flex min-h-0 w-full flex-col px-7 pt-6 pb-4 max-sm:px-4 max-sm:pt-5 max-sm:pb-3">
          <div data-scroll="" className="-mx-2 min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain px-2">{children}</div>
        </div>
        <div className="sm-foot">
          <button ref={next} id="sumNext" className="px-btn px-btn-primary animate-rise w-auto px-8 max-sm:w-full" style={at(ctaAt)} onClick={onNext}>
            {cta}<Icon name="arrowRight" className="size-6" stroke={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

// O chi so (tong ket level + bao cao cuoi): du 7 chi so, thu tu co dinh theo nhom (Du an | Con nguoi) de luoi luon deu;
// khong doi thi the "—"; rui ro (bad) nen do. Tien: man hep bo chu "VND" o gia tri (the +/- ben canh van ghi).
function MetricTiles({ changes, top = 'mt-5 max-sm:mt-4' }) {
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
function Tile({ c, i }) {
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
const Card = ({ ic, badge, label, big, sub, i, bad }) => (
  <div className="px-hud sm-card animate-rise" data-bad={bad ? '' : undefined} style={at(150 + i * 110)}>
    <span className="sm-badge"><img src={asset(`ui/badges/badge_${badge}.webp`)} alt="" draggable="false" /><Icon name={ic} className="size-5" stroke={2.25} /></span>
    <p className="pr-12 text-[0.68rem] font-bold tracking-[0.14em] text-white/60 uppercase">{label}</p>
    <p className="mt-1 text-[1.5rem] leading-none font-extrabold">{big}</p>
    <p className="mt-1.5 line-clamp-2 text-[0.8rem] leading-snug font-medium text-white/75">{sub}</p>
  </div>
);
// dong thoi gian quyet dinh: cham mau theo muc, nhan day du trong bong bong khi re / focus / cham
const Timeline = ({ decisions, small, style, label = 'Các quyết định' }) => (
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
const Note = ({ tag, text, tagTone = 'gm-yellow', bg = '#fff1c7', sh = '#f5cf6a', ink = '#4a2703' }) => (
  <li className="flex items-start gap-2.5 rounded-lg border-2 border-(--ink) px-3 py-1.5 text-[0.85rem] leading-snug font-semibold" style={{ background: bg, color: ink, boxShadow: `inset 0 -3px 0 ${sh}` }}>
    {tag && <span className={`gm-tag ${tagTone} shrink-0 px-1.5 pt-0.5 pb-1 text-[0.7rem] leading-none font-bold whitespace-nowrap`}>{tag}</span>}<span>{text}</span>
  </li>
);
// so trang goc tren-phai (an tren dien thoai: nut ben duoi da cho biet con trang sau)
const Step = ({ n, of }) => <span className="absolute top-0 right-0 font-pixel text-[1.1rem] leading-none tracking-[0.2em] text-px-panel/40 max-sm:hidden">{n}/{of}</span>;

// ---------- tong ket level ----------
// (1) ket luan (xep loai) + du 7 o chi so; (2) 3 the noi bat + hanh trinh quyet dinh + hau qua quay lai
function summaryPage({ r, level }, page) {
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
    cta: level.summary.cta || 'Tiếp tục', ctaAt: 750,
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
        <ul className="flex animate-rise flex-col gap-1.5" style={at(750)} aria-label="Hậu quả quay lại">
          {r.returned.map((f, i) => <Note key={i} tag={f.from} text={f.text} />)}
        </ul>
      </>}
    </>,
  };
}

// ---------- bao cao cuoi (muc 9 – Man hinh ket qua) ----------
// (1) ket qua + ly do + 7 chi so ngay 1 -> ngay 60; (2) 6 nang luc + goi y hoc tap;
// (3) hanh trinh 16 quyet dinh, 3 tich cuc nhat / 3 hau qua lon nhat, quyet dinh cu -> hau qua ve sau
function reportPage({ rep, name }, page) {
  const res = rep.result;
  const head = (k, title) => (
    <div className="relative text-center">
      <p className="font-pixel text-[1.25rem] leading-none tracking-[0.2em] text-px-panel/55 max-sm:text-[1rem] max-sm:tracking-[0.06em]">BÁO CÁO THỬ VIỆC · {name.toUpperCase()}</p>
      <p className="mt-2 text-xl leading-tight font-extrabold text-px-panel max-sm:text-lg">{title}</p>
      <Step n={k} of={3} />
    </div>
  );
  if (page === 0) return {
    cta: 'Xem năng lực', ctaAt: 400 + tileCount() * 60,
    body: <>
      {head(1, 'Kết quả 60 ngày')}
      <div className="mt-4 flex items-center justify-center gap-4 max-sm:gap-3">
        <TierBadge no={60} mood={res.mood} className="size-[68px] max-sm:size-[52px]" numClass="text-[1.7rem] text-px-panel max-sm:text-[1.3rem]" />
        <p className={`gm-tag ${MOOD[res.mood]} px-3 pt-1.5 pb-2 text-lg leading-snug font-extrabold uppercase max-sm:text-sm`}>{res.title}</p>
      </div>
      {res.reasons.length > 0 && (
        <ul className="mt-3 flex animate-rise flex-col gap-1.5" style={at(150)} aria-label="Lý do">
          {res.reasons.map((t, i) => <Note key={i} text={t} bg="#ffe1dc" sh="#f2a597" ink="#5a1208" />)}
        </ul>
      )}
      <p className="sm-h text-center">Chỉ số ngày 1 → ngày 60</p>
      <MetricTiles changes={rep.changes} top="" />
    </>,
  };
  if (page === 1) return {
    cta: 'Xem hành trình', ctaAt: 800,
    body: <>
      {head(2, 'Sáu năng lực quản lý')}
      <ul className="mt-4 flex flex-col gap-1.5" aria-label="Năng lực">
        {rep.competencies.map((c, i) => (
          <li key={c.code || c.label} className="px-hud animate-rise flex items-center gap-3 px-3 py-2" style={at(150 + i * 80)}>
            <span className="w-[46%] min-w-0 text-[0.82rem] leading-tight font-semibold text-white/85">{c.label}</span>
            <span className="gm-track h-3.5 flex-1" aria-hidden="true">
              {c.score != null && <i className={`gm-fill ${c.score >= 67 ? 'gm-green' : c.score >= 34 ? 'gm-yellow' : 'gm-red'}`} style={{ width: `${c.score}%` }} />}
            </span>
            <span className="w-12 shrink-0 text-right text-[0.95rem] font-extrabold text-white tabular-nums">{c.score ?? '—'}</span>
          </li>
        ))}
      </ul>
      <p className="sm-h text-center">Gợi ý học tập tiếp theo</p>
      <ul className="flex animate-rise flex-col gap-1.5" style={at(700)}>
        {rep.learning.map((l, i) => <Note key={i} tag={l.code} text={l.text} tagTone="gm-blue" bg="#e4f0ff" sh="#b9cfee" ink="#0b1d4d" />)}
      </ul>
    </>,
  };
  const list = ds => ds.map((d, i) => (
    <Note key={i} tag={`${d.no} · ${d.choice}`} text={d.label} tagTone={d.avg >= 2 ? 'gm-green' : d.avg >= 1 ? 'gm-yellow' : 'gm-red'} bg="#f3f7ff" sh="#c9d8f0" ink="#0b1d4d" />
  ));
  return {
    cta: 'Hoàn tất', ctaAt: 400,
    body: <>
      {head(3, 'Hành trình quyết định')}
      <div className="mt-4 flex flex-col gap-2">
        {LEVELS.map(lv => (
          <div key={lv.id} className="flex items-center gap-3">
            <span className="w-10 shrink-0 font-pixel text-[1rem] text-px-panel/55">LV{lv.no}</span>
            <Timeline small decisions={rep.decisions.filter(d => d.level === lv.no)} label={`Quyết định Level ${lv.no}`} />
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-4 max-sm:grid-cols-1">
        <div><p className="sm-h text-center">Ba quyết định tích cực nhất</p><ul className="flex flex-col gap-1.5">{list(rep.best)}</ul></div>
        <div><p className="sm-h text-center">Ba quyết định tạo hậu quả lớn nhất</p><ul className="flex flex-col gap-1.5">{list(rep.worst)}</ul></div>
      </div>
      {rep.links.length > 0 && <>
        <p className="sm-h text-center">Quyết định cũ → hậu quả về sau</p>
        <ul className="flex flex-col gap-1.5">{rep.links.map((l, i) => <Note key={i} tag={`${l.from} → ${l.to}`} text={l.text} />)}</ul>
      </>}
    </>,
  };
}
