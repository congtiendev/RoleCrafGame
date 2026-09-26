// Tien ich DOM + class dung chung giua cac component
export const $ = id => document.getElementById(id);
export const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

export const TAG = 'rounded-full bg-chip px-1.5 py-px text-[11px]';
export const KBD = 'text-xs text-mute';
export const PANEL = 'rounded-[14px] border border-line bg-panel';
