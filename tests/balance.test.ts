// Can bang do kho (docs/KICH_BAN_ROLECRAFT_PM60.md muc 9 – "Nhip lam viec cua team"; src/content/campaign.ts: TEAM_WORK):
// nhip lam viec khop tai lieu, moi level tinh mot lan, va mo phong nhieu kieu nguoi choi cho ti le dat thu viec dung muc tieu.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRun, teamWork } from '../src/game/rules.ts';
import { teamWorkText } from '../src/game/campaign.ts';
import { TEAM_WORK } from '../src/content/campaign.ts';
import { DOC } from './helpers/scenarioDoc.ts';
import { playCampaign, player, ranked, rng } from './helpers/simulate.ts';

const S9 = DOC.slice(DOC.indexOf('### Nhịp làm việc của team'), DOC.indexOf('### Buộc thôi việc giữa chừng'));

test('bang nhip lam viec trong tai lieu khop TEAM_WORK (dieu kien + hieu ung)', () => {
  const rows = [...S9.matchAll(/^\| `(\w+) (>=|<) (\d+)` \| `(\w+) \+(\d+)` \|/gm)];
  assert.equal(rows.length, TEAM_WORK.bonuses.length);
  rows.forEach(([, key, op, v, eff, d], i) => {
    const b = TEAM_WORK.bonuses[i];
    assert.deepEqual(b.when, { var: `metrics.${key}`, [op === '>=' ? 'gte' : 'lt']: +v }, b.label);
    assert.deepEqual(b.effects, { [eff]: +d }, b.label);
  });
});

test('nhip lam viec: cong theo tung muc khop, moi level mot lan, thong bao dung', () => {
  const run = newRun();
  Object.assign(run.metrics, { team_morale: 80, project_risk: 20, product_quality: 90, project_progress: 40 });
  const w = teamWork(run, 'P1_ONBOARDING')!;
  assert.deepEqual(w.bonuses.map(b => b.label), ['tinh thần team từ 80%', 'chất lượng từ 80%'], 'rui ro 20 chua duoi 20');
  assert.equal(run.metrics.project_progress, 50);
  assert.equal(teamWorkText(w), 'Cuối giai đoạn, team làm thêm được 6 ngày khối lượng nhờ tinh thần team từ 80% và chất lượng từ 80%.');
  assert.equal(teamWork(run, 'P1_ONBOARDING'), null, 'mo lai phien: khong cong lai');
  assert.equal(run.metrics.project_progress, 50);
  run.metrics.project_risk = 10;
  assert.equal(teamWork(run, 'P2_INTEGRATION')!.changes[0].to, 65, 'du ba muc: +15');
  Object.assign(run.metrics, { team_morale: 50, project_risk: 50, product_quality: 50 });
  const none = teamWork(run, 'P3_EXPANSION')!;
  assert.deepEqual(none.changes, []);
  assert.equal(teamWorkText(none), TEAM_WORK.none);
});

// Muc tieu can bang (tai lieu muc 9): chon dung mot nua so lan da dat thu viec > 50%; chon dung het -> Pass xuat sac;
// chon bua van kho qua (< 50%) va de bi cho nghi.
test('mo phong: ti le dat thu viec theo kieu nguoi choi', () => {
  const N = 1500, rate = (p: number, seed: number) => {
    const rnd = rng(seed); let pass = 0, exit = 0;
    for (let i = 0; i < N; i++) {
      const { run, result } = playCampaign(p < 0 ? s => s.choices[Math.floor(rnd() * 3)] : player(p, rnd));
      if (result.code === 'PASS' || result.code === 'PASS_EXCELLENT') pass++;
      if (run.forcedExit) exit++;
    }
    return { pass: pass / N, exit: exit / N };
  };
  const random = rate(-1, 3), half = rate(0.5, 5), good = rate(0.7, 7);
  assert.ok(half.pass > 0.5, `dung 50%: dat ${half.pass}`);
  assert.ok(good.pass > 0.75, `dung 70%: dat ${good.pass}`);
  assert.ok(random.pass < 0.45, `ngau nhien: dat ${random.pass}`);
  assert.ok(random.exit > 0.2, `ngau nhien: bi cho nghi ${random.exit}`);
  assert.equal(playCampaign(s => ranked(s)[0]).result.code, 'PASS_EXCELLENT', 'chon dung het');
});
