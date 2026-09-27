// Noi dung Level 4 (src/game/level4.js) + ket thuc campaign doi chieu voi nguon goc – cung cach level1–3.test.js:
// - docs/KICH_BAN_ROLECRAFT_PM60.md muc 7 (tinh huong, hieu ung, co, nang luc de xuat, bien the thoai theo co, dieu kien S16),
//   muc 8 (hau qua tri hoan), muc 9 (ket thuc)
// - THOAI_MAU.json: thoai tung canh, phan bien S16, thoai ket thuc (END | ...)
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { LEVEL4 } from '../src/game/level4.js';
import { LEVEL3 } from '../src/game/level3.js';
import { CAST } from '../src/game/level1.js';
import { ENDINGS } from '../src/game/campaign.js';
import { METRIC, newRun, applyChoice, enterScenario } from '../src/game/rules.js';
import ATLAS from '../src/game/atlas.js';
import NPC from '../src/game/npcAtlas.js';
import { root, DOC, THOAI, SCENES, COMPETENCY, FACES, DOC_FLAGS, npcLine, checkDelayed, docScenario, thoai, thoaiKey as key, speaker, lines }
  from './helpers/scenarioDoc.js';

const SEC = DOC.slice(DOC.indexOf('## 7. Level 4'), DOC.indexOf('## 8. Ma trận'));
const thoaiKey = (no, part) => key('L4', no, part);
const base = ls => ls.filter(l => !l.ifFlag && !l.when);           // cau mau (khong phu thuoc co / dieu kien)
function checkLine(l, cast) {
  assert.ok(['PM', 'NARR', 'SYS'].includes(l.who) || cast.includes(l.who), `${l.who} noi nhung khong co trong canh`);
  if (l.pm) assert.ok(ATLAS.anims[l.pm], `dong tac ${l.pm} chua co trong atlas (GAME_ANIMS)`);
  if (l.face) assert.ok(FACES.has(l.face), `chan dung ${l.face}`);
  for (const f of [l.ifFlag, l.unlessFlag].filter(Boolean)) assert.ok(DOC_FLAGS.has(f), `co ${f}`);
  for (const [id, act] of Object.entries(l.react || {})) {
    assert.ok(cast.includes(id), `react: ${id} khong co trong canh`);
    assert.ok(NPC[id]?.anims[act], `react: dong tac ${id} ${act}`);
  }
  // Huy co the da nghi (key_developer_left): moi cau Huy noi / nhac ten Huy phai co cau thay the
  if (l.who === 'HUY' || /\bHuy\b/.test(l.text)) assert.ok(l.alt?.HUY, `thieu alt.HUY: ${l.text}`);
  npcLine(l);
}
const allLines = s => [...s.open, ...s.choices.flatMap(c => c.lines), ...(s.outro?.lines || [])];

test('Level 4: ma level, tieu de, ngay, dong dan truyen mo dau theo tai lieu', () => {
  assert.equal(LEVEL4.id, 'P4_HARVEST');
  assert.match(SEC, /\| Level ID \| `P4_HARVEST` \|/);
  assert.match(SEC, /\| Tên Level \| Thu hoạch \|/);
  assert.match(SEC, /\| Thời gian trong game \| Ngày 46–60 \|/);
  assert.match(SEC, /\| Node kết thúc \| `P4_CAMPAIGN_RESULT` \|/);
  assert.deepEqual([LEVEL4.title, LEVEL4.day, LEVEL4.phase, LEVEL4.final], ['THU HOẠCH', 46, 'P4', true]);
  assert.equal(LEVEL4.ending.id, 'P4_CAMPAIGN_RESULT');
  const want = thoai('L4 | Intro | Mở cảnh');
  assert.match(want[0][1], /^LEVEL 4 · THU HOẠCH — Ngày 46 đến 60\./);
  assert.ok(want[0][1].endsWith(LEVEL4.lead));
  assert.deepEqual(lines(LEVEL4.intro.lines), want.slice(1));
  for (const l of LEVEL4.intro.lines) checkLine(l, LEVEL4.intro.cast);
  assert.ok(SCENES[LEVEL4.intro.bg]?.scenarioIds.includes('P4_INTRO'));
  assert.ok(LEVEL4.day > LEVEL3.scenarios.at(-1).day);
});

test('Bien the thoai theo co (S13–S15) dung tung chu cua tai lieu', () => {
  const want = [...SEC.slice(0, SEC.indexOf('### S16')).matchAll(/^- `(\w+)=true` → \*\*(.+?):\*\* (.+)$/gm)]
    .map(m => [m[1], speaker(m[2]), m[3]]).sort();
  const got = LEVEL4.scenarios.slice(0, 3).flatMap(allLines).filter(l => l.ifFlag).map(l => [l.ifFlag, l.who, l.text]).sort();
  assert.equal(want.length, 12);
  assert.deepEqual(got, want);
});

