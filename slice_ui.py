#!/usr/bin/env python3
"""Cat 3 sheet UI (ui/source/*.png) thanh tung asset WebP lossless trong ui/<nhom>/ + manifest ui/ui.json.

Sheet goc da co alpha san (nen trong suot, glow ban trong suot) nen KHONG xoa nen:
- vung dac (alpha > 128) = mot phan tu; glow/vien mo (alpha > 8) gan vao phan tu gan nhat trong ban kinh GLOW
- cat sat khung + PAD px trong suot, alpha 254 -> 255, RGB duoi alpha 0 xoa ve 0 (file nho, khong ri mau khi scale)
- ten dat theo luoi: vi tri hang/cot trong tung vung cua sheet (xem LAYOUT). Sai so phan tu -> dung lai bao loi.

Can numpy + scipy (he thong khong co san):
    python3 -m venv /tmp/uivenv && /tmp/uivenv/bin/pip install numpy scipy pillow
    /tmp/uivenv/bin/python slice_ui.py      # doi sheet thi chay lai
"""
import json, os, shutil
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
UI = os.path.join(HERE, 'ui')
SOLID, FAINT = 128, 8   # nguong alpha: loi phan tu / bo nhieu
GLOW = 24               # px: glow xa hon loi phan tu thi bo
PAD = 2

ICONS = ['close', 'check', 'back', 'next', 'play', 'pause', 'refresh', 'home', 'settings', 'info']
STATES = ['normal', 'selected', 'pressed', 'hover', 'disabled']
TIERS = ['bronze', 'silver', 'gold', 'blue']
FILLS = ['blue', 'green', 'yellow', 'red']


def grid(rows, cols, name):
    """Vung xep luoi rows x cols (danh sach nhan) -> name(row, col)."""
    return {'rows': rows, 'cols': cols, 'name': name}


# Moi sheet: danh sach (thu muc con, vung (x0, y0, x1, y1) tren sheet goc, cach dat ten).
# Vung chi can bao tron tam cac phan tu; tam nam trong vung nao thuoc vung do.
LAYOUT = {
    'card.png': [
        ('cards', (0, 0, 1536, 330), grid(1, ['landscape_sm_normal', 'landscape_md_selected', 'panel_wide_normal'],
                                          lambda r, c: f'card_{c}')),
        ('cards', (0, 330, 1536, 590), grid(1, ['portrait_normal', 'portrait_selected', 'portrait_disabled',
                                                'landscape_normal', 'landscape_selected'], lambda r, c: f'card_{c}')),
        ('cards', (0, 590, 1536, 1024), grid(1, ['square_normal', 'square_selected', 'square_disabled',
                                                 'landscape_md_disabled'], lambda r, c: f'card_{c}')),
    ],
    'button.png': [
        ('buttons', (0, 0, 1536, 470), grid(['blue', 'navy', 'green', 'yellow', 'red'], STATES,
                                            lambda r, c: f'btn_{r}_{c}')),
        ('buttons/round', (1070, 470, 1536, 770), grid(['blue', 'red', 'green', 'yellow'], STATES,
                                                       lambda r, c: f'round_{r}_{c}')),
        ('buttons/square', (1040, 770, 1536, 1024), grid(['blue', 'red', 'green'],
                                                         ['normal', 'selected', 'pressed', 'yellow', 'disabled'],
                                                         # cot vang: 3 nut giong het nhau -> chi lay 1
                                                         lambda r, c: ('square_yellow_normal' if r == 'blue' else None)
                                                         if c == 'yellow' else f'square_{r}_{c}')),
        ('icons/circle', (0, 470, 1060, 770), grid(['blue', 'red', 'green'], ICONS, lambda r, c: f'circle_{r}_{c}')),
        ('icons/square', (0, 770, 1030, 1024), grid(['blue', 'red', 'green'], ICONS, lambda r, c: f'square_{r}_{c}')),
    ],
    'progress_badget.png': [
        ('badges', (0, 0, 780, 190), grid(1, TIERS, lambda r, c: f'badge_laurel_{c}')),
        ('badges', (780, 0, 1536, 190), grid(1, TIERS, lambda r, c: f'badge_shield_{c}')),
        ('badges', (0, 190, 780, 370), grid(1, TIERS, lambda r, c: f'badge_hexagon_{c}')),
        ('badges', (780, 190, 1536, 370), grid(1, TIERS, lambda r, c: f'badge_rosette_{c}')),
        ('badges', (0, 370, 780, 520), grid(1, TIERS, lambda r, c: f'badge_wing_ring_{c}')),
        ('badges', (780, 370, 1536, 520), grid(1, TIERS, lambda r, c: f'badge_wing_crest_{c}')),
        ('progress', (0, 520, 660, 740), grid(['lg', 'md', 'sm'], 1, lambda r, c: f'track_{r}')),
        ('progress', (0, 740, 660, 820), grid(1, 1, lambda r, c: 'track_segmented')),
        # thanh fill = 3 manh (dau, than, duoi) -> gop theo o luoi
        ('progress', (660, 520, 1536, 740), {'cells': ([660, 860, 1075, 1295, 1536], [520, 590, 660, 740]),
                                             'rows': ['lg', 'md', 'sm'], 'cols': FILLS,
                                             'name': lambda r, c: f'fill_{c}_{r}'}),
        # khoi segment giong het nhau trong mot nhom -> chi lay khoi dau moi mau
        ('progress', (660, 740, 1536, 820), {'first_of': [660, 850, 1040, 1290, 1536], 'cols': FILLS,
                                             'name': lambda c: f'segment_{c}'}),
        ('progress', (0, 820, 230, 1024), grid(1, 1, lambda r, c: 'ring_frame')),
        # cung gauge = 4 manh (2 dau + 2 cung) -> gop thanh mot asset moi mau
        ('progress', (230, 820, 1536, 1024), {'cells': ([230, 560, 880, 1200, 1536], [820, 1024]),
                                              'rows': [None], 'cols': FILLS, 'name': lambda r, c: f'arc_{c}'}),
    ],
}


