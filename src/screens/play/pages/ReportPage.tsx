import { MOOD, TierBadge } from '../../../components/TierBadge.tsx';
import { LEVELS } from '../../../game/levels.ts';
import { at, MetricTiles, tileCount, Timeline, Note, Entry, Step } from './parts.tsx';
import { Icon } from '../../../components/Icon.tsx';
import type { Decision, Report } from '../../../game/campaign.ts';

// ---------- bao cao cuoi (muc 9 – Man hinh ket qua) ----------
// (1) ket qua + ly do + 7 chi so ngay 1 -> ngay 60; (2) 6 nang luc + goi y hoc tap;
// (3) hanh trinh 16 quyet dinh, 3 tich cuc nhat / 3 hau qua lon nhat, quyet dinh cu -> hau qua ve sau
export function reportPage({ rep, name }: { rep: Report; name: string }, page: number) {
  const res = rep.result;
  const head = (k: number, title: string) => (
    <div className="relative text-center">
      <p className="font-pixel text-[1.25rem] leading-none tracking-[0.2em] text-px-panel/55 max-sm:text-[1rem] max-sm:tracking-[0.06em]">BÁO CÁO THỬ VIỆC · {name.toUpperCase()}</p>
      <p className="mt-2 text-xl leading-tight font-extrabold text-px-panel max-sm:text-lg">{title}</p>
      <Step n={k} of={3} />
    </div>
  );
  if (page === 0) return {
    cta: 'Xem năng lực', ctaAt: 400 + tileCount() * 60,
    body: <>
      {head(1, res.forced ? `Kết quả · dừng ở ngày ${res.forced.day}` : 'Kết quả 60 ngày')}
      <div className="mt-4 flex items-center justify-center gap-4 max-sm:gap-3">
        <TierBadge no={res.forced?.day ?? 60} mood={res.mood} className="size-[68px] max-sm:size-[52px]" numClass="text-[1.7rem] text-px-panel max-sm:text-[1.3rem]" />
        <p className={`gm-tag ${MOOD[res.mood]} px-3 pt-1.5 pb-2 text-lg leading-snug font-extrabold uppercase max-sm:text-sm`}>{res.title}</p>
      </div>
      {res.reasons.length > 0 && (
        <ul className="mt-3 flex animate-rise flex-col gap-1.5" style={at(150)} aria-label="Lý do">
          {res.reasons.map((t, i) => <Note key={i} text={t} bg="#ffe1dc" sh="#f2a597" ink="#5a1208" />)}
        </ul>
      )}
      <p className="sm-h text-center">Chỉ số ngày 1 → ngày {res.forced?.day ?? 60}</p>
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
  // muc 2 tang: nhan = ma tinh huong · phuong an + ten tinh huong, noi dung = phuong an da chon (doc duoc tren mobile)
  const list = (ds: Decision[], tone: 'good' | 'bad') => ds.map((d, i) => (
    <Entry key={d.id} tone={tone} i={i} head={`${d.no} · ${d.choice}`} sub={d.title} text={d.label} />
  ));
  return {
    cta: 'Hoàn tất', ctaAt: 400,
    body: <>
      {head(3, 'Hành trình quyết định')}
      <div className="mt-4 flex flex-col gap-2">
        {LEVELS.map(lv => (
          <div key={lv.id} className="flex items-center gap-3 max-sm:gap-1.5">
            <span className="w-10 shrink-0 font-pixel text-[1rem] text-px-panel/55 max-sm:w-8">LV{lv.no}</span>
            <Timeline small decisions={rep.decisions.filter(d => d.level === lv.no)} label={`Quyết định Level ${lv.no}`} />
          </div>
        ))}
      </div>
      {/* chu thich mau o quyet dinh (tone() trong parts.tsx: diem nang luc trung binh cua lua chon) */}
      <p className="mt-2 flex justify-center gap-4 text-[0.72rem] font-semibold text-px-panel/70">
        <span className="sm-key"><i className="bg-[#1fbf73]" />Tốt</span>
        <span className="sm-key"><i className="bg-[#ffb21c]" />Trung bình</span>
        <span className="sm-key"><i className="bg-[#f2432f]" />Chưa tốt</span>
      </p>
      <div className="grid grid-cols-2 gap-x-4 max-sm:grid-cols-1">
        <div><p className="sm-h">Ba quyết định tích cực nhất</p><ul className="flex flex-col gap-2">{list(rep.best, 'good')}</ul></div>
        <div><p className="sm-h">Ba quyết định tạo hậu quả lớn nhất</p><ul className="flex flex-col gap-2">{list(rep.worst, 'bad')}</ul></div>
      </div>
      {rep.links.length > 0 && <>
        <p className="sm-h">Quyết định cũ → hậu quả về sau</p>
        <ul className="flex flex-col gap-2">
          {rep.links.map((l, i) => (
            <Entry key={i} tone="link" i={i} text={l.text}
              head={<span className="inline-flex items-center gap-1">{l.from}<Icon name="arrowRight" className="size-3.5" stroke={3} />{l.to}</span>} />
          ))}
        </ul>
      </>}
    </>,
  };
}
