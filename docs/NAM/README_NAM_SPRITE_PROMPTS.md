# RoleCraft PM60 – Bộ prompt sprite Nam – Sales Executive

Cùng cơ chế v3 với bộ PM (`docs/PM`) và các bộ MINH, CLIENT, LINH: nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`. **3 sheet nhân vật / 132 ô**; đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**. Kịch bản gốc: `docs/KICH_BAN_ROLECRAFT_PM60.md`.

**Các file**

| File | Dùng để |
|---|---|
| `rolecraft_nam_sprite_prompts/SOL_ONE_SHOT_PROMPT.txt` | Prompt gửi **một lần** cho GPT-5.6 Sol (đính kèm ảnh thật, `PM_A_master.png`, file zip thư mục này) |
| `rolecraft_nam_sprite_prompts/prompts/NAM_*.txt` | Prompt từng sheet, nếu muốn sinh thủ công |
| `rolecraft_nam_sprite_prompts/nam_sprite_manifest.json` | Lưới, ảnh đính kèm, tên sprite `nam/*`, **bind** từng ô → `prop/*`, `furn/*` của bộ PM |
| `rolecraft_nam_sprite_prompts/mapping_section.md` | Đối chiếu kịch bản → sprite (bản gốc của mục 5) |
| `rolecraft_nam_sprite_prompts/tools/` | `extract_anchors.py` (bản nhận mọi nhân vật), `pm_compose.js` |
| `rolecraft_nam_sprite_prompts/build.py`, `readme.py` | Nguồn sinh prompt/manifest/README: `python3 build.py && python3 readme.py` |

---

## 1. Thứ tự sinh, ảnh đính kèm, tạo hình


### Thứ tự tạo ảnh

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8x7) | `prompts/NAM_A_master.txt` | ảnh thật + `PM_A_master.png` (chỉ lấy style) | Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (hào hứng, lúng túng) |
| B (8x7) | `prompts/NAM_B_sales_scenes.txt` | ảnh thật + `NAM_A_master.png` | Điện thoại, hứa 10 ngày (S10), báo giá + họp mở rộng (S15), kết thúc |
| D (4x5) | `prompts/NAM_D_portraits.txt` | ảnh thật + `NAM_A_master.png` | 20 chân dung cảm xúc cho hộp thoại |

Tạo sheet A trước và duyệt, sau đó B, D đính kèm A làm chuẩn. Không có sheet C: Nam chỉ xuất hiện ở L3 S10 và L4 S15, nên các cảnh gộp vào sheet B (như bộ HA).

### Tạo hình nhân vật (theo docs)

- Vai trò: Sales Executive – “ưu tiên cơ hội và cam kết với khách hàng” (docs/KICH_BAN_ROLECRAFT_PM60.md, mục 2), “thúc đẩy cơ hội mở rộng hợp đồng” (L4 S15).
- Xưng “anh” với PM → lớn tuổi hơn PM một chút; hào hứng, thuyết phục, hay hứa trước với khách rồi mới hỏi team.
- Đạo cụ đặc trưng: điện thoại (`prop/phone_back`, `prop/phone_screen`); báo giá dùng `prop/contract_sheet`, danh thiếp dùng `prop/task_card`.
- Ô `dropby_*` tựa vào bàn PM: nội thất gắn điểm `lean_left` (mới, chưa có ở bộ khác) – code cần đặt `furn/desk_monitor` ngay dưới bàn tay tì lên bàn.

---

## 2. Điểm kiểm tra

> ✅ **Sheet A:** nhận ra người thật; nét vẽ, viền, bóng và cỡ người khớp sheet A của PM; ô 1 là chân dung có khung; các ô khác **không có đồ vật**, tay ở tư thế cầm; chấm màu đúng các ô có `[markers]`.
>
> ✅ **Các sheet còn lại:** khớp sheet A; không vẽ ghế, bàn, màn hình, đồ cầm tay; tư thế ngồi cùng độ cao trong một hàng; nhân vật khác nằm ngoài khung.
>
> ✅ **Sau khi chạy script:** mở `build/report.json`; mỗi dòng `missing grip/seat marker` là một ô cần sinh lại.

---

## 3. Dùng tool

```bash
python3 tools/extract_anchors.py --manifest nam_sprite_manifest.json --sheets sheets --out build
```

Kết quả `build/sprites/nam/*.png`, `anim/*.png`, `anchors.json`, `animations.json`, `report.json`. Ghép với đồ vật: nạp `anchors.json` của cả bộ PM (có `prop/*`, `furn/*`) và bộ này, rồi `PMCompose.create(anchors, manifest, base)`.

---

## 4. Chấm neo theo ô

Ô có `[markers]` trong prompt được gắn đồ vật/nội thất trong manifest (`cells[].bind`); danh sách đầy đủ ở mục 6.

---

## 5. Mapping kịch bản → sprite

Tên trong bảng là **nhóm animation** (`nam/<nhóm>`) hoặc một ô cụ thể (`nam/<ô>_01`). `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Kịch bản gốc: `docs/KICH_BAN_ROLECRAFT_PM60.md`; thoại trong game: `THOAI_MAU.json`.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| `P3_S10_SALES_OVERCOMMIT` | Mở cảnh | Nam ghé qua bàn PM: anh chốt với khách rồi, tính năng AI xong trong mười ngày! | `nam/walk`, `nam/dropby`, `nam/announce`, `nam/face_excited` |
| `P3_S10_SALES_OVERCOMMIT` | PM phản ứng | Mười ngày? Team còn chưa được hỏi! | `nam/pushback_01`, `nam/promise_01`, `nam/easy_01`, `nam/face_sheepish` |
| `P3_S10_SALES_OVERCOMMIT` | Nhánh A | PM nhận deadline, cả team chạy nước rút. | `nam/accept_02`, `nam/good_02`, `nam/face_grin` |
| `P3_S10_SALES_OVERCOMMIT` | Nhánh B | PM nói với khách rằng Sales đã hứa sai. | `nam/blamed`, `nam/offended_01`, `nam/face_offended` |
| `P3_S10_SALES_OVERCOMMIT` | Nhánh C | MVP 10 ngày, phase 2 có estimate. | `nam/reluctant_01`, `nam/accept_01`, `nam/face_relieved` |
| `P4_S15_CLIENT_EXPANSION` | Mở cảnh | Cơ hội tốt để mở rộng hợp đồng… team xác nhận để anh hoàn thiện báo giá. | `nam/meet_table_talk`, `nam/meet_table_tap_01`, `nam/face_eager` |
| `P4_S15_CLIENT_EXPANSION` | Nhánh A | Anh sẽ tiến hành báo giá và thủ tục mở rộng ngay. | `nam/excited_01`, `nam/quote_give`, `nam/shake`, `nam/face_grin` |
| `P4_S15_CLIENT_EXPANSION` | Nhánh B | Chậm hơn, nhưng anh có cơ sở rõ hơn để xây dựng báo giá. | `nam/think_01`, `nam/quote_hold_01`, `nam/face_calculating` |
| `P4_S15_CLIENT_EXPANSION` | Nhánh C | Anh tách báo giá và kế hoạch thanh toán theo từng phase. | `nam/quote_split_01`, `nam/tab_present`, `nam/face_proud` |
| `END` | Kết thúc | Chúc mừng / chia tay PM (không có thoại trong docs – dùng cho màn kết). | `nam/cheer`, `nam/congrats`, `nam/sad_01`, `nam/wave_01` |

---

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (hào hứng, lúng túng)

File `NAM_A_master.png`, lưới 8×7, prompt `prompts/NAM_A_master.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `nam/portrait` | [portrait cell, see LAYOUT] big confident grin, phone held up beside the face, a few sparkles |
| 2 | `nam/idle_01` | idle loop 1/4: upbeat stance, phone held loosely in the right hand [markers: magenta = phone] |
| 3 | `nam/idle_02` | idle loop 2/4: small bounce on the toes, energetic [markers: magenta = phone] |
| 4 | `nam/idle_03` | idle loop 3/4: quick glance at the phone screen [markers: magenta = phone] |
| 5 | `nam/idle_back_01` | standing seen from behind (back view), phone in the right hand [markers: magenta = phone] |
| 6 | `nam/idle_04` | idle loop 4/4: settling back, bright smile [markers: magenta = phone] |
| 7 | `nam/greet_01` | big friendly wave, 'hey!' |
| 8 | `nam/greet_02` | finger guns with a wink |
| 9 | `nam/walk_01` | walk contact: left foot forward heel touching [markers: magenta = phone] |
| 10 | `nam/walk_02` | walk down: weight on left leg, knee bent [markers: magenta = phone] |
| 11 | `nam/walk_03` | walk passing: right leg passing the left [markers: magenta = phone] |
| 12 | `nam/walk_04` | walk up: rising on left toes [markers: magenta = phone] |
| 13 | `nam/walk_05` | walk contact: right foot forward heel touching [markers: magenta = phone] |
| 14 | `nam/walk_06` | walk down: weight on right leg, knee bent [markers: magenta = phone] |
| 15 | `nam/walk_07` | walk passing: left leg passing the right [markers: magenta = phone] |
| 16 | `nam/walk_08` | walk up: rising on right toes [markers: magenta = phone] |
| 17 | `nam/talk_01` | talking, right hand open at chest height, enthusiastic |
| 18 | `nam/talk_02` | talking, both hands spread wide, selling the idea |
| 19 | `nam/talk_03` | talking, index finger pointing up, 'here's the thing' |
| 20 | `nam/talk_04` | talking, hand returning down, charming smile |
| 21 | `nam/listen_01` | listening, hands on the hips, eager to jump in |
| 22 | `nam/listen_02` | listening, head tilted, hand on the chin, calculating |
| 23 | `nam/nod_01` | nodding quickly, big smile |
| 24 | `nam/nod_02` | nodding, chin lifted back up |
| 25 | `nam/sit_01` | standing next to the chair, about to sit |
| 26 | `nam/sit_02` | dropping onto the chair [markers: cyan = seat] |
| 27 | `nam/sit_03` | seated, leaning back, one arm over the backrest, relaxed [markers: cyan = seat] |
| 28 | `nam/sit_04` | seated, leaning forward eagerly, hands on the knees [markers: cyan = seat] |
| 29 | `nam/sit_05` | seated, one foot tapping, impatient [markers: cyan = seat] |
| 30 | `nam/sit_06` | seated, writing in a notebook on the lap with a pen [markers: cyan = seat; magenta = notebook; green = pen] |
| 31 | `nam/sit_07` | seated, typing on a phone held in both hands [markers: cyan = seat; magenta = phone] |
| 32 | `nam/sit_08` | springing up from the chair [markers: cyan = seat] |
| 33 | `nam/good_01` | big grin, thumbs up, sparkles |
| 34 | `nam/good_02` | fist pump, 'yes!', sparkles |
| 35 | `nam/good_03` | confident wink with a thumbs up |
| 36 | `nam/good_04` | laughing, head back, hand on the stomach |
| 37 | `nam/applaud_01` | applauding, hands apart |
| 38 | `nam/applaud_02` | applauding, hands together |
| 39 | `nam/excited_01` | both arms up, excited, sparkles, 'great opportunity!' |
| 40 | `nam/relieved_01` | relieved exhale, hand on the chest, smile |
| 41 | `nam/sheepish_01` | sheepish grin, rubbing the back of the neck, one sweat drop |
| 42 | `nam/sheepish_02` | awkward laugh, hand waving in front, 'haha... about that' |
| 43 | `nam/caught_01` | eyes wide, shoulders up, caught off guard, exclamation mark |
| 44 | `nam/sweat_01` | nervous smile, two sweat drops, tugging the collar |
| 45 | `nam/frown_01` | frowning, arms crossed, 'the client already agreed' |
| 46 | `nam/offended_01` | offended, hand on the chest, eyebrows up, 'you told the client WHAT?' |
| 47 | `nam/disappoint_01` | disappointed, shoulders dropped, small grey puff |
| 48 | `nam/impatient_01` | impatient, tapping the wristwatch |
| 49 | `nam/think_01` | thinking, hand on the chin, looking up |
| 50 | `nam/think_02` | thinking, eyes closed, finger tapping the temple |
| 51 | `nam/pocket_01` | one hand in the trouser pocket, confident stance |
| 52 | `nam/crossarms_01` | arms crossed, neutral, waiting for the answer |
| 53 | `nam/hips_01` | hands on the hips, upbeat, ready to close |
| 54 | `nam/lean_01` | leaning in with a conspiratorial smile, hand beside the mouth |
| 55 | `nam/persuade_01` | both hands pressed together in front, 'can't we try?' |
| 56 | `nam/point_01` | pointing forward with an open hand, 'your call' |

### Sheet B – Điện thoại, hứa 10 ngày (S10), báo giá + họp mở rộng (S15), kết thúc

File `NAM_B_sales_scenes.png`, lưới 8×7, prompt `prompts/NAM_B_sales_scenes.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `nam/phone_call_01` | phone at the ear, big smile, talking to a client [markers: magenta = phone] |
| 2 | `nam/phone_call_02` | phone at the ear, laughing, free hand gesturing [markers: magenta = phone] |
| 3 | `nam/phone_call_03` | phone at the ear, nodding, 'yes, yes, of course!' [markers: magenta = phone] |
| 4 | `nam/phone_hangup_01` | lowering the phone from the ear, triumphant grin [markers: magenta = phone] |
| 5 | `nam/phone_read_01` | reading a message on the phone [markers: magenta = phone] |
| 6 | `nam/phone_type_01` | typing quickly with both thumbs [markers: magenta = phone] |
| 7 | `nam/phone_show_01` | turning the phone screen toward the viewer, 'look, the client said yes' [markers: magenta = phone] |
| 8 | `nam/phone_pocket_01` | sliding the phone into the blazer pocket [markers: magenta = phone] |
| 9 | `nam/dropby_01` | arriving and leaning on the desk with one hand, grinning |
| 10 | `nam/dropby_02` | leaning on the desk, tapping it with the fingers, excited |
| 11 | `nam/announce_01` | both arms wide, 'I closed the deal!' |
| 12 | `nam/announce_02` | both hands up with ten fingers spread, 'ten days!' |
| 13 | `nam/announce_03` | double thumbs up, confident, sparkles |
| 14 | `nam/promise_01` | hand on the chest, 'I already promised the client' |
| 15 | `nam/easy_01` | waving a hand casually, 'it's just a small AI feature' |
| 16 | `nam/pushback_01` | leaning back from the desk, surprised by the pushback, question mark |
| 17 | `nam/accept_01` | relieved nod, 'OK, MVP in ten days then' |
| 18 | `nam/accept_02` | thumbs up, reassured smile |
| 19 | `nam/persuade_02` | palms pressing down gently, 'the client is very happy right now' |
| 20 | `nam/persuade_03` | leaning in, both hands open, bargaining |
| 21 | `nam/blamed_01` | stunned, hand on the chest, being blamed in front of the client |
| 22 | `nam/blamed_02` | frowning, jaw tight, arms crossed, upset |
| 23 | `nam/apologize_01` | small apologetic bow, hands pressed together |
| 24 | `nam/reluctant_01` | reluctant sigh, shrug, 'fine, fine' |
| 25 | `nam/quote_hold_01` | holding a quote page in both hands, reading it [markers: magenta = page] |
| 26 | `nam/quote_show_01` | turning the quote page toward the viewer [markers: magenta = page] |
| 27 | `nam/quote_split_01` | holding two quote pages side by side, one per hand, 'phase 1 and phase 2' [markers: magenta = page; green = page] |
| 28 | `nam/quote_give_01` | extending a closed folder with the proposal forward [markers: magenta = folder] |
| 29 | `nam/quote_give_02` | folder handed over, hands returning, big smile [markers: magenta = folder] |
| 30 | `nam/tab_present_01` | turning a tablet toward the viewer, showing the pricing [markers: magenta = tablet] |
| 31 | `nam/tab_present_02` | tablet turned, pointing at a number on the screen [markers: magenta = tablet] |
| 32 | `nam/card_give_01` | offering a business card with both hands, small bow [markers: magenta = card] |
| 33 | `nam/meet_table_talk_01` | seated, talking enthusiastically with an open hand [markers: cyan = seat] |
| 34 | `nam/meet_table_talk_02` | seated, leaning in, selling the expansion [markers: cyan = seat] |
| 35 | `nam/meet_table_listen_01` | seated, listening, hands folded on the table, eager [markers: cyan = seat] |
| 36 | `nam/meet_table_note_01` | seated, writing notes with a pen [markers: cyan = seat; magenta = pen] |
| 37 | `nam/meet_table_show_01` | seated, turning a tablet toward the client [markers: cyan = seat; magenta = tablet] |
| 38 | `nam/meet_table_tap_01` | seated, fingers drumming on the table, impatient [markers: cyan = seat] |
| 39 | `nam/meet_table_agree_01` | seated, nodding with a big smile [markers: cyan = seat] |
| 40 | `nam/meet_table_thumb_01` | seated, thumbs up across the table [markers: cyan = seat] |
| 41 | `nam/pitch_01` | pitching, one arm sweeping outward, 'imagine the possibilities' |
| 42 | `nam/pitch_02` | pitching, counting benefits on the fingers |
| 43 | `nam/pitch_03` | pointing up, 'a big opportunity!' |
| 44 | `nam/shake_01` | reaching out the right hand for a handshake |
| 45 | `nam/shake_02` | vigorous two-handed handshake, big grin |
| 46 | `nam/bow_01` | small polite bow to the client |
| 47 | `nam/watch_01` | checking the wristwatch, 'this week, the budget closes this month' |
| 48 | `nam/hurry_01` | gesturing 'come on, let's move' with a beckoning hand |
| 49 | `nam/coffee_01` | holding a coffee mug, relaxed [markers: magenta = mug] |
| 50 | `nam/coffee_02` | sipping the coffee, eyes closed [markers: magenta = mug] |
| 51 | `nam/cheer_01` | cheering, one fist raised, sparkles |
| 52 | `nam/cheer_02` | both arms up, big grin |
| 53 | `nam/congrats_01` | offering a fist bump |
| 54 | `nam/congrats_02` | clapping someone on the shoulder offscreen |
| 55 | `nam/sad_01` | sad, looking down, hands in the pockets |
| 56 | `nam/wave_01` | cheerful goodbye wave |

### Sheet D – 20 chân dung cảm xúc cho hộp thoại

File `NAM_D_portraits.png`, lưới 4×5, prompt `prompts/NAM_D_portraits.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `nam/face_neutral` | neutral, friendly |
| 2 | `nam/face_grin` | big confident grin |
| 3 | `nam/face_wink` | wink with a smile |
| 4 | `nam/face_excited` | excited, sparkling eyes |
| 5 | `nam/face_laugh` | laughing, eyes closed |
| 6 | `nam/face_charming` | charming salesman smile |
| 7 | `nam/face_eager` | eager, leaning into the frame |
| 8 | `nam/face_persuading` | persuading, eyebrows raised, hands pressed together |
| 9 | `nam/face_thinking` | thinking, eyes looking up |
| 10 | `nam/face_calculating` | calculating, one eye narrowed |
| 11 | `nam/face_surprised` | surprised, eyebrows up, mouth open |
| 12 | `nam/face_sheepish` | sheepish grin, sweat drop |
| 13 | `nam/face_nervous` | nervous smile, two sweat drops |
| 14 | `nam/face_frown` | frowning, displeased |
| 15 | `nam/face_offended` | offended, eyebrows up, lips pressed |
| 16 | `nam/face_disappointed` | disappointed, small grey puff |
| 17 | `nam/face_relieved` | relieved, soft smile |
| 18 | `nam/face_impatient` | impatient, eyes to the side |
| 19 | `nam/face_apologetic` | apologetic, awkward smile |
| 20 | `nam/face_proud` | proud, chin up |

