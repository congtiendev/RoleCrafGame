# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from spec import *
from build import prompt, cells
OUT = os.environ.get("OUT", ".")
HERE = os.path.dirname(os.path.abspath(__file__))
L = []; w = L.append
w("""# RoleCraft PM60 – Bộ prompt sprite PM v3: đồ vật và nội thất tách rời, ghép bằng JS

Nhân vật chuyển từ **ảnh thật**, bố cục sheet 8×7 như ảnh mẫu. Khác v2: **mọi vật cầm tay và nội thất là sprite riêng**. Nhân vật được vẽ tay không ở tư thế cầm, kèm **chấm đánh dấu điểm neo**; script Python đọc chấm thành toạ độ, xoá chấm, và `pm_compose.js` ghép đồ vật vào đúng tay, đúng ghế khi chạy game.

**8 sheet / 312 ô:** 5 sheet nhân vật (A–E), 1 sheet đồ cầm tay (P, 32 món), 1 sheet nội thất (O, 12 món), 1 sheet icon (F).

**Các file**

| File | Dùng để |
|---|---|
| `SOL_ONE_SHOT_PROMPT.txt` | Prompt gửi **một lần** cho GPT-5.6 Sol (đính kèm ảnh thật + file zip này) |
| `prompts/PM_*.txt` | Prompt từng sheet, nếu muốn sinh thủ công |
| `pm_sprite_manifest.json` | Lưới, ảnh đính kèm, tên sprite, **bind** từng ô → đồ vật/nội thất, tỉ lệ kích thước đồ vật |
| `tools/extract_anchors.py` | Cắt sheet, đọc chấm neo, xoá chấm, tách nền, chuẩn hoá tỉ lệ, dựng strip |
| `tools/pm_compose.js` | Ghép nhân vật + đồ vật + nội thất trên canvas, trả vùng màn hình để vẽ UI |
| `spec.py`, `spec_v2.py`, `old_spec.py`, `build.py`, `readme.py` | Nguồn sinh prompt/manifest/README |

---

## 1. Cơ chế tách rời

**Chấm đánh dấu (vẽ trong ảnh, script đọc rồi xoá):**

| Màu | Trên sheet nhân vật (A, B, C, E) | Trên sheet đồ vật (P) | Trên sheet nội thất (O) |
|---|---|---|---|
| MAGENTA `#FF00FF` | Điểm cầm của vật chính (cầm hai tay: giữa hai bàn tay) | Điểm bàn tay cầm, hoặc điểm chạm đáy nếu vật đặt trên mặt bàn | Điểm đặt đồ trên mặt bàn; điểm chạm sàn/tường với vật khác |
| GREEN `#00FF00` | Điểm cầm của vật thứ hai (tay kia) | Vùng màn hình (tablet, điện thoại, laptop) | Vùng màn hình (monitor, màn chiếu) |
| CYAN `#00FFFF` | Điểm hông chạm ghế/sofa khi ngồi hoặc nằm | – | Điểm ngồi của ghế/sofa; với bàn: vị trí hông người ngồi |

**Ghép khi chạy game:** đặt điểm cầm của đồ vật trùng điểm magenta/green của nhân vật; đặt điểm cyan của ghế/bàn trùng điểm cyan của nhân vật. Mỗi frame có điểm neo riêng, nên khi nhân vật đi hay vung tay, đồ vật chạy theo tay.

**Vẫn vẽ liền (không tách):** chân dung (ô 1 sheet A và sheet D), thẻ đeo trên cổ (đã có biến thể cam/xanh/không thẻ ở sheet E), tai nghe ở 2 ô xử lý sự cố, áo khoác gối đầu ở ô ngủ sofa. Lý do: vật đeo trên người cần thêm màu chấm thứ tư, dễ nhầm với hiệu ứng lấp lánh.

**Màn hình trống:** vùng xanh trên tablet, laptop, monitor, màn chiếu được script tô tối và ghi toạ độ `screen`. JS dùng `screens()` để vẽ thẻ UI (bảng phương án, ngân sách, incident log, slide báo cáo) đúng lên màn hình.

---

## 2. Thứ tự sinh và ảnh đính kèm

| Sheet | Nội dung | Lưới | Đính kèm |
|---|---|---|---|
""")
att = {"photo": "Ảnh thật", "master": "Ảnh thật + sheet A", "master_only": "Chỉ sheet A", None: "Không"}
order = ["A","B","C","D","E","P","O","F"]
for s in sorted(SHEETS, key=lambda s: order.index(s["id"])):
    w(f"| {s['id']} | {s['title']} | {s['cols']}×{s['rows']} | {att[s['attach']]} |")
