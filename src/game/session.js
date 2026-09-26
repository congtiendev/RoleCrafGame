// Phien choi (logic, khong dung DOM): ten nhan vat va trang thai se luu qua cac man.
// Luu localStorage de mo lai trang van con; loi luu (che do rieng tu...) thi van choi binh thuong.
const KEY = 'rolecraft.pm60.session';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export const session = load();
export function saveSession() {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* bo qua */ }
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

// Goi y ten ngau nhien – tranh trung ten nhan vat trong kich ban (Minh, Huy, Lan, Linh, Mai, Nam, Ha)
const IDEAS = ['Nguyễn Khánh An', 'Trần Quốc Bảo', 'Lê Ngọc Châu', 'Phạm Tuấn Dũng', 'Vũ Thảo Vy',
  'Đỗ Hoàng Long', 'Bùi Phương Thảo', 'Hoàng Gia Khang', 'Đặng Thanh Tâm', 'Ngô Bảo Ngọc'];
export function suggestName(current) {
  const pool = IDEAS.filter(n => n !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}
