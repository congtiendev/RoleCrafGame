// Noi dung Level 3 (src/content/levels.ts) doi chieu voi nguon goc – cung cach level1/level2.test.ts:
// - docs/KICH_BAN_ROLECRAFT_PM60.md muc 6: ma tinh huong, ngay, hieu ung, co, nang luc, ket qua; muc 8: hau qua tri hoan
// - THOAI_MAU.json: thoai tung canh, cau hoi, ten lua chon, canh sau S09
// - atlas.ts / data.ts / npcAtlas.ts / bg: dong tac, chan dung, anh nen co that
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { regularLevel } from './helpers/levels.ts';
import { check } from '../src/game/conditions.ts';
const LEVEL3 = regularLevel('P3_BREAKTHROUGH');
const LEVEL2 = regularLevel('P2_INTEGRATION');
import { CAST } from '../src/content/cast.ts';
import { newRun, applyChoice, enterScenario } from '../src/game/rules.ts';
import { METRIC } from '../src/content/metrics.ts';
import ATLAS from '../src/generated/atlas.ts';
import NPC from '../src/generated/npcAtlas.ts';
import { pub, DOC, SCENES, COMPETENCY, FACES, DOC_FLAGS, MATRIX, npcLine, checkDelayed, docScenario, thoaiKey as key, speaker, lines, thoaiLines, thoaiAsk }
  from './helpers/scenarioDoc.ts';
import type { Line, MetricKey } from '../src/content/schema.ts';

const SEC = DOC.slice(DOC.indexOf('## 6. Level 3'), DOC.indexOf('## 7. Level 4'));
const split = (eff: Record<string, number>) => ({
  effects: Object.fromEntries(Object.entries(eff).filter(([k]) => METRIC[k as MetricKey])),
  add: Object.fromEntries(Object.entries(eff).filter(([k]) => !METRIC[k as MetricKey])),
});
// Thoai Level 3: dong "LEVEL 3 · ..." hien bang the Level; "Ngày N · X." -> bo "Ngày N · ", phan X la thoi diem / dia diem
// (da hien o the Ngay: nam trong s.place) thi bo, con lai la dan truyen (vd "Linh ghé qua bàn PM.")
const thoai = (k: string, place = '') => thoaiLines(k).map(([who, text]) => [speaker(who), text])
  .filter(([who, text]) => !(who === 'NARR' && text.startsWith('LEVEL 3 ·')))
  .map(([who, text]) => [who, who === 'NARR' ? text.replace(/^Ngày \d+ · /, '') : text])
  .filter(([who, text]) => !(who === 'NARR' && place.includes(text.replace(/\.$/, ''))));
const thoaiKey = (no: string, part: string) => key('L3', no, part);
function checkLine(l: Line, cast: string[]) {
  assert.ok(['PM', 'NARR', 'SYS'].includes(l.who) || cast.includes(l.who), `${l.who} noi nhung khong co trong canh`);
  assert.notEqual(l.who, 'HUY', 'Huy co the da nghi (key_developer_left) – Level 3 khong de Huy noi');
  if (l.pm) assert.ok(ATLAS.anims[l.pm], `dong tac ${l.pm} chua co trong atlas (GAME_ANIMS)`);
  if (l.face) assert.ok(FACES.has(l.face), `chan dung ${l.face}`);
  for (const [id, act] of Object.entries(l.react || {}) as [string, string][]) {
    assert.ok(cast.includes(id), `react: ${id} khong co trong canh`);
    assert.ok(NPC[id]?.anims[act], `react: dong tac ${id} ${act}`);
  }
  npcLine(l);
}

