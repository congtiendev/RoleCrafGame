// Thu tu choi: tinh huong nao tiep theo sau khi xong mot canh
import { DATA } from '../shared/sprites.js';

// Chi cac level "Kich ban ..." nam trong luong choi; ket thuc campaign / canh theo co
// la cac bien the doc lap, xem rieng o danh sach.
const inFlow = lvl => DATA.script[lvl].title.startsWith('Kịch bản');
const code = name => name.split(' ')[0];                  // "S07 Giu Huy" -> "S07"
// Dong phu cung ma voi tinh huong truoc nhung van nam trong luong chinh
const FOLLOW = ['sau mọi nhánh', 'kết cảnh', 'phản biện'];

// letter: nhanh vua chon ('' neu chi xem Mo canh). Tra ve { lvl, sit } hoac null khi het kich ban
export const sceneCount = () => DATA.script.reduce((n, L) => n + L.sits.reduce((m, s) => m + s.cols.length, 0), 0);

export function nextSit(lvl, sit, letter) {
  const cur = DATA.script[lvl].sits[sit].name;
  for (let l = lvl, s = sit + 1; l < DATA.script.length && inFlow(l); l++, s = 0) {
    for (; s < DATA.script[l].sits.length; s++) {
      const n = DATA.script[l].sits[s].name;
      // Bien the cua cung tinh huong (C1/C2, bien the mo canh, cac muc tong ket) thi bo qua,
      // tru dong theo sau moi nhanh va ket qua cua nhanh C.
      if (code(n) !== code(cur) || FOLLOW.some(w => n.includes(w)) || (letter === 'C' && n.includes(' C1 '))) return { lvl: l, sit: s };
    }
  }
  return null;
}
