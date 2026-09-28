// Tong ket level (logic thuan, khong DOM): xep loai, chi so dau/cuoi level, quy da dung, co nguy hiem,
// quyet dinh tot nhat, nang luc noi bat. Cau hinh xep loai / co / nhan xet nam trong noi dung level (src/content/levels.ts -> summary).
import { METRICS } from '../content/metrics.ts';
import { COMPETENCY } from '../content/competencies.ts';
import { pickTier } from './levels.ts';
import type { CompetencyCode, Level, Metrics } from '../content/schema.ts';
import type { Run } from './types.ts';

// So lieu xet xep loai tong ket (ctx cua dieu kien `tiers[].when`)
export interface SummaryFacts {
  risk: number; budget: number; dangers: number; zeroRating: boolean;
  metrics: Metrics; flags: Run['flags']; choices: Run['choices'];
}
export interface LevelDecision { no: string; title: string; choice: string; label: string; avg: number }
export interface CompetencyScore { code: CompetencyCode; label: string; score: number }
export type LevelSummaryReport = ReturnType<typeof summarize>;

// competency_score = round(sum(ratings) / count(ratings) * 100 / 3) – tai lieu muc 3 (Nang luc)
export const competencyScore = (ratings: number[]) => Math.round(ratings.reduce((a, r) => a + r, 0) / ratings.length * 100 / 3);

// level: { id, scenarios, summary: { tiers, dangerFlags } }; phase = khoa trong run.levelStart (vd 'P1')
export function summarize(run: Run, level: Level, phase: string) {
  const sm = level.summary;
  if (!sm) throw new Error(`${level.id} khong co tong ket`);
  const ids = new Set(level.scenarios.map(s => s.id));
  const ratings = run.ratings.filter(r => ids.has(r.scenario));
  const start = run.levelStart[phase];
  const dangers = Object.entries(sm.dangerFlags).filter(([f]) => run.flags[f]).map(([flag, text]) => ({ flag, text }));
  const x: SummaryFacts = {
    risk: run.metrics.project_risk, budget: run.metrics.budget,
    dangers: dangers.length, zeroRating: ratings.some(r => r.rating === 0),
    metrics: run.metrics, flags: run.flags, choices: run.choices,
  };
  const tier = pickTier(sm.tiers, x);
  if (!tier) throw new Error(`${level.id}: khong co xep loai nao khop (muc cuoi nen khong co when)`);

  // Quyet dinh da chon o tung tinh huong + diem nang luc trung binh cua lua chon do
  const decisions = level.scenarios.filter(s => run.choices[s.id]).map((s): LevelDecision => {
    const c = s.choices.find(c => c.id === run.choices[s.id])!, rs = Object.values(c.competency || {});
    return { no: s.no, title: s.title, choice: c.id, label: c.label, avg: rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0 };
  });
  // Tot nhat: diem trung binh cao nhat; bang nhau thi lay tinh huong som hon
  const best = decisions.reduce<LevelDecision | null>((b, d) => (!b || d.avg > b.avg ? d : b), null);

  // Nang luc noi bat: diem cao nhat theo cong thuc competency_score; bang nhau theo thu tu COMPETENCY
  const byComp = (Object.keys(COMPETENCY) as CompetencyCode[]).map(code => {
    const rs = ratings.filter(r => r.competency === code).map(r => r.rating);
    return rs.length ? { code, label: COMPETENCY[code], score: competencyScore(rs) } : null;
  }).filter(c => c != null);
  const topCompetency = byComp.reduce<CompetencyScore | null>((b, c) => (!b || c.score > b.score ? c : b), null);

  // Hau qua tri hoan tu quyet dinh truoc da quay lai trong level nay (co loi bao): nguon 'P1_S03_SCOPE_CHANGE_A' -> 'L1 · S03 · A'
  const returned = (run.fired || []).filter(f => ids.has(f.at) && f.note).map(f => {
    const m = f.source?.match(/^P(\d)_(S\d\d)_.*_([A-C]\d?)$/);
    return { at: f.at, from: m ? `L${m[1]} · ${m[2]} · ${m[3]}` : '', text: f.note };
  });

  return {
    tier, facts: x, dangers, returned, decisions, best, topCompetency, competencies: byComp,
    changes: METRICS.map(m => ({ key: m.key, from: start[m.key], to: run.metrics[m.key] })),
    budgetUsed: Math.max(0, start.budget - run.metrics.budget),
  };
}
