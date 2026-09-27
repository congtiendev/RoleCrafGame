// Luat cong/tru cua phien choi (docs/KICH_BAN_ROLECRAFT_PM60.md muc 3): chi so, co, nang luc, hau qua tri hoan.
// Logic thuan, khong dung DOM; luu cung session (session.js).

// icon = o chi so trong sheet F; bad = diem cao la bat loi (rui ro); group = nhom tren HUD (du an / con nguoi);
// hint = loi giai thich trong tour huong dan lan dau (hudTour.js)
// unit / scale = so lieu thuc te (xem fmt): quy luu theo trieu dong (scale 1e6 -> hien 100.000.000 VND); tien do quy ra
// so ngay tren ke hoach 60 ngay (1 diem = 0,6 ngay), of = hien kem tong (24/60); cac chi so con lai la %
export const METRICS = [
  { key: 'budget', label: 'Quỹ dự án', short: 'Quỹ', icon: 'stat_budget', init: 100, min: -100, max: 200, group: 'project', unit: 'VND', scale: 1e6,
    hint: 'Ngân sách của dự án: 100.000.000 VND cho cả 60 ngày. Thuê người, mua công cụ, xử lý sự cố đều tốn quỹ; xuống dưới 0 là vượt ngân sách.' },
  { key: 'project_progress', label: 'Tiến độ', short: 'Tiến độ', icon: 'stat_progress', init: 40, min: 0, max: 100, group: 'project', unit: 'ngày', scale: 0.6, of: true,
    hint: 'Khối lượng đã hoàn thành, quy ra số ngày trên kế hoạch 60 ngày. Nhận bàn giao đã xong 24/60 ngày; khách đang chờ demo.' },
  { key: 'product_quality', label: 'Chất lượng', short: 'Chất lượng', icon: 'stat_quality', init: 60, min: 0, max: 100, group: 'project', unit: '%',
    hint: 'Tỉ lệ test case đạt, hiện là 60%. Chất lượng thấp dễ sinh lỗi, sự cố và khiếu nại về sau.' },
  { key: 'project_risk', label: 'Rủi ro dự án', short: 'Rủi ro', icon: 'stat_risk', init: 10, min: 0, max: 100, bad: true, group: 'project', unit: '%',
    hint: 'Khả năng dự án gặp sự cố hoặc trễ hạn, hiện là 10%. Chỉ số duy nhất càng cao càng bất lợi; rủi ro tích lại sẽ bùng ra ở giai đoạn sau.' },
  { key: 'team_morale', label: 'Tinh thần đội ngũ', short: 'Tinh thần', icon: 'stat_morale', init: 70, min: 0, max: 100, group: 'people', unit: '%',
    hint: 'Mức hài lòng của team qua khảo sát nội bộ, hiện là 70%. Tinh thần xuống thấp thì dễ sai sót, thậm chí có người nghỉ việc.' },
  { key: 'client_trust', label: 'Niềm tin khách hàng', short: 'Khách hàng', icon: 'stat_client', init: 60, min: 0, max: 100, group: 'people', unit: '%',
    hint: 'Mức hài lòng của khách hàng (CSAT), hiện là 60%. Mất niềm tin thì mọi thay đổi đều khó đàm phán.' },
  { key: 'management_trust', label: 'Niềm tin quản lý', short: 'Quản lý', icon: 'stat_management', init: 50, min: 0, max: 100, group: 'people', unit: '%',
    hint: 'Mức tín nhiệm của Anh Minh dành cho bạn, hiện là 50%. Chỉ số này ảnh hưởng trực tiếp đến kết quả thử việc ngày 60.' },
];
export const METRIC_GROUPS = [{ id: 'project', label: 'Dự án' }, { id: 'people', label: 'Con người' }];
export const METRIC = Object.fromEntries(METRICS.map(m => [m.key, m]));