test('Level 3: ma level, tieu de, ngay, dong dan truyen mo dau theo tai lieu', () => {
  assert.equal(LEVEL3.id, 'P3_BREAKTHROUGH');
  assert.match(SEC, /Stage ID: `P3_BREAKTHROUGH`/);
  assert.match(SEC, /Label: `Level 3 – Bứt phá`/);
  assert.match(SEC, /Timeline: Ngày 31--45/);
  assert.deepEqual([LEVEL3.title, LEVEL3.day, LEVEL3.phase, LEVEL3.days], ['BỨT PHÁ', 31, 'P3', 'Ngày 31 – 45']);
  const first = thoaiLines(thoaiKey('S09', 'Mở cảnh'))[0];
  assert.match(first[1], /^LEVEL 3 · BỨT PHÁ — Ngày 31 đến 45\./);
  assert.ok(first[1].endsWith(LEVEL3.lead!));
  assert.equal(LEVEL3.intro, undefined, 'tai lieu khong co canh mo dau Level 3');
});

test('Co anh huong tu level truoc: OT -> PM met tu Level 3, Huy nghi -> vang mat', () => {
  assert.equal(LEVEL3.tired, 'team_ot_14_days');
  assert.deepEqual(LEVEL3.absent, { HUY: 'key_developer_left' });
  for (const f of [LEVEL3.tired!, ...Object.values(LEVEL3.absent!)]) assert.ok(DOC_FLAGS.has(f), f);
});

test('Tong ket: khong co nhan xet rieng, nut sang giai doan Thu hoach, co canh bao la co Level 3 trong ma tran', () => {
  const sm = LEVEL3.summary, sec = SEC.slice(SEC.indexOf('### Tổng kết Level 3'));
  assert.match(sec, /không có lời nhận xét riêng/);
  assert.equal(sm.comments, undefined);
  assert.match(sec, new RegExp(`\\*\\*${sm.cta}\\*\\*`, 'i'));
  const l3flags = new Set(MATRIX.filter(r => r.source.startsWith('L3 ·')).flatMap(r => r.flags));
  for (const f of Object.keys(sm.dangerFlags)) assert.ok(l3flags.has(f), f);
  assert.ok(check(sm.tiers.at(-1)!.when, {}), 'muc cuoi luon khop');
  assert.ok(SCENES[sm.bg]?.scenarioIds.includes('P3_SUMMARY'));
});

