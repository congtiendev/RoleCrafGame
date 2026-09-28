// Phan dung chung cua cac man o sanh (nen bg/qr_join_*): man QR (QrScreen), nhan the + doan mo dau (NameScreen).
//   Lobby   – nen + lop toi + cot giua man; thanh nut tren: am thanh · Tiep tuc (co ban luu) · Huong dan · Thoat (ban nhung co onExit)
//   useHrLine + HrSays – Chi Ha (HR) noi mot cau: chu hien dan, nhep mieng, tieng go phim; finish() = hien het chu
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { asset, modalOpen } from '../lib/ui.ts';
import { Icon } from '../components/Icon.tsx';
import { GuideDialog } from '../components/GuideDialog.tsx';
import { Face } from '../components/canvases.tsx';
import { SoundToggle } from '../components/SoundToggle.tsx';
import { useRaf } from '../hooks/index.ts';
import { hold } from '../lib/sound.ts';

export const TOOL = 'px-btn px-btn-blue w-auto gap-2.5 px-6 py-2.5 text-base max-sm:gap-2 max-sm:px-4 max-sm:text-[0.95rem]';
export const TALK_MS = 220;                      // doi khung mat moi 220ms (~4.5 lan/giay)
export const CPS = 45;                           // ky tu / giay khi chu hien dan

// col: class cot giua (be rong toi da, vd 'max-w-[780px]')
export function Lobby({ col, onContinue, onExit, children }: {
  col: string; onContinue?: (() => void) | null; onExit?: () => void; children: ReactNode;
}) {
  const guide = useRef<HTMLDialogElement>(null);
  return (
    <section className="relative h-dvh w-full overflow-hidden">
      <picture>
        <source media="(orientation: portrait)" srcSet={asset('bg/qr_join_mobile.webp')} />
        <img src={asset('bg/qr_join_pc.webp')} alt="" className="absolute inset-0 size-full object-cover" draggable="false" />
      </picture>
      <div className="absolute inset-0 bg-px-ink/50" />
      {/* flex + m-auto: can giua nhung van cuon duoc tu mep tren khi khung cao hon man hinh */}
      <div className="absolute inset-0 flex overflow-y-auto p-safe-5 max-sm:p-safe-3">
        {/* mot cot giua man: hang nut tren (rong bang the) · noi dung · hang nut duoi -> nut doi xung tren mobile */}
        <div className={`m-auto flex w-full flex-col gap-5 max-sm:gap-3 ${col}`}>
          <nav aria-label="Menu" className="flex justify-end gap-5 max-sm:gap-3 max-sm:[&>button:not(.px-btn-sq)]:flex-1">
            <SoundToggle sq className="size-[52px] max-sm:size-[46px]" />
            {onContinue && <button id="contBtn" className={TOOL} onClick={onContinue}><Icon name="playPause" className="size-6" stroke={2.25} />Tiếp tục</button>}
            <button id="guideBtn" className={TOOL} onClick={() => guide.current!.showModal()}><Icon name="bookOpen" className="size-6" stroke={2.25} />Hướng dẫn</button>
            {onExit && <button id="exitBtn" className={TOOL} onClick={onExit}><Icon name="xMark" className="size-6" stroke={2.25} />Thoát</button>}
          </nav>
          {children}
        </div>
      </div>
      <GuideDialog ref={guide} />
    </section>
  );
}

const HR_FACE = ['face_warm', 'face_pleased'];   // luan phien khi dang noi (nhep mieng)

// Chi Ha noi `line`; id = nguon tieng go phim (lib/sound.ts: hold). typed = da hien het chu.
export function useHrLine(line: string, id: string) {
  const [typed, setTyped] = useState(false), [face, setFace] = useState(HR_FACE[0]);
  const text = useRef<HTMLParagraphElement>(null), t0 = useRef(performance.now());
  const finish = () => { if (text.current) text.current.textContent = line; setFace('face_pleased'); setTyped(true); };
  useEffect(() => () => hold('typing', false, id), [id]);
  useRaf(now => {
    hold('typing', !typed && !modalOpen(), id);                  // tieng go phim khi Chi Ha dang noi
    if (typed || !text.current) return;
    const n = Math.floor((now - t0.current) * CPS / 1000);
    if (n >= line.length) { finish(); return; }
    if (text.current.textContent!.length !== n) text.current.textContent = line.slice(0, n);
    const f = HR_FACE[Math.floor(now / TALK_MS) % 2]; if (f !== face) setFace(f);
  });
  return { text, typed, face, finish };
}

// Chan dung Chi Ha + bong bong thoai; bam vao = hien het chu
export function HrSays({ hr, narrow }: { hr: ReturnType<typeof useHrLine>; narrow: boolean }) {
  return (
    <div className="flex items-start gap-4 max-sm:gap-2.5" onClick={() => !hr.typed && hr.finish()}>
      <figure className="flex shrink-0 flex-col items-center gap-1">
        <div className="gm-plate size-[92px] max-sm:size-[64px]"><div data-in="" className="place-items-center bg-[#e0a458]">
          <Face who="HA" face={hr.face} size={narrow ? 52 : 76} />
        </div></div>
        <figcaption className="gm-tag gm-yellow px-1.5 pt-0.5 pb-1 text-[0.7rem] leading-none font-bold whitespace-nowrap uppercase">Chị Hà · HR</figcaption>
      </figure>
      <div className="px-bubble relative mt-1 min-h-[4.5rem] flex-1 px-4 py-3 max-sm:min-h-[4rem] max-sm:px-3 max-sm:py-2 max-sm:text-sm" aria-live="polite">
        <span aria-hidden="true" className="absolute top-5 -left-[9px] size-3.5 rotate-45 rounded-bl-[3px] border-b-[2.5px] border-l-[2.5px] border-[#0b1d4d] bg-white max-sm:top-4" />
        <p ref={hr.text} />
      </div>
    </div>
  );
}
