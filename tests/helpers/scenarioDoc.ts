// Doc nguon goc kich ban cho test noi dung level (level1.test.ts, level2.test.ts):
// docs/KICH_BAN_ROLECRAFT_PM60.md (tinh huong, hieu ung, co, nang luc, ma tran hau qua tri hoan), docs/THOAI_MAU.json,
// docs/bg/scenes.json, cac ten chan dung / emote co that (data.ts), atlas NPC.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import DATA from '../../src/generated/data.ts';
import NPC from '../../src/generated/npcAtlas.ts';
import type { Choice, Effects, Line, Outcome, ResourceChange } from '../../src/content/schema.ts';

// Hieu ung / tai nguyen / co / nang luc doc tu bang trong tai lieu
export interface DocEffects { effects: Effects; set: ResourceChange }
export interface DocChoice extends DocEffects {
  label: string; part: string; flags: string[]; competency: Record<string, number>; result: string | undefined;
}
export interface DocScenario {
  title: string; id: string | undefined; section: string; day: number; place: string | undefined; next: string | undefined;
  choices: Record<string, DocChoice>;
}
export interface MatrixRow { source: string; flags: string[]; at: string[]; effects: Record<string, number>; variant: boolean; conditional: boolean }

const root = new URL('../../', import.meta.url);
// anh luc chay (bg/, characters/, sheets/) nam trong public/
export const pub = new URL('public/', root);
const read = (f: string) => readFileSync(new URL(f, root), 'utf8');
export const DOC = read('docs/KICH_BAN_ROLECRAFT_PM60.md');
// THOAI_MAU.json: khoa thoai -> [[nguoi noi, cau]]; khoa '… | Câu hỏi' -> { hoi, A, B, C }; khoa '_…' = ghi chu
export type ThoaiLines = [string, string][];
export interface ThoaiAsk { hoi: string; A: string; B: string; C: string; [k: string]: string }
export const THOAI: Record<string, ThoaiLines | ThoaiAsk | string> = JSON.parse(read('docs/THOAI_MAU.json'));
export const thoaiLines = (key: string) => THOAI[key] as ThoaiLines;
export const thoaiAsk = (key: string) => THOAI[key] as ThoaiAsk;
export const SCENES: Record<string, { pc: string; mobile: string; scenarioIds: string[] }> = JSON.parse(read('docs/bg/scenes.json')).scenes;
export const COMPETENCY = ['SCOPE', 'RESOURCE', 'RISK', 'PEOPLE', 'STAKEHOLDER', 'DECISION'];
const SPEAKER: Record<string, string> = { 'Anh Minh': 'MINH', Huy: 'HUY', Lan: 'LAN', Nam: 'NAM', 'Anh Hiệp': 'HIEP', Linh: 'LINH', 'Chị Hà': 'HA', 'Chị Hà (HR)': 'HA', PM: 'PM', 'Dẫn truyện': 'NARR', 'Hệ thống': 'SYS' };
export const speaker = (name: string) => SPEAKER[name] ?? name;
const cellNames = (s: string) => new Set(DATA.cells.filter(c => c.s === s).map(c => c.name));
export const FACES = cellNames('D'), EMOS = cellNames('F');

// dong tac / chan dung rieng cua NPC dang noi: chi NPC co sprite, ten co trong atlas cua chinh NPC do
export function npcLine(l: Line) {
  if (!l.npc && !l.npcFace) return;
  assert.ok(NPC[l.who], `${l.who} chua co sprite (npcAtlas.ts) ma dong thoai dat npc/npcFace`);
  if (l.npc) assert.ok(NPC[l.who].anims[l.npc], `dong tac ${l.who} ${l.npc} chua co (import_characters.py: GAME_NPC)`);
  if (l.npcFace) assert.ok(NPC[l.who].faces[l.npcFace], `chan dung ${l.who} ${l.npcFace}`);
}

// Danh sach co trong muc "Co lich su quyet dinh"
export const DOC_FLAGS = new Set(DOC.split('### Cờ lịch sử quyết định')[1].split('```text')[1].split('```')[0].trim().split(/\s+/));

// "Trước L2 · S05 ...; S08 mở bằng biến thể 1" -> ['P2_S05', 'P2_S08'] (ma thieu "L2 ·" lay level cua ma dung truoc;
// khong co ma nao truoc, vd "Trước S16" cua nguon L4 · S13 -> level cua nguon)
function triggers(text: string, lv: string) {
  return [...text.matchAll(/(?:L(\d) · )?\b(S\d\d)\b/g)].map(m => `P${(lv = m[1] || lv)}_${m[2]}`);
}
// Ma tran hau qua tri hoan (muc 8): [{ source: 'L1 · S02', flags, at: ['P2_S08', ...], effects, variant, conditional }]
export const MATRIX: MatrixRow[] = DOC.split('## 8. Ma trận hậu quả trì hoãn')[1].split('\n## ')[0].split('\n')
  .filter(l => /^\| L\d · S\d\d \|/.test(l)).map(l => {
    const [, source, flag, when, what] = l.split('|').map(c => c.trim());
    return {
      source, flags: [...flag.matchAll(/`(\w+)`/g)].map(m => m[1]),
      at: triggers(when + ' ' + what, source.match(/^L(\d)/)![1]),
      effects: Object.fromEntries([...what.matchAll(/`(\w+) ([+-]\d+)`/g)].map(m => [m[1], +m[2]])),
      variant: /biến thể/.test(what), conditional: /^Nếu /.test(what),
    };
  });

