// Modal nhieu trang: tong ket level (2 trang) va bao cao thu viec cuoi (3 trang). Thiet ke "it chu": khung dung yen,
// noi dung can giua, nut dung rieng ngay duoi khung (khong nen). Cao hon man hinh: thu nho nhe ca cum (zoom, toi thieu
// MIN_ZOOM); van tran thi giu co chu, vung noi dung cuon trong khung (nut luon trong man). Doi trang = chay lai hieu ung mo panel.
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Icon } from '../../../components/Icon.tsx';
import { useViewport } from '../../../hooks/index.ts';
import { reportPage } from './ReportPage.tsx';
import { summaryPage } from './SummaryPage.tsx';
import { at } from './parts.tsx';
import type { ReactNode } from 'react';
import type { PagesState } from '../playTypes.ts';

const MIN_ZOOM = 0.88;

// pages = { kind: 'summary' | 'report', data, page }
export function Pages({ pages, onNext }: { pages: PagesState; onNext: () => void }) {
  const { kind, page } = pages;
  const content = pages.kind === 'summary' ? summaryPage(pages.data, page) : reportPage(pages.data, page);
  return <Modal key={`${kind}-${page}`} cta={content.cta} ctaAt={content.ctaAt} onNext={onNext}>{content.body}</Modal>;
}

function Modal({ children, cta, ctaAt, onNext }: { children: ReactNode; cta: ReactNode; ctaAt: number; onNext: () => void }) {
  const wrap = useRef<HTMLDivElement>(null), sum = useRef<HTMLDivElement>(null), next = useRef<HTMLButtonElement>(null), vp = useViewport();
  useLayoutEffect(() => {
    const w = wrap.current!, s = sum.current!;
    w.style.zoom = ''; w.style.maxHeight = 'none';
    const cs = getComputedStyle(s), avail = s.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const k = Math.min(1, avail / w.offsetHeight);
    // thu nho nhe toi da 12% (chu van doc duoc tren mobile); dai hon: giu co chu, noi dung cuon trong khung (thanh cuon mong)
    if (k < 1) w.style.zoom = Math.max(MIN_ZOOM, k).toFixed(3);
    if (k < MIN_ZOOM) w.style.maxHeight = '';
  }, [vp]);
  useEffect(() => { next.current?.focus({ preventScroll: true }); }, []);
  return (
    <div ref={sum} id="sum" className="absolute inset-0 z-20 flex bg-px-ink/55 p-safe-4 max-sm:p-safe-2.5">
      <div ref={wrap} id="sumWrap" className="m-auto flex max-h-full w-[min(920px,100%)] animate-rise flex-col items-center">
        <div className="px-panel flex min-h-0 w-full flex-col px-7 pt-6 pb-4 max-sm:px-4 max-sm:pt-5 max-sm:pb-3">
          <div data-scroll="" className="-mx-2 min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain px-2">{children}</div>
        </div>
        <div className="sm-foot">
          <button ref={next} id="sumNext" className="px-btn px-btn-primary animate-rise w-auto px-8 max-sm:w-full" style={at(ctaAt)} onClick={onNext}>
            {cta}<Icon name="arrowRight" className="size-6" stroke={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
