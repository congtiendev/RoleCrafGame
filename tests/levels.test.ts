// Noi dung game la DU LIEU THUAN (src/content/): khong co ham, chuyen thang sang JSON / DB / API; dieu kien dung dinh dang
// (src/game/conditions.ts); lien ket giua cac tinh huong khong dut (tinh than muc 11.14 – cac buoc validate khi publish).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, levelById, visibleLines, answerText, pickTier } from '../src/game/levels.ts';
import { check, fill } from '../src/game/conditions.ts';
import { CAST } from '../src/content/cast.ts';
import { METRICS, METRIC_GROUPS, START_RESOURCES } from '../src/content/metrics.ts';
import { COMPETENCY, LEARNING } from '../src/content/competencies.ts';
import { HARD_FAILS, CRITICAL, ENDINGS, FORCED_EXITS, FORCED_EXIT_SCENE } from '../src/content/campaign.ts';
import { newRun } from '../src/game/rules.ts';
import type { Answer, Condition, Line } from '../src/content/schema.ts';
import type { Decision } from '../src/game/campaign.ts';

const CONTENT = { LEVELS, CAST, METRICS, METRIC_GROUPS, START_RESOURCES, COMPETENCY, LEARNING, HARD_FAILS, CRITICAL, ENDINGS,
  FORCED_EXITS, FORCED_EXIT_SCENE };

test('noi dung la du lieu thuan: JSON hoa roi doc lai khong mat gi (khong co ham, undefined, Date...)', () => {
  for (const [k, v] of Object.entries(CONTENT)) assert.deepEqual(JSON.parse(JSON.stringify(v)), v, k);
});

// moi dieu kien trong noi dung: `when` (dong thoai, ket qua re nhanh, xep loai, hard fail, critical) va `answer.unless`
const conds: [string, Condition | undefined][] = [];
(function walk(o: unknown, path: string) {
  if (!o || typeof o !== 'object') return;
  if ('when' in o) conds.push([path + '.when', o.when as Condition]);
  const a = (o as { answer?: Answer }).answer;
  if (a) conds.push([path + '.answer.unless', a.unless]);
  for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`);
})(CONTENT, '');

test('dieu kien dung dinh dang: danh gia duoc tren phien choi, tong ket va quyet dinh bao cao', () => {
  assert.ok(conds.length > 0, 'tim thay dieu kien');
  const run = newRun(), ctx = { ...run, risk: 10, budget: 100, dangers: 0, zeroRating: false, d: { id: 'X', no: 'S01', choice: 'A', avg: 1 } };
  for (const [path, c] of conds) assert.equal(typeof check(c, ctx), 'boolean', path);
});

test('conditions: ghep all/any/not/atLeast, co, lua chon, so sanh, mau cau', () => {
  const ctx = { flags: { a: true }, choices: { S1: 'B' }, metrics: { m: 40 }, d: { title: 'Tiêu đề', result: 'Một. Hai.' } };
  assert.equal(check(undefined, ctx), true);
  assert.equal(check({ flag: 'a' }, ctx), true);
  assert.equal(check({ not: { flag: 'b' } }, ctx), true);
  assert.equal(check({ choice: 'S1', is: 'B' }, ctx), true);
  assert.equal(check({ var: 'metrics.m', lt: 40 }, ctx), false);
  assert.equal(check({ var: 'metrics.m', gte: 40 }, ctx), true);
  assert.equal(check({ var: 'd.title', in: ['Tiêu đề'] }, ctx), true);
  assert.equal(check({ all: [{ flag: 'a' }, { flag: 'b' }] }, ctx), false);
  assert.equal(check({ any: [{ flag: 'a' }, { flag: 'b' }] }, ctx), true);
  assert.equal(check({ atLeast: 2, of: [{ flag: 'a' }, { flag: 'b' }, { choice: 'S1', is: 'B' }] }, ctx), true);
  assert.throws(() => check({ nope: 1 } as unknown as Condition, ctx), /Điều kiện không hợp lệ/);
  assert.equal(fill('"{d.title|lower}": {d.result|firstSentence|lower}', ctx), '"tiêu đề": một.');
});

test('levels: id khong trung, so level lien tiep, tinh huong noi nhau toi tong ket / ket thuc, chi level cuoi co ending', () => {
  assert.equal(new Set(LEVELS.map(l => l.id)).size, LEVELS.length);
  LEVELS.forEach((l, i) => {
    assert.equal(l.no, i + 1, l.id);
    assert.equal(levelById(l.id), l);
    const ids = l.scenarios.map(s => s.id), end = (l.summary || l.ending).id;
    assert.equal(new Set(ids).size, ids.length, l.id);
    l.scenarios.forEach((s, j) => assert.equal(s.next, ids[j + 1] ?? end, s.id));
    assert.equal(!!l.final, i === LEVELS.length - 1, l.id);
    assert.ok(l.final ? l.ending : l.summary, l.id);
    for (const s of l.scenarios) for (const who of s.cast) assert.ok(CAST[who], `${s.id}: ${who}`);
  });
});

test('levels: xu ly chung – thoai theo dieu kien, cau tra loi theo mau, xep loai mac dinh o cuoi', () => {
  const run = newRun(), lines: Line[] = [{ who: 'PM', text: 'a' }, { who: 'PM', text: 'b', ifFlag: 'f' }, { who: 'PM', text: 'c', unlessFlag: 'f' },
    { who: 'PM', text: 'd', when: { var: 'metrics.team_morale', lt: 50 } }];
  assert.deepEqual(visibleLines(lines, run).map(l => l.text), ['a', 'c']);
  run.flags.f = true; run.metrics.team_morale = 10;
  assert.deepEqual(visibleLines(lines, run).map(l => l.text), ['a', 'b', 'd']);
  const ans: Line = { who: 'PM', text: 'mau', answer: { from: 'best', text: '{d.label}' } };
  assert.equal(answerText({ who: 'PM', text: 'mau' }, run, {}), null);
  assert.equal(answerText(ans, run, { best: [] }), null);
  assert.equal(answerText(ans, run, { best: [{ label: 'L' } as Decision] }), 'L');
  for (const l of LEVELS) if (l.summary) assert.equal(pickTier(l.summary.tiers, {}), l.summary.tiers.at(-1), l.id);
});
