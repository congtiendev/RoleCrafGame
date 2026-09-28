// Nen sanh (bg/qr_join_*, redesign v4), 2 che do: (1) truoc man Start – Chi Ha (HR) chao don va trao the nhan vien thu viec;
// (2) sau man Start (#name) – doan gioi thieu game co ten. Logic ten (kiem tra, goi y, luu) o session.ts.
// Ten da cap tu API (web chu truyen prop player, GameApp ghi vao session) -> in san tren the, khong nhap lai. Khong co
// (trang game rieng / dev) -> the co o nhap ten, bat buoc.
// Thanh cong cu tren cung (chuyen tu man Start): Tiep tuc (co ban luu) · Huong dan · Thoat (ban nhung co onExit).
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { asset, modalOpen } from '../lib/ui.ts';
import { session, saveSession, checkName, suggestName } from '../game/session.ts';
import { Icon } from '../components/Icon.tsx';
import { Logo } from '../components/Logo.tsx';
import { GuideDialog } from '../components/GuideDialog.tsx';
import { Face, PmIdle } from '../components/canvases.tsx';
import { TapHint } from '../components/TierBadge.tsx';
import { useKey, useRaf, useViewport } from '../hooks/index.ts';
import { hold } from '../lib/sound.ts';
import { SoundToggle } from '../components/SoundToggle.tsx';

// Doan dan truyen mo dau (docs/KICH_BAN_ROLECRAFT_PM60.md – Level 1, boi canh). {name} = ten nguoi choi.
const INTRO = [
  'Ngày 1 · Công ty Innocom.',
  '{name}, bạn vừa nhận vị trí Project Manager thử việc.',
  'Anh Minh – Trưởng phòng – giao cho bạn một dự án đang làm dở: đã xong khoảng 40%, PM cũ nghỉ đột ngột, tài liệu bàn giao không đầy đủ.',
  'Khách hàng muốn xem demo sau 7 ngày. Bạn có một team 3 người và quỹ dự án 100.000.000 VND.',
  '60 ngày tới sẽ quyết định bạn có ở lại hay không.',
];
// Bieu cam chan dung PM theo tung cau dan truyen (sheet D): [chinh, gan giong]. Trong luc chu dang hien,
// luan phien hai bieu cam cung goc mat / cung khung (chi khac mieng, mat, hieu ung) -> nhu dang noi.
// Khong dung face_pm_* / face_formal_* vi khac trang phuc (the xanh, blazer), doi qua lai se giat.
const INTRO_FACE = [
  ['face_neutral', 'face_serious'],
  ['face_happy', 'face_relieved'],
  ['face_surprised', 'face_worried'],
  ['face_worried', 'face_stressed'],
  ['face_determined', 'face_confident'],
];
const TALK_MS = 220;                             // doi khung mat moi 220ms (~4.5 lan/giay)
const CPS = 45;                                  // ky tu / giay khi chu hien dan

// short: noi dung rut gon cho the ngang tren mobile (cot phai hep)
const Fact = ({ k, short, children }: { k: string; short?: string; children: ReactNode }) => (
  <><dt className="text-px-panel/60">{k}</dt><dd className="font-semibold">{short ? <><span className="sm:hidden">{short}</span><span className="max-sm:hidden">{children}</span></> : children}</dd></>
);

const TOOL = 'px-btn px-btn-blue w-auto gap-2.5 px-6 py-2.5 text-base max-sm:gap-2 max-sm:px-4 max-sm:text-[0.95rem]';

