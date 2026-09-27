// Noi dung Level 2 (src/game/level2.js) doi chieu voi nguon goc – cung cach level1.test.js:
// - docs/KICH_BAN_ROLECRAFT_PM60.md muc 5: ma tinh huong, ngay, hieu ung, co, nang luc, ket qua re nhanh S07 C,
//   bien the thoai theo co, tong ket; muc 8: hau qua tri hoan
// - THOAI_MAU.json: thoai tung canh, bien the S08, C1/C2, ket canh S07, canh chuyen theo co (FLAG | ...)
// - atlas.js / data.js / npcAtlas.js / bg: dong tac, chan dung, anh nen co that
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { LEVEL2 } from '../src/game/level2.js';
import { LEVEL1, CAST } from '../src/game/level1.js';
import { METRIC, newRun, applyChoice, enterScenario } from '../src/game/rules.js';
import ATLAS from '../src/game/atlas.js';
import { root, DOC, THOAI, SCENES, COMPETENCY, FACES, DOC_FLAGS, npcLine, checkDelayed, docScenario, docOutcomes, thoai, thoaiKey as key, lines }
  from './helpers/scenarioDoc.js';

const thoaiKey = (no, part) => key('L2', no, part);
const SEC = DOC.slice(DOC.indexOf('## 5. Level 2'), DOC.indexOf('## 6. Level 3'));
// hieu ung trong tai lieu -> chi so (effects) + tai nguyen cong/tru (add, vd team_size -1)
const split = eff => ({
  effects: Object.fromEntries(Object.entries(eff).filter(([k]) => METRIC[k])),
  add: Object.fromEntries(Object.entries(eff).filter(([k]) => !METRIC[k])),
});
// dong tac, chan dung PM + NPC co that; nguoi noi co mat (cast = NPC dang dung trong canh)
function checkLine(l, cast) {
  assert.ok(['PM', 'NARR', 'SYS'].includes(l.who) || cast.includes(l.who), `${l.who} noi nhung khong co trong canh`);
  if (l.pm) assert.ok(ATLAS.anims[l.pm], `dong tac ${l.pm} chua co trong atlas (GAME_ANIMS)`);
  if (l.face) assert.ok(FACES.has(l.face), `chan dung ${l.face}`);
  if (l.ifFlag) assert.ok(DOC_FLAGS.has(l.ifFlag), `co ${l.ifFlag}`);
  npcLine(l);
}
const S = id => LEVEL2.scenarios.find(s => s.id === id);

test('Level 2: ma level, tieu de, ngay bat dau theo tai lieu', () => {
  assert.equal(LEVEL2.id, 'P2_INTEGRATION');
  assert.match(SEC, /\| Level ID \| `P2_INTEGRATION` \|/);
  assert.match(SEC, /\| Tên Level \| Hòa nhập \|/);
  assert.match(SEC, /\| Thời gian trong game \| Ngày 16–30 \|/);
  assert.equal(LEVEL2.title, 'HÒA NHẬP');
  assert.equal(LEVEL2.day, 16);
  assert.equal(LEVEL2.phase, 'P2');
});

test('Mo dau level: thoai khop THOAI_MAU.json (dong dau "LEVEL 2 · ..." hien bang the Level)', () => {
  const want = thoai('L2 | Intro | Mở cảnh');
  assert.match(want[0][1], /^LEVEL 2 · HÒA NHẬP/);
  assert.deepEqual(lines(LEVEL2.intro.lines), want.slice(1));
});

test('Canh chuyen pm_overloaded: thoai khop FLAG | pm_overloaded, canh dem o ban lam viec', () => {
  const p = LEVEL2.prelude;
  assert.equal(p.ifFlag, 'pm_overloaded');
  assert.deepEqual(lines(p.lines), thoai('FLAG | pm_overloaded | Cách dùng'));
  assert.ok(p.night && ATLAS.anims[p.pm]);
  for (const l of p.lines) checkLine(l, []);
  assert.ok(SCENES[p.bg]?.scenarioIds.includes('P2_PM_OVERLOADED'));
  // co lam PM met tu Level 2 (tired_*) phai co trong atlas
  assert.equal(LEVEL2.tired, 'pm_overloaded');
  for (const n of ['tired_idle', 'tired_talk', 'tired_walk']) assert.ok(ATLAS.anims[n], n);
});

