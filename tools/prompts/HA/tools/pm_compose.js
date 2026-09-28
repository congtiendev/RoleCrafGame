/* pm_compose.js - ghep nhan vat PM voi do cam tay va noi that tach roi.
 *
 * Du lieu vao:
 *   anchors  = build/anchors.json   (tu tools/extract_anchors.py)
 *   manifest = pm_sprite_manifest.json (bind cua tung o: prop/furniture, diem neo, z, rot)
 *
 * Toa do tra ve tinh tu GOC nhan vat (giua day bong duoi chan) o ti le 1.
 *
 *   const pc = PMCompose.create(anchors, manifest);
 *   const layers = pc.layout('pm/tab_present_01', { flip: false });
 *   await pc.draw(ctx, 'pm/tab_present_01', 400, 600, 1, { flip: false, loadImage: src => img });
 *   pc.screens('pm/tab_present_01')  // vung man hinh (tablet, monitor, man chieu) de ve the UI len
 */
(function (root) {
  'use strict';
  const BESIDE_GAP = 0.02;    // khoang cach noi that "canh ben phai" theo chieu cao nhan vat
  const GROUND_FRONT = 0.35;  // vat roi tren san truoc mat nhan vat

  function create(anchors, manifest, base = '') {
    const bind = {};
    for (const sh of manifest.sheets) for (const c of sh.cells) if (c.bind) bind[c.key] = c.bind;
    const imgCache = new Map();

    function layout(key, opts = {}) {
      const ch = anchors[key];
      if (!ch) return [];
      const [ox, oy] = ch.origin;
      const rel = p => [p[0] - ox, p[1] - oy];
      const layers = [{ key, x: -ox, y: -oy, w: ch.w, h: ch.h, z: 0 }];
      const furnPos = {};
      const list = bind[key] || [];
      // noi that truoc (do vat dat tren mat ban can vi tri cua no)
      for (const b of list.filter(b => b.furniture)) {
        const k = 'furn/' + b.furniture, f = anchors[k];
        if (!f) continue;
        let x, y;
        if (b.at === 'seat' && ch.seat && f.seat) { const t = rel(ch.seat); x = t[0] - f.seat[0]; y = t[1] - f.seat[1]; }
        else { x = (ch.w - ox) + BESIDE_GAP * ch.h; y = -f.origin[1]; }       // beside_right, day cham san
        x += b.dx || 0; y += b.dy || 0;                             // tinh chinh tay trong bind
        furnPos[b.furniture] = [x, y];
        layers.push({ key: k, x, y, w: f.w, h: f.h, z: b.z === 'front' ? 1 : -1 });
      }
      for (const b of list.filter(b => b.prop)) {
        const k = 'prop/' + b.prop, p = anchors[k];
        if (!p) continue;
        let t = null;
        if ((b.at === 'grip' || b.at === 'grip2') && ch[b.at]) t = rel(ch[b.at]);
        else if (b.at.startsWith('surface:')) {
          const fid = b.at.slice(8), f = anchors['furn/' + fid], fp = furnPos[fid];
          if (f && fp && f.surface) t = [fp[0] + f.surface[0], fp[1] + f.surface[1]];
        } else if (b.at === 'ground_front') t = [GROUND_FRONT * ch.h, 0];
        if (!t) continue;                                          // thieu diem neo -> bo qua, khong vo man
        t = [t[0] + (b.dx || 0), t[1] + (b.dy || 0)];              // tinh chinh tay trong bind
        layers.push({ key: k, x: t[0] - p.origin[0], y: t[1] - p.origin[1], w: p.w, h: p.h,
                      z: b.z === 'back' ? -1 : 1, rot: b.rot || 0, pivot: p.origin });
      }
      layers.sort((a, b) => a.z - b.z);                            // sort on dinh: giu thu tu khai bao
      if (opts.flip) for (const l of layers) {
        l.x = -(l.x + l.w); l.flip = true; if (l.rot) l.rot = -l.rot;
        if (l.pivot) l.pivot = [l.w - l.pivot[0], l.pivot[1]];
      }
      return layers;
    }

    function screens(key, opts = {}) {
      return layout(key, opts).filter(l => anchors[l.key].screen).map(l => {
        const [sx, sy, sw, sh] = anchors[l.key].screen;
        return { key: l.key, x: l.flip ? l.x + l.w - sx - sw : l.x + sx, y: l.y + sy, w: sw, h: sh };
      });
    }

    function load(k, loadImage) {
      if (!imgCache.has(k)) imgCache.set(k, Promise.resolve(loadImage(base + anchors[k].file)));
      return imgCache.get(k);
    }

    async function draw(ctx, key, x, y, scale = 1, opts = {}) {
      const loadImage = opts.loadImage || (src => new Promise((res, rej) => {
        const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }));
      const layers = layout(key, opts);
      const imgs = await Promise.all(layers.map(l => load(l.key, loadImage)));
      layers.forEach((l, i) => {
        ctx.save();
        ctx.translate(x + l.x * scale, y + l.y * scale);
        if (l.rot) {
          const [px, py] = l.pivot; ctx.translate(px * scale, py * scale);
          ctx.rotate(l.rot * Math.PI / 180); ctx.translate(-px * scale, -py * scale);
        }
        if (l.flip) { ctx.translate(l.w * scale, 0); ctx.scale(-1, 1); }
        ctx.drawImage(imgs[i], 0, 0, l.w * scale, l.h * scale);
        ctx.restore();
      });
      return layers;
    }

    return { layout, screens, draw, bindings: k => bind[k] || [] };
  }

  const api = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PMCompose = api;
})(typeof self !== 'undefined' ? self : this);
