// Luat cong/tru cua phien choi (docs/KICH_BAN_ROLECRAFT_PM60.md muc 3): chi so, co, nang luc, hau qua tri hoan.
// Logic thuan, khong dung DOM; luu cung session (session.js).

// icon = o chi so trong sheet F; bad = diem cao la bat loi (rui ro); group = nhom tren HUD (du an / con nguoi);
// hint = loi giai thich trong tour huong dan lan dau (hudTour.js)
export const METRICS = [
  { key: 'budget', label: 'Quỹ dự án', short: 'Quỹ', icon: 'stat_budget', init: 100, min: -100, max: 200, group: 'project',
    hint: 'Ngân sách của dự án, bắt đầu 100 điểm. Thuê người, mua công cụ, xử lý sự cố đều tốn quỹ; xuống dưới 0 là vượt ngân sách.' },
  { key: 'project_progress', label: 'Tiến độ', short: 'Tiến độ', icon: 'stat_progress', init: 40, min: 0, max: 100, group: 'project',
    hint: 'Phần dự án đã hoàn thành. Nhận bàn giao ở mức 40%, khách đang chờ demo.' },
  { key: 'product_quality', label: 'Chất lượng', short: 'Chất lượng', icon: 'stat_quality', init: 60, min: 0, max: 100, group: 'project',
    hint: 'Độ ổn định của sản phẩm. Chất lượng thấp dễ sinh lỗi, sự cố và khiếu nại về sau.' },
  { key: 'project_risk', label: 'Rủi ro dự án', short: 'Rủi ro', icon: 'stat_risk', init: 10, min: 0, max: 100, bad: true, group: 'project',
    hint: 'Chỉ số duy nhất càng cao càng bất lợi. Rủi ro tích lại sẽ bùng ra thành sự cố ở giai đoạn sau.' },
  { key: 'team_morale', label: 'Tinh thần đội ngũ', short: 'Tinh thần', icon: 'stat_morale', init: 70, min: 0, max: 100, group: 'people',
    hint: 'Động lực và sức bền của team. Tinh thần xuống thấp thì dễ sai sót, thậm chí có người nghỉ việc.' },
  { key: 'client_trust', label: 'Niềm tin khách hàng', short: 'Khách hàng', icon: 'stat_client', init: 60, min: 0, max: 100, group: 'people',
    hint: 'Khách hàng tin bạn và team đến đâu. Mất niềm tin thì mọi thay đổi đều khó đàm phán.' },
  { key: 'management_trust', label: 'Niềm tin quản lý', short: 'Quản lý', icon: 'stat_management', init: 50, min: 0, max: 100, group: 'people',
    hint: 'Anh Minh tin bạn đến đâu. Chỉ số này ảnh hưởng trực tiếp đến kết quả thử việc ngày 60.' },
];
export const METRIC_GROUPS = [{ id: 'project', label: 'Dự án' }, { id: 'people', label: 'Con người' }];
export const METRIC = Object.fromEntries(METRICS.map(m => [m.key, m]));

export function newRun() {
  return {
    metrics: Object.fromEntries(METRICS.map(m => [m.key, m.init])),
    resources: { team_size: 3, tooling_level: 0 },
    day: 1, phase: 'P1',
    levelStart: { P1: Object.fromEntries(METRICS.map(m => [m.key, m.init])) },   // chi so dau moi level (bang tong ket)
    flags: {},
    variants: {},         // scenarioId -> bien the mo canh do hau qua tri hoan dat (vd S08: requirement_changed_without_confirmation)
    ratings: [],          // [{ scenario, choice, competency, rating }] – nang luc, danh gia trong LMS, khong hien cho nguoi choi
    delayed: [],          // [{ at, effects?, variant?, ifChoice?, source }] – hau qua tri hoan: vao tinh huong `at` thi kich hoat;
                          // co ifChoice thi chi kich hoat khi chon dung lua chon do tai `at`
    choices: {},          // scenarioId -> 'A' | 'B' | 'C'
  };
}

// budget khong clamp tai 0 (de phat hien vuot ngan sach), chi giu trong mien -100..200
const clamp = (m, v) => Math.max(m.min, Math.min(m.max, v));

// Ap hieu ung { metric: delta } -> danh sach thay doi [{ key, from, to }] (bo qua chi so khong doi sau clamp)
function applyEffects(run, effects) {
  const out = [];
  for (const [key, d] of Object.entries(effects || {})) {
    const m = METRIC[key], from = run.metrics[key], to = clamp(m, from + d);
    run.metrics[key] = to;
    if (to !== from) out.push({ key, from, to });
  }
  return out;
}

// Thu tu xu ly mot lua chon (muc 3 – Logic cong tru): ghi quyet dinh -> hieu ung -> clamp -> tai nguyen -> co
// -> hau qua tri hoan den han theo lua chon nay -> xep hau qua moi
export function applyChoice(run, scenario, choice) {
  run.choices[scenario.id] = choice.id;
  const changes = applyEffects(run, choice.effects);
  Object.assign(run.resources, choice.set);                                     // vd tooling_level = 2
  (choice.flags || []).forEach(f => { run.flags[f] = true; });
  // hau qua cho lua chon tai tinh huong nay (vd licence dung chung + release tung phan o S06): ap mot lan, bo phan con lai
  const here = run.delayed.filter(d => d.at === scenario.id && d.ifChoice);
  run.delayed = run.delayed.filter(d => !(d.at === scenario.id && d.ifChoice));
  here.filter(d => d.ifChoice === choice.id).forEach(d => changes.push(...applyEffects(run, d.effects)));
  for (const [competency, rating] of Object.entries(choice.competency || {}))
    run.ratings.push({ scenario: scenario.id, choice: choice.id, competency, rating });
  (choice.delayed || []).forEach(d => run.delayed.push({ ...d, source: `${scenario.id}_${choice.id}` }));
  return changes;
}

// Vao tinh huong: kich hoat hau qua tri hoan den han (moi hau qua mot lan). Hau qua co ifChoice cho den luc chon.
// Tra ve thay doi chi so [{ key, from, to }]; bien the mo canh ghi vao run.variants.
export function enterScenario(run, scenario) {
  run.day = scenario.day;
  const due = run.delayed.filter(d => d.at === scenario.id && !d.ifChoice);
  run.delayed = run.delayed.filter(d => !due.includes(d));
  due.forEach(d => { if (d.variant) run.variants[scenario.id] = d.variant; });
  return due.flatMap(d => applyEffects(run, d.effects));
}

// Mau cua mot thay doi: tot (xanh) / xau (do), rui ro thi nguoc lai
export const isGood = c => (c.to > c.from) !== !!METRIC[c.key].bad;
