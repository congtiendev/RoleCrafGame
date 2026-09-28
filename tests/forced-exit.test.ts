// Buoc thoi viec giua chung (docs/KICH_BAN_ROLECRAFT_PM60.md muc 9 – "Buoc thoi viec giua chung"; src/content/campaign.ts):
// bang dieu kien khop tai lieu, xet dung nguong + dung thoi diem, ket qua FAIL kem ngay dung, canh ket thuc dung dong tac co that.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { newRun } from '../src/game/rules.ts';
import { campaignResult, campaignReport, checkForcedExit, reportText } from '../src/game/campaign.ts';
import { FORCED_EXITS, FORCED_EXIT_SCENE } from '../src/content/campaign.ts';
import { CAST } from '../src/content/cast.ts';
import { LEVELS } from '../src/game/levels.ts';
import ATLAS from '../src/generated/atlas.ts';
import { pub, DOC, SCENES, FACES, npcLine } from './helpers/scenarioDoc.ts';
import { playCampaign, rng } from './helpers/simulate.ts';

const S9 = DOC.slice(DOC.indexOf('### Buộc thôi việc giữa chừng'), DOC.indexOf('### Điều kiện'));

test('bang dieu kien trong tai lieu khop FORCED_EXITS (ma + thoi diem xet)', () => {
  const rows = [...S9.matchAll(/^\| `(EXIT_\w+)` \| .+ \| (.+) \|$/gm)].map(m => [m[1], m[2]]);
  assert.deepEqual(rows.map(r => r[0]), FORCED_EXITS.map(f => f.code));
  for (const [code, at] of rows) {
    const f = FORCED_EXITS.find(x => x.code === code)!;
    assert.equal(f.check === 'choice', at.startsWith('Sau mỗi lựa chọn'), code);
  }
});

test('xet dung nguong: quy < 20, rui ro >= 100 sau lua chon; tien do < 30 chi o moc cuoi giai doan 2–4', () => {
  const run = newRun();
  assert.equal(checkForcedExit(run, 'choice', 1), null, 'trang thai dau: khong bi cho nghi');
  run.metrics.budget = 20; assert.equal(checkForcedExit(run, 'choice', 1), null, 'dung 20 trieu: con duoc');
  run.metrics.budget = 19; assert.equal(checkForcedExit(run, 'choice', 1)?.code, 'EXIT_BUDGET_DEPLETED');
  run.metrics.budget = 50; run.metrics.project_risk = 99; assert.equal(checkForcedExit(run, 'choice', 3), null);
  run.metrics.project_risk = 100; assert.equal(checkForcedExit(run, 'choice', 3)?.code, 'EXIT_RISK_OUT_OF_CONTROL');
  run.metrics.project_risk = 50; run.metrics.project_progress = 29;
  assert.equal(checkForcedExit(run, 'choice', 2), null, 'tien do chi xet o moc cuoi giai doan');
  assert.equal(checkForcedExit(run, 'levelEnd', 1), null, 'giai doan 1 (dang tiep quan) khong xet');
  for (const lv of [2, 3, 4]) assert.equal(checkForcedExit(run, 'levelEnd', lv)?.code, 'EXIT_CONTRACT_CANCELLED', `L${lv}`);
  run.metrics.project_progress = 30; assert.equal(checkForcedExit(run, 'levelEnd', 2), null);
});

test('ket qua: FAIL "Buoc thoi viec" kem ly do + ngay dung; bao cao chu ghi ngay dung', () => {
  const run = newRun();
  run.day = 22; run.metrics.project_risk = 100;
  run.forcedExit = { code: 'EXIT_RISK_OUT_OF_CONTROL', day: 22, level: 'P2_INTEGRATION' };
  const r = campaignResult(run);
  assert.equal(r.code, 'FAIL');
  assert.equal(r.label, 'Buộc thôi việc');
  assert.match(r.title, /^BUỘC THÔI VIỆC – RỦI RO MẤT KIỂM SOÁT$/);
  assert.deepEqual(r.forced, { code: 'EXIT_RISK_OUT_OF_CONTROL', label: 'Rủi ro mất kiểm soát', day: 22 });
  assert.equal(r.reasons[0], FORCED_EXITS[1].reason);
  const txt = reportText(campaignReport(run, LEVELS), 'An', (k, v) => `${k}=${v}`, k => k);
  assert.match(txt, /CHỈ SỐ NGÀY 1 → NGÀY 22/);
  // khong bi cho nghi: ket qua nhu cu, khong co forced
  assert.equal(campaignResult(newRun()).forced, undefined);
});

test('canh ket thuc: nen co du PC + mobile, nguoi noi co mat, dong tac / chan dung co that, dong cuoi PM roi canh', () => {
  const sc = SCENES[FORCED_EXIT_SCENE.bg];
  assert.ok(sc, FORCED_EXIT_SCENE.bg);
  for (const f of ['pc', 'mobile'] as const) assert.ok(existsSync(new URL(`bg/${sc[f]}`, pub)));
  for (const id of FORCED_EXIT_SCENE.cast) assert.ok(CAST[id], id);
  for (const f of FORCED_EXITS) {
    for (const l of f.lines) {
      assert.ok(['PM', 'NARR'].includes(l.who) || FORCED_EXIT_SCENE.cast.includes(l.who), `${f.code}: ${l.who}`);
      if (l.pm) assert.ok(ATLAS.anims[l.pm], `${f.code}: dong tac ${l.pm}`);
      if (l.face) assert.ok(FACES.has(l.face), `${f.code}: ${l.face}`);
      npcLine(l);
    }
    const last = f.lines.at(-1)!;
    assert.ok(last.exit && ATLAS.anims[last.exit], `${f.code}: dong cuoi PM roi canh`);
  }
});

test('choi ngau nhien co dung game: moi lan bi cho nghi deu dung truoc ngay 60 va khong con lua chon sau do', () => {
  const rnd = rng(11);
  let stopped = 0;
  for (let n = 0; n < 2000; n++) {
    const { run, result } = playCampaign(s => s.choices[Math.floor(rnd() * 3)]);
    if (run.forcedExit) {
      stopped++;
      assert.equal(result.code, 'FAIL');
      assert.ok(result.forced!.day <= 60);
    }
  }
  assert.ok(stopped > 0 && stopped < 2000, `${stopped}/2000 bi cho nghi`);
});
