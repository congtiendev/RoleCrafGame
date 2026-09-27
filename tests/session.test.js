// Ten nhan vat (src/game/session.js): kiem tra, chuan hoa, goi y
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkName, suggestName } from '../src/game/session.js';

test('checkName: viet hoa chu dau moi tu, gop khoang trang', () => {
  assert.deepEqual(checkName('  nguyễn   khánh an '), { name: 'Nguyễn Khánh An' });
  assert.deepEqual(checkName('ĐỖ HOÀNG LONG'), { name: 'Đỗ Hoàng Long' });
  assert.deepEqual(checkName('an'), { name: 'An' });
});

test('checkName: chuan hoa NFC (dau to hop tu ban phim / dan vao)', () => {
  const decomposed = 'Nguyễn';                 // e + mu + nga tach roi
  assert.deepEqual(checkName(decomposed), { name: 'Nguyễn' });
});

test('checkName: do dai 2–24 ky tu', () => {
  assert.match(checkName('').error, /ít nhất 2/);
  assert.match(checkName(' a ').error, /ít nhất 2/);
  assert.equal(checkName('a'.repeat(24)).error, undefined);
  assert.match(checkName('a'.repeat(25)).error, /tối đa 24/);
});

test('checkName: chi chu cai va khoang trang', () => {
  for (const bad of ['An123', 'An_B', 'An!', '<b>An</b>', 'An-Bình'])
    assert.match(checkName(bad).error, /chữ cái/, bad);
});

test('suggestName: tra ve ten hop le, khong trung ten dang co', () => {
  for (let i = 0; i < 50; i++) {
    const n = suggestName('Nguyễn Khánh An');
    assert.notEqual(n, 'Nguyễn Khánh An');
    assert.deepEqual(checkName(n), { name: n });
  }
});

test('suggestName: tranh ten nhan vat trong kich ban', () => {
  const npc = new Set(['Minh', 'Huy', 'Lan', 'Nam', 'Hiệp', 'Linh', 'Hà']);   // \b cua regex khong hieu chu co dau -> so tung tu
  for (let i = 0; i < 50; i++) {
    const n = suggestName('');
    assert.ok(!n.split(' ').some(w => npc.has(w)), n);
  }
});
