// Man Start (art redesign v4): nen bg/banner_* da ve san 8 nhan vat (PM o giua), logo ROLECRAFT tren cung,
// mot nut art "BAT DAU" o day man (vi tri theo docs/redesign_v4/integration/layout_presets.json).
// Tiep tuc / Huong dan / Thoat nam o man sau (NameScreen).
import { useEffect, useRef } from 'react';
import { asset } from '../lib/ui.ts';
import { useKey } from '../hooks/index.ts';
import { GameTitle } from '../components/GameTitle.tsx';

export function StartScreen({ onStart }: { onStart: () => void }) {
  const startBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => { startBtn.current?.focus({ preventScroll: true }); }, []);
  // Enter/Space o dau cung bam Bat dau (ke ca khi nut mat focus)
  useKey((e, t) => { if ((e.key === 'Enter' || e.key === ' ') && t.tagName !== 'BUTTON') { e.preventDefault(); onStart(); } });

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-px-panel select-none">
      <picture>
        <source media="(orientation: portrait)" srcSet={asset('bg/banner_mobile.webp')} />
        <img src={asset('bg/banner_pc.webp')} alt="" className="absolute inset-0 size-full object-cover" draggable="false" />
      </picture>
      {/* overlay nhe: phu toi 12% ca anh + quang toi mem sau logo (tren) va sau nut (day) de hai lop nay noi len; giua anh (nhan vat) giu sang */}
      <div className="absolute inset-0 bg-px-ink/12" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_48%_36%_at_50%_0%,rgb(6_10_28/.6),transparent),radial-gradient(ellipse_46%_30%_at_50%_100%,rgb(6_10_28/.65),transparent)] portrait:bg-[radial-gradient(ellipse_80%_28%_at_50%_0%,rgb(6_10_28/.6),transparent),radial-gradient(ellipse_85%_24%_at_50%_100%,rgb(6_10_28/.65),transparent)]" />

      <header className="absolute inset-x-0 top-[calc(3vh+env(safe-area-inset-top))] flex animate-rise flex-col items-center px-4 [@media(max-height:560px)]:top-[calc(2vh+env(safe-area-inset-top))]">
        <GameTitle className="w-[min(36vw,60vh,620px)] portrait:w-[min(84vw,440px)]" />
      </header>

      <nav aria-label="Menu" className="absolute inset-x-0 bottom-[calc(3vh+env(safe-area-inset-bottom))] flex animate-rise flex-col items-center gap-1.5 px-4 [animation-delay:.15s]">
        {/* nhip tho + vet sang: .start-cta / .start-shine (styles/game/effects.css) */}
        <button ref={startBtn} id="startBtn" aria-label="Bắt đầu" onClick={onStart}
          className="start-cta relative w-[clamp(220px,min(32vw,42vh),520px)] cursor-pointer outline-none transition-[scale,filter] duration-150 portrait:w-[min(76vw,440px)]">
          <img src={asset('ui/buttons/start_button_bat_dau.webp')} alt="" draggable="false" className="block w-full" />
          <span className="start-shine" style={{ maskImage: `url("${asset('ui/buttons/start_button_bat_dau.webp')}")`, WebkitMaskImage: `url("${asset('ui/buttons/start_button_bat_dau.webp')}")` }} />
        </button>
        {/* goi y phim ngay duoi nut, cung tam voi nut */}
        <p className="text-xs font-bold tracking-wider text-white/75 [text-shadow:0_1px_2px_rgb(0_0_0/.6)] portrait:hidden pointer-coarse:hidden [@media(max-height:560px)]:hidden">ENTER · BẮT ĐẦU</p>
      </nav>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-5 py-2.5 px-safe-5 pb-safe-2.5 text-xs text-white/70 portrait:hidden [@media(max-height:560px)]:hidden">
        <span>v0.2 · bản dựng thử</span>
        <span>Innocom · RoleCraft PM60</span>
      </footer>
    </section>
  );
}
