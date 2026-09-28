// Ket qua campaign 60 ngay (docs/KICH_BAN_ROLECRAFT_PM60.md muc 9) + du lieu man ket qua cuoi. Logic thuan, khong DOM.
import { METRICS } from '../content/metrics.ts';
import { COMPETENCY, LEARNING } from '../content/competencies.ts';
import { HARD_FAILS, CRITICAL, ENDINGS, FORCED_EXITS, TEAM_WORK } from '../content/campaign.ts';
import { competencyScore } from './summary.ts';
import { check, fill } from './conditions.ts';
import { fmtDelta } from './format.ts';
import type { CompetencyCode, EndingCode, EndingInfo, ForcedExit, HardFail, Critical, Level, MetricKey, TeamWorkBonus } from '../content/schema.ts';
import type { Change, Run } from './types.ts';

export interface CampaignResult extends EndingInfo {
  code: EndingCode; critical: Critical[]; hardFails: HardFail[]; reasons: string[];
  forced?: { code: string; label: string; day: number };   // buoc thoi viec giua chung (ngay dung game)
}

// Buoc thoi viec: dieu kien dau tien khop tai thoi diem xet ('choice' sau moi lua chon, 'levelEnd' o moc cuoi level levelNo)
export const checkForcedExit = (run: Run, at: ForcedExit['check'], levelNo: number): ForcedExit | null =>
  FORCED_EXITS.find(f => f.check === at && levelNo >= (f.fromLevel ?? 1) && check(f.when, run)) ?? null;
// Thong bao nhip lam viec cua team (rules.ts: teamWork): "…team làm thêm được 9 ngày khối lượng nhờ a, b và c."
export function teamWorkText(w: { bonuses: TeamWorkBonus[]; changes: Change[] }): string {
  if (!w.changes.length) return TEAM_WORK.none;
  const labels = w.bonuses.map(b => b.label);
  const reasons = labels.length > 1 ? `${labels.slice(0, -1).join(', ')} và ${labels.at(-1)}` : labels[0];
  return fill(TEAM_WORK.done, { gain: w.changes.map(c => fmtDelta(c.key, c.to - c.from, false)).join(', '), reasons });
}
// Mot quyet dinh trong hanh trinh (bao cao cuoi): avg = diem nang luc trung binh cua lua chon
export interface Decision {
  level: number; id: string; no: string; title: string; choice: string; label: string; result: string; avg: number;
}
export interface Report {
  result: CampaignResult; decisions: Decision[]; best: Decision[]; worst: Decision[];
  competencies: { code: CompetencyCode; label: string; score: number | null }[];
  learning: { code: CompetencyCode; label: string; score: number | null; text: string }[];
  links: { from: string; to: string; text: string }[];
  changes: Change[];
}

// Xet theo thu tu FAIL -> Pass xuat sac -> Pass -> Gia han, dung o ket qua dau tien thoa man.
// Khong khop dieu kien nao (vd quan ly >= 60 nhung tien do 50–59, khong chi so critical) -> Gia han (tai lieu khong dinh nghia).
export function campaignResult(run: Run): CampaignResult {
  const m = run.metrics, flags = run.flags;
  const critical = CRITICAL.filter(c => check(c.when, run));
  const hardFails = HARD_FAILS.filter(f => (run.hardFails || []).includes(f.code) || check(f.when, run));
  // bi buoc thoi viec: FAIL ngay tai ngay dung game, ly do dau tien la dieu kien gay ra
  const fx = run.forcedExit && FORCED_EXITS.find(f => f.code === run.forcedExit!.code);
  if (fx) return {
    code: 'FAIL', ...ENDINGS.FAIL, label: 'Buộc thôi việc', title: `BUỘC THÔI VIỆC – ${fx.label.toUpperCase()}`,
    critical, hardFails, reasons: [fx.reason, ...hardFails.map(f => f.label).filter(l => !fx.reason.includes(l))],
    forced: { code: fx.code, label: fx.label, day: run.forcedExit!.day },
  };
  const hard = hardFails.length > 0, n = critical.length;
  let code: EndingCode;
  if (hard || m.management_trust < 40 || n >= 2) code = 'FAIL';
  else if (m.management_trust >= 80 && m.client_trust >= 70 && m.team_morale >= 60 && m.product_quality >= 70
    && m.project_progress >= 75 && m.project_risk < 40 && m.budget >= 0 && run.resources.team_size >= 2 && !flags.final_report_opaque)
    code = 'PASS_EXCELLENT';
  else if (m.management_trust >= 60 && m.project_progress >= 60 && n === 0) code = 'PASS';
  else code = 'EXTEND_PROBATION';
  // ly do ngan gon cho man ket qua (chi hien khi khong dat / gia han)
  const reasons = [
    ...hardFails.map(f => f.label),
    ...(m.management_trust < 40 ? ['Niềm tin quản lý dưới 40%'] : m.management_trust < 60 ? ['Niềm tin quản lý dưới 60%'] : []),
    ...critical.map(c => c.text),
    ...(code === 'EXTEND_PROBATION' && m.project_progress < 60 && m.project_progress >= 50 ? ['Tiến độ chưa tới 36/60 ngày'] : []),
  ];
  return { code, ...ENDINGS[code], critical, hardFails, reasons };
}