test('Tong ket: nhan xet cua Anh Minh theo tung muc khop THOAI_MAU.json', () => {
  const key = { good: 'tốt', mid: 'trung bình', bad: 'rủi ro' };
  for (const [mood, lv] of Object.entries(key))
    assert.deepEqual(lines(LEVEL2.summary.comments[mood]), thoai(`L2 | Tổng kết Level 2 (${lv}) | Mở cảnh`), mood);
});

test('Tong ket: ten xep loai va dau hieu "Can than trong" theo tai lieu', () => {
  const sum = SEC.slice(SEC.indexOf('### Tổng kết Level 2'));
  for (const t of LEVEL2.summary.tiers) assert.match(sum, new RegExp(`#### ${t.label}\\n`), t.label);
  const caution = sum.split('#### Cần thận trọng')[1].split('####')[0];
  const flags = [...caution.matchAll(/`(\w+)`/g)].map(m => m[1]);
  assert.deepEqual(Object.keys(LEVEL2.summary.dangerFlags).sort(), flags.sort());
  for (const mood of new Set(LEVEL2.summary.tiers.map(t => t.mood))) assert.ok(LEVEL2.summary.comments[mood]?.length, mood);
  assert.ok(SCENES[LEVEL2.summary.bg]?.scenarioIds.includes('P2_SUMMARY'));
  assert.ok(SCENES[LEVEL2.intro.bg]?.scenarioIds.includes('P2_INTRO'));
});

