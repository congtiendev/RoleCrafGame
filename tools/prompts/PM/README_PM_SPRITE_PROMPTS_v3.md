# RoleCraft PM60 – Bộ prompt sprite PM v3: đồ vật và nội thất tách rời, ghép bằng JS

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

| A | Master: chân dung, đứng, đi, chạy, nhảy, ngồi, nằm, cảm xúc | 8×7 | Ảnh thật |
| B | Cầm nắm + cử chỉ tay chân | 8×7 | Ảnh thật + sheet A |
| C | Bàn làm việc, OT, 1-1, bàn họp, bảng trắng, sự cố | 8×7 | Ảnh thật + sheet A |
| D | 20 chân dung cảm xúc cho hộp thoại | 4×5 | Ảnh thật + sheet A |
| E | Final Review (blazer), kết thúc campaign, biến thể kiệt sức | 8×7 | Ảnh thật + sheet A |
| P | Đồ vật cầm tay (tách rời) | 8×4 | Chỉ sheet A |
| O | Nội thất và đồ trong cảnh (tách rời) | 4×3 | Chỉ sheet A |
| F | Icon emote và icon chỉ số | 6×4 | Không |

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


Tên trong bảng là **nhóm animation** (bỏ hậu tố `_01`, `_02`…), đúng với khoá `pm/<nhóm>` trong manifest. Trường `action` trong JSON kịch bản trỏ tới nhóm này; `emotion` chọn chân dung `pm/face_<cảm xúc>` trong hộp thoại và emote `icon/emo_*` nổi trên đầu. Mũi tên `→` là chuỗi phát nối tiếp. Khi cảnh đang ngồi ở bàn họp, dùng `meet_table_present` thay cho `tab_present`.

### Level 1 – Khởi động

| Cảnh | Mở màn | A | B | C |
|---|---|---|---|---|
| Intro nhận việc | `walk` → `greet` → `shake`; giấy tờ bàn giao lộn xộn: `crouch` | | | |
| S01 Tiếp quản | `tab_read` · face_worried | `wb_write` → `wb_point` | `goahead` | `night_type` → `night_rub` · emo_coffee |
| S02 Senior tự quyết | `phone_read` → `nod` · face_worried | `stop` · face_serious | `goahead` | `oneone_talk` · face_confident |
| S03 Thay đổi phạm vi | `sit` → `meet_table_listen` | `thumbs` · face_happy | `doc_raise` / `stop` | `count` → `meet_table_present` |
| S04 Quỹ công cụ | `think` + `tab_read` | `tab_present` | `talk` + `headshake` | `count` |
| Tổng kết | `good` / `bad` theo kết quả | | | |

### Level 2 – Hòa nhập

| Cảnh | Mở màn | A | B | C |
|---|---|---|---|---|
| Intro | `nod` → `talk` | | | |
| S05 Hai dự án | `meet_table_listen` · emo_exclaim | `meet_table_present` (thuê Freelancer) | `rally` (OT) | `count` → `tab_present` |
| S06 Deadline/chất lượng | `meet_table_worry` | `goahead` | `bow` + `tab_present` | `tab_present` + `count` |
| S07 Giữ Huy | `oneone_listen` → `oneone_worry` | `tab_present` (ngân sách retention) | `oneone_talk` → `doc_give` | `oneone_talk` → C1 `jump` / C2 `sigh` |
| S07 kết cảnh | `desk_type` | | | |
| S08 Complain | `meet_table_listen` → `phone_read` (anh Minh nhắn riêng) | `doc_raise` / `crossarms` | `bow` (sâu) | `count` → `meet_table_present` → `meet_table_agree` |

### Level 3 – Bứt phá

Kịch bản Level 3 chưa có thoại chi tiết, mapping này suy từ flow và cần rà lại.

| Cảnh | Mở màn | A | B | C |
|---|---|---|---|---|
| S09 Production Incident | `alert` → `startle` → `run` | `command` (dừng cả team) | `delegate` (giao một dev) | `rollback` → `relief` |
| S09 sau mọi nhánh | `phone_call` · face_apologetic (báo khách) | | | |
| S10 Sales hứa 10 ngày | `phone_read` · face_surprised | `thumbs` / `rally` | `stop` | `count` → `tab_present` (MVP + Phase 2) |
| S11 Junior gây lỗi | `facepalm` → `think` | `scold` | `goahead` | `coach` → `checklist` |
| S12 Cơ hội dự án lớn | `phone_call` · face_surprised | `thumbs` → `jump` | `headshake` → `stop` | `count` → `tab_present` |

### Level 4 – Thu hoạch

| Cảnh | Mở màn | A | B | C |
|---|---|---|---|---|
| Intro | `nod` → `talk` | | | |
| S13 Hệ thống vận hành | `meet_note` | `talk` → `stress` | `wb_write` → `wb_explain` | `delegate` → `clap` |
| S14 Phát triển team | `desk_type` | `tab_read` → `talk` | `oneone_talk` → `oneone_show` | `delegate` → `coach` |
| S15 Mở rộng hợp tác | `shake` → `meet_table_listen` | `thumbs` | `meet_table_talk` | `count` → `meet_table_present` |
| S16 Final Review | `formal_walk` → `adjust` → `present` | `present` → `bad` | `bowthank` → `reflect` | `present` → `answer` |
| S16 phản biện | `answer` / `reflect`; chờ kết quả `wait` | | | |

### Kết thúc campaign

| Kết quả | Chuỗi sprite |
|---|---|
| Pass xuất sắc | `badge` → `celebrate` (kèm `jump`) |
| Pass | `badge` → `relieved` |
| Gia hạn thử việc | `sigh` · face_worried |
| Không đạt | `fail` → `leave` → `leave_back` (tuỳ chọn `resolve` cho kết mở) |

### Cảnh chuyển ngày và biến thể theo cờ

| Điều kiện | Sprite |
|---|---|
| Chuyển ngày bình thường | `walk` → `stretch` |
| `pm_overloaded` | Chuyển ngày bằng `night_sleep` → `night_wake`; từ Level 2 thay `idle` / `talk` / `walk` bằng `tired_idle` / `tired_talk` / `tired_walk` |
| `team_ot_14_days` | Chuyển ngày bằng `slump` → `lie`; Level 3 dùng bộ `tired_*` |
| Sau incident đã khắc phục | `slump` → `getup` |
| Popup chỉ số tăng / giảm | `good` / `bad` kèm `emo_check` / `emo_cross` |
| HUD 7 chỉ số | `stat_budget`, `stat_progress`, `stat_quality`, `stat_morale`, `stat_client`, `stat_management`, `stat_risk` |
| Avatar mặc định hộp thoại | `pm/portrait` (ô 1 sheet A); đổi theo cảm xúc dùng `pm/face_*` (sheet D) |


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

### Sheet A – Master: chân dung, đứng, đi, chạy, nhảy, ngồi, nằm, cảm xúc

Sheet gốc, bố cục giống ảnh mẫu. Sinh đầu tiên từ ảnh thật; bản được duyệt thành ảnh tham chiếu cho sheet B–E.

File prompt: `prompts/PM_A_master.txt` · Lưới 8×7 · Đính kèm: Ảnh thật

