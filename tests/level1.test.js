// Noi dung Level 1 (src/game/level1.js) doi chieu voi nguon goc:
// - docs/KICH_BAN_ROLECRAFT_PM60.md: ma tinh huong, ngay, hieu ung, co, nang luc, hau qua tri hoan, ket qua
// - THOAI_MAU.json: thoai tung canh, cau hoi va ten lua chon
// - atlas.js / data.js / bg: dong tac PM, chan dung, emote, do vat, anh nen co that
// - npcAtlas.js: dong tac + chan dung NPC co sprite (npc / npcFace cua dong thoai)
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { LEVEL1, CAST } from '../src/game/level1.js';
import { METRIC, newRun, applyChoice, enterScenario } from '../src/game/rules.js';
import ATLAS from '../src/game/atlas.js';
import NPC from '../src/game/npcAtlas.js';
import { root, DOC, THOAI, SCENES, COMPETENCY, FACES, EMOS, DOC_FLAGS, npcLine, checkDelayed, docScenario, thoai, thoaiKey as key, lines }
  from './helpers/scenarioDoc.js';

const thoaiKey = (no, part) => key('L1', no, part);

test('Level 1: ma level va tieu de theo tai lieu', () => {
  assert.equal(LEVEL1.id, 'P1_STARTUP');
  assert.match(DOC, /\| Level ID \| `P1_STARTUP` \|/);
  assert.match(DOC, /\| Tên Level \| Khởi động \|/);
  assert.equal(LEVEL1.title, 'KHỞI ĐỘNG');
});

test('Mo dau level: thoai khop THOAI_MAU.json (dan truyen da hien o the Level / man nhap ten)', () => {
  assert.deepEqual(lines(LEVEL1.intro.lines), thoai('L1 | Intro nhận việc | Mở cảnh').filter(([who]) => who !== 'NARR'));
});

test('Tong ket: nhan xet cua Anh Minh theo tung muc khop THOAI_MAU.json', () => {
  const key = { good: 'tốt', mid: 'trung bình', bad: 'rủi ro' };
  for (const [mood, lv] of Object.entries(key))
    assert.deepEqual(lines(LEVEL1.summary.comments[mood]), thoai(`L1 | Tổng kết Level 1 (${lv}) | Mở cảnh`), mood);
});

test('Tong ket: co can canh bao va ten xep loai theo tai lieu', () => {
  const sec = DOC.slice(DOC.indexOf('### Tổng kết Level 1'), DOC.indexOf('## 5. Level 2'));
  const flags = sec.split('Cờ cần cảnh báo:')[1].split('```text')[1].split('```')[0].trim().split(/\s+/);
  assert.deepEqual(Object.keys(LEVEL1.summary.dangerFlags).sort(), flags.sort());
  for (const t of LEVEL1.summary.tiers) assert.match(sec, new RegExp(`\\| ${t.label} \\|`), t.label);
  for (const mood of new Set(LEVEL1.summary.tiers.map(t => t.mood))) assert.ok(LEVEL1.summary.comments[mood]?.length, mood);
});

