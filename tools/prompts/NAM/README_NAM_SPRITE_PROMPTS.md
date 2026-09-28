# RoleCraft PM60 – Bộ prompt sprite Nam v4 (Frontend Developer)

Sinh bởi `rolecraft_nam_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.

**4 sheet / 156 ô / 74 animation.** Mỗi ô gắn với một câu thoại hoặc cảnh Nam có mặt trong kịch bản (mục 5). Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM.

## Thiết kế

- **Tạo hình:** nam, thành viên trẻ nhất team, áo len lavender ngoài sơ mi trắng, quần chino be, giày trắng, tai nghe đeo cổ, thẻ xanh royal. Vật đặc trưng: laptop bạc mỏng (dùng `laptop_*` của bộ PM).
- **Cung truyện theo kịch bản:** “Em sẽ cố” khi team OT (S05) → push nhầm code, xin lỗi (S11) → bị phê bình / được bỏ qua / 1-1 và viết checklist deploy (S11 A/B/C) → xin phụ trách onboarding (S13) → 1-1 đánh giá, nhận module (S14), kèm các biến thể theo cờ `team_ot_14_days`, `junior_publicly_blamed`, `deployment_checklist_added`.
- **Quay PHẢI** như PM, nội thất bên phải: dùng thẳng ghế, bàn của bộ PM; khi đứng đối diện PM thì game lật cả cụm (`flip: true`).
- **Sheet:** A (8×7), B (8×7), E kiệt sức (8×3, ảnh ngang 3:2 – không độn ô), D (4×5). Nền trong suốt; quy tắc tiết kiệm token trong `SOL_ONE_SHOT_PROMPT.txt`.
- **Thay bản cũ:** bản cũ quay trái + bind `beside_left` (không ghép được), mapping theo kịch bản chi tiết cũ.

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8×7) | `prompts/NAM_A_master.txt` | ảnh thật + `PM_A_master.png` | Master: chân dung, đứng, đi, chạy, ngồi, hoảng hốt, xin lỗi, vui, lo lắng/ngập ngừng |
| B (8×7) | `prompts/NAM_B_work_scenes.txt` | `NAM_A` đã duyệt + ảnh thật | Laptop, nói, checklist/onboarding, bàn làm việc ngày/đêm, bàn họp, 1-1 |
| E (8×3) | `prompts/NAM_E_tired.txt` | `NAM_A` đã duyệt + ảnh thật | Biến thể kiệt sức (team_ot_14_days) |
| D (4×5) | `prompts/NAM_D_portraits.txt` | `NAM_A` đã duyệt + ảnh thật | 20 chân dung hộp thoại |

**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip thư mục `rolecraft_nam_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Mỗi sheet 1 lần sinh, chỉ sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả); nền trắng thì chỉ chạy `tools/make_transparent.py`; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.

**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm các sheet còn lại.

## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)