| Ô | Tên | Mô tả |
|---:|---|---|
| 1 | `pm/portrait` | [portrait cell, see LAYOUT] smiling, tablet near the face, a few sparkles |
| 2 | `pm/idle_01` | idle loop 1/4: relaxed stance, tablet held at chest with both hands  [markers: magenta = tablet] |
| 3 | `pm/idle_02` | idle loop 2/4: slight inhale, shoulders a tiny bit higher  [markers: magenta = tablet] |
| 4 | `pm/idle_03` | idle loop 3/4: head tilted very slightly, calm face  [markers: magenta = tablet] |
| 5 | `pm/idle_back_01` | standing seen from behind (back view), tablet in left hand  [markers: magenta = tablet] |
| 6 | `pm/idle_04` | idle loop 4/4: slight exhale, glancing down at the tablet  [markers: magenta = tablet] |
| 7 | `pm/greet_01` | friendly smile with eyes closed, small wave hello |
| 8 | `pm/greet_02` | cheerful open-mouth smile, raising the tablet slightly in greeting  [markers: magenta = tablet] |
| 9 | `pm/walk_01` | walk contact: right foot forward heel touching  [markers: magenta = tablet] |
| 10 | `pm/walk_02` | walk down: weight on right leg, knee bent  [markers: magenta = tablet] |
| 11 | `pm/walk_03` | walk passing: left leg passing the right  [markers: magenta = tablet] |
| 12 | `pm/walk_04` | walk up: rising on right toes  [markers: magenta = tablet] |
| 13 | `pm/walk_05` | walk contact: left foot forward heel touching  [markers: magenta = tablet] |
| 14 | `pm/walk_06` | walk down: weight on left leg, knee bent  [markers: magenta = tablet] |
| 15 | `pm/walk_07` | walk passing: right leg passing the left  [markers: magenta = tablet] |
| 16 | `pm/walk_08` | walk up: rising on left toes  [markers: magenta = tablet] |
| 17 | `pm/run_01` | run contact right foot  [markers: magenta = tablet] |
| 18 | `pm/run_02` | run push-off from right foot  [markers: magenta = tablet] |
| 19 | `pm/run_03` | run airborne, legs apart  [markers: magenta = tablet] |
| 20 | `pm/run_04` | run landing on left foot  [markers: magenta = tablet] |
| 21 | `pm/run_05` | run contact left foot  [markers: magenta = tablet] |
| 22 | `pm/run_06` | run push-off from left foot  [markers: magenta = tablet] |
| 23 | `pm/run_07` | run airborne, legs apart, mirrored  [markers: magenta = tablet] |
| 24 | `pm/run_08` | run landing on right foot  [markers: magenta = tablet] |
| 25 | `pm/jump_01` | jump anticipation: crouching, arms back |
| 26 | `pm/jump_02` | jump take-off: arms swinging up |
| 27 | `pm/jump_03` | jump rising, knees tucked |
| 28 | `pm/jump_04` | jump peak: both arms up, joyful open-mouth smile |
| 29 | `pm/jump_05` | jump falling, arms coming down |
| 30 | `pm/jump_06` | jump landing: knees bent, arms out for balance |
| 31 | `pm/startle_01` | small startled hop off the ground, eyes wide, tablet lifted  [markers: magenta = tablet] |
| 32 | `pm/startle_02` | landing from the startle, hand on chest, sweat drop |
| 33 | `pm/crouch_01` | bending down to pick up dropped papers |
| 34 | `pm/crouch_02` | crouching, gathering papers from the floor  [markers: magenta = papers] |
| 35 | `pm/crouch_03` | rising back up holding the gathered papers  [markers: magenta = papers] |
| 36 | `pm/sit_01` | standing next to the office chair, about to sit |
| 37 | `pm/sit_02` | lowering onto the chair  [markers: cyan = seat] |
| 38 | `pm/sit_03` | seated upright on the chair, tablet on lap  [markers: cyan = seat; magenta = tablet] |
| 39 | `pm/sit_04` | seated relaxed, leaning back  [markers: cyan = seat] |
| 40 | `pm/sit_05` | standing up from the chair, hands on knees pushing up  [markers: cyan = seat] |
| 41 | `pm/slump_01` | sitting on the sofa, exhausted, head tilted back  [markers: cyan = seat] |
| 42 | `pm/slump_02` | sliding sideways down onto the sofa  [markers: cyan = seat] |
| 43 | `pm/lie_01` | lying on the back on the sofa, forearm over the eyes, tablet on stomach  [markers: cyan = seat; magenta = tablet] |
| 44 | `pm/lie_02` | curled up asleep on the sofa, a folded jacket as a pillow, peaceful  [markers: cyan = seat] |
| 45 | `pm/lie_03` | lying face down on the sofa, one arm dangling, drained  [markers: cyan = seat] |
| 46 | `pm/getup_01` | sitting up groggy on the sofa, rubbing one eye  [markers: cyan = seat] |
| 47 | `pm/getup_02` | sitting on the sofa edge, stretching arms  [markers: cyan = seat] |
| 48 | `pm/getup_03` | standing up from the sofa, refreshed and determined  [markers: cyan = seat] |
| 49 | `pm/good_01` | nodding with a smile, two small golden sparkles |
| 50 | `pm/good_02` | small happy fist at the chest, sparkles |
| 51 | `pm/good_03` | content smile, eyes closed, a small pink heart |
| 52 | `pm/bad_01` | wincing, one blue sweat drop |
| 53 | `pm/bad_02` | leaning back, grimacing, small dark swirl |
| 54 | `pm/bad_03` | awkward teeth-clenched grimace, sweat drop |
| 55 | `pm/sigh_01` | worried sigh, rubbing the back of the neck, small grey puff |
| 56 | `pm/sigh_02` | looking down, deflated sigh |

<details><summary>Prompt đầy đủ</summary>

```text
TASK: create a 8x7 chibi pixel-art game sprite sheet of the person in the attached photo, dressed as a young project manager on probation. Sheet content: framed portrait, idle, back view, walk and run cycles, jump, crouch, sitting, lying on a sofa, and emotion reactions.

ATTACHED IMAGE: a photo of a real person. This is the identity source for the character.

IDENTITY: Convert the person in the photo into a game character. Keep them clearly recognizable: face shape, eye shape and eyebrows, nose and mouth character, hairstyle, hair length, hair color and parting, skin tone, and any distinctive features such as glasses, freckles, moles, beard or earrings (if the person wears glasses, keep the same glasses in every cell). Stylize the features into the art style below; do not trace or paste the photo. Ignore the photo's background, lighting, pose, expression and clothing.

OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): a young project manager on probation. Light sky-blue long-sleeve button-up shirt, sleeves rolled to the forearms, top button open, no tie, tucked in; dark navy trousers; brown leather belt; dark brown shoes. An orange lanyard around the neck with a plain orange ID badge card at the chest (blank, no text). Signature prop: a tablet in a teal-green case. It is added later by code, so do NOT draw it (except in the framed portrait cell).

ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style. Big head, about 2.3 to 2.5 heads tall in total; large glossy expressive eyes with highlights; small nose and mouth; soft rounded body and short limbs; clean dark-brown pixel outline (not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; consistent top-left light. Every full-body figure stands on a small soft grey oval shadow. Small cute effect icons (sparkles, hearts, stars, sweat drops, swirl, Zzz, exclamation mark) are drawn next to a figure only where a cell asks for them.

LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly 8 columns x 7 rows = 56 cells, packed like a professional game asset sheet: each figure fills most of its cell but never touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared baseline. Figures face right in a 3/4 view unless a cell says otherwise. Reading order: left to right, top to bottom. Cell 1 (top-left) is special: a head-and-shoulders portrait inside a rounded-square frame with a thin dark outline and a soft pastel-yellow background with a few sparkles, the character smiling and holding the tablet near the face. Cell 1 is the ONLY cell with a background; every other cell is a full-body figure on pure white.

OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites that will be placed by code. Wherever a cell mentions a tablet, phone, folder, paper, contract, notebook, pen, mug, marker, clicker, laptop, checklist, card, badge held in the hand, cardboard box, chair, sofa, desk, table, whiteboard, lamp or mugs, do NOT draw that object. Instead draw the empty hand(s) in the exact grip pose as if holding it, and the body sitting or lying at the correct height as if on the invisible furniture. Keep the worn lanyard badge and any worn headset as part of the character. MARKER DOTS: small solid round dots about 1.5% of the cell width, flat color, no outline, no shading, drawn on top of the character. MAGENTA #FF00FF = grip point of the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = grip point of a second object held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they touch the seat) for sitting or lying poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no dots. Never use these three colors anywhere else.

CELLS:
Row 1 - Portrait + idle: (1) [portrait cell, see LAYOUT] smiling, tablet near the face, a few sparkles; (2) idle loop 1/4: relaxed stance, tablet held at chest with both hands  [markers: magenta = tablet]; (3) idle loop 2/4: slight inhale, shoulders a tiny bit higher  [markers: magenta = tablet]; (4) idle loop 3/4: head tilted very slightly, calm face  [markers: magenta = tablet]; (5) standing seen from behind (back view), tablet in left hand  [markers: magenta = tablet]; (6) idle loop 4/4: slight exhale, glancing down at the tablet  [markers: magenta = tablet]; (7) friendly smile with eyes closed, small wave hello; (8) cheerful open-mouth smile, raising the tablet slightly in greeting  [markers: magenta = tablet].
Row 2 - Walk cycle 8 frames, tablet tucked under left arm, right arm swings: (9) walk contact: right foot forward heel touching  [markers: magenta = tablet]; (10) walk down: weight on right leg, knee bent  [markers: magenta = tablet]; (11) walk passing: left leg passing the right  [markers: magenta = tablet]; (12) walk up: rising on right toes  [markers: magenta = tablet]; (13) walk contact: left foot forward heel touching  [markers: magenta = tablet]; (14) walk down: weight on left leg, knee bent  [markers: magenta = tablet]; (15) walk passing: right leg passing the left  [markers: magenta = tablet]; (16) walk up: rising on left toes  [markers: magenta = tablet].
Row 3 - Run cycle 8 frames, hurried office run, leaning forward, tablet clutched to chest, urgent face: (17) run contact right foot  [markers: magenta = tablet]; (18) run push-off from right foot  [markers: magenta = tablet]; (19) run airborne, legs apart  [markers: magenta = tablet]; (20) run landing on left foot  [markers: magenta = tablet]; (21) run contact left foot  [markers: magenta = tablet]; (22) run push-off from left foot  [markers: magenta = tablet]; (23) run airborne, legs apart, mirrored  [markers: magenta = tablet]; (24) run landing on right foot  [markers: magenta = tablet].
Row 4 - Jump + startle: (25) jump anticipation: crouching, arms back; (26) jump take-off: arms swinging up; (27) jump rising, knees tucked; (28) jump peak: both arms up, joyful open-mouth smile; (29) jump falling, arms coming down; (30) jump landing: knees bent, arms out for balance; (31) small startled hop off the ground, eyes wide, tablet lifted  [markers: magenta = tablet]; (32) landing from the startle, hand on chest, sweat drop.
Row 5 - Crouch + sit (the office chair is invisible: sit on nothing at chair height, same seat height in every sit cell): (33) bending down to pick up dropped papers; (34) crouching, gathering papers from the floor  [markers: magenta = papers]; (35) rising back up holding the gathered papers  [markers: magenta = papers]; (36) standing next to the office chair, about to sit; (37) lowering onto the chair  [markers: cyan = seat]; (38) seated upright on the chair, tablet on lap  [markers: cyan = seat; magenta = tablet]; (39) seated relaxed, leaning back  [markers: cyan = seat]; (40) standing up from the chair, hands on knees pushing up  [markers: cyan = seat].
Row 6 - Slump / lie (the two-seat sofa is invisible: the body rests on nothing at sofa height, same height in every cell): (41) sitting on the sofa, exhausted, head tilted back  [markers: cyan = seat]; (42) sliding sideways down onto the sofa  [markers: cyan = seat]; (43) lying on the back on the sofa, forearm over the eyes, tablet on stomach  [markers: cyan = seat; magenta = tablet]; (44) curled up asleep on the sofa, a folded jacket as a pillow, peaceful  [markers: cyan = seat]; (45) lying face down on the sofa, one arm dangling, drained  [markers: cyan = seat]; (46) sitting up groggy on the sofa, rubbing one eye  [markers: cyan = seat]; (47) sitting on the sofa edge, stretching arms  [markers: cyan = seat]; (48) standing up from the sofa, refreshed and determined  [markers: cyan = seat].
Row 7 - Full-body emotions with small effect icons: (49) nodding with a smile, two small golden sparkles; (50) small happy fist at the chest, sparkles; (51) content smile, eyes closed, a small pink heart; (52) wincing, one blue sweat drop; (53) leaning back, grimacing, small dark swirl; (54) awkward teeth-clenched grimace, sweat drop; (55) worried sigh, rubbing the back of the neck, small grey puff; (56) looking down, deflated sigh.

DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw grid lines or cell borders (except the frame of the portrait cell); add scenery, floor or walls; add extra characters; crop limbs; repeat an identical pose; change the face, hair, outfit colors or proportions between cells; use pure white for clothing edges that touch the background.
```

