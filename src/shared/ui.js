// Tien ich DOM + class dung chung giua cac component
// Goc DOM + noi dat anh: mac dinh la trang (document, anh canh trang). Nhung vao web khac (src/embed): goc = ShadowRoot
// cua game, anh o assetBase -> setHost({ root, portal, assetBase }) truoc khi dung man nao.
let ROOT = null, PORTAL = null, BASE = '';               // ROOT null = document (doc luc goi: module con nap duoc tren Node)
export function setHost({ root, portal, assetBase } = {}) {
  ROOT = root || null; PORTAL = portal || null;
  BASE = assetBase ? String(assetBase).replace(/\/?$/, '/') : '';
}
const root = () => ROOT || document;
export const $ = id => root().getElementById(id);
// cho gan lop noi (the nhan vien...): trong trang = body, nhung = khung game trong ShadowRoot
export const portal = () => PORTAL || document.body;
// hop thoai modal dang mo / phan tu dang focus trong goc game (ShadowRoot co activeElement rieng)
export const modalOpen = () => !!root().querySelector('dialog:modal');
export const activeEl = () => root().activeElement;
// phan tu that nhan su kien: nghe tren window/document thi e.target la host cua ShadowRoot -> lay dau composedPath
export const evTarget = e => e.composedPath?.()[0] || e.target;
// duong dan anh luc chay ('bg/..', 'ui/..', 'characters/..', 'sheets/..') -> theo assetBase; URL tuyet doi / data: giu nguyen
export const asset = p => (/^([a-z]+:|\/)/i.test(p) ? p : BASE + p);
export const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

export const TAG = 'rounded-full bg-chip px-1.5 py-px text-[11px]';
export const KBD = 'text-xs text-mute';
export const PANEL = 'rounded-[14px] border border-line bg-panel';