> ✅ Đúng lưới (A, B: 8×7 vuông; E: 8×3 ảnh ngang; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, **nền trong suốt** (không trắng, không ô caro vẽ giả).
>
> ✅ Nhận ra người thật; áo len lavender, cổ sơ mi trắng, tai nghe đeo cổ, thẻ xanh royal; ô 1 sheet A là chân dung khung tím nhạt.
>
> ✅ Không vẽ laptop, checklist, ghế, bàn (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.
>
> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.

## 3. Dùng tool

```bash
cd tools/prompts/NAM
python3 tools/make_transparent.py sheets/*.png
python3 tools/extract_anchors.py --manifest nam_sprite_manifest.json --sheets sheets --out build
```

Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`nam/*`), rồi `PMCompose.create(anchors, manifest, base)`.

## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)

| Nhóm tư thế | Đồ vật | Nội thất |
|---|---|---|
| idle, walk, run, lap_hug, tired_idle, tired_walk / lap_carry | laptop_closed (ôm trước ngực / kẹp nách) | |
| lap_hold, lap_type, lap_close / lap_show | laptop_open_34 / laptop_open_front (vẽ lỗi lên màn hình) | |
| check_write, check_tick | checklist_sheet (tay trái) + pen | |
| check_read/point/give/hold/hug, proud, oneone_proud | checklist_sheet | |
| sit_*, desk_turn | | office_chair |
| desk_* / night_* | lamp_on trên bàn (night), mug_steam (night_coffee) | office_chair + desk_monitor |
| meet_table_* | pen + notebook_open (note) | meeting_chair + meeting_table |
| oneone_* | | meeting_chair |
| weary_03 | mug_plain | |

## 5. Mapping kịch bản → sprite

Tên là **nhóm animation** `nam/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `nam/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi “Nam:” là phản ứng của Nam khi người khác nói hoặc theo kết quả lựa chọn.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L1 Cảnh team | Nền khu làm việc | Nam (JUNIOR_DEV) có mặt ở khu team, không thoại; PM gặp team lần đầu | `desk_type` → `desk_focus_01` → `desk_turn_01` → `greet_01` · `face_shy` |
| L1 Cảnh team | Đi lại | Vào / rời khu làm việc | `walk` → `idle` → `sit` → `desk_stand_01` → `sit_04` → `idle_back_01` |
| L2 S05 Hai dự án | Mở cảnh | Ngày 18 · Phòng họp nội bộ (Anh Minh, Huy nói) | `walk` → `lap_carry_01` → `meet_table_listen` · `face_neutral` |
| L2 S05 Hai dự án | A | Thuê Freelancer (Huy: team vẫn mất thời gian onboarding) | `meet_table_nod_01` → `good_01` · `face_relieved` |
| L2 S05 Hai dự án | B | Nam: “Em sẽ cố, nhưng team đã căng từ đợt demo trước.” | `meet_table_worry_01` → `meet_table_talk` → `try_01` · `face_worried` |
| L2 S05 Hai dự án | C | Đàm phán lại ưu tiên với quản lý | `meet_table_nod_01` · `face_relieved` |
| L2 S05 Hai dự án | B → team_ot_14_days | Dẫn truyện: Hai tuần OT liên tục. Cả team kiệt sức. | `night_type` → `night_coffee_01` → `night_rub_01` → `night_yawn_01` → `night_sleep` → `night_wake_01` · `face_tired`; từ đây `idle`/`talk`/`walk` → `tired_idle` / `tired_talk` / `tired_walk` |
| L2 S05 Hai dự án | Áp lực OT |  | `weary` → `tired_try_01` → `tired_sigh_01` → `exhausted_01` · `face_tired` |
| L2 S06 Deadline/chất lượng | Mở cảnh + nhánh | (JUNIOR_DEV có mặt; Huy, Anh Hiệp nói) | `meet_table_listen` · A: `worry_01` · `face_anxious` · B: `meet_table_nod_01` · `face_relieved` · C: `meet_table_note_01` · `face_thinking` |
| L3 S11 Junior gây lỗi | Trước cảnh | Ngày 41 · sáng sớm, Nam phát hiện push nhầm code | `desk_type` → `desk_panic` → `startle_01` → `startle_02` · `face_shocked` → `face_panic` |
| L3 S11 Junior gây lỗi | Chạy đi báo |  | `desk_stand_01` → `run` → `lap_hold_01` → `lap_show` · `face_panic` |
| L3 S11 Junior gây lỗi | Mở cảnh | Nam: “Em xin lỗi... em push nhầm code, dữ liệu test mất hết rồi.” | `apologize` → `sorry_talk` → `teary_01` · `face_sorry` |
| L3 S11 Junior gây lỗi |  | Lan: “Team sẽ mất gần một ngày để khôi phục.” | `lap_close_01` → `lap_hug_01` → `worry_02` · `face_ashamed` |
| L3 S11 Junior gây lỗi | A | PM: “Mọi người nghe đây: lỗi lần này là do Nam!” → junior_publicly_blamed | `hurt_01` → `shrink` · `face_ashamed` |
| L3 S11 Junior gây lỗi | B | PM: “Để mình xử lý nốt. Chuyện này bỏ qua nhé.” | `confused_01` → `uneasy_01` · `face_confused` |
| L3 S11 Junior gây lỗi | C | PM: “Nam, mình nói chuyện riêng, cùng tìm nguyên nhân rồi thêm checklist deploy.” | `oneone_listen_01` → `oneone_nod_01` → `oneone_talk_01` · `face_thankful` |
| L3 S11 Junior gây lỗi | C → khôi phục + checklist | deployment_checklist_added | `desk_fix_01` → `check_write` → `check_tick_01` → `check_read_01` → `resolve_01` · `face_determined` |
| L4 S13 Hệ thống vận hành | Mở cảnh | (JUNIOR_DEV có mặt; Anh Minh, Lan nói) | `meet_table_listen` · `face_neutral` |
| L4 S13 Hệ thống vận hành | A + team_ot_14_days | Nam: “Team vừa trải qua một giai đoạn làm việc kéo dài. Nếu tiếp tục tăng tốc, em lo mọi người sẽ không giữ được chất lượng.” | `tired_worry` · `face_worried` |
| L4 S13 Hệ thống vận hành | B | Chuẩn hóa quy trình (Lan gộp checklist) | `meet_table_nod_01` → `meet_table_note_01` · `face_happy` |
| L4 S13 Hệ thống vận hành | C | Nam: “Em muốn phụ trách checklist cho thành viên mới.” | `meet_table_raise_01` → `eager` · `face_eager` |
| L4 S13 Hệ thống vận hành | C + junior_publicly_blamed | Nam: “Em hơi lo mình chưa đủ kinh nghiệm để nhận phần này. Nếu có người review cùng, em sẽ thử.” | `hesitant_01` → `hesitant_02` → `try_01` · `face_hesitant` |
| L4 S13 Hệ thống vận hành | C → onboarding | Nam phụ trách checklist cho thành viên mới | `check_hold_01` → `check_point_01` → `check_give_01` → `check_hug_01` · `face_confident` |
| L4 S14 Phát triển team | Mở cảnh | Ngày 52 · Phòng họp 1-1 (Anh Minh, Huy nói) | `oneone_listen_01` · `face_neutral` |
| L4 S14 Phát triển team | junior_publicly_blamed | Nam: “Sau lỗi lần trước, em không chắc team còn tin tưởng giao việc quan trọng cho em không.” | `oneone_sad_01` → `oneone_fidget_01` · `face_unsure` |
| L4 S14 Phát triển team | deployment_checklist_added | Nam: “Em đã hoàn thiện checklist deploy và hỗ trợ team dùng trong các lần release gần đây. Em muốn tiếp tục chịu trách nhiệm phần này.” | `oneone_proud_01` → `oneone_talk_01` · `face_proud` |
| L4 S14 Phát triển team | A | Đánh giá theo số task (Lan: QA ngăn lỗi không có ticket) | `sigh_01` · `face_worried` |
| L4 S14 Phát triển team | B | Nam: “Em đồng ý. Có tiêu chí em sẽ tự theo dõi được tiến bộ.” | `oneone_eager_01` → `nod` · `face_eager` |
| L4 S14 Phát triển team | C | PM: “…Nam sở hữu một module.” | `oneone_surprised_01` → `happy` → `thankful_01` · `face_happy` |
| L4 S14 Phát triển team | C + junior_publicly_blamed | Nam: “Em vẫn hơi lo mắc lỗi. Nếu có checklist và người hỗ trợ ở các mốc quan trọng, em sẽ nhận.” | `worry_01` → `nod` · `face_hesitant` |
| L4 S14 Phát triển team | Kết cảnh | Nhận module / IDP | `proud` → `good_02` · `face_confident` |
| Hội thoại | Nam đứng nói / nghe | Mặc định khi đứng | `talk` · `listen` · `greet_02` · `lap_type` · `meet_table_talk` |

Nam chỉ có ở cảnh team L1 (nền, không thoại), L2 S05, S06, L3 S11 và L4 S13, S14 (kịch bản mục 2), nên không có sự cố production, gặp khách hay màn kết thúc. Mọi ô trong các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, đi, chạy, ngồi, hoảng hốt, xin lỗi, vui, lo lắng/ngập ngừng

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `nam/portrait` | [portrait cell, see LAYOUT] |
| 2 | `nam/idle_01` | idle 1/4: upright, a little stiff and eager [markers: magenta = laptop] |
| 3 | `nam/idle_02` | idle 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = laptop] |
| 4 | `nam/idle_03` | idle 3/4: glancing around, curious [markers: magenta = laptop] |
| 5 | `nam/idle_04` | idle 4/4: slight exhale, soft smile [markers: magenta = laptop] |
| 6 | `nam/idle_back_01` | seen from BEHIND (back view), standing [markers: magenta = laptop] |
| 7 | `nam/greet_01` | small shy wave at shoulder height |
| 8 | `nam/greet_02` | quick polite bow of the head, bright smile |
| 9 | `nam/walk_01` | contact: right foot forward, heel touching [markers: magenta = laptop] |
| 10 | `nam/walk_02` | down: weight on right leg, knee bent [markers: magenta = laptop] |
| 11 | `nam/walk_03` | passing: left leg passing the right [markers: magenta = laptop] |
| 12 | `nam/walk_04` | up: rising on right toes [markers: magenta = laptop] |
| 13 | `nam/walk_05` | contact: left foot forward, heel touching [markers: magenta = laptop] |
| 14 | `nam/walk_06` | down: weight on left leg, knee bent [markers: magenta = laptop] |
| 15 | `nam/walk_07` | passing: right leg passing the left [markers: magenta = laptop] |
| 16 | `nam/walk_08` | up: rising on left toes [markers: magenta = laptop] |
| 17 | `nam/run_01` | contact right foot [markers: magenta = laptop] |
| 18 | `nam/run_02` | push-off from right foot [markers: magenta = laptop] |
| 19 | `nam/run_03` | airborne, legs apart [markers: magenta = laptop] |
| 20 | `nam/run_04` | landing on left foot [markers: magenta = laptop] |
| 21 | `nam/run_05` | contact left foot [markers: magenta = laptop] |
| 22 | `nam/run_06` | push-off from left foot [markers: magenta = laptop] |
| 23 | `nam/run_07` | airborne, legs apart, mirrored [markers: magenta = laptop] |
| 24 | `nam/run_08` | landing on right foot [markers: magenta = laptop] |
| 25 | `nam/sit_01` | standing in front of the chair, about to sit |
| 26 | `nam/sit_02` | lowering onto the chair [markers: cyan = seat] |
| 27 | `nam/sit_03` | seated upright, hands on the knees [markers: cyan = seat] |
| 28 | `nam/sit_04` | standing up from the chair, hands on the knees [markers: cyan = seat] |
| 29 | `nam/startle_01` | startled jump, eyes wide, both hands up, exclamation mark |
| 30 | `nam/startle_02` | landing, both hands on the cheeks, 'oh no', sweat drops |
| 31 | `nam/shrink_01` | shrinking, shoulders raised, head lowered, hands clasped tight |
| 32 | `nam/shrink_02` | hugging the own arms, looking at the floor, small |
| 33 | `nam/apologize_01` | polite bow, hands clasped in front, 'I'm so sorry' |
| 34 | `nam/apologize_02` | deep bow, eyes shut, sweat drop |
| 35 | `nam/sorry_talk_01` | hands clasped at the chest, teary eyes, speaking |
| 36 | `nam/sorry_talk_02` | hands clasped at the chest, looking down, speaking quietly |
| 37 | `nam/teary_01` | wiping one eye with the back of the hand, small tear drop |
| 38 | `nam/hurt_01` | looking down, lip trembling, sweat drop, publicly blamed |
| 39 | `nam/uneasy_01` | small relieved smile but rubbing the own arm, uneasy |
| 40 | `nam/resolve_01` | both fists at the chest, determined to do better |
| 41 | `nam/good_01` | relieved smile, small nod, two golden sparkles |
| 42 | `nam/good_02` | small fist pump, sparkles |
| 43 | `nam/try_01` | small fist in front, brave smile, 'I'll try' |
| 44 | `nam/eager_01` | raising one hand eagerly, 'I want to take this on' |
| 45 | `nam/eager_02` | hand up, bright smile, sparkles |
| 46 | `nam/happy_01` | both hands on the cheeks, happily surprised |
| 47 | `nam/happy_02` | hands clasped under the chin, beaming |
| 48 | `nam/thankful_01` | hand on the chest, grateful small bow |
| 49 | `nam/worry_01` | worried eyebrows, fingers touching the lips |
| 50 | `nam/worry_02` | anxious, hands clasped at the chest, sweat drop |
| 51 | `nam/hesitant_01` | fidgeting fingers, looking down |
| 52 | `nam/hesitant_02` | rubbing the back of the neck, awkward smile |
| 53 | `nam/confused_01` | head tilted, small question mark |
| 54 | `nam/sigh_01` | small sigh, shoulders dropped, grey puff |
| 55 | `nam/listen_01` | listening, hands clasped in front, attentive |
| 56 | `nam/listen_02` | listening, head tilted, nodding slightly |