</details>

### Sheet B – Cầm nắm + cử chỉ tay chân

Tablet, tài liệu, điện thoại, cà phê, bắt tay; nói, đếm phương án, gật/lắc, chặn, cổ vũ, xin lỗi, khiển trách, suy nghĩ, stress, động viên.

File prompt: `prompts/PM_B_hands_gestures.txt` · Lưới 8×7 · Đính kèm: Ảnh thật + sheet A

| Ô | Tên | Mô tả |
|---:|---|---|
| 1 | `pm/tab_hold_01` | holding the tablet with both hands at chest, looking at the viewer  [markers: magenta = tablet] |
| 2 | `pm/tab_read_01` | looking down reading the tablet, thumb scrolling  [markers: magenta = tablet] |
| 3 | `pm/tab_read_02` | reading the tablet, eyebrows slightly raised  [markers: magenta = tablet] |
| 4 | `pm/tab_present_01` | turning the tablet screen outward to the right to show someone, confident  [markers: magenta = tablet] |
| 5 | `pm/tab_present_02` | tablet held outward, other index finger pointing at the screen  [markers: magenta = tablet] |
| 6 | `pm/tab_present_03` | tablet held outward, other hand open palm explaining  [markers: magenta = tablet] |
| 7 | `pm/tab_swipe_01` | swiping on the tablet screen with the index finger  [markers: magenta = tablet] |
| 8 | `pm/tab_tuck_01` | tablet tucked under the left arm, right hand relaxed  [markers: magenta = tablet] |
| 9 | `pm/doc_carry_01` | carrying a navy document folder against the chest  [markers: magenta = folder] |
| 10 | `pm/doc_give_01` | extending the folder forward with both hands, handing it over  [markers: magenta = folder] |
| 11 | `pm/doc_give_02` | arms still extended after releasing the folder, polite smile |
| 12 | `pm/doc_receive_01` | receiving a folder with both hands, slight bow  [markers: magenta = folder] |
| 13 | `pm/doc_raise_01` | holding a printed contract raised in one hand, firm expression  [markers: magenta = contract] |
| 14 | `pm/doc_raise_02` | pointing at a line on the raised contract with the other hand  [markers: magenta = contract] |
| 15 | `pm/doc_flip_01` | reading an open document, turning a page  [markers: magenta = folder] |
| 16 | `pm/doc_flip_02` | reading an open document, page turned, focused  [markers: magenta = folder] |
| 17 | `pm/phone_call_01` | phone at right ear, left hand writing in a small notebook  [markers: magenta = phone; green = notebook] |
| 18 | `pm/phone_call_02` | phone at ear, speaking seriously, free hand gesturing  [markers: magenta = phone] |
| 19 | `pm/phone_read_01` | looking at the phone screen, neutral  [markers: magenta = phone] |
| 20 | `pm/phone_read_02` | looking at the phone screen, shocked, eyebrows raised  [markers: magenta = phone] |
| 21 | `pm/coffee_01` | holding a coffee mug with both hands, steam rising  [markers: magenta = mug] |
| 22 | `pm/coffee_02` | sipping from the mug, eyes closed  [markers: magenta = mug] |
| 23 | `pm/shake_01` | extending the right hand for a handshake, friendly smile, slight bow |
| 24 | `pm/shake_02` | mid handshake pose, hand further out, tablet in the other hand  [markers: green = tablet] |
| 25 | `pm/talk_01` | talking, right palm open upward |
| 26 | `pm/talk_02` | talking, hand moving mid-gesture |
| 27 | `pm/count_01` | holding up one finger, explaining option one |
| 28 | `pm/count_02` | holding up two fingers |
| 29 | `pm/count_03` | holding up three fingers |
| 30 | `pm/nod_01` | nodding down while listening, notebook in hand  [markers: magenta = notebook] |
| 31 | `pm/nod_02` | head back up after nodding, slight smile |
| 32 | `pm/headshake_01` | politely shaking head no, eyes closed |
| 33 | `pm/stop_01` | firm stop gesture, right palm raised forward, serious |
| 34 | `pm/stop_02` | both palms raised, calm but firm |
| 35 | `pm/thumbs_01` | thumbs up, big smile |
| 36 | `pm/rally_01` | one fist raised energetically, motivating the team |
| 37 | `pm/rally_02` | both fists pumped, determined |
| 38 | `pm/goahead_01` | casual forward wave, 'go ahead' gesture |
| 39 | `pm/goahead_02` | relaxed shrug with palms up, 'it's fine' |
| 40 | `pm/clap_01` | clapping hands, pleased |
| 41 | `pm/bow_01` | slight polite apologetic bow, right hand on chest |
| 42 | `pm/bow_02` | deeper apologetic bow, both hands clasped in front |
| 43 | `pm/crossarms_01` | arms crossed holding a folder, defensive  [markers: magenta = folder] |
| 44 | `pm/scold_01` | pointing a finger forward, stern frown |
| 45 | `pm/scold_02` | hands on hips, disappointed and stern |
| 46 | `pm/facepalm_01` | facepalm, eyes closed |
| 47 | `pm/scratch_01` | scratching the back of the head, awkward embarrassed smile |
| 48 | `pm/shrug_01` | shrugging, uncertain |
| 49 | `pm/think_01` | hand on chin, looking up, thinking |
| 50 | `pm/think_02` | arms folded, index finger tapping the chin |
| 51 | `pm/stress_01` | rubbing temples with both hands, stressed |
| 52 | `pm/stress_02` | both hands on the head, overwhelmed |
| 53 | `pm/confident_01` | hands on hips, chin up, confident smile |
| 54 | `pm/stretch_01` | stretching both arms overhead |
| 55 | `pm/stretch_02` | twisting the torso to stretch, relieved |
| 56 | `pm/coach_01` | right arm reaching out sideways at shoulder height as if resting the hand on a shorter colleague's shoulder, warm encouraging smile |

<details><summary>Prompt đầy đủ</summary>

