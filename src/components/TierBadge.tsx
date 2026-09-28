// Huy hieu xep loai (ui/badges): vong nguyet que vang / bac / dong theo muc, so (level / 60) o giua long trong suot
import { asset } from '../lib/ui.ts';
import type { Mood } from '../content/schema.ts';

const TIER_BADGE: Record<Mood, string> = { good: 'gold', mid: 'silver', bad: 'bronze' };
export const MOOD: Record<Mood, string> = { good: 'gm-green', mid: 'gm-yellow', bad: 'gm-red' };   // mau nhan xep loai (the phang .gm-tag)

export const TierBadge = ({ no, mood, className, numClass }: { no: number; mood: Mood; className?: string; numClass?: string }) => (
  <span className={`relative grid shrink-0 place-items-center ${className}`}>
    <img src={asset(`ui/badges/badge_laurel_${TIER_BADGE[mood]}.webp`)} alt="" className="absolute inset-0 size-full object-contain" draggable="false" />
    <span className={`relative -mt-[12%] font-pixel leading-none ${numClass}`}>{no}</span>
  </span>
);

// "NHAN ENTER / CHAM DE TIEP TUC" theo loai thiet bi (pointer: coarse = cam ung)
export const TapHint = ({ skip }: { skip?: boolean }) => (
  <>
    <span className="pointer-coarse:hidden">NHẤN ENTER ĐỂ {skip ? 'BỎ QUA' : 'TIẾP TỤC'}</span>
    <span className="hidden pointer-coarse:inline">CHẠM ĐỂ {skip ? 'BỎ QUA' : 'TIẾP TỤC'}</span>
  </>
);
