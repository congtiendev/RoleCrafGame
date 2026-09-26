# -*- coding: utf-8 -*-
# Sinh ../README_LINH_SPRITE_PROMPTS.md tu build.py + mapping_section.md
#     python3 build.py && python3 readme.py
import os
from build import SHEETS, cells, marker_tag
HERE = os.path.dirname(os.path.abspath(__file__))
att = {"photo+pm": "Ảnh thật + sheet A của PM (mẫu phong cách)", "master": "Ảnh thật + sheet A của Linh"}
L = [f"""# RoleCraft PM60 – Bộ prompt sprite LINH (JUNIOR_DEV – Frontend Developer)

Cùng cơ chế v3 với bộ PM (`docs/PM`), Anh Minh (`docs/MINH`), Chị Mai (`docs/CLIENT`): nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`.

**Điểm riêng của bộ này**

- **4 sheet nhân vật / {sum(len(cells(s)) for s in SHEETS)} ô.** Đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**: laptop, checklist, sổ, bút, tablet, đèn bàn, cốc, bàn + màn hình, ghế văn phòng, ghế/bàn họp đều đã có.
- **Sheet A đính kèm sheet A của PM** làm mẫu phong cách; Linh thấp và trẻ hơn PM một chút.
- **Quay trái** (3/4 view), đối diện PM.
- **Cảnh chính là L3-S11 (push nhầm code)**: sheet B có hàng bàn code (push → hoảng) và hàng "khoảnh khắc sai sót" (sốc, thú nhận, bị phê bình, được bỏ qua, phân tích nguyên nhân, quyết tâm) cho đủ 3 nhánh.
- **Biến thể mệt** (sheet B hàng 2) cho cờ `team_ot_14_days` — giống bộ tired của PM.
- **Biến thể theo cờ L4** (`junior_publicly_blamed` → rụt rè, `deployment_checklist_added` → tự hào): sheet A hàng 6–7, sheet C hàng 2.
- **Trang phục:** áo len cổ tròn tím lavender khoác ngoài sơ mi trắng, quần chino be, giày sneaker trắng, **tai nghe đeo cổ**, **dây + thẻ nhân viên xanh royal**. Vật đặc trưng: laptop bạc. Khung chân dung nền **tím lavender**. Docs không nói giới tính của Linh: prompt dùng từ trung tính, ngoại hình theo ảnh thật.
- **Mọi ô bám một cảnh Linh xuất hiện trong kịch bản** — xem mục 5. L1 Linh chỉ có mặt, S16 chỉ được nhắc trong báo cáo.

**Các file**

| File | Dùng để |
|---|---|
| `rolecraft_linh_sprite_prompts/SOL_ONE_SHOT_PROMPT.txt` | Prompt gửi **một lần** cho GPT-5.6 Sol (đính kèm ảnh thật, `PM_A_master.png`, file zip thư mục này) |
| `rolecraft_linh_sprite_prompts/prompts/LINH_*.txt` | Prompt từng sheet, nếu muốn sinh thủ công |
| `rolecraft_linh_sprite_prompts/linh_sprite_manifest.json` | Lưới, ảnh đính kèm, tên sprite `linh/*`, **bind** từng ô → `prop/*`, `furn/*` của bộ PM |
| `rolecraft_linh_sprite_prompts/mapping_section.md` | Đối chiếu kịch bản → sprite (bản gốc của mục 5) |
| `rolecraft_linh_sprite_prompts/tools/` | `extract_anchors.py` (bản nhận mọi nhân vật), `pm_compose.js` |
| `rolecraft_linh_sprite_prompts/build.py`, `readme.py` | Nguồn sinh prompt/manifest/README: `python3 build.py && python3 readme.py` |

---

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | Nội dung | Lưới | Đính kèm |
|---|---|---|---|"""]
for s in SHEETS:
    L.append(f"| {s['id']} | {s['title']} | {s['cols']}×{s['rows']} | {att[s['attach']]} |")