```text
TASK: create a 8x7 chibi pixel-art game sprite sheet of the person in the attached photo, dressed as a young project manager on probation. Sheet content: holding and using a tablet, documents, phone, coffee, handshake, and talking, counting, nodding, stop, cheering, apologizing, scolding, thinking and coaching gestures.

ATTACHED IMAGES: Image 1 is a photo of a real person (identity source). Image 2 is the approved master sprite sheet of this same character (Sheet A). Match Image 2 exactly: same chibi proportions, face, hair, outfit, colors, outline and shading style, and the same sprite size.

IDENTITY: Convert the person in the photo into a game character. Keep them clearly recognizable: face shape, eye shape and eyebrows, nose and mouth character, hairstyle, hair length, hair color and parting, skin tone, and any distinctive features such as glasses, freckles, moles, beard or earrings (if the person wears glasses, keep the same glasses in every cell). Stylize the features into the art style below; do not trace or paste the photo. Ignore the photo's background, lighting, pose, expression and clothing.

OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): a young project manager on probation. Light sky-blue long-sleeve button-up shirt, sleeves rolled to the forearms, top button open, no tie, tucked in; dark navy trousers; brown leather belt; dark brown shoes. An orange lanyard around the neck with a plain orange ID badge card at the chest (blank, no text). Signature prop: a tablet in a teal-green case. It is added later by code, so do NOT draw it (except in the framed portrait cell).

ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style. Big head, about 2.3 to 2.5 heads tall in total; large glossy expressive eyes with highlights; small nose and mouth; soft rounded body and short limbs; clean dark-brown pixel outline (not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; consistent top-left light. Every full-body figure stands on a small soft grey oval shadow. Small cute effect icons (sparkles, hearts, stars, sweat drops, swirl, Zzz, exclamation mark) are drawn next to a figure only where a cell asks for them.

LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly 8 columns x 7 rows = 56 cells, packed like a professional game asset sheet: each figure fills most of its cell but never touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared baseline. Figures face right in a 3/4 view unless a cell says otherwise. Reading order: left to right, top to bottom. 

OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites that will be placed by code. Wherever a cell mentions a tablet, phone, folder, paper, contract, notebook, pen, mug, marker, clicker, laptop, checklist, card, badge held in the hand, cardboard box, chair, sofa, desk, table, whiteboard, lamp or mugs, do NOT draw that object. Instead draw the empty hand(s) in the exact grip pose as if holding it, and the body sitting or lying at the correct height as if on the invisible furniture. Keep the worn lanyard badge and any worn headset as part of the character. MARKER DOTS: small solid round dots about 1.5% of the cell width, flat color, no outline, no shading, drawn on top of the character. MAGENTA #FF00FF = grip point of the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = grip point of a second object held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they touch the seat) for sitting or lying poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no dots. Never use these three colors anywhere else.

CELLS:
Row 1 - Tablet: (1) holding the tablet with both hands at chest, looking at the viewer  [markers: magenta = tablet]; (2) looking down reading the tablet, thumb scrolling  [markers: magenta = tablet]; (3) reading the tablet, eyebrows slightly raised  [markers: magenta = tablet]; (4) turning the tablet screen outward to the right to show someone, confident  [markers: magenta = tablet]; (5) tablet held outward, other index finger pointing at the screen  [markers: magenta = tablet]; (6) tablet held outward, other hand open palm explaining  [markers: magenta = tablet]; (7) swiping on the tablet screen with the index finger  [markers: magenta = tablet]; (8) tablet tucked under the left arm, right hand relaxed  [markers: magenta = tablet].
Row 2 - Documents: (9) carrying a navy document folder against the chest  [markers: magenta = folder]; (10) extending the folder forward with both hands, handing it over  [markers: magenta = folder]; (11) arms still extended after releasing the folder, polite smile; (12) receiving a folder with both hands, slight bow  [markers: magenta = folder]; (13) holding a printed contract raised in one hand, firm expression  [markers: magenta = contract]; (14) pointing at a line on the raised contract with the other hand  [markers: magenta = contract]; (15) reading an open document, turning a page  [markers: magenta = folder]; (16) reading an open document, page turned, focused  [markers: magenta = folder].
Row 3 - Phone, coffee, handshake: (17) phone at right ear, left hand writing in a small notebook  [markers: magenta = phone; green = notebook]; (18) phone at ear, speaking seriously, free hand gesturing  [markers: magenta = phone]; (19) looking at the phone screen, neutral  [markers: magenta = phone]; (20) looking at the phone screen, shocked, eyebrows raised  [markers: magenta = phone]; (21) holding a coffee mug with both hands, steam rising  [markers: magenta = mug]; (22) sipping from the mug, eyes closed  [markers: magenta = mug]; (23) extending the right hand for a handshake, friendly smile, slight bow; (24) mid handshake pose, hand further out, tablet in the other hand  [markers: green = tablet].
Row 4 - Talking: (25) talking, right palm open upward; (26) talking, hand moving mid-gesture; (27) holding up one finger, explaining option one; (28) holding up two fingers; (29) holding up three fingers; (30) nodding down while listening, notebook in hand  [markers: magenta = notebook]; (31) head back up after nodding, slight smile; (32) politely shaking head no, eyes closed.
Row 5 - Assertive / supportive: (33) firm stop gesture, right palm raised forward, serious; (34) both palms raised, calm but firm; (35) thumbs up, big smile; (36) one fist raised energetically, motivating the team; (37) both fists pumped, determined; (38) casual forward wave, 'go ahead' gesture; (39) relaxed shrug with palms up, 'it's fine'; (40) clapping hands, pleased.
Row 6 - Apology / defensive / stern: (41) slight polite apologetic bow, right hand on chest; (42) deeper apologetic bow, both hands clasped in front; (43) arms crossed holding a folder, defensive  [markers: magenta = folder]; (44) pointing a finger forward, stern frown; (45) hands on hips, disappointed and stern; (46) facepalm, eyes closed; (47) scratching the back of the head, awkward embarrassed smile; (48) shrugging, uncertain.
Row 7 - Thinking / stress / confidence / coaching: (49) hand on chin, looking up, thinking; (50) arms folded, index finger tapping the chin; (51) rubbing temples with both hands, stressed; (52) both hands on the head, overwhelmed; (53) hands on hips, chin up, confident smile; (54) stretching both arms overhead; (55) twisting the torso to stretch, relieved; (56) right arm reaching out sideways at shoulder height as if resting the hand on a shorter colleague's shoulder, warm encouraging smile.

DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw grid lines or cell borders (except the frame of the portrait cell); add scenery, floor or walls; add extra characters; crop limbs; repeat an identical pose; change the face, hair, outfit colors or proportions between cells; use pure white for clothing edges that touch the background.
```

</details>

### Sheet C – Bàn làm việc, OT, 1-1, bàn họp, bảng trắng, sự cố

Các cảnh làm việc theo kịch bản: làm ngày/đêm, họp 1-1, họp bàn tròn với khách, review bảng trắng, incident, rollback, giao việc.

File prompt: `prompts/PM_C_work_scenes.txt` · Lưới 8×7 · Đính kèm: Ảnh thật + sheet A

| Ô | Tên | Mô tả |
|---:|---|---|
| 1 | `pm/desk_type_01` | seated at the desk typing, focused  [markers: cyan = seat] |
| 2 | `pm/desk_type_02` | typing, slightly different hand position  [markers: cyan = seat] |
| 3 | `pm/desk_read_01` | reading the monitor, hand on the mouse  [markers: cyan = seat] |
| 4 | `pm/desk_note_01` | writing in a notebook at the desk  [markers: cyan = seat; magenta = notebook] |
| 5 | `pm/desk_stand_01` | pushing the chair back, starting to stand  [markers: cyan = seat] |
| 6 | `pm/desk_stand_02` | standing beside the desk holding the tablet  [markers: magenta = tablet] |
| 7 | `pm/meet_note_01` | seated on a meeting chair without desk, taking notes, listening  [markers: cyan = seat; magenta = notebook] |
| 8 | `pm/meet_note_02` | seated on a meeting chair, looking up from the notes  [markers: cyan = seat; magenta = notebook] |
| 9 | `pm/night_type_01` | typing late at night, tired eyes  [markers: cyan = seat] |
| 10 | `pm/night_type_02` | typing, head drooping slightly  [markers: cyan = seat] |
| 11 | `pm/night_rub_01` | rubbing eyes with one hand  [markers: cyan = seat] |
| 12 | `pm/night_yawn_01` | big yawn  [markers: cyan = seat] |
| 13 | `pm/night_sleep_01` | asleep with the head on folded arms on the desk  [markers: cyan = seat] |
| 14 | `pm/night_sleep_02` | asleep, slightly different breathing pose  [markers: cyan = seat] |
| 15 | `pm/night_wake_01` | jolting awake, eyes wide  [markers: cyan = seat] |
| 16 | `pm/night_wake_02` | looking at the monitor again, tired but determined  [markers: cyan = seat] |
| 17 | `pm/oneone_talk_01` | seated, leaning forward, talking sincerely with open hands  [markers: cyan = seat] |
| 18 | `pm/oneone_talk_02` | seated, leaning forward, one hand explaining  [markers: cyan = seat] |
| 19 | `pm/oneone_listen_01` | seated, listening attentively, notebook on knee  [markers: cyan = seat; magenta = notebook] |
| 20 | `pm/oneone_listen_02` | seated, nodding while listening  [markers: cyan = seat] |
| 21 | `pm/oneone_show_01` | seated, showing the tablet screen forward  [markers: cyan = seat; magenta = tablet] |
| 22 | `pm/oneone_show_02` | seated, pointing at the tablet  [markers: cyan = seat; magenta = tablet] |
| 23 | `pm/oneone_worry_01` | seated, hands clasped, worried  [markers: cyan = seat] |
| 24 | `pm/oneone_worry_02` | seated, looking down, sighing  [markers: cyan = seat] |
| 25 | `pm/meet_table_talk_01` | seated at the table, talking with an open hand  [markers: cyan = seat] |
| 26 | `pm/meet_table_talk_02` | seated, explaining, leaning in  [markers: cyan = seat] |
| 27 | `pm/meet_table_listen_01` | seated, listening, notebook on the table  [markers: cyan = seat] |
| 28 | `pm/meet_table_listen_02` | seated, writing notes while listening  [markers: cyan = seat; magenta = pen] |
| 29 | `pm/meet_table_present_01` | seated, turning the tablet toward the other side of the table  [markers: cyan = seat; magenta = tablet] |
| 30 | `pm/meet_table_present_02` | seated, pointing at the tablet on the table  [markers: cyan = seat] |
| 31 | `pm/meet_table_worry_01` | seated, hands clasped on the table, worried  [markers: cyan = seat] |
| 32 | `pm/meet_table_agree_01` | seated, nodding with a relieved smile  [markers: cyan = seat] |
| 33 | `pm/wb_write_01` | writing on the whiteboard with a marker, arm raised  [markers: magenta = marker] |
| 34 | `pm/wb_write_02` | writing, arm lower  [markers: magenta = marker] |
| 35 | `pm/wb_write_03` | drawing an arrow between boxes  [markers: magenta = marker] |
| 36 | `pm/wb_point_01` | pointing at a box on the diagram |
| 37 | `pm/wb_point_02` | tapping the diagram with the marker  [markers: magenta = marker] |
| 38 | `pm/wb_explain_01` | turned 3/4 toward the viewer explaining, marker in hand  [markers: magenta = marker] |
| 39 | `pm/wb_explain_02` | explaining with an open palm |
| 40 | `pm/wb_cap_01` | capping the marker, satisfied smile  [markers: magenta = marker] |
| 41 | `pm/alert_01` | phone buzzing in hand, startled, sweat drop  [markers: magenta = phone] |
| 42 | `pm/alert_02` | staring at the phone in alarm  [markers: magenta = phone] |
| 43 | `pm/command_01` | pointing left while giving urgent instructions |
| 44 | `pm/command_02` | pointing right, urgent |
| 45 | `pm/command_03` | both arms directing calmly, in control |
| 46 | `pm/headset_01` | wearing a small headset, speaking, one hand on the earpiece |
| 47 | `pm/headset_02` | headset on, typing on the tablet while talking  [markers: magenta = tablet] |
| 48 | `pm/relief_01` | exhaling in relief, shoulders dropped, hand on chest |
| 49 | `pm/rollback_01` | typing fast on an open laptop balanced on the left forearm, intense focus  [markers: magenta = laptop] |
| 50 | `pm/rollback_02` | typing fast, eyes narrowed  [markers: magenta = laptop] |
| 51 | `pm/rollback_03` | pressing enter decisively  [markers: magenta = laptop] |
| 52 | `pm/rollback_04` | small victory fist, laptop in the other hand  [markers: green = laptop] |
| 53 | `pm/delegate_01` | handing a task card to someone offscreen right, pointing with the other hand  [markers: magenta = card] |
| 54 | `pm/delegate_02` | confident nod after assigning the task |
| 55 | `pm/checklist_01` | holding out a printed checklist sheet toward someone  [markers: magenta = checklist] |
| 56 | `pm/checklist_02` | tapping the checklist with a finger, encouraging  [markers: magenta = checklist] |