// Hien thi so lieu thuc te: fmt('budget', 85) = '85.000.000 VND', fmt('project_progress', 40) = '24/60 ngày',
// fmt('team_morale', 70) = '70%'. fmtNum = phan so (ti le van kem %; don vi chu – VND, ngày – HUD hien o dong rieng);
// fmtDelta = muc tang/giam co dau, khong kem tong (+3 ngày / −15.000.000 VND), sign = false thi bo dau
const NUM = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });   // 0,6 ngay x 3 = 1,8 ngay
const scaled = (m, v) => NUM.format(Math.round(v) * (m.scale || 1));
export const fmtNum = (key, v) => {
  const m = METRIC[key];
  return m.unit === '%' ? `${Math.round(v)}%` : m.of ? `${scaled(m, v)}/${scaled(m, m.max)}` : scaled(m, v);
};
export const fmt = (key, v) => METRIC[key].unit === '%' ? fmtNum(key, v) : `${fmtNum(key, v)} ${METRIC[key].unit}`;
export const fmtDelta = (key, d, sign = true) => {
  const m = METRIC[key], s = sign ? (d > 0 ? '+' : d < 0 ? '−' : '') : '';
  return m.unit === '%' ? `${s}${Math.abs(d)}%` : `${s}${scaled(m, Math.abs(d))} ${m.unit}`;
};

export function newRun() {
  return {
    metrics: Object.fromEntries(METRICS.map(m => [m.key, m.init])),
    resources: { team_size: 3, tooling_level: 0 },
    day: 1, phase: 'P1',
    levelStart: { P1: Object.fromEntries(METRICS.map(m => [m.key, m.init])) },   // chi so dau moi level (bang tong ket)
    flags: {},
    variants: {},         // scenarioId -> bien the mo canh do hau qua tri hoan dat (vd S08: requirement_changed_without_confirmation)
    ratings: [],          // [{ scenario, choice, competency, rating }] – nang luc, danh gia trong LMS, khong hien cho nguoi choi
    delayed: [],          // [{ at, effects?, flags?, variant?, ifChoice?, below?, note?, source }] – hau qua tri hoan: vao tinh
                          // huong `at` thi kich hoat; co ifChoice thi chi kich hoat khi chon dung lua chon do tai `at`;
                          // below = { chi so: nguong } chi kich hoat khi chi so duoi nguong (vd tinh than < 40)
    fired: [],            // [{ at, source, note }] – hau qua tri hoan da quay lai (bang tong ket: "Hau qua quay lai")
    choices: {},          // scenarioId -> 'A' | 'B' | 'C'
    levelsDone: [],       // level da xong tong ket (LevelScreen: choi tiep sang level sau)
    hardFails: [],        // ma that bai nghiem trong da tung xay ra (muc 9, allow_early_fail=false: van choi tiep, ket qua FAIL)
    outcomes: {},         // scenarioId -> ket qua re nhanh cua lua chon (vd S07 C -> 'C1' | 'C2'), xem resolveOutcome
  };
}

// Bat dau level sau (tai lieu muc 5 – Trang thai dau level): ke thua toan bo chi so, tai nguyen, co, nang luc, lich su;
// chi dat giai doan + ngay dau level va ghi chi so dau level cho bang tong ket. level: { phase, day }
export function beginLevel(run, level) {
  run.phase = level.phase; run.day = level.day;
  run.levelStart[level.phase] = { ...run.metrics };
  return run;
}

// Lua chon co ket qua phu thuoc lich su phien choi (khong ngau nhien, vd S07 C: C1 neu tinh than >= 55 va khong OT):
// choice.outcomes = [{ id, when?(run), effects, add, flags, ... }] -> ket qua dau tien khop dieu kien (khong when = mac dinh)
export const resolveOutcome = (run, choice) => choice.outcomes?.find(o => !o.when || o.when(run)) || null;

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

// Mot chi so bi cong/tru nhieu lan trong cung buoc (lua chon + hau qua tri hoan) -> gop thanh mot thay doi from -> to cuoi;
// bu tru het thi bo
function merge(changes) {
  const by = new Map();
  for (const c of changes) by.set(c.key, { key: c.key, from: by.get(c.key)?.from ?? c.from, to: c.to });
  return [...by.values()].filter(c => c.from !== c.to);
}

