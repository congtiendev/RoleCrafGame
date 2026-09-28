// Kieu CONG KHAI cua module (web chu dung): props cua GameApp / RoleCraftGame / mountRoleCraft va du lieu cac su kien.
import type { Metrics, Tier } from './content/schema.ts';
import type { Change } from './game/types.ts';
import type { LevelSummaryReport } from './game/summary.ts';
import type { Report } from './game/campaign.ts';
import type { Session } from './game/session.ts';

// Sau moi lua chon
export interface ChoiceEvent {
  level: number; levelId: string; scenario: string; no: string; title: string; day: number;
  choice: string; label: string;
  outcome: string | null;                  // ket qua re nhanh (vd 'C1'), khong co = null
  changes: Change[]; metrics: Metrics; flags: Record<string, boolean>;
}
// Khi xong mot level (level cuoi: tier / summary = null, ket qua o onFinish)
export interface LevelCompleteEvent {
  level: number; levelId: string;
  tier: Tier | null; summary: LevelSummaryReport | null; metrics: Metrics;
}
// Ket qua 60 ngay: bao cao day du + ban chu (text)
export interface FinishReport extends Report { player: string; text: string }

export type GameState = Session;

// Su kien ra web chu (goi API...)
export interface GameHooks {
  loadProgress?: () => GameState | null | undefined | Promise<GameState | null | undefined>;
  saveProgress?: (state: GameState) => unknown;
  onChoice?: (e: ChoiceEvent) => void;
  onLevelComplete?: (e: LevelCompleteEvent) => void;
  onFinish?: (report: FinishReport) => void;
  onExit?: () => void;                     // co thi man nhap ten co nut Thoat
}

export interface GameAppProps extends GameHooks {
  player?: { name?: string };              // web chu da biet ten nguoi choi: bo qua the nhap ten
  storageKey?: string;                     // khoa localStorage luu tien do (mac dinh 'rolecraft.pm60.session')
  hash?: boolean;                          // trang rieng: dong bo #ten man tren URL
  start?: string;                          // man mo dau (trang rieng)
}

// Callback dang dung trong man choi (ban moi nhat qua ref) + ve menu, xoa du lieu choi (ve man nhan the)
export interface PlayHooks extends GameAppProps { onMenu: () => void; onReset: () => void }