// Hai che do (GameApp):
//   card  – TRUOC man Start: Chi Ha chao + trao the. Co ten (API / da luu) -> the in san ten, bam Nhan the; chua co ->
//           bat buoc nhap ten (khong co Quay lai). Xong -> onCard (sang man Start)
//   intro – SAU man Start (bam Bat dau): doan gioi thieu game co ten, roi onEnter vao choi
// locked: ten tu API -> the khong cho sua ten
export function NameScreen({ card, locked, onCard, onEnter, onContinue, onExit }: {
  card?: boolean; locked?: boolean; onCard?: () => void; onEnter?: (name: string) => void; onContinue?: (() => void) | null; onExit?: () => void;
}) {
  const vp = useViewport(), narrow = vp.w < 640, guide = useRef<HTMLDialogElement>(null);
  const name = session.playerName || '';
  return (
    <section className="relative h-dvh w-full overflow-hidden">
      <picture>
        <source media="(orientation: portrait)" srcSet={asset('bg/qr_join_mobile.webp')} />
        <img src={asset('bg/qr_join_pc.webp')} alt="" className="absolute inset-0 size-full object-cover" draggable="false" />
      </picture>
      <div className="absolute inset-0 bg-px-ink/50" />
      {/* flex + m-auto: can giua nhung van cuon duoc tu mep tren khi khung cao hon man hinh */}
      <div className="absolute inset-0 flex overflow-y-auto p-safe-5 max-sm:p-safe-3">
        {/* mot cot giua man: hang nut tren (rong bang the) · the · hang nut duoi -> 4 nut doi xung tren mobile */}
        {/* doan mo dau: cot cao toi da bang man hinh (max-h-full), khung chu cuon ben trong (Intro) */}
        <div className={`m-auto flex w-full flex-col gap-5 max-sm:gap-3 ${card ? 'max-w-[780px]' : 'max-h-full max-w-[860px]'}`}>
        <nav aria-label="Menu" className="flex justify-end gap-5 max-sm:gap-3 max-sm:[&>button:not(.px-btn-sq)]:flex-1">
          <SoundToggle sq className="size-[52px] max-sm:size-[46px]" />
          {onContinue && <button id="contBtn" className={TOOL} onClick={onContinue}><Icon name="playPause" className="size-6" stroke={2.25} />Tiếp tục</button>}
          <button id="guideBtn" className={TOOL} onClick={() => guide.current!.showModal()}><Icon name="bookOpen" className="size-6" stroke={2.25} />Hướng dẫn</button>
          {onExit && <button id="exitBtn" className={TOOL} onClick={onExit}><Icon name="xMark" className="size-6" stroke={2.25} />Thoát</button>}
        </nav>
        {card
          ? <Welcome known={name} locked={locked} narrow={narrow} onDone={(n: string) => { session.playerName = n; saveSession(); onCard?.(); }} />
          : <Intro name={name} narrow={narrow} onEnter={() => onEnter?.(name)} />}
        </div>
      </div>
      <GuideDialog ref={guide} />
    </section>
  );
}

// Loi chao cua Chi Ha (HR) luc trao the. known = ten da cap tu API (web chu); khong co (trang game rieng / dev) -> xin ten
const hrLine = (known: string) => (known
  ? `Chào mừng ${known} đến với Innocom! Chị là Hà bên nhân sự. Đây là thẻ nhân viên thử việc của em – 60 ngày tới cố lên nhé.`
  : 'Chào mừng em đến với Innocom! Chị là Hà bên nhân sự. Em cho chị họ tên để in thẻ nhân viên nhé.');
const HR_FACE = ['face_warm', 'face_pleased'];                  // luan phien khi dang noi (nhep mieng)

