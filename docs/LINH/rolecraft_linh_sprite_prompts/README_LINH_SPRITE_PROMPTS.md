# RoleCraft PM60 – Bộ prompt sprite Linh v4 (Sales Executive)

Sinh bởi `rolecraft_linh_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.

**3 sheet / 100 ô / 45 animation.** Mỗi ô gắn với một câu thoại hoặc diễn biến của Linh trong kịch bản (mục 5). Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM.

## Thiết kế

- **Tạo hình:** nữ nhân viên kinh doanh khoảng 30 tuổi (xưng “chị” với PM), áo sơ mi nữ xanh da trời, bông tai nhỏ, blazer navy có ghim bạc, quần âu kaki, giày lười gót thấp nâu, đồng hồ bạc, thẻ xanh royal. Vật đặc trưng: điện thoại (luôn nói chuyện với khách).
- **Theo kịch bản:** S10 ghé bàn PM báo đã hứa tính năng AI trong 10 ngày, phản ứng theo nhánh A/B/C (vui, bị “bóc” trước khách rồi gọi chữa cháy, chấp nhận MVP rồi báo lại khách); S15 họp mở rộng, tách báo giá theo phase.
- **Quay PHẢI** như PM; khi đứng đối diện PM thì game lật cả cụm (`flip: true`).
- **Sheet:** A (8×7), C (8×3, ảnh ngang 3:2 – không độn ô), D (4×5). Nền trong suốt; quy tắc tiết kiệm token trong `SOL_ONE_SHOT_PROMPT.txt`.
- **Thay bản cũ:** bản cũ quay trái + bind `beside_left` (không ghép được), mapping theo kịch bản chi tiết cũ.

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8×7) | `prompts/LINH_A_master.txt` | ảnh thật + `PM_A_master.png` | Master: chân dung, đứng, đi, rời đi, bắt tay/đập tay, S10 báo tin – phản ứng, gọi điện, ngồi, nghe |
| C (8×3) | `prompts/LINH_C_meetings.txt` | `LINH_A` đã duyệt + ảnh thật | Ngồi bàn họp S15: chào cơ hội, phản ứng, tách báo giá theo phase, chốt |
| D (4×5) | `prompts/LINH_D_portraits.txt` | `LINH_A` đã duyệt + ảnh thật | 20 chân dung hộp thoại |

**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip thư mục `rolecraft_linh_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Mỗi sheet 1 lần sinh, chỉ sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả); nền trắng thì chỉ chạy `tools/make_transparent.py`; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.

**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm C, D.

## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)

