// Du lieu mau cho test engine: engine chi doc mot phan truong cua tinh huong / lua chon / hau qua
import assert from 'node:assert/strict';
import type { Choice, Delayed, Scenario } from '../../src/content/schema.ts';
import type { PendingDelayed } from '../../src/game/types.ts';

// Lua chon theo id (bao loi ro rang neu khong co)
export function choiceOf(s: Scenario, id: string): Choice {
  const c = s.choices.find(x => x.id === id);
  assert.ok(c, `${s.id}: khong co lua chon ${id}`);
  return c;
}
// Tinh huong toi gian (enterScenario / applyChoice chi dung id + day)
export const sc = (id: string, day: number) => ({ id, day }) as Scenario;
// Lua chon toi gian: mac dinh id 'A', them hieu ung / co / ket qua re nhanh... tuy test
export const choice = (o: object = {}) => ({ id: 'A', ...o }) as Choice;
// Hau qua tri hoan dat san vao run.delayed (khong can source)
export const pending = (...ds: (Delayed & { source?: string })[]) => ds as PendingDelayed[];
