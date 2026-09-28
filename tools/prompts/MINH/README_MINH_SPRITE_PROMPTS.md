# RoleCraft PM60 – Bộ prompt sprite Anh Minh v4 (Trưởng phòng / PM Lead)

Sinh bởi `rolecraft_minh_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.

**4 sheet / 188 ô / 110 animation.** Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM: folder, tablet, điện thoại, bút, sổ, clicker, thẻ xanh, ghế, bàn họp, bàn làm việc, màn chiếu đều đã có.

## Thay đổi so với bản cũ

- **Quay PHẢI** như PM, nội thất bên phải: dùng thẳng ghế, bàn, màn chiếu của bộ PM. Khi Minh đứng đối diện PM, game lật cả cụm: `pc.draw(ctx, key, x, y, s, { flip: true })`. (Bản cũ quay trái và bind `beside_left` mà `pm_compose.js` không hỗ trợ → đồ bị ghép sai phía.)
- **Bám kịch bản thống nhất** `docs/KICH_BAN_ROLECRAFT_PM60.md`: mapping cũ trích thoại bản chi tiết cũ (“Chào mừng em đến với team…”, tin nhắn riêng ở S08…) nay đã đổi theo đúng từng câu của Anh Minh.
- Thêm: đi quay lưng rời phòng, quay người, chỉnh blazer, ngồi vắt chân; **phòng riêng của Anh Minh** cho S12 (“Anh Minh gọi PM lên phòng”: nghe điện thoại ban giám đốc, mời ngồi, đưa ra dự án lớn, phản ứng A/B/C); ghi chú ở bàn họp. B và C tăng từ 8×6 lên 8×7.
- Prompt ngắn, mỗi ý một lần; quy tắc tiết kiệm token cho agent trong `SOL_ONE_SHOT_PROMPT.txt`.

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8×7) | `prompts/MINH_A_master.txt` | ảnh thật + `PM_A_master.png` | Master: chân dung, đứng, chào, đi, rời đi (quay lưng), ngồi ghế, cảm xúc, tư thế quản lý |
| B (8×7) | `prompts/MINH_B_hands_gestures.txt` | `MINH_A` đã duyệt + ảnh thật | Tài liệu, tablet ngân sách, điện thoại, trình chiếu dự án B, bắt tay/thẻ, giảng giải, nói/nghe |
| C (8×7) | `prompts/MINH_C_scenes_review.txt` | `MINH_A` đã duyệt + ảnh thật | Bàn họp, 1-1, phòng riêng (S12), Final Review, 4 kết thúc, S10/S12 |
| D (4×5) | `prompts/MINH_D_portraits.txt` | `MINH_A` đã duyệt + ảnh thật | 20 chân dung hộp thoại |

**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip thư mục `rolecraft_minh_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Prompt đã giới hạn: mỗi sheet 1 lần sinh, chỉ sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả; nền trắng thì chỉ chạy `tools/make_transparent.py`, không sinh lại); lỗi nhỏ ghi lại chứ không sinh lại; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.

**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm B, C, D.

## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)

