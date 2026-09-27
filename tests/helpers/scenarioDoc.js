// Doc nguon goc kich ban cho test noi dung level (level1.test.js, level2.test.js):
// docs/KICH_BAN_ROLECRAFT_PM60.md (tinh huong, hieu ung, co, nang luc, ma tran hau qua tri hoan), THOAI_MAU.json,
// bg/scenes.json, cac ten chan dung / emote co that (data.js), atlas NPC.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import DATA from '../../src/shared/data.js';
import NPC from '../../src/game/npcAtlas.js';

export const root = new URL('../../', import.meta.url);
const read = f => readFileSync(new URL(f, root), 'utf8');
export const DOC = read('docs/KICH_BAN_ROLECRAFT_PM60.md');
export const THOAI = JSON.parse(read('THOAI_MAU.json'));
export const SCENES = JSON.parse(read('bg/scenes.json')).scenes;
export const COMPETENCY = ['SCOPE', 'RESOURCE', 'RISK', 'PEOPLE', 'STAKEHOLDER', 'DECISION'];
const SPEAKER = { 'Anh Minh': 'MINH', Huy: 'HUY', Lan: 'LAN', Nam: 'NAM', 'Anh Hiệp': 'HIEP', Linh: 'LINH', 'Chị Hà': 'HA', 'Chị Hà (HR)': 'HA', PM: 'PM', 'Dẫn truyện': 'NARR', 'Hệ thống': 'SYS' };
export const speaker = name => SPEAKER[name] ?? name;
const cellNames = s => new Set(DATA.cells.filter(c => c.s === s).map(c => c.name));
export const FACES = cellNames('D'), EMOS = cellNames('F');

// dong tac / chan dung rieng cua NPC dang noi: chi NPC co sprite, ten co trong atlas cua chinh NPC do
export function npcLine(l) {
  if (!l.npc && !l.npcFace) return;
  assert.ok(NPC[l.who], `${l.who} chua co sprite (npcAtlas.js) ma dong thoai dat npc/npcFace`);
  if (l.npc) assert.ok(NPC[l.who].anims[l.npc], `dong tac ${l.who} ${l.npc} chua co (import_characters.py: GAME_NPC)`);
  if (l.npcFace) assert.ok(NPC[l.who].faces[l.npcFace], `chan dung ${l.who} ${l.npcFace}`);
}

// Danh sach co trong muc "Co lich su quyet dinh"
export const DOC_FLAGS = new Set(DOC.split('### Cờ lịch sử quyết định')[1].split('```text')[1].split('```')[0].trim().split(/\s+/));

// "Trước L2 · S05 ...; S08 mở bằng biến thể 1" -> ['P2_S05', 'P2_S08'] (ma thieu "L2 ·" lay level cua ma dung truoc;
// khong co ma nao truoc, vd "Trước S16" cua nguon L4 · S13 -> level cua nguon)
function triggers(text, lv) {
  return [...text.matchAll(/(?:L(\d) · )?\b(S\d\d)\b/g)].map(m => `P${(lv = m[1] || lv)}_${m[2]}`);
}
// Ma tran hau qua tri hoan (muc 8): [{ source: 'L1 · S02', flags, at: ['P2_S08', ...], effects, variant, conditional }]
export const MATRIX = DOC.split('## 8. Ma trận hậu quả trì hoãn')[1].split('\n## ')[0].split('\n')
  .filter(l => /^\| L\d · S\d\d \|/.test(l)).map(l => {
    const [, source, flag, when, what] = l.split('|').map(c => c.trim());
    return {
      source, flags: [...flag.matchAll(/`(\w+)`/g)].map(m => m[1]),
      at: triggers(when + ' ' + what, source.match(/^L(\d)/)[1]),
      effects: Object.fromEntries([...what.matchAll(/`(\w+) ([+-]\d+)`/g)].map(m => [m[1], +m[2]])),
      variant: /biến thể/.test(what), conditional: /^Nếu /.test(what),
    };
  });

// Hau qua tri hoan cua mot lua chon (co flags, delayed) khop ma tran muc 8 (source = 'L1 · S02')
export function checkDelayed(source, c) {
  const rows = MATRIX.filter(r => r.source === source && r.flags.some(f => (c.flags || []).includes(f)));
  const ds = c.delayed || [];
  const want = {}, got = {};
  rows.forEach(r => Object.entries(r.effects).forEach(([k, v]) => { want[k] = (want[k] || 0) + v; }));
  ds.forEach(x => Object.entries(x.effects || {}).forEach(([k, v]) => { got[k] = (got[k] || 0) + v; }));
  assert.deepEqual(got, want, 'tong hieu ung tri hoan');
  const at = rows.flatMap(r => r.at);
  for (const x of ds) assert.ok(at.some(a => x.at.startsWith(a + '_')), `${x.at} khong co trong ma tran`);
  assert.equal(ds.some(x => x.variant), rows.some(r => r.variant), 'bien the mo canh');
  assert.equal(ds.some(x => x.ifChoice), rows.some(r => r.conditional), 'hau qua co dieu kien');
}

