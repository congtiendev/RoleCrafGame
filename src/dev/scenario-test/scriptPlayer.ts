// Trinh phat kich ban kieu choi game: Mo canh -> hoi -> chon nhanh -> het canh
import { DATA, ANIM } from '../../lib/sprites.ts';
import { state } from '../../lib/state.ts';
import type { NamedFrame, ScriptBeat, ScriptColumn, ScriptSituation, SpriteAnim } from '../../lib/spriteTypes.ts';

export const CPS = 38;              // toc do chu hien dan (ky tu / giay)
const readTime = (text: string) => Math.min(6000, Math.max(1900, text.length * 1000 / CPS + 1100));

// Nhip once: phat het khung + giu khung cuoi; nhip loop: phat it nhat 2 vong / 1.6s
function beatDur(b: ScriptBeat) {
  const a = ANIM[b.anim], n = a.frames.length, cyc = n * 1000 / a.fps;
  if (n === 1) return 1200;
  return a.loop ? Math.max(2 * cyc, 1600) : cyc + 700;
}

// phase: 'play' dang phat · 'ask' cho nguoi choi chon · 'end' het canh
// Nhip dang phat: dong tac + thoai chia deu (t0 = ms tu dau nhip), start / dur tren truc thoi gian canh
export interface PlayLine { who: string; text: string; dur: number; t0: number }
export interface PlayBeat extends ScriptBeat { dur: number; start: number; lines: PlayLine[] }
type Phase = 'play' | 'ask' | 'end';
export const P: {
  lvl: number; sit: number; col: number; phase: Phase; after: Phase; playing: boolean;
  seq: PlayBeat[]; scene: NamedFrame[]; total: number; t0: number; pausedT: number;
} = { lvl: 0, sit: 0, col: 0, phase: 'play', after: 'end', playing: true, seq: [], scene: [], total: 0, t0: 0, pausedT: 0 };

export const sitAt = (lvl = P.lvl, sit = P.sit) => DATA.script[lvl].sits[sit];
export const colAt = () => sitAt().cols[P.col];
// Tinh huong co cau hoi va du nhanh A/B/C thi Mo canh ket thuc bang cau hoi
const asks = (s: ScriptSituation) => !!s.ask && s.cols.some(c => c.label.startsWith('Nhánh'));

// Dung chuoi nhip cho mot o kich ban (mot cot cua tinh huong)
function load(col: ScriptColumn) {
  const beats: PlayBeat[] = col.beats.map(b => ({ ...b, dur: beatDur(b), start: 0, lines: [] }));
  // Chia thoai deu theo nhip: cau i gan vao nhip floor(i * soNhip / soCau). Nhip co
  // thoai keo dai cho du doc — loop thi lap tiep, once thi giu khung cuoi.
  const L = col.lines || [];
  L.forEach(([who, text], i) => {
    const b = beats[Math.floor(i * beats.length / L.length)];
    if (b) b.lines.push({ who, text, dur: readTime(text), t0: 0 });
  });
  let acc = 0;
  beats.forEach(b => {
    let t = 0; b.lines.forEach(l => { l.t0 = t; t += l.dur; });
    b.dur = Math.max(b.dur, t); b.start = acc; acc += b.dur;
  });
  Object.assign(P, { seq: beats, scene: col.scene, total: acc, t0: performance.now(), pausedT: 0, playing: true, phase: 'play' });
  if (!beats.length) P.phase = P.after;          // canh chi co do vat: khong co gi de phat
}

// Vao tinh huong tu dau: phat Mo canh, xong thi hoi (neu co cau hoi)
export function startSit(lvl: number, sit: number) {
  Object.assign(P, { lvl, sit, col: 0 });
  P.after = asks(sitAt()) ? 'ask' : 'end';
  load(colAt());
}
// Phat thang mot o (Mo canh / Nhanh X) roi dung
export function startCol(lvl: number, sit: number, col: number) {
  Object.assign(P, { lvl, sit, col, after: 'end' });
  load(colAt());
}
// Nguoi choi chon A/B/C
export function choose(letter: string) {
  const i = sitAt().cols.findIndex(c => c.label === 'Nhánh ' + letter);
  if (i >= 0) startCol(P.lvl, P.sit, i);
}
export const replay = () => P.col === 0 ? startSit(P.lvl, P.sit) : startCol(P.lvl, P.sit, P.col);
export const branchLetter = () => { const l = colAt().label; return l.startsWith('Nhánh ') ? l.slice(6) : ''; };

export function togglePlay() {
  const now = performance.now();
  if (P.playing) P.pausedT = (now - P.t0) * state.speed;
  else P.t0 = now - P.pausedT / state.speed;
  P.playing = !P.playing;
}
export function seekBeat(i: number) {
  const t = P.seq[i].start;
  P.t0 = performance.now() - t / state.speed; P.pausedT = t;
  P.phase = 'play';
}
// Doi toc do ma giu nguyen vi tri dang phat
export function setSpeed(v: number) {
  const now = performance.now(), t = (now - P.t0) * state.speed;
  state.speed = v; P.t0 = now - t / state.speed;
}

function frameIdx(a: SpriteAnim, lt: number) {
  const n = a.frames.length; if (n === 1) return 0;
  const i = Math.floor(lt * a.fps / 1000);
  return a.loop ? i % n : Math.min(n - 1, i);
}

// Trang thai phat tai now; null khi canh chi co do vat. Het canh thi giu khung cuoi va chuyen phase.
export type FrameState = NonNullable<ReturnType<typeof frameState>>;
export function frameState(now: number) {
  if (!P.seq.length) return null;
  // rAF truyen moc dau khung hinh, co the SOM hon performance.now() luc nap canh ->
  // t am -> chi so khung -1 -> frames[-1] undefined. Chan duoi 0.
  let t = Math.max(0, P.playing ? (now - P.t0) * state.speed : P.pausedT);
  if (t >= P.total) { t = P.total - 1; if (P.phase === 'play') P.phase = P.after; }
  let bi = P.seq.findIndex(b => t < b.start + b.dur); if (bi < 0) bi = P.seq.length - 1;
  const beat = P.seq[bi], anim = ANIM[beat.anim], lt = t - beat.start;
  const line = beat.lines.find(l => lt >= l.t0 && lt < l.t0 + l.dur) || beat.lines[beat.lines.length - 1];
  return { t, bi, beat, anim, frame: anim.frames[frameIdx(anim, lt)], line, lineT: line ? lt - line.t0 : 0 };
}
