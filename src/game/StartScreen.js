// Man Start kieu menu game: nen lobby (PC ngang / mobile doc), logo ten game, khung menu,
// PM dung canh menu voi bong bong thoai.
import { $ } from '../shared/ui.js';
import { fitPm, drawPm, onPmReady } from './pmSprite.js';
import { icon } from '../shared/icons.js';

// Vi tri PM tren mobile (ti le man hinh): x = tam chan, foot = day chan. PC tinh theo khung menu (layout()).
// Theo goi y bg/README.md: chan ~0.80–0.84H, cao 0.20–0.27H (PC) / 0.14–0.20H (mobile)
const PLACE = {
  mobile: { x: 0.5 },                          // dung truoc cua kinh, ngay tren ten game (layout())
};

// UI pixel: khung/nut/tieu de dung class px-* (src/styles/components.css), font VT323 (src/fonts)

const BULLET = icon('chevronRight', 'size-4 mt-1.5 text-brand-red', { stroke: 2.5 });

const template = () => `
  <section class="relative h-dvh w-full overflow-hidden select-none">
    <picture>
      <source media="(orientation: portrait)" srcset="bg/lobby_mobile.webp">
      <img src="bg/lobby_pc.webp" alt="" class="absolute inset-0 size-full object-cover" draggable="false">
    </picture>
    <!-- lam toi vien + mep tren/duoi de UI noi len; anh goc giu nguyen -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_35%,rgba(8,10,20,.72)_100%)]"></div>
    <div class="absolute inset-0 bg-linear-to-b from-px-ink/80 via-transparent to-px-ink/70 portrait:via-px-ink/10 portrait:to-px-ink/90"></div>

    <!-- ten game -->
    <header id="startTitle" class="absolute inset-x-0 top-[calc(4vh+env(safe-area-inset-top))] flex animate-rise flex-col items-center px-4 text-center [@media(max-height:560px)]:top-[calc(2vh+env(safe-area-inset-top))]">
      <span class="art-btn art-red mb-5 px-4 pt-1.5 pb-2 font-pixel text-[1.5rem] leading-none tracking-[0.3em] [--bw:16px] [--bw2:18px] portrait:mb-4 portrait:text-[1.3rem] [@media(max-height:560px)]:mb-3 [@media(max-height:560px)]:text-[1.2rem]">ROLECRAFT</span>
      <!-- PC: mot dong, nam tron tren vung tran nha (khong de logo Innocom); mobile: hai dong -->
      <h1 class="px-title text-[clamp(3.4rem,6.2vw,7rem)] portrait:text-[clamp(2.6rem,13vw,4.6rem)] [@media(max-height:560px)]:text-[2.6rem]">
        PM 60 NGÀY <span class="text-px-hi portrait:mt-2 portrait:block">THỬ VIỆC</span>
      </h1>
    </header>

    <canvas id="startPm" class="pointer-events-none absolute [image-rendering:pixelated]" aria-hidden="true"></canvas>
    <div id="startBubble" class="px-bubble pointer-events-none absolute w-max max-w-[19em] animate-bob px-3.5 py-2 portrait:hidden">
      Tiếp quản dự án dở dang, dẫn dắt team qua 4 giai đoạn và bảo vệ kết quả trước hội đồng.
      <span id="bubbleTail" class="px-bubble-tail left-6"></span>
    </div>

    <!-- khung menu -->
    <nav aria-label="Menu" class="px-panel absolute top-[46vh] left-1/2 w-[min(400px,86vw)] -translate-x-1/2 animate-rise px-11 py-6 [animation-delay:.15s] max-sm:px-8
         [@media(max-height:560px)]:top-auto [@media(max-height:560px)]:bottom-[calc(9vh+env(safe-area-inset-bottom))] [@media(max-height:560px)]:w-[min(760px,92vw)] [@media(max-height:560px)]:px-8 [@media(max-height:560px)]:py-4
         portrait:top-auto portrait:bottom-[calc(4vh+env(safe-area-inset-bottom))]">
      <div class="flex flex-col gap-5 [@media(max-height:560px)]:flex-row [@media(max-height:560px)]:gap-7 [@media(max-height:560px)]:pl-7">
        <button id="startBtn" class="px-btn px-btn-primary px-btn-hint">${icon('play', 'size-6', { stroke: 2.25 })}Bắt đầu</button>
        <button id="contBtn" class="px-btn px-btn-blue" disabled title="Chưa có bản lưu">${icon('playPause', 'size-6', { stroke: 2.25 })}Tiếp tục</button>
        <button id="guideBtn" class="px-btn px-btn-blue">${icon('bookOpen', 'size-6', { stroke: 2.25 })}Hướng dẫn</button>
      </div>
      <p id="startNote" class="mt-4 hidden text-center text-sm leading-snug font-semibold text-brand-red" role="status"></p>
      <p class="mt-5 flex animate-blink items-center justify-center gap-1 text-center text-sm leading-tight font-bold tracking-wider text-brand-red portrait:hidden pointer-coarse:hidden [@media(max-height:560px)]:hidden">${icon('arrowUp', 'size-4', { stroke: 2.5 })}${icon('arrowDown', 'size-4', { stroke: 2.5 })} CHỌN · ENTER XÁC NHẬN</p>
    </nav>

    <footer class="absolute inset-x-0 bottom-0 flex justify-between px-5 py-2.5 px-safe-5 pb-safe-2.5 text-xs text-white/60 portrait:hidden [@media(max-height:560px)]:py-1">
      <span>v0.1 · bản dựng thử</span><span>Innocom · RoleCraft PM60</span>
    </footer>

    <dialog id="guide" class="px-panel m-auto w-[min(600px,calc(100vw-40px))] p-8 backdrop:bg-black/65">
      <h2 class="mb-4 font-pixel text-[2.6rem] leading-[1.1] text-brand-red">CÁCH CHƠI</h2>
      <ul class="mb-6 space-y-2.5 [&>li]:flex [&>li]:gap-2 text-[1.05rem] leading-relaxed text-px-panel/90">
        <li>${BULLET}60 ngày chia 4 giai đoạn: Khởi động, Hòa nhập, Bứt phá, Thu hoạch.</li>
        <li>${BULLET}Mỗi tình huống chọn 1 trong 3 phương án. Không có đáp án đúng tuyệt đối — mỗi lựa chọn là một đánh đổi.</li>
        <li>${BULLET}Quyết định làm thay đổi 7 chỉ số: quỹ, tiến độ, chất lượng, tinh thần team, niềm tin khách hàng, niềm tin quản lý, rủi ro.</li>
        <li>${BULLET}Một số hậu quả không đến ngay mà quay lại ở giai đoạn sau.</li>
        <li>${BULLET}Ngày 60, anh Minh và chị Hà (HR) quyết định: Pass xuất sắc, Pass, Gia hạn hoặc Không đạt.</li>
      </ul>
      <form method="dialog" class="flex justify-end"><button class="px-btn px-btn-primary w-auto px-8">Đã hiểu</button></form>
    </dialog>
  </section>`;

