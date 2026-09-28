// Bang lua chon A/B/C cua tinh huong. Bam som hon 400ms sau khi hien thi bi bo qua (tranh cham nham tu cau thoai truoc).
import { useRef } from 'react';
import type { Choice as ChoiceData, Scenario } from '../../content/schema.ts';

export function Choice({ s, onPick }: { s: Scenario; onPick: (c: ChoiceData) => void }) {
  const shown = useRef(performance.now());
  return (
    <div id="choice" className="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 pb-safe-4 px-safe-4 max-sm:p-2.5 max-sm:pb-safe-2.5 max-sm:px-safe-2.5 [@media(max-height:560px)]:p-2 [@media(max-height:560px)]:pb-safe-2 [@media(max-height:560px)]:px-safe-2">
      <div className="px-panel w-[min(1000px,100%)] animate-rise px-6 py-5 max-sm:px-4 max-sm:py-4 [@media(max-height:560px)]:py-3">
        <p className="text-sm leading-none font-bold tracking-widest text-brand-red">{s.no} · QUYẾT ĐỊNH</p>
        <h2 id="chQ" className="mt-1.5 text-[1.3rem] leading-snug font-bold max-sm:text-[1.1rem]">{s.question}</h2>
        <div id="chList" className="mt-5 grid grid-cols-3 gap-5 max-md:grid-cols-1 max-md:gap-3.5 [@media(max-height:560px)]:mt-3 [@media(max-height:560px)]:grid-cols-3 [@media(max-height:560px)]:gap-3">
          {s.choices.map(c => (
            <button key={c.id} className="px-choice" data-id={c.id} onClick={() => { if (performance.now() - shown.current >= 400) onPick(c); }}>
              <span className="gm-tag gm-red grid size-9 shrink-0 place-items-center pb-0.5 text-[1.2rem] leading-none font-extrabold">{c.id}</span>
              <span className="min-w-0">
                <span className="block text-[1.05rem] leading-snug font-bold">{c.label}</span>
                <span className="mt-1 block text-sm leading-snug text-px-panel/70 [@media(max-height:700px)]:hidden">{c.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