// Hau qua tri hoan cua mot lua chon (co flags, delayed) khop ma tran muc 8 (source = 'L1 · S02')
export function checkDelayed(source: string, c: Choice | Outcome) {
  const rows = MATRIX.filter(r => r.source === source && r.flags.some(f => (c.flags || []).includes(f)));
  const ds = c.delayed || [];
  const want: Record<string, number> = {}, got: Record<string, number> = {};
  rows.forEach(r => Object.entries(r.effects).forEach(([k, v]) => { want[k] = (want[k] || 0) + v; }));
  ds.forEach(x => Object.entries(x.effects || {}).forEach(([k, v]) => { got[k] = (got[k] || 0) + v; }));
  assert.deepEqual(got, want, 'tong hieu ung tri hoan');
  const at = rows.flatMap(r => r.at);
  for (const x of ds) assert.ok(at.some(a => x.at.startsWith(a + '_')), `${x.at} khong co trong ma tran`);
  assert.equal(ds.some(x => x.variant), rows.some(r => r.variant), 'bien the mo canh');
  assert.equal(ds.some(x => x.ifChoice), rows.some(r => r.conditional), 'hau qua co dieu kien');
}

// Bang "| Hieu ung | ... |" -> { effects (`key +n`), set (`key = n`) }
const effectsOf = (row: string): DocEffects => ({
  effects: Object.fromEntries([...row.matchAll(/`(\w+) ([+-]\d+)`/g)].map(m => [m[1], +m[2]])),
  set: Object.fromEntries([...row.matchAll(/`(\w+) = (\d+)`/g)].map(m => [m[1], +m[2]])),
});

// Muc "### S01 · ..." -> { title, id, day, place, next, section, choices: { A: { label, effects, set, flags, competency, result, part } } }
export function docScenario(no: string): DocScenario {
  const start = DOC.indexOf(`### ${no} · `);
  assert.ok(start >= 0, `tai lieu khong co ${no}`);
  const sec = DOC.slice(start, DOC.indexOf('\n### ', start + 1));
  const cell = (name: string) => sec.match(new RegExp(`\\| ${name} \\| (.+?) \\|`))?.[1];
  const choices: Record<string, DocChoice> = {};
  for (const part of sec.split('\n#### ').slice(1)) {
    const [head] = part.split('\n'), [id, label] = head.split(' · ');
    const row = (name: string) => part.match(new RegExp(`\\| ${name} \\| (.+?) \\|`))?.[1] || '';
    choices[id] = {
      label, part, ...effectsOf(row('Hiệu ứng')),
      flags: [...row('Cờ').matchAll(/`(\w+)`/g)].map(m => m[1]),
      competency: Object.fromEntries([...row('Năng lực').matchAll(/`([A-Z]+): (\d)`/g)].map(m => [m[1], +m[2]])),
      result: part.match(/^Kết quả: (.+)$/m)?.[1],
    };
  }
  return {
    title: sec.split('\n')[0].split(' · ')[1], id: cell('Scenario ID')?.replaceAll('`', ''), section: sec,
    day: Number(cell('Ngày')), place: cell('Địa điểm'), next: cell('Next (?:scenario|node)')?.replaceAll('`', ''), choices,
  };
}
// Ket qua re nhanh trong phan lua chon ("**C1 · Thuong luong thanh cong**" + bang hieu ung, co)
export function docOutcomes(part: string): Record<string, DocEffects & { label: string; flags: string[] }> {
  return Object.fromEntries(part.split(/\n\*\*(C\d) · (.+?)\*\*\n/).slice(1).reduce<[string, DocEffects & { label: string; flags: string[] }][]>((out, x, i, a) => {
    if (i % 3) return out;
    const body = a[i + 2], row = (name: string) => body.match(new RegExp(`\\| ${name} \\| (.+?) \\|`))?.[1] || '';
    return [...out, [x, { label: a[i + 1], ...effectsOf(row('Hiệu ứng')), flags: [...row('Cờ').matchAll(/`(\w+)`/g)].map(m => m[1]) }]];
  }, []));
}

// Thoai trong THOAI_MAU.json -> [[who, text]]. Dong dan truyen "Ngay N · dia diem." game hien bang the Ngay: bo phan do,
// giu phan ke tiep neu co ("Ngày 22 · Phòng họp release. Dự án A đang chậm 3 ngày." -> "Dự án A đang chậm 3 ngày.")
export const thoai = (key: string) => {
  assert.ok(THOAI[key], `THOAI_MAU.json khong co khoa ${key}`);
  return thoaiLines(key).map(([who, text]) => [speaker(who), text])
    .map(([who, text]) => (who === 'NARR' ? [who, text.replace(/^Ngày \d+ · [^.]*\.\s*/, '')] : [who, text]))
    .filter(([, text]) => text);
};
// Khoa THOAI theo level + ma tinh huong: thoaiKey('L1', 'S01', 'Nhánh A') -> 'L1 | S01 Tiếp quản | Nhánh A'.
// Nhieu khoa cung ma (vd "S08 Complain (biến thể 1)", "S09 sau mọi nhánh") -> khoa chinh = ten tinh huong cua khoa "Câu hỏi";
// khong co (vd "S07 C1 ...") thi lay khoa ngan nhat
export function thoaiKey(lv: string, no: string, part: string) {
  const keys = Object.keys(THOAI).filter(k => k.startsWith(`${lv} | ${no} `));
  const main = keys.find(k => k.endsWith('| Câu hỏi'))?.split(' | ')[1];
  const hit = keys.filter(k => k.endsWith(`| ${part}`)).sort((a, b) => a.length - b.length);
  return hit.find(k => k === `${lv} | ${main} | ${part}`) || hit[0];
}
export const lines = (ls: Line[]) => ls.map(l => [l.who, l.text]);