// Chi Ha chao + trao the nhan vien: chu chay het -> the truot len (nhu duoc dua tay), nut Nhan the.
// known: ten in san tren the (khong nhap lai); rong: the co o nhap ten (kiem tra, goi y, luu o session.ts).
// locked: ten tu API (tai khoan web chu) -> khong sua trong game (doi o web chu); khong khoa (ten tu nhap, da luu) ->
// nut but chi canh ten chuyen the ve o nhap (dien san ten cu)
function Welcome({ known, locked, narrow, onBack, onDone }: { known: string; locked?: boolean; narrow: boolean; onBack?: () => void; onDone: (name: string) => void }) {
  const line = hrLine(known);
  const [value, setValue] = useState(session.playerName || ''), [error, setError] = useState('');
  const [editing, setEditing] = useState(false), printed = !!known && !editing;
  const [typed, setTyped] = useState(false), [face, setFace] = useState(HR_FACE[0]);
  const text = useRef<HTMLParagraphElement>(null), t0 = useRef(performance.now());
  const input = useRef<HTMLInputElement>(null), take = useRef<HTMLButtonElement>(null);
  const finish = () => { if (text.current) text.current.textContent = line; setFace('face_pleased'); setTyped(true); };
  useEffect(() => () => hold('typing', false, 'hr'), []);
  useRaf(now => {
    hold('typing', !typed && !modalOpen(), 'hr');                 // tieng go phim khi Chi Ha dang noi
    if (typed || !text.current) return;
    const n = Math.floor((now - t0.current) * CPS / 1000);
    if (n >= line.length) { finish(); return; }
    if (text.current.textContent!.length !== n) text.current.textContent = line.slice(0, n);
    const f = HR_FACE[Math.floor(now / TALK_MS) % 2]; if (f !== face) setFace(f);
  });
  useEffect(() => { if (typed) (printed ? take : input).current?.focus({ preventScroll: true }); }, [typed, editing]);   // eslint-disable-line react-hooks/exhaustive-deps
  // Esc = quay lai (trong hop thoai Huong dan: chi dong hop thoai); Enter/Space luc chu dang chay = hien het chu
  useKey(e => {
    if (modalOpen()) return;
    if (e.key === 'Escape') onBack?.();
    else if (!typed && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); finish(); }
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!typed) { finish(); return; }
    if (printed) { onDone(known); return; }
    const r = checkName(value);
    if (r.error !== undefined) { setError(r.error); input.current?.focus(); return; }
    onDone(r.name);
  };
  return (
    <form id="nameForm" noValidate onSubmit={submit} className="flex w-full animate-rise flex-col gap-5 max-sm:gap-3">
      {/* Chi Ha (HR): chan dung + bong bong thoai, bam vao = hien het chu */}
      <div className="flex items-start gap-4 max-sm:gap-2.5" onClick={() => !typed && finish()}>
        <figure className="flex shrink-0 flex-col items-center gap-1">
          <div className="gm-plate size-[92px] max-sm:size-[64px]"><div data-in="" className="place-items-center bg-[#e0a458]">
            <Face who="HA" face={face} size={narrow ? 52 : 76} />
          </div></div>
          <figcaption className="gm-tag gm-yellow px-1.5 pt-0.5 pb-1 text-[0.7rem] leading-none font-bold whitespace-nowrap uppercase">Chị Hà · HR</figcaption>
        </figure>
        <div className="px-bubble relative mt-1 min-h-[4.5rem] flex-1 px-4 py-3 max-sm:min-h-[4rem] max-sm:px-3 max-sm:py-2 max-sm:text-sm" aria-live="polite">
          <span aria-hidden="true" className="absolute top-5 -left-[9px] size-3.5 rotate-45 rounded-bl-[3px] border-b-[2.5px] border-l-[2.5px] border-[#0b1d4d] bg-white max-sm:top-4" />
          <p ref={text} />
        </div>
      </div>

      {/* the nhan vien: an cho toi khi Chi Ha noi xong (giu cho, khong nhay bo cuc) roi truot len nhu duoc trao tay (.card-hand) */}
      <div className={`px-panel px-8 py-7 max-sm:px-2.5 max-sm:py-4 ${typed ? 'card-hand' : 'invisible'}`}>
        <div className="flex items-center justify-between gap-4 max-sm:gap-3">
          <h2 className="font-pixel text-[1.9rem] leading-none tracking-[0.15em] whitespace-nowrap text-brand-navy max-sm:text-[1.2rem] max-sm:tracking-[0.1em]">THẺ NHÂN VIÊN</h2>
          {/* logo cong ty goc phai the */}
          <span className="shrink-0"><Logo tone="light" height="h-8 max-sm:h-5" /></span>
        </div>

        <div className="mt-7 grid grid-cols-[auto_1fr] items-start gap-x-8 max-sm:mt-3 max-sm:gap-x-3">
          {/* khung = the .gm-plate: long cao = khung - vien 4 - le 6 - day 10 -> vua PM fitPm 225/104px */}
          <div className="gm-plate h-[250px] w-[196px] max-sm:h-[129px] max-sm:w-[100px]"><div data-in="" className="place-items-end justify-center bg-[linear-gradient(#1c2b60_0_84%,#17244f_84%)]">
            <PmIdle height={narrow ? 104 : 225} />
          </div></div>

          <div className="min-w-0">
            {printed ? <>
              {/* ten in tren the: tu API (khoa, ghi "Theo tai khoan") hoac da nhap truoc do (nut but chi = sua) */}
              <p className="text-lg leading-none font-bold tracking-wide text-brand-red max-sm:text-xs">HỌ VÀ TÊN</p>
              <div className="mt-2.5 flex items-center gap-3 max-sm:mt-1 max-sm:gap-2">
                <p id="playerName" className="min-w-0 text-[1.9rem] leading-tight font-extrabold break-words text-px-panel max-sm:text-[1.15rem]">{known}</p>
                {!locked && (
                  <button type="button" id="editName" className="px-btn px-btn-blue px-btn-sq size-10 max-sm:size-8" title="Sửa tên" aria-label="Sửa tên"
                    onClick={() => { setValue(known); setError(''); setEditing(true); }}>
                    <Icon name="pencilSquare" className="size-5 max-sm:size-4" stroke={2.25} />
                  </button>
                )}
              </div>
              <p className="mt-2 mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 max-sm:mt-1 max-sm:mb-1.5">
                <span className="gm-tag gm-yellow px-2 pt-0.5 pb-1 text-xs leading-none font-bold uppercase max-sm:text-[0.62rem]">Thử việc · Ngày 1</span>
                {locked && <span className="inline-flex items-center gap-1 text-xs font-semibold text-px-panel/55 max-sm:text-[0.62rem]"><Icon name="lockClosed" className="size-3.5" stroke={2.25} />Theo tài khoản</span>}
              </p>
            </> : <>
            <label htmlFor="playerName" className="text-lg leading-none font-bold tracking-wide text-brand-red max-sm:text-xs">HỌ VÀ TÊN</label>
            <div className="mt-3 flex items-center gap-4 max-sm:mt-1.5 max-sm:gap-2">
              <input ref={input} id="playerName" className="px-input max-sm:rounded-[9px] max-sm:px-2.5 max-sm:py-1.5 max-sm:text-[0.95rem]" maxLength={24} autoComplete="off" spellCheck="false"
                placeholder="Nhập họ và tên" aria-describedby="nameErr" aria-invalid={error ? 'true' : undefined}
                value={value} onChange={e => { setValue(e.target.value); setError(''); }} />
              <button type="button" id="rollName" className="px-btn px-btn-blue px-btn-sq size-14 max-sm:size-9" title="Gợi ý tên ngẫu nhiên" aria-label="Gợi ý tên ngẫu nhiên"
                onClick={() => { setValue(suggestName(value.trim())); setError(''); input.current?.focus(); }}>
                <Icon name="sparkles" className="size-7 max-sm:size-5" stroke={2} />
              </button>
            </div>
            {/* mobile: khong giu cho dong loi khi trong -> the thap, dang ngang */}
            <p id="nameErr" className="mt-2 min-h-6 text-sm leading-tight font-semibold text-[#c0261f] max-sm:mt-1 max-sm:min-h-0 max-sm:text-[0.7rem] max-sm:empty:hidden" role="alert">{error}</p>
            </>}
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[0.95rem] text-px-panel/90 max-sm:mt-2 max-sm:gap-x-2 max-sm:gap-y-0.5 max-sm:text-[0.7rem] max-sm:leading-snug">
              <Fact k="Vị trí" short="PM thử việc">Project Manager (thử việc)</Fact>
              <Fact k="Quản lý" short="Anh Minh">Anh Minh – Trưởng phòng/PM Lead</Fact>
              <Fact k="Team" short="Huy · Nam · Lan">Huy (Backend) · Nam (Frontend) · Lan (BA/QA)</Fact>
              <Fact k="Thời hạn" short="60 ngày · 4 giai đoạn">60 ngày · 4 giai đoạn</Fact>
            </dl>
          </div>
        </div>
      </div>

      {/* dang ky (khong co onBack): chi mot nut Xac nhan, can phai */}
      <div className="flex justify-between gap-5 max-sm:gap-3">
        {onBack ? <button type="button" id="backBtn" className="px-btn px-btn-blue w-auto px-6 max-sm:flex-1 max-sm:px-3 max-sm:text-base" onClick={onBack}><Icon name="arrowLeft" className="size-6 max-sm:size-5" stroke={2.25} />Quay lại</button> : <span />}
        <button ref={take} type="submit" className={`px-btn px-btn-primary w-auto px-8 max-sm:flex-1 max-sm:px-3 max-sm:text-base ${typed ? 'px-btn-hint' : ''}`}>
          {printed ? 'Nhận thẻ' : 'Xác nhận'}<Icon name="arrowRight" className="size-6 max-sm:size-5" stroke={2.25} />
        </button>
      </div>
    </form>
  );
}

