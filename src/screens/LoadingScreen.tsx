// Man tai game (art redesign v4): nen duong chay (bg/loading_*), logo ROLECRAFT, nhan "DANG TAI...", thanh tien do,
// nhan vat chinh chay theo cac moc tren nen (toa do docs/redesign_v4/integration/loading_route_points.json).
// progress = tien do that (0..1); thanh hien chay toi da 0 -> 1 trong MIN_MS de man khong chop tat.
// onDone: co khi da nap xong -> goi khi thanh da day.
import { useRef } from 'react';
import { asset } from '../lib/ui.ts';
import { useRaf } from '../hooks/index.ts';
import { GameTitle } from '../components/GameTitle.tsx';

// % theo anh nen goc (PC 1920x1080, mobile 1080x1920) – tu chan phai qua cac waypoint toi cong dich
const ROUTE = {
  pc: { w: 1920, h: 1080, pts: [[18, 72], [39, 64], [51, 55], [64, 47], [71, 40], [75, 30]] },
  mobile: { w: 1080, h: 1920, pts: [[50, 87], [49, 68], [72, 58], [49, 51], [59, 44], [66, 33]] },
};
const MIN_MS = 1400;

// diem tren duong gap khuc tai t (0..1) + huong ngang cua doan dang chay
function pointAt(pts: number[][], t: number) {
  const f = Math.max(0, Math.min(1, t)) * (pts.length - 1), i = Math.min(Math.floor(f), pts.length - 2), r = f - i;
  const [a, b] = [pts[i], pts[i + 1]];
  return { x: a[0] + (b[0] - a[0]) * r, y: a[1] + (b[1] - a[1]) * r, left: b[0] < a[0] };
}

export function LoadingScreen({ progress, onDone }: { progress: number; onDone?: (() => void) | null }) {
  const runner = useRef<HTMLDivElement>(null), fill = useRef<HTMLDivElement>(null), bar = useRef<HTMLDivElement>(null);
  const shown = useRef(0), last = useRef(0), doneAt = useRef(0);

  useRaf(now => {
    const dt = last.current ? now - last.current : 0; last.current = now;
    shown.current = Math.min(progress, shown.current + dt / MIN_MS);
    const p = shown.current;
    if (fill.current) fill.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    bar.current?.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    if (onDone && p >= 1 && !doneAt.current) doneAt.current = now + 250;   // day thanh roi dung mot nhip
    if (doneAt.current && now >= doneAt.current) { doneAt.current = Infinity; onDone?.(); }

    // anh nen object-cover: doi % toa do anh goc -> px man hinh (anh bi cat hai mep khi ti le khac)
    const el = runner.current;
    if (!el) return;
    const W = innerWidth, H = innerHeight, r = H > W ? ROUTE.mobile : ROUTE.pc;
    const s = Math.max(W / r.w, H / r.h), ox = (W - r.w * s) / 2, oy = (H - r.h * s) / 2;
    const pt = pointAt(r.pts, p), [y0, y1] = [r.pts[0][1], r.pts.at(-1)![1]];
    const depth = 0.55 + 0.45 * (pt.y - y1) / (y0 - y1);                  // cang vao sau (len cao) cang nho
    el.style.transform = `translate(${ox + pt.x / 100 * r.w * s}px, ${oy + pt.y / 100 * r.h * s}px) translate(-50%, -88%) scale(${pt.left ? -depth : depth}, ${depth})`;
  });

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-px-panel select-none">
      <picture>
        <source media="(orientation: portrait)" srcSet={asset('bg/loading_mobile.webp')} />
        <img src={asset('bg/loading_pc.webp')} alt="" className="absolute inset-0 size-full object-cover" draggable="false" />
      </picture>
      <div className="absolute inset-0 bg-linear-to-b from-px-ink/45 via-transparent via-30% to-px-ink/60" />

      {/* runner: goc tai (0,0), JS dat transform theo duong chay; chan ~88% chieu cao anh */}
      <div ref={runner} className="pointer-events-none absolute top-0 left-0 w-[clamp(76px,min(11vw,19vh),190px)] origin-[50%_88%]">
        <img src={asset('characters/team/main_character_runner.webp')} alt="" draggable="false"
          className="w-full animate-bob drop-shadow-[0_6px_6px_rgb(6_10_28/.45)] [animation-duration:.36s]" />
      </div>

      <GameTitle as="div" className="absolute top-[calc(3vh+env(safe-area-inset-top))] left-1/2 w-[min(32vw,56vh,540px)] -translate-x-1/2 portrait:w-[min(80vw,420px)]" />

      <div className="absolute inset-x-0 bottom-[calc(4vh+env(safe-area-inset-bottom))] flex flex-col items-center gap-[1.5vh] px-4">
        <img src={asset('ui/loading/loading_label_dang_tai.webp')} alt="Đang tải" draggable="false"
          className="w-[min(30vw,48vh,440px)] animate-pulse portrait:w-[min(62vw,340px)]" />
        <div ref={bar} role="progressbar" aria-label="Tiến độ tải" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}
          className="relative w-[min(60vw,110vh,900px)] portrait:w-[min(88vw,520px)]">
          <img src={asset('ui/loading/progress_track_empty.webp')} alt="" className="block w-full" draggable="false" />
          {/* long rong cua track (do tu anh 2062x250: x 154–1908, y 66–178), fill cat theo % */}
          <div ref={fill} className="absolute inset-[27.5%_7.8%_30%_7.8%] rounded-[2px] bg-size-[100%_100%]"
            style={{ backgroundImage: `url("${asset('ui/loading/progress_fill_clip.webp')}")`, clipPath: 'inset(0 100% 0 0)' }} />
        </div>
      </div>
    </section>
  );
}
