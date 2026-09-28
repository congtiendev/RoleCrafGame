// The chuyen canh phu toan man (cham / Enter de qua): the Level (lop phu nhat hon: thay nen canh dau cua level), the Ngay,
// ket qua thu viec;
// the ket thuc (het phan da dung) va the cuoi 60 ngay co nut (onAct: 'level' | 'all' | 'menu' | 'report' | 'download').
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon.tsx';
import { MOOD, TapHint, TierBadge } from '../../components/TierBadge.tsx';
import type { ReactNode, RefObject } from 'react';
import type { Level, Scenario } from '../../content/schema.ts';
import type { CampaignResult } from '../../game/campaign.ts';
import type { LevelSummaryReport } from '../../game/summary.ts';
import type { CardAct, CardState } from './playTypes.ts';

type Btn = { first: RefObject<HTMLButtonElement | null>; onAct: (a: CardAct) => void };

export function Card({ card, onAct }: { card: CardState; onAct: (a: CardAct) => void }) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => { first.current?.focus({ preventScroll: true }); }, [card]);
  return (
    <div id="card" data-tap="" className={`absolute inset-0 z-30 flex overflow-y-auto p-safe-5 ${card.kind === 'level' ? 'bg-px-ink/70' : 'bg-px-ink/85'}`}>
      <div id="cardBody" className="m-auto flex max-w-[640px] flex-col items-center text-center">
        {card.kind === 'level' && <LevelCard level={card.level} />}
        {card.kind === 'day' && <DayCard s={card.s} from={card.from} />}
        {card.kind === 'ending' && <EndingCard res={card.res} />}
        {card.kind === 'end' && <EndCard {...card} first={first} onAct={onAct} />}
        {card.kind === 'final' && <FinalCard {...card} first={first} onAct={onAct} />}
      </div>
    </div>
  );
}

const Hint = () => <p className="mt-8 animate-blink text-sm font-bold tracking-wider text-white/60"><TapHint /></p>;
const Again = ({ children }: { children: ReactNode }) => <><Icon name="arrowPath" className="size-6" stroke={2.25} />{children}</>;

const LevelCard = ({ level }: { level: Level }) => <>
  <span className="art-btn art-red mb-5 px-4 pt-1.5 pb-2 font-pixel text-[1.6rem] leading-none tracking-[0.3em] [--bw:16px] [--bw2:18px]">LEVEL {level.no}</span>
  <h1 className="px-title text-[clamp(3.6rem,10vw,6.5rem)]">{level.title}</h1>
  <p className="mt-8 text-[1.3rem] leading-none font-bold tracking-widest text-white">{level.days}</p>
  {level.lead && <p className="mt-4 text-[1.15rem] leading-relaxed font-bold text-px-hi italic">{level.lead}</p>}
  <p className="mt-4 text-[1.1rem] leading-relaxed font-medium text-white/85">{level.goal}</p>
  <Hint />
</>;

// The ngay: so ngay dem tu ngay truoc toi ngay moi – cac ngay khong co tinh huong luot qua nhu timeline
function DayCard({ s, from }: { s: Scenario; from: number }) {
  const [day, setDay] = useState(Math.min(from, s.day));
  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    for (let d = from + 1, n = 1; d <= s.day; d++, n++) ts.push(setTimeout(() => setDay(d), Math.min(900, n * 110)));
    return () => ts.forEach(clearTimeout);
  }, [s, from]);
  return <>
    <p className="font-pixel text-[1.5rem] leading-none tracking-[0.25em] text-px-hi">{s.no} · {s.title.toUpperCase()}</p>
    <h1 className="px-title mt-5 text-[clamp(3.6rem,10vw,6rem)]">NGÀY <span>{day}</span></h1>
    <p className="mt-7 text-[1.15rem] font-semibold text-white/90">{s.place}</p>
  </>;
}

const EndingCard = ({ res }: { res: CampaignResult }) => <>
  <p className="font-pixel text-[1.4rem] leading-none tracking-[0.25em] text-px-hi">KẾT QUẢ THỬ VIỆC · NGÀY {res.forced?.day ?? 60}</p>
  <TierBadge no={res.forced?.day ?? 60} mood={res.mood} className="mt-6 size-[132px]" numClass="text-[3.2rem] text-white" />
  <h1 className="px-title mt-4 text-[clamp(2.2rem,7vw,4.2rem)]">{res.label.toUpperCase()}</h1>
  <p className={`gm-tag ${MOOD[res.mood]} mt-4 inline-block px-3 pt-1.5 pb-2 text-base leading-snug font-extrabold uppercase max-sm:text-sm`}>{res.forced ? res.forced.label : res.title}</p>
  <Hint />
</>;

