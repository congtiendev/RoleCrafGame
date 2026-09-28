// Luat cong/tru cua phien choi (docs/KICH_BAN_ROLECRAFT_PM60.md muc 3): chi so, co, nang luc, hau qua tri hoan.
// Logic thuan, khong dung DOM; luu cung session (session.ts). Dinh nghia chi so / hard fail: src/content/.
import { METRICS, METRIC, START_RESOURCES } from '../content/metrics.ts';
import { HARD_FAILS, TEAM_WORK } from '../content/campaign.ts';
import { check } from './conditions.ts';
import type { Choice, Delayed, Effects, Metric, MetricKey, Metrics, Outcome, Scenario, TeamWorkBonus } from '../content/schema.ts';
import type { Change, PendingDelayed, Run } from './types.ts';

const initial = () => Object.fromEntries(METRICS.map(m => [m.key, m.init])) as Metrics;

export function newRun(): Run {
  return {
    metrics: initial(),
    resources: { ...START_RESOURCES },
    day: 1, phase: 'P1',
    levelStart: { P1: initial() },   // chi so dau moi level (bang tong ket)
    flags: {},
    variants: {},         // scenarioId -> bien the mo canh do hau qua tri hoan dat (vd S08: requirement_changed_without_confirmation)
    ratings: [],          // [{ scenario, choice, competency, rating }] – nang luc, danh gia trong LMS, khong hien cho nguoi choi
    delayed: [],          // [{ at, effects?, flags?, variant?, ifChoice?, below?, note?, source }] – hau qua tri hoan: vao tinh
                          // huong `at` thi kich hoat; co ifChoice thi chi kich hoat khi chon dung lua chon do tai `at`;
                          // below = { chi so: nguong } chi kich hoat khi chi so duoi nguong (vd tinh than < 40)
    fired: [],            // [{ at, source, note }] – hau qua tri hoan da quay lai (bang tong ket: "Hau qua quay lai")
    choices: {},          // scenarioId -> 'A' | 'B' | 'C'
    levelsDone: [],       // level da xong tong ket (play/director.ts: choi tiep sang level sau)
    hardFails: [],        // ma that bai nghiem trong da tung xay ra (muc 9, allow_early_fail=false: van choi tiep, ket qua FAIL)
    outcomes: {},         // scenarioId -> ket qua re nhanh cua lua chon (vd S07 C -> 'C1' | 'C2'), xem resolveOutcome
  };
}

// Bat dau level sau (tai lieu muc 5 – Trang thai dau level): ke thua toan bo chi so, tai nguyen, co, nang luc, lich su;
// chi dat giai doan + ngay dau level va ghi chi so dau level cho bang tong ket. level: { phase, day }
export function beginLevel(run: Run, level: { phase: string; day: number }) {
  run.phase = level.phase; run.day = level.day;
  run.levelStart[level.phase] = { ...run.metrics };
  return run;
}

// Lua chon co ket qua phu thuoc lich su phien choi (khong ngau nhien, vd S07 C: C1 neu tinh than >= 55 va khong OT):
// choice.outcomes = [{ id, when? (dieu kien, conditions.ts), effects, add, flags, ... }] -> ket qua dau tien khop dieu kien (khong when = mac dinh)
export const resolveOutcome = (run: Run, choice: Choice): Outcome | null => choice.outcomes?.find(o => check(o.when, run)) || null;

// budget khong clamp tai 0 (de phat hien vuot ngan sach), chi giu trong mien -100..200
const clamp = (m: Metric, v: number) => Math.max(m.min, Math.min(m.max, v));

// Ap hieu ung { metric: delta } -> danh sach thay doi [{ key, from, to }] (bo qua chi so khong doi sau clamp)
function applyEffects(run: Run, effects: Effects | undefined): Change[] {
  const out: Change[] = [];
  for (const [key, d] of Object.entries(effects || {}) as [MetricKey, number][]) {
    const m = METRIC[key], from = run.metrics[key], to = clamp(m, from + d);
    run.metrics[key] = to;
    if (to !== from) out.push({ key, from, to });
  }
  return out;
}

// Mot chi so bi cong/tru nhieu lan trong cung buoc (lua chon + hau qua tri hoan) -> gop thanh mot thay doi from -> to cuoi;
// bu tru het thi bo
function merge(changes: Change[]): Change[] {
  const by = new Map<MetricKey, Change>();
  for (const c of changes) by.set(c.key, { key: c.key, from: by.get(c.key)?.from ?? c.from, to: c.to });
  return [...by.values()].filter(c => c.from !== c.to);
}