// Doan dan truyen: chu hien dan; Enter/bam = hien het doan; het doan -> nut vao game
function Intro({ name, narrow, onEnter }: { name: string; narrow: boolean; onEnter: () => void }) {
  const lines = INTRO.map(l => l.replace('{name}', name));
  const [done, setDone] = useState(false), [face, setFace] = useState(INTRO_FACE[0][0]);
  const paras = useRef<(HTMLParagraphElement | null)[]>([]), t0 = useRef(performance.now()), enter = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const finish = () => {
    if (done) return;
    paras.current.forEach((p, i) => { if (p) p.textContent = lines[i]; });
    setFace(INTRO_FACE.at(-1)![0]); setDone(true);
  };
  useEffect(() => { if (done) enter.current?.focus(); }, [done]);
  useKey(e => { if (!done && !modalOpen() && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); finish(); } });
  useEffect(() => () => hold('typing', false, 'intro'), []);
  useRaf(now => {
    hold('typing', !done && !modalOpen(), 'intro');               // tieng go phim khi doan mo dau dang chay
    if (done) return;
    let n = Math.floor((now - t0.current) * CPS / 1000), cur = -1;   // so ky tu da hien, cau dang go
    lines.forEach((l, i) => {
      const p = paras.current[i], k = Math.max(0, Math.min(l.length, n)); n -= l.length;
      if (p && (p.textContent ?? '').length !== k) p.textContent = l.slice(0, k);
      if (cur < 0 && k < l.length) cur = i;
    });
    if (cur >= 0) { const f = INTRO_FACE[cur][Math.floor(now / TALK_MS) % 2]; if (f !== face) setFace(f); }   // dang go -> nhep mieng
    // khung chu dai hon man hinh: cuon theo dong dang go
    const el = panel.current;
    if (el && el.scrollHeight > el.clientHeight) el.scrollTop = el.scrollHeight;
    if (n >= 0) finish();
  });
  // khung chu vua man hinh (min-h-0: co lai trong cot max-h-full), dai hon thi cuon ben trong;
  // goi y bo qua / nut vao game nam ngoai khung (khong bi cuon khuat)
  return (<>
    <section ref={panel} id="introPanel" data-tap={done ? undefined : ''} aria-live="polite" onClick={e => { if (!(e.target as HTMLElement).closest('button')) finish(); }}
      className="px-panel min-h-0 w-full overflow-y-auto overscroll-contain px-9 py-8 max-sm:px-6 max-sm:py-6">
      <p className="font-pixel text-[1.6rem] leading-none tracking-[0.2em] text-brand-red">MỞ ĐẦU</p>
      <div className="mt-5 grid grid-cols-[auto_1fr] items-start gap-7 max-sm:grid-cols-1 max-sm:justify-items-center max-sm:gap-4">
        <figure className="flex flex-col items-center gap-2">
          {/* khung = the .gm-plate: long = khung - vien/le -> vua faceSize 140/104 */}
          <div className="gm-plate h-[162px] w-[156px] max-sm:h-[126px] max-sm:w-[120px]"><div data-in="" className="place-items-center">
            <Face face={face} size={narrow ? 104 : 140} />
          </div></div>
          <figcaption className="max-w-[170px] text-center text-sm font-semibold text-brand-red">PM · {name}</figcaption>
        </figure>
        <div className="min-h-[13rem] space-y-3 text-[1.1rem] leading-relaxed max-sm:min-h-0 max-sm:text-base">
          {lines.map((l, i) => <p key={i} ref={el => { paras.current[i] = el; }} />)}
        </div>
      </div>
    </section>
    <div className="flex min-h-14 shrink-0 flex-col items-center justify-center text-center" onClick={() => finish()}>
      {/* thiet bi cam ung (pointer: coarse) -> "Cham de bo qua", co ban phim -> "Nhan Enter" */}
      {!done && <p className="animate-blink text-sm font-bold tracking-wider text-white/75 [text-shadow:0_1px_2px_rgb(0_0_0/.6)]"><TapHint skip /></p>}
      {done && (
        <button ref={enter} type="button" id="enterBtn" className="px-btn px-btn-primary px-btn-hint w-auto px-8 max-sm:w-full max-sm:px-3" onClick={onEnter}>
          Vào ngày đầu tiên<Icon name="arrowRight" className="size-6" stroke={2.25} />
        </button>
      )}
    </div>
  </>);
}