<details><summary>Prompt đầy đủ</summary>

```text
TASK: create a 8x7 chibi pixel-art game sprite sheet of the person in the attached photo, dressed as a young project manager on probation. Sheet content: working at a desk by day and overtime at night, one-on-one talks, meeting-table talks, whiteboard review, production incident handling, rollback on a laptop, and delegating.

ATTACHED IMAGES: Image 1 is a photo of a real person (identity source). Image 2 is the approved master sprite sheet of this same character (Sheet A). Match Image 2 exactly: same chibi proportions, face, hair, outfit, colors, outline and shading style, and the same sprite size.

IDENTITY: Convert the person in the photo into a game character. Keep them clearly recognizable: face shape, eye shape and eyebrows, nose and mouth character, hairstyle, hair length, hair color and parting, skin tone, and any distinctive features such as glasses, freckles, moles, beard or earrings (if the person wears glasses, keep the same glasses in every cell). Stylize the features into the art style below; do not trace or paste the photo. Ignore the photo's background, lighting, pose, expression and clothing.

OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): a young project manager on probation. Light sky-blue long-sleeve button-up shirt, sleeves rolled to the forearms, top button open, no tie, tucked in; dark navy trousers; brown leather belt; dark brown shoes. An orange lanyard around the neck with a plain orange ID badge card at the chest (blank, no text). Signature prop: a tablet in a teal-green case. It is added later by code, so do NOT draw it (except in the framed portrait cell).

ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style. Big head, about 2.3 to 2.5 heads tall in total; large glossy expressive eyes with highlights; small nose and mouth; soft rounded body and short limbs; clean dark-brown pixel outline (not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; consistent top-left light. Every full-body figure stands on a small soft grey oval shadow. Small cute effect icons (sparkles, hearts, stars, sweat drops, swirl, Zzz, exclamation mark) are drawn next to a figure only where a cell asks for them.

LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly 8 columns x 7 rows = 56 cells, packed like a professional game asset sheet: each figure fills most of its cell but never touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared baseline. Figures face right in a 3/4 view unless a cell says otherwise. Reading order: left to right, top to bottom. 

OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites that will be placed by code. Wherever a cell mentions a tablet, phone, folder, paper, contract, notebook, pen, mug, marker, clicker, laptop, checklist, card, badge held in the hand, cardboard box, chair, sofa, desk, table, whiteboard, lamp or mugs, do NOT draw that object. Instead draw the empty hand(s) in the exact grip pose as if holding it, and the body sitting or lying at the correct height as if on the invisible furniture. Keep the worn lanyard badge and any worn headset as part of the character. MARKER DOTS: small solid round dots about 1.5% of the cell width, flat color, no outline, no shading, drawn on top of the character. MAGENTA #FF00FF = grip point of the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = grip point of a second object held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they touch the seat) for sitting or lying poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no dots. Never use these three colors anywhere else.

CELLS:
Row 1 - Day desk (desk, monitor and chair are invisible; the desk would be on the right; seated at desk height, same seat height in every cell): (1) seated at the desk typing, focused  [markers: cyan = seat]; (2) typing, slightly different hand position  [markers: cyan = seat]; (3) reading the monitor, hand on the mouse  [markers: cyan = seat]; (4) writing in a notebook at the desk  [markers: cyan = seat; magenta = notebook]; (5) pushing the chair back, starting to stand  [markers: cyan = seat]; (6) standing beside the desk holding the tablet  [markers: magenta = tablet]; (7) seated on a meeting chair without desk, taking notes, listening  [markers: cyan = seat; magenta = notebook]; (8) seated on a meeting chair, looking up from the notes  [markers: cyan = seat; magenta = notebook].
Row 2 - Night overtime (desk, lamp, mugs and chair are invisible; warm lamp light from the right on the character only; background stays pure white): (9) typing late at night, tired eyes  [markers: cyan = seat]; (10) typing, head drooping slightly  [markers: cyan = seat]; (11) rubbing eyes with one hand  [markers: cyan = seat]; (12) big yawn  [markers: cyan = seat]; (13) asleep with the head on folded arms on the desk  [markers: cyan = seat]; (14) asleep, slightly different breathing pose  [markers: cyan = seat]; (15) jolting awake, eyes wide  [markers: cyan = seat]; (16) looking at the monitor again, tired but determined  [markers: cyan = seat].
Row 3 - One-on-one: seated on an invisible chair, no table: (17) seated, leaning forward, talking sincerely with open hands  [markers: cyan = seat]; (18) seated, leaning forward, one hand explaining  [markers: cyan = seat]; (19) seated, listening attentively, notebook on knee  [markers: cyan = seat; magenta = notebook]; (20) seated, nodding while listening  [markers: cyan = seat]; (21) seated, showing the tablet screen forward  [markers: cyan = seat; magenta = tablet]; (22) seated, pointing at the tablet  [markers: cyan = seat; magenta = tablet]; (23) seated, hands clasped, worried  [markers: cyan = seat]; (24) seated, looking down, sighing  [markers: cyan = seat].
Row 4 - Seated at an invisible round meeting table on the right (chair and table invisible, same seat height in every cell): (25) seated at the table, talking with an open hand  [markers: cyan = seat]; (26) seated, explaining, leaning in  [markers: cyan = seat]; (27) seated, listening, notebook on the table  [markers: cyan = seat]; (28) seated, writing notes while listening  [markers: cyan = seat; magenta = pen]; (29) seated, turning the tablet toward the other side of the table  [markers: cyan = seat; magenta = tablet]; (30) seated, pointing at the tablet on the table  [markers: cyan = seat]; (31) seated, hands clasped on the table, worried  [markers: cyan = seat]; (32) seated, nodding with a relieved smile  [markers: cyan = seat].
Row 5 - Whiteboard (the whiteboard is invisible and stands on the right; the arm reaches toward it): (33) writing on the whiteboard with a marker, arm raised  [markers: magenta = marker]; (34) writing, arm lower  [markers: magenta = marker]; (35) drawing an arrow between boxes  [markers: magenta = marker]; (36) pointing at a box on the diagram; (37) tapping the diagram with the marker  [markers: magenta = marker]; (38) turned 3/4 toward the viewer explaining, marker in hand  [markers: magenta = marker]; (39) explaining with an open palm; (40) capping the marker, satisfied smile  [markers: magenta = marker].
Row 6 - Incident: (41) phone buzzing in hand, startled, sweat drop  [markers: magenta = phone]; (42) staring at the phone in alarm  [markers: magenta = phone]; (43) pointing left while giving urgent instructions; (44) pointing right, urgent; (45) both arms directing calmly, in control; (46) wearing a small headset, speaking, one hand on the earpiece; (47) headset on, typing on the tablet while talking  [markers: magenta = tablet]; (48) exhaling in relief, shoulders dropped, hand on chest.
Row 7 - Rollback + delegate: (49) typing fast on an open laptop balanced on the left forearm, intense focus  [markers: magenta = laptop]; (50) typing fast, eyes narrowed  [markers: magenta = laptop]; (51) pressing enter decisively  [markers: magenta = laptop]; (52) small victory fist, laptop in the other hand  [markers: green = laptop]; (53) handing a task card to someone offscreen right, pointing with the other hand  [markers: magenta = card]; (54) confident nod after assigning the task; (55) holding out a printed checklist sheet toward someone  [markers: magenta = checklist]; (56) tapping the checklist with a finger, encouraging  [markers: magenta = checklist].

DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw grid lines or cell borders (except the frame of the portrait cell); add scenery, floor or walls; add extra characters; crop limbs; repeat an identical pose; change the face, hair, outfit colors or proportions between cells; use pure white for clothing edges that touch the background.
```

</details>

### Sheet D – 20 chân dung cảm xúc cho hộp thoại

Avatar hộp thoại, đổi theo field emotion. Cùng khung bo góc nền vàng pastel như ô 1 của sheet A.

File prompt: `prompts/PM_D_portraits.txt` · Lưới 4×5 · Đính kèm: Ảnh thật + sheet A

| Ô | Tên | Mô tả |
|---:|---|---|
| 1 | `pm/face_neutral` | neutral, calm |
| 2 | `pm/face_confident` | confident smile |
| 3 | `pm/face_serious` | serious, focused |
| 4 | `pm/face_worried` | worried, eyebrows up |
| 5 | `pm/face_surprised` | surprised, mouth open |
| 6 | `pm/face_happy` | happy, bright smile |
| 7 | `pm/face_apologetic` | apologetic, awkward smile, eyebrows tilted |
| 8 | `pm/face_stressed` | stressed, gritted teeth, sweat drop |
| 9 | `pm/face_stern` | stern, frowning |
| 10 | `pm/face_sad` | sad, looking down |
| 11 | `pm/face_proud` | proud, chin up |
| 12 | `pm/face_thinking` | thinking, eyes up, hand on chin |
| 13 | `pm/face_relieved` | relieved, eyes closed, soft smile |
| 14 | `pm/face_determined` | determined, fist near chin |
| 15 | `pm/face_exhausted` | exhausted, dark circles, messy hair |
| 16 | `pm/face_embarrassed` | embarrassed, blushing, scratching cheek |
| 17 | `pm/face_formal_neutral` | wearing the charcoal-navy blazer, composed |
| 18 | `pm/face_formal_confident` | wearing the blazer, confident smile |
| 19 | `pm/face_pm_happy` | orange badge replaced by a royal-blue lanyard and blue badge, happy |
| 20 | `pm/face_pm_proud` | royal-blue lanyard and badge, proud smile |

<details><summary>Prompt đầy đủ</summary>

