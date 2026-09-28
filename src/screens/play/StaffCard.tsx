// The nhan vien kieu tooltip: bam vao nhan vat trong canh (standee NPC / vung PM) -> the noi ngay tren dau nhan vat,
// khong phu toi nen, game van chay phia sau. Moi luc chi 1 the; bam lai nhan vat do / bam ra ngoai / Esc / nut X -> dong.
// The bam theo nhan vat moi khung hinh (PM co the dang di); khong du cho phia tren thi lat xuong duoi.
import { useEffect, useRef } from 'react';
import { CAST } from '../../content/cast.ts';
import { npcAtlas } from '../../canvas/npc.ts';
import { Icon } from '../../components/Icon.tsx';
import { Logo } from '../../components/Logo.tsx';
import { Face } from '../../components/canvases.tsx';
import { useKey, useRaf } from '../../hooks/index.ts';
import type { StaffState } from './playTypes.ts';

const AV = 70;      // co chan dung: vua long khung .gm-plate 88x104 (long ~74x85)
const GAP = 12;     // khoang cach the - dau nhan vat, px

// staff = { id: 'PM' | id NPC, anchor: phan tu nhan vat }; pm = { name, team, day } cho the cua nguoi choi
export function StaffCard({ staff, pm, onClose }: {
  staff: StaffState; pm: { name: string; team: string; day: number }; onClose: () => void;
}) {
  const box = useRef<HTMLDivElement>(null), { id, anchor } = staff;
  const isPm = id === 'PM', c = CAST[id];
  const p: { name: string; role: string; desc: string; tint?: string; client?: boolean; facts: [string, string][] } = isPm
    ? { name: pm.name, role: 'Project Manager (thử việc)', desc: 'Tiếp quản dự án và ra quyết định trong 60 ngày thử việc.',
      facts: [['Quản lý', 'Anh Minh – Trưởng phòng/PM Lead'], ['Team', pm.team], ['Thử việc', `Ngày ${pm.day} / 60`]] }
    : { name: c.name, role: c.role, desc: c.desc, tint: c.tint, client: c.client,
      facts: [['Đơn vị', c.client ? 'Khách hàng của dự án' : 'Innocom · Team dự án']] };
  const hasFace = isPm || !!npcAtlas(id);

  // can giua tren dau nhan vat, ep trong man hinh
  useRaf(() => {
    const d = box.current;
    if (!d) return;
    if (!anchor.isConnected) { onClose(); return; }                // doi canh: nhan vat bien mat
    const r = anchor.getBoundingClientRect(), w = d.offsetWidth, h = d.offsetHeight;
    const x = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    let y = r.top - h - GAP;
    if (y < 8) y = Math.min(innerHeight - h - 8, r.bottom + GAP);
    Object.assign(d.style, { left: `${x}px`, top: `${y}px` });
  });
  // bam ra ngoai the / nhan vat -> dong (composedPath: trong ShadowRoot cua ban nhung e.target chi la host)
  useEffect(() => {
    const onDown = (e: PointerEvent) => { const path = e.composedPath(); if (!path.includes(box.current!) && !path.includes(anchor)) onClose(); };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [anchor, onClose]);
  useKey(e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }, true);

  return (
    <div ref={box} role="dialog" aria-label={`Thẻ ${p.client ? 'khách hàng' : 'nhân viên'}: ${p.name}`}
      className="px-panel fixed z-40 m-0 w-[min(440px,calc(100vw-24px))] animate-rise px-5 py-4 text-px-panel max-sm:px-4 max-sm:py-3">
      <div className="flex items-center gap-3">
        <span className="art-btn art-red inline-block px-2.5 pt-1 pb-1.5 font-pixel text-[1.1rem] leading-none tracking-[0.15em] whitespace-nowrap">{p.client ? 'THẺ KHÁCH HÀNG' : 'THẺ NHÂN VIÊN'}</span>
        {!p.client && <span className="ml-auto shrink-0 pr-5 max-sm:hidden"><Logo tone="light" height="h-5" /></span>}
      </div>
      {/* nut dong do gan de len goc tren-phai card: lech am = do day vien (.px-panel 24/13px, mobile 19/11px) + nua nut */}
      <button type="button" className="px-btn px-btn-primary px-btn-sq absolute -top-[34px] -right-[26px] size-10 max-sm:-top-[29px] max-sm:-right-[23px]" aria-label="Đóng thẻ" title="Đóng" onClick={onClose}>
        <Icon name="xMark" className="size-5" stroke={3} />
      </button>
      <div className="mt-3 grid grid-cols-[auto_1fr] items-start gap-4">
        <div className="gm-plate h-[104px] w-[88px] [--f:6px]"><div data-in="" className="place-items-center" style={{ background: p.tint || '#1c2b60' }}>
          {hasFace ? <Face who={isPm ? 'PM' : id} size={AV} /> : <Icon name="user" className="size-11 text-white/90" stroke={1.75} />}
        </div></div>
        <div className="min-w-0">
          <h2 className="text-[1.25rem] leading-tight font-black">{p.name}</h2>
          <p className="mt-0.5 text-sm font-extrabold text-brand-red">{p.role}</p>
          <p className="mt-1.5 text-[0.85rem] leading-snug font-semibold text-px-panel/85">{p.desc}</p>
          <dl className="mt-2 border-t border-px-panel/15 pt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.85rem] leading-snug text-px-panel/90">
            {p.facts.map(([k, v]) => <Fact key={k} k={k} v={v} />)}
          </dl>
        </div>
      </div>
    </div>
  );
}
const Fact = ({ k, v }: { k: string; v: string }) => <><dt className="font-semibold text-px-panel/65">{k}</dt><dd className="font-bold">{v}</dd></>;
