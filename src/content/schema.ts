// Kieu du lieu NOI DUNG game (src/content/): level, tinh huong, lua chon, dong thoai, dieu kien, chi so, ket thuc.
// Noi dung chi la du lieu (JSON duoc, tests/levels.test.ts) – tsc kiem tra moi level viet dung dinh dang nay.

export type MetricKey = 'budget' | 'project_progress' | 'product_quality' | 'project_risk'
  | 'team_morale' | 'client_trust' | 'management_trust';
export type Metrics = Record<MetricKey, number>;
export type ResourceKey = 'team_size' | 'tooling_level';
export type CompetencyCode = 'SCOPE' | 'RESOURCE' | 'RISK' | 'PEOPLE' | 'STAKEHOLDER' | 'DECISION';
export type Mood = 'good' | 'mid' | 'bad';
export type EndingCode = 'PASS_EXCELLENT' | 'PASS' | 'EXTEND_PROBATION' | 'FAIL';

// ---------- dieu kien (src/game/conditions.ts) ----------
export type Scalar = string | number | boolean;
export interface VarCondition {
  var: string;
  lt?: number; lte?: number; gt?: number; gte?: number;
  eq?: Scalar; ne?: Scalar; in?: Scalar[];
}
export type Condition = boolean
  | { all: Condition[] } | { any: Condition[] } | { not: Condition } | { atLeast: number; of: Condition[] }
  | { flag: string } | { choice: string; is: string } | VarCondition;

// ---------- dong thoai ----------
// who: 'PM' | 'NARR' (dan truyen) | 'SYS' (thong bao he thong) | id trong src/content/cast.ts
export interface Line {
  who: string;
  text: string;
  title?: string;                         // tieu de dong SYS
  pm?: string;                            // dong tac PM (src/generated/atlas.ts)
  face?: string;                          // chan dung PM khi PM noi (sheet D)
  npc?: string | null;                    // dong tac / chan dung NPC dang noi (src/generated/npcAtlas.ts)
  npcFace?: string | null;
  react?: Record<string, string>;         // dong tac cua NPC khong noi
  alt?: Record<string, string>;           // cau thay the khi NPC (khoa) da vang mat
  ifFlag?: string;                        // chi hien khi co co
  unlessFlag?: string;                    // an khi co co
  when?: Condition;                       // chi hien khi dieu kien dung
  answer?: Answer;                        // cau tra loi theo hanh trinh that (game/levels.ts: answerText)
  exit?: string;                          // PM roi canh bang dong tac nay
}
// from: quyet dinh dau tien trong bao cao (best / worst) -> ctx.d; unless dung -> giu cau mau; text = mau cau (conditions.ts: fill)
export interface Answer { from?: 'best' | 'worst'; unless?: Condition; text: string }

// ---------- canh ----------
export interface Scene { bg: string; cast: string[]; lines: Line[] }
export interface Prelude { ifFlag: string; bg: string; night?: boolean; pm?: string; lines: Line[] }
export interface Outro { night?: boolean; pm?: string; lines: Line[]; hideCast?: boolean }
export interface After { pm: string; night?: boolean; then?: string; emo?: string }

// ---------- lua chon + hau qua ----------
export type Effects = Partial<Metrics>;
export type ResourceChange = Partial<Record<ResourceKey, number>>;
// Hau qua tri hoan: vao tinh huong `at` thi kich hoat (ifChoice: chi khi chon dung lua chon do tai `at`;
// below: chi khi chi so duoi nguong); note = loi bao "Hau qua tu quyet dinh truoc"
export interface Delayed {
  at: string; note?: string; effects?: Effects; variant?: string; ifChoice?: string; flags?: string[];
  below?: Partial<Metrics>;
}
interface Consequence {
  lines: Line[];
  effects?: Effects;
  add?: ResourceChange;                   // cong/tru tai nguyen (vd team_size -1)
  set?: ResourceChange;                   // dat tai nguyen (vd tooling_level = 2)
  flags?: string[];
  delayed?: Delayed[];
  result?: string;
  after?: After;
  outro?: Outro;
}
export interface Outcome extends Consequence { id: string; label: string; when?: Condition }
export interface Choice extends Consequence {
  id: string; label: string; hint: string;
  competency?: Partial<Record<CompetencyCode, number>>;
  join?: string[];                        // NPC buoc vao canh truoc thoai nhanh
  outcomes?: Outcome[];                   // ket qua re nhanh theo lich su phien choi (ket qua dau tien khop `when`)
}

