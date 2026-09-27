// Component React cho web chu: <RoleCraftGame assetBase="/rolecraft/assets/" onExit={() => setOpen(false)} ... />
// Gan vao = game mo (phu toan man hinh), go ra = game dong. Game render bang React cua web chu (react la peer dependency)
// trong mot root rieng nam trong ShadowRoot (CSS tach biet). Callback doi luc nao cung duoc, khong mount lai game.
import { useEffect, useRef } from 'react';
import { mountRoleCraft } from './mount.js';

const CALLBACKS = ['loadProgress', 'saveProgress', 'onChoice', 'onLevelComplete', 'onFinish', 'onExit'];

export function RoleCraftGame({ assetBase = '', storageKey, player, zIndex, lockScroll, className, style, ...cb }) {
  const host = useRef(null), latest = useRef(cb), game = useRef(null);
  latest.current = cb;
  useEffect(() => {
    // callback boc qua ref: luon goi ban moi nhat; chi truyen callback web chu co khai bao (onExit -> nut Thoat)
    const wrapped = Object.fromEntries(CALLBACKS.filter(k => cb[k]).map(k => [k, (...a) => latest.current[k]?.(...a)]));
    game.current = mountRoleCraft(host.current, { assetBase, storageKey, player, zIndex, lockScroll, ...wrapped });
    return () => { game.current?.destroy(); game.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetBase, storageKey, player?.name, zIndex, lockScroll]);
  return <div ref={host} className={className} style={style} data-rolecraft="" />;
}
