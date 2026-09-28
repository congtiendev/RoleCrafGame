#!/usr/bin/env python3
"""Nhap bo sprite cac nhan vat khac (dinh dang rolecraft-hybrid-sprite-v1) cho trang xem nhan vat.

Moi bo co frames/<animation>/frame-XX.png + manifest (fps, loop). Sheet trong bo KHONG xep deu
theo kich thuoc canvas o manifest (Anh Minh, Huy) nen doc thang tung frame:
cat sat net ve, thu nho ve cung chieu cao dung, don het vao MOT atlas .webp moi nhan vat.
Ghi public/characters/<id>/*.webp + src/generated/characters.ts (cung dang du lieu voi PM: sheets/rects/anims).

Bo dang SHEET (manifest co 'sheets' giong pm_sprite_manifest.json, vd Huy): giu nguyen tung sheet,
do khung o bang build_preview.slice_sheet, ghi characters/<id>/<sheet>.webp. Id sheet them tien to
'<id>_' vi anh nap duoc cache theo id sheet — de 'A' tran se trung sheet A cua PM.

NPC co trong GAME_NPC con duoc ghi atlas cho trang game (public/characters/<id>/game.webp + src/generated/npcAtlas.ts):
dong tac dung trong canh + chan dung hop thoai, cham neo da xoa; LevelScreen ve thay the nhan vat tam.

    python3 tools/import_characters.py # doi/them bo sprite thi chay lai
"""
import glob, hashlib, json, math, os, re, tempfile, zipfile
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from build_preview import slice_sheet, normalize_height, clean_markers

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # goc repo
PUB = os.path.join(ROOT, 'public')                                   # anh luc chay: public/characters/
ALPHA = 20
TARGET_H = 300        # chieu cao dang dung (idle) sau khi thu nho, px
PAD = 2               # khe giua cac frame trong atlas

# Bo sprite CHINH THUC cua tung nhan vat: (id, ten hien thi, nguon la thu muc hoac .zip, thu muc goc trong zip).
# De trong: cac bo trong ~/Downloads chi la ban nhap, chua duoc cung cap. Vi du mot dong:
#   ('LAN', 'Lan – BA/QA', '/duong/dan/rolecraft_qa_ba_sprite_pack', ''),
def find_zip(name):
    """Zip bo sprite: o thu muc du an, khong co thi tim trong ~/Downloads."""
    return next((p for p in (os.path.join(ROOT, name), os.path.join(os.path.expanduser('~'), 'Downloads', name)) if os.path.exists(p)),
                os.path.join(ROOT, name))


PACKS = [
    ('HUY', 'Huy – Senior Developer', find_zip('rolecraft_huy_sprites_transparent (1).zip'), 'rolecraft_huy_sprites'),
    ('MINH', 'Anh Minh – Trưởng phòng / PM Lead', find_zip('rolecraft_minh_sprites_transparent (1).zip'), 'rolecraft_minh_sprites'),
    ('LAN', 'Lan – BA / QA', find_zip('rolecraft_lan_sprites.zip'), 'rolecraft_lan_sprites'),
    ('HIEP', 'Anh Hiệp – Khách hàng / PO', find_zip('rolecraft_hiep_sprites.zip'), 'rolecraft_hiep_sprites'),
    ('LINH', 'Chị Linh – Sales Executive', find_zip('rolecraft_linh_sprites.zip'), 'rolecraft_linh_sprites'),
    ('HA', 'Chị Hà – HR', find_zip('rolecraft_ha_sprites.zip'), 'rolecraft_ha_sprites'),
    ('NAM', 'Nam – Frontend Developer', find_zip('rolecraft_nam_sprites.zip'), 'rolecraft_nam_sprites'),
]

# Ten nhom sheet trong bo dang SHEET (theo 'key' cua sheet trong manifest)
SHEET_LABEL = {'master': 'Cơ bản', 'hands_gestures': 'Cử chỉ', 'work_scenes': 'Công việc', 'portraits': 'Chân dung',
               'review_endings_tired': 'Review/Kết', 'crisis_growth_endings': 'Sự cố/Kết', 'props': 'Đồ vật',
               'scenes_review': 'Cảnh/Review', 'ownership_tired': 'Ownership/Kiệt sức',
               'tired': 'Kiệt sức', 'meetings': 'Họp', 'review': 'Final Review'}

