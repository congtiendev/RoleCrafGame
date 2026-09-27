// The nhan vien kieu tooltip: bam vao nhan vat trong canh (standee NPC / vung PM) -> the noi ngay tren dau nhan vat,
// khong phu toi nen, game van chay phia sau. Moi luc chi 1 the; bam lai nhan vat do / bam ra ngoai / Esc / nut X -> dong.
// The bam theo nhan vat moi khung hinh (PM co the dang di); khong du cho phia tren thi lat xuong duoi.
import { esc, portal } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { innocomLogo } from './brand/InnocomLogo.js';
import { drawFace } from './portrait.js';

const FACT = (k, v) => `<dt class="font-semibold text-px-panel/65">${k}</dt><dd class="font-bold">${esc(v)}</dd>`;
const AV = 70;      // co chan dung PM, px: vua long khung .gm-plate 88x104 (long ~74x85)
const GAP = 12;     // khoang cach the - dau nhan vat, px
let cur = null;     // { dlg, anchor, raf, onDown, onKey }

export function closeStaffCard() {
  if (!cur) return;
  const c = cur; cur = null;
  cancelAnimationFrame(c.raf);
  document.removeEventListener('pointerdown', c.onDown, true);
  removeEventListener('keydown', c.onKey, true);
  c.dlg.close(); c.dlg.remove();
}

// p: { name, role (chuc danh), desc (1 cau mo ta), tint? (NPC: mau the tam), face? (PM: ten bieu cam sheet D),
//      avatar? (NPC co sprite: (canvas, size) => ve chan dung), client? (khach hang),
//      facts: [[nhan, gia tri]] – chi thong tin dang du lieu (don vi, quan ly...), khong nhet mo ta vao day }
// anchor: phan tu nhan vat (standee / vung bam PM) de dat the len tren
export function openStaffCard(p, anchor) {
  const same = cur?.anchor === anchor;
  closeStaffCard();
  if (same) return;                                   // bam lai dung nhan vat dang mo -> chi dong

  const dlg = document.createElement('dialog');
  dlg.className = 'px-panel fixed z-40 m-0 w-[min(440px,calc(100vw-24px))] animate-rise px-5 py-4 max-sm:px-4 max-sm:py-3';
  dlg.setAttribute('aria-label', `Thẻ ${p.client ? 'khách hàng' : 'nhân viên'}: ${p.name}`);
  dlg.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="art-btn art-red inline-block px-2.5 pt-1 pb-1.5 font-pixel text-[1.1rem] leading-none tracking-[0.15em] whitespace-nowrap">${p.client ? 'THẺ KHÁCH HÀNG' : 'THẺ NHÂN VIÊN'}</span>
      ${p.client ? '' : `<span class="ml-auto shrink-0 pr-5 max-sm:hidden">${innocomLogo({ tone: 'light', height: 'h-5' })}</span>`}
    </div>
    <!-- nut dong do gan de len goc tren-phai card: lech am = do day vien (.px-panel 24/13px, mobile 19/11px) + nua nut -->
    <button type="button" data-close class="px-btn px-btn-primary px-btn-sq absolute -top-[34px] -right-[26px] size-10 max-sm:-top-[29px] max-sm:-right-[23px]" aria-label="Đóng thẻ" title="Đóng">${icon('xMark', 'size-5', { stroke: 3 })}</button>
    <div class="mt-3 grid grid-cols-[auto_1fr] items-start gap-4">
      <div class="gm-plate h-[104px] w-[88px] [--f:6px]"><div data-in class="place-items-center" ${p.tint ? `style="background:${p.tint}"` : 'style="background:#1c2b60"'}>
        ${p.face || p.avatar ? '<canvas aria-hidden="true"></canvas>' : icon('user', 'size-11 text-white/90', { stroke: 1.75 })}
      </div></div>
      <div class="min-w-0">
        <h2 class="text-[1.25rem] leading-tight font-black">${esc(p.name)}</h2>
        <p class="mt-0.5 text-sm font-extrabold text-brand-red">${esc(p.role)}</p>
        <p class="mt-1.5 text-[0.85rem] leading-snug font-semibold text-px-panel/85">${esc(p.desc)}</p>
        <dl class="mt-2 border-t border-px-panel/15 pt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.85rem] leading-snug text-px-panel/90">${p.facts.map(([k, v]) => FACT(k, v)).join('')}</dl>
      </div>
    </div>`;
  portal().append(dlg);
  if (p.avatar) p.avatar(dlg.querySelector('canvas'), AV);
  else if (p.face) drawFace(dlg.querySelector('canvas'), p.face, AV);
  dlg.show();

  // can giua tren dau nhan vat, ep trong man hinh
  const place = () => {
    if (!anchor.isConnected) return closeStaffCard();  // doi canh: nhan vat bien mat
    const r = anchor.getBoundingClientRect(), w = dlg.offsetWidth, h = dlg.offsetHeight;
    const x = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    let y = r.top - h - GAP;
    if (y < 8) y = Math.min(innerHeight - h - 8, r.bottom + GAP);
    Object.assign(dlg.style, { left: `${x}px`, top: `${y}px` });
    cur.raf = requestAnimationFrame(place);
  };
  // composedPath: nghe tren document thi e.target cua cham trong ShadowRoot (ban nhung) chi la host
  const onDown = e => { const p = e.composedPath(); if (!p.includes(dlg) && !p.includes(anchor)) closeStaffCard(); };
  const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); closeStaffCard(); } };
  cur = { dlg, anchor, raf: 0, onDown, onKey };
  dlg.querySelector('[data-close]').onclick = closeStaffCard;
  document.addEventListener('pointerdown', onDown, true);
  addEventListener('keydown', onKey, true);
  place();
}
