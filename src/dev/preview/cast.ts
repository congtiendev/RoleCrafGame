// Doi nhan vat tren trang xem nhan vat: PM (atlas 8 sheet) + cac bo import_characters.py
import CHARS from '../../generated/characters.ts';
import { DATA, SHEET_LABEL, BOTTOM, reindex } from '../../lib/sprites.ts';
import type { CharacterSet } from '../../lib/spriteTypes.ts';

const PM: CharacterSet = { id: 'PM', label: 'PM – Project Manager', sheets: DATA.sheets, rects: DATA.rects, anims: DATA.anims, cells: DATA.cells };
export const CAST: CharacterSet[] = [PM, ...CHARS];
// Bo 1 atlas: id sheet = id nhan vat. Bo nhieu sheet (Huy): labels/bottom theo tung sheet, chan dung khong neo chan
CHARS.forEach(c => {
  if (!c.labels) { SHEET_LABEL[c.id] = c.label; BOTTOM[c.id] = 1; return; }
  Object.assign(SHEET_LABEL, c.labels); (c.bottom || []).forEach(id => { BOTTOM[id] = 1; });
});

// Thay bo sprite dang xem (giu nguyen DATA.script); tra ve nhan vat moi
export function setCharacter(id: string) {
  const c = CAST.find(x => x.id === id) || PM;
  Object.assign(DATA, { sheets: c.sheets, rects: c.rects, anims: c.anims, cells: c.cells });
  reindex();
  return c;
}