> ✅ Đúng lưới (A, B, C: 8×7; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, **nền trong suốt** (không trắng, không ô caro vẽ giả), cùng cỡ trong cả sheet.
>
> ✅ Nhận ra người thật; sơ mi trắng, blazer xám than, thẻ xanh royal; ô 1 sheet A là chân dung khung xanh nhạt.
>
> ✅ Không vẽ đồ vật/nội thất (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.
>
> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.

## 3. Dùng tool

```bash
cd tools/prompts/MINH
python3 tools/extract_anchors.py --manifest minh_sprite_manifest.json --sheets sheets --out build
```

Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`minh/*`), rồi `PMCompose.create(anchors, manifest, base)`.

## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)

| Nhóm tư thế | Đồ vật | Nội thất |
|---|---|---|
| idle, walk, walk_back, turn_01 | folder_closed (cầm tay phải) | |
| doc_carry / doc_give, doc_receive / doc_read, doc_flip, doc_close | folder_closed (kẹp nách) / folder_closed / folder_open | |
| tab_* | tablet_back; tablet_screen_34 (tab_present, oneone_show); tablet_screen_front (tab_swipe); tablet_edge (tab_tuck) | |
| phone_*, desk_phone_01 | phone_back | |
| present, count, two_projects, assign, wait | clicker | presentation_screen (bên phải) |
| badge_give_01 | badge_blue | |
| sit_* | | meeting_chair |
| meet_table_*, panel_*, review_thank | notebook_open trên bàn (listen, note), pen (note) | meeting_chair + meeting_table |
| oneone_* | tablet_screen_34 (show) | meeting_chair |
| desk_* | | office_chair + desk_monitor (turn/invite: chỉ ghế) |

## 5. Mapping kịch bản → sprite

Tên là **nhóm animation** `minh/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `minh/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng ghi “(… nói)” là phản ứng của Anh Minh khi người khác nói.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L1 Intro nhận việc | Mở cảnh | Anh Minh: “Dự án xong 40%, PM cũ nghỉ, tài liệu thiếu. Khách muốn demo sau 7 ngày.” | `walk` → `greet` → `doc_give` · `face_explain` |
| L1 Intro nhận việc |  | Anh Minh: “Em có team 3 người và 100 điểm ngân sách. Quyết định là của em.” | `tab_present` → `point_01` · `face_challenge` |
| L1 Intro nhận việc |  | PM: “Em hiểu rồi ạ. Để em gặp team trước.” | `nod` → `encourage_01` · `face_encouraging` |
| L1 S01 Tiếp quản | Mở cảnh | (MANAGER có mặt, không thoại; Huy, Lan nói) | `listen` → `turn_01` → `walk_back` (rời cảnh) |
| L1 Tổng kết | Tốt | Anh Minh: “Em đã bắt đầu kiểm soát được dự án. Giai đoạn tới sẽ khó hơn.” | `good_03` → `encourage_01` · `face_approving` |
| L1 Tổng kết | Trung bình | Anh Minh: “Dự án vẫn chạy, nhưng vài quyết định đang tạo ra rủi ro. Theo dõi kỹ nhé.” | `talk` → `concern_01` · `face_concerned` |
| L1 Tổng kết | Rủi ro | Anh Minh: “Tiến độ trước mắt ổn, nhưng nền tảng chưa vững. Vấn đề sẽ quay lại.” | `serious_01` → `warn_01` · `face_serious` |
| L2 Intro | Mở cảnh | Anh Minh: “Công ty có thêm dự án B. Từ giờ em không chỉ quản lý một deadline.” | `two_projects_01` → `assign_01` · `face_explain` |
| L2 S05 Hai dự án | Mở cảnh | Anh Minh: “Dự án B cần demo sau hai tuần, dự án A vẫn giữ mốc release.” | `present` → `count` · `face_explain` → `wait_01` |
| L2 S05 Hai dự án | A / B | (PM, Huy / Nam nói) | A: `weigh_02` · `face_thinking` · B: `frown_01` · `face_concerned` |
| L2 S05 Hai dự án | C | Anh Minh: “Vậy B sẽ không có demo đầy đủ sau hai tuần.” | `doubt_01` → `nod` · `face_skeptical` |
| L2 S07 Giữ Huy | Mở cảnh | (Huy nói với PM) | `oneone_listen` · `face_serious` |
| L2 S07 Giữ Huy | A | PM đề xuất ngân sách retention | `oneone_show` → `oneone_agree_01` · `face_thinking` |
| L2 S07 Giữ Huy | B | Anh Minh: “Rủi ro ngắn hạn rất cao. Dự án phải chạy được khi chưa có người mới.” | `oneone_warn_01` · `face_warning` |
| L2 S07 Giữ Huy | C → C1 / C2 | PM đề xuất lộ trình Technical Lead | `oneone_listen` → C1: `oneone_agree_01` · `face_approving` / C2: `sigh_01` · `face_concerned` |
| L2 S08 Complain | Mở cảnh | (MANAGER có mặt, không thoại; Anh Hiệp, Lan nói) | `meet_table_listen` · `face_serious` |
| L2 S08 Complain | A / B / C | (PM, Anh Hiệp, Lan nói) | A: `meet_table_frown_01` · `face_stern` · B: `meet_table_doubt_01` · C: `meet_table_agree_01` · `face_approving` |
| L2 Tổng kết | Tốt | Anh Minh: “Em đã biết quản lý đánh đổi thay vì chỉ phản ứng với từng yêu cầu.” | `good_02` → `applaud` · `face_proud` |
| L2 Tổng kết | Trung bình | Anh Minh: “Dự án vẫn chạy, nhưng đang dựa nhiều vào nỗ lực cá nhân.” | `talk` → `concern_01` · `face_concerned` |
| L2 Tổng kết | Rủi ro | Anh Minh: “Tiến độ tăng, nhưng team và chất lượng đang phải trả giá.” | `warn_01` → `sigh_01` · `face_stern` |
| L3 S10 Sales hứa 10 ngày | Mở cảnh | (MANAGER có mặt; Linh: “Chị chốt với khách rồi…”) | `phone_read_02` → `overcommit_listen_01` → `overcommit_doubt_01` · `face_skeptical` |
| L3 S10 Sales hứa 10 ngày | A / B / C | (PM nói) | A: `nod` · `face_neutral` · B: `overcommit_displeased_01` · `face_stern` · C: `overcommit_approve_01` · `face_approving` |
| L3 S12 Dự án lớn | Mở cảnh | Dẫn truyện: Anh Minh gọi PM lên phòng | `desk_phone_01` → `desk_turn_01` → `desk_invite_01` |
| L3 S12 Dự án lớn |  | Anh Minh: “Ban giám đốc muốn team nhận thêm một dự án lớn. Làm tốt thì rất có lợi cho em.” | `desk_offer` · `face_challenge` |
| L3 S12 Dự án lớn | A / B / C | Em nhận ngay / Em xin từ chối / Em nhận, nếu có thêm một người… | A: `desk_pleased_01` · `face_satisfied` · B: `desk_frown_01` · `face_disappointed` · C: `desk_listen_01` → `desk_agree_01` · `face_approving` |
| L4 Intro | Mở cảnh | Anh Minh: “Em còn 15 ngày trước buổi đánh giá cuối kỳ.” | `watch_01` → `talk` · `face_serious` |
| L4 Intro |  | Anh Minh: “Hãy để các quyết định 15 ngày cuối thành bằng chứng cho năng lực của em.” | `finger_01` → `encourage_01` · `face_encouraging` |
| L4 S13 Hệ thống vận hành | Mở cảnh | Anh Minh: “Nếu Huy nghỉ hoặc Lan chuyển dự án, team có tự vận hành được không?” | `meet_table_ask_01` · `face_concerned` |
| L4 S13 Hệ thống vận hành | A / B / C | (PM, Huy, Lan, Nam nói) | A: `meet_table_frown_01` · B: `meet_table_note_01` → `meet_table_agree_01` · C: `meet_table_agree_01` · `face_satisfied` |
| L4 S13 Hệ thống vận hành | Kết cảnh | xem lại tài liệu vận hành | `doc_read` → `doc_flip_01` → `doc_close_01` · `face_thinking` |
| L4 S14 Phát triển team | Mở cảnh | Anh Minh: “Đánh giá từng người theo kết quả, năng lực và tiềm năng phát triển.” | `oneone_talk` → `list` · `face_explain` |
| L4 S14 Phát triển team | A / B / C | (PM, Lan, Nam, Huy nói) | A: `oneone_warn_01` · `face_concerned` · B: `oneone_agree_01` · C: `oneone_agree_01` · `face_approving` |
| L4 S14 Phát triển team | Kết cảnh | PM nộp bản đánh giá | `doc_receive_01` → `doc_read` · `face_thinking` |
| L4 S15 Mở rộng hợp tác | Mở cảnh + nhánh | (MANAGER có mặt, không thoại) | `meet_table_listen` · A: `meet_table_frown_01` · `face_concerned` · B: `meet_table_agree_01` · C: `meet_table_agree_01` · `face_satisfied` |
| L4 S16 Final Review | Mở cảnh | Anh Minh: “PM tốt không phải người không gặp vấn đề, mà là người biết chịu trách nhiệm.” | `walk` → `adjust_02` → `sit` → `panel_open_01` · `face_formal` |
| L4 S16 Final Review |  | Anh Minh: “Em có 10 phút cho kết quả, quyết định quan trọng và kế hoạch 90 ngày.” | `panel_open_02` · `face_formal` |
| L4 S16 Final Review | A | (Chị Hà: báo cáo chưa nói gì về sự cố…) | `panel_disappoint_01` · `face_disappointed` |
| L4 S16 Final Review | B | Anh Minh: “Minh bạch là tốt, nhưng em cần biến nó thành kế hoạch hành động.” | `panel_critique_01` · `face_serious` |
| L4 S16 Final Review | C | Anh Minh: “Đây là cách một PM chịu trách nhiệm.” | `panel_approve_01` · `face_approving` |
| L4 S16 Final Review | Phản biện | Chị Hà hỏi 4 câu · Dẫn truyện: Chị Hà và Anh Minh trao đổi… | `panel_listen_01` / `panel_note_01` → `panel_confer_01` → `review_thank_01` → `review_stand_01` · `face_formal` |
| Kết thúc | Pass xuất sắc | Anh Minh: “Em không chỉ qua thử việc mà còn giúp team vận hành tốt hơn…” | `excellent_announce_01` → `excellent_applaud_01` → `pass_shake` · `face_proud` |
| Kết thúc | Pass | Anh Minh: “Chúc mừng em đã trở thành PM chính thức…” | `pass_announce` → `pass_shake` → `badge_give` (khớp hàng đổi thẻ của PM) · `face_congrats` |
| Kết thúc | Gia hạn | Anh Minh: “Em có tiềm năng, nhưng kết quả chưa đủ ổn định…” | `extend_talk` → `extend_encourage_01` · `face_serious` |
| Kết thúc | Không đạt | Anh Minh: “Công ty chưa thể giao em vai trò PM chính thức ở thời điểm này.” | `fail_talk` → `fail_sigh_01` → `fail_reassure_01` → `fail_goodbye_01` · `face_regretful` |

Anh Minh không có mặt ở S02, S03, S04, S06, S09, S11 (kịch bản mục 2) nên không có sprite cho các cảnh đó. Vào/ra cảnh: `walk` (lật để đi sang trái), rời phòng bằng `turn_01` → `walk_back`.

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, chào, đi, rời đi (quay lưng), ngồi ghế, cảm xúc, tư thế quản lý

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `minh/portrait` | [portrait cell, see LAYOUT] |
| 2 | `minh/idle_01` | idle 1/4: upright relaxed stance [markers: magenta = folder] |
| 3 | `minh/idle_02` | idle 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = folder] |
| 4 | `minh/idle_03` | idle 3/4: head turned very slightly, attentive [markers: magenta = folder] |
| 5 | `minh/idle_04` | idle 4/4: slight exhale, calm face [markers: magenta = folder] |
| 6 | `minh/idle_back_01` | seen from BEHIND (back view), standing [markers: magenta = folder] |
| 7 | `minh/greet_01` | small welcoming nod with a warm smile, free hand slightly raised |
| 8 | `minh/greet_02` | open palm forward, welcoming gesture |
| 9 | `minh/walk_01` | contact: right foot forward, heel touching [markers: magenta = folder] |
| 10 | `minh/walk_02` | down: weight on right leg, knee bent [markers: magenta = folder] |
| 11 | `minh/walk_03` | passing: left leg passing the right [markers: magenta = folder] |
| 12 | `minh/walk_04` | up: rising on right toes [markers: magenta = folder] |
| 13 | `minh/walk_05` | contact: left foot forward, heel touching [markers: magenta = folder] |
| 14 | `minh/walk_06` | down: weight on left leg, knee bent [markers: magenta = folder] |
| 15 | `minh/walk_07` | passing: right leg passing the left [markers: magenta = folder] |
| 16 | `minh/walk_08` | up: rising on left toes [markers: magenta = folder] |
| 17 | `minh/walk_back_01` | walking away seen from BEHIND, step 1, folder in the right hand [markers: magenta = folder] |
| 18 | `minh/walk_back_02` | walking away from behind, step 2 [markers: magenta = folder] |
| 19 | `minh/walk_back_03` | walking away from behind, step 3 [markers: magenta = folder] |
| 20 | `minh/walk_back_04` | walking away from behind, step 4 [markers: magenta = folder] |
| 21 | `minh/turn_01` | turning away to leave, glancing back over the shoulder with an encouraging nod [markers: magenta = folder] |
| 22 | `minh/turn_02` | seen from behind, small wave over the shoulder, hands free |
| 23 | `minh/adjust_01` | hands free, straightening the blazer lapels, composed |
| 24 | `minh/adjust_02` | hands free, buttoning the blazer |
| 25 | `minh/sit_01` | standing in front of the chair, about to sit, unbuttoning the blazer |
| 26 | `minh/sit_02` | lowering onto the chair [markers: cyan = seat] |
| 27 | `minh/sit_03` | seated upright, hands resting on the thighs [markers: cyan = seat] |
| 28 | `minh/sit_04` | seated leaning back, arms crossed, evaluating [markers: cyan = seat] |
| 29 | `minh/sit_05` | seated leaning forward, elbows on the knees, fingers laced [markers: cyan = seat] |
| 30 | `minh/sit_06` | seated, legs crossed, relaxed, hand on the knee [markers: cyan = seat] |
| 31 | `minh/sit_think_01` | seated, hand on the chin, thinking [markers: cyan = seat] |
| 32 | `minh/sit_07` | standing up from the chair, hands on the knees [markers: cyan = seat] |
| 33 | `minh/good_01` | approving smile, small nod, two golden sparkles |
| 34 | `minh/good_02` | proud smile, arms crossed, chin up |
| 35 | `minh/good_03` | warm smile, open hand forward, praising |
| 36 | `minh/encourage_01` | small encouraging fist at chest height, 'the next stage will be harder' |
| 37 | `minh/applaud_01` | applauding, hands apart |
| 38 | `minh/applaud_02` | applauding, hands together, sparkles |
| 39 | `minh/impressed_01` | eyebrows raised, pleasantly impressed |
| 40 | `minh/satisfied_01` | satisfied closed-eye smile, hands behind the back |
| 41 | `minh/serious_01` | stern straight face, hands behind the back |
| 42 | `minh/frown_01` | frowning, arms crossed tightly |
| 43 | `minh/doubt_01` | skeptical raised eyebrow, hand on the chin, small question mark |
| 44 | `minh/warn_01` | index finger raised in warning, serious |
| 45 | `minh/concern_01` | concerned, one palm raised forward, 'watch these risks' |
| 46 | `minh/sigh_01` | sighing, eyes closed, small grey puff |
| 47 | `minh/disappoint_01` | slow head shake, eyes closed, lips pressed |
| 48 | `minh/critique_01` | one hand turning palm up, mild critique |
| 49 | `minh/think_01` | hand on the chin, looking up |
| 50 | `minh/think_02` | eyes closed, finger tapping the chin |
| 51 | `minh/watch_01` | raising the left wrist and checking the watch |
| 52 | `minh/crossarms_01` | arms crossed, neutral, waiting for an answer |
| 53 | `minh/behind_01` | hands clasped behind the back, calm evaluating look |
| 54 | `minh/point_01` | open hand forward, 'the decision is yours' |
| 55 | `minh/weigh_01` | both palms up like a scale, weighing two options |
| 56 | `minh/weigh_02` | one palm higher than the other, pointing out the trade-off |

