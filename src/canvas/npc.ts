// NPC co sprite trong trang game: atlas characters/<id>/game.webp + toa do npcAtlas.ts (import_characters.py: GAME_NPC).
// NPC chua co trong npcAtlas.ts van hien bang the UI tam (play/PlayScreen.tsx). Anh nap luc can (NPC xuat hien lan dau).
import NPC_ATLAS from '../generated/npcAtlas.ts';
import { asset } from '../lib/ui.ts';
import type { NpcAtlas } from '../lib/spriteTypes.ts';

const IMG: Record<string, HTMLImageElement> = {}, waiting: Record<string, (() => void)[]> = {};
export const npcAtlas = (id: string): NpcAtlas | null => NPC_ATLAS[id] || null;

export function npcImg(id: string) {
  if (!IMG[id]) {
    IMG[id] = new Image();
    IMG[id].onload = () => (waiting[id] || []).splice(0).forEach(f => f());
    IMG[id].src = asset(`${NPC_ATLAS[id].file}?v=${NPC_ATLAS[id].v}`);       // v: ma phien ban -> doi bo sprite la bo cache
  }
  return IMG[id];
}
export const npcReady = (id: string) => !!IMG[id]?.complete && IMG[id].naturalWidth > 0;

// Chan dung NPC (sheet D cua bo sprite, khung ve san) vua khit canvas kich thuoc CSS size px – cung cach drawFace cua PM
export function drawNpcFace(cv: HTMLCanvasElement, id: string, name: string, size: number) {
  const dpr = devicePixelRatio || 1, faces = NPC_ATLAS[id].faces;
  if (cv.width !== Math.round(size * dpr)) {
    cv.width = cv.height = Math.round(size * dpr);
    Object.assign(cv.style, { width: `${size}px`, height: `${size}px` });
  }
  const img = npcImg(id);
  if (!npcReady(id)) { (waiting[id] ||= []).push(() => drawNpcFace(cv, id, name, size)); return; }
  const [x, y, w, h] = faces[name] || faces.face_neutral, s = Math.min(cv.width / w, cv.height / h);
  const ctx = cv.getContext('2d')!;
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, x, y, w, h, (cv.width - w * s) / 2, (cv.height - h * s) / 2, w * s, h * s);
}
