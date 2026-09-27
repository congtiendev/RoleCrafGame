// Luat cong/tru phien choi (src/game/rules.js) – docs/KICH_BAN_ROLECRAFT_PM60.md muc 3
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { METRICS, METRIC, METRIC_GROUPS, newRun, beginLevel, applyChoice, enterScenario, dueNotes, resolveOutcome, isGood, fmt, fmtNum, fmtDelta }
  from '../src/game/rules.js';
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

test('so lieu thuc te: quy tinh bang VND (luu theo trieu), tien do bang so ngay / 60, chi so khac la %', () => {
  assert.deepEqual([METRIC.budget.unit, METRIC.budget.scale], ['VND', 1e6]);
  for (const m of METRICS.filter(m => !['budget', 'project_progress'].includes(m.key))) assert.equal(m.unit, '%', m.key);
  assert.equal(fmt('budget', 100), '100.000.000 VND');
  assert.equal(fmt('budget', -20), '-20.000.000 VND');
  assert.equal(fmtNum('budget', 85), '85.000.000');
  assert.equal(fmt('team_morale', 42.6), '43%');          // so dang chay (animation) lam tron
  assert.equal(fmtNum('client_trust', 60), '60%');
  // tien do: so ngay tren ke hoach 60 ngay, 1 diem = 0,6 ngay
  assert.equal(fmt('project_progress', 40), '24/60 ngày');
  assert.equal(fmtNum('project_progress', 35), '21/60');
  assert.equal(fmtDelta('project_progress', 5), '+3 ngày');
  assert.equal(fmtDelta('project_progress', -3, false), '1,8 ngày');
  assert.equal(fmtDelta('project_progress', 15), '+9 ngày');
  assert.equal(fmtDelta('budget', -15), '−15.000.000 VND');
  assert.equal(fmtDelta('project_risk', 10), '+10%');
  assert.equal(fmtDelta('product_quality', -3, false), '3%');
  assert.equal(fmtDelta('team_morale', 0), '0%');
});

test('applyChoice: cong/tru tai nguyen (add, vd team_size -1) tach khoi chi so', () => {
  const run = newRun();
  const changes = applyChoice(run, SC, choice({ effects: { budget: -10 }, add: { team_size: -1 } }));
  assert.deepEqual(run.resources, { team_size: 2, tooling_level: 0 });
  assert.deepEqual(changes, [{ key: 'budget', from: 100, to: 90 }]);
});

test('ket qua re nhanh (outcomes): lay ket qua dau tien khop, xet tren trang thai truoc khi chon', () => {
  const c = choice({
    id: 'C', competency: { PEOPLE: 3 },
    outcomes: [
      { id: 'C1', when: r => r.metrics.team_morale >= 55, effects: { team_morale: 10 }, flags: ['key_developer_retained'] },
      { id: 'C2', effects: { team_morale: -5 }, add: { team_size: -1 }, flags: ['key_developer_left'],
        delayed: [{ at: 'P3_S09', ifChoice: 'B', effects: { project_risk: 10 } }] },
    ],
  });
  const good = newRun();
  assert.equal(resolveOutcome(good, c).id, 'C1');
  assert.deepEqual(applyChoice(good, SC, c), [{ key: 'team_morale', from: 70, to: 80 }]);
  assert.deepEqual([good.choices[SC.id], good.outcomes[SC.id]], ['C', 'C1']);
  assert.deepEqual(good.flags, { key_developer_retained: true });
  assert.deepEqual(good.delayed, []);

  const low = newRun();
  low.metrics.team_morale = 50;
  applyChoice(low, SC, c);
  assert.equal(low.outcomes[SC.id], 'C2');
  assert.deepEqual([low.metrics.team_morale, low.resources.team_size], [45, 2]);
  assert.deepEqual(low.delayed, [{ at: 'P3_S09', ifChoice: 'B', effects: { project_risk: 10 }, source: `${SC.id}_C2` }]);
  assert.deepEqual(low.ratings, [{ scenario: SC.id, choice: 'C', competency: 'PEOPLE', rating: 3 }]);
  assert.equal(resolveOutcome(low, choice()), null);
});

test('mot chi so bi cong/tru nhieu lan trong cung buoc -> gop thanh mot thay doi; bu tru het thi bo', () => {
  const S06 = { id: 'P2_S06', day: 22 }, run = newRun();
  run.delayed = [{ at: 'P2_S06', ifChoice: 'C', effects: { project_progress: -3, project_risk: -10 } }];
  const changes = applyChoice(run, S06, choice({ id: 'C', effects: { project_progress: 5, project_risk: 10 } }));
  assert.deepEqual(changes, [{ key: 'project_progress', from: 40, to: 42 }]);
  assert.equal(run.metrics.project_risk, 10);
});

test('dueNotes: loi bao hau qua sap kich hoat khi vao canh / khi chon dung lua chon', () => {
  const run = newRun();
  run.delayed = [
    { at: 'P2_S05', effects: { project_progress: -5 }, note: 'vao canh' },
    { at: 'P2_S05', variant: 'v' },
    { at: 'P2_S06', ifChoice: 'C', effects: { project_progress: -3 }, note: 'chon C' },
  ];
  assert.deepEqual(dueNotes(run, 'P2_S05'), ['vao canh']);
  assert.deepEqual(dueNotes(run, 'P2_S06'), []);
  assert.deepEqual(dueNotes(run, 'P2_S06', 'C'), ['chon C']);
  assert.deepEqual(dueNotes(run, 'P2_S06', 'A'), []);
});

test('beginLevel: ke thua trang thai, dat giai doan + ngay dau level, ghi moc chi so dau level', () => {
  const run = newRun();
  run.metrics.budget = 75; run.flags.scope_unestimated = true; run.resources.tooling_level = 2;
  beginLevel(run, { phase: 'P2', day: 16 });
  assert.deepEqual([run.phase, run.day], ['P2', 16]);
  assert.equal(run.levelStart.P2.budget, 75);
  assert.equal(run.levelStart.P1.budget, 100);
  assert.deepEqual([run.flags, run.resources.tooling_level], [{ scope_unestimated: true }, 2]);
  run.metrics.budget = 60;
  assert.equal(run.levelStart.P2.budget, 75, 'moc la ban sao');
});

test('hau qua tri hoan: dat co, dieu kien chi so (below), ghi lai vao run.fired', () => {
  const S = { id: 'P3_S09', day: 33 };
  const run = newRun();
  run.delayed = [
    { at: 'P3_S09', flags: ['incident_severity_high'], effects: { budget: -10 }, note: 'a', source: 'P2_S06_DEADLINE_QUALITY_A' },
    { at: 'P3_S09', below: { team_morale: 40 }, effects: { project_risk: 10 }, note: 'b', source: 'x' },
  ];
  assert.deepEqual(dueNotes(run, S.id), ['a']);
  assert.deepEqual(enterScenario(run, S), [{ key: 'budget', from: 100, to: 90 }]);
  assert.deepEqual(run.flags, { incident_severity_high: true });
  assert.deepEqual(run.fired, [{ at: 'P3_S09', source: 'P2_S06_DEADLINE_QUALITY_A', note: 'a' }]);
  assert.deepEqual(run.delayed, []);
  const low = newRun();
  low.metrics.team_morale = 39;
  low.delayed = [{ at: 'P3_S09', below: { team_morale: 40 }, effects: { project_risk: 10 } }];
  assert.deepEqual(enterScenario(low, S), [{ key: 'project_risk', from: 10, to: 20 }]);
});