# Sheet ve tay KHONG theo luoi manifest: cat luoi thi dinh 2 hinh / cut chan / sai hinh.
# Tach tung hinh theo vung lien thong (so hinh = thu tu doc: hang tren xuong, trai sang phai, chi tinh hinh lon)
# roi gan moi o manifest vao hinh TOAN THAN gan nghia nhat; nhieu o chung mot hinh thi animation dung yen
# thay vi nhay giua cac dang khac nhau. Khoa theo md5: thay sheet moi (dung luoi) la tu ve cat luoi thuong.
# Them mot muc {md5 sheet: {ten o: so hinh, '_scale': k}} khi co sheet ve lech luoi (bo Huy cu da thay bang bo dung luoi).
BLOB_REMAP = {}

# Sheet giao loi: manifest khai so hang khac hinh ve that. Khoa theo md5 – sheet ve lai (dung manifest) tu cat binh thuong.
# rows = so hang ve that; row_of = {hang manifest: hang ve}, hang manifest khong co trong row_of = khong co hinh (bo,
# kem animation dung o do); blank_below = xoa net ve tu y nay tro xuong (cham neo roi xuong hang trong).
# HIEP_C (md5 36c8198e…): manifest 8x8 nhung chi ve 7 hang – hang 7 (propose, guarantee, think, relieved) khong co hinh,
# hang ve thu 7 la hang 8 manifest (delighted … shake); neo "bo sung co hoc" roi xuong day y 1215–1226.
SHEET_FIX = {
    '36c8198e3ebc55c75fdc8954462cd518': {'rows': 7, 'row_of': {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 8: 7}, 'blank_below': 1200},
    # NAM_B (md5 f79e66c2…): manifest 8x7 nhung chi ve 6 hang – hang 7 (oneone_*: noi chuyen 1-1) khong co hinh;
    # mot cham neo lac o day y 1168–1183.
    'f79e66c2a12a31ea51fc631641de0ad5': {'rows': 6, 'row_of': {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6}, 'blank_below': 1140},
}

# NPC trong trang game: dong tac dung trong canh (theo ten animation trong manifest) – them dong tac thi them ten o day.
# talk = dang noi, listen = nghe PM noi, idle = con lai; dong thoai co the chon dong tac/chan dung rieng (src/content/levels/index.ts: npc, npcFace)
# 'ten=nguon1+nguon2': dong tac `ten` lay khung cua cac animation nguon (noi tiep), fps/loop theo `ten` neu manifest co.
# Minh, Hiep: sheet cu chi (talk, listen, emph, stern...) ve nguoi thap hon dang dung (than + chan ngan, dau giu co) ->
# trong canh nhan vat "lun" moi khi doi dong tac. Thay bang dong tac ve dung ti le (cao >= 0.95 dang dung).
GAME_NPC = {
    'HUY': ['idle', 'talk', 'listen', 'nod', 'agree', 'explain', 'think', 'crossarms', 'defend',
            'frown', 'annoyed', 'doubt', 'good', 'sigh', 'point', 'warn', 'greet'],
    'MINH': ['idle', 'talk=two_projects+invite_sit', 'listen=wait', 'nod=reassure', 'greet', 'serious=adjust',
             'emph=count', 'point=present', 'concern=wait', 'warn=count', 'frown=adjust', 'doubt=adjust',
             'disappoint=bow', 'sigh=bow', 'encourage=invite_sit', 'satisfied=reassure', 'reassure', 'good=pat',
             'think=adjust', 'crossarms=wait'],
    'LAN': ['idle', 'talk', 'listen', 'nod', 'greet', 'firm', 'caution', 'object', 'propose', 'worry', 'doubt', 'uneasy',
            'sigh', 'good', 'relieved', 'think', 'point', 'crossarms'],
    # Hiep: dong tac hop (sheet C) la dang ngoi khong ghe, dong tac bieu cam o sheet A ve thap -> chi con dang dung
    # dung ti le: idle (cam dien thoai), greet, bow, shake
    'HIEP': ['idle', 'talk=shake', 'listen=idle', 'nod=bow', 'greet', 'pleased=greet', 'stern=idle', 'bow'],
    # Linh, Ha, Nam: chua co thoai o Level 1 – san sang cho cac level sau (dang dung o sheet A)
    'LINH': ['idle', 'talk', 'listen', 'nod', 'greet', 'agree', 'persuade', 'shrug', 'sheepish', 'cheer', 'shock',
             'offended', 'angry', 'relieved', 'wink'],
    'HA': ['idle', 'talk', 'listen', 'nod', 'greet', 'pleased', 'encourage', 'sympathetic', 'comfort', 'sigh', 'bow'],
    'NAM': ['idle', 'talk', 'listen', 'nod', 'greet', 'good', 'try', 'eager', 'happy', 'proud', 'thankful', 'worry',
            'hesitant', 'confused', 'uneasy', 'sigh', 'apologize', 'resolve'],
}
FACE_PX = 192         # canh dai chan dung trong atlas game (hop thoai 96px CSS x dpr 2)
NPC_GAME = {}         # id -> meta atlas game, load_sheet_pack dien, main ghi ra npcAtlas.ts
# Khu nen trang con sot (defringe) cho sheet tach nen kieu cat cung (alpha chi 0/255)
FRINGE_BAND = 2       # px sat vung trong suot + sat net vien toi: diem xam/trang o day la net vien hoa voi nen trang
HOLE_MIN = 15         # vung trang kin tu chung nay px ...
FRINGE_MIN = 1.0      # % diem sang o mep: duoi nguong = sheet da sach (tach nen mem dung cach) -> khong dong vao
HOLE_LOW = 0.6        # ... nam tu 60% chieu cao dang nguoi tro xuong (khe giua chan, gam ghe) -> trong suot
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


