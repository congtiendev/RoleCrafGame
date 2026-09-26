#!/usr/bin/env python3
"""Nhap bo sprite cac nhan vat khac (dinh dang rolecraft-hybrid-sprite-v1) cho trang xem nhan vat.

Moi bo co frames/<animation>/frame-XX.png + manifest (fps, loop). Sheet trong bo KHONG xep deu
theo kich thuoc canvas o manifest (Anh Minh, Huy) nen doc thang tung frame:
cat sat net ve, thu nho ve cung chieu cao dung, don het vao MOT atlas .webp moi nhan vat.
Ghi characters/<id>.webp + src/preview/characters.js (cung dang du lieu voi PM: sheets/rects/anims).

Bo dang SHEET (manifest co 'sheets' giong pm_sprite_manifest.json, vd Huy): giu nguyen tung sheet,
do khung o bang build_preview.slice_sheet, ghi characters/<id>/<sheet>.webp. Id sheet them tien to
'<id>_' vi anh nap duoc cache theo id sheet — de 'A' tran se trung sheet A cua PM.

    python3 import_characters.py      # doi/them bo sprite thi chay lai
"""
import glob, hashlib, json, os, re, tempfile, zipfile
from PIL import Image
from build_preview import slice_sheet, normalize_height

HERE = os.path.dirname(os.path.abspath(__file__))
ALPHA = 20
TARGET_H = 300        # chieu cao dang dung (idle) sau khi thu nho, px
PAD = 2               # khe giua cac frame trong atlas

# Bo sprite CHINH THUC cua tung nhan vat: (id, ten hien thi, nguon la thu muc hoac .zip, thu muc goc trong zip).
# De trong: cac bo trong ~/Downloads chi la ban nhap, chua duoc cung cap. Vi du mot dong:
#   ('LAN', 'Lan – BA/QA', '/duong/dan/rolecraft_qa_ba_sprite_pack', ''),
PACKS = [
    ('HUY', 'Huy – Senior Developer', os.path.join(HERE, 'HUY_Sprite_Assets_Clean.zip'), 'HUY_Sprite_Pack'),
]

# Ten nhom sheet trong bo dang SHEET (theo 'key' cua sheet trong manifest)
SHEET_LABEL = {'master': 'Cơ bản', 'hands_gestures': 'Cử chỉ', 'work_scenes': 'Công việc', 'portraits': 'Chân dung',
               'review_endings_tired': 'Review/Kết'}

# Sheet ve tay KHONG theo luoi manifest: cat luoi thi dinh 2 hinh / cut chan / sai hinh.
# Tach tung hinh theo vung lien thong (so hinh = thu tu doc: hang tren xuong, trai sang phai, chi tinh hinh lon)
# roi gan moi o manifest vao hinh TOAN THAN gan nghia nhat; nhieu o chung mot hinh thi animation dung yen
# thay vi nhay giua cac dang khac nhau. Khoa theo md5: thay sheet moi (dung luoi) la tu ve cat luoi thuong.
# HUY_A (md5 103f104b…): hang ~9 hinh, hang 6-7 chong nhau + nua nguoi -> bo. Xem docs/HUY/PROMPT_BO_SUNG_HUY.md.
BLOB_REMAP = {
    '103f104b186a2e39f7fba72e001d0770': {
        '_scale': 0.88,   # hinh A ve to hon B/C (dung ~204px vs ~179px): noi idle(A) -> lap_carry(B) khong bi co lai
        'portrait': 0, 'idle_01': 1, 'idle_02': 1, 'idle_03': 1, 'idle_04': 1, 'idle_back_01': 4,
        'greet_01': 7, 'greet_02': 8,
        **{f'walk_0{i}': 8 + i for i in range(1, 9)},
        'talk_01': 24, 'talk_02': 24, 'talk_03': 24, 'talk_04': 24, 'listen_01': 21, 'listen_02': 21,
        'nod_01': 1, 'nod_02': 1,
        'sit_01': 1, **{f'sit_0{i}': 32 for i in range(2, 9)},
        'good_01': 7, 'good_02': 7, 'good_03': 7, 'good_04': 7, 'applaud_01': 7, 'applaud_02': 7,
        'impressed_01': 25, 'relieved_01': 26,
        'defend_01': 24, 'annoyed_01': 20, 'frown_01': 20, 'doubt_01': 22, 'sigh_01': 21, 'scratch_01': 21,
        'overload_01': 22, 'worry_01': 22,
        'think_01': 21, 'think_02': 21, 'pocket_01': 1, 'crossarms_01': 20, 'crossarms_02': 20, 'lean_01': 1,
        'warn_01': 3, 'point_01': 19,
    },
}
BIG = 3000            # px: vung nho hon la icon/hieu ung, gan vao hinh lon gan nhat
NEAR = 24             # px: khoang cach toi da de gan icon vao hinh


