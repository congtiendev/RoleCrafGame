// Man ket noi dien thoai – truoc man nhan the, chi tren may tinh (GameApp: chuot + hover). May tinh la man hinh lon,
// dien thoai quet QR de lam tay cam: thao tac tren dien thoai, man hinh may tinh chuyen dong theo (dong bo realtime –
// can may chu realtime, lam sau; hien tai man chi hien ma QR va cho). Khong co dien thoai: "Choi tren may nay".
// Ma QR = link co dinh mo tren dien thoai (prop qrUrl; mac dinh trang hien tai), moi lan quet may chu tu sinh phien moi.
import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { modalOpen } from '../lib/ui.ts';
import { Icon } from '../components/Icon.tsx';
import { QrFrame } from '../components/QrCode.tsx';
import { useKey, useViewport } from '../hooks/index.ts';
import { HrSays, Lobby, useHrLine } from './lobby.tsx';
import { pageUrl } from '../live/client.ts';
import type { IconName } from '../lib/icons.ts';

const LINE = 'Chào mừng em đến với Innocom! Chị là Hà bên nhân sự. Em quét mã này bằng điện thoại để dùng điện thoại làm tay cầm: '
  + 'bấm trên điện thoại, màn hình lớn sẽ chạy theo. Không có điện thoại thì chơi luôn trên máy này cũng được nhé.';


const Step = ({ n, ic, children }: { n: number; ic: IconName; children: ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-blue text-white max-sm:size-8" aria-hidden="true">
      <Icon name={ic} className="size-5" stroke={2.25} />
    </span>
    <p className="pt-1.5 leading-snug max-sm:pt-1"><span className="font-bold text-brand-red">{n}. </span>{children}</p>
  </li>
);

export function QrScreen({ url, onNext, onExit }: { url?: string; onNext: () => void; onExit?: () => void }) {
  const vp = useViewport(), narrow = vp.w < 640;
  const hr = useHrLine(LINE, 'qr');
  const link = useMemo(() => pageUrl(url), [url]);
  const next = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (hr.typed) next.current?.focus({ preventScroll: true }); }, [hr.typed]);
  // Enter/Space luc chu dang chay = hien het chu (xong thi Enter bam nut dang focus)
  useKey(e => { if (!modalOpen() && !hr.typed && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); hr.finish(); } });
  return (
    <Lobby col="max-w-[860px]" onExit={onExit}>
      <div id="qrScreen" className="flex w-full animate-rise flex-col gap-5 max-sm:gap-3">
        <HrSays hr={hr} narrow={narrow} />

        {/* khung ket noi: an cho toi khi Chi Ha noi xong (giu cho) roi truot len nhu the nhan vien */}
        <div className={`px-panel px-8 py-7 max-sm:px-4 max-sm:py-5 ${hr.typed ? 'card-hand' : 'invisible'}`}>
          <div className="grid grid-cols-[auto_1fr] items-center gap-9 max-sm:grid-cols-1 max-sm:justify-items-center max-sm:gap-5">
            <QrFrame text={link} className="w-[248px] max-sm:w-[208px]" />
            <div className="min-w-0">
              <h2 className="font-pixel text-[1.9rem] leading-none tracking-[0.15em] text-brand-navy max-sm:text-center max-sm:text-[1.3rem] max-sm:tracking-[0.1em]">KẾT NỐI ĐIỆN THOẠI</h2>
              <ol className="mt-5 space-y-3 text-[1.05rem] text-px-panel max-sm:mt-4 max-sm:text-[0.95rem]">
                <Step n={1} ic="camera">Mở camera hoặc ứng dụng quét mã trên điện thoại.</Step>
                <Step n={2} ic="qrCode">Quét mã QR rồi mở đường link hiện ra.</Step>
                <Step n={3} ic="devicePhoneMobile">Thao tác trên điện thoại, màn hình này chuyển động theo.</Step>
              </ol>
              {/* trang thai ket noi: cho dien thoai (3 cham nhay) */}
              <p id="pairStatus" role="status" className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-brand-navy/10 px-4 py-2 text-sm font-bold text-brand-navy max-sm:mt-5">
                <span className="flex gap-1" aria-hidden="true">
                  {[0, 1, 2].map(i => <span key={i} className="size-1.5 animate-blink rounded-full bg-brand-blue" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </span>
                Đang chờ điện thoại kết nối…
              </p>
            </div>
          </div>
        </div>

        {/* khong dung dien thoai: choi tren may tinh -> man nhan the */}
        <div className="flex justify-end">
          <button ref={next} type="button" id="deskBtn" className={`px-btn px-btn-primary w-auto px-8 max-sm:flex-1 max-sm:px-3 max-sm:text-base ${hr.typed ? 'px-btn-hint' : ''}`} onClick={onNext}>
            <Icon name="computerDesktop" className="size-6 max-sm:size-5" stroke={2.25} />Chơi trên máy này<Icon name="arrowRight" className="size-6 max-sm:size-5" stroke={2.25} />
          </button>
        </div>
      </div>
    </Lobby>
  );
}
