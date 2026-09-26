# -*- coding: utf-8 -*-
# Sinh ../README_CLIENT_SPRITE_PROMPTS.md tu build.py + mapping_section.md
#     python3 build.py && python3 readme.py
import os
from build import SHEETS, cells, marker_tag
HERE = os.path.dirname(os.path.abspath(__file__))
att = {"photo+pm": "Ảnh thật + sheet A của PM (mẫu phong cách)", "master": "Ảnh thật + sheet A của Chị Mai"}
L = [f"""# RoleCraft PM60 – Bộ prompt sprite CHỊ MAI (Đại diện khách hàng/PO)

Cùng cơ chế v3 với bộ PM (`docs/PM`) và bộ Anh Minh (`docs/MINH`): nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`.

**Điểm riêng của bộ này**

- **Chỉ 4 sheet nhân vật / {sum(len(cells(s)) for s in SHEETS)} ô.** Đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**: điện thoại, tablet, folder, trang yêu cầu, sổ, bút, ghế họp, bàn họp đều đã có.
- **Sheet A đính kèm sheet A của PM** làm mẫu phong cách và cỡ người.
- **Quay trái** (3/4 view): Chị Mai ngồi đối diện PM ở bàn họp (PM quay phải).
- **Phần lớn là tư thế ngồi họp** vì mọi lần Chị Mai xuất hiện trong kịch bản đều là cuộc họp (kickoff, release, complain, mở rộng) hoặc cuộc gọi (sự cố L3). Sheet C chia theo từng cuộc họp.
- **Trang phục:** blouse kem, blazer đỏ rượu vang mở cúc, quần tây xanh navy, giày đế vuông thấp màu đen, khuyên tai ngọc trai, đồng hồ vàng mảnh, **dây xám + thẻ VISITOR trắng** (khách đến văn phòng bên phát triển). Vật đặc trưng: điện thoại. Khung chân dung nền **xanh bạc hà**.
- **Mọi ô bám một cảnh Chị Mai xuất hiện trong kịch bản** — xem mục 5.

**Các file**

| File | Dùng để |
|---|---|
| `rolecraft_client_sprite_prompts/SOL_ONE_SHOT_PROMPT.txt` | Prompt gửi **một lần** cho GPT-5.6 Sol (đính kèm ảnh thật, `PM_A_master.png`, file zip thư mục này) |
| `rolecraft_client_sprite_prompts/prompts/MAI_*.txt` | Prompt từng sheet, nếu muốn sinh thủ công |
| `rolecraft_client_sprite_prompts/mai_sprite_manifest.json` | Lưới, ảnh đính kèm, tên sprite `mai/*`, **bind** từng ô → `prop/*`, `furn/*` của bộ PM |
| `rolecraft_client_sprite_prompts/mapping_section.md` | Đối chiếu kịch bản → sprite (bản gốc của mục 5) |
| `rolecraft_client_sprite_prompts/tools/` | `extract_anchors.py` (bản nhận mọi nhân vật, như bộ Minh), `pm_compose.js` |
| `rolecraft_client_sprite_prompts/build.py`, `readme.py` | Nguồn sinh prompt/manifest/README: `python3 build.py && python3 readme.py` |

---

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | Nội dung | Lưới | Đính kèm |
|---|---|---|---|"""]
for s in SHEETS:
    L.append(f"| {s['id']} | {s['title']} | {s['cols']}×{s['rows']} | {att[s['attach']]} |")
L.append("""
Sinh A trước; bản A được duyệt là ảnh tham chiếu cho B, C, D. Cách nhanh nhất: mở chat mới với **GPT-5.6 Sol**, đính kèm ảnh thật, `PM_A_master.png` và zip thư mục `rolecraft_client_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`.

---

## 2. Điểm kiểm tra

> ✅ **Sheet A:** nhận ra người thật; nét vẽ, viền, bóng và cỡ người khớp sheet A của PM; ô 1 là chân dung khung nền **xanh bạc hà** (chỉ ô này được vẽ điện thoại); các ô khác **không có đồ vật**, tay ở tư thế cầm; quay trái; chấm màu đúng các ô có `[markers]`.
>
> ✅ **Sheet B, C:** khớp sheet A; không vẽ ghế, bàn, folder, trang giấy, tablet, điện thoại; tư thế ngồi cùng độ cao trong một hàng; PM và team bên phát triển nằm ngoài khung.
>
> ✅ **Sheet D:** 20 khung giống hệt ô 1 sheet A, nền xanh bạc hà.
>
> ✅ **Sau khi chạy script:** mở `build/report.json`; mỗi dòng `missing grip/seat marker` là một ô cần sinh lại.

---

## 3. Dùng tool

```bash
# sheets/ chứa ảnh đã duyệt, đặt tên đúng trường "file" trong manifest
python3 tools/extract_anchors.py --manifest mai_sprite_manifest.json --sheets sheets --out build
```

Kết quả `build/sprites/mai/*.png`, `anim/*.png`, `anchors.json`, `animations.json`, `report.json`. Ghép với đồ vật: nạp `anchors.json` của **cả hai** bộ (PM có `prop/*`, `furn/*`), rồi `PMCompose.create(anchors, manifest, base)` như bộ PM. Đã chạy thử tool trên sheet giả: 148 sprite, 90 strip, 0 cảnh báo.

---

## 4. Chấm neo theo ô

Ô có `[markers]` trong prompt được gắn đồ vật/nội thất trong manifest (`cells[].bind`). Nhóm chính:

| Nhóm tư thế | Đồ vật (sheet P của PM) | Nội thất (sheet O của PM) |
|---|---|---|
| idle, walk, leave, phone_*, incident_call/calm | phone_back (phone_show: phone_screen) | |
| doc_carry, doc_give, doc_show, doc_read, doc_point, doc_sign | folder_closed / contract_sheet / folder_open (+ pen) | |
| tab_*, meet_table_schedule, propose_02 | tablet_back / tablet_screen_34 / tablet_edge | |
| sit, meet_table_*, complain_*, defend … shake_seated (sheet C hàng 1–4) | notebook_open + pen khi ghi chép; contract_sheet trên bàn khi complain | meeting_chair + meeting_table |

---

## 5. Mapping kịch bản → sprite
""")
L.append(open(os.path.join(HERE, "mapping_section.md")).read().strip())
L.append("\n---\n\n## 6. Chi tiết từng sheet\n")
for s in SHEETS:
    L.append(f"### Sheet {s['id']} – {s['title']}\n\nFile `MAI_{s['id']}_{s['key']}.png`, lưới {s['cols']}×{s['rows']}, prompt `prompts/MAI_{s['id']}_{s['key']}.txt`.\n")
    L.append("| # | Tên | Mô tả |\n|---|---|---|")
    for c in cells(s):
        tag = "" if s.get("portrait") or c["name"] == "portrait" else marker_tag(c["name"]).strip()
        L.append(f"| {c['index']} | `mai/{c['name']}` | {c['desc']}{' ' + tag if tag else ''} |")
    L.append("")
open(os.path.join(HERE, "..", "README_CLIENT_SPRITE_PROMPTS.md"), "w").write("\n".join(L) + "\n")
print("README_CLIENT_SPRITE_PROMPTS.md")
