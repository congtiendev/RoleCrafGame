// Man nhap ten nhan vat: the nhan vien thu viec (pixel) tren nen lobby, sau do doan dan truyen mo dau co ten.
// Logic ten (kiem tra, goi y, luu) o session.js; man nay chi dung giao dien.
import { $, esc, asset } from '../shared/ui.js';
import { session, saveSession, checkName, suggestName } from './session.js';
import { fitPm, drawPm, onPmReady } from './pmSprite.js';
import { drawFace } from './portrait.js';
import { innocomLogo } from './brand/InnocomLogo.js';
import { icon } from '../shared/icons.js';


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

const FACT = (k, v) => `<dt class="text-px-panel/60">${k}</dt><dd class="font-semibold">${v}</dd>`;

const template = () => `
  <section class="relative h-dvh w-full overflow-hidden">
    <picture>
      <source media="(orientation: portrait)" srcset="${asset('bg/lobby_mobile.webp')}">
      <img src="${asset('bg/lobby_pc.webp')}" alt="" class="absolute inset-0 size-full object-cover" draggable="false">
    </picture>
    <div class="absolute inset-0 bg-px-ink/65"></div>

    <!-- flex + m-auto: can giua nhung van cuon duoc tu mep tren khi khung cao hon man hinh -->
    <div class="absolute inset-0 flex overflow-y-auto p-safe-5 max-sm:p-safe-3">
      <!-- the nhan vien -->
      <form id="nameForm" novalidate class="px-panel m-auto w-[min(780px,100%)] animate-rise px-8 py-7 max-sm:px-6 max-sm:py-6">
        <div class="flex items-center justify-between gap-4 max-sm:flex-col-reverse max-sm:gap-3">
          <h2 class="font-pixel text-[1.9rem] leading-none tracking-[0.15em] whitespace-nowrap text-brand-navy max-sm:text-[1.6rem]">THẺ NHÂN VIÊN</h2>
          <!-- logo cong ty goc phai the -->
          <span class="shrink-0">${innocomLogo({ tone: 'light' })}</span>
        </div>

        <div class="mt-7 grid grid-cols-[auto_1fr] items-center gap-8 max-sm:mt-5 max-sm:grid-cols-1 max-sm:justify-items-center max-sm:gap-5">
          <!-- khung = the .gm-plate: long cao = khung - vien 4 - le 6 - day 10 -> vua PM fitPm 225/145px -->
          <div class="gm-plate h-[250px] w-[196px] max-sm:h-[172px] max-sm:w-[134px]"><div data-in class="place-items-end justify-center bg-[linear-gradient(#1c2b60_0_84%,#17244f_84%)]">
            <canvas id="nameAvatar" aria-hidden="true"></canvas>
          </div></div>

          <div class="w-full">
            <label for="playerName" class="text-lg leading-none font-bold tracking-wide text-brand-red">HỌ VÀ TÊN</label>
            <div class="mt-3 flex items-center gap-4">
              <input id="playerName" class="px-input" maxlength="24" autocomplete="off" spellcheck="false"
                     placeholder="VD: Nguyễn Khánh An" aria-describedby="nameErr" value="${esc(session.playerName || '')}">
              <button type="button" id="rollName" class="px-btn px-btn-blue px-btn-sq size-14" title="Gợi ý tên ngẫu nhiên" aria-label="Gợi ý tên ngẫu nhiên">${icon('sparkles', 'size-7', { stroke: 2 })}</button>
            </div>
            <p id="nameErr" class="mt-3 min-h-6 text-sm font-semibold text-[#c0261f]" role="alert"></p>
            <dl class="mt-1 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[0.95rem] text-px-panel/90">
              ${FACT('Vị trí', 'Project Manager (thử việc)')}
              ${FACT('Quản lý', 'Anh Minh – Trưởng phòng/PM Lead')}
              ${FACT('Team', 'Huy (Backend) · Nam (Frontend) · Lan (BA/QA)')}
              ${FACT('Thời hạn', '60 ngày · 4 giai đoạn')}
            </dl>
          </div>
        </div>

        <div class="mt-8 flex justify-between gap-5 max-sm:flex-col-reverse">
          <button type="button" id="backBtn" class="px-btn px-btn-blue w-auto px-6 max-sm:w-full">${icon('arrowLeft', 'size-6', { stroke: 2.25 })}Quay lại</button>
          <button type="submit" class="px-btn px-btn-primary w-auto px-8 max-sm:w-full">Xác nhận${icon('arrowRight', 'size-6', { stroke: 2.25 })}</button>
        </div>
      </form>

      <!-- dan truyen mo dau -->
      <section id="introPanel" hidden class="px-panel m-auto w-[min(860px,100%)] px-9 py-8 max-sm:px-6 max-sm:py-6" aria-live="polite">
        <p class="font-pixel text-[1.6rem] leading-none tracking-[0.2em] text-brand-red">MỞ ĐẦU</p>
        <div class="mt-5 grid grid-cols-[auto_1fr] items-start gap-7 max-sm:grid-cols-1 max-sm:justify-items-center max-sm:gap-4">
          <figure class="flex flex-col items-center gap-2">
            <!-- khung = the .gm-plate: long = khung - vien/le -> vua faceSize 140/104 -->
            <div class="gm-plate h-[162px] w-[156px] max-sm:h-[126px] max-sm:w-[120px]"><div data-in class="place-items-center">
              <canvas id="introFace" class="block" aria-hidden="true"></canvas>
            </div></div>
            <figcaption id="introName" class="max-w-[170px] text-center text-sm font-semibold text-brand-red"></figcaption>
          </figure>
          <div id="introText" class="min-h-[13rem] space-y-3 text-[1.1rem] leading-relaxed max-sm:min-h-0 max-sm:text-base"></div>
        </div>
        <div class="mt-7 flex flex-col items-center gap-3 text-center">
          <!-- thiet bi cam ung (pointer: coarse) -> "Cham de bo qua", co ban phim -> "Nhan Enter" -->
          <p id="introHint" class="animate-blink text-sm font-bold tracking-wider text-px-panel/55">
            <span class="pointer-coarse:hidden">NHẤN ENTER ĐỂ BỎ QUA</span><span class="hidden pointer-coarse:inline">CHẠM ĐỂ BỎ QUA</span>
          </p>
          <button type="button" id="enterBtn" hidden class="px-btn px-btn-primary px-btn-hint w-auto px-8 max-sm:w-full max-sm:px-3">Vào ngày đầu tiên${icon('arrowRight', 'size-6', { stroke: 2.25 })}</button>
        </div>
        <p id="introNote" hidden class="mt-4 text-center text-sm font-semibold text-brand-red" role="status"></p>
      </section>
    </div>
  </section>`;

