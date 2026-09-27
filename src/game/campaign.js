// Ket qua campaign 60 ngay (docs/KICH_BAN_ROLECRAFT_PM60.md muc 9) + du lieu man ket qua cuoi. Logic thuan, khong DOM.
import { METRICS, HARD_FAILS } from './rules.js';
import { COMPETENCY, competencyScore } from './summary.js';

// Chi so critical (muc 9): moi dieu kien dung = 1 chi so o muc canh bao nghiem trong
export const CRITICAL = [
  { key: 'team_morale', text: 'Tinh thần đội ngũ dưới 30%', when: m => m.team_morale < 30 },
  { key: 'client_trust', text: 'Niềm tin khách hàng dưới 30%', when: m => m.client_trust < 30 },
  { key: 'product_quality', text: 'Chất lượng dưới 40%', when: m => m.product_quality < 40 },
  { key: 'project_risk', text: 'Rủi ro dự án từ 80% trở lên', when: m => m.project_risk >= 80 },
  { key: 'budget', text: 'Quỹ còn dưới 10.000.000 VND', when: m => m.budget < 10 },
  { key: 'project_progress', text: 'Tiến độ dưới 30/60 ngày', when: m => m.project_progress < 50 },
];

// Cac ket thuc (muc 9 – Noi dung tung ket thuc); mood = mau nhan / huy hieu nhu tong ket level
export const ENDINGS = {
  PASS_EXCELLENT: { label: 'Pass xuất sắc', title: 'PASS XUẤT SẮC – SẴN SÀNG CHO PHẠM VI LỚN HƠN', mood: 'good' },
  PASS: { label: 'Pass', title: 'PASS – TRỞ THÀNH PM CHÍNH THỨC', mood: 'good' },
  EXTEND_PROBATION: { label: 'Gia hạn thử việc', title: 'GIA HẠN THỬ VIỆC', mood: 'mid' },
  FAIL: { label: 'Không đạt', title: 'KHÔNG ĐẠT THỬ VIỆC', mood: 'bad' },
};

// Xet theo thu tu FAIL -> Pass xuat sac -> Pass -> Gia han, dung o ket qua dau tien thoa man.
// Khong khop dieu kien nao (vd quan ly >= 60 nhung tien do 50–59, khong chi so critical) -> Gia han (tai lieu khong dinh nghia).
export function campaignResult(run) {
  const m = run.metrics, flags = run.flags;
  const critical = CRITICAL.filter(c => c.when(m));
  const hardFails = HARD_FAILS.filter(f => (run.hardFails || []).includes(f.code) || f.when(run));
  const hard = hardFails.length > 0, n = critical.length;
  let code;
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

// Khuyen nghi hoc tap tiep theo theo nang luc yeu nhat
export const LEARNING = {
  SCOPE: 'Quản lý phạm vi: change request, tiêu chí nghiệm thu, chia phase / MVP.',
  RESOURCE: 'Lập kế hoạch nguồn lực: capacity planning, ước lượng effort, cân đối ngân sách.',
  RISK: 'Quản trị rủi ro: risk register, regression / release checklist, xử lý incident.',
  PEOPLE: 'Lãnh đạo đội ngũ: 1-1, feedback, kế hoạch phát triển cá nhân, trao quyền có kiểm soát.',
  STAKEHOLDER: 'Giao tiếp stakeholder: trình bày đánh đổi, quản lý kỳ vọng, báo cáo bằng dữ liệu.',
  DECISION: 'Ra quyết định: phân tích phương án, đánh đổi ngắn hạn – dài hạn, chịu trách nhiệm.',
};

// Du lieu man ket qua cuoi: ket qua, chi so ngay 1 -> ngay 60, 6 nang luc, 3 quyet dinh tot nhat / hau qua lon nhat,
// quan he quyet dinh cu -> hau qua ve sau, khuyen nghi hoc tap. levels = cac level da choi (thu tu).
export function campaignReport(run, levels) {
  const result = campaignResult(run);
  const decisions = levels.flatMap(lv => lv.scenarios.filter(s => run.choices[s.id]).map(s => {
    const c = s.choices.find(x => x.id === run.choices[s.id]), o = c.outcomes?.find(x => x.id === run.outcomes?.[s.id]);
    const rs = Object.values(c.competency || {});
    return { level: lv.no, id: s.id, no: s.no, title: s.title, choice: o?.id || c.id, label: c.label, result: o?.result || c.result,
      avg: rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0 };
  }));
  // tot nhat: diem cao -> thap (bang nhau: som hon); hau qua lon nhat: diem thap -> cao
  const best = [...decisions].sort((a, b) => b.avg - a.avg).slice(0, 3);
  const worst = [...decisions].sort((a, b) => a.avg - b.avg).slice(0, 3);
  const competencies = Object.entries(COMPETENCY).map(([code, label]) => {
    const rs = run.ratings.filter(r => r.competency === code).map(r => r.rating);
    return { code, label, score: rs.length ? competencyScore(rs) : null };
  });
  const scored = competencies.filter(c => c.score != null).sort((a, b) => a.score - b.score);
  const learning = scored.slice(0, 2).map(c => ({ ...c, text: LEARNING[c.code] }));
  // quyet dinh cu -> hau qua ve sau (hau qua tri hoan da kich hoat, co loi bao)
  const byId = Object.fromEntries(levels.flatMap(lv => lv.scenarios.map(s => [s.id, s])));
  const links = (run.fired || []).filter(f => f.note).map(f => {
    const m = f.source?.match(/^P(\d)_(S\d\d)_.*_([A-C]\d?)$/);
    return { from: m ? `${m[2]} · ${m[3]}` : '', to: byId[f.at]?.no || '', text: f.note };
  });
  return {
    result, decisions, best, worst, competencies, learning, links,
    changes: METRICS.map(m => ({ key: m.key, from: run.levelStart.P1[m.key], to: run.metrics[m.key] })),
  };
}

// Bao cao dang chu (nut TAI BAO CAO): name = ten nguoi choi, fmt(key, v) = so lieu co don vi (rules.js)
export function reportText(rep, name, fmt, labelOf) {
  const L = [];
  L.push('ROLECRAFT · PM 60 NGÀY THỬ VIỆC — BÁO CÁO KẾT QUẢ', `PM: ${name}`, '', `KẾT QUẢ: ${rep.result.title}`);
  if (rep.result.reasons.length) L.push(...rep.result.reasons.map(r => `  - ${r}`));
  L.push('', 'CHỈ SỐ NGÀY 1 → NGÀY 60');
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
