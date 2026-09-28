// Lay level theo id cho test, dung bien the: level thuong (co tong ket) / level cuoi (co ket qua campaign)
import assert from 'node:assert/strict';
import { levelById } from '../../src/game/levels.ts';
import type { Level } from '../../src/content/schema.ts';

export type RegularLevel = Extract<Level, { final?: false }>;
export type FinalLevel = Extract<Level, { final: true }>;

export function regularLevel(id: string): RegularLevel {
  const l = levelById(id);
  assert.ok(l && !l.final, `${id} khong phai level thuong`);
  return l;
}
export function finalLevel(id: string): FinalLevel {
  const l = levelById(id);
  assert.ok(l?.final, `${id} khong phai level cuoi`);
  return l;
}
