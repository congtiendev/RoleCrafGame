// Ket qua campaign 60 ngay (src/game/campaign.js) – docs/KICH_BAN_ROLECRAFT_PM60.md muc 9: thu tu xet FAIL -> Pass xuat sac
// -> Pass -> Gia han, chi so critical, that bai nghiem trong (ghi nhan ngay khi xay ra), bao cao cuoi; choi du 4 level.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRun, beginLevel, applyChoice, enterScenario, METRICS, HARD_FAILS } from '../src/game/rules.js';
import { campaignResult, campaignReport, reportText, CRITICAL, ENDINGS } from '../src/game/campaign.js';
import { DOC } from './helpers/scenarioDoc.js';
import { LEVEL1 } from '../src/game/level1.js';
import { LEVEL2 } from '../src/game/level2.js';
import { LEVEL3 } from '../src/game/level3.js';
import { LEVEL4 } from '../src/game/level4.js';

const LEVELS = [LEVEL1, LEVEL2, LEVEL3, LEVEL4];
// picks: 16 chu cai, 4 tinh huong / level
function play(picks) {
  const run = newRun();
  LEVELS.forEach((lv, j) => {
    if (j) beginLevel(run, lv);
    lv.scenarios.forEach((s, i) => { enterScenario(run, s); applyChoice(run, s, s.choices.find(c => c.id === picks[j * 4 + i])); });
  });
  return run;
}
// trang thai gia de xet dieu kien: chi so tot, doi tung chi so
const good = (m = {}, extra = {}) => ({
  metrics: { budget: 50, project_progress: 80, product_quality: 80, team_morale: 70, client_trust: 80, management_trust: 85, project_risk: 20, ...m },
  resources: { team_size: 3, tooling_level: 0 }, flags: {}, hardFails: [], ...extra,
});
const S9 = DOC.slice(DOC.indexOf('## 9. Kết quả campaign'), DOC.indexOf('## 10.'));

test('chi so critical va that bai nghiem trong dung danh sach muc 9', () => {
  const crit = S9.split('critical_metric_count = count([')[1].split('])')[0].trim().split(/,\s*/);
  assert.equal(CRITICAL.length, crit.length);
  const hard = [...S9.matchAll(/^\| `(FAIL_\w+)` \|/gm)].map(m => m[1]);
  assert.deepEqual(HARD_FAILS.map(f => f.code), hard);
});

test('thu tu xet: Pass xuat sac -> Pass -> Gia han -> FAIL theo tung nguong', () => {
  assert.equal(campaignResult(good()).code, 'PASS_EXCELLENT');
  assert.equal(campaignResult(good({}, { flags: { final_report_opaque: true } })).code, 'PASS', 'bao cao che giau: khong xuat sac');
  assert.equal(campaignResult(good({ management_trust: 79 })).code, 'PASS');
  assert.equal(campaignResult(good({ project_progress: 74 })).code, 'PASS');
  assert.equal(campaignResult(good({ management_trust: 59 })).code, 'EXTEND_PROBATION');
  assert.equal(campaignResult(good({ product_quality: 39 })).code, 'EXTEND_PROBATION', 'mot chi so critical');
  assert.equal(campaignResult(good({ product_quality: 39, budget: 5 })).code, 'FAIL', 'hai chi so critical');
  assert.equal(campaignResult(good({ management_trust: 39 })).code, 'FAIL');
  // quan ly >= 60, tien do 50–59, khong critical: tai lieu khong khop muc nao -> Gia han
  assert.equal(campaignResult(good({ project_progress: 55 })).code, 'EXTEND_PROBATION');
});

test('that bai nghiem trong: ghi nhan ngay khi xay ra, hoi phuc sau van FAIL', () => {
  const run = newRun();
  run.metrics.budget = 5;
  applyChoice(run, { id: 'X', day: 1 }, { id: 'A', effects: { budget: -10 } });
  assert.deepEqual(run.hardFails, ['FAIL_BUDGET_OVERRUN']);
  applyChoice(run, { id: 'Y', day: 2 }, { id: 'A', effects: { budget: 60 } });
  assert.deepEqual(run.hardFails, ['FAIL_BUDGET_OVERRUN'], 'khong ghi lap, khong xoa');
  const r = campaignResult({ ...good(), hardFails: run.hardFails });
  assert.equal(r.code, 'FAIL');
  assert.deepEqual(r.reasons, ['Vượt ngân sách dự án']);
});

test('duong di tieu bieu: tung ket thuc va vuot ngan sach giua chung', () => {
  assert.equal(campaignResult(play('BACABCBACCCCCCCC')).code, 'PASS_EXCELLENT');
  assert.equal(campaignResult(play('CBABACBACBACAABC')).code, 'PASS');
  assert.equal(campaignResult(play('ACCACCCCCCCCCCCC')).code, 'EXTEND_PROBATION');
  const bad = play('BBACBABABAAAAAAA');
  assert.equal(campaignResult(bad).code, 'FAIL');
  assert.ok(bad.hardFails.includes('FAIL_TEAM_COLLAPSED'));
  // quy am o S12 C (L1 AA, L2 A-A-A-B, bo regression) roi duong lai o S15 A: van FAIL vi da vuot ngan sach
  const over = play('AAAAAAABCCCCCCAC');
  assert.ok(over.hardFails.includes('FAIL_BUDGET_OVERRUN'));
  assert.ok(over.metrics.budget >= 0);
  assert.equal(campaignResult(over).code, 'FAIL');
});

test('bao cao cuoi: 16 quyet dinh, 7 chi so ngay 1 -> 60, 6 nang luc, 3 tot / 3 hau qua, quyet dinh cu -> hau qua, bao cao chu', () => {
  const run = play('BCBCABCBCCCACCBC'), rep = campaignReport(run, LEVELS);
  assert.equal(rep.decisions.length, 16);
  assert.deepEqual(rep.changes.map(c => c.key), METRICS.map(m => m.key));
  assert.deepEqual(rep.changes.map(c => c.from), METRICS.map(m => m.init));
  assert.equal(rep.competencies.length, 6);
  assert.ok(rep.competencies.every(c => c.score == null || (c.score >= 0 && c.score <= 100)));
  assert.equal(rep.best.length, 3); assert.equal(rep.worst.length, 3);
  assert.ok(rep.best[0].avg >= rep.best[2].avg && rep.worst[0].avg <= rep.worst[2].avg);
  assert.equal(rep.learning.length, 2);
  assert.ok(rep.learning.every(l => l.text));
  assert.ok(rep.links.length >= 2 && rep.links.every(l => l.from && l.to && l.text));
  const txt = reportText(rep, 'Trần Quốc Bảo', (k, v) => `${k}=${v}`, k => k);
  assert.match(txt, /KẾT QUẢ: /);
  assert.equal(txt.match(/^ {2}L\d S\d\d · /gm).length, 16);
});

test('4 ket thuc deu dat duoc; moi duong di (mau ngau nhien co dinh) ra ket qua hop le', () => {
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const seen = new Set();
  for (let k = 0; k < 20000; k++) {
    const p = Array.from({ length: 16 }, () => 'ABC'[Math.floor(rnd() * 3)]).join('');
    const run = play(p), r = campaignResult(run);
    assert.ok(ENDINGS[r.code], p);
    assert.equal(run.day, 60);
    for (const m of METRICS) assert.ok(run.metrics[m.key] >= m.min && run.metrics[m.key] <= m.max, `${p} ${m.key}`);
    seen.add(r.code);
  }
  assert.deepEqual([...seen].sort(), Object.keys(ENDINGS).sort());
});
