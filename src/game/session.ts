// Phien choi (logic, khong dung DOM): ten nhan vat va trang thai se luu qua cac man.
// Luu localStorage de mo lai trang van con; loi luu (che do rieng tu...) thi van choi binh thuong.
import type { Run } from './types.ts';

// Du lieu luu: ten, level dang choi + trang thai phien, da xem tour HUD chua
export interface Session {
  playerName?: string;
  game?: { level: string; run: Run } | null;
  hudTourDone?: boolean;
}
export interface StorageHooks {
  load?: () => Session | null | undefined | Promise<Session | null | undefined>;
  save?: (state: Session) => unknown;
}

let KEY = 'rolecraft.pm60.session';

function load(): Session {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch { return {}; }
}
export const session: Session = load();
const clear = () => { for (const k of Object.keys(session) as (keyof Session)[]) delete session[k]; };
// Ban nhung: web chu dat khoa rieng (vd theo nguoi dung) -> nap lai phien vao dung doi tuong `session` (cac man giu tham chieu)
export function useStorage(key: string | undefined) {
  if (!key || key === KEY) return;
  KEY = key;
  clear();
  Object.assign(session, load());
}
// Web chu luu tien do tren server: save(state) goi moi lan luu (van giu ban sao localStorage de mo lai nhanh / offline);
// load() -> state (co the la Promise) nap truoc khi vao game, thay ban localStorage neu co du lieu.
let remote: StorageHooks['save'] | null = null;
export async function connectStorage({ load, save }: StorageHooks = {}) {
  remote = save || null;
  if (!load) return;
  const data = await load();
  if (data && typeof data === 'object') {
    clear();
    Object.assign(session, JSON.parse(JSON.stringify(data)));
    try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* bo qua */ }
  }
}
export function saveSession() {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* bo qua */ }
  const save = remote;
  if (save) Promise.resolve().then(() => save(JSON.parse(JSON.stringify(session)))).catch(() => { /* web chu tu xu ly loi */ });
}
// Xoa du lieu choi (bang tam dung): ten, van dang choi, co tour HUD -> phien rong, ghi de ca localStorage lan web chu (save)
export function resetSession() { clear(); saveSession(); }

// Ten PM thay cho {{player_name}} trong kich ban: 2–24 ky tu, chi chu cai (co dau) va khoang trang.
export function checkName(raw: string): { name: string; error?: undefined } | { error: string; name?: undefined } {
  const name = String(raw).normalize('NFC').trim().replace(/\s+/g, ' ');
  if (name.length < 2) return { error: 'Tên cần ít nhất 2 ký tự.' };
  if (name.length > 24) return { error: 'Tên dài tối đa 24 ký tự.' };
  if (!/^[\p{L}\s]+$/u.test(name)) return { error: 'Tên chỉ gồm chữ cái và khoảng trắng.' };
  // Viet hoa chu dau moi tu nhu ten nguoi Viet: "nguyễn khánh an" -> "Nguyễn Khánh An"
  return { name: name.split(' ').map(w => w[0].toLocaleUpperCase('vi') + w.slice(1).toLocaleLowerCase('vi')).join(' ') };
}

// Goi y ten ngau nhien (nut ✨ o the nhan vien) – danh sach ten vui mac dinh; da o dang checkName chuan hoa (viet hoa
// chu dau moi tu), tranh trung ten nhan vat trong kich ban (Minh, Huy, Lan, Nam, Hiep, Linh, Ha)
const IDEAS = ['Đau Đầu Vì Nhà Giàu', 'Mệt Mỏi Vì Học Giỏi', 'Buồn Phiền Vì Nhiều Tiền', 'Chơi Đủ Xong Đi Ngủ',
  'Săm Thủng Kêu Van Hỏng', 'Ôm Phản Lao Ra Biển', 'Say Xỉn Xông Vô Hẻm'];
export function suggestName(current: string) {
  const pool = IDEAS.filter(n => n !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}