for (const s of LEVEL4.scenarios) {
  describe(`${s.no} · ${s.title}`, () => {
    const doc = docScenario(s.no);

    test('ma tinh huong, ngay, dia diem, tinh huong tiep theo', () => {
      assert.deepEqual([s.id, s.day, s.place, s.next, s.title], [doc.id, doc.day, doc.place, doc.next, doc.title]);
    });

    test('mo canh, cau hoi, ten lua chon khop THOAI_MAU.json', () => {
      assert.deepEqual(lines(base(s.open)), thoai(thoaiKey(s.no, 'Mở cảnh')));
      const ask = THOAI[thoaiKey(s.no, 'Câu hỏi')];
      assert.equal(s.question, ask.hoi);
      assert.deepEqual(s.choices.map(c => [c.id, c.label]), ['A', 'B', 'C'].map(k => [k, ask[k]]));
    });

    for (const c of s.choices) {
      describe(`lua chon ${c.id} · ${c.label}`, () => {
        const d = doc.choices[c.id];

        test('ten, hieu ung, co, nang luc (de xuat), ket qua dung tai lieu', () => {
          assert.equal(c.label, d.label);
          assert.deepEqual(c.effects, d.effects);
          assert.deepEqual(c.flags || [], d.flags);
          assert.deepEqual(c.competency, d.competency);
          assert.equal(c.result, d.result);
        });

        test('hau qua tri hoan khop ma tran muc 8', () => checkDelayed(`L4 · ${s.no}`, c));

        test('thoai nhanh (cau mau) khop THOAI_MAU.json', () => {
          assert.deepEqual(lines(base(c.lines)), thoai(thoaiKey(s.no, `Nhánh ${c.id}`)));
        });

        test('ma chi so, co, nang luc hop le', () => {
          for (const k of Object.keys(c.effects)) assert.ok(METRIC[k], `chi so ${k}`);
          for (const f of c.flags || []) assert.ok(DOC_FLAGS.has(f), `co ${f}`);
          for (const [k, v] of Object.entries(c.competency)) {
            assert.ok(COMPETENCY.includes(k), `nang luc ${k}`);
            assert.ok(Number.isInteger(v) && v >= 0 && v <= 3, `${k}: ${v}`);
          }
          assert.ok(c.hint);
        });
      });
    }

    test('nguoi noi co mat trong canh; dong tac, chan dung, phan ung NPC co that; cau lien quan Huy co cau thay the', () => {
      assert.ok(s.cast.length >= 1 && s.cast.length <= 4);
      for (const id of s.cast) assert.ok(CAST[id], id);
      for (const l of allLines(s)) checkLine(l, s.cast);
      for (const c of s.choices) for (const a of [c.after?.pm, c.after?.then].filter(Boolean)) assert.ok(ATLAS.anims[a], `dong tac ${a}`);
      if (s.enter) assert.ok(ATLAS.anims[s.enter]);
      for (const a of Object.values(s.alias || {})) assert.ok(ATLAS.anims[a], a);
    });

    test('anh nen dung canh trong bg/scenes.json va co du ban PC + mobile', () => {
      assert.ok(SCENES[s.bg]?.scenarioIds.includes(s.id), `${s.bg} khong gan cho ${s.id}`);
      for (const f of ['pc', 'mobile']) assert.ok(existsSync(new URL(`bg/${SCENES[s.bg][f]}`, root)), `${s.bg} ${f}`);
    });

    test('choi tron tinh huong tu dau phien: chi so cuoi = dau + hieu ung', () => {
      for (const c of s.choices) {
        const run = newRun(), before = { ...run.metrics };
        enterScenario(run, s);
        applyChoice(run, s, c);
        const clamp = (k, v) => Math.max(METRIC[k].min, Math.min(METRIC[k].max, v));
        for (const [k, v] of Object.entries(run.metrics)) assert.equal(v, clamp(k, before[k] + (c.effects[k] || 0)), `${c.id} ${k}`);
      }
    });
  });
}