// Thu tu xu ly mot lua chon (muc 3 – Logic cong tru): ghi quyet dinh -> hieu ung -> clamp -> tai nguyen -> co
// -> hau qua tri hoan den han theo lua chon nay -> xep hau qua moi
// Lua chon co outcomes: hieu ung / tai nguyen / co lay tu ket qua khop (xet tren trang thai truoc khi chon), nang luc van
// tinh theo lua chon. add = cong/tru tai nguyen (increment_resource, vd team_size -1), set = dat tai nguyen.
export function applyChoice(run: Run, scenario: Scenario, choice: Choice): Change[] {
  run.choices[scenario.id] = choice.id;
  const o = resolveOutcome(run, choice);
  if (o) run.outcomes[scenario.id] = o.id;
  const changes: Change[] = [];
  for (const part of [choice, o].filter(p => p != null)) {
    changes.push(...applyEffects(run, part.effects));
    for (const [k, d] of Object.entries(part.add || {}) as [keyof Run['resources'], number][]) run.resources[k] += d;
    Object.assign(run.resources, part.set);                                     // vd tooling_level = 2
    (part.flags || []).forEach(f => { run.flags[f] = true; });
  }
  // hau qua cho lua chon tai tinh huong nay (vd licence dung chung + release tung phan o S06): ap mot lan, bo phan con lai
  const here = run.delayed.filter(d => d.at === scenario.id && d.ifChoice);
  run.delayed = run.delayed.filter(d => !(d.at === scenario.id && d.ifChoice));
  changes.push(...fire(run, here.filter(d => d.ifChoice === choice.id)));
  for (const [competency, rating] of Object.entries(choice.competency || {}) as [keyof NonNullable<Choice['competency']>, number][])
    run.ratings.push({ scenario: scenario.id, choice: choice.id, competency, rating });
  [choice, o].flatMap(p => p?.delayed || []).forEach(d => run.delayed.push({ ...d, source: `${scenario.id}_${o?.id || choice.id}` }));
  trackHardFails(run);
  return merge(changes);
}

// Vao tinh huong: kich hoat hau qua tri hoan den han (moi hau qua mot lan). Hau qua co ifChoice cho den luc chon.
// Tra ve thay doi chi so [{ key, from, to }]; bien the mo canh ghi vao run.variants.
export function enterScenario(run: Run, scenario: Scenario): Change[] {
  run.day = scenario.day;
  const due = run.delayed.filter(d => d.at === scenario.id && !d.ifChoice);
  run.delayed = run.delayed.filter(d => !due.includes(d));
  const changes = merge(fire(run, due));
  trackHardFails(run);
  return changes;
}

// Cuoi giai doan (truoc xet huy hop dong / tong ket): nhip lam viec cua team (content/campaign.ts: TEAM_WORK). Cac muc xet
// tren cung mot trang thai, moi level mot lan (mo lai phien khong cong lai). Tra ve muc khop + thay doi; da tinh -> null.
export function teamWork(run: Run, levelId: string): { bonuses: TeamWorkBonus[]; changes: Change[] } | null {
  if (run.worked?.includes(levelId)) return null;
  run.worked = [...(run.worked || []), levelId];
  const bonuses = TEAM_WORK.bonuses.filter(b => check(b.when, run));
  const changes = merge(bonuses.flatMap(b => applyEffects(run, b.effects)));
  trackHardFails(run);
  return { bonuses, changes };
}

export function trackHardFails(run: Run) {
  run.hardFails ||= [];                                       // ban luu cu chua co
  for (const f of HARD_FAILS) if (check(f.when, run) && !run.hardFails.includes(f.code)) run.hardFails.push(f.code);
}

// Dieu kien chi so cua hau qua (below: { team_morale: 40 } = chi khi tinh than < 40), xet tren trang thai luc den han
const holds = (run: Run, d: Delayed) => (Object.entries(d.below || {}) as [MetricKey, number][]).every(([k, v]) => run.metrics[k] < v);
// Kich hoat cac hau qua den han (da go khoi run.delayed): kiem dieu kien truoc (cung mot trang thai), roi dat bien the mo canh,
// co, cong/tru chi so; ghi vao run.fired. Khong thoa dieu kien thi bo (khong cho lai).
function fire(run: Run, due: PendingDelayed[]): Change[] {
  const on = due.filter(d => holds(run, d));
  run.fired ||= [];                                         // ban luu cu chua co
  return on.flatMap(d => {
    if (d.variant) run.variants[d.at] = d.variant;
    (d.flags || []).forEach(f => { run.flags[f] = true; });
    run.fired.push({ at: d.at, source: d.source, note: d.note || null });
    return applyEffects(run, d.effects);
  });
}

// Loi nhan cua hau qua tri hoan sap kich hoat tai tinh huong (goi TRUOC enterScenario / applyChoice): choiceId = null ->
// hau qua luc vao canh, co choiceId -> hau qua chi den khi chon lua chon do (ifChoice). Hau qua khong co note / khong thoa
// dieu kien chi so thi bo qua.
export const dueNotes = (run: Run, scenarioId: string, choiceId: string | null = null): string[] => run.delayed
  .filter(d => d.at === scenarioId && d.note && (choiceId ? d.ifChoice === choiceId : !d.ifChoice) && holds(run, d)).map(d => d.note!);