### Sheet B – Tài liệu, tablet ngân sách, điện thoại, trình chiếu dự án B, bắt tay/thẻ, giảng giải, nói/nghe

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `minh/doc_carry_01` | folder tucked under the left arm [markers: magenta = folder] |
| 2 | `minh/doc_give_01` | extending the folder forward with both hands, handing it over [markers: magenta = folder] |
| 3 | `minh/doc_give_02` | folder handed over, hands returning, encouraging smile |
| 4 | `minh/doc_receive_01` | receiving a folder with both hands [markers: magenta = folder] |
| 5 | `minh/doc_read_01` | reading an open folder held in both hands [markers: magenta = folder] |
| 6 | `minh/doc_read_02` | reading the open folder, thoughtful frown [markers: magenta = folder] |
| 7 | `minh/doc_flip_01` | flipping a page in the open folder [markers: magenta = folder] |
| 8 | `minh/doc_close_01` | closing the folder, small nod [markers: magenta = folder] |
| 9 | `minh/tab_hold_01` | holding the tablet at chest height with both hands [markers: magenta = tablet] |
| 10 | `minh/tab_read_01` | reading the tablet, calm [markers: magenta = tablet] |
| 11 | `minh/tab_read_02` | reading the tablet, eyebrows raised at a number [markers: magenta = tablet] |
| 12 | `minh/tab_present_01` | turning the tablet screen to the right, toward the PM [markers: magenta = tablet] |
| 13 | `minh/tab_present_02` | tablet turned, pointing at the screen with the free hand [markers: magenta = tablet] |
| 14 | `minh/tab_present_03` | tablet turned, explaining with a small nod [markers: magenta = tablet] |
| 15 | `minh/tab_swipe_01` | swiping on the tablet screen, which faces the viewer [markers: magenta = tablet] |
| 16 | `minh/tab_tuck_01` | tablet tucked under the left arm [markers: magenta = tablet] |
| 17 | `minh/phone_type_01` | typing a message with the thumb, discreet [markers: magenta = phone] |
| 18 | `minh/phone_type_02` | typing, glancing up over the phone [markers: magenta = phone] |
| 19 | `minh/phone_read_01` | reading the phone, neutral [markers: magenta = phone] |
| 20 | `minh/phone_read_02` | reading the phone, frowning at bad news [markers: magenta = phone] |
| 21 | `minh/phone_call_01` | phone at the right ear, listening [markers: magenta = phone] |
| 22 | `minh/phone_call_02` | phone at the ear, nodding, free hand open [markers: magenta = phone] |
| 23 | `minh/phone_glance_01` | lowering the phone and looking up [markers: magenta = phone] |
| 24 | `minh/phone_pocket_01` | putting the phone into the blazer pocket [markers: magenta = phone] |
| 25 | `minh/present_01` | pointing toward the screen with the clicker [markers: magenta = clicker] |
| 26 | `minh/present_02` | clicking, explaining a slide [markers: magenta = clicker] |
| 27 | `minh/present_03` | turning back from the screen toward the viewer [markers: magenta = clicker] |
| 28 | `minh/count_01` | one finger up, 'project B: demo in two weeks' [markers: magenta = clicker] |
| 29 | `minh/count_02` | two fingers up, 'project A keeps its release date' [markers: magenta = clicker] |
| 30 | `minh/two_projects_01` | hands apart at two heights: two projects, one team [markers: magenta = clicker] |
| 31 | `minh/assign_01` | open hand forward, 'now it is more than one deadline' [markers: magenta = clicker] |
| 32 | `minh/wait_01` | clicker lowered, waiting for the PM's plan [markers: magenta = clicker] |
| 33 | `minh/shake_01` | reaching out the right hand for a handshake |
| 34 | `minh/shake_02` | firm handshake, warm smile |
| 35 | `minh/badge_give_01` | holding out a royal-blue staff badge on a lanyard [markers: magenta = badge] |
| 36 | `minh/badge_give_02` | badge handed over, proud nod |
| 37 | `minh/pat_01` | patting an offscreen shoulder, encouraging |
| 38 | `minh/invite_sit_01` | gesturing toward an offscreen chair, 'please sit' |
| 39 | `minh/reassure_01` | hand on the chest, sincere and regretful |
| 40 | `minh/bow_01` | formal slight bow, respectful |
| 41 | `minh/emph_01` | both hands forward, emphasizing, firm face |
| 42 | `minh/emph_02` | chopping gesture with one hand, decisive |
| 43 | `minh/list_01` | counting three points on the fingers: results, ability, potential |
| 44 | `minh/list_02` | last point counted, nodding |
| 45 | `minh/calm_01` | palms down, calming the discussion |
| 46 | `minh/shrug_01` | small shrug, palms up, 'that is the trade-off' |
| 47 | `minh/finger_01` | one finger up, 'what matters is…' |
| 48 | `minh/open_01` | both hands open toward the team, asking a question |
| 49 | `minh/talk_01` | talking, right hand open at chest height, calm |
| 50 | `minh/talk_02` | talking, both hands slightly open, explaining |
| 51 | `minh/talk_03` | talking, index finger lightly raised, making a point |
| 52 | `minh/talk_04` | talking, hand returning down, small smile |
| 53 | `minh/listen_01` | listening, arms loosely crossed, attentive |
| 54 | `minh/listen_02` | listening, head tilted, one hand on the chin |
| 55 | `minh/nod_01` | nodding, eyes half closed, approving |
| 56 | `minh/nod_02` | chin back up after the nod |

