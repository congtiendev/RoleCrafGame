// Man nhap ten nhan vat: the nhan vien thu viec (pixel) tren nen lobby, sau do doan dan truyen mo dau co ten.
// Logic ten (kiem tra, goi y, luu) o session.js; man nay chi dung giao dien.
// presetName: web chu da biet ten nguoi choi (prop player) -> bo qua the nhap ten, vao thang doan mo dau.
import { useEffect, useRef, useState } from 'react';
import { asset } from '../../shared/ui.js';
import { session, saveSession, checkName, suggestName } from '../session.js';
import { Icon } from '../components/Icon.jsx';
import { Logo } from '../components/Logo.jsx';
import { Face, PmIdle } from '../components/canvases.jsx';
import { TapHint } from '../components/TierBadge.jsx';
import { useKey, useRaf, useViewport } from '../components/hooks.js';

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

const Fact = ({ k, children }) => <><dt className="text-px-panel/60">{k}</dt><dd className="font-semibold">{children}</dd></>;

export function NameScreen({ onBack, onEnter, presetName }) {
  const vp = useViewport(), narrow = vp.w < 640;
  const [name, setName] = useState(presetName || null);        // co ten = dang o doan mo dau
  return (
    <section className="relative h-dvh w-full overflow-hidden">
      <picture>
        <source media="(orientation: portrait)" srcSet={asset('bg/lobby_mobile.webp')} />
        <img src={asset('bg/lobby_pc.webp')} alt="" className="absolute inset-0 size-full object-cover" draggable="false" />
      </picture>
      <div className="absolute inset-0 bg-px-ink/65" />
      {/* flex + m-auto: can giua nhung van cuon duoc tu mep tren khi khung cao hon man hinh */}
      <div className="absolute inset-0 flex overflow-y-auto p-safe-5 max-sm:p-safe-3">
        {name
          ? <Intro name={name} narrow={narrow} onEnter={() => onEnter(name)} />
          : <NameForm narrow={narrow} onBack={onBack} onDone={n => { session.playerName = n; saveSession(); setName(n); }} />}
      </div>
    </section>
  );
}

function NameForm({ narrow, onBack, onDone }) {
  const [value, setValue] = useState(session.playerName || ''), [error, setError] = useState('');
  const input = useRef(null);
  useEffect(() => { input.current?.focus(); }, []);
  useKey(e => { if (e.key === 'Escape') onBack(); });
  const submit = e => {
    e.preventDefault();
    const { name, error: err } = checkName(value);
    if (err) { setError(err); input.current.focus(); return; }
    onDone(name);
  };
  return (
    <form id="nameForm" noValidate onSubmit={submit} className="px-panel m-auto w-[min(780px,100%)] animate-rise px-8 py-7 max-sm:px-6 max-sm:py-6">
      <div className="flex items-center justify-between gap-4 max-sm:flex-col-reverse max-sm:gap-3">
        <h2 className="font-pixel text-[1.9rem] leading-none tracking-[0.15em] whitespace-nowrap text-brand-navy max-sm:text-[1.6rem]">THẺ NHÂN VIÊN</h2>
        {/* logo cong ty goc phai the */}
        <span className="shrink-0"><Logo tone="light" /></span>
      </div>

      <div className="mt-7 grid grid-cols-[auto_1fr] items-center gap-8 max-sm:mt-5 max-sm:grid-cols-1 max-sm:justify-items-center max-sm:gap-5">
        {/* khung = the .gm-plate: long cao = khung - vien 4 - le 6 - day 10 -> vua PM fitPm 225/145px */}
        <div className="gm-plate h-[250px] w-[196px] max-sm:h-[172px] max-sm:w-[134px]"><div data-in="" className="place-items-end justify-center bg-[linear-gradient(#1c2b60_0_84%,#17244f_84%)]">
          <PmIdle height={narrow ? 145 : 225} />
        </div></div>

        <div className="w-full">
          <label htmlFor="playerName" className="text-lg leading-none font-bold tracking-wide text-brand-red">HỌ VÀ TÊN</label>
          <div className="mt-3 flex items-center gap-4">
            <input ref={input} id="playerName" className="px-input" maxLength={24} autoComplete="off" spellCheck="false"
              placeholder="VD: Nguyễn Khánh An" aria-describedby="nameErr" aria-invalid={error ? 'true' : undefined}
              value={value} onChange={e => { setValue(e.target.value); setError(''); }} />
            <button type="button" id="rollName" className="px-btn px-btn-blue px-btn-sq size-14" title="Gợi ý tên ngẫu nhiên" aria-label="Gợi ý tên ngẫu nhiên"
              onClick={() => { setValue(suggestName(value.trim())); setError(''); input.current.focus(); }}>
              <Icon name="sparkles" className="size-7" stroke={2} />
            </button>
          </div>
          <p id="nameErr" className="mt-3 min-h-6 text-sm font-semibold text-[#c0261f]" role="alert">{error}</p>
          <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[0.95rem] text-px-panel/90">
            <Fact k="Vị trí">Project Manager (thử việc)</Fact>
            <Fact k="Quản lý">Anh Minh – Trưởng phòng/PM Lead</Fact>
            <Fact k="Team">Huy (Backend) · Nam (Frontend) · Lan (BA/QA)</Fact>
            <Fact k="Thời hạn">60 ngày · 4 giai đoạn</Fact>
          </dl>
        </div>
      </div>

      <div className="mt-8 flex justify-between gap-5 max-sm:flex-col-reverse">
        <button type="button" id="backBtn" className="px-btn px-btn-blue w-auto px-6 max-sm:w-full" onClick={onBack}><Icon name="arrowLeft" className="size-6" stroke={2.25} />Quay lại</button>
        <button type="submit" className="px-btn px-btn-primary w-auto px-8 max-sm:w-full">Xác nhận<Icon name="arrowRight" className="size-6" stroke={2.25} /></button>
      </div>
    </form>
  );
}