def defringe(src, tmp):
    """Khu nen trang con bam vao nhan vat (bo ve tren nen trang roi tach nen) – CHI viền trang bam nguoi + khe kin giua chan;
    bong duoi chan, ao so mi trang, coc / giay trang, mat giu nguyen.
    1) vien: diem trung tinh trong FRINGE_BAND px sat vung trong suot VA sat net vien toi, o phia NGOAI net vien (net vien
       hoa voi nen trang khi ve; ruot trang ben trong net vien nhu lan khoi / ao so mi khong dong) -> tach mau trang ra (color-to-alpha): alpha *= 1 - min(RGB)/255, mau = phan con lai sau khi bo
       trang. Mep bong khong sat net toi nen khong bi dong. Ap dung moi sheet (cat cung lan tach mem).
    2) sheet tach nen cat cung (alpha chi 0/255): vung trang kin (nen trang tinh, trung tinh) tu HOLE_MIN px nam o phan
       duoi dang nguoi (>= HOLE_LOW chieu cao: khe giua chan, gam ghe) -> trong suot. Ao so mi / mat nam phan tren.
    Tra ve duong dan anh da xu ly."""
    a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
    rgb, A = a[..., :3], a[..., 3]
    lo, spread = rgb.min(-1), rgb.max(-1) - rgb.min(-1)
    edge = ndi.binary_dilation(A < 10, iterations=2) & (A >= 10)
    if (edge & (lo >= 190) & (spread < 40) & (A >= 60)).sum() * 100 < FRINGE_MIN * edge.sum():
        return src                                                   # sheet da sach, giu nguyen
    if ((A > 0) & (A < 250)).sum() <= 0.002 * (A > 0).sum():          # cat cung
        blobs, _ = ndi.label(A > 0)
        boxes = ndi.find_objects(blobs)
        lab, n = ndi.label((A >= 250) & (lo >= 240))
        for k, sl in enumerate(ndi.find_objects(lab), 1):
            m = lab[sl] == k
            if m.sum() < HOLE_MIN: continue
            c = rgb[sl][m].mean(0)
            if c.min() < 248 or c.max() - c.min() > 1.5: continue      # ngả mau: coc, giay, man hinh -> giu
            ys, xs = np.nonzero(m)
            by = boxes[blobs[sl][m][0] - 1][0]                           # khung doc cua dang nguoi chua vung nay
            rel = (sl[0].start + ys.mean() - by.start) / max(1, by.stop - by.start)
            if rel >= HOLE_LOW:
                A[sl][m] = 0
    clear = A < 8
    dark = (rgb.max(-1) < 110) & (A >= 128)
    ring = ndi.binary_dilation(clear, iterations=FRINGE_BAND) & ~clear & (spread < 40)
    ring &= ndi.binary_dilation(dark, iterations=FRINGE_BAND)
    # chi phia NGOAI net vien: vung khong toi thong thang ra nen trong suot. Ruot trang ben trong net vien (lan khoi,
    # ao so mi, long trang mat) bi net vien ngan lai -> giu nguyen
    open_, _ = ndi.label(~dark & ~clear)
    outside = np.unique(open_[ndi.binary_dilation(clear) & (open_ > 0)])
    ring &= np.isin(open_, outside) | dark
    k = np.clip(1 - lo[ring] / 255, 0, 1)
    rgb[ring] = np.clip((rgb[ring] - 255 * (1 - k)[:, None]) / np.maximum(k, 1e-3)[:, None], 0, 255)
    A[ring] *= k
    out = os.path.join(tmp, 'defringe_' + os.path.basename(src))
    Image.fromarray(np.dstack([rgb, A]).round().astype(np.uint8), 'RGBA').save(out)
    return out