### Sheet B – Laptop, nói, checklist/onboarding, bàn làm việc ngày/đêm, bàn họp, 1-1

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `nam/lap_carry_01` | closed laptop tucked under the left arm [markers: magenta = laptop] |
| 2 | `nam/lap_hold_01` | open laptop balanced on the left forearm, looking at the screen [markers: magenta = laptop] |
| 3 | `nam/lap_type_01` | typing on the balanced laptop [markers: magenta = laptop] |
| 4 | `nam/lap_type_02` | typing, glancing up over the laptop [markers: magenta = laptop] |
| 5 | `nam/lap_show_01` | turning the open laptop so its screen faces the viewer, showing the error [markers: magenta = laptop] |
| 6 | `nam/lap_show_02` | laptop screen toward the viewer, pointing at it, apologetic [markers: magenta = laptop] |
| 7 | `nam/lap_close_01` | closing the laptop slowly, dejected [markers: magenta = laptop] |
| 8 | `nam/lap_hug_01` | hugging the closed laptop tightly, nervous [markers: magenta = laptop] |
| 9 | `nam/talk_01` | talking, right hand open at chest height |
| 10 | `nam/talk_02` | talking, both hands slightly open |
| 11 | `nam/talk_03` | talking, index finger lightly raised |
| 12 | `nam/talk_04` | talking, hand returning down, small smile |
| 13 | `nam/nod_01` | nodding down |
| 14 | `nam/nod_02` | chin back up after the nod |
| 15 | `nam/proud_01` | holding up a finished checklist sheet with both hands, proud [markers: magenta = checklist] |
| 16 | `nam/proud_02` | checklist hugged to the chest, confident small smile [markers: magenta = checklist] |
| 17 | `nam/check_write_01` | writing a step on the checklist [markers: green = checklist; magenta = pen] |
| 18 | `nam/check_write_02` | writing the next step, tongue slightly out, focused [markers: green = checklist; magenta = pen] |
| 19 | `nam/check_tick_01` | ticking an item [markers: green = checklist; magenta = pen] |
| 20 | `nam/check_read_01` | reading the checklist carefully [markers: magenta = checklist] |
| 21 | `nam/check_point_01` | pointing at one step on the checklist, explaining to a newcomer offscreen on the right [markers: magenta = checklist] |
| 22 | `nam/check_give_01` | handing the checklist forward with both hands, welcoming smile [markers: magenta = checklist] |
| 23 | `nam/check_hold_01` | holding the checklist in both hands at chest height [markers: magenta = checklist] |
| 24 | `nam/check_hug_01` | hugging the checklist, happy [markers: magenta = checklist] |
| 25 | `nam/desk_type_01` | typing frontend code [markers: cyan = seat] |
| 26 | `nam/desk_type_02` | typing, glancing at the monitor [markers: cyan = seat] |
| 27 | `nam/desk_focus_01` | headphones ON the ears, typing, focused [markers: cyan = seat] |
| 28 | `nam/desk_panic_01` | both hands on the head, staring at the monitor in panic, sweat drops [markers: cyan = seat] |
| 29 | `nam/desk_panic_02` | frozen, mouth open, exclamation mark [markers: cyan = seat] |
| 30 | `nam/desk_fix_01` | typing fast to restore the data, sweat drop [markers: cyan = seat] |
| 31 | `nam/desk_turn_01` | swiveled on the chair to face the viewer [markers: cyan = seat] |
| 32 | `nam/desk_stand_01` | pushing the chair back, starting to stand [markers: cyan = seat] |
| 33 | `nam/night_type_01` | typing late at night, tired eyes [markers: cyan = seat] |
| 34 | `nam/night_type_02` | typing, head drooping slightly [markers: cyan = seat] |
| 35 | `nam/night_rub_01` | rubbing the eyes with one hand [markers: cyan = seat] |
| 36 | `nam/night_yawn_01` | yawning, hand over the mouth [markers: cyan = seat] |
| 37 | `nam/night_coffee_01` | holding a mug, eyes on the monitor [markers: cyan = seat; magenta = mug] |
| 38 | `nam/night_sleep_01` | asleep with the head on folded arms on the desk, small Zzz [markers: cyan = seat] |
| 39 | `nam/night_sleep_02` | asleep, slightly different breathing pose [markers: cyan = seat] |
| 40 | `nam/night_wake_01` | jolting awake, eyes wide [markers: cyan = seat] |
| 41 | `nam/meet_table_listen_01` | listening, forearms on the table [markers: cyan = seat] |
| 42 | `nam/meet_table_listen_02` | listening, glancing at the others [markers: cyan = seat] |
| 43 | `nam/meet_table_talk_01` | talking with an open hand [markers: cyan = seat] |
| 44 | `nam/meet_table_talk_02` | talking, leaning in a little [markers: cyan = seat] |
| 45 | `nam/meet_table_worry_01` | worried, hands clasped on the table, sweat drop [markers: cyan = seat] |
| 46 | `nam/meet_table_note_01` | taking notes with a pen [markers: cyan = seat; magenta = pen] |
| 47 | `nam/meet_table_raise_01` | raising one hand, volunteering [markers: cyan = seat] |
| 48 | `nam/meet_table_nod_01` | nodding, relieved [markers: cyan = seat] |
| 49 | `nam/oneone_listen_01` | listening, hands on the knees, a little tense [markers: cyan = seat] |
| 50 | `nam/oneone_nod_01` | nodding, taking it in [markers: cyan = seat] |
| 51 | `nam/oneone_sad_01` | looking down, hands squeezed between the knees, 'will the team still trust me?' [markers: cyan = seat] |
| 52 | `nam/oneone_fidget_01` | fidgeting with the lanyard, unsure [markers: cyan = seat] |
| 53 | `nam/oneone_talk_01` | talking, open hand [markers: cyan = seat] |
| 54 | `nam/oneone_proud_01` | holding up the deploy checklist, proud smile [markers: cyan = seat; magenta = checklist] |
| 55 | `nam/oneone_eager_01` | leaning forward, eager nod, 'with clear criteria I can track my progress' [markers: cyan = seat] |
| 56 | `nam/oneone_surprised_01` | happily surprised, both hands open, 'a module of my own?' [markers: cyan = seat] |

