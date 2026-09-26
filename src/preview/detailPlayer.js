// Trinh phat trong hop chi tiet mot hanh dong / o tinh
import { state } from '../shared/state.js';

export const D = { open: false, playing: true, frames: [], i: 0, fps: 8, loop: true, k: 1, t0: 0 };

export function openD(it, frames, isAnim) {
  Object.assign(D, {
    open: true, playing: frames.length > 1, frames, i: -1,
    fps: isAnim ? it.fps : 1, loop: isAnim ? it.loop : true, k: isAnim ? it.k : 1, t0: performance.now(),
  });
}
// Buoc tay: dung phat, tra ve chi so khung moi
export function stepIndex(d) {
  D.playing = false;
  return (D.i + d + D.frames.length) % D.frames.length;
}
// Tiep tuc phat tu khung dang dung
export const resync = () => D.t0 = performance.now() - D.i * 1000 / (D.fps * state.speed);
