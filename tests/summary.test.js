// Tong ket level (src/game/summary.js) – choi cac duong di that qua Level 1 roi kiem tra xep loai / bao cao
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize, competencyScore, COMPETENCY } from '../src/game/summary.js';
import { newRun, applyChoice, enterScenario } from '../src/game/rules.js';
import { LEVEL1 } from '../src/game/level1.js';

// picks: 'ACCA' = S01 A, S02 C, S03 C, S04 A
function playPath(picks) {
  const run = newRun();
  LEVEL1.scenarios.forEach((s, i) => {
    enterScenario(run, s);
    applyChoice(run, s, s.choices.find(c => c.id === picks[i]));
  });
  return run;
}
const sum = picks => summarize(playPath(picks), LEVEL1, 'P1');

test('competency_score = round(trung binh * 100 / 3)', () => {
  assert.equal(competencyScore([3, 3]), 100);
  assert.equal(competencyScore([0]), 0);
  assert.equal(competencyScore([2, 1]), 50);
  assert.equal(competencyScore([2, 3, 2]), 78);
});

test('ACCA: khong rui ro, khong lua chon nang luc 0 -> Khoi dau xuat sac', () => {
  const r = sum('ACCA');
  assert.equal(r.tier.id, 'excellent');
  assert.equal(r.tier.mood, 'good');
  assert.equal(r.facts.risk, 0);
  assert.deepEqual(r.dangers, []);
  assert.equal(r.budgetUsed, 15);
  assert.deepEqual([r.best.no, r.best.choice], ['S02', 'C']);   // diem 3 dau tien
  assert.deepEqual(r.decisions.map(d => d.no + d.choice), ['S01A', 'S02C', 'S03C', 'S04A']);
  assert.equal(r.topCompetency.score, 100);
});

test('AABB: co lua chon nang luc 0 (S03 B) nhung rui ro thap, quy du -> Khoi dau on dinh', () => {
  const r = sum('AABB');
  assert.equal(r.facts.zeroRating, true);
  assert.equal(r.tier.id, 'stable');
  assert.equal(r.tier.mood, 'good');
});

test('CCCA: mot co nguy hiem (PM tu doc tai lieu ngoai gio) -> Can than trong', () => {
  const r = sum('CCCA');
  assert.deepEqual(r.dangers.map(d => d.flag), ['pm_overloaded']);
  assert.equal(r.tier.id, 'caution');
  assert.equal(r.tier.mood, 'mid');
});

test('BBAC: rui ro 50 va 4 co nguy hiem -> Khoi dau nhieu rui ro', () => {
  const r = sum('BBAC');
  assert.equal(r.facts.risk, 50);
  assert.deepEqual(r.dangers.map(d => d.flag).sort(),
    ['legacy_review_skipped', 'scope_unestimated', 'senior_uncontrolled', 'shared_tool_license']);
  assert.equal(r.tier.id, 'risky');
  assert.equal(r.tier.mood, 'bad');
});

test('xep loai: rui ro 35–49 la Can than trong du khong co co nguy hiem', () => {
  const run = newRun();
  run.metrics.project_risk = 40;
  assert.equal(summarize(run, LEVEL1, 'P1').tier.id, 'caution');
  run.metrics.project_risk = 50;
  assert.equal(summarize(run, LEVEL1, 'P1').tier.id, 'risky');
});

test('xep loai: khong khop dieu kien nao (quy < 70) thi roi ve Can than trong', () => {
  const run = playPath('AABB');
  run.metrics.budget = 60;
  assert.equal(summarize(run, LEVEL1, 'P1').tier.id, 'caution');
});

test('bao cao: du 7 chi so dau/cuoi level, quy da dung khong am', () => {
  const r = sum('ACCA');
  assert.equal(r.changes.length, 7);
  assert.deepEqual(r.changes.find(c => c.key === 'budget'), { key: 'budget', from: 100, to: 85 });
  const rich = playPath('BBBB');                                  // S03 B: quy +5 -> tong quy tang
  assert.equal(summarize(rich, LEVEL1, 'P1').budgetUsed, 0);
});

test('nang luc noi bat: chi tinh nang luc da xuat hien, nhan dung ten', () => {
  const r = sum('BBAC');
  for (const c of r.competencies) assert.equal(c.label, COMPETENCY[c.code]);
  assert.ok(r.competencies.every(c => c.score >= 0 && c.score <= 100));
  assert.equal(r.topCompetency.score, Math.max(...r.competencies.map(c => c.score)));
});

test('choi do dang: chi liet ke tinh huong da chon', () => {
  const run = newRun(), s = LEVEL1.scenarios[0];
  applyChoice(run, s, s.choices[0]);
  const r = summarize(run, LEVEL1, 'P1');
  assert.deepEqual(r.decisions.map(d => d.no), ['S01']);
});

test('moi to hop 81 duong di deu ra xep loai hop le', () => {
  const ids = ['A', 'B', 'C'], seen = new Set();
  for (const a of ids) for (const b of ids) for (const c of ids) for (const d of ids) {
    const r = sum(a + b + c + d);
    assert.ok(r.tier && ['good', 'mid', 'bad'].includes(r.tier.mood), a + b + c + d);
    seen.add(r.tier.id);
  }
  assert.deepEqual([...seen].sort(), ['caution', 'excellent', 'risky', 'stable']);   // ca 4 muc deu dat duoc
});
