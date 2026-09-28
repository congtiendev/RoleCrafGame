// Nut bat / tat tieng (luu localStorage, lib/sound.ts). sq = nut vuong chi co icon; khong thi nut dai co chu.
import { Icon } from './Icon.tsx';
import { setMuted, useMuted } from '../lib/sound.ts';

export function SoundToggle({ sq, className = '' }: { sq?: boolean; className?: string }) {
  const muted = useMuted(), label = muted ? 'Bật âm thanh' : 'Tắt âm thanh';
  const ic = <Icon name={muted ? 'speakerXMark' : 'speakerWave'} className={sq ? 'size-6 max-sm:size-5' : 'size-6'} stroke={2.25} />;
  return sq
    ? <button type="button" id="soundBtn" className={`px-btn px-btn-blue px-btn-sq ${className}`} title={label} aria-label={label} aria-pressed={!muted} onClick={() => setMuted(!muted)}>{ic}</button>
    : <button type="button" id="soundBtn" className={`px-btn px-btn-blue ${className}`} aria-pressed={!muted} onClick={() => setMuted(!muted)}>{ic}Âm thanh: {muted ? 'Tắt' : 'Bật'}</button>;
}