export interface Scenario {
  id: string; no: string; day: number; title: string; place: string; bg: string; cast: string[];
  open: Line[]; question: string; choices: Choice[]; next: string;
  enter?: string;                         // PM ngoi san o tu the nay khi mo canh
  variants?: Record<string, Line[]>;      // mo canh thay the khi hau qua tri hoan dat bien the
  laterAt?: number;                       // so dong mo canh noi truoc loi bao hau qua tri hoan
  alias?: Record<string, string>;         // bo dong tac PM rieng cho canh
  outro?: Outro;
}

// ---------- tong ket / ket thuc ----------
export interface Tier { id: string; label: string; mood: Mood; when?: Condition }
export interface LevelSummary {
  id: string; bg: string; cast: string[];
  tiers: Tier[];                          // xet tu tren xuong, lay loai dau tien khop
  dangerFlags: Record<string, string>;    // co can canh bao -> loi mo ta
  comments?: Record<Mood, Line[]>;        // nhan xet theo muc xep loai
  cta?: string;
}
export interface LevelEnding { id: string; bg: string; cast: string[]; lines: Record<EndingCode, Line[]> }

interface LevelBase {
  id: string; no: number; phase: string; title: string; days: string; day: number; goal: string;
  nextLevel?: string;
  lead?: string;                          // khong co canh mo dau: dong dan truyen cua the Level
  tired?: string;                         // co lam PM met tu level nay
  absent?: Record<string, string>;        // NPC -> co lam NPC vang mat
  prelude?: Prelude;
  intro?: Scene;
  scenarios: Scenario[];
}
// Level thuong ket thuc bang tong ket; level cuoi (final) ket thuc bang ket qua campaign
export type Level = LevelBase & (
  | { final?: false; summary: LevelSummary; ending?: undefined }
  | { final: true; ending: LevelEnding; summary?: undefined }
);

// ---------- nhan vat, chi so, ket thuc campaign ----------
export interface CastMember { name: string; role: string; tint: string; desc: string; client?: boolean }
export interface Metric {
  key: MetricKey; label: string; short: string; icon: string;
  init: number; min: number; max: number;
  group: string; unit: string;
  scale?: number;                         // don vi luu -> so thuc te (quy: trieu dong)
  of?: boolean;                           // hien kem tong (24/60 ngay)
  bad?: boolean;                          // cao la bat loi (rui ro)
  hint: string;
}
export interface MetricGroup { id: string; label: string }
export interface HardFail { code: string; label: string; when: Condition }
export interface Critical { key: MetricKey; text: string; when: Condition }
export interface EndingInfo { label: string; title: string; mood: Mood }
// Buoc thoi viec giua chung: dung game ngay (khong choi tiep), ket qua FAIL. check = luc xet: sau moi lua chon | moc cuoi
// giai doan (fromLevel: chi tu level nay). lines = thoai canh ket thuc (canh FORCED_EXIT_SCENE), dong cuoi co `exit` = PM roi canh.
// Nhip lam viec cua team cuoi moi giai doan (truoc xet huy hop dong / tong ket): moi muc khop cong hieu ung cua muc do.
// done / none = thong bao he thong; done: {gain} = muc tang (vd "9 ngày"), {reasons} = nhan cac muc khop
export interface TeamWorkBonus { label: string; when: Condition; effects: Effects }
export interface TeamWork { title: string; bonuses: TeamWorkBonus[]; done: string; none: string }
export interface ForcedExit {
  code: string; label: string; reason: string;
  check: 'choice' | 'levelEnd'; fromLevel?: number;
  when: Condition;
  lines: Line[];
}
