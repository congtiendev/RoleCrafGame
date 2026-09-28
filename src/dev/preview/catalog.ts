// Loc danh sach hanh dong / o tinh cho tab luoi
import { DATA } from '../../lib/sprites.ts';
import type { Frame, SpriteAnim, SpriteCell } from '../../lib/spriteTypes.ts';

// Muc trong luoi: hanh dong (animation) hoac o tinh
export type Item = SpriteAnim | SpriteCell;
const sheetOf = (it: Item) => 'frames' in it ? it.frames[0][0] : it.s;
export const itemFrames = (it: Item): Frame[] => 'frames' in it ? it.frames : [[it.s, it.r, it.c]];

// Cac sheet co mat trong tab, de lam nut loc
export function sheetIds(isAnim: boolean) {
  return [...new Set((isAnim ? DATA.anims : DATA.cells).map(it => sheetOf(it)))].sort();
}

export function filterItems(isAnim: boolean, sheet: string, query: string): Item[] {
  const q = query.trim().toLowerCase();
  return (isAnim ? DATA.anims : DATA.cells as Item[]).filter(it =>
    (sheet === 'all' || sheetOf(it) === sheet) && (!q || it.name.toLowerCase().includes(q)));
}

