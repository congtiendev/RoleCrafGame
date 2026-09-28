// Giao thuc realtime "man trinh chieu" (docs/BE_REALTIME_TRINH_CHIEU.md): tin nhan JSON qua WebSocket.
// Nguoi choi choi doc lap (khong phong, khong choi cung nhau); man trinh chieu chi XEM danh sach ai dang choi / xong / da roi.
// Dung chung cho game (nguoi choi), man trinh chieu (PresenterScreen) va mock may chu (dev/mock-live-server.ts). Chi co kieu +
// hang so. May chu that: BE lam theo tai lieu tren.
//
//   Man trinh chieu (admin)          May chu                         Nguoi choi (game)
//   host  ────────────────────────▶  them vao danh sach nguoi xem
//         ◀────────────────────────  players {players} (ca danh sach) + event (lich su gan day)
//                                    ◀─────────────────────────────  join {id, name}        (sau khi nhap ten)
//                                    ◀─────────────────────────────  state {where, level, day, result}
//         ◀────────────────────────  players (moi lan doi) · event {kind, name, at}
//                                    ◀─────────────────────────────  leave (bam Thoat) / mat ket noi qua GRACE_MS

export const LIVE_PATH = '/live';               // duong dan WebSocket mac dinh (dev: mock gan vao npm run dev)
export const GRACE_MS = 10_000;                 // mat ket noi qua thoi gian nay (khong noi lai) -> "Da roi"
export const NAME_MAX = 24;                     // nhu game/session.ts: checkName

export type Where = 'lobby' | 'play';           // o sanh (man Start / gioi thieu) | dang choi mot giai doan
export type PlayerStatus = 'playing' | 'finished' | 'left';
export interface LiveResult { code: string; label: string; mood: 'good' | 'mid' | 'bad' }

// Trang thai nguoi choi gui len (moi lan doi); result = null khi chua co ket qua / dang choi lai
export interface PlayerState { where: Where; level?: number; day?: number; result?: LiveResult | null }

// Nguoi choi tren man trinh chieu
export interface LivePlayer extends PlayerState {
  id: string; name: string; status: PlayerStatus;
  joinedAt: number; updatedAt: number;          // ms (Date.now() cua may chu)
}
// label / mood: chi co o 'finish' (nhan + mau ket qua)
export interface LiveEvent { kind: 'join' | 'leave' | 'finish' | 'back'; id: string; name: string; at: number; label?: string; mood?: LiveResult['mood'] }

// Tin nhan len may chu
export type ClientMsg =
  | { t: 'host' }
  | { t: 'join'; id: string; name: string }
  | ({ t: 'state' } & PlayerState)
  | { t: 'leave' };
// Tin nhan tu may chu
export type ServerMsg =
  | { t: 'players'; players: LivePlayer[] }
  | { t: 'event'; event: LiveEvent }
  | { t: 'joined' }
  | { t: 'error'; code: 'bad' | 'full' | 'auth'; message: string };