let cv, bubble, t0 = 0;

// PC: PM dung ngay ben phai khung menu, chan ngang day khung; mobile: truoc cua kinh.
function layout() {
  const W = innerWidth, H = innerHeight, mobile = H > W;
  // Vi tri CUOI cua khung menu: doc offsetTop/offsetHeight (khong tinh transform) de dang truot len (animate-rise)
  // van do dung; chieu ngang lay tu rect (hieu ung chi truot doc).
  const el = cv.parentElement.querySelector('nav'), rect = el.getBoundingClientRect(), title = $('startTitle');
  const nav = { top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight, right: rect.right };
  let left, top, w, h;
  if (mobile) {
    // tieu de ngay tren menu; PM dung ngay tren tieu de, cao toi da 0.17H va khong lan len vung logo (~0.16H)
    title.style.top = `${nav.top - 14 - title.offsetHeight}px`;
    const foot = nav.top - 14 - title.offsetHeight - 4;
    ({ w, h } = fitPm(cv, Math.min(0.17 * H, foot - 0.16 * H)));
    cv.hidden = h < 70;                                        // qua cho thi an PM
    left = W * PLACE.mobile.x - w / 2; top = foot - h;
  } else {
    title.style.top = '';
    const short = H <= 560;                                    // dien thoai xoay ngang: PM nho, canh menu
    ({ w, h } = fitPm(cv, (short ? 0.36 : 0.3) * H));
    cv.hidden = false;
    left = Math.min(nav.right + 0.03 * W, W - w - 0.02 * W);
    cv.hidden = left < nav.right + 8;                          // khong du cho ben phai menu thi an PM
    top = Math.min(nav.bottom + 0.02 * H, 0.95 * H) - h;
  }
  Object.assign(cv.style, { left: `${left}px`, top: `${top}px` });
  bubble.hidden = cv.hidden || H <= 560 || left + w > W;
  // bong bong tren dau, lech phai; khong tran mep man hinh, khong de len khung menu (hep lai neu thieu cho),
  // duoi van chi vao dau PM
  const minLeft = mobile ? 16 : nav.right + 12;
  bubble.style.maxWidth = ''; bubble.style.maxWidth = `${Math.min(bubble.offsetWidth, W - 16 - minLeft)}px`;
  const bw = bubble.offsetWidth, bh = bubble.offsetHeight, head = left + w * 0.62;
  const bl = Math.max(minLeft, Math.min(head - 24, W - bw - 16));
  Object.assign(bubble.style, { left: `${bl}px`, top: `${top - bh + 4}px` });
  $('bubbleTail').style.left = `${Math.max(12, Math.min(bw - 28, head - bl - 8))}px`;
}

// Tra ve { update, destroy } cho bo dieu huong man (game/main.js)
// onContinue: co ban luu thi bat nut Tiep tuc
export function mountStart(root, { onStart, onContinue }) {
  root.innerHTML = template();
  cv = $('startPm'); bubble = $('startBubble');
  layout(); onPmReady(layout);
  // font VT323 tai xong lam doi chieu cao tieu de -> do lai (neu man van con)
  document.fonts?.ready.then(() => cv?.isConnected && layout());
  $('guideBtn').onclick = () => $('guide').showModal();
  $('startBtn').onclick = () => onStart();
  if (onContinue) { const b = $('contBtn'); b.disabled = false; b.removeAttribute('title'); b.onclick = () => onContinue(); }
  // Dieu khien kieu game: len/xuong chon nut, Enter bam; mo trang la chon san "Bat dau"
  const items = () => [...root.querySelectorAll('nav .px-btn:not(:disabled)')];
  const onKey = e => {
    if ($('guide').open || !['ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const list = items(), i = list.indexOf(document.activeElement);
    list[(i + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length].focus();
  };
  addEventListener('resize', layout); addEventListener('keydown', onKey);
  $('startBtn').focus({ preventScroll: true });
  t0 = performance.now();
  return {
    update: now => { if (!cv.hidden) drawPm(cv, now, t0); },
    destroy: () => { removeEventListener('resize', layout); removeEventListener('keydown', onKey); cv = null; },
  };
}
