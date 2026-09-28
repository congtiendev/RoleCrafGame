// Ten game: logo ROLECRAFT ngang + dai tieu de (khung HUD .px-hud) "Project Manager · 60 ngay thu viec" dinh lien day logo, rong bang logo.
// Dai de len mep duoi logo (ban goc bi cat day khien + con vach sot dong phu cu) -> che mep cat.
// Font pixel VT323 nhu o level HUD; co chu theo be rong logo (cqw), toi thieu 14px -> khoi rong toi thieu 320px de chu khong tran dai. className: be rong khoi (vd w-[min(36vw,620px)]).
import { asset } from '../lib/ui.ts';

export function GameTitle({ className = '', as: Tag = 'h1' }: { className?: string; as?: 'h1' | 'div' }) {
  return (
    <Tag className={`@container m-0 flex min-w-[320px] flex-col drop-shadow-[0_6px_10px_rgb(6_10_28/.55)] ${className}`}>
      <img src={asset('ui/brand/rolecraft_logo_horizontal.webp')} alt="RoleCraft" draggable="false" className="block w-full" />
      {/* khung .px-hud (cung o chi so / o level cua HUD man choi) */}
      <span className="px-hud relative -mt-[1.4%] block px-[2cqw] py-[max(6px,1.5cqw)] text-center font-pixel text-[max(14px,4.1cqw)] leading-[0.8] tracking-[0.1em] whitespace-nowrap text-white/90 uppercase">
        Project Manager · <span className="text-px-hi">60 ngày</span> thử việc
      </span>
    </Tag>
  );
}