// Du lieu man ket qua cuoi: ket qua, chi so ngay 1 -> ngay 60, 6 nang luc, 3 quyet dinh tot nhat / hau qua lon nhat,
// quan he quyet dinh cu -> hau qua ve sau, khuyen nghi hoc tap. levels = cac level da choi (thu tu).
export function campaignReport(run: Run, levels: Level[]): Report {
  const result = campaignResult(run);
  const decisions = levels.flatMap(lv => lv.scenarios.filter(s => run.choices[s.id]).map((s): Decision => {
    const c = s.choices.find(x => x.id === run.choices[s.id])!, o = c.outcomes?.find(x => x.id === run.outcomes?.[s.id]);
    const rs = Object.values(c.competency || {});
    return { level: lv.no, id: s.id, no: s.no, title: s.title, choice: o?.id || c.id, label: c.label, result: o?.result || c.result || '',
      avg: rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0 };
  }));
  // tot nhat: diem cao -> thap (bang nhau: som hon); hau qua lon nhat: diem thap -> cao
  const best = [...decisions].sort((a, b) => b.avg - a.avg).slice(0, 3);
  const worst = [...decisions].sort((a, b) => a.avg - b.avg).slice(0, 3);
  const competencies = (Object.entries(COMPETENCY) as [CompetencyCode, string][]).map(([code, label]) => {
    const rs = run.ratings.filter(r => r.competency === code).map(r => r.rating);
    return { code, label, score: rs.length ? competencyScore(rs) : null };
  });
  const scored = competencies.filter(c => c.score != null).sort((a, b) => a.score! - b.score!);
  const learning = scored.slice(0, 2).map(c => ({ ...c, text: LEARNING[c.code] }));
  // quyet dinh cu -> hau qua ve sau (hau qua tri hoan da kich hoat, co loi bao)
  const byId = Object.fromEntries(levels.flatMap(lv => lv.scenarios.map(s => [s.id, s])));
  const links = (run.fired || []).filter(f => f.note).map(f => {
    const m = f.source?.match(/^P(\d)_(S\d\d)_.*_([A-C]\d?)$/);
    return { from: m ? `${m[2]} · ${m[3]}` : '', to: byId[f.at]?.no || '', text: f.note! };
  });
  return {
    result, decisions, best, worst, competencies, learning, links,
    changes: METRICS.map(m => ({ key: m.key, from: run.levelStart[levels[0].phase][m.key], to: run.metrics[m.key] })),
  };
}

// Bao cao dang chu (nut TAI BAO CAO): name = ten nguoi choi, fmt(key, v) = so lieu co don vi (format.ts)
export function reportText(rep: Report, name: string, fmt: (key: MetricKey, v: number) => string, labelOf: (key: MetricKey) => string) {
  const L: string[] = [];
  L.push('ROLECRAFT · PM 60 NGÀY THỬ VIỆC — BÁO CÁO KẾT QUẢ', `PM: ${name}`, '', `KẾT QUẢ: ${rep.result.title}`);
  if (rep.result.reasons.length) L.push(...rep.result.reasons.map(r => `  - ${r}`));
  L.push('', `CHỈ SỐ NGÀY 1 → NGÀY ${rep.result.forced?.day ?? 60}`);
  for (const c of rep.changes) L.push(`  ${labelOf(c.key)}: ${fmt(c.key, c.from)} → ${fmt(c.key, c.to)}`);
  L.push('', 'NĂNG LỰC QUẢN LÝ (0–100)');
  for (const c of rep.competencies) L.push(`  ${c.label}: ${c.score ?? '—'}`);
  L.push('', 'HÀNH TRÌNH QUYẾT ĐỊNH');
  for (const d of rep.decisions) L.push(`  L${d.level} ${d.no} · ${d.choice} — ${d.title}: ${d.label}`);
  L.push('', 'BA QUYẾT ĐỊNH TÍCH CỰC NHẤT', ...rep.best.map(d => `  ${d.no} · ${d.choice}: ${d.label}`));
  L.push('', 'BA QUYẾT ĐỊNH TẠO HẬU QUẢ LỚN NHẤT', ...rep.worst.map(d => `  ${d.no} · ${d.choice}: ${d.label}`));
  if (rep.links.length) L.push('', 'QUYẾT ĐỊNH CŨ → HẬU QUẢ VỀ SAU', ...rep.links.map(l => `  ${l.from} → ${l.to}: ${l.text}`));
  L.push('', 'GỢI Ý HỌC TẬP TIẾP THEO', ...rep.learning.map(l => `  ${l.label}: ${l.text}`));
  return L.join('\n') + '\n';
}