```text
TASK: create a 4x5 chibi pixel-art game portrait sheet (head-and-shoulders, framed) of the person in the attached photo, dressed as a young project manager on probation. Sheet content: 20 framed facial-expression portraits for a dialogue box.

ATTACHED IMAGES: Image 1 is a photo of a real person (identity source). Image 2 is the approved master sprite sheet of this same character (Sheet A). Match Image 2 exactly: same chibi proportions, face, hair, outfit, colors, outline and shading style, and the same sprite size.

IDENTITY: Convert the person in the photo into a game character. Keep them clearly recognizable: face shape, eye shape and eyebrows, nose and mouth character, hairstyle, hair length, hair color and parting, skin tone, and any distinctive features such as glasses, freckles, moles, beard or earrings (if the person wears glasses, keep the same glasses in every cell). Stylize the features into the art style below; do not trace or paste the photo. Ignore the photo's background, lighting, pose, expression and clothing.

OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): a young project manager on probation. Light sky-blue long-sleeve button-up shirt, sleeves rolled to the forearms, top button open, no tie, tucked in; dark navy trousers; brown leather belt; dark brown shoes. An orange lanyard around the neck with a plain orange ID badge card at the chest (blank, no text). Signature prop: a tablet in a teal-green case. It is added later by code, so do NOT draw it (except in the framed portrait cell).

ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style. Big head, about 2.3 to 2.5 heads tall in total; large glossy expressive eyes with highlights; small nose and mouth; soft rounded body and short limbs; clean dark-brown pixel outline (not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; consistent top-left light. Every full-body figure stands on a small soft grey oval shadow. Small cute effect icons (sparkles, hearts, stars, sweat drops, swirl, Zzz, exclamation mark) are drawn next to a figure only where a cell asks for them.

LAYOUT: portrait sheet, square 1:1, pure white background outside the frames. Exactly 4 columns x 5 rows = 20 cells. Every cell is a head-and-shoulders portrait of the same character inside a rounded-square frame with a thin dark outline and a soft pastel-yellow background, identical frame size and crop in every cell, exactly like the portrait in cell 1 of the master sheet. Character faces the viewer, turned slightly right, hands empty. Frames never touch. Reading order left to right, top to bottom.

EXPRESSIONS:
Row 1: (1) neutral, calm; (2) confident smile; (3) serious, focused; (4) worried, eyebrows up.
Row 2: (5) surprised, mouth open; (6) happy, bright smile; (7) apologetic, awkward smile, eyebrows tilted; (8) stressed, gritted teeth, sweat drop.
Row 3: (9) stern, frowning; (10) sad, looking down; (11) proud, chin up; (12) thinking, eyes up, hand on chin.
Row 4: (13) relieved, eyes closed, soft smile; (14) determined, fist near chin; (15) exhausted, dark circles, messy hair; (16) embarrassed, blushing, scratching cheek.
Row 5: (17) wearing the charcoal-navy blazer, composed; (18) wearing the blazer, confident smile; (19) orange badge replaced by a royal-blue lanyard and blue badge, happy; (20) royal-blue lanyard and badge, proud smile.

DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw grid lines or cell borders (except the frame of the portrait cell); add scenery, floor or walls; add extra characters; crop limbs; repeat an identical pose; change the face, hair, outfit colors or proportions between cells; use pure white for clothing edges that touch the background.
```

</details>

### Sheet E – Final Review (blazer), kết thúc campaign, biến thể kiệt sức

Level 4 Final Review, 4 kết thúc, và bộ tired dùng khi có cờ pm_overloaded / team_ot_14_days.

File prompt: `prompts/PM_E_review_endings_tired.txt` · Lưới 8×7 · Đính kèm: Ảnh thật + sheet A

| Ô | Tên | Mô tả |
|---:|---|---|
| 1 | `pm/formal_walk_01` | walk contact right foot, tablet under left arm  [markers: magenta = tablet] |
| 2 | `pm/formal_walk_02` | walk down  [markers: magenta = tablet] |
| 3 | `pm/formal_walk_03` | walk passing  [markers: magenta = tablet] |
| 4 | `pm/formal_walk_04` | walk up  [markers: magenta = tablet] |
| 5 | `pm/formal_walk_05` | walk contact left foot  [markers: magenta = tablet] |
| 6 | `pm/formal_walk_06` | walk down  [markers: magenta = tablet] |
| 7 | `pm/formal_walk_07` | walk passing  [markers: magenta = tablet] |
| 8 | `pm/formal_walk_08` | walk up  [markers: magenta = tablet] |
| 9 | `pm/present_01` | standing with a clicker in the right hand, speaking  [markers: magenta = clicker] |
| 10 | `pm/present_02` | pressing the clicker  [markers: magenta = clicker] |
| 11 | `pm/present_03` | pointing to the right toward the screen  [markers: magenta = clicker] |
| 12 | `pm/present_04` | turned toward the audience, open palm  [markers: magenta = clicker] |
| 13 | `pm/nervous_01` | nervous, fiddling with the clicker  [markers: magenta = clicker] |
| 14 | `pm/nervous_02` | nervous, glancing to the side  [markers: magenta = clicker] |
| 15 | `pm/adjust_01` | straightening the blazer, deep breath |
| 16 | `pm/adjust_02` | fixing the collar |
| 17 | `pm/answer_01` | answering a question with a thoughtful hand gesture |
| 18 | `pm/answer_02` | answering, counting points on fingers |
| 19 | `pm/reflect_01` | hands clasped in front, looking down, reflecting |
| 20 | `pm/reflect_02` | hands clasped, looking up honestly |
| 21 | `pm/bowthank_01` | polite thank-you bow, start |
| 22 | `pm/bowthank_02` | polite thank-you bow, lowest point |
| 23 | `pm/wait_01` | standing still, hands clasped, anxious |
| 24 | `pm/wait_02` | standing still, deep breath, eyes closed |
| 25 | `pm/badge_01` | looking at the orange badge in hand, nervous  [markers: magenta = badge] |
| 26 | `pm/badge_02` | holding a new royal-blue badge, amazed  [markers: magenta = badge] |
| 27 | `pm/badge_03` | putting on the royal-blue lanyard, smiling |
| 28 | `pm/celebrate_01` | royal-blue badge on, both arms raised in celebration |
| 29 | `pm/celebrate_02` | royal-blue badge on, jumping with joy |
| 30 | `pm/celebrate_03` | royal-blue badge on, double fist pump |
| 31 | `pm/relieved_01` | royal-blue badge on, relieved exhale, hand on chest |
| 32 | `pm/relieved_02` | royal-blue badge on, soft grateful smile |
| 33 | `pm/fail_01` | head down, dejected, no badge |
| 34 | `pm/fail_02` | holding a cardboard box of belongings (small plant, mug, notebook)  [markers: magenta = box] |
| 35 | `pm/fail_03` | carrying the box, looking down  [markers: magenta = box] |
| 36 | `pm/leave_01` | walking away with the box, step 1  [markers: magenta = box] |
| 37 | `pm/leave_02` | walking away with the box, step 2  [markers: magenta = box] |
| 38 | `pm/leave_03` | walking away with the box, step 3  [markers: magenta = box] |
| 39 | `pm/leave_back_01` | glancing back over the shoulder with a sad smile  [markers: magenta = box] |
| 40 | `pm/resolve_01` | box set down, looking up with quiet determination |
| 41 | `pm/tired_idle_01` | slouched idle loop 1/4, tablet hanging from one hand  [markers: magenta = tablet] |
| 42 | `pm/tired_idle_02` | slouched idle 2/4  [markers: magenta = tablet] |
| 43 | `pm/tired_idle_03` | slouched idle 3/4, eyes half-closed  [markers: magenta = tablet] |
| 44 | `pm/tired_idle_04` | slouched idle 4/4  [markers: magenta = tablet] |
| 45 | `pm/tired_talk_01` | talking wearily, low hand gesture |
| 46 | `pm/tired_talk_02` | talking, forced smile |
| 47 | `pm/tired_talk_03` | talking, rubbing the neck |
| 48 | `pm/tired_talk_04` | talking, sighing |
| 49 | `pm/tired_walk_01` | tired walk contact right  [markers: magenta = tablet] |
| 50 | `pm/tired_walk_02` | tired walk down  [markers: magenta = tablet] |
| 51 | `pm/tired_walk_03` | tired walk passing  [markers: magenta = tablet] |
| 52 | `pm/tired_walk_04` | tired walk up  [markers: magenta = tablet] |
| 53 | `pm/tired_walk_05` | tired walk contact left  [markers: magenta = tablet] |
| 54 | `pm/tired_walk_06` | tired walk down  [markers: magenta = tablet] |
| 55 | `pm/tired_walk_07` | tired walk passing  [markers: magenta = tablet] |
| 56 | `pm/tired_walk_08` | tired walk up  [markers: magenta = tablet] |

<details><summary>Prompt đầy đủ</summary>

