// Trinh phat trong hop chi tiet mot hanh dong / o tinh
import { state } from '../../lib/state.ts';
import type { Frame } from '../../lib/spriteTypes.ts';
import type { Item } from './catalog.ts';

export const D: { open: boolean; playing: boolean; frames: Frame[]; i: number; fps: number; loop: boolean; k: number | undefined; t0: number } =
  { open: false, playing: true, frames: [], i: 0, fps: 8, loop: true, k: 1, t0: 0 };

export function openD(it: Item, frames: Frame[]) {
  const anim = 'frames' in it ? it : null;
  Object.assign(D, {
    open: true, playing: frames.length > 1, frames, i: -1,
    fps: anim ? anim.fps : 1, loop: anim ? anim.loop : true, k: anim ? anim.k : 1, t0: performance.now(),
  });
}
// Buoc tay: dung phat, tra ve chi so khung moi
export function stepIndex(d: number) {
  D.playing = false;
  return (D.i + d + D.frames.length) % D.frames.length;
}
// Tiep tuc phat tu khung dang dung
export const resync = () => { D.t0 = performance.now() - D.i * 1000 / (D.fps * state.speed); };
