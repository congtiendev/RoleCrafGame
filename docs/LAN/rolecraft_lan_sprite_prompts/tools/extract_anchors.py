#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cat sheet -> sprite PNG trong suot + anchors.json + animation strip.

Ban cho moi nhan vat: kind khac prop/furn/icon (pm, minh, ...) deu la nhan vat.

    python3 tools/extract_anchors.py --manifest pm_sprite_manifest.json --sheets sheets/ --out build/

- sheets/ chua anh da duyet, dat ten dung truong "file" trong manifest (vd PM_A_master.png).
- Doc cham MAGENTA / GREEN / CYAN -> toa do neo, roi xoa cham (lap mau lan can).
- Vung GREEN tren do vat / noi that = man hinh -> ghi hinh chu nhat "screen", to mau toi.
- Xoa nen trang bang flood-fill tu mep o; chan dung giu nguyen nen vang trong khung.
- Chuan hoa ti le do vat theo chieu cao idle_01 cua nhan vat (ratio trong manifest).
- Dung strip cho moi nhom animation: frame bang nhau, can theo goc (origin) = giua-day chan.
"""
import argparse, json, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

COL = {"magenta": (255, 0, 255), "green": (0, 255, 0), "cyan": (0, 255, 255)}

def color_mask(a, rgb, tol=70):
    d = np.abs(a[..., :3].astype(int) - np.array(rgb)).sum(-1)
    return d < tol

def blobs(mask, min_px=4):
    lab, n = ndi.label(mask)
    out = []
    for i in range(1, n + 1):
        ys, xs = np.nonzero(lab == i)
        if len(xs) >= min_px:
            out.append((len(xs), float(xs.mean()), float(ys.mean()), (xs.min(), ys.min(), xs.max(), ys.max())))
    return sorted(out, reverse=True)

def inpaint(a, mask):
    """thay pixel trong mask bang mau pixel gan nhat ngoai mask"""
    if not mask.any(): return a
    _, (iy, ix) = ndi.distance_transform_edt(mask, return_indices=True)
    b = a.copy(); b[mask] = a[iy[mask], ix[mask]]; return b

def remove_bg(a, tol=34):
    rgb = a[..., :3].astype(int)
    white = (rgb.min(-1) > 255 - tol) & ((rgb.max(-1) - rgb.min(-1)) < 20)
    lab, _ = ndi.label(white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    out = np.dstack([a[..., :3], np.where(bg, 0, 255).astype(np.uint8)])
    # khu vien trang 1px giap nen
    ring = ndi.binary_dilation(bg) & ~bg
    near = ring & (rgb.min(-1) > 225)
    out[near, 3] = 90
    return out

def trim(a, pad=2):
    ys, xs = np.nonzero(a[..., 3] > 10)
    if not len(xs): return a, (0, 0)
    x0, y0 = max(xs.min() - pad, 0), max(ys.min() - pad, 0)
    x1, y1 = min(xs.max() + pad + 1, a.shape[1]), min(ys.max() + pad + 1, a.shape[0])
    return a[y0:y1, x0:x1], (x0, y0)

def foot_origin(a):
    al = a[..., 3] > 10
    ys, xs = np.nonzero(al)
    bottom = ys.max(); band = al[max(bottom - max(3, int(0.06 * a.shape[0])), 0): bottom + 1]
    bx = np.nonzero(band.any(0))[0]
    return [float((bx.min() + bx.max()) / 2), float(bottom)]

def process_cell(img, kind, name, expect):
    a = np.array(img.convert("RGBA"))
    rec, notes = {}, []
    char = kind not in ("prop", "furn", "icon")
    want_pts = {"prop": {"magenta": "grip"},
                "furn": {"magenta": "surface", "cyan": "seat"},
                "icon": {}}.get(kind, {"magenta": "grip", "green": "grip2", "cyan": "seat"})
    erase = np.zeros(a.shape[:2], bool)
    for col, label in want_pts.items():
        m = color_mask(a, COL[col])
        if col == "green" and not char: continue
        bl = blobs(m)
        if bl:
            _, x, y, _ = bl[0]; rec[label] = [x, y]
            if len(bl) > 1: notes.append(f"{len(bl)} {col} dots, used largest")
        erase |= ndi.binary_dilation(m, iterations=2)
    if kind in ("prop", "furn"):
        g = color_mask(a, COL["green"], tol=90)
        bl = blobs(g, min_px=30)
        if bl:
            _, _, _, (x0, y0, x1, y1) = bl[0]
            rec["screen"] = [int(x0), int(y0), int(x1 - x0 + 1), int(y1 - y0 + 1)]
            a[g] = (31, 42, 48, 255)                       # man hinh toi, JS ve noi dung len
    a = inpaint(a, erase)
    a = remove_bg(a)
    a, (ox, oy) = trim(a)
    for k in ("grip", "grip2", "seat", "surface"):
        if k in rec: rec[k] = [rec[k][0] - ox, rec[k][1] - oy]
    if "screen" in rec: rec["screen"][0] -= ox; rec["screen"][1] -= oy
    if char:
        rec["origin"] = foot_origin(a)
    elif kind == "prop":
        rec["origin"] = rec.get("grip") or [a.shape[1] / 2, a.shape[0] / 2]
    else:
        rec["origin"] = foot_origin(a)
        if "surface" in rec and name not in ("desk_monitor", "meeting_table"):
            rec["base"] = rec.pop("surface")                # vat dung duoi dat / treo tuong
    for k in expect:
        if k not in rec: notes.append(f"missing {k} marker")
    return a, rec, notes

def scale_rec(rec, f):
    for k, v in rec.items():
        if isinstance(v, list): rec[k] = [round(t * f, 1) for t in v]
    return rec

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True); ap.add_argument("--sheets", required=True)
    ap.add_argument("--out", required=True)
    o = ap.parse_args()
    man = json.load(open(o.manifest))
    os.makedirs(o.out, exist_ok=True)
    anchors, report, sprites = {}, [], {}
    for sh in man["sheets"]:
        path = os.path.join(o.sheets, sh["file"])
        if not os.path.exists(path):
            report.append({"sheet": sh["file"], "error": "missing sheet image"}); continue
        im = Image.open(path).convert("RGBA")
        W, H = im.size; cw, ch = W / sh["cols"], H / sh["rows"]
        for c in sh["cells"]:
            box = (round((c["col"] - 1) * cw), round((c["row"] - 1) * ch), round(c["col"] * cw), round(c["row"] * ch))
            expect = [b["at"] for b in c.get("bind", []) if b["at"] in ("grip", "grip2", "seat")]
            a, rec, notes = process_cell(im.crop(box), sh["kind"], c["name"], set(expect))
            sprites[c["key"]] = a; anchors[c["key"]] = rec
            if notes: report.append({"sprite": c["key"], "notes": notes})
    # chuan hoa ti le do vat theo idle_01
    ref = next((a for k, a in sprites.items() if k.endswith("/idle_01") and k.split("/")[0] not in ("prop", "furn", "icon")), None)
    ref_h = ref.shape[0] if ref is not None else None
    for key, a in list(sprites.items()):
        kind = key.split("/")[0]
        if kind in ("prop", "furn") and ref_h and key in man["objects"]:
            target = man["objects"][key]["ratio"] * ref_h
            f = target / max(a.shape[:2])
            img = Image.fromarray(a).resize((max(1, round(a.shape[1] * f)), max(1, round(a.shape[0] * f))), Image.LANCZOS)
            sprites[key] = np.array(img); scale_rec(anchors[key], f); anchors[key]["scale"] = round(f, 3)
            anchors[key]["z"] = man["objects"][key]["z"]
    for key, a in sprites.items():
        kind, name = key.split("/")
        os.makedirs(f"{o.out}/sprites/{kind}", exist_ok=True)
        fn = f"sprites/{kind}/{name}.png"
        Image.fromarray(a).save(f"{o.out}/{fn}")
        anchors[key].update({"file": fn, "w": int(a.shape[1]), "h": int(a.shape[0])})
    # strip: moi frame can goc origin vao cung mot diem
    anims = {}
    os.makedirs(f"{o.out}/anim", exist_ok=True)
    for g, spec in man["animations"].items():
        fr = [f for f in spec["frames"] if f in sprites]
        if not fr: continue
        L = max(anchors[f]["origin"][0] for f in fr); R = max(anchors[f]["w"] - anchors[f]["origin"][0] for f in fr)
        T = max(anchors[f]["origin"][1] for f in fr); B = max(anchors[f]["h"] - anchors[f]["origin"][1] for f in fr)
        fw, fh = int(np.ceil(L + R)), int(np.ceil(T + B))
        strip = Image.new("RGBA", (fw * len(fr), fh), (0, 0, 0, 0))
        for i, f in enumerate(fr):
            ox, oy = anchors[f]["origin"]
            strip.alpha_composite(Image.fromarray(sprites[f]), (int(round(i * fw + L - ox)), int(round(T - oy))))
        fn = f"anim/{g.split('/')[1]}.png"; strip.save(f"{o.out}/{fn}")
        anims[g] = {"file": fn, "frameWidth": fw, "frameHeight": fh, "originX": round(L, 1), "originY": round(T, 1),
                    "frames": fr, "fps": spec["fps"], "loop": spec["loop"]}
    json.dump(anchors, open(f"{o.out}/anchors.json", "w"), ensure_ascii=False, indent=1)
    json.dump(anims, open(f"{o.out}/animations.json", "w"), ensure_ascii=False, indent=1)
    json.dump(report, open(f"{o.out}/report.json", "w"), ensure_ascii=False, indent=1)
    print(f"{len(sprites)} sprites, {len(anims)} strips, {len(report)} warnings -> {o.out}")

if __name__ == "__main__":
    main()