```text
TASK: create a 8x7 chibi pixel-art game sprite sheet of the person in the attached photo, dressed as a young project manager on probation. Sheet content: final probation review in a blazer, pass and fail endings, and an exhausted variant.

ATTACHED IMAGES: Image 1 is a photo of a real person (identity source). Image 2 is the approved master sprite sheet of this same character (Sheet A). Match Image 2 exactly: same chibi proportions, face, hair, outfit, colors, outline and shading style, and the same sprite size.

IDENTITY: Convert the person in the photo into a game character. Keep them clearly recognizable: face shape, eye shape and eyebrows, nose and mouth character, hairstyle, hair length, hair color and parting, skin tone, and any distinctive features such as glasses, freckles, moles, beard or earrings (if the person wears glasses, keep the same glasses in every cell). Stylize the features into the art style below; do not trace or paste the photo. Ignore the photo's background, lighting, pose, expression and clothing.

OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): a young project manager on probation. Light sky-blue long-sleeve button-up shirt, sleeves rolled to the forearms, top button open, no tie, tucked in; dark navy trousers; brown leather belt; dark brown shoes. An orange lanyard around the neck with a plain orange ID badge card at the chest (blank, no text). Signature prop: a tablet in a teal-green case. It is added later by code, so do NOT draw it (except in the framed portrait cell).

ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style. Big head, about 2.3 to 2.5 heads tall in total; large glossy expressive eyes with highlights; small nose and mouth; soft rounded body and short limbs; clean dark-brown pixel outline (not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; consistent top-left light. Every full-body figure stands on a small soft grey oval shadow. Small cute effect icons (sparkles, hearts, stars, sweat drops, swirl, Zzz, exclamation mark) are drawn next to a figure only where a cell asks for them.

LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly 8 columns x 7 rows = 56 cells, packed like a professional game asset sheet: each figure fills most of its cell but never touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared baseline. Figures face right in a 3/4 view unless a cell says otherwise. Reading order: left to right, top to bottom. 

OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites that will be placed by code. Wherever a cell mentions a tablet, phone, folder, paper, contract, notebook, pen, mug, marker, clicker, laptop, checklist, card, badge held in the hand, cardboard box, chair, sofa, desk, table, whiteboard, lamp or mugs, do NOT draw that object. Instead draw the empty hand(s) in the exact grip pose as if holding it, and the body sitting or lying at the correct height as if on the invisible furniture. Keep the worn lanyard badge and any worn headset as part of the character. MARKER DOTS: small solid round dots about 1.5% of the cell width, flat color, no outline, no shading, drawn on top of the character. MAGENTA #FF00FF = grip point of the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = grip point of a second object held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they touch the seat) for sitting or lying poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no dots. Never use these three colors anywhere else.

CELLS:
Row 1 - OUTFIT FOR THIS ROW: charcoal-navy blazer worn over the same shirt, everything else unchanged. Formal walk cycle: (1) walk contact right foot, tablet under left arm  [markers: magenta = tablet]; (2) walk down  [markers: magenta = tablet]; (3) walk passing  [markers: magenta = tablet]; (4) walk up  [markers: magenta = tablet]; (5) walk contact left foot  [markers: magenta = tablet]; (6) walk down  [markers: magenta = tablet]; (7) walk passing  [markers: magenta = tablet]; (8) walk up  [markers: magenta = tablet].
Row 2 - OUTFIT FOR THIS ROW: blazer as row 1. Presenting (screen offscreen right): (9) standing with a clicker in the right hand, speaking  [markers: magenta = clicker]; (10) pressing the clicker  [markers: magenta = clicker]; (11) pointing to the right toward the screen  [markers: magenta = clicker]; (12) turned toward the audience, open palm  [markers: magenta = clicker]; (13) nervous, fiddling with the clicker  [markers: magenta = clicker]; (14) nervous, glancing to the side  [markers: magenta = clicker]; (15) straightening the blazer, deep breath; (16) fixing the collar.
Row 3 - OUTFIT FOR THIS ROW: blazer as row 1. Q&A and waiting: (17) answering a question with a thoughtful hand gesture; (18) answering, counting points on fingers; (19) hands clasped in front, looking down, reflecting; (20) hands clasped, looking up honestly; (21) polite thank-you bow, start; (22) polite thank-you bow, lowest point; (23) standing still, hands clasped, anxious; (24) standing still, deep breath, eyes closed.
Row 4 - Normal outfit, no blazer. Pass: badge swap then celebration: (25) looking at the orange badge in hand, nervous  [markers: magenta = badge]; (26) holding a new royal-blue badge, amazed  [markers: magenta = badge]; (27) putting on the royal-blue lanyard, smiling; (28) royal-blue badge on, both arms raised in celebration; (29) royal-blue badge on, jumping with joy; (30) royal-blue badge on, double fist pump; (31) royal-blue badge on, relieved exhale, hand on chest; (32) royal-blue badge on, soft grateful smile.
Row 5 - Normal outfit, no blazer, NO badge in this row. Fail: (33) head down, dejected, no badge; (34) holding a cardboard box of belongings (small plant, mug, notebook)  [markers: magenta = box]; (35) carrying the box, looking down  [markers: magenta = box]; (36) walking away with the box, step 1  [markers: magenta = box]; (37) walking away with the box, step 2  [markers: magenta = box]; (38) walking away with the box, step 3  [markers: magenta = box]; (39) glancing back over the shoulder with a sad smile  [markers: magenta = box]; (40) box set down, looking up with quiet determination.
Row 6 - OUTFIT FOR THIS ROW: same outfit after many overtime nights: hair messier, faint dark circles, shirt untucked on one side, sleeves pushed up unevenly, lanyard twisted and badge crooked, slouched posture. Tired idle + tired talk: (41) slouched idle loop 1/4, tablet hanging from one hand  [markers: magenta = tablet]; (42) slouched idle 2/4  [markers: magenta = tablet]; (43) slouched idle 3/4, eyes half-closed  [markers: magenta = tablet]; (44) slouched idle 4/4  [markers: magenta = tablet]; (45) talking wearily, low hand gesture; (46) talking, forced smile; (47) talking, rubbing the neck; (48) talking, sighing.
Row 7 - Tired outfit as row 6. Tired walk cycle, dragging feet: (49) tired walk contact right  [markers: magenta = tablet]; (50) tired walk down  [markers: magenta = tablet]; (51) tired walk passing  [markers: magenta = tablet]; (52) tired walk up  [markers: magenta = tablet]; (53) tired walk contact left  [markers: magenta = tablet]; (54) tired walk down  [markers: magenta = tablet]; (55) tired walk passing  [markers: magenta = tablet]; (56) tired walk up  [markers: magenta = tablet].

DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw grid lines or cell borders (except the frame of the portrait cell); add scenery, floor or walls; add extra characters; crop limbs; repeat an identical pose; change the face, hair, outfit colors or proportions between cells; use pure white for clothing edges that touch the background.
```

</details>

### Sheet P – Đồ vật cầm tay (tách rời)

Vật cầm tay và đồ để bàn, mỗi món một ô, có điểm cầm (magenta) và vùng màn hình (green).

File prompt: `prompts/PM_P_props.txt` · Lưới 8×4 · Đính kèm: Chỉ sheet A

| Ô | Tên | Mô tả |
|---:|---|---|
| 1 | `prop/tablet_back` | teal-green cased tablet seen from the back, upright, as held against the chest |
| 2 | `prop/tablet_screen_front` | the tablet upright with the screen facing the viewer; the screen is a flat solid GREEN #00FF00 area |
| 3 | `prop/tablet_screen_34` | the tablet turned so the screen faces right at a 3/4 angle; visible screen part is flat solid GREEN #00FF00 |
| 4 | `prop/tablet_edge` | the tablet seen almost edge-on, thin, as tucked under an arm |
| 5 | `prop/tablet_flat` | the tablet lying flat, screen up, seen from a low angle; screen flat solid GREEN #00FF00 |
| 6 | `prop/phone_back` | smartphone seen from the back, upright |
| 7 | `prop/phone_screen` | smartphone with the screen facing the viewer; screen flat solid GREEN #00FF00 |
| 8 | `prop/laptop_closed` | closed silver laptop, seen 3/4 |
| 9 | `prop/folder_closed` | closed navy document folder with papers peeking out |
| 10 | `prop/folder_open` | open navy folder with printed pages, seen at a reading angle |
| 11 | `prop/contract_sheet` | single printed contract page with grey lines (no readable text) |
| 12 | `prop/paper_stack` | small untidy stack of papers held together |
| 13 | `prop/papers_scattered` | a few papers scattered flat on the floor, seen from the side at a low angle |
| 14 | `prop/notebook_open` | small open spiral notebook |
| 15 | `prop/pen` | ballpoint pen |
| 16 | `prop/checklist_sheet` | printed checklist sheet with grey check boxes (no readable text) |
| 17 | `prop/task_card` | small index card with grey lines |
| 18 | `prop/mug_steam` | cream coffee mug with steam |
| 19 | `prop/mug_plain` | cream coffee mug without steam |
| 20 | `prop/marker` | black whiteboard marker, uncapped |
| 21 | `prop/clicker` | small black presentation clicker |
| 22 | `prop/laptop_open_34` | open silver laptop seen 3/4 from behind-left, as balanced on a forearm (lid back visible, keyboard partly visible) |
| 23 | `prop/laptop_open_front` | open silver laptop with the screen facing the viewer; screen flat solid GREEN #00FF00 |
| 24 | `prop/cardboard_box` | open cardboard box holding a small potted plant, a mug and a notebook |
| 25 | `prop/badge_orange` | orange ID badge card on an orange lanyard, loose in the hand, blank card |
| 26 | `prop/badge_blue` | royal-blue ID badge card on a royal-blue lanyard, loose in the hand, blank card |
| 27 | `prop/mugs_pair` | two cream coffee mugs side by side, one tipped slightly |
| 28 | `prop/lamp_on` | small desk lamp, switched on, warm glow drawn only on the lamp |
| 29 | `prop/lamp_off` | the same desk lamp switched off |
| 30 | `prop/plant_small` | small potted desk plant |
| 31 | `prop/sticky_notes` | small pad of yellow sticky notes |
| 32 | `prop/notebook_closed` | closed spiral notebook |

<details><summary>Prompt đầy đủ</summary>