// Thu tu xu ly mot lua chon (muc 3 – Logic cong tru): ghi quyet dinh -> hieu ung -> clamp -> tai nguyen -> co
// -> hau qua tri hoan den han theo lua chon nay -> xep hau qua moi
// Lua chon co outcomes: hieu ung / tai nguyen / co lay tu ket qua khop (xet tren trang thai truoc khi chon), nang luc van
// tinh theo lua chon. add = cong/tru tai nguyen (increment_resource, vd team_size -1), set = dat tai nguyen.
export function applyChoice(run, scenario, choice) {
  run.choices[scenario.id] = choice.id;
  const o = resolveOutcome(run, choice);
  if (o) run.outcomes[scenario.id] = o.id;
  const changes = [];
  for (const part of [choice, o].filter(Boolean)) {
    changes.push(...applyEffects(run, part.effects));
    for (const [k, d] of Object.entries(part.add || {})) run.resources[k] += d;
    Object.assign(run.resources, part.set);                                     // vd tooling_level = 2
    (part.flags || []).forEach(f => { run.flags[f] = true; });
  }
  // hau qua cho lua chon tai tinh huong nay (vd licence dung chung + release tung phan o S06): ap mot lan, bo phan con lai
  const here = run.delayed.filter(d => d.at === scenario.id && d.ifChoice);
  run.delayed = run.delayed.filter(d => !(d.at === scenario.id && d.ifChoice));
  changes.push(...fire(run, here.filter(d => d.ifChoice === choice.id)));
  for (const [competency, rating] of Object.entries(choice.competency || {}))
    run.ratings.push({ scenario: scenario.id, choice: choice.id, competency, rating });
  [choice, o].flatMap(p => p?.delayed || []).forEach(d => run.delayed.push({ ...d, source: `${scenario.id}_${o?.id || choice.id}` }));
  trackHardFails(run);
  return merge(changes);
}

// Vao tinh huong: kich hoat hau qua tri hoan den han (moi hau qua mot lan). Hau qua co ifChoice cho den luc chon.
// Tra ve thay doi chi so [{ key, from, to }]; bien the mo canh ghi vao run.variants.
export function enterScenario(run, scenario) {
  run.day = scenario.day;
  const due = run.delayed.filter(d => d.at === scenario.id && !d.ifChoice);
  run.delayed = run.delayed.filter(d => !due.includes(d));
  const changes = merge(fire(run, due));
  trackHardFails(run);
  return changes;
}

// That bai nghiem trong (tai lieu muc 9 – hard fail). allow_early_fail = false: chi ghi nhan (mot lan moi ma) ngay khi xay ra,
// nguoi choi van hoan thanh 60 ngay, ket qua cuoi la FAIL (campaign.js)
export const HARD_FAILS = [
  { code: 'FAIL_CONTRACT_TERMINATED', label: 'Khách hàng chấm dứt hợp đồng', when: r => r.metrics.client_trust <= 0 },
  { code: 'FAIL_TEAM_COLLAPSED', label: 'Team tan rã', when: r => r.resources.team_size < 2 || r.metrics.team_morale <= 0 },
  { code: 'FAIL_BUDGET_OVERRUN', label: 'Vượt ngân sách dự án', when: r => r.metrics.budget < 0 },
  { code: 'FAIL_CRITICAL_INCIDENT', label: 'Sự cố nghiêm trọng mất kiểm soát', when: r => r.metrics.project_risk >= 100 },
  { code: 'FAIL_MANAGEMENT_TRUST', label: 'Mất hoàn toàn niềm tin quản lý', when: r => r.metrics.management_trust <= 0 },
];
export function trackHardFails(run) {
  run.hardFails ||= [];                                       // ban luu cu chua co
  for (const f of HARD_FAILS) if (f.when(run) && !run.hardFails.includes(f.code)) run.hardFails.push(f.code);
}

// Dieu kien chi so cua hau qua (below: { team_morale: 40 } = chi khi tinh than < 40), xet tren trang thai luc den han
const holds = (run, d) => Object.entries(d.below || {}).every(([k, v]) => run.metrics[k] < v);
// Kich hoat cac hau qua den han (da go khoi run.delayed): kiem dieu kien truoc (cung mot trang thai), roi dat bien the mo canh,
// co, cong/tru chi so; ghi vao run.fired. Khong thoa dieu kien thi bo (khong cho lai).
function fire(run, due) {
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
export const dueNotes = (run, scenarioId, choiceId = null) => run.delayed
  .filter(d => d.at === scenarioId && d.note && (choiceId ? d.ifChoice === choiceId : !d.ifChoice) && holds(run, d)).map(d => d.note);

// Mau cua mot thay doi: tot (xanh) / xau (do), rui ro thi nguoc lai
export const isGood = c => (c.to > c.from) !== !!METRIC[c.key].bad;
