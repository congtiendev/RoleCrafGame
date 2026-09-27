// PM tren san khau (Actor trong src/game/stage.js): chon khung, animation once/loop, chuyen tiep `then`, di chuyen.
// stage.js tao Image luc nap module -> gia lap Image toi thieu (khong ve gi, chi test logic).
import { test, before, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import ATLAS from '../src/game/atlas.js';

let Actor, now = 0;
before(async () => {
  globalThis.Image = class { addEventListener() {} set src(_) {} };
  ({ Actor } = await import('../src/game/stage.js'));
});
// dong ho gia: performance.now() tra ve `now` do test dat
beforeEach(() => { now = 1000; mock.method(performance, 'now', () => now); });
afterEach(() => mock.restoreAll());

const at = (a, ms) => { now += ms; return a.frame(now); };

test('atlas: moi animation mot hang rieng khong chong nhau, goc chan nam trong khung, fps duong', () => {
  const rows = Object.values(ATLAS.anims).sort((a, b) => a.y - b.y);
  rows.forEach((a, i) => { if (i) assert.ok(a.y >= rows[i - 1].y + rows[i - 1].fh, 'hang chong nhau'); });
  for (const [name, a] of Object.entries(ATLAS.anims)) {
    assert.ok(a.n >= 1 && a.fps > 0 && a.fw > 0 && a.fh > 0, name);
    assert.ok(a.ox >= 0 && a.ox <= a.fw && a.oy > 0 && a.oy <= a.fh, `${name}: goc chan ngoai khung`);
  }
  assert.ok(ATLAS.stand > 150 && ATLAS.stand < 200, 'cao dang dung chuan');
  for (const n of ['idle', 'walk']) assert.ok(ATLAS.anims[n]?.loop, `${n} phai lap`);
});

test('loop: khung chay vong theo fps', () => {
  const pm = new Actor(0.3), { fps, n } = ATLAS.anims.idle, step = 1000 / fps;
  pm.t0 = now;                                               // Actor moi tao co t0 = 0 (pha bat ky)
  assert.equal(pm.frame(now).i, 0);
  assert.equal(at(pm, step).i, 1);
  assert.equal(at(pm, step * (n - 1)).i, 0);                 // het vong quay ve khung dau
});

test('once: phat het roi giu khung cuoi', () => {
  const pm = new Actor(0.3); pm.play('good');
  const { n, fps } = ATLAS.anims.good;
  assert.equal(at(pm, 10 * 1000 / fps).i, n - 1);
  assert.equal(at(pm, 5000).i, n - 1);
  assert.equal(pm.anim, 'good');
});

test('once + then: het khung thi tu chuyen sang animation tiep', () => {
  const pm = new Actor(0.3); pm.play('greet', 'idle');
  const { n, fps } = ATLAS.anims.greet;
  at(pm, (n + 1) * 1000 / fps);
  assert.equal(pm.anim, 'idle');
  assert.equal(pm.then, null);
});

test('play cung animation khong phat lai tu dau', () => {
  const pm = new Actor(0.3); pm.play('talk');
  const t0 = pm.t0; now += 500; pm.play('talk');
  assert.equal(pm.t0, t0);
  pm.play('nod');
  assert.equal(pm.t0, now);
});

test('walkTo: di dan toi dich, xong thi dung (idle) va resolve', async () => {
  const pm = new Actor(-0.15);
  let arrived = false;
  const p = pm.walkTo(0.3, 1000).then(() => { arrived = true; });
  assert.equal(pm.anim, 'walk');
  assert.equal(pm.flip, false);                                // sang phai: khong lat
  at(pm, 500);
  assert.ok(Math.abs(pm.x - 0.075) < 1e-9, `giua duong x=${pm.x}`);
  at(pm, 600);
  await p;
  assert.ok(arrived);
  assert.equal(pm.x, 0.3);
  assert.equal(pm.anim, 'idle');
  assert.equal(pm.walk, null);
});

test('walkTo sang trai thi lat sprite, toi noi thi quay lai', async () => {
  const pm = new Actor(0.6);
  const p = pm.walkTo(0.2, 400);
  assert.equal(pm.flip, true);
  at(pm, 400); await p;
  assert.equal(pm.flip, false);
});

test('rAF co the goi voi now som hon luc bat dau: khong ra khung am', () => {
  const pm = new Actor(0.3); pm.play('walk');
  assert.equal(pm.frame(now - 50).i, 0);
});

test('doi dong tac: khung cu mo dan trong FADE_MS roi bien mat', async () => {
  const { FADE_MS } = await import('../src/game/stage.js');
  const pm = new Actor(0.3); pm.t0 = now; pm.frame(now);
  pm.play('nod');
  let { layers } = pm.layers(now);
  assert.equal(layers.length, 2);
  assert.equal(layers[0].a, ATLAS.anims.idle);
  assert.ok(Math.abs(layers[0].alpha - 1) < 1e-9 && layers[1].alpha === 1);
  now += FADE_MS / 2; ({ layers } = pm.layers(now));
  assert.ok(Math.abs(layers[0].alpha - 0.5) < 1e-9);
  now += FADE_MS; ({ layers } = pm.layers(now));
  assert.equal(layers.length, 1);
  assert.equal(pm.prev, null);
});

test('play cung animation khong tao lop mo dan; dung yen thi tho, di thi khong', () => {
  const pm = new Actor(0.3); pm.play('talk'); pm.frame(now); now += 1000;
  pm.play('talk');
  assert.equal(pm.layers(now).layers.length, 1);
  const sys = [0, 650, 1300, 1950].map(ms => pm.layers(now + ms).sy);
  assert.ok(Math.max(...sys) > 1 && Math.min(...sys) < 1, 'dung yen: scaleY dao dong quanh 1');
  assert.ok(sys.every(v => Math.abs(v - 1) < 0.02), 'bien do tho nho');
  pm.walkTo(0.5, 5000); now += 1000;
  assert.equal(pm.layers(now + 400).sy, 1);
});