```text
TASK: create a 8x4 sheet of separate handheld items for a chibi pixel-art office game. Sheet content: separate handheld and desk items that the character uses.

ATTACHED IMAGE: the approved master sprite sheet of the game character. Use it ONLY as the style and scale reference; do not draw the character.

ART STYLE: exactly the same soft high-resolution pixel-art style as the attached sheet: clean dark-brown pixel outline, soft cel shading, warm natural colors, top-left light. Everything is seen in the same 3/4 view as a character facing right.

LAYOUT: square 1:1, pure solid white background (#FFFFFF). Exactly 8 columns x 4 rows = 32 cells, one item per cell, centered, never touching another item. Draw every item at its correct real size relative to the chibi character in the attached sheet (for example the tablet is about as wide as the character's torso, a chair seat is at the character's knee height). No shadows under items.

MARKERS on every item: one small solid MAGENTA #FF00FF dot at the grip point (where the center of a hand holds it) or, for items that stand or lie on a surface, at the bottom-center contact point. Screens are flat solid GREEN #00FF00 with no reflections. Never use these colors elsewhere.

CELLS:
Row 1 - Tablet, phone, laptop: (1) teal-green cased tablet seen from the back, upright, as held against the chest; (2) the tablet upright with the screen facing the viewer; the screen is a flat solid GREEN #00FF00 area; (3) the tablet turned so the screen faces right at a 3/4 angle; visible screen part is flat solid GREEN #00FF00; (4) the tablet seen almost edge-on, thin, as tucked under an arm; (5) the tablet lying flat, screen up, seen from a low angle; screen flat solid GREEN #00FF00; (6) smartphone seen from the back, upright; (7) smartphone with the screen facing the viewer; screen flat solid GREEN #00FF00; (8) closed silver laptop, seen 3/4.
Row 2 - Paper: (9) closed navy document folder with papers peeking out; (10) open navy folder with printed pages, seen at a reading angle; (11) single printed contract page with grey lines (no readable text); (12) small untidy stack of papers held together; (13) a few papers scattered flat on the floor, seen from the side at a low angle; (14) small open spiral notebook; (15) ballpoint pen; (16) printed checklist sheet with grey check boxes (no readable text).
Row 3 - Office items: (17) small index card with grey lines; (18) cream coffee mug with steam; (19) cream coffee mug without steam; (20) black whiteboard marker, uncapped; (21) small black presentation clicker; (22) open silver laptop seen 3/4 from behind-left, as balanced on a forearm (lid back visible, keyboard partly visible); (23) open silver laptop with the screen facing the viewer; screen flat solid GREEN #00FF00; (24) open cardboard box holding a small potted plant, a mug and a notebook.
Row 4 - Badges and desk decor: (25) orange ID badge card on an orange lanyard, loose in the hand, blank card; (26) royal-blue ID badge card on a royal-blue lanyard, loose in the hand, blank card; (27) two cream coffee mugs side by side, one tipped slightly; (28) small desk lamp, switched on, warm glow drawn only on the lamp; (29) the same desk lamp switched off; (30) small potted desk plant; (31) small pad of yellow sticky notes; (32) closed spiral notebook.

DO NOT: draw any character or hands; add text, letters, numbers or watermark; draw grid lines, borders, floors or backgrounds.
```

</details>

### Sheet O – Nội thất và đồ trong cảnh (tách rời)

Ghế, sofa, bàn, bàn họp, bảng trắng, màn chiếu, bảng kanban… có điểm ngồi (cyan), điểm đặt (magenta), vùng màn hình (green).

File prompt: `prompts/PM_O_furniture.txt` · Lưới 4×3 · Đính kèm: Chỉ sheet A

| Ô | Tên | Mô tả |
|---:|---|---|
| 1 | `furn/office_chair` | grey office swivel chair seen from the side-left 3/4, so a character facing right sits on it |
| 2 | `furn/meeting_chair` | simple grey meeting chair, same orientation |
| 3 | `furn/sofa` | small grey two-seat office sofa, same orientation |
| 4 | `furn/desk_monitor` | light-wood office desk with a monitor, keyboard and mouse, seen so a seated character on its left faces it; monitor screen flat solid GREEN #00FF00 |
| 5 | `furn/meeting_table` | small round light-wood meeting table, seen so a seated character on its left faces it |
| 6 | `furn/whiteboard` | mobile whiteboard on wheels with a simple boxes-and-arrows doodle (no text), seen from the left 3/4 |
| 7 | `furn/presentation_screen` | presentation screen on a stand; the screen area is flat solid GREEN #00FF00 |
| 8 | `furn/kanban_normal` | wall kanban board with a few colorful sticky notes in columns (no text) |
| 9 | `furn/kanban_overloaded` | the same kanban board overloaded with many red sticky notes |
| 10 | `furn/checklist_poster` | wall poster showing a checklist with green ticks (no readable text) |
| 11 | `furn/monitor_alert` | computer monitor showing a red alert dashboard with warning icons (no text) |
| 12 | `furn/plant_tall` | tall potted office plant |

<details><summary>Prompt đầy đủ</summary>

```text
TASK: create a 4x3 sheet of separate furniture and scene items for a chibi pixel-art office game. Sheet content: separate office furniture and scene items the character sits on or stands next to.

ATTACHED IMAGE: the approved master sprite sheet of the game character. Use it ONLY as the style and scale reference; do not draw the character.

ART STYLE: exactly the same soft high-resolution pixel-art style as the attached sheet: clean dark-brown pixel outline, soft cel shading, warm natural colors, top-left light. Everything is seen in the same 3/4 view as a character facing right.

LAYOUT: square 1:1, pure solid white background (#FFFFFF). Exactly 4 columns x 3 rows = 12 cells, one item per cell, centered, never touching another item. Draw every item at its correct real size relative to the chibi character in the attached sheet (for example the tablet is about as wide as the character's torso, a chair seat is at the character's knee height). No shadows under items.

MARKERS: CYAN #00FFFF dot at the seat point (top-center of the seat cushion) of chairs and the sofa, and for the desk and meeting table at the point where the seated person's hips would be; MAGENTA #FF00FF dot at the placement point on the top surface of the desk and table, and at the bottom-center floor/wall contact point of every other item. Screens are flat solid GREEN #00FF00. Never use these colors elsewhere.

CELLS:
Row 1 - Seating and tables: (1) grey office swivel chair seen from the side-left 3/4, so a character facing right sits on it; (2) simple grey meeting chair, same orientation; (3) small grey two-seat office sofa, same orientation; (4) light-wood office desk with a monitor, keyboard and mouse, seen so a seated character on its left faces it; monitor screen flat solid GREEN #00FF00.
Row 2 - Meeting and boards: (5) small round light-wood meeting table, seen so a seated character on its left faces it; (6) mobile whiteboard on wheels with a simple boxes-and-arrows doodle (no text), seen from the left 3/4; (7) presentation screen on a stand; the screen area is flat solid GREEN #00FF00; (8) wall kanban board with a few colorful sticky notes in columns (no text).
Row 3 - Scene states: (9) the same kanban board overloaded with many red sticky notes; (10) wall poster showing a checklist with green ticks (no readable text); (11) computer monitor showing a red alert dashboard with warning icons (no text); (12) tall potted office plant.

DO NOT: draw any character or hands; add text, letters, numbers or watermark; draw grid lines, borders, floors or backgrounds.
```

</details>

### Sheet F – Icon emote và icon chỉ số

Emote nổi trên đầu + icon 7 thanh chỉ số HUD. Không cần đính kèm ảnh.

File prompt: `prompts/PM_F_icons.txt` · Lưới 6×4 · Đính kèm: Không

| Ô | Tên | Mô tả |
|---:|---|---|
| 1 | `icon/emo_exclaim` | red exclamation mark bubble |
| 2 | `icon/emo_question` | yellow question mark bubble |
| 3 | `icon/emo_sweat` | blue sweat drop |
| 4 | `icon/emo_idea` | glowing light bulb |
| 5 | `icon/emo_anger` | red anger vein symbol |
| 6 | `icon/emo_zzz` | blue Zzz sleep letters |
| 7 | `icon/emo_sparkle` | golden sparkles cluster |
| 8 | `icon/emo_heart` | pink heart |
| 9 | `icon/emo_storm` | small dark storm cloud with rain |
| 10 | `icon/emo_coffee` | coffee cup with steam |
| 11 | `icon/emo_check` | green check mark badge |
| 12 | `icon/emo_cross` | red cross badge |
| 13 | `icon/stat_budget` | gold coin stack |
| 14 | `icon/stat_progress` | rising bar chart with arrow |
| 15 | `icon/stat_quality` | blue shield with check |
| 16 | `icon/stat_morale` | three small smiling heads together |
| 17 | `icon/stat_client` | handshake |
| 18 | `icon/stat_management` | gold star medal |
| 19 | `icon/stat_risk` | orange warning triangle |
| 20 | `icon/ico_deadline` | hourglass |
| 21 | `icon/ico_up` | green up arrow |
| 22 | `icon/ico_down` | red down arrow |
| 23 | `icon/ico_calendar` | calendar page |
| 24 | `icon/ico_checklist` | clipboard with checklist |

<details><summary>Prompt đầy đủ</summary>

```text
ART STYLE: cute soft pixel-art game icons matching a chibi sprite set: clean dark-brown pixel outline, glossy saturated colors, soft highlight top-left, no characters, each icon a clean standalone object.

LAYOUT: icon sheet, square 1:1, pure solid white background (#FFFFFF). Exactly 6 columns x 4 rows = 24 cells, one icon per cell, centered, all icons the same visual size, no icon touching another. Reading order left to right, top to bottom.

CELLS:
Row 1 - Emotes: (1) red exclamation mark bubble; (2) yellow question mark bubble; (3) blue sweat drop; (4) glowing light bulb; (5) red anger vein symbol; (6) blue Zzz sleep letters.
Row 2 - Emotes 2: (7) golden sparkles cluster; (8) pink heart; (9) small dark storm cloud with rain; (10) coffee cup with steam; (11) green check mark badge; (12) red cross badge.
Row 3 - Stat icons: (13) gold coin stack; (14) rising bar chart with arrow; (15) blue shield with check; (16) three small smiling heads together; (17) handshake; (18) gold star medal.
Row 4 - Stat icons 2: (19) orange warning triangle; (20) hourglass; (21) green up arrow; (22) red down arrow; (23) calendar page; (24) clipboard with checklist.

DO NOT include any text or letters except the literal symbols described (!, ?, Zzz); no watermark, grid lines, borders, characters or background.
```

</details>