w("""
**Cách nhanh nhất:** mở chat mới với **GPT-5.6 Sol**, đính kèm ảnh thật và file zip này, dán nội dung `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Sol tự sinh 8 sheet, chạy script cắt, và trả về một file zip. Nếu Sol dừng giữa chừng, gửi `Continue from step X.`

---

## 3. Điểm kiểm tra

> ✅ **Sheet A:** nhận ra người thật; ô 1 là chân dung có khung vàng (chỉ ô này được vẽ tablet); các ô khác **không có đồ vật**, tay ở tư thế cầm; chấm màu đúng các ô có `[markers]`.
>
> ✅ **Sheet B, C, E:** khớp sheet A; không vẽ ghế, bàn, bảng trắng; tư thế ngồi cùng độ cao trong một hàng.
>
> ✅ **Sheet P, O:** không có nhân vật hay bàn tay; mỗi ô một món; có chấm và vùng xanh đúng mô tả.
>
> ✅ **Sau khi chạy script:** mở `build/report.json`. Mỗi dòng `missing grip/seat marker` là một ô cần sinh lại (prompt ở mục 7). Mở vài sprite trên nền tối để soát viền trắng và chấm màu còn sót.
>
> ✅ **Ghép thử:** dùng `pm_compose.js` vẽ `pm/idle_01`, `pm/sit_03`, `pm/tab_present_01`, `pm/night_type_01`. Tablet phải nằm trong tay, hông khớp mặt ghế, đèn và cốc nằm trên mặt bàn.

---

## 4. Dùng tool

```bash
# sheets/ chứa ảnh đã duyệt, đặt tên đúng trường "file" trong manifest
python3 tools/extract_anchors.py --manifest pm_sprite_manifest.json --sheets sheets --out build
```

Kết quả trong `build/`: `sprites/pm|prop|furn|icon/*.png`, `anim/*.png` (strip căn theo gốc chân), `anchors.json`, `animations.json`, `report.json`. Gốc toạ độ của nhân vật là **giữa đáy bóng dưới chân**. Đồ vật và nội thất được co giãn theo `ratio` trong manifest so với chiều cao `idle_01`, nên dù sheet P, O sinh ra to nhỏ khác nhau thì khi ghép vẫn đúng tỉ lệ.

```js
// trình duyệt: <script src="pm_compose.js"></script> → window.PMCompose ; Node/bundler: require/import
const pc = PMCompose.create(anchors, manifest, '/assets/pm/');   // base = thư mục chứa build/
await pc.draw(ctx, 'pm/tab_present_01', 420, 640, 0.8);           // x, y = vị trí chân nhân vật
const [screen] = pc.screens('pm/tab_present_01');                 // vùng màn hình tablet
// vẽ thẻ UI "3 phương án" vào screen.x, screen.y, screen.w, screen.h (nhân thêm scale 0.8)
pc.layout('pm/walk_03', { flip: true });                          // quay trái: đồ vật lật theo
```

Animation: phát lần lượt từng frame trong `animations.json` và gọi `draw` cho frame đó, để đồ vật đi theo tay từng frame. Strip trong `anim/` dùng khi không cần đồ vật (ví dụ bản xem trước).

Thiếu sprite hoặc thiếu điểm neo thì lớp đó bị bỏ qua, màn chơi không vỡ.

---

## 5. Gắn kết ô → đồ vật / nội thất

Quy tắc trong `spec.py` (`RULES`), kết quả ghi vào `cells[].bind` của manifest. Các nhóm chính:

| Nhóm tư thế | Đồ vật | Nội thất |
|---|---|---|
| idle, run, tab_hold, tab_read, greet_02, startle_01 | tablet_back (cầm trước ngực) | |
| walk, formal_walk | tablet_edge (kẹp nách, vẽ sau tay) | |
| tired_idle, tired_walk | tablet_edge (lủng lẳng một tay) | |
| tab_present, oneone_show, meet_table_present_01 | tablet_screen_34 (màn hình quay ra, có vùng UI) | ghế họp / bàn họp khi ngồi |
| sit_03, lie_01 | tablet_flat (trên đùi / bụng) | office_chair / sofa |
| desk_*, night_* | notebook (desk_note), lamp_on + mugs_pair đặt trên mặt bàn (night) | office_chair + desk_monitor |
| meet_note, oneone | notebook khi ghi chép | meeting_chair |
| meet_table | notebook/tablet đặt trên mặt bàn, pen trên tay | meeting_chair + meeting_table |
| wb_* | marker | whiteboard (bên phải) |
| phone_*, alert | phone_back (+ notebook tay kia ở phone_call_01) | |
| doc_* | folder_closed / folder_open / contract_sheet | |
| crouch | papers_scattered trên sàn, paper_stack trên tay | |
| rollback | laptop_open_34 (trên cẳng tay), laptop_closed ở frame 4 | |
| present, nervous | clicker | presentation_screen (bên phải, có vùng slide) |
| badge_01 / badge_02 | badge_orange / badge_blue cầm tay | |
| fail, leave, resolve | cardboard_box | |
| coffee, delegate, checklist | mug_steam / task_card / checklist_sheet | |

Đồ vật chưa gắn vào tư thế nào (`kanban_*`, `checklist_poster`, `monitor_alert`, `plant_*`, `lamp_off`, `sticky_notes`…) là đồ trong cảnh, đặt theo cờ kịch bản: `kanban_overloaded` khi `large_project_without_resources`, `checklist_poster` khi `deployment_checklist_added` hoặc `process_standardized`, `monitor_alert` ở L3-S09.

---

## 6. Mapping kịch bản → sprite

""")
w(open(os.path.join(HERE, "mapping_section.md")).read())
w("""
---

## 7. Prompt sửa lỗi

**Ô thiếu chấm hoặc lỡ vẽ đồ vật** (đính kèm ảnh thật, sheet A, sheet lỗi):

```text
Image 1 is the real person, Image 2 is the approved master sheet, Image 3 is the sheet to fix.
Edit Image 3: redraw ONLY row {N}, keeping every other row unchanged. In this row draw no held objects
and no furniture: empty hands in the grip pose, body at seat height where seated. Add the marker dots
exactly as tagged: {dán lại phần "Row N" từ prompt gốc, gồm các tag [markers]}.
Dots are small solid flat circles: MAGENTA #FF00FF, GREEN #00FF00, CYAN #00FFFF. Same character as Image 2.
```

**Sheet P/O vẽ sai tỉ lệ hoặc có bàn tay:**

```text
Redraw the attached object sheet: no hands or characters, one item per cell, sizes matching the chibi
character in the master sheet, magenta dot at each grip or contact point, screens as flat solid green.
```

**Mặt không còn giống người thật / lệch khỏi sheet A / chu kỳ đi sai:** dùng như bản v2:

```text
Image 1 is the real person, Image 2 is the current sheet. Keep every pose, outfit and the chibi style,
but make the face and hair resemble the person in Image 1 more closely. Keep all marker dots.
```

---

## 8. Giới hạn cần biết

- **Chấm có thể lệch vài pixel** so với lòng bàn tay. Sau khi ghép thử, nếu một nhóm tư thế lệch đều, chỉnh bằng offset trong `bind` (thêm `dx`, `dy` vào `pm_compose.js`) thay vì sinh lại ảnh.
- **Ngón tay không ôm quanh vật**, vì vật được vẽ đè lên tay (z `front`) hoặc sau tay (z `back`). Với phong cách chibi tay tròn thì khó nhận ra; nếu cần, chuyển z của nhóm đó.
- **Tỉ lệ đồ vật** lấy từ `ratio` trong manifest, là giá trị ước lượng. Chỉnh `RATIO` trong `spec.py` sau khi ghép thử, rồi chạy lại `build.py` và `extract_anchors.py`.
- **56 ô là nhiều cho một lần sinh.** Nếu công cụ vẽ thiếu ô, chia sheet thành hai lần (hàng 1–4 và 5–7).
- Chỉ dùng ảnh của người đã đồng ý cho việc chuyển thành nhân vật game.

---

## 9. Chi tiết từng sheet
""")
for s in sorted(SHEETS, key=lambda s: order.index(s["id"])):
    w(f"### Sheet {s['id']} – {s['title']}\n\n{s['purpose']}\n\nFile prompt: `prompts/PM_{s['id']}_{s['key']}.txt` · Lưới {s['cols']}×{s['rows']} · Đính kèm: {att[s['attach']]}\n")
    w("| Ô | Tên | Mô tả |\n|---:|---|---|")
    kind = "prop" if s.get("objects") == "props" else "furn" if s.get("objects") == "furniture" else "icon" if s.get("icons") else "pm"
    for c in cells(s):
        w(f"| {c['index']} | `{kind}/{c['name']}` | {c['desc']} |")
    w("\n<details><summary>Prompt đầy đủ</summary>\n\n```text\n" + prompt(s) + "\n```\n\n</details>\n")
open(f"{OUT}/README_PM_SPRITE_PROMPTS_v3.md", "w").write("\n".join(L))
