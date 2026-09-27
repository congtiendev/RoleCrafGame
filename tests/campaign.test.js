// Choi noi tiep Level 1 -> Level 2 -> Level 3 tren cung mot phien (logic thuan, nhu LevelScreen): hau qua tri hoan cua Level 1 kich
// hoat o Level 2, tong ket Level 2 chi tinh lua chon Level 2, chay du 81 x 81 duong di.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRun, beginLevel, applyChoice, enterScenario, dueNotes, METRICS } from '../src/game/rules.js';
import { summarize } from '../src/game/summary.js';
import { LEVEL1 } from '../src/game/level1.js';
import { LEVEL2 } from '../src/game/level2.js';
import { LEVEL3 } from '../src/game/level3.js';

// picks: 'ACCA' = tinh huong 1 chon A, 2 chon C... notes: scenarioId -> loi bao hau qua tri hoan (vao canh + luc chon)
function playLevel(run, level, picks, notes = {}) {
  if (level !== LEVEL1) beginLevel(run, level);
  level.scenarios.forEach((s, i) => {
    const c = s.choices.find(x => x.id === picks[i]);
    notes[s.id] = [...dueNotes(run, s.id), ...dueNotes(run, s.id, c.id)];
    enterScenario(run, s);
    applyChoice(run, s, c);
  });
  return notes;
}
function campaign(p1, p2) {
  const run = newRun(), notes = {};
  playLevel(run, LEVEL1, p1, notes);
  playLevel(run, LEVEL2, p2, notes);
  return { run, notes, r: summarize(run, LEVEL2, 'P2') };
}
const PATHS = [];
for (const a of 'ABC') for (const b of 'ABC') for (const c of 'ABC') for (const d of 'ABC') PATHS.push(a + b + c + d);
const [S05, S06] = LEVEL2.scenarios;

test('Level 2 ke thua trang thai Level 1: moc chi so dau Level 2 = chi so cuoi Level 1', () => {
  const run = newRun();
  playLevel(run, LEVEL1, 'ACCA');
  const end1 = { ...run.metrics };
  playLevel(run, LEVEL2, 'CCCC');
  assert.deepEqual(run.levelStart.P2, end1);
  assert.equal(run.day, 30);
});

test('S03 A (nhan them tinh nang chua estimate): vao S05 tien do -5, rui ro +5 kem loi bao; S08 mo bien the 1', () => {
  const a = newRun(); playLevel(a, LEVEL1, 'ACAA'); beginLevel(a, LEVEL2);
  const b = newRun(); playLevel(b, LEVEL1, 'ACCA'); beginLevel(b, LEVEL2);
  assert.deepEqual(dueNotes(a, S05.id), ['Hai chức năng bổ sung mất nhiều thời gian hơn dự kiến. Dự án A đang chậm so với kế hoạch.']);
  assert.deepEqual(enterScenario(a, S05).map(c => [c.key, c.to - c.from]), [['project_progress', -5], ['project_risk', 5]]);
  assert.deepEqual(enterScenario(b, S05), []);
  assert.equal(campaign('ACAA', 'CCCC').run.variants.P2_S08_CUSTOMER_COMPLAINT, 'requirement_changed_without_confirmation');
});

test('S02 B (Senior toan quyen): S08 mo bien the 1 va co loi bao hau qua khi vao canh', () => {
  const { run, notes } = campaign('ABCA', 'CCCC');
  assert.equal(run.variants.P2_S08_CUSTOMER_COMPLAINT, 'requirement_changed_without_confirmation');
  assert.equal(notes.P2_S08_CUSTOMER_COMPLAINT.length, 1);
  assert.equal(campaign('ACCA', 'CCCC').run.variants.P2_S08_CUSTOMER_COMPLAINT, undefined);
});

test('S04 C (licence dung chung): chi release tung phan o S06 moi cham them 3 diem tien do (gop mot thay doi)', () => {
  for (const [pick, extra] of [['C', -3], ['A', 0], ['B', 0]]) {
    const run = newRun(); playLevel(run, LEVEL1, 'ACCC'); beginLevel(run, LEVEL2);
    enterScenario(run, S05); applyChoice(run, S05, S05.choices[2]); enterScenario(run, S06);
    const c = S06.choices.find(x => x.id === pick), p0 = run.metrics.project_progress;
    assert.equal(dueNotes(run, S06.id, pick).length, pick === 'C' ? 1 : 0, pick);
    const changes = applyChoice(run, S06, c);
    assert.equal(run.metrics.project_progress - p0, c.effects.project_progress + extra, pick);
    assert.equal(changes.filter(x => x.key === 'project_progress').length, 1, `${pick}: mot the tien do`);
    assert.deepEqual(run.delayed.filter(d => d.at === S06.id), [], 'hau qua da ap / da huy');
  }
});

