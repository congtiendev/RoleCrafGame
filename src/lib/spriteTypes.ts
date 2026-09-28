// Kieu du lieu sprite do tools/ sinh (src/generated/): sheet, khung o, animation, atlas game PM / NPC.

export type Frame = [sheet: string, row: number, col: number] | NamedFrame;
// Khung that cua mot o tren sheet: x, y, w, h, foot (x cua diem chan trong khung, nhan vat neo o chan)
export type Rect = [x: number, y: number, w: number, h: number, foot: number];

export interface SheetInfo { id: string; key: string; cols: number; rows: number; file: string; v?: string }
export interface SpriteAnim {
  name: string; fps: number; loop: boolean; frames: Frame[];
  k?: number;                               // he so thu nho rieng (build_preview.py: normalize_height)
  scenarios?: string[];
}
export interface SpriteCell { name: string; key: string; s: string; r: number; c: number }

// Kich ban cho trang test (doc tu docs/HUONG_DAN_KICH_BAN.md + THOAI_MAU.json)
// o co ten (chan dung, emote, do vat): [sheet, hang, cot, ten]
export type NamedFrame = [sheet: string, row: number, col: number, name: string];
export interface ScriptBeat { anim: string; face?: NamedFrame; emo?: NamedFrame; alt?: boolean }
export interface ScriptColumn { label: string; text: string; beats: ScriptBeat[]; scene: NamedFrame[]; lines?: [who: string, text: string][] }
// ask: cau hoi (hoi) + ten lua chon A/B/C
export interface ScriptSituation { name: string; cols: ScriptColumn[]; ask?: { hoi: string } & Record<string, string> }
export interface ScriptLevel { title: string; note: string; sits: ScriptSituation[] }

// Bo sprite cua mot nhan vat: sheets + khung o (rects[sheetId]['row,col']) + animation + o tinh
export interface SpriteSet {
  sheets: SheetInfo[];
  rects: Record<string, Record<string, Rect>>;
  anims: SpriteAnim[];
  cells: SpriteCell[];
}
export interface SpriteData extends SpriteSet { script: ScriptLevel[] }       // generated/data.ts (PM)
export interface CharacterSet extends SpriteSet {                               // generated/characters.ts (NPC)
  id: string; label: string;
  labels?: Record<string, string>;          // sheetId -> nhan
  bottom?: string[];                        // sheet neo o chan
}

// Atlas game: moi animation mot hang y, khung fw x fh, goc chan ox,oy, n khung
export interface AtlasAnim { y: number; fw: number; fh: number; ox: number; oy: number; n: number; fps: number; loop: boolean }
export interface PmAtlas { stand: number; anims: Record<string, AtlasAnim> }   // generated/atlas.ts
export interface NpcAtlas extends PmAtlas {                                     // generated/npcAtlas.ts
  file: string; v: string;
  faces: Record<string, [x: number, y: number, w: number, h: number]>;
  half: number; tall: number;               // nua be ngang / chieu cao lon nhat theo stand
}
