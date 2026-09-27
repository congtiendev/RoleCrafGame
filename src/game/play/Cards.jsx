// The chuyen canh phu toan man (cham / Enter de qua): the Level, the Ngay (dem ngay), ket qua thu viec;
// the ket thuc (het phan da dung) va the cuoi 60 ngay co nut (onAct: 'level' | 'all' | 'menu' | 'report' | 'download').
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/Icon.jsx';
import { MOOD, TapHint, TierBadge } from '../components/TierBadge.jsx';

export function Card({ card, onAct }) {
  const first = useRef(null);
  useEffect(() => { first.current?.focus({ preventScroll: true }); }, [card]);
  return (
    <div id="card" data-tap="" className="absolute inset-0 z-30 flex overflow-y-auto bg-px-ink/85 p-safe-5">
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
const Again = ({ children }) => <><Icon name="arrowPath" className="size-6" stroke={2.25} />{children}</>;

const LevelCard = ({ level }) => <>
  <span className="art-btn art-red mb-5 px-4 pt-1.5 pb-2 font-pixel text-[1.6rem] leading-none tracking-[0.3em] [--bw:16px] [--bw2:18px]">LEVEL {level.no}</span>
  <h1 className="px-title text-[clamp(3.6rem,10vw,6.5rem)]">{level.title}</h1>
  <p className="mt-8 text-[1.3rem] leading-none font-bold tracking-widest text-white">{level.days}</p>
  {level.lead && <p className="mt-4 text-[1.15rem] leading-relaxed font-bold text-px-hi italic">{level.lead}</p>}
  <p className="mt-4 text-[1.1rem] leading-relaxed font-medium text-white/85">{level.goal}</p>
  <Hint />
</>;

// The ngay: so ngay dem tu ngay truoc toi ngay moi – cac ngay khong co tinh huong luot qua nhu timeline
function DayCard({ s, from }) {
  const [day, setDay] = useState(Math.min(from, s.day));
  useEffect(() => {
    const ts = [];
    for (let d = from + 1, n = 1; d <= s.day; d++, n++) ts.push(setTimeout(() => setDay(d), Math.min(900, n * 110)));
    return () => ts.forEach(clearTimeout);
  }, [s, from]);
  return <>
    <p className="font-pixel text-[1.5rem] leading-none tracking-[0.25em] text-px-hi">{s.no} · {s.title.toUpperCase()}</p>
    <h1 className="px-title mt-5 text-[clamp(3.6rem,10vw,6rem)]">NGÀY <span>{day}</span></h1>
    <p className="mt-7 text-[1.15rem] font-semibold text-white/90">{s.place}</p>
  </>;
}

const EndingCard = ({ res }) => <>
  <p className="font-pixel text-[1.4rem] leading-none tracking-[0.25em] text-px-hi">KẾT QUẢ THỬ VIỆC · NGÀY 60</p>
  <TierBadge no={60} mood={res.mood} className="mt-6 size-[132px]" numClass="text-[3.2rem] text-white" />
  <h1 className="px-title mt-4 text-[clamp(2.2rem,7vw,4.2rem)]">{res.label.toUpperCase()}</h1>
  <p className={`gm-tag ${MOOD[res.mood]} mt-4 inline-block px-3 pt-1.5 pb-2 text-base leading-snug font-extrabold uppercase max-sm:text-sm`}>{res.title}</p>
  <Hint />
</>;

// Het cac level da dung: choi lai level vua xong (tu diem luu dau level), choi lai tu dau, ve menu
const EndCard = ({ level, r, again, first, onAct }) => <>
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

// The cuoi sau 60 ngay: xem lai bao cao, tai bao cao, choi lai Level cuoi / tu dau, ve menu
const FinalCard = ({ level, res, name, first, onAct }) => <>
  <p className="font-pixel text-[1.5rem] leading-none tracking-[0.25em] text-px-hi">HOÀN THÀNH 60 NGÀY THỬ VIỆC</p>
  <TierBadge no={60} mood={res.mood} className="mt-6 size-[132px]" numClass="text-[3.2rem] text-white" />
  <h1 className="px-title mt-4 text-[clamp(2.2rem,7vw,4.2rem)]">{res.label.toUpperCase()}</h1>
  <p className="mt-3 text-[1.1rem] leading-relaxed font-medium text-white/90">{name} · {res.title}</p>
  <div className="mt-8 flex w-full flex-wrap justify-center gap-5 max-sm:flex-col">
    <button ref={first} data-act="report" className="px-btn px-btn-primary w-auto px-7" onClick={() => onAct('report')}>Xem lại báo cáo</button>
    <button data-act="download" className="px-btn px-btn-blue w-auto px-7" onClick={() => onAct('download')}>Tải báo cáo</button>
  </div>
  <div className="mt-5 flex w-full flex-wrap justify-center gap-5 max-sm:flex-col">
    <button data-act="level" className="px-btn px-btn-blue w-auto px-7" onClick={() => onAct('level')}><Again>Chơi lại Level {level.no}</Again></button>
    <button data-act="all" className="px-btn px-btn-blue w-auto px-7" onClick={() => onAct('all')}><Again>Chơi lại từ đầu</Again></button>
    <button data-act="menu" className="px-btn px-btn-blue w-auto px-7" onClick={() => onAct('menu')}>Về menu</button>
  </div>
</>;