L.append("""
Sinh A trước; bản A được duyệt là ảnh tham chiếu cho B, C, D. Cách nhanh nhất: mở chat mới với **GPT-5.6 Sol**, đính kèm ảnh thật, `PM_A_master.png` và zip thư mục `rolecraft_linh_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`.

---

## 2. Điểm kiểm tra

> ✅ **Sheet A:** nhận ra người thật; nét vẽ, viền, bóng và cỡ người khớp sheet A của PM; ô 1 là chân dung khung nền **tím lavender** (chỉ ô này được vẽ laptop); các ô khác **không có đồ vật**, tay ở tư thế cầm; quay trái; chấm màu đúng các ô có `[markers]`.
>
> ✅ **Sheet B, C:** khớp sheet A; không vẽ ghế, bàn, màn hình, laptop, checklist, đèn, cốc; tư thế ngồi cùng độ cao trong một hàng; hàng OT dùng biến thể mệt; PM và team nằm ngoài khung.
>
> ✅ **Sheet D:** 20 khung giống hệt ô 1 sheet A, nền tím lavender.
>
> ✅ **Sau khi chạy script:** mở `build/report.json`; mỗi dòng `missing grip/seat marker` là một ô cần sinh lại.

---

## 3. Dùng tool

```bash
# sheets/ chứa ảnh đã duyệt, đặt tên đúng trường "file" trong manifest
python3 tools/extract_anchors.py --manifest linh_sprite_manifest.json --sheets sheets --out build
```

Kết quả `build/sprites/linh/*.png`, `anim/*.png`, `anchors.json`, `animations.json`, `report.json`. Ghép với đồ vật: nạp `anchors.json` của **cả hai** bộ (PM có `prop/*`, `furn/*`), rồi `PMCompose.create(anchors, manifest, base)` như bộ PM. Đã chạy thử tool trên sheet giả: 124 sprite, 68 strip, 0 cảnh báo.

---

## 4. Chấm neo theo ô

Ô có `[markers]` trong prompt được gắn đồ vật/nội thất trong manifest (`cells[].bind`). Nhóm chính:

| Nhóm tư thế | Đồ vật (sheet P của PM) | Nội thất (sheet O của PM) |
|---|---|---|
| idle, walk, mistake_confess, blamed_02 | laptop_closed | |
| sit_* | | office_chair |
| desk_* | | office_chair + desk_monitor |
| night_*, tired_slump | lamp_on + mugs_pair trên mặt bàn | office_chair + desk_monitor |
| checklist_*, guide, resolve, oneone_proud | checklist_sheet (+ pen khi tick) | |
| note, tab_read, laptop_show, analyze_01 | notebook_open + pen / tablet_back / laptop_open_front | |
| meet_table_*, oneone_* | notebook_open + pen khi ghi chép | meeting_chair (+ meeting_table) |

---

## 5. Mapping kịch bản → sprite
""")
L.append(open(os.path.join(HERE, "mapping_section.md")).read().strip())
L.append("\n---\n\n## 6. Chi tiết từng sheet\n")
for s in SHEETS:
    L.append(f"### Sheet {s['id']} – {s['title']}\n\nFile `LINH_{s['id']}_{s['key']}.png`, lưới {s['cols']}×{s['rows']}, prompt `prompts/LINH_{s['id']}_{s['key']}.txt`.\n")
    L.append("| # | Tên | Mô tả |\n|---|---|---|")
    for c in cells(s):
        tag = "" if s.get("portrait") or c["name"] == "portrait" else marker_tag(c["name"]).strip()
        L.append(f"| {c['index']} | `linh/{c['name']}` | {c['desc']}{' ' + tag if tag else ''} |")
    L.append("")
open(os.path.join(HERE, "..", "README_LINH_SPRITE_PROMPTS.md"), "w").write("\n".join(L) + "\n")
print("README_LINH_SPRITE_PROMPTS.md")
