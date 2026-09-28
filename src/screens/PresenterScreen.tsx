// Man trinh chieu cho admin (chieu len man lon): ma QR co dinh (link game – quet la vao choi) + danh sach nguoi choi realtime
// (dang choi / hoan thanh / da roi) + dong hoat dong. Nguoi choi choi doc lap, man nay chi de xem. Giao thuc: src/live/protocol.ts;
// may chu that: BE (docs/BE_REALTIME_TRINH_CHIEU.md), luc dev: mock gan vao npm run dev.
// Web chu tu kiem tra quyen admin truoc khi hien man nay (prop presenter); trang game rieng: #admin.
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { asset } from '../lib/ui.ts';
import { Icon } from '../components/Icon.tsx';
import { GameTitle } from '../components/GameTitle.tsx';
import { Logo } from '../components/Logo.tsx';
import { QrFrame } from '../components/QrCode.tsx';
import { liveSocket, liveUrl, pageUrl } from '../live/client.ts';
import type { LiveStatus } from '../live/client.ts';
import type { LiveEvent, LivePlayer, PlayerStatus } from '../live/protocol.ts';

const MOOD = { good: 'gm-green', mid: 'gm-yellow', bad: 'gm-red' } as const;
// mau avatar theo ten (on dinh giua cac lan cap nhat)
const AVATAR = ['#2c63b0', '#1fbf73', '#d9800c', '#8b5cf6', '#e0457b', '#0ea5b7', '#d3343c', '#4f6bd8'];
const tint = (s: string) => AVATAR[[...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % AVATAR.length];
const initials = (name: string) => name.split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase();
const hhmm = (t: number) => new Date(t).toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' });

// Dong hoat dong: icon = nut tron art (ui/icons/circle): vao = xanh la mui ten phai, quay lai = xanh duong vong lap,
// hoan thanh = dau tich (mau theo ket qua), roi = do mui ten trai
const FINISH_IC = { good: 'green', mid: 'blue', bad: 'red' } as const;
const EVENT: Record<LiveEvent['kind'], { ic: (e: LiveEvent) => string; verb: (e: LiveEvent) => ReactNode }> = {
  join: { ic: () => 'green_next', verb: () => 'đã tham gia' },
  back: { ic: () => 'blue_refresh', verb: () => 'đã quay lại' },
  finish: { ic: e => `${FINISH_IC[e.mood ?? 'good']}_check`, verb: e => <>hoàn thành · <b className="font-bold text-px-hi">{e.label}</b></> },
  leave: { ic: () => 'red_back', verb: () => 'đã rời' },
};

// The mot hoat dong = khung o HUD (.px-hud, art track_sm); moi nhat (dau hang) truot vao, cu hon nhat dan
function EventChip({ e, latest }: { e: LiveEvent; latest: boolean }) {
  const k = EVENT[e.kind];
  return (
    <li className={`px-hud flex shrink-0 animate-rise items-center gap-2 py-1 pr-3 pl-1 whitespace-nowrap ${latest ? '' : 'opacity-70'}`}>
      <img src={asset(`ui/icons/circle/circle_${k.ic(e)}.webp`)} alt="" className="size-7" draggable="false" />
      <span className="text-sm text-white"><b className="font-bold">{e.name}</b> <span className="text-white/75">{k.verb(e)}</span></span>
      <time className="text-xs font-semibold text-white/50 tabular-nums">{hhmm(e.at)}</time>
    </li>
  );
}

function where(p: LivePlayer) {
  if (p.where === 'play' && p.level) return `LV${p.level} · Ngày ${p.day ?? 1}/60`;
  return 'Đang ở sảnh';
}

// Cham trang thai tren avatar: xanh (nhap nhay) dang choi · vang hoan thanh · xam da roi; dong phu ghi ro vi tri / ket qua
const DOT: Record<PlayerStatus, string> = { playing: 'animate-pulse bg-[#1fbf73]', finished: 'bg-[#ffb21c]', left: 'bg-[#9aa3b8]' };
const STATUS_LABEL: Record<PlayerStatus, string> = { playing: 'Đang chơi', finished: 'Hoàn thành', left: 'Đã rời' };
function PlayerCard({ p }: { p: LivePlayer }) {
  const left = p.status === 'left';
  return (
    <li data-status={p.status} title={STATUS_LABEL[p.status]} className={`px-tile flex animate-rise items-center gap-3 px-2.5 py-2 ${left ? 'opacity-55 grayscale' : ''}`}>
      {/* avatar: chu cai dau trong khung tron art (ui/progress/ring_frame) + cham trang thai */}
      <span className="relative size-12 shrink-0" aria-hidden="true">
        <span className="absolute inset-[15%] grid place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: tint(p.name) }}>{initials(p.name)}</span>
        <img src={asset('ui/progress/ring_frame.webp')} alt="" className="absolute inset-0 size-full" draggable="false" />
        <span className={`absolute right-0 bottom-0 size-3.5 rounded-full border-2 border-white ${DOT[p.status]}`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[1.05rem] leading-tight font-bold text-px-panel">{p.name}</p>
        <p className="truncate text-sm font-semibold text-px-panel/60">
          <span className="sr-only">{STATUS_LABEL[p.status]} · </span>
          {left ? `Rời lúc ${hhmm(p.updatedAt)}` : p.status === 'finished' && p.result
            ? <><span className={`gm-tag ${MOOD[p.result.mood]} mr-1.5 px-1.5 pt-px pb-0.5 text-[0.7rem] leading-none font-bold uppercase`}>{p.result.label}</span>Ngày {p.day ?? 60}</>
            : where(p)}
        </p>
      </div>
    </li>
  );
}

// o dem (khung HUD): nhan + so
const Count = ({ label, n, dot }: { label: string; n: number; dot: string }) => (
  <p className="px-hud flex items-center gap-2 px-3 py-1.5 whitespace-nowrap">
    <span className="size-2.5 rounded-full" style={{ background: dot }} aria-hidden="true" />
    <span className="text-xs leading-none font-bold tracking-wider text-white/80 uppercase">{label}</span>
    <span className="font-pixel text-[1.6rem] leading-none text-white">{n}</span>
  </p>
);

const STATUS_TEXT: Record<LiveStatus | 'denied', string> = { connecting: 'Đang kết nối…', open: 'Trực tiếp', closed: 'Mất kết nối – đang thử lại', denied: 'Không có quyền xem' };

export function PresenterScreen({ liveUrl: url, qrUrl, onExit }: { liveUrl?: string; qrUrl?: string | false; onExit?: () => void }) {
  const [status, setStatus] = useState<LiveStatus | 'denied'>('connecting');
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    const sock = liveSocket(liveUrl(url), {
      // (noi lai) -> may chu gui lai ca danh sach + lich su hoat dong: thay the, khong cong don
      hello: send => { setEvents([]); send({ t: 'host' }); },
      onStatus: s => setStatus(cur => (cur === 'denied' ? cur : s)),
      onMsg: m => {
        if (m.t === 'error' && m.code === 'auth') { setStatus('denied'); sock.close(); }   // khong phai admin: dung, khong thu lai
        else if (m.t === 'players') setPlayers(m.players);
        else if (m.t === 'event') setEvents(ev => [m.event, ...ev].slice(0, 6));
      },
    });
    return () => sock.close();
  }, [url]);

  const link = useMemo(() => pageUrl(qrUrl || undefined), [qrUrl]);   // ma QR co dinh: link game
  const count = (s: PlayerStatus) => players.filter(p => p.status === s).length;
  const TOOL = 'px-btn px-btn-blue w-auto gap-2 px-5 py-2 text-base';

  return (
    <section id="presenter" className="relative h-dvh w-full overflow-hidden bg-black">
      <picture>
        <source media="(orientation: portrait)" srcSet={asset('bg/banner_mobile.webp')} />
        <img src={asset('bg/banner_pc.webp')} alt="" className="absolute inset-0 size-full scale-110 object-cover blur-sm" draggable="false" />
      </picture>
      {/* phong trinh chieu: anh man Start (ca team cung chay – "tap hop nguoi choi") lam mo + phu navy dam (sang dan ve giua) ->
          chi con khong khi, panel va chu noi ro khi chieu */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgb(11_29_77/.42),rgb(5_12_38/.8))]" />

      <div className="absolute inset-0 flex flex-col gap-5 overflow-y-auto p-safe-5 max-lg:gap-4 max-sm:p-safe-3 [@media(max-height:800px)]:gap-3 [@media(max-height:800px)]:p-safe-3">
        {/* thanh tren: ten game (trai) · trang thai ket noi + Thoat (giua) · logo Innocom (phai) */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <GameTitle as="div" className="w-[min(30vw,420px)]" />
          <nav aria-label="Điều khiển" className="flex flex-1 flex-wrap items-center justify-center gap-3 max-lg:order-last max-lg:basis-full">
            <p id="liveStatus" role="status" className="px-hud flex items-center gap-2 px-3 py-2 text-sm leading-none font-bold whitespace-nowrap text-white uppercase">
              <span className={`size-2.5 rounded-full ${status === 'open' ? 'animate-pulse bg-[#ff4d5e]' : status === 'closed' || status === 'denied' ? 'bg-[#ffb21c]' : 'bg-white/50'}`} aria-hidden="true" />
              {STATUS_TEXT[status]}
            </p>
            {onExit && <button id="exitBtn" className={TOOL} onClick={onExit}><Icon name="xMark" className="size-5" stroke={2.25} />Thoát</button>}
          </nav>
          <Logo height="h-[clamp(2.25rem,4vw,3.5rem)] drop-shadow-[0_4px_8px_rgb(6_10_28/.55)]" />
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(320px,0.9fr)_minmax(0,2fr)] gap-6 max-lg:grid-cols-1 max-lg:gap-4">
          {/* trai: ma QR vao phong */}
          <div className="px-panel flex flex-col items-center justify-center gap-5 px-7 py-6 text-center max-sm:px-4 max-sm:py-5 [@media(max-height:800px)]:gap-3 [@media(max-height:800px)]:py-4">
            <h2 className="font-pixel text-[2.1rem] leading-none tracking-[0.12em] text-brand-navy max-sm:text-[1.5rem]">QUÉT ĐỂ THAM GIA</h2>
            <QrFrame text={link} className="w-[min(100%,clamp(220px,calc(100dvh-440px),460px))] max-lg:w-[min(70vw,300px)]" />
            <ol className="flex flex-wrap justify-center gap-x-3.5 gap-y-1 text-base font-semibold text-px-panel">
              <li><span className="text-brand-red">1.</span> Quét mã</li>
              <li><span className="text-brand-red">2.</span> Nhập tên</li>
              <li><span className="text-brand-red">3.</span> Bắt đầu chơi</li>
            </ol>
            <p className="max-w-full text-xs font-semibold break-all text-px-panel/55">{link.replace(/^https?:\/\//, '')}</p>
          </div>

          {/* phai: danh sach nguoi choi + hoat dong gan day */}
          <div className="px-panel flex min-h-[420px] min-w-0 flex-col px-7 py-6 max-sm:px-4 max-sm:py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-pixel text-[2.1rem] leading-none tracking-[0.12em] text-brand-navy max-sm:text-[1.5rem]">NGƯỜI CHƠI</h2>
              <div className="flex flex-wrap gap-2.5">
                <Count label="Đang chơi" n={count('playing')} dot="#1fbf73" />
                <Count label="Hoàn thành" n={count('finished')} dot="#ffb21c" />
                <Count label="Đã rời" n={count('left')} dot="#9aa3b8" />
              </div>
            </div>
            {players.length
              ? <ul id="playerList" className="mt-5 grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(240px,1fr))] content-start gap-3 overflow-y-auto pr-1">
                  {players.map(p => <PlayerCard key={p.id} p={p} />)}
                </ul>
              : <div className="mt-5 grid flex-1 place-items-center rounded-xl border-2 border-dashed border-[#0b1d4d]/20 px-4 py-10 text-center">
                  <p className="text-lg font-semibold text-px-panel/60"><Icon name="qrCode" className="mx-auto mb-2 size-10 text-brand-blue" stroke={1.75} />Chưa có ai tham gia.<br />Mời mọi người quét mã bên cạnh.</p>
                </div>}
            {/* dong hoat dong: ai vao, ai roi, ai xong – moi nhat ben trai, mot hang, mo dan o mep phai */}
            <div className="mt-4 flex items-center gap-4 border-t-2 border-[#0b1d4d]/10 pt-3.5 max-sm:flex-col max-sm:items-start max-sm:gap-2">
              <p className="flex shrink-0 items-center gap-2 text-xs font-bold tracking-[0.14em] text-px-panel/60 uppercase">
                <span className={`size-2 rounded-full ${events.length ? 'animate-pulse bg-[#ff4d5e]' : 'bg-px-panel/25'}`} aria-hidden="true" />Hoạt động
              </p>
              <ul id="eventFeed" aria-live="polite" className="flex min-w-0 flex-1 gap-2.5 overflow-hidden [mask-image:linear-gradient(to_right,#000_82%,transparent)] max-sm:w-full">
                {events.length
                  ? events.map((e, i) => <EventChip key={`${e.at}-${e.id}-${e.kind}`} e={e} latest={i === 0} />)
                  : <li className="py-1.5 text-sm text-px-panel/50">Chưa có hoạt động – người chơi vào, rời, hoàn thành sẽ hiện ở đây.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
