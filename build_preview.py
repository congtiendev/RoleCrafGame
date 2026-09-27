#!/usr/bin/env python3
"""Sinh src/shared/data.js cho trang xem thu: khung tung o, danh sach animation, kich ban.

Sheet khong dat sprite deu tren luoi — vd sheet P hang 1 nam o y 288-427 trong
khi luoi deu cat ngang y=314 — nen cong thuc chia deu trong HUONG_DAN_KICH_BAN.md
chem doi sprite. O day do khe trong suot giua cac hang/cot de lay khung that.

Kich ban doc thang tu bang trong HUONG_DAN_KICH_BAN.md (muc 2-7).

    python3 build_preview.py      # sua manifest hoac kich ban xong thi chay lai
"""
import json, math, os, re
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ALPHA = 20                      # alpha > nguong nay moi tinh la co net ve


# ---------- do khung o ----------
def segments(prof):
    segs, st = [], None
    for i, c in enumerate(prof + [0]):
        if c > 0 and st is None:
            st = i
        if c == 0 and st is not None:
            segs.append([st, i]); st = None
    return segs


def fit(prof, n):
    """Tach profile thanh dung n doan co net ve."""
    segs = [s for s in segments(prof) if sum(prof[s[0]:s[1]]) > 30] or segments(prof)
    while len(segs) > n:        # du doan (hieu ung roi rac): gop doan nho nhat vao doan ke gan nhat
        k = min(range(len(segs)), key=lambda i: segs[i][1] - segs[i][0])
        if k == 0:
            j = 1
        elif k == len(segs) - 1:
            j = k - 1
        else:
            j = k - 1 if segs[k][0] - segs[k-1][1] < segs[k+1][0] - segs[k][1] else k + 1
        a, b = sorted((k, j)); segs[a] = [segs[a][0], segs[b][1]]; del segs[b]
    while len(segs) < n:        # hai sprite cham nhau: cat doan rong nhat o cho it net nhat quanh giua
        k = max(range(len(segs)), key=lambda i: segs[i][1] - segs[i][0])
        a, b = segs[k]; L = b - a
        cut = min(range(a + L // 4, b - L // 4), key=lambda y: (prof[y], abs(y - (a + b) / 2)))
        segs[k:k+1] = [[a, cut], [cut + 1, b]]
    return segs


def bounds(segs, total):
    """Bien o nam giua khe hai doan ke nhau."""
    out = []
    for i, (a, b) in enumerate(segs):
        x0 = 0 if i == 0 else (segs[i-1][1] + a) // 2
        x1 = total if i == len(segs) - 1 else (b + segs[i+1][0]) // 2
        out.append((x0, x1))
    return out


def slice_sheet(path, C, R):
    A = Image.open(path).getchannel('A'); W, H = A.size; px = A.load()
    rowp = [sum(1 for x in range(0, W, 2) if px[x, y] > ALPHA) for y in range(H)]
    mask = A.point(lambda v: 255 if v > ALPHA else 0)
    rects = {}
    for r, (y0, y1) in enumerate(bounds(fit(rowp, R), H), 1):
        colp = [sum(1 for y in range(y0, y1, 2) if px[x, y] > ALPHA) for x in range(W)]
        for c, (x0, x1) in enumerate(bounds(fit(colp, C), W), 1):
            # cat sat net ve trong o, giong sprite roi cua game: khung trong suot
            # thua thi neo day se lech, nhan vat lo lung
            bb = mask.crop((x0, y0, x1, y1)).getbbox() or (0, 0, x1 - x0, y1 - y0)
            x, y, w, h = x0 + bb[0], y0 + bb[1], bb[2] - bb[0], bb[3] - bb[1]
            rects[f'{r},{c}'] = [x, y, w, h, foot_x(px, x, y, w, h)]
    return rects


def foot_x(px, x, y, w, h):
    """Diem neo ngang = tam dai bong duoi chan (15% day khung), tinh tu mep trai.

    Can giua theo khung cat sat thi gio tay cam tablet ra la ca nguoi bi day
    lech sang ben kia toi 16px — doi khung nhin nhu giat. Bong duoi chan khong
    doi vi tri giua cac khung nen neo vao do than nguoi dung yen.
    """
    tot = sx = 0
    for j in range(y + int(h * .85), y + h):
        for i in range(x, x + w):
            if px[i, j] > ALPHA:
                tot += 1; sx += i - x
    return round(sx / tot, 1) if tot else w / 2


def feet_bottom(px, x, y, w, h):
    """Hang thap nhat co pixel toi (giay/quan), tinh tu dinh khung. Bong duoi chan
    la xam sang nen khong bi tinh."""
    for j in range(y + h - 1, y, -1):
        if sum(1 for i in range(x, x + w) if px[i, j][3] > 200 and sum(px[i, j][:3]) < 330) >= 3:
            return j - y + 1
    return h


def normalize_height(anims, rects, files, body='ABCE'):
    """He so thu nho cho animation ve TO hon dang dung chuan (idle).

    Hoa si ve moi o mot co hoi khac: shake cao 183px, phone_read 184px trong khi
    idle/walk/stop chi ~171px. Noi walk -> shake la nhan vat phong to dot ngot.
    Chi thu nho cai cao hon chuan; ngoi/cui/nam von thap hon thi de nguyen.
    """
    pix = {}
    def fb(s, r, c):
        if s not in pix:
            pix[s] = Image.open(files[s]).convert('RGBA').load()
        x, y, w, h = rects[s][f'{r},{c}'][:4]
        return feet_bottom(pix[s], x, y, w, h)
    def med(a):
        v = sorted(fb(*f) for f in a['frames'] if f[0] in body)
        return v[len(v) // 2] if v else 0
    ref = med(next(a for a in anims if a['name'] == 'idle'))
    for a in anims:
        h = med(a)
        if h > ref * 1.02:
            a['k'] = round(max(.85, ref / h), 3)


# ---------- doc kich ban ----------
TOK = re.compile(r'`([a-z_0-9]+)`(?:\s*—\s*([A-FOP]) r(\d+) c(\d+)(?:–\d+)?)?'
                 r'|\b([A-FOP]) r(\d+) c(\d+)(?:–\d+)?')
ALT = re.compile(r'(/|hoặc|nếu hụt)\s*$')


def parse_cell(text, anims, names, name_of):
    """-> beats [{anim, alt?, face?, emo?}], scene [[sheet,r,c,ten]]"""
    beats, scene, pend, prev = [], [], {}, 0
    for mt in TOK.finditer(text):
        sep = text[prev:mt.start()]; prev = mt.end()
        nm = mt.group(1)
        s, r, c = (mt.group(2), mt.group(3), mt.group(4)) if nm else mt.group(5, 6, 7)
        if nm in anims and (s is None or s in 'ABCE'):
            b = {'anim': nm}
            if beats and ALT.search(sep.strip()):
                b['alt'] = True
            b.update(pend); pend = {}
            beats.append(b)
            continue
        ref = [s, int(r), int(c)] if s else names.get(nm)
        if not ref:
            continue
        ref = ref + [nm or name_of.get(tuple(ref), '')]
        if ref[0] in 'DF':      # chan dung / emote gan vao nhip dang phat
            key = 'face' if ref[0] == 'D' else 'emo'
            (beats[-1] if beats else pend)[key] = ref
        elif ref[0] in 'OP' and ref not in scene:
            scene.append(ref)
    if pend and beats:
        beats[-1].update(pend)
    return beats, scene


def parse_script(md, anims, names, name_of):
    levels = []
    for sec in re.split(r'\n## ', md)[1:]:
        title = sec.split('\n', 1)[0].strip()
        if not 2 <= int(title.split('.')[0]) <= 7:
            continue
        lines = sec.splitlines()[1:]
        rows = [l for l in lines if l.startswith('|')]
        head = [h.strip() for h in rows[0].strip('|').split('|')]
        note = ' '.join(l for l in lines if l.strip() and not l.startswith('|')).strip()
        sits = []
        for l in rows[2:]:
            cells = [x.strip() for x in l.strip('|').split('|')]
            cols = []
            for h, t in zip(head[1:], cells[1:]):
                if t in ('—', ''):
                    continue
                b, sc = parse_cell(t, anims, names, name_of)
                cols.append({'label': h, 'text': t.replace('`', ''), 'beats': b, 'scene': sc})
            sits.append({'name': cells[0].replace('`', ''), 'cols': cols})
        levels.append({'title': title.split('. ', 1)[1], 'note': note, 'sits': sits})
    return levels


LEVEL_KEYS = ['L1', 'L2', 'L3', 'L4', 'END', 'FLAG']   # theo thu tu muc 2-7 trong file huong dan


def attach_lines(script, path):
    """Gan thoai tu THOAI_MAU.json vao tung canh: khoa 'L1 | S01 Tiep quan | Nhanh A'.

    Khoa '... | Cau hoi' = {hoi, A, B, C}: cau hoi quyet dinh + ten lua chon, gan vao tinh huong.
    """
    if not os.path.exists(path):
        return
    lines = {k: v for k, v in json.load(open(path)).items() if not k.startswith('_')}
    seen = set()
    for lk, L in zip(LEVEL_KEYS, script):
        for s in L['sits']:
            k = f"{lk} | {s['name']} | Câu hỏi"
            if k in lines:
                s['ask'] = lines[k]; seen.add(k)
            for c in s['cols']:
                k = f"{lk} | {s['name']} | {c['label']}"
                if k in lines:
                    c['lines'] = lines[k]; seen.add(k)
    for k in lines.keys() - seen:
        print('  canh bao: khoa thoai khong khop canh nao:', k)


def clean_markers(im, drop_bare=False):
    """Xoa cham neo magenta/cyan/xanh la (diem cam, diem ngoi, man hinh): moi diem trong cham (no rong 2px de an ca vien mo)
    lay mau diem anh duc GAN NHAT ben ngoai – lan dan tu mep vao (nhu inpaint cua docs/PM/.../tools/extract_anchors.py),
    khong lay mau trung binh (de lai vet xam / xanh ngoc). drop_bare: cham nam tren nen trong suot (chan do vat) thi xoa han."""
    px = im.load(); w, h = im.size
    # loi cham: mau thuan; vien khu rang: ngả magenta / xanh ngoc sang (tablet teal toi hon nen khong bi bat)
    def mk(p):
        r, g, b, a = p
        return a > 0 and ((r > 100 and b > 100 and g < 0.75 * min(r, b)) or
                          (r < 120 and g > 170 and b > 170 and g - r > 70) or (r < 90 and g > 200 and b < 90))
    seen, area = set(), set()
    for j0 in range(h):
        for i0 in range(w):
            if (i0, j0) in seen or not mk(px[i0, j0]): continue
            comp, stack = [], [(i0, j0)]; seen.add((i0, j0))      # vung lien thong cua mot cham
            while stack:
                a, b = stack.pop(); comp.append((a, b))
                for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    q = (a + da, b + db)
                    if 0 <= q[0] < w and 0 <= q[1] < h and q not in seen and mk(px[q]):
                        seen.add(q); stack.append(q)
            if len(comp) < 4 or max(px[q][3] for q in comp) < 230: continue   # vien mo o mep nhan vat, khong phai cham
            blob = {(a + da, b + db) for a, b in comp for da in range(-2, 3) for db in range(-2, 3)
                    if 0 <= a + da < w and 0 <= b + db < h and px[a + da, b + db][3] > 0}
            ring = [q for q in blob if any((q[0] + da, q[1] + db) not in blob and 0 <= q[0] + da < w and 0 <= q[1] + db < h
                                         and px[q[0] + da, q[1] + db][3] > 200 for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
            if not ring and drop_bare:
                for q in blob: px[q] = (0, 0, 0, 0)
                continue
            area |= blob
    # lan mau tu ngoai vao: moi vong lay mau cua lang gieng da co mau (ngoai vung cham hoac da lap o vong truoc)
    todo = set(area)
    while todo:
        done = {}
        for q in todo:
            for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                n = (q[0] + da, q[1] + db)
                if 0 <= n[0] < w and 0 <= n[1] < h and n not in todo and px[n][3] > 200:
                    done[q] = px[n][:3] + (px[q][3],); break
        if not done: break                                          # cham tach roi, khong co lang gieng duc
        for q, c in done.items(): px[q] = c
        todo -= done.keys()
    return im


def start_sprite(anims, rects, files, out):
    """Dai 4 khung idle cho man Start (src/game): xoa cham neo, can chan cung day + cung tam bong.
    Lossless, khong giam do net."""
    idle = next(a for a in anims if a['name'] == 'idle')
    src = {}
    fr = []
    for s, r, c in idle['frames']:
        if s not in src:
            src[s] = Image.open(files[s]).convert('RGBA')
        x, y, w, h, foot = rects[s][f'{r},{c}']
        fr.append((clean_markers(src[s].crop((x, y, x + w, y + h))), foot))
    half = max(max(f, im.width - f) for im, f in fr)
    fw, fh = int(2 * half) + 2, max(im.height for im, _ in fr)
    strip = Image.new('RGBA', (fw * len(fr), fh))
    for n, (im, f) in enumerate(fr):
        strip.paste(im, (n * fw + round(fw / 2 - f), fh - im.height))
    strip.save(out, 'WEBP', lossless=True, exact=True)
    return len(fr), fw, fh


# Animation PM va do vat dung trong trang game (src/game). Them tinh huong moi can dong tac khac thi them ten vao day.
# Khong dung think/confident (sheet B hang 7 chi ve nua nguoi); ngoi (night_*) da ve san ghe + mep ban.
GAME_ANIMS = ['idle', 'walk', 'greet', 'talk', 'nod', 'sigh', 'good',
              'tab_read', 'goahead', 'wb_write', 'wb_point', 'night_type', 'night_rub',            # S01
              'stop', 'oneone_talk',                                                                # S02 (phone_read: man hinh la cham neo -> mang hong, khong dung)
              'meet_table_listen', 'meet_table_worry', 'meet_table_agree', 'meet_table_talk',       # S03 (ngoi, ve san ghe)
              'meet_table_present',
              'tab_present', 'count', 'thumbs',                                                     # S04
              'night_sleep', 'night_wake', 'tired_idle', 'tired_talk', 'tired_walk',                # L2: pm_overloaded
              'rally', 'bow', 'doc_raise', 'crossarms', 'bad', 'jump',           # L2: S05, S06, S08, tong ket
              'oneone_listen', 'oneone_show', 'oneone_worry', 'desk_type',                          # L2: S07 (1-1, ket canh)
              'alert', 'startle', 'command', 'delegate', 'rollback', 'relief', 'phone_call',       # L3: S09 (su co), goi khach
              'facepalm', 'scold', 'checklist', 'headshake',                                       # L3: S11, S12
              'meet_note', 'wb_explain', 'clap', 'formal_walk', 'adjust', 'present', 'reflect',     # L4: S13, S16
              'answer', 'bowthank', 'wait', 'badge', 'celebrate', 'relieved', 'fail', 'leave',      # L4: phan bien, ket thuc
              'leave_back', 'resolve']
# Do vat / noi that ma hoa si DA VE SAN trong sprite nhan vat (trai voi quy uoc "tach roi") -> khong ghep them, tranh ve trung.
DRAWN_IN_SPRITE = {('tablet_back', 'grip'), ('tablet_edge', 'grip'), ('tablet_screen_34', 'grip'), ('notebook_open', 'grip'),
                   ('office_chair', 'seat'), ('meeting_chair', 'seat'),
                   ('pen', 'grip')}   # but bi: sprite tay khong co dang cam but ro rang, ghep vao trong nhu que xam vo ly -> bo
BESIDE_GAP = 0.02           # nhu docs/PM/.../tools/pm_compose.js
# Ban ve nhin thang ma nhan vat ngoi nghieng: khop diem ngoi + dat truoc nguoi thi ban che gan het nhan vat.
# Trong game dat ban lech phai (mep trai ban o tam hong + dx * chieu cao), chan ban cham san:
# - ban hop: SAU nguoi, thu nho de vanh ban ngang tam tay (hoa si ve san thanh mep ban o tay -> trung vanh ban that)
# - ban lam viec (co man hinh cao): SAU nguoi, khong che mat
# (dx theo chieu cao nhan vat, z, he so co them so voi ratio trong manifest)
SIDE_FURNITURE = {'desk_monitor': (0.18, -1, 1), 'meeting_table': (0.06, -1, 0.72)}


def find_dots(im):
    """Cham neo trong mot o: {'magenta'|'green'|'cyan': (x, y) tam cham lon nhat}, 'screen': (x0, y0, x1, y1) vung xanh la lon
    (man hinh tren do vat / noi that). Chi lay diem anh dac (alpha > 200) mau thuan."""
    px = im.load(); w, h = im.size
    def kind(p):
        r, g, b, a = p
        if a < 200: return None
        if r > 200 and b > 200 and g < 80: return 'magenta'
        if r < 90 and g > 200 and b > 200: return 'cyan'
        if r < 90 and g > 200 and b < 90: return 'green'
    seen, comps = set(), []
    for y in range(h):
        for x in range(w):
            k = kind(px[x, y])
            if not k or (x, y) in seen: continue
            st, comp = [(x, y)], []
            seen.add((x, y))
            while st:
                a, b = st.pop(); comp.append((a, b))
                for q in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                    if 0 <= q[0] < w and 0 <= q[1] < h and q not in seen and kind(px[q]) == k:
                        seen.add(q); st.append(q)
            if len(comp) >= 4: comps.append((len(comp), k, comp))
    out = {}
    for n, k, comp in sorted(comps, reverse=True):
        if k == 'green' and n >= 400 and 'screen' not in out:
            xs, ys = [c[0] for c in comp], [c[1] for c in comp]
            out['screen'] = (min(xs), min(ys), max(xs), max(ys), comp)
        elif k not in out:
            out[k] = (sum(c[0] for c in comp) / n, sum(c[1] for c in comp) / n)
    return out


def load_object(src, rect, ratio, ref_h):
    """Do vat / noi that tu sheet P/O: to man hinh xanh la thanh mau toi, xoa cham neo, cat sat, co theo ratio * chieu cao idle.
    -> (anh, {'grip'|'seat'|'surface': (x, y)}, origin_chan_x) toa do tren anh da co."""
    x, y, w, h = rect[:4]
    im = src.crop((x, y, x + w, y + h))
    d = find_dots(im)
    if 'screen' in d:
        px = im.load()
        for q in d['screen'][4]: px[q] = (31, 42, 48, 255)                    # man hinh toi (nhu extract_anchors.py)
    im = clean_markers(im, drop_bare=True)
    x0, y0, x1, y1 = im.getbbox()
    im = im.crop((x0, y0, x1, y1))
    f = ratio * ref_h / max(im.size)
    im = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)
    pts = {}
    for col, name in (('magenta', 'grip'), ('cyan', 'seat')):
        if col in d: pts[name] = ((d[col][0] - x0) * f, (d[col][1] - y0) * f)
    return im, pts


def game_atlas(anims, rects, files, names, manifest, out_img, out_js):
    """Atlas cho trang game: moi animation mot hang, khung rieng cua tung animation (fw x fh, goc ox,oy = giua day chan).
    Ghep do cam tay + noi that theo `bind` trong manifest, dung quy tac docs/PM/rolecraft_pm_sprite_prompts/tools/pm_compose.js:
    do vat dat tam cam (grip) vao cham magenta/xanh la cua nhan vat; noi that 'seat' khop cham cyan; 'beside_right' dung
    canh phai cham san; do 'surface:<noi that>' dat len mat ban. Kich thuoc = ratio * chieu cao idle_01. Cham neo da xoa.
    He so k cua animation (normalize_height) nhan thang vao nhan vat -> atlas k = 1."""
    src = {}
    def sheet(s):
        if s not in src: src[s] = Image.open(files[s]).convert('RGBA')
        return src[s]
    bind = {c['key']: c.get('bind') or [] for sh in manifest['sheets'] for c in sh['cells']}
    key_of = {(s, r, c): k for k, (s, r, c) in ((c['key'], (sh['id'], c['row'], c['col'])) for sh in manifest['sheets'] for c in sh['cells'])}
    ref_h = rects['A']['1,2'][3]                                               # idle_01
    obj_cache = {}
    def obj(kind, name):
        if (kind, name) not in obj_cache:
            s, r, c = names[name]
            ratio = manifest['objects'][('prop/' if kind == 'prop' else 'furn/') + name]['ratio']
            if kind == 'furn' and name in SIDE_FURNITURE: ratio *= SIDE_FURNITURE[name][2]
            obj_cache[(kind, name)] = load_object(sheet(s), rects[s][f'{r},{c}'], ratio, ref_h)
        return obj_cache[(kind, name)]

    by = {a['name']: a for a in anims}
    rows, used = [], set()
    for n in GAME_ANIMS:
        a, k = by[n], by[n].get('k', 1)
        frames = []
        for s, r, c in a['frames']:
            x, y, w, h, foot = rects[s][f'{r},{c}']
            ch = sheet(s).crop((x, y, x + w, y + h))
            d = find_dots(ch)
            ch = clean_markers(ch)
            if k != 1: ch = ch.resize((round(w * k), round(h * k)), Image.LANCZOS)
            # toa do theo goc (giua day chan), don vi diem anh atlas
            rel = lambda p: ((p[0] - foot) * k, (p[1] - h) * k)
            pts = {'grip': d.get('magenta'), 'grip2': d.get('green'), 'seat': d.get('cyan')}
            frames.append({'img': ch, 'x': -foot * k, 'y': -h * k, 'w': ch.width, 'pts': {n2: rel(p) for n2, p in pts.items() if p},
                           'bind': bind.get(key_of[(s, r, c)], [])})
        # beside_right: mot vi tri cho ca animation (khong nhay theo be rong tung khung) – canh phai xa nhat + khoang ho
        right = max(f['x'] + f['w'] for f in frames)
        grips = [f['pts']['grip'][0] for f in frames if 'grip' in f['pts']]
        layered = []
        for f in frames:
            layers = [(0, f['img'], f['x'], f['y'])]
            furn_at = {}
            for b in f['bind']:
                if 'furniture' not in b or (b['furniture'], b['at']) in DRAWN_IN_SPRITE: continue
                im, p = obj('furn', b['furniture'])
                z = 1 if b['z'] == 'front' else -1
                if b['furniture'] in SIDE_FURNITURE and 'seat' in f['pts']:
                    dx, z, _ = SIDE_FURNITURE[b['furniture']]
                    fx, fy = f['pts']['seat'][0] + dx * ref_h, -im.height
                elif b['at'] == 'seat' and 'seat' in f['pts'] and 'seat' in p:
                    fx, fy = f['pts']['seat'][0] - p['seat'][0], f['pts']['seat'][1] - p['seat'][1]
                else:
                    # beside_right, cham san. Game: dich trai de dau but (grip) cham mat bang – nhan vat viet / chi len bang
                    fx = (min(grips) - 0.06 * ref_h) if grips else right + BESIDE_GAP * ref_h
                    fy = -im.height
                fx += b.get('dx', 0); fy += b.get('dy', 0)
                furn_at[b['furniture']] = (fx, fy, p)
                layers.append((z, im, fx, fy)); used.add(b['furniture'])
            for b in f['bind']:
                if 'prop' not in b or (b['prop'], b['at']) in DRAWN_IN_SPRITE: continue
                im, p = obj('prop', b['prop'])
                t = None
                if b['at'] in ('grip', 'grip2') and b['at'] in f['pts']: t = f['pts'][b['at']]
                elif b['at'].startswith('surface:') and b['at'][8:] in furn_at:
                    fx, fy, fp = furn_at[b['at'][8:]]
                    furn_im, fpts = obj('furn', b['at'][8:])
                    surf = find_surface(b['at'][8:], manifest, names, rects, sheet, ref_h)
                    if surf: t = (fx + surf[0], fy + surf[1])
                if t is None: continue                                     # thieu diem neo -> bo qua
                o = p.get('grip', (im.width / 2, im.height / 2))
                layers.append((1 if b['z'] != 'back' else -1, im, t[0] - o[0] + b.get('dx', 0), t[1] - o[1] + b.get('dy', 0)))
                used.add(b['prop'])
            layers.sort(key=lambda l: l[0])                                # on dinh: giu thu tu khai bao
            layered.append(layers)
        L = -min(x for ls in layered for _, _, x, _ in ls)
        T = -min(y for ls in layered for _, _, _, y in ls)
        R = max(x + im.width for ls in layered for _, im, x, _ in ls)
        B = max(y + im.height for ls in layered for _, im, _, y in ls)
        fw, fh = int(math.ceil(L + R)) + 2, int(math.ceil(T + B)) + 2
        strip = Image.new('RGBA', (fw * len(frames), fh))
        for i, ls in enumerate(layered):
            for _, im, x, y in ls:
                strip.alpha_composite(im, (round(i * fw + L + x), round(T + y)))
        rows.append((a, strip, fw, fh, L, T))
    W = max(st.width for _, st, *_ in rows)
    H = sum(fh for *_, fh, _, _ in rows)
    atlas = Image.new('RGBA', (W, H))
    meta = {'stand': ref_h, 'anims': {}}
    y = 0
    for a, st, fw, fh, L, T in rows:
        atlas.alpha_composite(st, (0, y))
        meta['anims'][a['name']] = {'y': y, 'fw': fw, 'fh': fh, 'ox': round(L, 1), 'oy': round(T, 1),
                                    'n': len(a['frames']), 'fps': a['fps'], 'loop': a['loop']}
        y += fh
    atlas.save(out_img, 'WEBP', lossless=True, exact=True)
    open(out_js + '.tmp', 'w').write('// Do build_preview.py sinh ra (game_atlas) — toa do atlas sheets/game_pm.webp, dung sua tay\n'
                                     '// moi animation: hang y, khung fw x fh, goc (giua day chan) tai ox,oy trong khung; stand = cao dang dung chuan\n'
                                     'export default ' + json.dumps(meta, separators=(',', ':')) + ';\n')
    os.replace(out_js + '.tmp', out_js)
    return len(rows), sorted(used), atlas.size


_surface = {}
def find_surface(name, manifest, names, rects, sheet, ref_h):
    """Mat ban (cham magenta cua noi that) sau khi co theo ratio – toa do tren anh noi that da cat."""
    if name not in _surface:
        s, r, c = names[name]
        x, y, w, h = rects[s][f'{r},{c}'][:4]
        im = sheet(s).crop((x, y, x + w, y + h))
        d = find_dots(im)
        if 'screen' in d:
            px = im.load()
            for q in d['screen'][4]: px[q] = (31, 42, 48, 255)
        x0, y0, x1, y1 = clean_markers(im, drop_bare=True).getbbox()
        f = manifest['objects']['furn/' + name]['ratio'] * (SIDE_FURNITURE[name][2] if name in SIDE_FURNITURE else 1) * ref_h / max(x1 - x0, y1 - y0)
        _surface[name] = ((d['magenta'][0] - x0) * f, (d['magenta'][1] - y0) * f) if 'magenta' in d else None
    return _surface[name]


def main():
    m = json.load(open(os.path.join(HERE, 'pm_sprite_manifest.json')))
    where, names, name_of, sheets, rects = {}, {}, {}, [], {}
    for s in m['sheets']:
        webp = 'sheets/' + s['file'][:-4] + '.webp'
        sheets.append({'id': s['id'], 'key': s['key'], 'cols': s['cols'], 'rows': s['rows'],
                       'file': webp if os.path.exists(os.path.join(HERE, webp)) else 'sheets/' + s['file']})
        rects[s['id']] = slice_sheet(os.path.join(HERE, 'sheets', s['file']), s['cols'], s['rows'])
        for c in s['cells']:
            where[c['key']] = (s['id'], c['row'], c['col'], c['name'])
            names[c['name']] = [s['id'], c['row'], c['col']]
            name_of[(s['id'], c['row'], c['col'])] = c['name']

    used, anims = set(), []
    for k, a in m['animations'].items():
        used.update(a['frames'])
        anims.append({'name': k.split('/', 1)[1], 'fps': a['fps'], 'loop': a['loop'],
                      'frames': [list(where[f][:3]) for f in a['frames']]})
    normalize_height(anims, rects, {s['id']: os.path.join(HERE, 'sheets', s['file']) for s in m['sheets']})
    cells = [{'name': n, 'key': k, 's': s, 'r': r, 'c': c}
             for k, (s, r, c, n) in where.items() if k not in used]
    md = open(os.path.join(HERE, 'HUONG_DAN_KICH_BAN.md')).read()
    script = parse_script(md, {a['name'] for a in anims}, names, name_of)
    attach_lines(script, os.path.join(HERE, 'THOAI_MAU.json'))

    data = json.dumps({'sheets': sheets, 'rects': rects, 'anims': anims, 'cells': cells,
                       'script': script}, ensure_ascii=False, separators=(',', ':'))
    out = os.path.join(HERE, 'src', 'shared', 'data.js')
    js = open(out).read()
    js = re.sub(r'/\*DATA\*/.*?/\*END\*/', lambda _: '/*DATA*/' + data + '/*END*/', js, flags=re.S)
    open(out + '.tmp', 'w').write(js); os.replace(out + '.tmp', out)   # ghi nguyen tu: trang dev khong doc phai file dang ghi do
    n = sum(len(s['cols']) for L in script for s in L['sits'])
    nf, fw, fh = start_sprite(anims, rects, {s['id']: os.path.join(HERE, 'sheets', s['file']) for s in m['sheets']},
                              os.path.join(HERE, 'sheets', 'start_pm_idle.webp'))
    print(f'man Start: sheets/start_pm_idle.webp ({nf} khung {fw}x{fh})')
    na, objs, size = game_atlas(anims, rects, {s['id']: os.path.join(HERE, 'sheets', s['file']) for s in m['sheets']}, names, m,
                                os.path.join(HERE, 'sheets', 'game_pm.webp'), os.path.join(HERE, 'src', 'game', 'atlas.js'))
    print(f'trang game: sheets/game_pm.webp ({na} animation, {size[0]}x{size[1]}; ghep: {", ".join(objs)}) + src/game/atlas.js')
    print(f'{len(anims)} animation, {len(cells)} o tinh, {n} canh kich ban -> src/shared/data.js')


if __name__ == '__main__':
    main()