// Doan dan truyen: chu hien dan; Enter/bam = hien het doan; het doan -> nut vao game
function Intro({ name, narrow, onEnter }) {
  const lines = INTRO.map(l => l.replace('{name}', name));
  const [done, setDone] = useState(false), [face, setFace] = useState(INTRO_FACE[0][0]);
  const paras = useRef([]), t0 = useRef(performance.now()), enter = useRef(null);
  const finish = () => {
    if (done) return;
    paras.current.forEach((p, i) => { if (p) p.textContent = lines[i]; });
    setFace(INTRO_FACE.at(-1)[0]); setDone(true);
  };
  useEffect(() => { if (done) enter.current?.focus(); }, [done]);
  useKey(e => { if (!done && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); finish(); } });
  useRaf(now => {
    if (done) return;
    let n = Math.floor((now - t0.current) * CPS / 1000), cur = -1;   // so ky tu da hien, cau dang go
    lines.forEach((l, i) => {
      const p = paras.current[i], k = Math.max(0, Math.min(l.length, n)); n -= l.length;
      if (p && p.textContent.length !== k) p.textContent = l.slice(0, k);
      if (cur < 0 && k < l.length) cur = i;
    });
    if (cur >= 0) { const f = INTRO_FACE[cur][Math.floor(now / TALK_MS) % 2]; if (f !== face) setFace(f); }   // dang go -> nhep mieng
    if (n >= 0) finish();
  });
  return (
    <section id="introPanel" data-tap={done ? undefined : ''} aria-live="polite" onClick={e => { if (!e.target.closest('button')) finish(); }}
      className="px-panel m-auto w-[min(860px,100%)] px-9 py-8 max-sm:px-6 max-sm:py-6">
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
      <div className="mt-7 flex flex-col items-center gap-3 text-center">
        {/* thiet bi cam ung (pointer: coarse) -> "Cham de bo qua", co ban phim -> "Nhan Enter" */}
        {!done && <p className="animate-blink text-sm font-bold tracking-wider text-px-panel/55"><TapHint skip /></p>}
        {done && (
          <button ref={enter} type="button" id="enterBtn" className="px-btn px-btn-primary px-btn-hint w-auto px-8 max-sm:w-full max-sm:px-3" onClick={onEnter}>
            Vào ngày đầu tiên<Icon name="arrowRight" className="size-6" stroke={2.25} />
          </button>
        )}
      </div>
    </section>
  );
}