for (const s of LEVEL1.scenarios) {
  describe(`${s.no} · ${s.title}`, () => {
    const doc = docScenario(s.no);

    test('ma tinh huong, ngay, dia diem, tinh huong tiep theo', () => {
      assert.deepEqual([s.id, s.day, s.place, s.next, s.title], [doc.id, doc.day, doc.place, doc.next, doc.title]);
    });

    test('mo canh, cau hoi, ten lua chon khop THOAI_MAU.json', () => {
      assert.deepEqual(lines(s.open), thoai(thoaiKey(s.no, 'Mở cảnh')));
      const ask = THOAI[thoaiKey(s.no, 'Câu hỏi')];
      assert.equal(s.question, ask.hoi);
      assert.deepEqual(s.choices.map(c => [c.id, c.label]), ['A', 'B', 'C'].map(k => [k, ask[k]]));
    });

    for (const c of s.choices) {
      describe(`lua chon ${c.id} · ${c.label}`, () => {
        const d = doc.choices[c.id];

        test('ten, hieu ung, tai nguyen, co, nang luc, ket qua dung tai lieu', () => {
          assert.ok(d, `tai lieu khong co lua chon ${c.id}`);
          assert.equal(c.label, d.label);
          assert.deepEqual(c.effects, d.effects);
          assert.deepEqual(c.set || {}, d.set);
          assert.deepEqual(c.flags || [], d.flags);
          assert.deepEqual(c.competency, d.competency);
          assert.equal(c.result, d.result);
        });

        test('hau qua tri hoan khop ma tran muc 8', () => checkDelayed(`L1 · ${s.no}`, c));

        test('thoai nhanh khop THOAI_MAU.json', () => {
          assert.deepEqual(lines(c.lines), thoai(thoaiKey(s.no, `Nhánh ${c.id}`)));
        });

        test('ma chi so, co, nang luc hop le', () => {
          for (const k of Object.keys(c.effects)) assert.ok(METRIC[k], `chi so ${k}`);
          for (const f of c.flags || []) assert.ok(DOC_FLAGS.has(f), `co ${f} khong co trong danh sach co`);
          for (const [k, v] of Object.entries(c.competency)) {
            assert.ok(COMPETENCY.includes(k), `nang luc ${k}`);
            assert.ok(Number.isInteger(v) && v >= 0 && v <= 3, `${k}: ${v}`);
          }
          assert.ok(c.hint, 'thieu dong mo ta ngan duoi lua chon');
        });
      });
    }

    test('nguoi noi co mat trong canh; dong tac, chan dung, emote, do vat co that', () => {
      const all = [...s.open, ...s.choices.flatMap(c => c.lines)];
      for (const l of all) {
        assert.ok(['PM', 'NARR', 'SYS'].includes(l.who) || s.cast.includes(l.who), `${l.who} noi nhung khong co trong canh`);
        if (l.pm) assert.ok(ATLAS.anims[l.pm], `dong tac ${l.pm} chua co trong atlas (GAME_ANIMS)`);
        if (l.face) assert.ok(FACES.has(l.face), `chan dung ${l.face}`);
        npcLine(l);
      }
      for (const c of s.choices) {
        for (const a of [c.after?.pm, c.after?.then].filter(Boolean)) assert.ok(ATLAS.anims[a], `dong tac ${a}`);
        if (c.after?.emo) assert.ok(EMOS.has(c.after.emo), `emote ${c.after.emo}`);
      }
      for (const id of s.cast) assert.ok(CAST[id], `nhan vat ${id}`);
      assert.ok(s.cast.length >= 1 && s.cast.length <= 3, 'canh co 1–3 NPC (vi tri dung trong LevelScreen)');
      if (s.enter) assert.ok(ATLAS.anims[s.enter], `tu the vao canh ${s.enter}`);
    });

    test('anh nen dung canh trong bg/scenes.json va co du ban PC + mobile', () => {
      assert.ok(SCENES[s.bg]?.scenarioIds.includes(s.id), `${s.bg} khong gan cho ${s.id}`);
      for (const f of ['pc', 'mobile']) assert.ok(existsSync(new URL(`bg/${SCENES[s.bg][f]}`, root)), `${s.bg} ${f}`);
    });

    test('choi tron tinh huong: chi so cuoi = dau + hieu ung (khong cham bien)', () => {
      for (const c of s.choices) {
        const run = newRun(), before = { ...run.metrics };
        enterScenario(run, s);
        applyChoice(run, s, c);
        for (const [k, v] of Object.entries(run.metrics)) assert.equal(v, before[k] + (c.effects[k] || 0), `${c.id} ${k}`);
        for (const [k, v] of Object.entries(c.set || {})) assert.equal(run.resources[k], v, `${c.id} ${k}`);
        assert.equal(run.choices[s.id], c.id);
        assert.equal(run.day, s.day);
      }
    });
  });
}

test('ngay tang dan, tinh huong noi tiep nhau, ket thuc bang P1_SUMMARY', () => {
  const sc = LEVEL1.scenarios;
  sc.forEach((s, i) => {
    if (i) assert.ok(s.day > sc[i - 1].day, s.no);
    assert.equal(s.next, sc[i + 1]?.id ?? LEVEL1.summary.id, s.no);
  });
});

test('mo dau level + tong ket: nguoi noi, anh nen, dong tac hop le', () => {
  const it = LEVEL1.intro, sm = LEVEL1.summary;
  assert.ok(SCENES[it.bg]?.scenarioIds.includes('P1_INTRO'));
  assert.ok(SCENES[sm.bg]);
  for (const l of [...it.lines, ...Object.values(sm.comments).flat()]) {
    assert.ok(['PM', 'NARR'].includes(l.who) || it.cast.includes(l.who) || sm.cast.includes(l.who), l.who);
    if (l.pm) assert.ok(ATLAS.anims[l.pm], l.pm);
    if (l.face) assert.ok(FACES.has(l.face), l.face);
    npcLine(l);
  }
});

test('the nhan vat tam: du ten, vai tro, mau', () => {
  for (const [id, c] of Object.entries(CAST)) {
    assert.ok(c.name && c.role, id);
    assert.match(c.tint, /^#[0-9a-f]{6}$/i, id);
  }
});

test('atlas NPC: moi NPC co sprite deu co trong CAST, du idle/talk/listen, chan dung face_neutral, goc chan trong khung', () => {
  for (const [id, a] of Object.entries(NPC)) {
    assert.ok(CAST[id], id);
    for (const n of ['idle', 'talk', 'listen']) assert.ok(a.anims[n], `${id} thieu ${n}`);
    assert.ok(a.faces.face_neutral, `${id} thieu face_neutral`);
    assert.ok(existsSync(new URL(a.file, root)), a.file);
    for (const [n, f] of Object.entries(a.anims)) assert.ok(f.ox > 0 && f.ox < f.fw && f.oy === f.fh && f.n >= 1 && f.fps > 0, `${id} ${n}`);
  }
});
