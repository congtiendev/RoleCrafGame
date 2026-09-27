// Tong ket level (logic thuan, khong DOM): xep loai, chi so dau/cuoi level, quy da dung, co nguy hiem,
// quyet dinh tot nhat, nang luc noi bat. Cau hinh xep loai / co / nhan xet nam trong noi dung level (level1.js -> summary).
import { METRICS } from './rules.js';

export const COMPETENCY = {
  SCOPE: 'Quản trị phạm vi và thay đổi',
  RESOURCE: 'Quản trị nguồn lực và ngân sách',
  RISK: 'Quản trị rủi ro và chất lượng',
  PEOPLE: 'Lãnh đạo và phát triển đội ngũ',
  STAKEHOLDER: 'Giao tiếp với khách hàng và quản lý',
  DECISION: 'Ra quyết định và chịu trách nhiệm',
};

// competency_score = round(sum(ratings) / count(ratings) * 100 / 3) – tai lieu muc 3 (Nang luc)
export const competencyScore = ratings => Math.round(ratings.reduce((a, r) => a + r, 0) / ratings.length * 100 / 3);

// level: { id, scenarios, summary: { tiers, dangerFlags } }; phase = khoa trong run.levelStart (vd 'P1')
export function summarize(run, level, phase) {
  const ids = new Set(level.scenarios.map(s => s.id));
  const ratings = run.ratings.filter(r => ids.has(r.scenario));
  const start = run.levelStart[phase];
  const dangers = Object.entries(level.summary.dangerFlags).filter(([f]) => run.flags[f]).map(([flag, text]) => ({ flag, text }));
  const x = {
    risk: run.metrics.project_risk, budget: run.metrics.budget,
    dangers: dangers.length, zeroRating: ratings.some(r => r.rating === 0),
    metrics: run.metrics, flags: run.flags, choices: run.choices,
  };
  const tier = level.summary.tiers.find(t => t.when(x));

  // Quyet dinh da chon o tung tinh huong + diem nang luc trung binh cua lua chon do
  const decisions = level.scenarios.filter(s => run.choices[s.id]).map(s => {
    const c = s.choices.find(c => c.id === run.choices[s.id]), rs = Object.values(c.competency || {});
    return { no: s.no, title: s.title, choice: c.id, label: c.label, avg: rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0 };
  });
  // Tot nhat: diem trung binh cao nhat; bang nhau thi lay tinh huong som hon
  const best = decisions.reduce((b, d) => (!b || d.avg > b.avg ? d : b), null);

  // Nang luc noi bat: diem cao nhat theo cong thuc competency_score; bang nhau theo thu tu COMPETENCY
  const byComp = Object.keys(COMPETENCY).map(code => {
    const rs = ratings.filter(r => r.competency === code).map(r => r.rating);
    return rs.length ? { code, label: COMPETENCY[code], score: competencyScore(rs) } : null;
  }).filter(Boolean);
  const topCompetency = byComp.reduce((b, c) => (!b || c.score > b.score ? c : b), null);

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
