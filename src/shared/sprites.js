// Du lieu do build_preview.py sinh ra — sua manifest/kich ban xong thi chay lai script do
import DATA from './data.js';

export { DATA };
export const SHEET = {}, ANIM = {}, MAXCELL = {}, NAME_AT = {};
export const SHEET_LABEL = { A: 'Cơ bản', B: 'Cử chỉ', C: 'Công việc', D: 'Chân dung', E: 'Review/Kết', F: 'Icon', O: 'Nội thất', P: 'Đạo cụ' };

// Nhan vat (sheet A-E) neo DAY + CHAN nhu A.spr cua game: chan cham cung mot
// duong day, tam bong duoi chan dung yen nen doi khung khong rung.
// Do vat / icon / chan dung can giua.
export const BOTTOM = { A: 1, B: 1, C: 1, E: 1 };

// Tinh lai cac bang tra cuu tu DATA.sheets/rects/anims/cells (goi lai sau khi doi nhan vat)
export function reindex() {
  for (const o of [SHEET, ANIM, MAXCELL, NAME_AT]) for (const k in o) delete o[k];
  DATA.sheets.forEach(s => SHEET[s.id] = s);
  DATA.anims.forEach(a => ANIM[a.name] = a);

  // Mot ti le cho ca sheet: cac khung cua mot animation co khung o rong hep khac nhau,
  // fit tung o rieng thi nhan vat se phong to/thu nho giua cac khung.
  for (const id in DATA.rects) {
    let w = 0, h = 0;
    for (const k in DATA.rects[id]) {
      const r = DATA.rects[id][k];
      // nhan vat neo o chan, khong o giua khung: be rong can du cho phia xa chan nhat
      w = Math.max(w, BOTTOM[id] ? 2 * Math.max(r[4], r[2] - r[4]) : r[2]); h = Math.max(h, r[3]);
    }
    MAXCELL[id] = [w, h];
  }
  // Cac sheet co nguoi dung cua nhan vat dang xem (PM: A B C E): dung chung mot ti le, khong thi kich ban
  // noi walk (A) -> shake (B) nhan vat se to ra dot ngot.
  const pm = Object.keys(DATA.rects).filter(id => BOTTOM[id]);
  if (pm.length) {
    const w = Math.max(...pm.map(id => MAXCELL[id][0])), h = Math.max(...pm.map(id => MAXCELL[id][1]));
    pm.forEach(id => MAXCELL[id] = [w, h]);
  }

  // Ten hien khi re chuot tren sheet goc
  DATA.anims.forEach(a => a.frames.forEach((f, i) => NAME_AT[f.join()] = `${a.name} #${i + 1}`));
  DATA.cells.forEach(c => NAME_AT[[c.s, c.r, c.c].join()] = c.name);
}
reindex();

export const FACE_DEFAULT = (() => { const c = DATA.cells.find(c => c.name === 'face_neutral'); return c && [c.s, c.r, c.c, c.name]; })();

// "B r1 c2–3", gom cac khung lien nhau cung hang
export function rangeText(frames) {
  const parts = []; let i = 0;
  while (i < frames.length) {
    const [s, r, c] = frames[i]; let j = i;
    while (j + 1 < frames.length && frames[j + 1][0] === s && frames[j + 1][1] === r && frames[j + 1][2] === frames[j][2] + 1) j++;
    const txt = `r${r} c${c}${j > i ? '–' + frames[j][2] : ''}`;
    const prev = parts[parts.length - 1];
    if (prev && prev.s === s) prev.t.push(txt); else parts.push({ s, t: [txt] });
    i = j + 1;
  }
  return parts.map(p => p.s + ' ' + p.t.join(' → ')).join(' + ');
}
