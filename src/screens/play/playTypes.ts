// Kieu trang thai man choi: Director (director.ts) doi `PlayState`, cac component React ve theo.
import type { Choice, Level, Line, Outcome, Scenario } from '../../content/schema.ts';
import type { Change } from '../../game/types.ts';
import type { CampaignResult, Report } from '../../game/campaign.ts';
import type { LevelSummaryReport } from '../../game/summary.ts';
import type { MetricKey, Metrics } from '../../content/schema.ts';

// The chuyen canh (Cards.tsx)
export type CardState =
  | { kind: 'level'; level: Level }
  | { kind: 'day'; s: Scenario; from: number }
  | { kind: 'ending'; res: CampaignResult }
  | { kind: 'end'; level: Level; r: LevelSummaryReport; again: boolean }
  | { kind: 'final'; level: Level; res: CampaignResult; name: string };
// Nut tren the ket thuc / the cuoi
export type CardAct = 'level' | 'all' | 'menu' | 'report' | 'download';

// Modal nhieu trang (pages/): tong ket level (2 trang) | bao cao cuoi (3 trang)
export type PagesState =
  | { kind: 'summary'; data: { r: LevelSummaryReport; level: Level }; page: number }
  | { kind: 'report'; data: { rep: Report; name: string }; page: number };

export interface ResultState { s: Scenario; c: Choice; changes: Change[]; o: Outcome | null }
export interface DialogState extends Line { key: number }
export interface HudState { lv: string; day: number; metrics: Metrics | null }
// hieu ung chi so vua doi (HUD): at = thoi diem bat dau
export interface Fx extends Change { id: number; at: number; key: MetricKey }
export interface StaffState { id: string; anchor: HTMLElement }

export interface PlayState {
  bg: string | null; fade: boolean; busy: boolean;
  hud: HudState; fx: Fx[];
  cast: string[]; castShown: boolean;
  dialog: DialogState | null; choice: Scenario | null; result: ResultState | null;
  pages: PagesState | null; card: CardState | null; tour: boolean; staff: StaffState | null;
  paused: boolean;                          // dang tam dung: hien bang tuy chon (PauseMenu)
}

// Phan tu DOM component gan cho Director do / dat truc tiep
export interface PlayRefs {
  lv?: HTMLElement | null; hud?: HTMLElement | null; dlgPanel?: HTMLElement | null; result?: HTMLElement | null;
  focus?: HTMLElement | null; npcs?: HTMLElement | null; pmHit?: HTMLElement | null; stage?: HTMLCanvasElement | null;
}
export type RefKey = keyof PlayRefs;