for (const s of LEVEL3.scenarios) {
  describe(`${s.no} · ${s.title}`, () => {
    const doc = docScenario(s.no);

    test('ma tinh huong, ngay, tinh huong tiep theo (tai lieu khong ghi dia diem -> game tu dat)', () => {
      assert.deepEqual([s.id, s.day, s.next, s.title], [doc.id, doc.day, doc.next, doc.title]);
      assert.ok(s.place);
    });

    test('mo canh, cau hoi, ten lua chon khop THOAI_MAU.json', () => {
      assert.deepEqual(lines(s.open), thoai(thoaiKey(s.no, 'Mở cảnh'), s.place));
      const ask = thoaiAsk(thoaiKey(s.no, 'Câu hỏi'));
      assert.equal(s.question, ask.hoi);
      assert.deepEqual(s.choices.map(c => [c.id, c.label]), ['A', 'B', 'C'].map(k => [k, ask[k]]));
    });

    for (const c of s.choices) {
      describe(`lua chon ${c.id} · ${c.label}`, () => {
        const d = doc.choices[c.id];

        test('ten, hieu ung, tai nguyen, co, nang luc, ket qua dung tai lieu', () => {
          const want = split(d.effects);
          assert.equal(c.label, d.label);
          assert.deepEqual(c.effects, want.effects);
          assert.deepEqual(c.add || {}, want.add);
          assert.deepEqual(c.flags || [], d.flags);
          assert.deepEqual(c.competency, d.competency);
          assert.equal(c.result, d.result);
        });

        test('hau qua tri hoan khop ma tran muc 8', () => checkDelayed(`L3 · ${s.no}`, c));

        test('thoai nhanh khop THOAI_MAU.json', () => {
          assert.deepEqual(lines(c.lines), thoai(thoaiKey(s.no, `Nhánh ${c.id}`)));
        });

        test('ma chi so, co, nang luc hop le', () => {
          for (const k of Object.keys(c.effects || {})) assert.ok(METRIC[k as MetricKey], `chi so ${k}`);
          for (const k of Object.keys(c.add || {})) assert.ok(k in newRun().resources, `tai nguyen ${k}`);
          for (const f of c.flags || []) assert.ok(DOC_FLAGS.has(f), `co ${f}`);
          for (const [k, v] of Object.entries(c.competency || {})) {
            assert.ok(COMPETENCY.includes(k), `nang luc ${k}`);
            assert.ok(Number.isInteger(v) && v >= 0 && v <= 3, `${k}: ${v}`);
          }
          assert.ok(c.hint, 'thieu dong mo ta ngan duoi lua chon');
        });
      });
    }

    test('nguoi noi co mat trong canh; dong tac, chan dung, phan ung NPC co that', () => {
      assert.ok(s.cast.length >= 1 && s.cast.length <= 3);
      for (const id of s.cast) assert.ok(CAST[id], id);
      for (const l of [...s.open, ...Object.values(s.variants || {}).flat(), ...s.choices.flatMap(c => c.lines), ...(s.outro?.lines || [])])
        checkLine(l, s.cast);
      for (const c of s.choices) for (const a of [c.after?.pm, c.after?.then].filter(x => x != null)) assert.ok(ATLAS.anims[a], `dong tac ${a}`);
      if (s.outro) assert.ok(ATLAS.anims[s.outro.pm!]);
      assert.ok(!s.laterAt || s.laterAt < s.open.length);
    });

    test('anh nen dung canh trong bg/scenes.json va co du ban PC + mobile', () => {
      assert.ok(SCENES[s.bg]?.scenarioIds.includes(s.id), `${s.bg} khong gan cho ${s.id}`);
      for (const f of ['pc', 'mobile'] as const) assert.ok(existsSync(new URL(`bg/${SCENES[s.bg][f]}`, pub)), `${s.bg} ${f}`);
    });

    test('choi tron tinh huong tu dau phien: chi so cuoi = dau + hieu ung', () => {
      for (const c of s.choices) {
        const run = newRun(), before = { ...run.metrics }, team = run.resources.team_size;
        enterScenario(run, s);
        applyChoice(run, s, c);
        const clamp = (k: MetricKey, v: number) => Math.max(METRIC[k as MetricKey].min, Math.min(METRIC[k as MetricKey].max, v));
        for (const [k, v] of (Object.entries(run.metrics) as [MetricKey, number][])) assert.equal(v, clamp(k, before[k] + (c.effects?.[k] || 0)), `${c.id} ${k}`);
        assert.equal(run.resources.team_size, team + (c.add?.team_size || 0));
        assert.equal(run.day, s.day);
      }
    });
  });
}

test('S09: canh sau moi nhanh khop THOAI_MAU.json, bien the "critical_payment_incident" do Level 2 dat', () => {
  const s = LEVEL3.scenarios[0];
  assert.deepEqual(lines(s.outro!.lines), thoai('L3 | S09 sau mọi nhánh | Mở cảnh'));
  const set = LEVEL2.scenarios.flatMap(x => x.choices).flatMap(c => c.delayed || []).filter(d => d.at === s.id && d.variant);
  assert.deepEqual(set.map(d => d.variant), ['critical_payment_incident']);
  assert.ok(s.variants?.critical_payment_incident);
  // bien the: cung cau cua PM, chi thay dong bao su co
  assert.deepEqual(lines(s.variants.critical_payment_incident).slice(1), lines(s.open).slice(1));
  assert.match(SEC, /use_variant="critical_payment_incident"/);
  assert.match(SEC, /set_flag\(incident_severity_high\)/);
});

test('ngay tang dan tu Level 2, tinh huong noi tiep nhau, ket thuc bang P3_SUMMARY', () => {
  const sc = LEVEL3.scenarios;
  assert.ok(LEVEL3.day > LEVEL2.scenarios.at(-1)!.day);
  sc.forEach((s, i) => {
    if (i) assert.ok(s.day > sc[i - 1].day, s.no);
    assert.equal(s.next, sc[i + 1]?.id ?? LEVEL3.summary.id, s.no);
  });
});