for (const s of LEVEL2.scenarios) {
  describe(`${s.no} · ${s.title}`, () => {
    const doc = docScenario(s.no);

    test('ma tinh huong, ngay, dia diem, tinh huong tiep theo', () => {
      assert.deepEqual([s.id, s.day, s.place, s.next, s.title], [doc.id, doc.day, doc.place, doc.next, doc.title]);
    });

    test('mo canh, cau hoi, ten lua chon khop THOAI_MAU.json', () => {
      assert.deepEqual(lines(s.open.filter(l => !l.ifFlag)), thoai(thoaiKey(s.no, 'Mở cảnh')));
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
          if (c.outcomes) {
            // ket qua re nhanh: nang luc ghi o dong "Nang luc ghi nhan cho lua chon C", hieu ung/co nam o tung ket qua
            const comp = SEC.match(new RegExp(`\\*\\*Năng lực ghi nhận cho lựa chọn ${c.id}:\\*\\* (.+)`))[1];
            assert.deepEqual(c.competency, Object.fromEntries([...comp.matchAll(/`([A-Z]+): (\d)`/g)].map(m => [m[1], +m[2]])));
            assert.deepEqual(c.effects, {});
            const outs = docOutcomes(d.part);
            assert.deepEqual(c.outcomes.map(o => o.id), Object.keys(outs));
            for (const o of c.outcomes) {
              const want = split(outs[o.id].effects);
              assert.equal(o.label, outs[o.id].label);
              assert.deepEqual(o.effects, want.effects, o.id);
              assert.deepEqual(o.add || {}, want.add, o.id);
              assert.deepEqual(o.flags || [], outs[o.id].flags, o.id);
              assert.ok(o.result, `${o.id}: thieu mo ta ket qua`);
            }
            return;
          }
          const want = split(d.effects);
          assert.deepEqual(c.effects, want.effects);
          assert.deepEqual(c.add || {}, want.add);
          assert.deepEqual(c.set || {}, d.set);
          assert.deepEqual(c.flags || [], d.flags);
          assert.deepEqual(c.competency, d.competency);
          assert.equal(c.result, d.result);
        });

        test('hau qua tri hoan khop ma tran muc 8', () => {
          checkDelayed(`L2 · ${s.no}`, c);
          for (const o of c.outcomes || []) checkDelayed(`L2 · ${s.no}`, o);
        });

        test('thoai nhanh (va ket qua re nhanh) khop THOAI_MAU.json', () => {
          assert.deepEqual(lines(c.lines), thoai(thoaiKey(s.no, `Nhánh ${c.id}`)));
          for (const o of c.outcomes || [])
            assert.deepEqual(lines(o.lines), thoai(key('L2', `${s.no} ${o.id}`, 'Mở cảnh')), o.id);
        });

        test('ma chi so, co, nang luc hop le', () => {
          for (const p of [c, ...(c.outcomes || [])]) {
            for (const k of Object.keys(p.effects || {})) assert.ok(METRIC[k], `chi so ${k}`);
            for (const k of Object.keys(p.add || {})) assert.ok(k in newRun().resources, `tai nguyen ${k}`);
            for (const f of p.flags || []) assert.ok(DOC_FLAGS.has(f), `co ${f} khong co trong danh sach co`);
          }
          for (const [k, v] of Object.entries(c.competency)) {
            assert.ok(COMPETENCY.includes(k), `nang luc ${k}`);
            assert.ok(Number.isInteger(v) && v >= 0 && v <= 3, `${k}: ${v}`);
          }
          assert.ok(c.hint, 'thieu dong mo ta ngan duoi lua chon');
        });
      });
    }

    test('nguoi noi co mat trong canh; dong tac, chan dung co that', () => {
      const opens = [s.open, ...Object.values(s.variants || {})].flat();
      for (const l of opens) checkLine(l, s.cast);
      for (const c of s.choices) {
        const cast = [...s.cast, ...(c.join || [])];
        assert.ok(cast.length <= 3, 'canh co 1–3 NPC (vi tri dung trong LevelScreen)');
        for (const p of [c, ...(c.outcomes || [])]) {
          for (const l of p.lines) checkLine(l, cast);
          for (const a of [p.after?.pm, p.after?.then].filter(Boolean)) assert.ok(ATLAS.anims[a], `dong tac ${a}`);
        }
        for (const out of [c.outro].filter(Boolean)) for (const l of out.lines) checkLine(l, cast);
      }
      if (s.outro) { assert.ok(ATLAS.anims[s.outro.pm]); s.outro.lines.forEach(l => checkLine(l, [])); }
      for (const id of s.cast) assert.ok(CAST[id], `nhan vat ${id}`);
      if (s.enter) assert.ok(ATLAS.anims[s.enter], `tu the vao canh ${s.enter}`);
    });

    test('anh nen dung canh trong bg/scenes.json va co du ban PC + mobile', () => {
      assert.ok(SCENES[s.bg]?.scenarioIds.includes(s.id), `${s.bg} khong gan cho ${s.id}`);
      for (const f of ['pc', 'mobile']) assert.ok(existsSync(new URL(`bg/${SCENES[s.bg][f]}`, root)), `${s.bg} ${f}`);
    });

    test('choi tron tinh huong tu dau phien: chi so cuoi = dau + hieu ung lua chon (+ ket qua re nhanh)', () => {
      for (const c of s.choices) {
        const run = newRun(), before = { ...run.metrics }, team = run.resources.team_size;
        enterScenario(run, s);
        applyChoice(run, s, c);
        const o = c.outcomes?.find(x => x.id === run.outcomes[s.id]);
        assert.equal(!!o, !!c.outcomes, `${c.id}: ket qua re nhanh`);
        for (const [k, v] of Object.entries(run.metrics))
          assert.equal(v, before[k] + (c.effects[k] || 0) + (o?.effects[k] || 0), `${c.id} ${k}`);
        assert.equal(run.resources.team_size, team + (c.add?.team_size || 0) + (o?.add?.team_size || 0));
        assert.equal(run.choices[s.id], c.id);
        assert.equal(run.day, s.day);
      }
    });
  });
}

test('S07: bien the thoai cua Huy theo co khop tai lieu', () => {
  const doc = docScenario('S07').section.split('*Biến thể thoại theo cờ:*')[1].split('**Câu hỏi:**')[0];
  const want = [...doc.matchAll(/^- `(\w+)=true` → \*\*Huy:\*\* (.+)$/gm)].map(m => [m[1], m[2]]);
  assert.equal(want.length, 3);
  assert.deepEqual(S('P2_S07_KEY_PERSON_RETENTION').open.filter(l => l.ifFlag).map(l => [l.ifFlag, l.text]), want);
});

