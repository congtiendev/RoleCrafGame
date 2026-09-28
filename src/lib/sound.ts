// Am thanh game (public/sounds, nguon: CREDITS.txt) qua Web Audio: nap + giai ma truoc, phat doan cat san (file goc dai
// hon can dung), am lap (go phim, buoc chan) bat/tat theo trang thai moi khung hinh. Tat tieng luu localStorage.
// Trinh duyet chan phat tieng truoc thao tac dau tien: AudioContext tao luc nap (treo), mo lai o lan bam / phim dau.
//
//   play('win')                      phat mot lan
//   hold('typing', dangGo, 'dialog') am lap: phat khi CO it nhat mot noi (owner) dang giu; goi moi khung hinh cung duoc
import { useSyncExternalStore } from 'react';
import { asset } from './ui.ts';

// from/to: doan dung trong file (giay, do tu duong bao am cua file); loop: lap doan [from, to]
interface Clip { file: string; from: number; to: number; gain: number; loop?: boolean }
const CLIPS = {
  pop: { file: 'pop', from: 0.1, to: 0.45, gain: 0.55 },            // bam nut: tieng "pop" 0.12–0.17s
  typing: { file: 'typing', from: 0.45, to: 7.39, gain: 0.9, loop: true },   // chu dang chay (file nho ~ -37 dB)
  walk: { file: 'walk', from: 0.03, to: 3.87, gain: 0.45, loop: true },      // 8 nhip buoc (0.48s/nhip) -> lap khong vap
  win: { file: 'win', from: 0, to: 2.5, gain: 0.55 },               // marimba di len: ket qua tot / qua level / Pass
  warn: { file: 'warning', from: 0.15, to: 0.82, gain: 0.4 },       // 1 tieng bip: lua chon xau di nhieu hon tot
  alert: { file: 'warning', from: 0.15, to: 1.45, gain: 0.45 },     // 2 tieng bip: su co, canh bao he thong
  lose: { file: 'lose', from: 0.3, to: 4.4, gain: 0.55 },           // ken "wah wah": xep loai xau / khong dat
} satisfies Record<string, Clip>;
export type SoundName = keyof typeof CLIPS;

const FADE = 0.06;                                                   // lam mo 60ms o mep cat: khong nghe tieng "tach"
const MUTE_KEY = 'rolecraft.sound.muted';
let ctx: AudioContext | null = null, out: GainNode | null = null;
const buf: Record<string, AudioBuffer | null> = {};
const loops: Partial<Record<SoundName, { owners: Set<string>; src?: AudioBufferSourceNode; g?: GainNode }>> = {};

let muted = (() => { try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; } })();
const subs = new Set<() => void>();

// Nap + giai ma moi file (goi mot lan luc mo game; loi / trinh duyet khong ho tro -> game im lang, van choi duoc)
export function initSound() {
  if (ctx || typeof AudioContext === 'undefined') return;
  ctx = new AudioContext();
  out = ctx.createGain(); out.gain.value = muted ? 0 : 1; out.connect(ctx.destination);
  const unlock = () => { if (ctx?.state === 'suspended') ctx.resume().catch(() => {}); };
  addEventListener('pointerdown', unlock, true); addEventListener('keydown', unlock, true);
  for (const f of new Set(Object.values(CLIPS).map(c => c.file))) {
    buf[f] = null;
    fetch(asset(`sounds/${f}.mp3`)).then(r => r.arrayBuffer()).then(a => ctx!.decodeAudioData(a))
      .then(b => { buf[f] = b; }).catch(() => { /* thieu file: bo qua */ });
  }
}

function start(c: Clip, offset = c.from) {
  const b = buf[c.file];
  if (!ctx || !out || !b || ctx.state !== 'running') return null;
  const src = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime;
  src.buffer = b; src.connect(g); g.connect(out);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(c.gain, t + (c.loop ? 0.12 : 0.005));
  if (c.loop) { src.loop = true; src.loopStart = c.from; src.loopEnd = c.to; src.start(t, offset); }
  else {
    const dur = c.to - offset;
    g.gain.setValueAtTime(c.gain, t + Math.max(0, dur - FADE)); g.gain.linearRampToValueAtTime(0, t + dur);
    src.start(t, offset, dur);
  }
  return { src, g };
}

// cung mot am goi lai trong 80ms (StrictMode chay effect 2 lan o dev, 2 noi cung bao) -> chi phat mot lan
const last: Partial<Record<SoundName, number>> = {};
export function play(name: SoundName) {
  const now = performance.now();
  if (muted || now - (last[name] ?? -1e9) < 80) return;
  last[name] = now; start(CLIPS[name]);
}

// Am lap theo "chu so huu": nhieu noi cung giu (vd hai hop thoai) thi van mot ban; khong con ai giu -> tat dan
export function hold(name: SoundName, on: boolean, owner = 'default') {
  const L = (loops[name] ||= { owners: new Set() });
  if (on === L.owners.has(owner) && (!on || L.src)) return;       // dang giu ma chua phat duoc (chua giai ma xong): thu lai
  if (on) L.owners.add(owner); else L.owners.delete(owner);
  const want = L.owners.size > 0;                                 // tat tieng: am luong tong = 0, am lap van theo trang thai
  if (want && !L.src) {
    const c = CLIPS[name];
    // go phim: bat dau o cho ngau nhien trong doan -> moi cau nghe khac nhau
    const s = start(c, name === 'typing' ? c.from + Math.random() * (c.to - c.from - 0.5) : c.from);
    if (s) Object.assign(L, s);
  } else if (!want && L.src) {
    const { src, g } = L, t = ctx!.currentTime;
    g!.gain.cancelScheduledValues(t); g!.gain.setValueAtTime(g!.gain.value, t); g!.gain.linearRampToValueAtTime(0, t + 0.12);
    src.stop(t + 0.13); L.src = L.g = undefined;
  }
}
// Tat moi am lap (roi man choi, xoa du lieu...)
export function stopLoops() { for (const [k, L] of Object.entries(loops)) for (const o of [...(L?.owners || [])]) hold(k as SoundName, false, o); }

// ---------- tat / bat tieng ----------
export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* bo qua */ }
  if (out && ctx) out.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.03);
  subs.forEach(f => f());
}
export const useMuted = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, isMuted);
