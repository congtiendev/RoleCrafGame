// Hop thoai "Cach choi" (mo bang ref.current.showModal()). Dung o man nhap ten (nut Huong dan tren thanh cong cu).
import type { RefObject } from 'react';
import { Icon } from './Icon.tsx';

const Bullet = () => <Icon name="chevronRight" className="size-4 mt-1.5 text-brand-red" stroke={2.5} />;

export function GuideDialog({ ref }: { ref: RefObject<HTMLDialogElement | null> }) {
  return (
    <dialog ref={ref} id="guide" className="px-panel m-auto w-[min(600px,calc(100vw-40px))] p-8 backdrop:bg-black/65">
      <h2 className="mb-4 font-pixel text-[2.6rem] leading-[1.1] text-brand-red">CÁCH CHƠI</h2>
      <ul className="mb-6 space-y-2.5 [&>li]:flex [&>li]:gap-2 text-[1.05rem] leading-relaxed text-px-panel/90">
        <li><Bullet />60 ngày chia 4 giai đoạn: Khởi động, Hòa nhập, Bứt phá, Thu hoạch.</li>
        <li><Bullet />Mỗi tình huống chọn 1 trong 3 phương án. Không có đáp án đúng tuyệt đối — mỗi lựa chọn là một đánh đổi.</li>
        <li><Bullet />Quyết định làm thay đổi 7 chỉ số: quỹ, tiến độ, chất lượng, tinh thần team, niềm tin khách hàng, niềm tin quản lý, rủi ro.</li>
        <li><Bullet />Một số hậu quả không đến ngay mà quay lại ở giai đoạn sau.</li>
        <li><Bullet />Ngày 60, anh Minh và chị Hà (HR) quyết định: Pass xuất sắc, Pass, Gia hạn hoặc Không đạt.</li>
      </ul>
      <form method="dialog" className="flex justify-end"><button className="px-btn px-btn-primary w-auto px-8">Đã hiểu</button></form>
    </dialog>
  );
}