test('S05 B (OT hai tuan) -> S07 C thanh C2: Huy nghi, team con 2 nguoi', () => {
  const { run } = campaign('ACCA', 'BCCC');
  assert.equal(run.outcomes.P2_S07_KEY_PERSON_RETENTION, 'C2');
  assert.ok(run.flags.key_developer_left);
  assert.equal(run.resources.team_size, 2);
  assert.equal(campaign('ACCA', 'CCCC').run.outcomes.P2_S07_KEY_PERSON_RETENTION, 'C1');
});

test('Tong ket: CCCC sau Level 1 tot -> Hoa nhap xuat sac, chi tinh quyet dinh Level 2', () => {
  const { r } = campaign('ACCA', 'CCCC');
  assert.equal(r.tier.id, 'excellent');
  assert.deepEqual(r.decisions.map(d => d.no + d.choice), ['S05C', 'S06C', 'S07C', 'S08C']);
  assert.deepEqual(r.dangers, []);
  assert.equal(r.changes.length, METRICS.length);
});

test('Tong ket: khong co dau hieu nguy hiem nhung complain chi dap tat -> Hoa nhap on dinh', () => {
  assert.equal(campaign('ACCA', 'ABAB').r.tier.id, 'stable');
});

test('Tong ket: mot dau hieu (OT) -> Can than trong; 3/4 dau hieu -> Nguy co mat kiem soat', () => {
  assert.equal(campaign('ACCA', 'BCAC').r.tier.id, 'caution');
  const lost = campaign('ACCA', 'BABA').r;
  assert.equal(lost.tier.id, 'lost');
  assert.equal(lost.tier.mood, 'bad');
  assert.deepEqual(lost.dangers.map(d => d.flag).sort(), ['key_developer_left', 'regression_test_skipped', 'team_ot_14_days']);
});

test('moi to hop 81 x 81 duong di L1 -> L2: xep loai hop le, chi so trong mien, team con it nhat 2 nguoi', () => {
  const seen = new Set();
  for (const p1 of PATHS) for (const p2 of PATHS) {
    const { run, r } = campaign(p1, p2);
    assert.ok(r.tier && ['good', 'mid', 'bad'].includes(r.tier.mood), p1 + p2);
    assert.equal(r.decisions.length, 4);
    for (const m of METRICS) {
      const v = run.metrics[m.key];
      assert.ok(Number.isFinite(v) && v >= m.min && v <= m.max, `${p1} ${p2} ${m.key}`);
    }
    assert.ok(run.resources.team_size >= 2);
    assert.equal(run.day, 30);
    seen.add(r.tier.id);
  }
  assert.deepEqual([...seen].sort(), ['caution', 'excellent', 'lost', 'stable']);   // ca 4 muc deu dat duoc
});

// ---------- Level 3 ----------
function campaign3(p1, p2, p3) {
  const run = newRun(), notes = {};
  playLevel(run, LEVEL1, p1, notes);
  playLevel(run, LEVEL2, p2, notes);
  playLevel(run, LEVEL3, p3, notes);
  return { run, notes, r: summarize(run, LEVEL3, 'P3') };
}
const [S09] = LEVEL3.scenarios;
// trang thai ngay truoc khi vao S09
function beforeS09(p1, p2) {
  const run = newRun();
  playLevel(run, LEVEL1, p1); playLevel(run, LEVEL2, p2); beginLevel(run, LEVEL3);
  return run;
}

test('S06 A (bo regression): vao S09 su co nghiem trong – bien the thanh toan, co incident_severity_high, cong/tru theo ma tran', () => {
  const run = beforeS09('ACCA', 'CACC'), m0 = { ...run.metrics };
  assert.equal(dueNotes(run, S09.id).length, 3, 'review ngay 1 (S01 A) + regression + Huy o lai (C1)');
  const ch = enterScenario(run, S09);
  assert.equal(run.variants[S09.id], 'critical_payment_incident');
  assert.ok(run.flags.incident_severity_high);
  const d = Object.fromEntries(ch.map(c => [c.key, c.to - c.from]));
  assert.deepEqual(d, { budget: -10, team_morale: -5, client_trust: -15, project_risk: 20 });
  assert.equal(run.metrics.budget, m0.budget - 10);
  const safe = beforeS09('ACCA', 'CCCC');
  enterScenario(safe, S09);
  assert.equal(safe.variants[S09.id], undefined);
  assert.ok(!safe.flags.incident_severity_high);
});