// Het cac level da dung: choi lai level vua xong (tu diem luu dau level), choi lai tu dau, ve menu
const EndCard = ({ level, r, again, first, onAct }: { level: Level; r: LevelSummaryReport; again: boolean } & Btn) => <>
  <p className="font-pixel text-[1.5rem] leading-none tracking-[0.25em] text-px-hi">HẾT PHẦN ĐÃ DỰNG</p>
  <h1 className="px-title mt-5 text-[clamp(2.8rem,8vw,4.8rem)]">LEVEL {level.no} HOÀN THÀNH</h1>
  <TierBadge no={level.no} mood={r.tier.mood} className="mt-6 size-[132px]" numClass="text-[3.6rem] text-white" />
  <p className={`gm-tag ${MOOD[r.tier.mood]} mt-3 inline-block px-3 pt-1.5 pb-2 text-lg leading-none font-extrabold whitespace-nowrap uppercase max-sm:px-2 max-sm:text-sm`}>{r.tier.label}</p>
  <p className="mt-5 text-[1.1rem] leading-relaxed font-medium text-white/90">{level.nextLevel} sẽ được xây ở bước tiếp theo.</p>
  <div className="mt-8 flex w-full flex-wrap justify-center gap-6 max-sm:flex-col">
    {again && <button ref={first} data-again="level" className="px-btn px-btn-primary w-auto px-7" onClick={() => onAct('level')}><Again>Chơi lại Level {level.no}</Again></button>}
    <button ref={again ? undefined : first} data-again="all" className={`px-btn ${again ? 'px-btn-blue' : 'px-btn-primary'} w-auto px-7`} onClick={() => onAct('all')}><Again>Chơi lại từ đầu</Again></button>
    <button id="homeBtn" className="px-btn px-btn-blue w-auto px-7" onClick={() => onAct('menu')}>Về menu</button>
  </div>
</>;

// The cuoi sau 60 ngay (hoac khi bi buoc thoi viec: ngay dung game): xem lai bao cao, tai bao cao, choi lai Level cuoi / tu dau, ve menu
// Nut theo 3 tang, moi nhom mot mau: bao cao (do = chinh, xanh la = tai ve) · choi lai (vang Level cuoi, xanh duong tu dau)
// · ve menu (navy, nho hon). Mobile: 2 cot, chu gon hon.
const FIN_BTN = 'px-btn gap-2 px-4 text-base max-sm:gap-1.5 max-sm:px-2 max-sm:text-[0.9rem]';
const FinalCard = ({ level, res, name, first, onAct }: { level: Level; res: CampaignResult; name: string } & Btn) => <>
  <p className="font-pixel text-[1.5rem] leading-none tracking-[0.25em] text-px-hi max-sm:text-[1.2rem] max-sm:tracking-[0.15em]">{res.forced ? `DỪNG Ở NGÀY ${res.forced.day}/60` : 'HOÀN THÀNH 60 NGÀY THỬ VIỆC'}</p>
  <TierBadge no={res.forced?.day ?? 60} mood={res.mood} className="mt-5 size-[132px] max-sm:size-[108px]" numClass="text-[3.2rem] text-white max-sm:text-[2.6rem]" />
  <h1 className="px-title mt-4 text-[clamp(2.2rem,7vw,4.2rem)]">{res.label.toUpperCase()}</h1>
  {/* ten nguoi choi + ly do (bi buoc thoi viec) / tieu de ket qua neu khac nhan */}
  <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[1.05rem] leading-snug font-semibold text-white/90 max-sm:text-[0.95rem]">
    <span>PM · {name}</span>
    {(res.forced || res.title.toUpperCase() !== res.label.toUpperCase()) && (
      <span className={`gm-tag ${MOOD[res.mood]} px-2 pt-1 pb-1.5 text-xs leading-none font-extrabold uppercase`}>{res.forced ? `Lý do: ${res.forced.label}` : res.title}</span>
    )}
  </p>

  <div className="mt-7 grid w-full max-w-[520px] grid-cols-2 gap-x-4 gap-y-3 max-sm:gap-x-2.5 max-sm:gap-y-2.5">
    <p className="sm-cap col-span-2">Báo cáo</p>
    <button ref={first} data-act="report" className={`${FIN_BTN} px-btn-primary`} onClick={() => onAct('report')}><Icon name="documentText" className="size-5" stroke={2.25} />Xem báo cáo</button>
    <button data-act="download" className={`${FIN_BTN} px-btn-green`} onClick={() => onAct('download')}><Icon name="arrowDownTray" className="size-5" stroke={2.25} />Tải báo cáo</button>
    <p className="sm-cap col-span-2 mt-2">Chơi lại</p>
    <button data-act="level" className={`${FIN_BTN} px-btn-yellow`} onClick={() => onAct('level')}><Icon name="arrowPath" className="size-5" stroke={2.5} />Level {level.no}</button>
    <button data-act="all" className={`${FIN_BTN} px-btn-blue`} onClick={() => onAct('all')}><Icon name="arrowPath" className="size-5" stroke={2.5} />Từ đầu</button>
    <button data-act="menu" className={`${FIN_BTN} px-btn-navy col-span-2 mx-auto mt-3 w-[min(260px,100%)]`} onClick={() => onAct('menu')}><Icon name="home" className="size-5" stroke={2.25} />Về menu</button>
  </div>
</>;
