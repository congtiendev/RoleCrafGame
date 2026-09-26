// Luat cong/tru phien choi (src/game/rules.js) – docs/KICH_BAN_ROLECRAFT_PM60.md muc 3
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { METRICS, METRIC, METRIC_GROUPS, newRun, applyChoice, enterScenario, isGood } from '../src/game/rules.js';
import DATA from '../src/shared/data.js';

const SC = { id: 'P1_S01_PROJECT_TAKEOVER', day: 1 };
const choice = (o = {}) => ({ id: 'A', ...o });

test('trang thai dau khop bang "Chi so chinh" trong tai lieu', () => {
  const run = newRun();
  assert.deepEqual(run.metrics, {
    budget: 100, project_progress: 40, product_quality: 60, team_morale: 70,
    client_trust: 60, management_trust: 50, project_risk: 10,
  });
  assert.deepEqual(run.resources, { team_size: 3, tooling_level: 0 });
  assert.equal(run.day, 1);
  assert.equal(run.phase, 'P1');
  assert.deepEqual([run.flags, run.ratings, run.delayed, run.choices], [{}, [], [], {}]);
});

test('moi lan newRun la mot phien doc lap', () => {
  const a = newRun(), b = newRun();
  a.metrics.budget = 0; a.flags.x = true; a.ratings.push(1);
  assert.equal(b.metrics.budget, 100);
  assert.deepEqual(b.flags, {});
  assert.deepEqual(b.ratings, []);
});

test('mien gia tri: budget -100..200, cac chi so khac 0..100', () => {
  assert.deepEqual([METRIC.budget.min, METRIC.budget.max], [-100, 200]);
  for (const m of METRICS.filter(m => m.key !== 'budget')) assert.deepEqual([m.min, m.max], [0, 100], m.key);
});

test('applyChoice: cong/tru chi so va tra ve danh sach thay doi', () => {
  const run = newRun();
  const changes = applyChoice(run, SC, choice({ effects: { project_progress: -5, product_quality: 15 } }));
  assert.equal(run.metrics.project_progress, 35);
  assert.equal(run.metrics.product_quality, 75);
  assert.deepEqual(changes, [
    { key: 'project_progress', from: 40, to: 35 },
    { key: 'product_quality', from: 60, to: 75 },
  ]);
});

test('applyChoice: clamp 0..100 sau moi lua chon', () => {
  const run = newRun();
  applyChoice(run, SC, choice({ effects: { team_morale: 50, project_risk: -30 } }));
  assert.equal(run.metrics.team_morale, 100);
  assert.equal(run.metrics.project_risk, 0);
});

test('applyChoice: budget duoc am (phat hien vuot ngan sach) nhung khong duoi -100 / tren 200', () => {
  const run = newRun();
  applyChoice(run, SC, choice({ effects: { budget: -130 } }));
  assert.equal(run.metrics.budget, -30);
  applyChoice(run, SC, choice({ effects: { budget: -500 } }));
  assert.equal(run.metrics.budget, -100);
  applyChoice(run, SC, choice({ effects: { budget: 1000 } }));
  assert.equal(run.metrics.budget, 200);
});

test('applyChoice: chi so da cham tran khong nam trong danh sach thay doi', () => {
  const run = newRun();
  run.metrics.team_morale = 100;
  const changes = applyChoice(run, SC, choice({ effects: { team_morale: 10, client_trust: 5 } }));
  assert.deepEqual(changes.map(c => c.key), ['client_trust']);
});

test('applyChoice: ghi quyet dinh, co, nang luc, hau qua tri hoan', () => {
  const run = newRun();
  applyChoice(run, SC, choice({
    id: 'B', flags: ['legacy_review_skipped'], competency: { RISK: 0, DECISION: 1 },
    delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', effects: { project_risk: 10 } }],
  }));
  assert.equal(run.choices[SC.id], 'B');
  assert.deepEqual(run.flags, { legacy_review_skipped: true });
  assert.deepEqual(run.ratings, [
    { scenario: SC.id, choice: 'B', competency: 'RISK', rating: 0 },
    { scenario: SC.id, choice: 'B', competency: 'DECISION', rating: 1 },
  ]);
  assert.deepEqual(run.delayed, [{ at: 'P3_S09_PRODUCTION_INCIDENT', effects: { project_risk: 10 }, source: `${SC.id}_B` }]);
});

test('applyChoice: lua chon khong co hieu ung / co / nang luc van hop le', () => {
  const run = newRun();
  assert.deepEqual(applyChoice(run, SC, choice()), []);
  assert.deepEqual(run.metrics, newRun().metrics);
});

