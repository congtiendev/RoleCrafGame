// Loc danh sach hanh dong / o tinh cho tab luoi
import { DATA } from '../shared/sprites.js';

const sheetOf = (it, isAnim) => isAnim ? it.frames[0][0] : it.s;
export const itemFrames = (it, isAnim) => isAnim ? it.frames : [[it.s, it.r, it.c]];

// Cac sheet co mat trong tab, de lam nut loc
export function sheetIds(isAnim) {
  return [...new Set((isAnim ? DATA.anims : DATA.cells).map(it => sheetOf(it, isAnim)))].sort();
}

export function filterItems(isAnim, sheet, query) {
  const q = query.trim().toLowerCase();
  return (isAnim ? DATA.anims : DATA.cells).filter(it =>
    (sheet === 'all' || sheetOf(it, isAnim) === sheet) && (!q || it.name.toLowerCase().includes(q)));
}

