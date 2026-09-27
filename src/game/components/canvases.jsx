// Canvas ve sprite dung chung giua cac man: PM dung cho (idle), chan dung PM / NPC, icon chi so (sheet F).
import { useLayoutEffect, useRef } from 'react';
import { fitPm, drawPm, onPmReady } from '../pmSprite.js';
import { drawFace } from '../portrait.js';
import { drawNpcFace } from '../npc.js';
import { drawIcon } from '../stage.js';
import { useRaf } from './hooks.js';

// PM dung cho, cao ~height px (doi theo man hinh: truyen height moi). onSize({ w, h }) bao kich thuoc CSS that.
export function PmIdle({ height, className = '', style, onSize }) {
  const ref = useRef(null), t0 = useRef(performance.now());
  useLayoutEffect(() => {
    const fit = () => { if (!ref.current) return; const size = fitPm(ref.current, height); onSize?.(size); };
    fit(); onPmReady(fit);
  }, [height]);                                                        // eslint-disable-line react-hooks/exhaustive-deps
  useRaf(now => { if (ref.current && !ref.current.hidden) drawPm(ref.current, now, t0.current); });
  return <canvas ref={ref} className={className} style={style} aria-hidden="true" />;
}

// Chan dung vua khit o size px: who = 'PM' (sheet D) | id NPC co sprite (npcAtlas)
export function Face({ who = 'PM', face = 'face_neutral', size, className = 'block' }) {
  const ref = useRef(null);
  // dat kich thuoc canvas ngay khi gan (layout effect): khung chua no do kich thuoc truoc khi ve (vd modal tu thu nho)
  useLayoutEffect(() => {
    if (!ref.current) return;
    if (who === 'PM') drawFace(ref.current, face, size); else drawNpcFace(ref.current, who, face, size);
  }, [who, face, size]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

// Icon chi so / emote tu sheet F (ten o trong sheet, vd 'stat_budget')
export function SheetIcon({ name, size }) {
  const ref = useRef(null);
  useLayoutEffect(() => { if (ref.current) drawIcon(ref.current, name, size); }, [name, size]);
  return <canvas ref={ref} className="shrink-0" aria-hidden="true" />;
}
