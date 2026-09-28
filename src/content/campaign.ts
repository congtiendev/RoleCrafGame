// Du lieu ket thuc campaign 60 ngay (docs/KICH_BAN_ROLECRAFT_PM60.md muc 9); cach xet: src/game/campaign.ts.
// `when` = dieu kien dang du lieu tren phien choi (src/game/conditions.ts).
import type { Critical, EndingCode, EndingInfo, ForcedExit, HardFail, TeamWork } from './schema.ts';

// That bai nghiem trong (tai lieu muc 9 – hard fail): ghi nhan (mot lan moi ma) ngay khi xay ra; rieng 3 dieu kien FORCED_EXITS o duoi dung game ngay,
// cac dieu kien con lai: nguoi choi van hoan thanh 60 ngay, ket qua cuoi la FAIL (campaign.ts)
export const HARD_FAILS: HardFail[] = [
  { code: 'FAIL_CONTRACT_TERMINATED', label: 'Khách hàng chấm dứt hợp đồng', when: { var: 'metrics.client_trust', lte: 0 } },
  { code: 'FAIL_TEAM_COLLAPSED', label: 'Team tan rã', when: { any: [{ var: 'resources.team_size', lt: 2 }, { var: 'metrics.team_morale', lte: 0 }] } },
  { code: 'FAIL_BUDGET_OVERRUN', label: 'Vượt ngân sách dự án', when: { var: 'metrics.budget', lt: 0 } },
  { code: 'FAIL_CRITICAL_INCIDENT', label: 'Sự cố nghiêm trọng mất kiểm soát', when: { var: 'metrics.project_risk', gte: 100 } },
  { code: 'FAIL_MANAGEMENT_TRUST', label: 'Mất hoàn toàn niềm tin quản lý', when: { var: 'metrics.management_trust', lte: 0 } },
];

// Chi so critical (muc 9): moi dieu kien dung = 1 chi so o muc canh bao nghiem trong
export const CRITICAL: Critical[] = [
  { key: 'team_morale', text: 'Tinh thần đội ngũ dưới 30%', when: { var: 'metrics.team_morale', lt: 30 } },
  { key: 'client_trust', text: 'Niềm tin khách hàng dưới 30%', when: { var: 'metrics.client_trust', lt: 30 } },
  { key: 'product_quality', text: 'Chất lượng dưới 40%', when: { var: 'metrics.product_quality', lt: 40 } },
  { key: 'project_risk', text: 'Rủi ro dự án từ 80% trở lên', when: { var: 'metrics.project_risk', gte: 80 } },
  { key: 'budget', text: 'Quỹ còn dưới 10.000.000 VND', when: { var: 'metrics.budget', lt: 10 } },
  { key: 'project_progress', text: 'Tiến độ dưới 30/60 ngày', when: { var: 'metrics.project_progress', lt: 50 } },
];

// Cac ket thuc (muc 9 – Noi dung tung ket thuc); mood = mau nhan / huy hieu nhu tong ket level
export const ENDINGS: Record<EndingCode, EndingInfo> = {
  PASS_EXCELLENT: { label: 'Pass xuất sắc', title: 'PASS XUẤT SẮC – SẴN SÀNG CHO PHẠM VI LỚN HƠN', mood: 'good' },
  PASS: { label: 'Pass', title: 'PASS – TRỞ THÀNH PM CHÍNH THỨC', mood: 'good' },
  EXTEND_PROBATION: { label: 'Gia hạn thử việc', title: 'GIA HẠN THỬ VIỆC', mood: 'mid' },
  FAIL: { label: 'Không đạt', title: 'KHÔNG ĐẠT THỬ VIỆC', mood: 'bad' },
};