> ✅ Đúng lưới (A: 8×7 vuông; C: 8×3 ảnh ngang; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, **nền trong suốt** (không trắng, không ô caro vẽ giả).
>
> ✅ Nhận ra người thật; áo sơ mi nữ xanh da trời, blazer navy, thẻ xanh royal; ô 1 sheet A là chân dung khung xanh nhạt.
>
> ✅ Không vẽ điện thoại, tablet, giấy, ghế, bàn (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.
>
> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.

## 3. Dùng tool

```bash
cd docs/LINH/rolecraft_linh_sprite_prompts
python3 tools/make_transparent.py sheets/*.png
python3 tools/extract_anchors.py --manifest linh_sprite_manifest.json --sheets sheets --out build
```

Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`linh/*`), rồi `PMCompose.create(anchors, manifest, base)`.

## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)

| Nhóm tư thế | Đồ vật | Nội thất |
|---|---|---|
| idle, walk, walk_back, turn_01, announce_01, phone_* | phone_back | |
| phone_show_01 | phone_screen (vẽ tin nhắn của khách lên màn hình) | |
| sit_01 | | meeting_chair (bên phải) |
| sit_02–04, meet_* | | meeting_chair + meeting_table |
| meet_calc_01 | phone_back | meeting_chair + meeting_table |
| meet_quote_01 / meet_quote_02 | pen + contract_sheet trên bàn / hai contract_sheet trên tay | meeting_chair + meeting_table |
| meet_show | tablet_screen_34 (vẽ báo giá lên màn hình) | meeting_chair + meeting_table |

## 5. Mapping kịch bản → sprite

Tên là **nhóm animation** `linh/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `linh/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi “Linh:” là phản ứng của Linh khi người khác nói hoặc theo kết quả lựa chọn.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L3 S10 Sales hứa 10 ngày | Vào cảnh | Dẫn truyện: Ngày 37 · Linh ghé qua bàn PM. | `walk` → `greet_01` · `face_grin` |
| L3 S10 Sales hứa 10 ngày | Mở cảnh | Linh: “Chị chốt với khách rồi: tính năng AI xong trong mười ngày!” | `announce` → `phone_show_01` → `wink_01` · `face_excited` → `face_wink` |
| L3 S10 Sales hứa 10 ngày |  | PM: “Mười ngày? Team còn chưa được hỏi!” | `shrug_01` → `persuade_01` → `sheepish_01` · `face_persuading` → `face_sheepish` |
| L3 S10 Sales hứa 10 ngày | Câu hỏi | PM đang chọn (Anh Minh, Huy có mặt) | `listen` → `idle` · `face_neutral` |
| L3 S10 Sales hứa 10 ngày | A | PM: “Nhận. Cả team chạy nước rút mười ngày.” | `cheer` → `highfive_01` · `face_laugh` |
| L3 S10 Sales hứa 10 ngày | B | PM: “Anh Hiệp, bên Sales đã hứa sai, mười ngày là không khả thi.” | `shock_01` → `offended_01` → `angry_01` · `face_surprised` → `face_offended` → `face_frown` |
| L3 S10 Sales hứa 10 ngày | B → gọi khách chữa cháy |  | `phone_call_01` → `phone_nervous_01` · `face_nervous` → `face_apologetic` |
| L3 S10 Sales hứa 10 ngày | C | PM: “Mười ngày bên em giao MVP, phase 2 có estimate cụ thể.” | `calc_01` → `agree_01` → `nod` · `face_calculating` |
| L3 S10 Sales hứa 10 ngày | C → báo lại khách |  | `phone_call_02` → `phone_type_01` → `relieved_01` · `face_relieved` |
| L3 S10 Sales hứa 10 ngày | Rời cảnh |  | `phone_pocket_01` → `turn_01` → `idle_back_01` → `walk_back` |
| L4 S15 Mở rộng hợp tác | Vào phòng | Ngày 56 · Phòng họp với khách hàng | `walk` → `greet_02` → `shake` → `sit_01` → `sit_02` → `sit_03` · `face_charming` |
| L4 S15 Mở rộng hợp tác | Mở cảnh | Anh Hiệp muốn mở rộng module báo cáo · Linh: “Cơ hội tốt! Team xác nhận để chị làm báo giá nhé.” | `meet_eager` → `meet_rub_01` · `face_eager` |
| L4 S15 Mở rộng hợp tác |  | Lan: “Phạm vi mới chỉ là mong muốn, chưa có tiêu chí nghiệm thu.” | `meet_listen_01` → `meet_impatient` · `face_impatient` |
| L4 S15 Mở rộng hợp tác | large_project_without_resources | Huy: “Team đang chia nguồn lực cho dự án lớn vừa nhận…” | `meet_frown_01` · `face_frown` |
| L4 S15 Mở rộng hợp tác | Câu hỏi | PM: “Cơ hội lớn, nhưng nhận thế nào cho an toàn?” | `meet_wait_01` · `face_thinking` |
| L4 S15 Mở rộng hợp tác | A | PM nhận toàn bộ (budget +25) | `meet_celebrate` → `meet_calc_01` · `face_excited` |
| L4 S15 Mở rộng hợp tác | B | Khảo sát ba ngày rồi gửi roadmap | `meet_disappointed` · `face_disappointed` |
| L4 S15 Mở rộng hợp tác | C | Linh: “Chị tách báo giá theo từng phase cho khách dễ duyệt.” | `meet_think_01` → `meet_talk` → `meet_quote` → `meet_show` · `face_thinking` → `face_proud` |
| L4 S15 Mở rộng hợp tác | C → khách đồng ý |  | `meet_pleased` → `meet_shake` · `face_proud` |
| L4 S15 Mở rộng hợp tác | Rời phòng |  | `sit_04` → `shake` → `phone_read_01` → `talk` → `turn_01` → `walk_back` |

Linh chỉ có ở L3 S10 và L4 S15 (kịch bản mục 2), nên không có làm đêm, sự cố, 1-1 hay màn kết thúc. Mọi ô trong các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, đi, rời đi, bắt tay/đập tay, S10 báo tin – phản ứng, gọi điện, ngồi, nghe

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `linh/portrait` | [portrait cell, see LAYOUT] |
| 2 | `linh/idle_01` | idle 1/4: relaxed confident stance [markers: magenta = phone] |
| 3 | `linh/idle_02` | idle 2/4: slight inhale, bouncing a little on the toes [markers: magenta = phone] |
| 4 | `linh/idle_03` | idle 3/4: glancing at the phone [markers: magenta = phone] |
| 5 | `linh/idle_04` | idle 4/4: slight exhale, confident grin [markers: magenta = phone] |
| 6 | `linh/idle_back_01` | seen from BEHIND (back view), standing [markers: magenta = phone] |
| 7 | `linh/greet_01` | energetic wave, 'hey!' |
| 8 | `linh/greet_02` | finger-gun point with a wink |
| 9 | `linh/walk_01` | contact: right foot forward, heel touching [markers: magenta = phone] |
| 10 | `linh/walk_02` | down: weight on right leg, knee bent [markers: magenta = phone] |
| 11 | `linh/walk_03` | passing: left leg passing the right [markers: magenta = phone] |
| 12 | `linh/walk_04` | up: rising on right toes [markers: magenta = phone] |
| 13 | `linh/walk_05` | contact: left foot forward, heel touching [markers: magenta = phone] |
| 14 | `linh/walk_06` | down: weight on left leg, knee bent [markers: magenta = phone] |
| 15 | `linh/walk_07` | passing: right leg passing the left [markers: magenta = phone] |
| 16 | `linh/walk_08` | up: rising on left toes [markers: magenta = phone] |
| 17 | `linh/walk_back_01` | walking away seen from BEHIND, step 1, phone at the ear [markers: magenta = phone] |
| 18 | `linh/walk_back_02` | walking away from behind, step 2 [markers: magenta = phone] |
| 19 | `linh/walk_back_03` | walking away from behind, step 3 [markers: magenta = phone] |
| 20 | `linh/walk_back_04` | walking away from behind, step 4 [markers: magenta = phone] |
| 21 | `linh/turn_01` | turning away, pointing back with a grin, 'leave it to me' [markers: magenta = phone] |
| 22 | `linh/shake_01` | reaching out the right hand for a handshake, big smile |
| 23 | `linh/shake_02` | firm two-handed handshake, beaming |
| 24 | `linh/highfive_01` | right hand raised for a high five, excited |
| 25 | `linh/announce_01` | phone raised high in the right hand, excited, 'deal closed!' [markers: magenta = phone] |
| 26 | `linh/announce_02` | arms spread wide, big grin, sparkles |
| 27 | `linh/announce_03` | both hands up with all ten fingers spread, 'ten days!' |
| 28 | `linh/phone_show_01` | turning the phone screen to the right, showing the client's message [markers: magenta = phone] |
| 29 | `linh/wink_01` | wink and thumbs up |
| 30 | `linh/persuade_01` | hands pressed together, persuading, 'the team can do it' |
| 31 | `linh/shrug_01` | palms up shrug, 'the client needs it' |
| 32 | `linh/sheepish_01` | scratching the back of the head, sheepish grin, sweat drop |
| 33 | `linh/cheer_01` | cheering, one fist up |
| 34 | `linh/cheer_02` | both fists up, jumping slightly, sparkles |
| 35 | `linh/shock_01` | shocked, eyebrows up, mouth open, exclamation mark |
| 36 | `linh/offended_01` | offended, eyebrows up, lips pressed, hand on the chest |
| 37 | `linh/angry_01` | hands on the hips, frowning, small anger mark |
| 38 | `linh/calc_01` | one eye narrowed, calculating, finger at the chin |
| 39 | `linh/agree_01` | pointing forward with a nod, 'OK, MVP first' |
| 40 | `linh/relieved_01` | relieved exhale, hand wiping the forehead |
| 41 | `linh/phone_call_01` | phone at the ear, charming smile, talking [markers: magenta = phone] |
| 42 | `linh/phone_call_02` | phone at the ear, free hand gesturing [markers: magenta = phone] |
| 43 | `linh/phone_nervous_01` | phone at the ear, nervous smile, two sweat drops, smoothing things over [markers: magenta = phone] |
| 44 | `linh/phone_type_01` | typing a message with the thumb, quick [markers: magenta = phone] |
| 45 | `linh/phone_read_01` | reading the phone, eyebrows up [markers: magenta = phone] |
| 46 | `linh/phone_pocket_01` | sliding the phone into the blazer pocket [markers: magenta = phone] |
| 47 | `linh/talk_01` | talking, right hand open at chest height |
| 48 | `linh/talk_02` | talking, both hands open, enthusiastic |
| 49 | `linh/sit_01` | standing in front of the chair, about to sit |
| 50 | `linh/sit_02` | lowering onto the chair [markers: cyan = seat] |
| 51 | `linh/sit_03` | seated upright, forearms on the table [markers: cyan = seat] |
| 52 | `linh/sit_04` | standing up from the chair [markers: cyan = seat] |
| 53 | `linh/listen_01` | standing, listening, hands in the pockets |
| 54 | `linh/listen_02` | standing, listening, head tilted |
| 55 | `linh/nod_01` | standing, nodding |
| 56 | `linh/nod_02` | chin back up after the nod |

### Sheet C – Ngồi bàn họp S15: chào cơ hội, phản ứng, tách báo giá theo phase, chốt

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `linh/meet_eager_01` | leaning forward, excited, 'great opportunity!' [markers: cyan = seat] |
| 2 | `linh/meet_eager_02` | open palm toward the team, 'confirm it so I can quote' [markers: cyan = seat] |
| 3 | `linh/meet_rub_01` | rubbing the hands together, smelling a deal [markers: cyan = seat] |
| 4 | `linh/meet_listen_01` | listening, forearms on the table [markers: cyan = seat] |
| 5 | `linh/meet_impatient_01` | drumming the fingers, impatient [markers: cyan = seat] |
| 6 | `linh/meet_impatient_02` | glancing at the wristwatch, impatient [markers: cyan = seat] |
| 7 | `linh/meet_frown_01` | frowning, arms crossed on the table [markers: cyan = seat] |
| 8 | `linh/meet_wait_01` | fingers laced on the table, waiting for the PM's answer [markers: cyan = seat] |
| 9 | `linh/meet_celebrate_01` | fist pump, big grin [markers: cyan = seat] |
| 10 | `linh/meet_celebrate_02` | both hands open, delighted, sparkles [markers: cyan = seat] |
| 11 | `linh/meet_disappointed_01` | leaning back, disappointed, small grey puff [markers: cyan = seat] |
| 12 | `linh/meet_disappointed_02` | sighing, rubbing the neck [markers: cyan = seat] |
| 13 | `linh/meet_calc_01` | tapping numbers on the phone, calculating [markers: cyan = seat; magenta = phone] |
| 14 | `linh/meet_think_01` | hand at the chin, thinking [markers: cyan = seat] |
| 15 | `linh/meet_talk_01` | talking with an open hand [markers: cyan = seat] |
| 16 | `linh/meet_talk_02` | leaning in, explaining [markers: cyan = seat] |
| 17 | `linh/meet_quote_01` | writing figures on a page with a pen [markers: cyan = seat; magenta = pen] |
| 18 | `linh/meet_quote_02` | holding two pages apart, one in each hand, 'phase 1, phase 2' [markers: cyan = seat; magenta = page; green = page] |
| 19 | `linh/meet_show_01` | turning a tablet toward the other side, showing the quote [markers: cyan = seat; magenta = tablet] |
| 20 | `linh/meet_show_02` | pointing at the tablet screen [markers: cyan = seat; magenta = tablet] |
| 21 | `linh/meet_pleased_01` | pleased smile, nodding [markers: cyan = seat] |
| 22 | `linh/meet_pleased_02` | thumbs up, confident [markers: cyan = seat] |
| 23 | `linh/meet_shake_01` | reaching across the table for a handshake [markers: cyan = seat] |
| 24 | `linh/meet_shake_02` | handshake across the table, beaming [markers: cyan = seat] |

### Sheet D – 20 chân dung hộp thoại

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `linh/face_neutral` | neutral, friendly |
| 2 | `linh/face_grin` | big confident grin |
| 3 | `linh/face_wink` | wink with a smile |
| 4 | `linh/face_excited` | excited, sparkling eyes |
| 5 | `linh/face_laugh` | laughing, eyes closed |
| 6 | `linh/face_charming` | charming saleswoman smile |
| 7 | `linh/face_eager` | eager, leaning into the frame |
| 8 | `linh/face_persuading` | persuading, eyebrows raised, hands pressed together |
| 9 | `linh/face_thinking` | thinking, eyes looking up |
| 10 | `linh/face_calculating` | calculating, one eye narrowed |
| 11 | `linh/face_surprised` | surprised, eyebrows up, mouth open |
| 12 | `linh/face_sheepish` | sheepish grin, sweat drop |
| 13 | `linh/face_nervous` | nervous smile, two sweat drops |
| 14 | `linh/face_frown` | frowning, displeased |
| 15 | `linh/face_offended` | offended, eyebrows up, lips pressed |
| 16 | `linh/face_disappointed` | disappointed, small grey puff |
| 17 | `linh/face_relieved` | relieved, soft smile |
| 18 | `linh/face_impatient` | impatient, eyes to the side |
| 19 | `linh/face_apologetic` | apologetic, awkward smile |
| 20 | `linh/face_proud` | proud, chin up |