### Sheet E – Biến thể kiệt sức (team_ot_14_days)

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `nam/tired_idle_01` | slouched idle 1/4, closed laptop hanging from one hand [markers: magenta = laptop] |
| 2 | `nam/tired_idle_02` | slouched idle 2/4 [markers: magenta = laptop] |
| 3 | `nam/tired_idle_03` | slouched idle 3/4, eyes half closed [markers: magenta = laptop] |
| 4 | `nam/tired_idle_04` | slouched idle 4/4 [markers: magenta = laptop] |
| 5 | `nam/tired_talk_01` | talking wearily, low hand gesture |
| 6 | `nam/tired_talk_02` | talking, forced smile |
| 7 | `nam/tired_talk_03` | talking, rubbing the neck |
| 8 | `nam/tired_talk_04` | talking, sighing |
| 9 | `nam/tired_walk_01` | contact right [markers: magenta = laptop] |
| 10 | `nam/tired_walk_02` | down [markers: magenta = laptop] |
| 11 | `nam/tired_walk_03` | passing [markers: magenta = laptop] |
| 12 | `nam/tired_walk_04` | up [markers: magenta = laptop] |
| 13 | `nam/tired_walk_05` | contact left [markers: magenta = laptop] |
| 14 | `nam/tired_walk_06` | down [markers: magenta = laptop] |
| 15 | `nam/tired_walk_07` | passing [markers: magenta = laptop] |
| 16 | `nam/tired_walk_08` | up [markers: magenta = laptop] |
| 17 | `nam/tired_worry_01` | worried, hands clasped, 'if we speed up again I'm afraid quality will drop' |
| 18 | `nam/tired_worry_02` | worried, looking aside |
| 19 | `nam/tired_try_01` | forcing a small fist, tired smile, 'I'll try' |
| 20 | `nam/weary_01` | rubbing the eyes |
| 21 | `nam/weary_02` | long yawn |
| 22 | `nam/weary_03` | holding a mug with both hands, faint dark circles [markers: magenta = mug] |
| 23 | `nam/exhausted_01` | head down, arms hanging, grey puff |
| 24 | `nam/tired_sigh_01` | deep sigh, shoulders dropping |

