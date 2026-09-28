// Trang thai chung cua trang (tab, bo loc, toc do...)
export const state = { tab: 'anims', q: '', sheet: 'all', speed: 1, border: false, paused: false };

// Mot o dang chay: khung, toc do, lap, moc bat dau
export interface Playback { frames: unknown[]; fps: number; loop: boolean; t0: number }

const HOLD = 900;               // once: giu khung cuoi roi phat lai de xem

// p: { frames, fps, loop, t0 } -> chi so khung tai thoi diem now
export function frameAt(p: Playback, now: number) {
  const n = p.frames.length; if (n === 1) return 0;
  const step = 1000 / (p.fps * state.speed), t = Math.max(0, now - p.t0);   // rAF co the truyen now som hon t0
  if (p.loop) return Math.floor(t / step) % n;
  return Math.min(n - 1, Math.floor((t % (n * step + HOLD)) / step));
}
