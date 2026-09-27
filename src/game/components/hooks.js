// Hook dung chung: vong ve moi khung hinh, kich thuoc man hinh, media query, phim
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { evTarget } from '../../shared/ui.js';

// goi f(now) moi khung hinh khi component con gan (f moi nhat, khong khoi dong lai vong)
export function useRaf(f) {
  const cb = useRef(f); cb.current = f;
  useEffect(() => {
    let raf = requestAnimationFrame(function tick(now) { raf = requestAnimationFrame(tick); cb.current(now); });
    return () => cancelAnimationFrame(raf);
  }, []);
}

const subResize = f => { addEventListener('resize', f); return () => removeEventListener('resize', f); };
let size = null;
const readSize = () => (size && size.w === innerWidth && size.h === innerHeight ? size : (size = { w: innerWidth, h: innerHeight }));
// { w, h } man hinh, render lai khi doi kich thuoc / xoay may
export const useViewport = () => useSyncExternalStore(subResize, readSize);

export function useMedia(query) {
  const [m] = useState(() => matchMedia(query));
  return useSyncExternalStore(f => { m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, () => m.matches);
}

// phim tren window; handler(e, target) – target = phan tu that (trong ShadowRoot cua ban nhung)
export function useKey(handler, capture = false) {
  const cb = useRef(handler); cb.current = handler;
  useEffect(() => {
    const on = e => cb.current(e, evTarget(e));
    addEventListener('keydown', on, capture);
    return () => removeEventListener('keydown', on, capture);
  }, [capture]);
}