### Sheet D – 20 chân dung hộp thoại

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `nam/face_neutral` | neutral |
| 2 | `nam/face_eager` | eager, bright eyes |
| 3 | `nam/face_happy` | happy smile |
| 4 | `nam/face_proud` | proud smile |
| 5 | `nam/face_shy` | shy smile, slight blush |
| 6 | `nam/face_unsure` | unsure, small awkward smile |
| 7 | `nam/face_confused` | confused, head tilted |
| 8 | `nam/face_thinking` | thinking, eyes looking up |
| 9 | `nam/face_worried` | worried, eyebrows tilted |
| 10 | `nam/face_anxious` | anxious, biting the lip |
| 11 | `nam/face_shocked` | shocked, mouth open |
| 12 | `nam/face_panic` | panicking, sweat drops |
| 13 | `nam/face_ashamed` | ashamed, eyes lowered |
| 14 | `nam/face_sorry` | apologetic, eyes wet |
| 15 | `nam/face_tired` | tired, dark circles |
| 16 | `nam/face_relieved` | relieved exhale |
| 17 | `nam/face_determined` | determined |
| 18 | `nam/face_confident` | confident small smile |
| 19 | `nam/face_thankful` | thankful, gentle smile |
| 20 | `nam/face_hesitant` | hesitant, looking aside |