// Bang "| Hieu ung | ... |" -> { effects (`key +n`), set (`key = n`) }
const effectsOf = row => ({
  effects: Object.fromEntries([...row.matchAll(/`(\w+) ([+-]\d+)`/g)].map(m => [m[1], +m[2]])),
  set: Object.fromEntries([...row.matchAll(/`(\w+) = (\d+)`/g)].map(m => [m[1], +m[2]])),
});

// Muc "### S01 · ..." -> { title, id, day, place, next, section, choices: { A: { label, effects, set, flags, competency, result, part } } }
export function docScenario(no) {
  const start = DOC.indexOf(`### ${no} · `);
  assert.ok(start >= 0, `tai lieu khong co ${no}`);
  const sec = DOC.slice(start, DOC.indexOf('\n### ', start + 1));
  const cell = name => sec.match(new RegExp(`\\| ${name} \\| (.+?) \\|`))?.[1];
  const choices = {};
  for (const part of sec.split('\n#### ').slice(1)) {
    const [head] = part.split('\n'), [id, label] = head.split(' · ');
    const row = name => part.match(new RegExp(`\\| ${name} \\| (.+?) \\|`))?.[1] || '';
    choices[id] = {
      label, part, ...effectsOf(row('Hiệu ứng')),
      flags: [...row('Cờ').matchAll(/`(\w+)`/g)].map(m => m[1]),
      competency: Object.fromEntries([...row('Năng lực').matchAll(/`([A-Z]+): (\d)`/g)].map(m => [m[1], +m[2]])),
      result: part.match(/^Kết quả: (.+)$/m)?.[1],
    };
  }
  return {
    title: sec.split('\n')[0].split(' · ')[1], id: cell('Scenario ID')?.replaceAll('`', ''), section: sec,
    day: +cell('Ngày'), place: cell('Địa điểm'), next: cell('Next (?:scenario|node)')?.replaceAll('`', ''), choices,
  };
}
// Ket qua re nhanh trong phan lua chon ("**C1 · Thuong luong thanh cong**" + bang hieu ung, co)
export function docOutcomes(part) {
  return Object.fromEntries(part.split(/\n\*\*(C\d) · (.+?)\*\*\n/).slice(1).reduce((out, x, i, a) => {
    if (i % 3) return out;
    const body = a[i + 2], row = name => body.match(new RegExp(`\\| ${name} \\| (.+?) \\|`))?.[1] || '';
    return [...out, [x, { label: a[i + 1], ...effectsOf(row('Hiệu ứng')), flags: [...row('Cờ').matchAll(/`(\w+)`/g)].map(m => m[1]) }]];
  }, []));
}

// Thoai trong THOAI_MAU.json -> [[who, text]]. Dong dan truyen "Ngay N · dia diem." game hien bang the Ngay: bo phan do,
// giu phan ke tiep neu co ("Ngày 22 · Phòng họp release. Dự án A đang chậm 3 ngày." -> "Dự án A đang chậm 3 ngày.")
export const thoai = key => {
  assert.ok(THOAI[key], `THOAI_MAU.json khong co khoa ${key}`);
  return THOAI[key].map(([who, text]) => [speaker(who), text])
    .map(([who, text]) => (who === 'NARR' ? [who, text.replace(/^Ngày \d+ · [^.]*\.\s*/, '')] : [who, text]))
    .filter(([, text]) => text);
};
// Khoa THOAI theo level + ma tinh huong: thoaiKey('L1', 'S01', 'Nhánh A') -> 'L1 | S01 Tiếp quản | Nhánh A'.
// Nhieu khoa cung ma (vd "S08 Complain (biến thể 1)", "S09 sau mọi nhánh") -> khoa chinh = ten tinh huong cua khoa "Câu hỏi";
// khong co (vd "S07 C1 ...") thi lay khoa ngan nhat
export function thoaiKey(lv, no, part) {
  const keys = Object.keys(THOAI).filter(k => k.startsWith(`${lv} | ${no} `));
  const main = keys.find(k => k.endsWith('| Câu hỏi'))?.split(' | ')[1];
  const hit = keys.filter(k => k.endsWith(`| ${part}`)).sort((a, b) => a.length - b.length);
  return hit.find(k => k === `${lv} | ${main} | ${part}`) || hit[0];
}
export const lines = ls => ls.map(l => [l.who, l.text]);