test('S16: dieu kien mo man – bang chung / canh bao theo bang tai lieu, hau qua cong tru nam o delayed', () => {
  const s = LEVEL4.scenarios[3], cond = s.open.filter(l => l.title);
  assert.deepEqual(cond.map(l => l.title), ['Cảnh báo burnout', 'Hội đồng yêu cầu giải trình', 'Bằng chứng tích cực', 'Bằng chứng tích cực']);
  const table = SEC.slice(SEC.indexOf('### S16')).split('**Mở cảnh**')[0];
  for (const f of ['team_ot_14_days', 'process_gap_unresolved', 'process_standardized', 'team_ownership', 'development_plan_created', 'ownership_delegated'])
    assert.match(table, new RegExp(`\`${f}=true\``), f);
  const r = newRun();
  assert.deepEqual(cond.map(l => (l.when ? !!l.when(r) : !!r.flags[l.ifFlag])), [false, false, false, false]);
  Object.assign(r.flags, { team_ot_14_days: true, process_gap_unresolved: true, team_ownership: true, development_plan_created: true });
  r.metrics.team_morale = 39;
  assert.deepEqual(cond.map(l => (l.when ? !!l.when(r) : !!r.flags[l.ifFlag])), [true, true, true, true]);
  r.metrics.team_morale = 40;
  assert.equal(!!cond[0].when(r), false, 'burnout chi khi tinh than duoi 40');
});

test('S16: phan bien – cau mau khop THOAI_MAU.json; tra loi theo hanh trinh khi khac mau', () => {
  const o = LEVEL4.scenarios[3].outro;
  assert.deepEqual(lines(o.lines), thoai('L4 | S16 phản biện | Mở cảnh'));
  for (const l of o.lines) checkLine(l, LEVEL4.scenarios[3].cast);
  const [, a1, , a2, , a3, , a4] = o.lines, run = newRun();
  const d = (id, no, choice, avg, label = 'X', title = 'Tình huống', result = 'Kết quả một. Hai.') => ({ id, no, choice, avg, label, title, result });
  assert.equal(a1.textFor(run, { best: [d('P4_S15_CLIENT_EXPANSION', 'S15', 'C', 3)] }), null);
  assert.equal(a1.textFor(run, { best: [d('P3_S09_PRODUCTION_INCIDENT', 'S09', 'C', 3, 'Rollback', 'Production Incident')] }),
    'Quyết định "Rollback" khi production Incident: kết quả một.');
  assert.equal(a2.textFor(run, { worst: [d('P1_S03_SCOPE_CHANGE', 'S03', 'A', 0.5)] }), null, 'hoi han ve pham vi = cau mau');
  assert.equal(a2.textFor(run, { worst: [d('P2_S06_DEADLINE_QUALITY', 'S06', 'C', 3)] }), null, 'khong co quyet dinh kem');
  assert.match(a2.textFor(run, { worst: [d('P3_S11_JUNIOR_MISTAKE', 'S11', 'A', 0.5, 'Phê bình', 'Thành viên mắc lỗi')] }), /^Em sẽ không chọn "Phê bình"/);
  assert.ok(a3.textFor(run));
  assert.equal(a3.textFor({ ...run, flags: { team_ownership: true } }), null);
  assert.equal(a4.textFor({ ...run, flags: { expansion_phased: true } }), null);
});

test('Ket thuc: ten + tieu de theo muc 9, thoai khop THOAI_MAU.json (END | ...)', () => {
  const S9 = DOC.slice(DOC.indexOf('## 9. Kết quả campaign'), DOC.indexOf('## 10.'));
  const key = { PASS_EXCELLENT: 'Pass xuất sắc', PASS: 'Pass', EXTEND_PROBATION: 'Gia hạn thử việc', FAIL: 'Không đạt' };
  for (const [code, e] of Object.entries(ENDINGS)) {
    assert.match(S9, new RegExp(`#### ${e.label} · \`${code}\` · ${e.title}\\n`), code);
    assert.deepEqual(lines(LEVEL4.ending.lines[code]), thoai(`END | ${key[code]} | Trình tự dùng sheet`), code);
    for (const l of LEVEL4.ending.lines[code]) {
      checkLine(l, LEVEL4.ending.cast);
      if (l.exit) assert.ok(ATLAS.anims[l.exit], l.exit);
    }
  }
  assert.ok(SCENES[LEVEL4.ending.bg]?.scenarioIds.includes('P4_CAMPAIGN_RESULT'));
});

test('ngay tang dan, tinh huong noi tiep nhau, ket thuc bang P4_CAMPAIGN_RESULT', () => {
  const sc = LEVEL4.scenarios;
  sc.forEach((s, i) => {
    if (i) assert.ok(s.day > sc[i - 1].day, s.no);
    assert.equal(s.next, sc[i + 1]?.id ?? LEVEL4.ending.id, s.no);
  });
  assert.equal(sc.at(-1).day, 60);
});
