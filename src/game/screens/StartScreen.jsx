// Man Start kieu menu game: nen lobby (PC ngang / mobile doc), logo ten game, khung menu,
// PM dung canh menu voi bong bong thoai.
import { useEffect, useLayoutEffect, useRef } from 'react';
import { asset, activeEl } from '../../shared/ui.js';
import { fitPm, drawPm, onPmReady } from '../pmSprite.js';
import { Icon } from '../components/Icon.jsx';
import { useKey, useRaf, useViewport } from '../components/hooks.js';

// Vi tri PM tren mobile (ti le man hinh): x = tam chan. PC tinh theo khung menu (layout()).
// Theo goi y bg/README.md: chan ~0.80–0.84H, cao 0.20–0.27H (PC) / 0.14–0.20H (mobile)
const MOBILE_X = 0.5;                          // dung truoc cua kinh, ngay tren ten game

const Bullet = () => <Icon name="chevronRight" className="size-4 mt-1.5 text-brand-red" stroke={2.5} />;

// onContinue: co ban luu thi bat nut Tiep tuc; onExit: ban nhung vao web khac -> them nut Thoat (dong game)
export function StartScreen({ onStart, onContinue, onExit }) {
  const cv = useRef(null), bubble = useRef(null), tail = useRef(null), title = useRef(null), nav = useRef(null);
  const guide = useRef(null), startBtn = useRef(null), t0 = useRef(performance.now());
  const vp = useViewport();

  // PC: PM dung ngay ben phai khung menu, chan ngang day khung; mobile: truoc cua kinh.
  function layout() {
    const c = cv.current, b = bubble.current, t = title.current, el = nav.current;
    if (!c) return;
    const W = innerWidth, H = innerHeight, mobile = H > W;
    // Vi tri CUOI cua khung menu: doc offsetTop/offsetHeight (khong tinh transform) de dang truot len (animate-rise)
    // van do dung; chieu ngang lay tu rect (hieu ung chi truot doc).
    const rect = el.getBoundingClientRect();
    const box = { top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight, right: rect.right };
    let left, top, w, h;
    if (mobile) {
      // tieu de ngay tren menu; PM dung ngay tren tieu de, cao toi da 0.17H va khong lan len vung logo (~0.16H)
      t.style.top = `${box.top - 14 - t.offsetHeight}px`;
      const foot = box.top - 14 - t.offsetHeight - 4;
      ({ w, h } = fitPm(c, Math.min(0.17 * H, foot - 0.16 * H)));
      c.hidden = h < 70;                                        // qua cho thi an PM
      left = W * MOBILE_X - w / 2; top = foot - h;
    } else {
      t.style.top = '';
      const short = H <= 560;                                    // dien thoai xoay ngang: PM nho, canh menu
      ({ w, h } = fitPm(c, (short ? 0.36 : 0.3) * H));
      left = Math.min(box.right + 0.03 * W, W - w - 0.02 * W);
      c.hidden = left < box.right + 8;                          // khong du cho ben phai menu thi an PM
      top = Math.min(box.bottom + 0.02 * H, 0.95 * H) - h;
    }
    Object.assign(c.style, { left: `${left}px`, top: `${top}px` });
    b.hidden = c.hidden || H <= 560 || left + w > W;
    // bong bong tren dau, lech phai; khong tran mep man hinh, khong de len khung menu (hep lai neu thieu cho),
    // duoi van chi vao dau PM
    const minLeft = mobile ? 16 : box.right + 12;
    b.style.maxWidth = ''; b.style.maxWidth = `${Math.min(b.offsetWidth, W - 16 - minLeft)}px`;
    const bw = b.offsetWidth, bh = b.offsetHeight, head = left + w * 0.62;
    const bl = Math.max(minLeft, Math.min(head - 24, W - bw - 16));
    Object.assign(b.style, { left: `${bl}px`, top: `${top - bh + 4}px` });
    tail.current.style.left = `${Math.max(12, Math.min(bw - 28, head - bl - 8))}px`;
  }
  useLayoutEffect(layout, [vp]);                                // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    onPmReady(layout);
    // font VT323 tai xong lam doi chieu cao tieu de -> do lai (neu man van con)
    document.fonts?.ready.then(() => cv.current?.isConnected && layout());
    startBtn.current?.focus({ preventScroll: true });
  }, []);                                                        // eslint-disable-line react-hooks/exhaustive-deps
  useRaf(now => { if (cv.current && !cv.current.hidden) drawPm(cv.current, now, t0.current); });

  // Dieu khien kieu game: len/xuong chon nut, Enter bam; mo trang la chon san "Bat dau"
  useKey(e => {
    if (guide.current?.open || !['ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const list = [...nav.current.querySelectorAll('.px-btn:not(:disabled)')], i = list.indexOf(activeEl());
    list[(i + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length]?.focus();
  });

  return (
    <section className="relative h-dvh w-full overflow-hidden select-none">
      <picture>
        <source media="(orientation: portrait)" srcSet={asset('bg/lobby_mobile.webp')} />
        <img src={asset('bg/lobby_pc.webp')} alt="" className="absolute inset-0 size-full object-cover" draggable="false" />
      </picture>
      {/* lam toi vien + mep tren/duoi de UI noi len; anh goc giu nguyen */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_35%,rgba(8,10,20,.72)_100%)]" />
      <div className="absolute inset-0 bg-linear-to-b from-px-ink/80 via-transparent to-px-ink/70 portrait:via-px-ink/10 portrait:to-px-ink/90" />

      {/* ten game */}
      <header ref={title} className="absolute inset-x-0 top-[calc(4vh+env(safe-area-inset-top))] flex animate-rise flex-col items-center px-4 text-center [@media(max-height:560px)]:top-[calc(2vh+env(safe-area-inset-top))]">
        <span className="art-btn art-red mb-5 px-4 pt-1.5 pb-2 font-pixel text-[1.5rem] leading-none tracking-[0.3em] [--bw:16px] [--bw2:18px] portrait:mb-4 portrait:text-[1.3rem] [@media(max-height:560px)]:mb-3 [@media(max-height:560px)]:text-[1.2rem]">ROLECRAFT</span>
        {/* PC: mot dong, nam tron tren vung tran nha (khong de logo Innocom); mobile: hai dong */}
        <h1 className="px-title text-[clamp(3.4rem,6.2vw,7rem)] portrait:text-[clamp(2.6rem,13vw,4.6rem)] [@media(max-height:560px)]:text-[2.6rem]">
          PM 60 NGÀY <span className="text-px-hi portrait:mt-2 portrait:block">THỬ VIỆC</span>
        </h1>
      </header>

      <canvas ref={cv} className="pointer-events-none absolute [image-rendering:pixelated]" aria-hidden="true" />
      <div ref={bubble} className="px-bubble pointer-events-none absolute w-max max-w-[19em] animate-bob px-3.5 py-2 portrait:hidden">
        Tiếp quản dự án dở dang, dẫn dắt team qua 4 giai đoạn và bảo vệ kết quả trước hội đồng.
        <span ref={tail} className="px-bubble-tail left-6" />
      </div>

      {/* khung menu */}
      <nav ref={nav} aria-label="Menu" className="px-panel absolute top-[46vh] left-1/2 w-[min(400px,86vw)] -translate-x-1/2 animate-rise px-11 py-6 [animation-delay:.15s] max-sm:px-8
           [@media(max-height:560px)]:top-auto [@media(max-height:560px)]:bottom-[calc(9vh+env(safe-area-inset-bottom))] [@media(max-height:560px)]:w-[min(760px,92vw)] [@media(max-height:560px)]:px-8 [@media(max-height:560px)]:py-4
           portrait:top-auto portrait:bottom-[calc(4vh+env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-5 [@media(max-height:560px)]:flex-row [@media(max-height:560px)]:gap-7 [@media(max-height:560px)]:pl-7">
          <button ref={startBtn} id="startBtn" className="px-btn px-btn-primary px-btn-hint" onClick={onStart}><Icon name="play" className="size-6" stroke={2.25} />Bắt đầu</button>
          <button id="contBtn" className="px-btn px-btn-blue" disabled={!onContinue} title={onContinue ? undefined : 'Chưa có bản lưu'} onClick={onContinue}>
            <Icon name="playPause" className="size-6" stroke={2.25} />Tiếp tục
          </button>
          <button id="guideBtn" className="px-btn px-btn-blue" onClick={() => guide.current.showModal()}><Icon name="bookOpen" className="size-6" stroke={2.25} />Hướng dẫn</button>
          {onExit && <button id="exitBtn" className="px-btn px-btn-blue" onClick={onExit}><Icon name="arrowLeft" className="size-6" stroke={2.25} />Thoát</button>}
        </div>
        <p className="mt-5 flex animate-blink items-center justify-center gap-1 text-center text-sm leading-tight font-bold tracking-wider text-brand-red portrait:hidden pointer-coarse:hidden [@media(max-height:560px)]:hidden">
          <Icon name="arrowUp" className="size-4" stroke={2.5} /><Icon name="arrowDown" className="size-4" stroke={2.5} /> CHỌN · ENTER XÁC NHẬN
        </p>
      </nav>

      <footer className="absolute inset-x-0 bottom-0 flex justify-between px-5 py-2.5 px-safe-5 pb-safe-2.5 text-xs text-white/60 portrait:hidden [@media(max-height:560px)]:py-1">
        <span>v0.2 · bản dựng thử</span><span>Innocom · RoleCraft PM60</span>
      </footer>

      <dialog ref={guide} id="guide" className="px-panel m-auto w-[min(600px,calc(100vw-40px))] p-8 backdrop:bg-black/65">
        <h2 className="mb-4 font-pixel text-[2.6rem] leading-[1.1] text-brand-red">CÁCH CHƠI</h2>
        <ul className="mb-6 space-y-2.5 [&>li]:flex [&>li]:gap-2 text-[1.05rem] leading-relaxed text-px-panel/90">
          <li><Bullet />60 ngày chia 4 giai đoạn: Khởi động, Hòa nhập, Bứt phá, Thu hoạch.</li>
          <li><Bullet />Mỗi tình huống chọn 1 trong 3 phương án. Không có đáp án đúng tuyệt đối — mỗi lựa chọn là một đánh đổi.</li>
          <li><Bullet />Quyết định làm thay đổi 7 chỉ số: quỹ, tiến độ, chất lượng, tinh thần team, niềm tin khách hàng, niềm tin quản lý, rủi ro.</li>
          <li><Bullet />Một số hậu quả không đến ngay mà quay lại ở giai đoạn sau.</li>
          <li><Bullet />Ngày 60, anh Minh và chị Hà (HR) quyết định: Pass xuất sắc, Pass, Gia hạn hoặc Không đạt.</li>
        </ul>
        <form method="dialog" className="flex justify-end"><button className="px-btn px-btn-primary w-auto px-8">Đã hiểu</button></form>
      </dialog>
    </section>
  );
}