// Nhip lam viec cua team (muc 9 – Nhip lam viec cua team): cuoi moi giai doan, team khoe thi lam them duoc khoi luong.
// Lua chon tot thuong danh doi tien do lay chat luong / con nguoi; muc nay tra lai tien do cho cach quan ly do.
// Muc va nguong chon theo mo phong (tests/balance.test.ts): chon dung phuong an tot nhat mot nua so lan -> dat thu viec > 50%.
const WORK_BONUS = { project_progress: 5 };                    // 3 ngay
export const TEAM_WORK: TeamWork = {
  title: 'Nhịp làm việc của team',
  bonuses: [
    { label: 'tinh thần team từ 80%', when: { var: 'metrics.team_morale', gte: 80 }, effects: WORK_BONUS },
    { label: 'rủi ro dưới 20%', when: { var: 'metrics.project_risk', lt: 20 }, effects: WORK_BONUS },
    { label: 'chất lượng từ 80%', when: { var: 'metrics.product_quality', gte: 80 }, effects: WORK_BONUS },
  ],
  done: 'Cuối giai đoạn, team làm thêm được {gain} khối lượng nhờ {reasons}.',
  none: 'Cuối giai đoạn, team chỉ đủ sức xử lý việc phát sinh, không làm thêm được khối lượng. Tinh thần team, chất lượng từ 80% và rủi ro dưới 20% giúp team làm nhanh hơn.',
};

// Buoc thoi viec giua chung (khong choi tiep toi ngay 60): xet sau moi lua chon / o moc cuoi giai doan 2–4 (sau nhip lam viec).
// Canh ket thuc dung lai phong danh gia + Anh Minh, Chi Ha nhu ket qua campaign (khong them man).
export const FORCED_EXIT_SCENE = { bg: 'final_review', cast: ['MINH', 'HA'] };
const LEAVE = [
  { who: 'HA', text: 'Công ty quyết định chấm dứt thử việc sớm. Chị sẽ hỗ trợ em các thủ tục bàn giao.', pm: 'sigh', npc: 'sympathetic', npcFace: 'face_sympathetic' },
];
export const FORCED_EXITS: ForcedExit[] = [
  {
    code: 'EXIT_BUDGET_DEPLETED', label: 'Cạn quỹ dự án', check: 'choice',
    reason: 'Quỹ dự án còn dưới 20.000.000 VND trước khi dự án kết thúc.',
    when: { var: 'metrics.budget', lt: 20 },
    lines: [
      { who: 'MINH', text: 'Quỹ dự án gần cạn trong khi dự án còn dài. Công ty không thể để em tiếp tục điều hành.', pm: 'nod', npc: 'disappoint', npcFace: 'face_disappointed' },
      ...LEAVE,
      { who: 'PM', text: 'Em hiểu ạ... em đã không kiểm soát được chi phí.', pm: 'sigh', face: 'face_sad' },
      { who: 'NARR', text: 'Ôm thùng đồ ra cửa...', pm: 'fail', exit: 'leave' },
    ],
  },
  {
    code: 'EXIT_RISK_OUT_OF_CONTROL', label: 'Rủi ro mất kiểm soát', check: 'choice',
    reason: 'Rủi ro dự án lên 100%: sự cố vượt khỏi tầm kiểm soát.',
    when: { var: 'metrics.project_risk', gte: 100 },
    lines: [
      { who: 'MINH', text: 'Rủi ro đã vượt tầm kiểm soát. Sự cố này ảnh hưởng tới cả khách hàng lẫn công ty.', pm: 'nod', npc: 'warn', npcFace: 'face_warning' },
      ...LEAVE,
      { who: 'PM', text: 'Em hiểu ạ... đáng lẽ em phải xử lý rủi ro sớm hơn.', pm: 'sigh', face: 'face_sad' },
      { who: 'NARR', text: 'Ôm thùng đồ ra cửa...', pm: 'fail', exit: 'leave' },
    ],
  },
  {
    code: 'EXIT_CONTRACT_CANCELLED', label: 'Khách hàng huỷ hợp đồng', check: 'levelEnd', fromLevel: 2,
    reason: 'Tiến độ dưới 18/60 ngày ở mốc cuối giai đoạn: khách hàng huỷ hợp đồng.',
    when: { var: 'metrics.project_progress', lt: 30 },
    lines: [
      { who: 'MINH', text: 'Tiến độ trễ quá xa so với cam kết. Khách hàng đã gửi thông báo huỷ hợp đồng.', pm: 'nod', npc: 'frown', npcFace: 'face_regretful' },
      ...LEAVE,
      { who: 'PM', text: 'Em hiểu ạ... em đã để tiến độ trượt quá lâu.', pm: 'sigh', face: 'face_sad' },
      { who: 'NARR', text: 'Ôm thùng đồ ra cửa...', pm: 'fail', exit: 'leave' },
    ],
  },
];