// Tra ve { update, destroy } cho bo dieu huong man (game/main.js)
export function mountName(root, { onBack, onEnter }) {
  root.innerHTML = template();
  const cv = $('nameAvatar'), input = $('playerName'), err = $('nameErr');
  const t0 = performance.now();
  const fit = () => fitPm(cv, innerWidth < 640 ? 145 : 225);
  fit(); onPmReady(fit);

  const showError = msg => { err.textContent = msg || ''; input.toggleAttribute('aria-invalid', !!msg); };
  input.oninput = () => showError('');
  $('rollName').onclick = () => { input.value = suggestName(input.value.trim()); showError(''); input.focus(); };
  $('backBtn').onclick = () => onBack();

  // Doan dan truyen: chu hien dan; Enter/bam = hien het doan; het doan -> nut vao game
  let intro = null;
  $('nameForm').onsubmit = e => {
    e.preventDefault();
    const { name, error } = checkName(input.value);
    if (error) { showError(error); input.focus(); return; }
    session.playerName = name; saveSession();
    $('nameForm').hidden = true; $('introPanel').hidden = false;
    const lines = INTRO.map(l => l.replace('{name}', name));
    intro = { lines, total: lines.join('').length, t: performance.now(), done: false, face: '' };
    $('introPanel').toggleAttribute('data-tap', true);      // cham de bo qua -> con tro ban tay
    $('introText').innerHTML = lines.map(() => '<p></p>').join('');
    $('introName').textContent = `PM · ${name}`;
    setFace(INTRO_FACE[0][0]);
  };
  // Bieu cam doi theo cau dang hien
  const faceSize = () => (innerWidth < 640 ? 104 : 140);      // vua long khung .gm-plate ben tren
  const setFace = f => { if (intro.face !== f) { intro.face = f; drawFace($('introFace'), f, faceSize()); } };
  const finishIntro = () => {
    intro.done = true; $('introPanel').toggleAttribute('data-tap', false);
    setFace(INTRO_FACE.at(-1)[0]);
    [...$('introText').children].forEach((p, i) => { p.textContent = intro.lines[i]; });
    $('introHint').hidden = true; $('enterBtn').hidden = false; $('enterBtn').focus();
  };
  const onKey = e => {
    if (intro && !intro.done && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); finishIntro(); }
    if (!intro && e.key === 'Escape') onBack();
  };
  $('introPanel').onclick = e => { if (intro && !intro.done && e.target.id !== 'enterBtn') finishIntro(); };
  $('enterBtn').onclick = () => onEnter(session.playerName);
  const onResize = () => { if (intro) { intro.face = ''; setFace(intro.done ? INTRO_FACE.at(-1)[0] : INTRO_FACE[0][0]); } };
  addEventListener('keydown', onKey); addEventListener('resize', onResize);
  input.focus();

  return {
    update(now) {
      drawPm(cv, now, t0);
      if (!intro || intro.done) return;
      let n = Math.floor((now - intro.t) * CPS / 1000), cur = -1;   // so ky tu da hien, cau dang go
      [...$('introText').children].forEach((p, i) => {
        const l = intro.lines[i], k = Math.max(0, Math.min(l.length, n)); n -= l.length;
        if (p.textContent.length !== k) p.textContent = l.slice(0, k);
        if (cur < 0 && k < l.length) cur = i;
      });
      if (cur >= 0) setFace(INTRO_FACE[cur][Math.floor(now / TALK_MS) % 2]);   // dang go -> nhep mieng
      if (n >= 0) finishIntro();
    },
    note(text) { const el = $('introNote'); el.textContent = text; el.hidden = false; },
    destroy() { removeEventListener('keydown', onKey); removeEventListener('resize', onResize); },
  };
}