test('S01 B (bo review) -> S09 rui ro +10; S01 A -> loi bao co so do he thong (khong cong tru)', () => {
  const b = beforeS09('BCCA', 'CCCC'), r0 = b.metrics.project_risk;
  enterScenario(b, S09);
  assert.equal(b.metrics.project_risk, Math.min(100, r0 + 10));
  const a = beforeS09('ACCA', 'CCCC');
  assert.ok(dueNotes(a, S09.id).some(n => n.startsWith('Sơ đồ hệ thống')));
  assert.deepEqual(enterScenario(a, S09), []);
});

test('Huy nghi (S07 B) + S09 chi cu mot dev: them tien do -5, rui ro +10 kem loi bao; chon A thi khong', () => {
  for (const [pick, dp, dr] of [['B', -5, 10], ['A', 0, 0]]) {
    const run = beforeS09('ACCA', 'CCBC'); enterScenario(run, S09);
    const c = S09.choices.find(x => x.id === pick), p0 = run.metrics.project_progress, r0 = run.metrics.project_risk;
    assert.equal(dueNotes(run, S09.id, pick).length, pick === 'B' ? 1 : 0);
    applyChoice(run, S09, c);
    assert.equal(run.metrics.project_progress, Math.max(0, p0 + (c.effects.project_progress || 0) + dp), pick);
    assert.equal(run.metrics.project_risk, Math.max(0, Math.min(100, r0 + (c.effects.project_risk || 0) + dr)), pick);
  }
});

test('S12 A (nhan du an thieu nguon luc): hau qua cho toi truoc Final Review, chi khi tinh than < 40', () => {
  const { run } = campaign3('ACCA', 'CCCC', 'CCCA');
  assert.deepEqual(run.delayed.map(d => [d.at, d.below, d.effects]),
    [['P4_S16_FINAL_REVIEW', { team_morale: 40 }, { project_risk: 10 }]]);
  const S16 = { id: 'P4_S16_FINAL_REVIEW', day: 60 };
  const high = structuredClone(run); high.metrics.team_morale = 60;
  assert.deepEqual([dueNotes(high, S16.id), enterScenario(high, S16)], [[], []]);
  assert.deepEqual(high.delayed, [], 'khong thoa dieu kien: bo, khong cho lai');
  const low = structuredClone(run); low.metrics.team_morale = 35;
  assert.equal(dueNotes(low, S16.id).length, 1);
  assert.deepEqual(enterScenario(low, S16).map(c => c.key), ['project_risk']);
});

test('S12 C: them mot nguoi vao team; tong ket Level 3 liet ke hau qua quay lai tu Level 1/2', () => {
  const { run, r } = campaign3('BCCA', 'CACC', 'CCCC');
  assert.equal(run.resources.team_size, 4);
  assert.deepEqual(r.returned.map(f => f.from).sort(), ['L1 · S01 · B', 'L2 · S06 · A', 'L2 · S07 · C1']);
  assert.ok(r.returned.every(f => f.text));
  assert.deepEqual(r.decisions.map(d => d.no), ['S09', 'S10', 'S11', 'S12']);
  // tong ket Level 2 cung liet ke hau qua tu Level 1 da quay lai o Level 2
  assert.deepEqual(summarize(campaign('ACAC', 'CCCC').run, LEVEL2, 'P2').returned.map(f => f.from), ['L1 · S03 · A', 'L1 · S04 · C']);
});

test('Level 3: moi to hop L2 x L3 (81 x 81) voi 4 duong Level 1 dai dien – xep loai hop le, chi so trong mien', () => {
  const seen = new Set();
  for (const p1 of ['ACCA', 'BBAC', 'CCCA', 'AABB']) for (const p2 of PATHS) for (const p3 of PATHS) {
    const { run, r } = campaign3(p1, p2, p3);
    assert.ok(r.tier && ['good', 'mid', 'bad'].includes(r.tier.mood), p1 + p2 + p3);
    for (const m of METRICS) {
      const v = run.metrics[m.key];
      assert.ok(Number.isFinite(v) && v >= m.min && v <= m.max, `${p1} ${p2} ${p3} ${m.key}`);
    }
    assert.ok(run.resources.team_size >= 2 && run.resources.team_size <= 4);
    assert.equal(run.day, 45);
    seen.add(r.tier.id);
  }
  assert.deepEqual([...seen].sort(), ['caution', 'crisis', 'excellent', 'stable']);
});
