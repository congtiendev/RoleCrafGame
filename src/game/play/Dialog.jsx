// Hop thoai: chan dung (PM sheet D / NPC co sprite / huy hieu chu cai / chuong thong bao), ten + chuc danh, chu hien dan.
// Khung luon nam trong DOM (an bang `invisible`) vi san khau do mep tren khung de dat chan nhan vat.
// who: 'PM' | id NPC | 'SYS' (title = ten thay cho "Thong bao") | 'NARR' (dan truyen, chu nghieng)
import { useEffect, useRef } from 'react';
import { asset } from '../../shared/ui.js';
import { CAST } from '../level1.js';
import { npcAtlas } from '../npc.js';
import { Icon } from '../components/Icon.jsx';
import { Face } from '../components/canvases.jsx';
import { useRaf, useViewport } from '../components/hooks.js';

const CPS = 45;                                          // ky tu / giay khi chu hien dan
const SYS = { name: 'Thông báo', tint: 'var(--color-brand-blue)' };

// line = dong thoai dang hien (null = an); director.typing = { busy, finish } de cham / Enter hien het chu truoc
export function Dialog({ line, name, director, panelRef, onNext }) {
  const vp = useViewport(), size = vp.w < 640 || vp.h <= 560 ? 68 : 96;
  const text = useRef(null), typing = useRef(null);
  const isPm = line?.who === 'PM', isSys = line?.who === 'SYS';
  const npc = line && (CAST[line.who] || (isSys ? { ...SYS, name: line.title || SYS.name } : null));
  const face = !!line && (isPm || !!npcAtlas(line.who));
  const role = isPm ? 'PM thử việc' : npc?.role;

  useEffect(() => {
    if (!line) { typing.current = null; return; }
    typing.current = { text: line.text, t: performance.now(), done: false };
    text.current.textContent = '';
    director.typing = {
      busy: () => !!typing.current && !typing.current.done,
      finish: () => { if (typing.current) { typing.current.done = true; text.current.textContent = typing.current.text; } },
    };
  }, [line?.key]);                                               // eslint-disable-line react-hooks/exhaustive-deps
  useRaf(now => {
    const t = typing.current;
    if (!t || t.done) return;
    const n = Math.floor((now - t.t) * CPS / 1000);
    if (n >= t.text.length) { t.done = true; text.current.textContent = t.text; } else text.current.textContent = t.text.slice(0, n);
  });

  return (
    <div id="dlg" className={`${line ? '' : 'invisible'} absolute inset-x-0 bottom-0 z-10 flex justify-center p-4 pb-safe-4 px-safe-4 max-sm:p-2.5 max-sm:pb-safe-2.5 max-sm:px-safe-2.5 [@media(max-height:560px)]:p-2 [@media(max-height:560px)]:pb-safe-2 [@media(max-height:560px)]:px-safe-2`} aria-live="polite">
      <div ref={panelRef} data-tap="" className="px-panel relative grid min-h-[9.5rem] w-[min(1000px,100%)] grid-cols-[auto_1fr] items-start gap-5 px-6 py-5 max-sm:min-h-[10rem] max-sm:gap-3 max-sm:px-4 max-sm:py-4 [@media(max-height:560px)]:min-h-0 [@media(max-height:560px)]:py-3">
        {/* chan dung: khong khung, chi bo goc */}
        <div hidden={!isPm && !npc} className="grid size-[96px] shrink-0 place-items-center overflow-hidden rounded-2xl max-sm:size-[68px] max-sm:rounded-xl [@media(max-height:560px)]:size-[64px] [@media(max-height:560px)]:rounded-xl">
          {face && <Face who={isPm ? 'PM' : line.who} face={(isPm ? line.face : line.npcFace) || 'face_neutral'} size={size} />}
          {!face && npc && (
            <span className="grid size-full place-items-center text-[2.8rem] leading-none font-extrabold text-white max-sm:text-[2rem]" style={{ background: npc.tint }}>
              {isSys ? <Icon name="bellAlert" className="size-3/5" stroke={2} /> : npc.name.split(' ').at(-1)[0]}
            </span>
          )}
        </div>
        <div className="min-w-0 pr-10 max-sm:pr-11">       {/* chua cho nut ban tay o goc duoi-phai */}
          <p className="flex flex-wrap items-baseline gap-x-2 text-[1.1rem] leading-tight font-extrabold text-brand-red max-sm:text-base">
            {(isPm || npc) && <span>{(isPm ? name : npc.name).toUpperCase()}</span>}
            {(isPm || npc) && role && <span className="text-sm font-semibold text-px-panel/55 max-sm:hidden">{role}</span>}
          </p>
          <p ref={text} className={`mt-2 text-[1.15rem] leading-relaxed font-medium max-sm:text-base ${line && !isPm && !npc ? 'italic' : ''}`} />
        </div>
        {/* hinh con tro (ui/cursors/link) o goc duoi-phai chi vao card, go nhip; vong song (.tap-ripple) toa ra tai dau ngon tro */}
        <button type="button" id="dlgNext" onClick={onNext} className="group absolute right-0 bottom-0 grid size-16 place-items-center outline-none max-sm:size-14" title="Tiếp tục" aria-label="Tiếp tục hội thoại">
          <span className="relative size-10 max-sm:size-9">
            <span className="tap-ripple" /><span className="tap-ripple [animation-delay:.6s]" />
            <img src={asset('ui/cursors/link@2x.png')} alt="" className="relative size-full animate-tap" draggable="false" />
          </span>
        </button>
      </div>
    </div>
  );
}