test('enterScenario: dat ngay, kich hoat hau qua tri hoan den han dung mot lan', () => {
  const run = newRun();
  run.delayed = [
    { at: 'P3_S09', effects: { project_risk: 10 }, source: 'x' },
    { at: 'P4_S16', effects: { budget: -5 }, source: 'y' },
  ];
  const due = enterScenario(run, { id: 'P3_S09', day: 31 });
  assert.equal(run.day, 31);
  assert.deepEqual(due, [{ key: 'project_risk', from: 10, to: 20 }]);
  assert.deepEqual(run.delayed.map(d => d.at), ['P4_S16']);
  assert.deepEqual(enterScenario(run, { id: 'P3_S09', day: 31 }), []);   // vao lai khong cong lan nua
  assert.equal(run.metrics.project_risk, 20);
});

test('enterScenario: khong co hau qua den han thi khong doi chi so', () => {
  const run = newRun();
  assert.deepEqual(enterScenario(run, { id: 'P1_S01', day: 1 }), []);
  assert.deepEqual(run.metrics, newRun().metrics);
});

test('isGood: tang la tot, rieng rui ro thi tang la xau', () => {
  assert.equal(isGood({ key: 'product_quality', from: 60, to: 75 }), true);
  assert.equal(isGood({ key: 'project_progress', from: 40, to: 35 }), false);
  assert.equal(isGood({ key: 'project_risk', from: 10, to: 25 }), false);
  assert.equal(isGood({ key: 'project_risk', from: 10, to: 5 }), true);
});

test('HUD: moi chi so thuoc mot nhom, co loi huong dan va icon co that trong sheet F', () => {
  const groups = METRIC_GROUPS.map(g => g.id);
  const icons = new Set(DATA.cells.filter(c => c.s === 'F').map(c => c.name));
  assert.equal(METRICS.length, 7);
  assert.equal(new Set(METRICS.map(m => m.key)).size, 7);
  for (const m of METRICS) {
    assert.ok(groups.includes(m.group), `${m.key}: nhom ${m.group}`);
    assert.ok(m.hint?.length > 20, `${m.key}: thieu hint`);
    assert.ok(icons.has(m.icon), `${m.key}: icon ${m.icon}`);
    assert.ok(m.label && m.short, m.key);
  }
  assert.deepEqual(METRICS.filter(m => m.bad).map(m => m.key), ['project_risk']);
});

test('applyChoice: dat tai nguyen (vd tooling_level = 2)', () => {
  const run = newRun();
  applyChoice(run, SC, choice({ set: { tooling_level: 2 } }));
  assert.deepEqual(run.resources, { team_size: 3, tooling_level: 2 });
});

test('hau qua co dieu kien (ifChoice): khong kich hoat khi vao canh, chi ap khi chon dung lua chon', () => {
  const S06 = { id: 'P2_S06', day: 20 }, src = { at: 'P2_S06', ifChoice: 'C', effects: { project_progress: -3 } };
  const hit = newRun();
  hit.delayed = [{ ...src }];
  assert.deepEqual(enterScenario(hit, S06), []);
  assert.equal(hit.delayed.length, 1);
  const changes = applyChoice(hit, S06, choice({ id: 'C', effects: { product_quality: 5 } }));
  assert.deepEqual(changes, [{ key: 'product_quality', from: 60, to: 65 }, { key: 'project_progress', from: 40, to: 37 }]);
  assert.deepEqual(hit.delayed, []);

  const miss = newRun();
  miss.delayed = [{ ...src }];
  enterScenario(miss, S06);
  assert.deepEqual(applyChoice(miss, S06, choice({ id: 'A' })), []);
  assert.deepEqual(miss.delayed, [], 'lua chon khac: hau qua bi huy, khong cho tiep');
  assert.equal(miss.metrics.project_progress, 40);
});

test('hau qua chi dat bien the mo canh (khong co hieu ung) ghi vao run.variants', () => {
  const run = newRun();
  run.delayed = [{ at: 'P2_S08', variant: 'requirement_changed_without_confirmation' }];
  assert.deepEqual(enterScenario(run, { id: 'P2_S08', day: 28 }), []);
  assert.deepEqual(run.variants, { P2_S08: 'requirement_changed_without_confirmation' });
});

test('newRun ghi moc chi so dau Level 1 (cho bang tong ket), doc lap voi chi so dang choi', () => {
  const run = newRun();
  assert.deepEqual(run.levelStart.P1, run.metrics);
  run.metrics.budget = 50;
  assert.equal(run.levelStart.P1.budget, 100);
});
