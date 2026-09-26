// The nhan vien kieu tooltip: bam vao nhan vat trong canh (standee NPC / vung PM) -> the noi ngay tren dau nhan vat,
// khong phu toi nen, game van chay phia sau. Moi luc chi 1 the; bam lai nhan vat do / bam ra ngoai / Esc / nut X -> dong.
// The bam theo nhan vat moi khung hinh (PM co the dang di); khong du cho phia tren thi lat xuong duoi.
import { esc } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { innocomLogo } from './brand/InnocomLogo.js';
import { drawFace } from './portrait.js';

const FACT = (k, v) => `<dt class="text-px-panel/60">${k}</dt><dd class="font-semibold">${esc(v)}</dd>`;
const AV = 88;      // be rong khung anh, px (khop w-[88px] ben duoi)
const GAP = 16;     // khoang cach the - dau nhan vat (cho mui nhon)
let cur = null;     // { dlg, anchor, raf, onDown, onKey }

export function closeStaffCard() {
  if (!cur) return;
  const c = cur; cur = null;
  cancelAnimationFrame(c.raf);
  document.removeEventListener('pointerdown', c.onDown, true);
  removeEventListener('keydown', c.onKey, true);
  c.dlg.close(); c.dlg.remove();
}

// p: { name, role, tint? (NPC: mau the tam), face? (PM: ten bieu cam sheet D), client? (khach hang), facts: [[nhan, gia tri]] }
// anchor: phan tu nhan vat (standee / vung bam PM) de dat the len tren
export function openStaffCard(p, anchor) {
  const same = cur?.anchor === anchor;
  closeStaffCard();
  if (same) return;                                   // bam lai dung nhan vat dang mo -> chi dong

  const dlg = document.createElement('dialog');
  dlg.className = 'px-panel fixed z-40 m-0 w-[min(440px,calc(100vw-24px))] animate-rise px-5 py-4 max-sm:px-4 max-sm:py-3';
  dlg.setAttribute('aria-label', `Thẻ ${p.client ? 'khách hàng' : 'nhân viên'}: ${p.name}`);
  dlg.innerHTML = `
    <span data-arrow class="absolute size-4 rotate-45 bg-[#0262e6]"></span>
    <div class="flex items-center gap-3">
      <span class="px-bubble inline-block px-2.5 pt-1 pb-0.5 !font-pixel text-[1.1rem] !leading-none tracking-[0.15em] whitespace-nowrap !text-white !bg-brand-red">${p.client ? 'THẺ KHÁCH HÀNG' : 'THẺ NHÂN VIÊN'}</span>
      ${p.client ? '' : `<span class="ml-auto shrink-0 max-sm:hidden">${innocomLogo({ tone: 'light', size: 'size-5', text: 'text-base' })}</span>`}
      <button type="button" data-close class="px-btn px-btn-blue px-btn-sq size-9 ${p.client ? 'ml-auto' : 'max-sm:ml-auto'}" aria-label="Đóng thẻ" title="Đóng">${icon('xMark', 'size-5', { stroke: 2.75 })}</button>
    </div>
    <div class="mt-3 grid grid-cols-[auto_1fr] items-start gap-4">
      <div class="grid h-[108px] w-[88px] place-items-center overflow-hidden bg-[#1c2b60] shadow-[0_-3px_0_0_var(--color-px-ink),0_3px_0_0_var(--color-px-ink),-3px_0_0_0_var(--color-px-ink),3px_0_0_0_var(--color-px-ink)]"
           ${p.tint ? `style="background:${p.tint}"` : ''}>
        ${p.face ? '<canvas aria-hidden="true"></canvas>' : icon('user', 'size-12 text-white/90', { stroke: 1.75 })}
      </div>
      <div class="min-w-0">
        <h2 class="text-[1.25rem] leading-tight font-extrabold">${esc(p.name)}</h2>
        <p class="mt-0.5 text-sm font-bold text-brand-red">${esc(p.role)}</p>
        <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.85rem] leading-snug text-px-panel/90">${p.facts.map(([k, v]) => FACT(k, v)).join('')}</dl>
      </div>
    </div>`;
  document.body.append(dlg);
  if (p.face) drawFace(dlg.querySelector('canvas'), p.face, AV);
  dlg.show();

  const arrow = dlg.querySelector('[data-arrow]');
  // mui nhon dinh vi theo vung padding -> tru do day vien card (.px-panel) de cham mep ngoai
  const place = () => {
    if (!anchor.isConnected) return closeStaffCard();  // doi canh: nhan vat bien mat
    const r = anchor.getBoundingClientRect(), w = dlg.offsetWidth, h = dlg.offsetHeight, cs = getComputedStyle(dlg);
    const bt = parseFloat(cs.borderTopWidth), bb = parseFloat(cs.borderBottomWidth), bl = parseFloat(cs.borderLeftWidth);
    const cx = r.left + r.width / 2, x = Math.max(12, Math.min(innerWidth - w - 12, cx - w / 2));
    let y = r.top - h - GAP;
    const below = y < 8;
    if (below) y = Math.min(innerHeight - h - 8, r.bottom + GAP);
    Object.assign(dlg.style, { left: `${x}px`, top: `${y}px` });
    Object.assign(arrow.style, {
      left: `${Math.max(10, Math.min(w - 30, cx - x - 8)) - bl}px`,
      top: below ? `${-bt - 8}px` : '', bottom: below ? '' : `${-bb - 8}px`,
    });
    cur.raf = requestAnimationFrame(place);
  };
  const onDown = e => { if (!dlg.contains(e.target) && !anchor.contains(e.target)) closeStaffCard(); };
  const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); closeStaffCard(); } };
  cur = { dlg, anchor, raf: 0, onDown, onKey };
  dlg.querySelector('[data-close]').onclick = closeStaffCard;
  document.addEventListener('pointerdown', onDown, true);
  addEventListener('keydown', onKey, true);
  place();
}