def rows_of(items):
    """Gom phan tu thanh hang theo tam y (khoang trong > nua chieu cao phan tu = hang moi)."""
    items = sorted(items, key=lambda o: o['cy'])
    rows = [[items[0]]]
    for o in items[1:]:
        prev = rows[-1][-1]
        if o['cy'] - prev['cy'] > min(o['h'], prev['h']) / 2:
            rows.append([])
        rows[-1].append(o)
    return [sorted(r, key=lambda o: o['cx']) for r in rows]


def main():
    src_dir = os.path.join(UI, 'source')
    os.makedirs(src_dir, exist_ok=True)
    for f in LAYOUT:                            # lan dau: chuyen sheet goc tu goc repo vao ui/source/
        if os.path.exists(os.path.join(HERE, f)):
            shutil.move(os.path.join(HERE, f), os.path.join(src_dir, f))

    manifest = {'format': 'webp (lossless, alpha)', 'source': 'ui/source/', 'assets': {}}
    for sheet, regions in LAYOUT.items():
        rgba = np.asarray(Image.open(os.path.join(src_dir, sheet)).convert('RGBA')).copy()
        alpha = rgba[..., 3]
        lab, n = ndi.label(alpha > SOLID)
        # glow/vien mo -> loi gan nhat
        dist, (iy, ix) = ndi.distance_transform_edt(lab == 0, return_indices=True)
        owner = lab[iy, ix]
        owner[(alpha <= FAINT) | (dist > GLOW)] = 0
        idx = range(1, n + 1)
        sizes = ndi.sum_labels(np.ones_like(lab), lab, idx)
        centers = ndi.center_of_mass(np.ones_like(lab), lab, idx)
        objs = []
        for i, s in enumerate(ndi.find_objects(owner)):
            if s is None or sizes[i] < 60:      # vun nho le
                continue
            y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
            cy, cx = centers[i]
            objs.append({'ids': [i + 1], 'box': (x0, y0, x1, y1), 'cx': cx, 'cy': cy, 'h': y1 - y0})
        used = set()

        def export(folder, name, group):
            ids = [k for o in group for k in o['ids']]
            x0 = min(o['box'][0] for o in group) - PAD
            y0 = min(o['box'][1] for o in group) - PAD
            x1 = max(o['box'][2] for o in group) + PAD
            y1 = max(o['box'][3] for o in group) + PAD
            x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, rgba.shape[1]), min(y1, rgba.shape[0])
            px = rgba[y0:y1, x0:x1].copy()
            keep = np.isin(owner[y0:y1, x0:x1], ids)
            px[..., 3] = np.where(keep, px[..., 3], 0)
            px[..., 3][px[..., 3] >= 254] = 255
            px[px[..., 3] == 0] = 0
            rel = f'ui/{folder}/{name}.webp'
            os.makedirs(os.path.join(HERE, 'ui', folder), exist_ok=True)
            Image.fromarray(px, 'RGBA').save(os.path.join(HERE, rel), 'WEBP', lossless=True, quality=90, method=6)  # q100+m6 cham gap 15 lan, nho hon <1%
            assert name not in manifest['assets'], name
            manifest['assets'][name] = {'src': rel, 'w': x1 - x0, 'h': y1 - y0,
                                        'sheet': f'ui/source/{sheet}', 'rect': [x0, y0, x1 - x0, y1 - y0]}

        for folder, (rx0, ry0, rx1, ry1), spec in regions:
            inside = [o for o in objs if rx0 <= o['cx'] < rx1 and ry0 <= o['cy'] < ry1 and o['ids'][0] not in used]
            used.update(o['ids'][0] for o in inside)
            where = f'{sheet} vung {(rx0, ry0, rx1, ry1)}'
            if 'cells' in spec:
                xs, ys = spec['cells']
                for r, (ya, yb) in zip(spec['rows'], zip(ys, ys[1:])):
                    for c, (xa, xb) in zip(spec['cols'], zip(xs, xs[1:])):
                        group = [o for o in inside if xa <= o['cx'] < xb and ya <= o['cy'] < yb]
                        assert group, f'{where}: o {r}/{c} trong'
                        export(folder, spec['name'](r, c), group)
            elif 'first_of' in spec:
                xs = spec['first_of']
                for c, (xa, xb) in zip(spec['cols'], zip(xs, xs[1:])):
                    group = sorted((o for o in inside if xa <= o['cx'] < xb), key=lambda o: o['cx'])
                    assert group, f'{where}: nhom {c} trong'
                    o = group[0]
                    x0, y0, x1, y1 = o['box']
                    h = y1 - y0
                    if x1 - x0 > 1.6 * h:           # cac khoi dinh lien (vien cham nhau): cat o cho vung dac hep nhat
                        solid = ((owner[y0:y1, x0:x1] == o['ids'][0]) & (alpha[y0:y1, x0:x1] > SOLID)).sum(0)
                        cut = int(h * 0.5) + int(np.argmin(solid[int(h * 0.5):int(h * 1.5)]))
                        o = {**o, 'box': (x0, y0, x0 + cut - PAD, y1)}
                    export(folder, spec['name'](c), [o])
            else:
                rows = spec['rows'] if isinstance(spec['rows'], list) else [None] * spec['rows']
                cols = spec['cols'] if isinstance(spec['cols'], list) else [None] * spec['cols']
                found = rows_of(inside) if inside else []
                shape = [len(r) for r in found]
                assert shape == [len(cols)] * len(rows), f'{where}: can {len(rows)}x{len(cols)}, thay {shape}'
                for r, row in zip(rows, found):
                    for c, o in zip(cols, row):
                        if spec['name'](r, c):
                            export(folder, spec['name'](r, c), [o])
        left = [o['box'] for o in objs if o['ids'][0] not in used]
        assert not left, f'{sheet}: {len(left)} phan tu chua gan ten: {left}'

    with open(os.path.join(UI, 'ui.json'), 'w', encoding='utf-8') as f:
        head = {k: v for k, v in manifest.items() if k != 'assets'}
        body = ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}' for k, v in manifest['assets'].items())
        f.write(json.dumps(head, ensure_ascii=False, indent=1)[:-2] + ',\n "assets": {\n' + body + '\n }\n}\n')
    print(f'{len(manifest["assets"])} asset -> ui/ (manifest ui/ui.json)')


if __name__ == '__main__':
    main()
