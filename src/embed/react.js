// Component React: <RoleCraftGame assetBase="/rolecraft/" onExit={() => setOpen(false)} />
// Gan vao = game mo (phu toan man hinh), go ra = game dong. Khong dung JSX de khong can plugin bien dich.
import { createElement, useEffect, useRef } from 'react';
import { mountRoleCraft } from './mount.js';

export function RoleCraftGame({ assetBase = '', storageKey, onExit, zIndex, lockScroll, className, style }) {
  const ref = useRef(null);
  const exit = useRef(onExit);
  exit.current = onExit;                                    // doi callback khong mount lai game
  useEffect(() => {
    const destroy = mountRoleCraft(ref.current, {
      assetBase, storageKey, zIndex, lockScroll,
      onExit: onExit ? () => exit.current?.() : undefined,
    });
    return destroy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetBase, storageKey, zIndex, lockScroll, !!onExit]);
  return createElement('div', { ref, className, style, 'data-rolecraft': '' });
}
