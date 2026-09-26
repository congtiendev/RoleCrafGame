# -*- coding: utf-8 -*-
# Sinh ../README_MINH_SPRITE_PROMPTS.md tu build.py + mapping_section.md
#     python3 build.py && python3 readme.py
import os
from build import SHEETS, cells, marker_tag
HERE = os.path.dirname(os.path.abspath(__file__))
att = {"photo+pm": "Ảnh thật + sheet A của PM (mẫu phong cách)", "master": "Ảnh thật + sheet A của Minh"}
L = [f"""# RoleCraft PM60 – Bộ prompt sprite ANH MINH (Trưởng phòng/PM Lead)

Cùng cơ chế v3 với bộ PM (`docs/PM`): nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`.

**Khác bộ PM**

- **Chỉ 4 sheet nhân vật / {sum(len(cells(s)) for s in SHEETS)} ô.** Đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**: mọi món Anh Minh cầm hay ngồi (folder, tablet, điện thoại, bút, sổ, clicker, thẻ xanh, ghế họp, bàn họp, màn chiếu) đều đã có ở đó.
- **Sheet A đính kèm sheet A của PM** làm mẫu phong cách, để hai nhân vật đứng chung cảnh không lệch nét vẽ, cỡ người.
- **Quay trái** (3/4 view): Anh Minh thường đứng đối diện PM (PM quay phải).
- **Trang phục:** sơ mi trắng, blazer xám than mở cúc, quần xám than, giày đen, đồng hồ tay trái, **dây đeo + thẻ xanh royal** (thẻ nhân viên chính thức — cùng màu thẻ PM nhận khi Pass). Vật đặc trưng: folder xanh navy.
- **Mọi ô bám một cảnh Anh Minh xuất hiện trong kịch bản** — xem mục 5. Không có bảng trắng, cà phê, bàn riêng hay cảnh sự cố vì kịch bản không có (S09 không có `MANAGER`).

**Các file**

| File | Dùng để |
|---|---|
| `rolecraft_minh_sprite_prompts/SOL_ONE_SHOT_PROMPT.txt` | Prompt gửi **một lần** cho GPT-5.6 Sol (đính kèm ảnh thật, `PM_A_master.png`, file zip thư mục này) |
| `rolecraft_minh_sprite_prompts/prompts/MINH_*.txt` | Prompt từng sheet, nếu muốn sinh thủ công |
| `rolecraft_minh_sprite_prompts/minh_sprite_manifest.json` | Lưới, ảnh đính kèm, tên sprite `minh/*`, **bind** từng ô → `prop/*`, `furn/*` của bộ PM |
| `rolecraft_minh_sprite_prompts/mapping_section.md` | Đối chiếu kịch bản → sprite (bản gốc của mục 5) |
| `rolecraft_minh_sprite_prompts/tools/extract_anchors.py` | Bản của bộ PM, sửa để nhận mọi nhân vật (`kind` khác prop/furn/icon) |
| `rolecraft_minh_sprite_prompts/tools/pm_compose.js` | Giữ nguyên từ bộ PM |
| `rolecraft_minh_sprite_prompts/build.py`, `readme.py` | Nguồn sinh prompt/manifest/README: `python3 build.py && python3 readme.py` |

---

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | Nội dung | Lưới | Đính kèm |
|---|---|---|---|"""]
for s in SHEETS:
    L.append(f"| {s['id']} | {s['title']} | {s['cols']}×{s['rows']} | {att[s['attach']]} |")
L.append("""
Sinh A trước; bản A được duyệt là ảnh tham chiếu cho B, C, D. Cách nhanh nhất: mở chat mới với **GPT-5.6 Sol**, đính kèm ảnh thật, `PM_A_master.png` và zip thư mục `rolecraft_minh_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`.

---

## 2. Điểm kiểm tra

> ✅ **Sheet A:** nhận ra người thật; nét vẽ, viền, bóng và cỡ người khớp sheet A của PM; ô 1 là chân dung khung nền **xanh pastel** (chỉ ô này được vẽ folder); các ô khác **không có đồ vật**, tay ở tư thế cầm; quay trái; chấm màu đúng các ô có `[markers]`.
>
> ✅ **Sheet B, C:** khớp sheet A; không vẽ ghế, bàn, màn chiếu, folder, tablet, điện thoại; tư thế ngồi cùng độ cao trong một hàng; người đối diện (bắt tay, 1-1) nằm ngoài khung.
>
> ✅ **Sheet D:** 20 khung giống hệt ô 1 sheet A, nền xanh pastel.
>
> ✅ **Sau khi chạy script:** mở `build/report.json`; mỗi dòng `missing grip/seat marker` là một ô cần sinh lại.

---

## 3. Dùng tool

```bash
# sheets/ chứa ảnh đã duyệt, đặt tên đúng trường "file" trong manifest
python3 tools/extract_anchors.py --manifest minh_sprite_manifest.json --sheets sheets --out build
```

Kết quả `build/sprites/minh/*.png`, `anim/*.png`, `anchors.json`, `animations.json`, `report.json`. Ghép với đồ vật: nạp `anchors.json` của **cả hai** bộ (PM có `prop/*`, `furn/*`), rồi `PMCompose.create(anchors, manifest, base)` như bộ PM. Đã chạy thử tool trên sheet giả: 172 sprite, 98 strip, 0 cảnh báo.

---

## 4. Chấm neo theo ô

Ô có `[markers]` trong prompt được gắn đồ vật/nội thất trong manifest (`cells[].bind`). Nhóm chính:

| Nhóm tư thế | Đồ vật (sheet P của PM) | Nội thất (sheet O của PM) |
|---|---|---|
| idle, walk, leave, doc_carry, doc_give, doc_receive | folder_closed | |
| doc_read, doc_flip, doc_close | folder_open | |
| tab_*, oneone_show | tablet_back / tablet_screen_34 / tablet_edge | meeting_chair (1-1) |
| phone_* | phone_back | |
| present, count, two_projects, assign, wait | clicker | presentation_screen (bên trái) |
| badge_give | badge_blue | |
| sit, oneone_*, meet_table_*, panel_*, review_thank | notebook_open, pen khi ghi chép | meeting_chair (+ meeting_table) |

---

## 5. Mapping kịch bản → sprite
""")
L.append(open(os.path.join(HERE, "mapping_section.md")).read().strip())
L.append("\n---\n\n## 6. Chi tiết từng sheet\n")
for s in SHEETS:
    L.append(f"### Sheet {s['id']} – {s['title']}\n\nFile `MINH_{s['id']}_{s['key']}.png`, lưới {s['cols']}×{s['rows']}, prompt `prompts/MINH_{s['id']}_{s['key']}.txt`.\n")
    L.append("| # | Tên | Mô tả |\n|---|---|---|")
    for c in cells(s):
        tag = "" if s.get("portrait") or c["name"] == "portrait" else marker_tag(c["name"]).strip()
        L.append(f"| {c['index']} | `minh/{c['name']}` | {c['desc']}{' ' + tag if tag else ''} |")
    L.append("")
open(os.path.join(HERE, "..", "README_MINH_SPRITE_PROMPTS.md"), "w").write("\n".join(L) + "\n")
print("README_MINH_SPRITE_PROMPTS.md")
