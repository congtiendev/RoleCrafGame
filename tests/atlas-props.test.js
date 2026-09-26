// Do cam tay + noi that trong atlas game (build_preview.py: game_atlas): moi dong tac co `bind` trong manifest
// phai hien do vat tuong ung trong khung – khong duoc de nhan vat cam tay khong (vd but long khi viet bang).
// Doc thang anh atlas (PIL qua python3) de do: khung co do vat thi rong / cao hon han nhan vat dung mot minh.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import ATLAS from '../src/game/atlas.js';

const root = new URL('../', import.meta.url);
const man = JSON.parse(readFileSync(new URL('pm_sprite_manifest.json', root)));
const bind = {};
for (const sh of man.sheets) for (const c of sh.cells) if (c.bind) bind[c.key] = c.bind;

// Mau pixel duc (alpha > 0) cua cac khung trong atlas: { anim: [[minX, minY, maxX, maxY] tren tung khung] }
const boxes = JSON.parse(execFileSync('python3', ['-c', `
import json, sys
from PIL import Image
a = json.loads(sys.argv[1]); im = Image.open(sys.argv[2]).convert('RGBA')
print(json.dumps({n: [im.crop((i * v['fw'], v['y'], (i + 1) * v['fw'], v['y'] + v['fh'])).getbbox() for i in range(v['n'])] for n, v in a.items()}))
`, JSON.stringify(ATLAS.anims), new URL('sheets/game_pm.webp', root).pathname]).toString());

const frames = n => man.animations['pm/' + n].frames;
const binds = n => frames(n).map(k => bind[k] || []);

test('dong tac viet / chi bang: co bang trang ben phai (khung rong hon 1.5 lan nguoi dung)', () => {
  for (const n of ['wb_write', 'wb_point']) {
    assert.ok(binds(n).every(b => b.some(x => x.furniture === 'whiteboard')), `${n}: manifest phai bind whiteboard`);
    for (const bb of boxes[n]) assert.ok(bb[2] - bb[0] > 1.5 * ATLAS.stand, `${n}: thieu bang trang (rong ${bb[2] - bb[0]})`);
  }
});

test('ngoi go may ban dem: co ban + man hinh (khung rong hon han nguoi ngoi)', () => {
  for (const n of ['night_type', 'night_rub'])
    for (const bb of boxes[n]) assert.ok(bb[2] - bb[0] > ATLAS.stand * 1.3, `${n}: thieu ban lam viec`);
});

test('hop ban: co ban hop ben canh', () => {
  for (const n of Object.keys(ATLAS.anims).filter(n => n.startsWith('meet_table_')))
    for (const bb of boxes[n]) assert.ok(bb[2] - bb[0] > ATLAS.stand * 1.1, `${n}: thieu ban hop`);
});

test('dong tac khong bind do vat thi khong bi ghep them', () => {
  for (const n of ['talk', 'sigh', 'good', 'goahead', 'stop', 'count', 'thumbs'])
    for (const bb of boxes[n]) assert.ok(bb[2] - bb[0] < ATLAS.stand, `${n}: khung qua rong, co the ghep nham`);
});

test('moi animation game co trong manifest va khung nao cung co noi dung', () => {
  for (const n of Object.keys(ATLAS.anims)) {
    assert.ok(man.animations['pm/' + n], n);
    assert.equal(boxes[n].length, ATLAS.anims[n].n);
    assert.ok(boxes[n].every(Boolean), `${n}: co khung trong`);
  }
});
