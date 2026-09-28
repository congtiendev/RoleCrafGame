// Kieu du lieu luc chay cua engine: trang thai phien choi (Run), thay doi chi so, bao cao.
import type { CompetencyCode, Delayed, EndingCode, MetricKey, Metrics, ResourceKey } from '../content/schema.ts';

export interface Rating { scenario: string; choice: string; competency: CompetencyCode; rating: number }
export interface PendingDelayed extends Delayed { source: string }          // source = 'P1_S03_SCOPE_CHANGE_A'
export interface Fired { at: string; source: string; note: string | null }

export interface Run {
  metrics: Metrics;
  resources: Record<ResourceKey, number>;
  day: number;
  phase: string;
  levelStart: Record<string, Metrics>;     // chi so dau moi level (bang tong ket)
  flags: Record<string, boolean>;
  variants: Record<string, string>;        // scenarioId -> bien the mo canh do hau qua tri hoan dat
  ratings: Rating[];                       // nang luc, danh gia trong LMS, khong hien cho nguoi choi
  delayed: PendingDelayed[];               // hau qua tri hoan dang cho
  fired: Fired[];                          // hau qua tri hoan da quay lai
  choices: Record<string, string>;         // scenarioId -> 'A' | 'B' | 'C'
  levelsDone: string[];
  worked?: string[];                       // level da tinh nhip lam viec cua team (rules.ts: teamWork), moi level mot lan
  hardFails: string[];
  outcomes: Record<string, string>;        // scenarioId -> ket qua re nhanh (vd 'C1')
  result?: EndingCode;                     // ket qua campaign khi xong level cuoi (hoac sau canh buoc thoi viec)
  forcedExit?: { code: string; day: number; level: string };   // bi buoc thoi viec giua chung (content/campaign.ts)
  checkpoints?: Record<string, Run>;       // diem luu dau level ("Choi lai Level N")
  summaryDone?: boolean;                   // ban luu cu (chi Level 1)
}

export interface Change { key: MetricKey; from: number; to: number }