def save_webp(im, file, **opt):
    """Ghi anh WebP (duong dan tuong doi public/) qua file tam roi doi ten: trang dang mo khong doc phai anh ghi do."""
    path = os.path.join(PUB, file)
    im.save(path + '.tmp', 'WEBP', **opt)
    os.replace(path + '.tmp', path)


def version(file):
    """Ma phien ban anh (8 ky tu md5): trang nap `file?v=...` -> doi bo sprite la trinh duyet tai anh moi, khong dung cache cu."""
    return hashlib.md5(open(os.path.join(PUB, file), 'rb').read()).hexdigest()[:8]


def npc_game_atlas(cid, anims, rects, files, faces):
    """Atlas trang game cho NPC: moi animation mot hang, khung fw x fh, goc (ox, oy) = giua day chan – cung dang
    src/generated/atlas.ts cua PM; ben duoi la luoi chan dung (canh dai FACE_PX). Cham neo (magenta/cyan/xanh la) da xoa.
    Ghi characters/<id>/game.webp, tra ve meta."""
    img = {}
    def crop(s, r, c):
        if s not in img: img[s] = Image.open(files[s]).convert('RGBA')
        x, y, w, h, foot = rects[s][f'{r},{c}']
        return img[s].crop((x, y, x + w, y + h)), foot
    by = {a['name']: a for a in anims}
    stand = rects[by['idle']['frames'][0][0]]['{1},{2}'.format(*by['idle']['frames'][0])][3]
    rows = []
    for spec in GAME_NPC[cid]:
        n, _, src = spec.partition('=')
        srcs = src.split('+') if src else [n]
        a = by.get(n) or by[srcs[0]]                        # fps / loop
        frames = []
        for sa in (by[x] for x in srcs):
            k = sa.get('k', 1)
            for s, r, c in sa['frames']:
                im, foot = crop(s, r, c)
                im = clean_markers(im)
                if k != 1:
                    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS); foot *= k
                frames.append((im, foot))
        L = math.ceil(max(f for _, f in frames)) + 1
        fw = L + math.ceil(max(im.width - f for im, f in frames)) + 1
        fh = max(im.height for im, _ in frames)
        strip = Image.new('RGBA', (fw * len(frames), fh))
        for i, (im, f) in enumerate(frames):
            strip.alpha_composite(im, (round(i * fw + L - f), fh - im.height))     # chan cham day khung
        rows.append((n, {**a, 'frames': frames}, strip, fw, fh, L))
    face_ims = []
    for name, (s, r, c) in faces:
        im = crop(s, r, c)[0]
        k = FACE_PX / max(im.size)
        face_ims.append((name, im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)))
    cols = 10
    W = max(max(st.width for _, _, st, *_ in rows), cols * FACE_PX)
    H = sum(fh for *_, fh, _ in rows) + -(-len(face_ims) // cols) * FACE_PX
    atlas = Image.new('RGBA', (W, H))
    meta = {'file': f'characters/{cid}/game.webp', 'stand': stand, 'anims': {}, 'faces': {}}
    y = 0
    for n, a, st, fw, fh, L in rows:
        atlas.alpha_composite(st, (0, y))
        meta['anims'][n] = {'y': y, 'fw': fw, 'fh': fh, 'ox': L, 'oy': fh, 'n': len(a['frames']), 'fps': a['fps'], 'loop': a['loop']}
        y += fh
    for i, (name, im) in enumerate(face_ims):
        r, c = divmod(i, cols)
        atlas.alpha_composite(im, (c * FACE_PX, y + r * FACE_PX))
        meta['faces'][name] = [c * FACE_PX, y + r * FACE_PX, im.width, im.height]
    # khung ve tren canvas NPC (LevelScreen): nua be ngang lon nhat quanh goc chan + chieu cao lon nhat, theo stand
    meta['half'] = round(max(max(L, fw - L) for _, _, _, fw, _, L in rows) / stand, 3)
    meta['tall'] = round(max(fh for *_, fh, _ in rows) / stand, 3)
    save_webp(atlas, meta['file'], quality=92, alpha_quality=100, method=6)   # lossless ~1.7 MB, lossy ~0.4 MB
    meta['v'] = version(meta['file'])
    print(f'  {cid}: atlas game {len(rows)} dong tac + {len(face_ims)} chan dung, {atlas.size} '
          f'{os.path.getsize(os.path.join(PUB, meta["file"])) // 1024} KB')
    return meta


def load_sheet_pack(cid, label, root):
    """Bo dang sheet (A master, B cu chi, C cong viec, D chan dung...) -> muc nhan vat."""
    m = read_manifest(root)
    # Bo cu: ghi de tung anh (save_webp: file tam roi doi ten – trang dang mo khong bao gio thay thu muc rong / anh ghi do),
    # xong moi xoa anh cu khong con dung (doi bo sprite it sheet hon, doi ten sheet) – xem cuoi ham
    out = os.path.join(PUB, 'characters', cid)
    os.makedirs(out, exist_ok=True)
    before = set(os.listdir(out))
    sheets, rects, where, labels, bottom, files = [], {}, {}, {}, [], {}
    for s in m['sheets']:
        sid = f"{cid}_{s['id']}"
        src = next(iter(glob.glob(f"{root}/**/{s['file']}", recursive=True)))
        file = f"characters/{cid}/{s['file'][:-4]}.webp"
        digest = hashlib.md5(open(src, 'rb').read()).hexdigest()
        remap, fix = BLOB_REMAP.get(digest), SHEET_FIX.get(digest)
        src = defringe(src, root)
        if remap:
            src, cols, rows, rects[sid] = remap_sheet(src, s['cells'], remap, root)
        elif fix:
            im = Image.open(src).convert('RGBA'); im.paste((0, 0, 0, 0), (0, fix['blank_below'], im.width, im.height))
            src = os.path.join(root, 'fix_' + os.path.basename(src)); im.save(src)
            drawn = slice_sheet(src, s['cols'], fix['rows'])
            cols, rows = s['cols'], fix['rows']
            rects[sid] = {f'{mr},{c}': drawn[f'{dr},{c}'] for mr, dr in fix['row_of'].items() for c in range(1, cols + 1)}
            print(f"  {cid}: {s['file']} ve {fix['rows']} hang thay vi {s['rows']} – bo hang manifest "
                  f"{sorted(set(range(1, s['rows'] + 1)) - set(fix['row_of']))}")
            if s['key'] != 'portraits':
                src, rects[sid] = clean_sheet(src, rects[sid], root)
        else:
            cols, rows, rects[sid] = s['cols'], s['rows'], slice_sheet(src, s['cols'], s['rows'])
            if s['key'] != 'portraits':
                src, rects[sid] = clean_sheet(src, rects[sid], root)
        save_webp(Image.open(src), file, quality=88, method=6)
        sheets.append({'id': sid, 'key': s['key'], 'cols': cols, 'rows': rows, 'file': file, 'v': version(file)})
        files[sid] = src
        labels[sid] = SHEET_LABEL.get(s['key'], s['key'])
        if s['key'] != 'portraits':          # sheet co nguoi dung -> neo o chan
            bottom.append(sid)
        for c in s['cells']:
            if f"{c['row']},{c['col']}" in rects[sid]:                   # o khong co hinh (SHEET_FIX) -> bo
                where[c['key']] = (sid, c['row'], c['col'], c['name'])
    used, anims = set(), []
    for k, a in m['animations'].items():
        if any(f not in where for f in a['frames']):
            print(f'  {cid}: bo animation {k} (thieu hinh)'); continue
        used.update(a['frames'])
        anims.append({'name': k.split('/', 1)[1], 'fps': a['fps'], 'loop': a['loop'],
                      'frames': [list(where[f][:3]) for f in a['frames']]})
    normalize_height(anims, rects, files, bottom)
    cells = [{'name': n, 'key': k, 's': s, 'r': r, 'c': c} for k, (s, r, c, n) in where.items() if k not in used]
    if cid in GAME_NPC:
        port = {sh['id'] for sh in sheets if sh['key'] == 'portraits'}
        faces = [(n, (s, r, c)) for k, (s, r, c, n) in where.items() if s in port]
        NPC_GAME[cid] = npc_game_atlas(cid, anims, rects, files, faces)
    keep = {os.path.basename(sh['file']) for sh in sheets} | ({'game.webp'} if cid in NPC_GAME else set())
    for f in sorted(before - keep):
        os.remove(os.path.join(out, f)); print(f'  {cid}: xoa anh cu {f}')
    print(f'  {cid}: {len(sheets)} sheet, {len(anims)} animation, {len(cells)} o tinh')
    return {'id': cid, 'label': label, 'sheets': sheets, 'rects': rects, 'anims': anims, 'cells': cells,
            'labels': labels, 'bottom': bottom}


def main():
    out_dir = os.path.join(PUB, 'characters'); os.makedirs(out_dir, exist_ok=True)
    chars = []
    for cid, label, src, inner in PACKS:
        if not os.path.exists(src):                  # dung han: ghi tiep se xoa nhan vat nay khoi characters.ts / npcAtlas.ts
            raise SystemExit(f'  {cid}: khong thay {src} (ca trong ~/Downloads) – dat lai zip roi chay lai')
        with tempfile.TemporaryDirectory() as tmp:
            root = open_pack(src, inner, tmp)
            if 'sheets' in read_manifest(root):
                chars.append(load_sheet_pack(cid, label, root)); continue
            anims = load_char(cid, root)
        atlas, rects = pack(cid, anims)
        file = f'characters/{cid}.webp'
        atlas.save(os.path.join(PUB, file), 'WEBP', quality=88, method=6)
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
              f'{os.path.getsize(os.path.join(PUB, file)) // 1024} KB')
    js = ('// Do import_characters.py sinh ra — doi bo sprite thi chay lai script do, dung sua tay\n'
          "import type { CharacterSet } from '../lib/spriteTypes.ts';\n\n"
          'const CHARACTERS: CharacterSet[] = ' + json.dumps(chars, ensure_ascii=False, separators=(',', ':')) + ';\nexport default CHARACTERS;\n')
    open(os.path.join(ROOT, 'src', 'generated', 'characters.ts'), 'w', encoding='utf-8', newline='\n').write(js)
    js = ('// Do import_characters.py sinh ra (GAME_NPC) — atlas NPC cho trang game, dung sua tay\n'
          '// moi NPC: file, stand (cao dang dung chuan, px), anims {ten: hang y, khung fw x fh, goc chan ox,oy, n, fps, loop},\n'
          '// faces {ten: [x, y, w, h]}, half/tall = nua be ngang / chieu cao lon nhat theo stand\n'
          "import type { NpcAtlas } from '../lib/spriteTypes.ts';\n\n"
          'const NPC_ATLAS: Record<string, NpcAtlas> = ' + json.dumps(NPC_GAME, separators=(',', ':')) + ';\nexport default NPC_ATLAS;\n')
    open(os.path.join(ROOT, 'src', 'generated', 'npcAtlas.ts'), 'w', encoding='utf-8', newline='\n').write(js)
    print(f'{len(chars)} nhan vat -> public/characters/ + src/generated/characters.ts; {len(NPC_GAME)} NPC game -> src/generated/npcAtlas.ts')


if __name__ == '__main__':
    main()
