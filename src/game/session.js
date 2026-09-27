// Phien choi (logic, khong dung DOM): ten nhan vat va trang thai se luu qua cac man.
// Luu localStorage de mo lai trang van con; loi luu (che do rieng tu...) thi van choi binh thuong.
let KEY = 'rolecraft.pm60.session';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export const session = load();
// Ban nhung: web chu dat khoa rieng (vd theo nguoi dung) -> nap lai phien vao dung doi tuong `session` (cac man giu tham chieu)
export function useStorage(key) {
  if (!key || key === KEY) return;
  KEY = key;
  for (const k of Object.keys(session)) delete session[k];
  Object.assign(session, load());
}
// Web chu luu tien do tren server: save(state) goi moi lan luu (van giu ban sao localStorage de mo lai nhanh / offline);
// load() -> state (co the la Promise) nap truoc khi vao game, thay ban localStorage neu co du lieu.
let remote = null;
export async function connectStorage({ load, save } = {}) {
  remote = save || null;
  if (!load) return;
  const data = await load();
  if (data && typeof data === 'object') {
    for (const k of Object.keys(session)) delete session[k];
    Object.assign(session, JSON.parse(JSON.stringify(data)));
    try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* bo qua */ }
  }
}
export function saveSession() {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* bo qua */ }
  if (remote) Promise.resolve().then(() => remote(JSON.parse(JSON.stringify(session)))).catch(() => { /* web chu tu xu ly loi */ });
}

// Ten PM thay cho {{player_name}} trong kich ban: 2–24 ky tu, chi chu cai (co dau) va khoang trang.
export function checkName(raw) {
  const name = String(raw).normalize('NFC').trim().replace(/\s+/g, ' ');
  if (name.length < 2) return { error: 'Tên cần ít nhất 2 ký tự.' };
  if (name.length > 24) return { error: 'Tên dài tối đa 24 ký tự.' };
  if (!/^[\p{L}\s]+$/u.test(name)) return { error: 'Tên chỉ gồm chữ cái và khoảng trắng.' };
  // Viet hoa chu dau moi tu nhu ten nguoi Viet: "nguyễn khánh an" -> "Nguyễn Khánh An"
  return { name: name.split(' ').map(w => w[0].toLocaleUpperCase('vi') + w.slice(1).toLocaleLowerCase('vi')).join(' ') };
}

// Goi y ten ngau nhien – tranh trung ten nhan vat trong kich ban (Minh, Huy, Lan, Nam, Hiep, Linh, Ha)
const IDEAS = ['Nguyễn Khánh An', 'Trần Quốc Bảo', 'Lê Ngọc Châu', 'Phạm Tuấn Dũng', 'Vũ Thảo Vy',
  'Đỗ Hoàng Long', 'Bùi Phương Thảo', 'Hoàng Gia Khang', 'Đặng Thanh Tâm', 'Ngô Bảo Ngọc'];
export function suggestName(current) {
  const pool = IDEAS.filter(n => n !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}