### Sheet C – Bàn họp, 1-1, phòng riêng (S12), Final Review, 4 kết thúc, S10/S12

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `minh/meet_table_talk_01` | talking with an open hand [markers: cyan = seat] |
| 2 | `minh/meet_table_talk_02` | leaning in, explaining [markers: cyan = seat] |
| 3 | `minh/meet_table_listen_01` | listening, forearms on the table [markers: cyan = seat] |
| 4 | `minh/meet_table_note_01` | writing notes with a pen while listening [markers: cyan = seat; magenta = pen] |
| 5 | `minh/meet_table_ask_01` | asking the team an open question, both palms up [markers: cyan = seat] |
| 6 | `minh/meet_table_doubt_01` | skeptical raised eyebrow, hand on the chin [markers: cyan = seat] |
| 7 | `minh/meet_table_frown_01` | arms crossed on the table, frowning [markers: cyan = seat] |
| 8 | `minh/meet_table_agree_01` | nodding with a satisfied smile [markers: cyan = seat] |
| 9 | `minh/oneone_talk_01` | talking calmly [markers: cyan = seat] |
| 10 | `minh/oneone_talk_02` | leaning forward, sincere [markers: cyan = seat] |
| 11 | `minh/oneone_listen_01` | listening, hand on the chin [markers: cyan = seat] |
| 12 | `minh/oneone_listen_02` | listening, slight nod, hands on the knees [markers: cyan = seat] |
| 13 | `minh/oneone_show_01` | showing the budget on a tablet turned to the right [markers: cyan = seat; magenta = tablet] |
| 14 | `minh/oneone_show_02` | pointing at a number on the tablet [markers: cyan = seat; magenta = tablet] |
| 15 | `minh/oneone_agree_01` | conditional agreement: nodding with one finger raised [markers: cyan = seat] |
| 16 | `minh/oneone_warn_01` | serious warning, hands clasped, 'short-term risk is very high' [markers: cyan = seat] |
| 17 | `minh/desk_type_01` | typing, focused [markers: cyan = seat] |
| 18 | `minh/desk_read_01` | reading the monitor, hand on the mouse [markers: cyan = seat] |
| 19 | `minh/desk_phone_01` | phone at the ear, a call from the board, serious [markers: cyan = seat; magenta = phone] |
| 20 | `minh/desk_turn_01` | swiveled on the chair to face the viewer, one arm on the armrest [markers: cyan = seat] |
| 21 | `minh/desk_invite_01` | swiveled toward the viewer, gesturing to the visitor's chair, 'come in, sit' [markers: cyan = seat] |
| 22 | `minh/desk_offer_01` | leaning forward with an open hand, presenting a big new project [markers: cyan = seat] |
| 23 | `minh/desk_offer_02` | eyebrow raised with a small challenging smile, 'doing it well would count a lot' [markers: cyan = seat] |
| 24 | `minh/desk_stand_01` | pushing the chair back, standing up [markers: cyan = seat] |
| 25 | `minh/panel_open_01` | hands folded on the table, speaking, opening the review [markers: cyan = seat] |
| 26 | `minh/panel_open_02` | one open hand, 'you have ten minutes' [markers: cyan = seat] |
| 27 | `minh/panel_listen_01` | listening attentively, slight nod [markers: cyan = seat] |
| 28 | `minh/panel_note_01` | writing notes with a pen [markers: cyan = seat; magenta = pen] |
| 29 | `minh/panel_confer_01` | turning toward the viewer to confer quietly with HR offscreen [markers: cyan = seat] |
| 30 | `minh/panel_disappoint_01` | leaning back, disappointed, lips pressed [markers: cyan = seat] |
| 31 | `minh/panel_critique_01` | mild critique, palm up, 'turn it into an action plan' [markers: cyan = seat] |
| 32 | `minh/panel_approve_01` | approving nod and small smile [markers: cyan = seat] |
| 33 | `minh/review_thank_01` | seated at the panel table, thanking with a nod, 'please wait for the result' [markers: cyan = seat] |
| 34 | `minh/review_stand_01` | standing up from the panel table |
| 35 | `minh/pass_announce_01` | standing, announcing good news with a smile |
| 36 | `minh/pass_announce_02` | standing, arms slightly open, 'congratulations' |
| 37 | `minh/pass_shake_01` | reaching out for a congratulating handshake |
| 38 | `minh/pass_shake_02` | firm congratulating handshake, big smile |
| 39 | `minh/excellent_announce_01` | standing, sweeping open arm, 'a bigger scope for you' |
| 40 | `minh/excellent_applaud_01` | applauding warmly, sparkles |
| 41 | `minh/extend_talk_01` | calm serious explanation |
| 42 | `minh/extend_talk_02` | counting the missing competencies on the fingers |
| 43 | `minh/extend_encourage_01` | encouraging open hand, 'focus on what is missing' |
| 44 | `minh/fail_talk_01` | regretful, hand on the chest |
| 45 | `minh/fail_talk_02` | looking down, choosing words carefully |
| 46 | `minh/fail_sigh_01` | sighing, eyes closed, small grey puff |
| 47 | `minh/fail_reassure_01` | sympathetic hand toward an offscreen shoulder |
| 48 | `minh/fail_goodbye_01` | formal slight bow, respectful goodbye |
| 49 | `minh/overcommit_listen_01` | arms crossed, listening to Sales offscreen with a frown |
| 50 | `minh/overcommit_doubt_01` | skeptical look, 'how will you handle this commitment?' |
| 51 | `minh/overcommit_displeased_01` | displeased, pinching the bridge of the nose |
| 52 | `minh/overcommit_approve_01` | approving nod, one finger raised |
| 53 | `minh/desk_listen_01` | leaning back, hand on the chin, listening to the PM's conditions [markers: cyan = seat] |
| 54 | `minh/desk_pleased_01` | pleased smile with a small nod, slightly worried eyebrows [markers: cyan = seat] |
| 55 | `minh/desk_frown_01` | leaning back, arms crossed, disappointed frown [markers: cyan = seat] |
| 56 | `minh/desk_agree_01` | leaning forward, nodding, agreeing to add people and budget [markers: cyan = seat] |