def components(im):
    """Vung lien thong theo alpha -> (nhan tung pixel, [bbox, so px] moi vung)."""
    A = im.getchannel('A'); w, h = A.size; px = A.load()
    lab = [-1] * (w * h); regs = []
    for y in range(h):
        for x in range(w):
            if px[x, y] <= ALPHA or lab[y * w + x] >= 0:
                continue
            k = len(regs); lab[y * w + x] = k; st = [(x, y)]; x0 = x1 = x; y0 = y1 = y; n = 0
            while st:
                cx, cy = st.pop(); n += 1
                x0 = min(x0, cx); x1 = max(x1, cx); y0 = min(y0, cy); y1 = max(y1, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and lab[ny * w + nx] < 0 and px[nx, ny] > ALPHA:
                        lab[ny * w + nx] = k; st.append((nx, ny))
            regs.append([x0, y0, x1 + 1, y1 + 1, n])
    return lab, regs


def group_figures(im):
    """Vung lien thong -> hinh: moi vung lon la mot hinh, icon/hieu ung nho gan vao hinh lon gan nhat.
    Tra (nhan pixel, vung, [(so vung lon, tap vung cua hinh)]) theo thu tu doc."""
    lab, regs = components(im)
    big = sorted((k for k, r in enumerate(regs) if r[4] > BIG),
                 key=lambda k: (round((regs[k][1] + regs[k][3]) / 2 / 180), regs[k][0]))
    owner = {k: k for k in big}
    gap = lambda a, b: max(a[0] - b[2], b[0] - a[2], a[1] - b[3], b[1] - a[3], 0)
    for k, r in enumerate(regs):
        if k not in owner and big:
            d, j = min((gap(r, regs[j]), j) for j in big)
            if d <= NEAR:
                owner[k] = j
    return lab, regs, [(j, {k for k, o in owner.items() if o == j}) for j in big]


def cut_figure(im, lab, regs, main, keep):
    """Cat mot hinh theo mat na (chi pixel cua cac vung trong keep) -> (x0, y0, anh, foot).
    foot tinh tren than chinh: vet bui / hieu ung duoi chan khong keo lech diem neo."""
    w = im.width; px = im.load()
    x0 = min(regs[k][0] for k in keep); y0 = min(regs[k][1] for k in keep)
    x1 = max(regs[k][2] for k in keep); y1 = max(regs[k][3] for k in keep)
    out = Image.new('RGBA', (x1 - x0, y1 - y0)); body = Image.new('RGBA', out.size)
    op, bp = out.load(), body.load()
    for y in range(y0, y1):
        for x in range(x0, x1):
            k = lab[y * w + x]
            if k in keep:
                op[x - x0, y - y0] = px[x, y]
                if k == main:
                    bp[x - x0, y - y0] = px[x, y]
    return x0, y0, out, foot_x(body)


def blob_figures(src):
    """Anh tung hinh lon (kem icon sat ben) theo thu tu doc -> [(anh, foot)]."""
    im = Image.open(src).convert('RGBA')
    lab, regs, figs = group_figures(im)
    return [cut_figure(im, lab, regs, j, keep)[2:] for j, keep in figs]


def clean_sheet(src, rects, tmp):
    """Sheet theo luoi: moi o chi giu hinh chiem nhieu pixel nhat trong o, cat gon trong khung o.
    Xoa manh tay/chan cua hinh ben canh lan sang (lam khung rong ra, neo lech); hai hinh cham nhau
    (toc cham chan hang tren) thanh mot vung lien cung khong keo khung ra 2-3 hang. Tra (sheet sach, rects moi)."""
    im = Image.open(src).convert('RGBA'); W = im.width; px = im.load()
    lab, regs, figs = group_figures(im)
    gid = {}
    for n, (j, keep) in enumerate(figs):
        for k in keep:
            gid[k] = (n, k == j)
    out = Image.new('RGBA', im.size); op = out.load(); new = dict(rects)
    for key, (x, y, w, h, _) in rects.items():
        cnt = {}
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                g = gid.get(lab[yy * W + xx])
                if g:
                    cnt[g[0]] = cnt.get(g[0], 0) + 1
        if not cnt:
            continue
        g0 = max(cnt, key=cnt.get); body = Image.new('RGBA', (w, h)); bp = body.load()
        x0 = y0 = 10 ** 9; x1 = y1 = -1
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                g = gid.get(lab[yy * W + xx])
                if g and g[0] == g0:
                    op[xx, yy] = px[xx, yy]
                    if g[1]:
                        bp[xx - x, yy - y] = px[xx, yy]
                    x0 = min(x0, xx); y0 = min(y0, yy); x1 = max(x1, xx); y1 = max(y1, yy)
        body = body.crop((x0 - x, y0 - y, x1 + 1 - x, y1 + 1 - y))
        new[key] = [x0, y0, x1 + 1 - x0, y1 + 1 - y0, round(foot_x(body), 1)]
    path = os.path.join(tmp, 'clean_' + os.path.basename(src)); out.save(path)
    return path, new


def open_pack(src, inner, tmp):
    if src.endswith('.zip'):
        zipfile.ZipFile(src).extractall(tmp)
        return os.path.join(tmp, inner)
    return src


def read_manifest(root):
    path = next(p for p in [f'{root}/manifest.json', *glob.glob(f'{root}/manifest/*.json'),
                            *glob.glob(f'{root}/**/*manifest*.json', recursive=True)] if os.path.exists(p))
    return json.load(open(path))


def frame_dir(a):
    p = a.get('path') or a.get('pathPattern') or a['frameList'][0]['path']
    return os.path.dirname(p)


def foot_x(im):
    """Diem neo ngang = tam net ve o 15% day khung (bong/chan), giong build_preview.foot_x."""
    A = im.getchannel('A'); w, h = im.size; px = A.load()
    tot = sx = 0
    for j in range(int(h * .85), h):
        for i in range(w):
            if px[i, j] > ALPHA:
                tot += 1; sx += i
    return sx / tot if tot else w / 2


def load_char(cid, root):
    m = read_manifest(root)
    anims = []
    for name, a in m['animations'].items():
        files = sorted(glob.glob(os.path.join(root, frame_dir(a), 'frame-*.png')))
        if not files:
            print(f'  {cid}: bo qua {name} (khong co frame)'); continue
        frames = []
        for f in files:
            im = Image.open(f).convert('RGBA')
            bb = im.getchannel('A').point(lambda v: 255 if v > ALPHA else 0).getbbox()
            frames.append(im.crop(bb) if bb else im)
        anims.append({'name': name, 'fps': a.get('fps', 8), 'loop': bool(a.get('loop', True)),
                      'scenarios': a.get('scenarioIds', []), 'imgs': frames})
    idle = next((x for x in anims if x['name'] == 'idle'), anims[0])
    k = TARGET_H / sorted(im.height for im in idle['imgs'])[len(idle['imgs']) // 2]
    for x in anims:
        x['imgs'] = [im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS) for im in x['imgs']]
    return anims


def pack(cid, anims):
    """Moi animation mot hang; tra ve atlas + rects {'r,c': [x, y, w, h, foot]}."""
    W = max(sum(im.width + PAD for im in x['imgs']) for x in anims)
    H = sum(max(im.height for im in x['imgs']) + PAD for x in anims)
    atlas = Image.new('RGBA', (W, H)); rects = {}; y = 0
    for r, x in enumerate(anims, 1):
        cx = 0
        for c, im in enumerate(x['imgs'], 1):
            atlas.paste(im, (cx, y))
            rects[f'{r},{c}'] = [cx, y, im.width, im.height, round(foot_x(im), 1)]
            cx += im.width + PAD
        y += max(im.height for im in x['imgs']) + PAD
    return atlas, rects


def remap_sheet(src, cells, remap, tmp):
    """Sheet ve tay -> atlas moi chi gom cac hinh duoc dung; rects theo o manifest tro vao atlas.
    Tra ve (duong dan atlas png, cols, rows, rects)."""
    k = remap.get('_scale', 1); figs = []
    for im, foot in blob_figures(src):
        if k != 1:
            im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        figs.append((im, foot * k))
    remap = {n: i for n, i in remap.items() if not n.startswith('_')}
    ids = sorted(set(remap.values())); cols = 8; rows = -(-len(ids) // cols)
    cw = max(figs[i][0].width for i in ids) + 2 * PAD; ch = max(figs[i][0].height for i in ids) + 2 * PAD
    atlas = Image.new('RGBA', (cols * cw, rows * ch)); at = {}
    for n, i in enumerate(ids):
        (im, foot), (r, c) = figs[i], divmod(n, cols)
        x = c * cw + (cw - im.width) // 2; y = r * ch + ch - PAD - im.height     # chan cham day o
        atlas.paste(im, (x, y)); at[i] = [x, y, im.width, im.height, round(foot, 1)]
    path = os.path.join(tmp, 'remap_' + os.path.basename(src)); atlas.save(path)
    rects = {f"{c['row']},{c['col']}": at[remap[c['name']]] for c in cells if c['name'] in remap}
    miss = [c['name'] for c in cells if c['name'] not in remap]
    if miss:
        print('  canh bao: o khong co hinh gan:', miss)
    return path, cols, rows, rects


def load_sheet_pack(cid, label, root):
    """Bo dang sheet (A master, B cu chi, C cong viec, D chan dung...) -> muc nhan vat."""
    m = read_manifest(root)
    out = os.path.join(HERE, 'characters', cid); os.makedirs(out, exist_ok=True)
    sheets, rects, where, labels, bottom, files = [], {}, {}, {}, [], {}
    for s in m['sheets']:
        sid = f"{cid}_{s['id']}"
        src = next(iter(glob.glob(f"{root}/**/{s['file']}", recursive=True)))
        file = f"characters/{cid}/{s['file'][:-4]}.webp"
        remap = BLOB_REMAP.get(hashlib.md5(open(src, 'rb').read()).hexdigest())
        if remap:
            src, cols, rows, rects[sid] = remap_sheet(src, s['cells'], remap, root)
        else:
            cols, rows, rects[sid] = s['cols'], s['rows'], slice_sheet(src, s['cols'], s['rows'])
            if s['key'] != 'portraits':
                src, rects[sid] = clean_sheet(src, rects[sid], root)
        Image.open(src).save(os.path.join(HERE, file), 'WEBP', quality=88, method=6)
        sheets.append({'id': sid, 'key': s['key'], 'cols': cols, 'rows': rows, 'file': file})
        files[sid] = src
        labels[sid] = SHEET_LABEL.get(s['key'], s['key'])
        if s['key'] != 'portraits':          # sheet co nguoi dung -> neo o chan
            bottom.append(sid)
        for c in s['cells']:
            where[c['key']] = (sid, c['row'], c['col'], c['name'])
    used, anims = set(), []
    for k, a in m['animations'].items():
        used.update(a['frames'])
        anims.append({'name': k.split('/', 1)[1], 'fps': a['fps'], 'loop': a['loop'],
                      'frames': [list(where[f][:3]) for f in a['frames']]})
    normalize_height(anims, rects, files, bottom)
    cells = [{'name': n, 'key': k, 's': s, 'r': r, 'c': c} for k, (s, r, c, n) in where.items() if k not in used]
    print(f'  {cid}: {len(sheets)} sheet, {len(anims)} animation, {len(cells)} o tinh')
    return {'id': cid, 'label': label, 'sheets': sheets, 'rects': rects, 'anims': anims, 'cells': cells,
            'labels': labels, 'bottom': bottom}


def main():
    out_dir = os.path.join(HERE, 'characters'); os.makedirs(out_dir, exist_ok=True)
    chars = []
    for cid, label, src, inner in PACKS:
        if not os.path.exists(src):
            print(f'  {cid}: khong thay {src}, bo qua'); continue
        with tempfile.TemporaryDirectory() as tmp:
            root = open_pack(src, inner, tmp)
            if 'sheets' in read_manifest(root):
                chars.append(load_sheet_pack(cid, label, root)); continue
            anims = load_char(cid, root)
        atlas, rects = pack(cid, anims)
        file = f'characters/{cid}.webp'
        atlas.save(os.path.join(HERE, file), 'WEBP', quality=88, method=6)
        rows = len(anims); cols = max(len(x['imgs']) for x in anims)
        chars.append({
            'id': cid, 'label': label,
            'sheets': [{'id': cid, 'key': cid.lower(), 'cols': cols, 'rows': rows, 'file': file}],
            'rects': {cid: rects},
            'anims': [{'name': x['name'], 'fps': x['fps'], 'loop': x['loop'], 'scenarios': x['scenarios'],
                       'frames': [[cid, r, c] for c in range(1, len(x['imgs']) + 1)]}
                      for r, x in enumerate(anims, 1)],
            'cells': [],
        })
        print(f'  {cid}: {len(anims)} animation, {sum(len(x["imgs"]) for x in anims)} frame, atlas {atlas.size} '
              f'{os.path.getsize(os.path.join(HERE, file)) // 1024} KB')
    js = ('// Do import_characters.py sinh ra — doi bo sprite thi chay lai script do, dung sua tay\n'
          'export default ' + json.dumps(chars, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(os.path.join(HERE, 'src', 'preview', 'characters.js'), 'w').write(js)
    print(f'{len(chars)} nhan vat -> characters/ + src/preview/characters.js')


if __name__ == '__main__':
    main()