test('S07: ket canh sau moi nhanh khop THOAI_MAU.json', () => {
  assert.deepEqual(lines(S('P2_S07_KEY_PERSON_RETENTION').outro.lines), thoai('L2 | S07 kết cảnh | Mở cảnh'));
});

test('S05 B: canh OT khop FLAG | team_ot_14_days', () => {
  const b = S('P2_S05_DUAL_DEADLINE').choices.find(c => c.id === 'B');
  assert.deepEqual(lines(b.outro.lines), thoai('FLAG | team_ot_14_days | Cách dùng'));
});

test('S08: bien the 1 khop THOAI_MAU.json va dung ten bien the ma Level 1 dat', () => {
  const s = S('P2_S08_CUSTOMER_COMPLAINT');
  const set = LEVEL1.scenarios.flatMap(x => x.choices).flatMap(c => c.delayed || []).filter(d => d.at === s.id).map(d => d.variant);
  assert.ok(set.length >= 2 && set.every(v => s.variants[v]), 'S02 B va S03 A dat bien the co trong S08');
  assert.deepEqual(lines(s.variants.requirement_changed_without_confirmation), thoai('L2 | S08 Complain (biến thể 1) | Mở cảnh'));
});

test('S07 C: C1 khi tinh than >= 55 va khong OT, nguoc lai C2 (khong ngau nhien)', () => {
  const s = S('P2_S07_KEY_PERSON_RETENTION'), c = s.choices.find(x => x.id === 'C');
  const pick = setup => { const run = newRun(); setup(run); applyChoice(run, s, c); return run; };
  let run = pick(() => {});
  assert.equal(run.outcomes[s.id], 'C1');
  assert.ok(run.flags.key_developer_retained && !run.flags.key_developer_left);
  assert.equal(run.resources.team_size, 3);
  run = pick(r => { r.metrics.team_morale = 55; });
  assert.equal(run.outcomes[s.id], 'C1', 'bien 55 van la C1');
  run = pick(r => { r.metrics.team_morale = 54; });
  assert.equal(run.outcomes[s.id], 'C2');
  run = pick(r => { r.flags.team_ot_14_days = true; });
  assert.equal(run.outcomes[s.id], 'C2', 'OT hai tuan -> C2 du tinh than cao');
  assert.ok(run.flags.key_developer_left && !run.flags.key_developer_retained);
  assert.equal(run.resources.team_size, 2);
  // nang luc van tinh theo lua chon C
  assert.deepEqual(run.ratings.map(r => [r.competency, r.rating, r.choice]), [['PEOPLE', 3, 'C'], ['STAKEHOLDER', 2, 'C']]);
  // C2: hau qua o S09 khi chi cu mot dev (key_developer_left)
  assert.deepEqual(run.delayed.map(d => [d.at, d.ifChoice, d.source]), [['P3_S09_PRODUCTION_INCIDENT', 'B', `${s.id}_C2`]]);
});

test('ngay tang dan tu Level 1, tinh huong noi tiep nhau, ket thuc bang P2_SUMMARY', () => {
  const sc = LEVEL2.scenarios;
  assert.ok(sc[0].day > LEVEL1.scenarios.at(-1).day && LEVEL2.day > LEVEL1.scenarios.at(-1).day);
  assert.equal(LEVEL1.scenarios.at(-1).next, 'P1_SUMMARY');
  sc.forEach((s, i) => {
    if (i) assert.ok(s.day > sc[i - 1].day, s.no);
    assert.equal(s.next, sc[i + 1]?.id ?? LEVEL2.summary.id, s.no);
  });
});

test('mo dau level + tong ket: nguoi noi, dong tac hop le', () => {
  const it = LEVEL2.intro, sm = LEVEL2.summary;
  for (const l of it.lines) checkLine(l, it.cast);
  for (const l of Object.values(sm.comments).flat()) checkLine(l, sm.cast);
});