### Sheet D – 20 chân dung hộp thoại

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `minh/face_neutral` | neutral, composed |
| 2 | `minh/face_welcome` | warm welcoming smile |
| 3 | `minh/face_explain` | calm, explaining, mouth slightly open |
| 4 | `minh/face_serious` | serious, straight mouth |
| 5 | `minh/face_stern` | stern, eyebrows lowered |
| 6 | `minh/face_skeptical` | one eyebrow raised, skeptical |
| 7 | `minh/face_concerned` | concerned, eyebrows tilted |
| 8 | `minh/face_warning` | warning, index finger raised into the frame |
| 9 | `minh/face_thinking` | thinking, eyes looking up |
| 10 | `minh/face_challenge` | small challenging smile, eyebrow raised |
| 11 | `minh/face_disappointed` | disappointed, eyes lowered |
| 12 | `minh/face_sigh` | sighing, eyes closed, small grey puff |
| 13 | `minh/face_approving` | approving, gentle smile |
| 14 | `minh/face_satisfied` | satisfied closed-eye smile |
| 15 | `minh/face_proud` | proud smile, chin slightly up |
| 16 | `minh/face_congrats` | big congratulating smile |
| 17 | `minh/face_encouraging` | encouraging, bright eyes |
| 18 | `minh/face_regretful` | regretful, soft sad eyes |
| 19 | `minh/face_sympathetic` | sympathetic, soft sad smile |
| 20 | `minh/face_formal` | formal, blazer buttoned, neutral |

