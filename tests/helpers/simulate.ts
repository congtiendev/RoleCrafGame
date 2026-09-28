// Choi tu dong ca campaign theo dung thu tu cua director (play/director.ts): vao tinh huong -> chon -> xet buoc thoi viec;
// cuoi level: nhip lam viec cua team -> xet huy hop dong. Dung cho mo phong can bang + kiem tra buoc thoi viec.
import { newRun, beginLevel, enterScenario, applyChoice, teamWork } from '../../src/game/rules.ts';
import { campaignResult, checkForcedExit } from '../../src/game/campaign.ts';
import { LEVELS } from '../../src/game/levels.ts';
import type { Choice, Scenario } from '../../src/content/schema.ts';

export const choiceAvg = (c: Choice) => { const v = Object.values(c.competency || {}); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };
// Lua chon xep theo diem nang luc trung binh, cao -> thap ([0] = phuong an tot nhat)
export const ranked = (s: Scenario) => [...s.choices].sort((a, b) => choiceAvg(b) - choiceAvg(a));

// Ngau nhien co hat giong (lap lai duoc)
export const rng = (seed: number) => () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

export function playCampaign(pick: (s: Scenario) => Choice) {
  const run = newRun();
  outer: for (const [j, L] of LEVELS.entries()) {
    if (j) beginLevel(run, L);
    for (const s of L.scenarios) {
      enterScenario(run, s); applyChoice(run, s, pick(s));
      const f = checkForcedExit(run, 'choice', L.no);
      if (f) { run.forcedExit = { code: f.code, day: run.day, level: L.id }; break outer; }
    }
    teamWork(run, L.id);
    const f = checkForcedExit(run, 'levelEnd', L.no);
    if (f) { run.forcedExit = { code: f.code, day: run.day, level: L.id }; break; }
  }
  return { run, result: campaignResult(run) };
}

// Nguoi choi chon dung phuong an tot nhat voi xac suat p, con lai chon ngau nhien mot trong hai phuong an kia
export const player = (p: number, rnd: () => number) => (s: Scenario) =>
  rnd() < p ? ranked(s)[0] : ranked(s)[1 + Math.floor(rnd() * 2)];
