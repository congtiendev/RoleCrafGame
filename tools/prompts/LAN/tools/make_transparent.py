#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Xoa nen trang cua sheet (khi cong cu ve van tra nen trang thay vi trong suot) – khong can sinh lai anh.

    python3 tools/make_transparent.py sheets/*.png      # ghi de tung file

Vung trang noi voi mep anh (nen va khe giua cac o) -> alpha 0; vien sat hinh lam mo nhe. Khung chan dung
(nen xanh nhat) va mau trang tren nguoi nhan vat (khong noi voi mep) duoc giu nguyen.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def make_transparent(path, tol=34):
    a = np.array(Image.open(path).convert("RGBA"))
    rgb = a[..., :3].astype(int)
    white = ((rgb.min(-1) > 255 - tol) & ((rgb.max(-1) - rgb.min(-1)) < 20)) | (a[..., 3] < 16)
    lab, _ = ndi.label(white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    a[..., 3] = np.where(bg, 0, a[..., 3])
    ring = ndi.binary_dilation(bg) & ~bg & (rgb.min(-1) > 225)
    a[ring, 3] = 90
    Image.fromarray(a).save(path)
    return round(bg.mean() * 100, 1)

if __name__ == "__main__":
    for p in sys.argv[1:]:
        print(f"{p}: {make_transparent(p)}% nen da xoa")
