// Bang tuy chon khi tam dung (nut goc phai HUD / phim Esc / an tab): tiep tuc, choi lai man nay, ve trang chu, thoat.
// <dialog> modal: chan cham / phim cua man choi (PlayScreen bo qua phim khi co modal). Esc = tiep tuc.
// "Choi lai man nay" / "Xoa du lieu choi" hoi xac nhan ngay trong bang (mat lua chon cua level / toan bo tien do).
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon.tsx';
import type { ReactNode, Ref } from 'react';
import type { IconName } from '../../lib/icons.ts';

// noi dung buoc xac nhan theo hanh dong
const ASK = {
  replay: { text: (lv: number) => `Chơi lại Level ${lv} từ đầu? Các lựa chọn trong level này sẽ mất.`, ic: 'arrowPath', yes: 'Chơi lại' },
  reset: { text: () => 'Xoá toàn bộ dữ liệu chơi? Tiến độ, lựa chọn, kết quả và tên đã nhập sẽ mất, không khôi phục được. Game quay về màn nhận thẻ nhân viên.', ic: 'trash', yes: 'Xoá dữ liệu' },
} as const;

export function PauseMenu({ level, day, canReplay, onResume, onReplay, onHome, onReset, onExit }: {
  level: { no: number; title: string }; day: number; canReplay: boolean;
  onResume: () => void; onReplay: () => void; onHome: () => void; onReset: () => void; onExit?: () => void;
}) {
  const dlg = useRef<HTMLDialogElement>(null), resume = useRef<HTMLButtonElement>(null), yes = useRef<HTMLButtonElement>(null);
  const [confirm, setConfirm] = useState<keyof typeof ASK | null>(null);
  useEffect(() => {
    dlg.current?.showModal();
    resume.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => { if (confirm) yes.current?.focus({ preventScroll: true }); }, [confirm]);

  return (
    <dialog ref={dlg} id="pauseMenu" aria-labelledby="pauseTitle"
      onCancel={e => { e.preventDefault(); if (confirm) setConfirm(null); else onResume(); }}
      className="px-panel m-auto w-[min(440px,calc(100vw-32px))] px-9 py-7 backdrop:bg-px-ink/70 max-sm:px-6 max-sm:py-6
        [@media(max-height:560px)]:w-[min(640px,calc(100vw-32px))] [@media(max-height:560px)]:py-4">
      <h2 id="pauseTitle" className="text-center font-pixel text-[2.4rem] leading-none tracking-[0.12em] text-brand-red [@media(max-height:560px)]:text-[1.9rem]">TẠM DỪNG</h2>
      <p className="mt-2 text-center text-sm font-semibold text-px-panel/60">Level {level.no} · {level.title} · Ngày {day}/60</p>

      {confirm ? (
        <div className="mt-6">
          <p className="text-center text-[1.05rem] leading-relaxed font-semibold text-px-panel [@media(max-height:560px)]:text-[0.95rem]">
            {ASK[confirm].text(level.no)}
          </p>
          <div className="mt-5 flex flex-col gap-4 [@media(max-height:560px)]:mt-3 [@media(max-height:560px)]:grid [@media(max-height:560px)]:grid-cols-2">
            <button ref={yes} className="px-btn px-btn-primary" onClick={confirm === 'reset' ? onReset : onReplay}>
              <Icon name={ASK[confirm].ic} className="size-6" stroke={2.25} />{ASK[confirm].yes}
            </button>
            <button className="px-btn px-btn-blue" onClick={() => setConfirm(null)}>Huỷ</button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4 [@media(max-height:560px)]:mt-4 [@media(max-height:560px)]:grid [@media(max-height:560px)]:grid-cols-2 [@media(max-height:560px)]:gap-3">
          <Item refEl={resume} primary ic="play" onClick={onResume}>Tiếp tục</Item>
          <Item ic="arrowPath" onClick={() => setConfirm('replay')} disabled={!canReplay}
            title={canReplay ? undefined : 'Bản lưu cũ chưa có điểm lưu đầu level'}>Chơi lại màn này</Item>
          <Item ic="home" onClick={onHome}>Về trang chủ</Item>
          {onExit && <Item ic="arrowRightStartOnRectangle" onClick={onExit}>Thoát</Item>}
          {/* hanh dong pha huy: nut art vang (canh bao; do da la nut chinh Tiep tuc), gon hon, tach khoi cac nut dieu huong */}
          <button id="resetBtn" type="button" onClick={() => setConfirm('reset')}
            className="px-btn px-btn-yellow col-span-2 mx-auto mt-1 w-auto gap-2 px-6 py-2 text-sm">
            <Icon name="trash" className="size-5" stroke={2.25} />Xoá dữ liệu chơi
          </button>
        </div>
      )}
      <p className="mt-5 text-center text-xs font-bold tracking-wider text-px-panel/45 pointer-coarse:hidden [@media(max-height:560px)]:hidden">ESC ĐỂ {confirm ? 'HUỶ' : 'TIẾP TỤC'}</p>
    </dialog>
  );
}

const Item = ({ ic, children, primary, refEl, ...rest }: {
  ic: IconName; children: ReactNode; primary?: boolean; refEl?: Ref<HTMLButtonElement>;
  onClick: () => void; disabled?: boolean; title?: string;
}) => (
  <button ref={refEl} className={`px-btn ${primary ? 'px-btn-primary' : 'px-btn-blue'}`} {...rest}>
    <Icon name={ic} className="size-6" stroke={2.25} />{children}
  </button>
);
