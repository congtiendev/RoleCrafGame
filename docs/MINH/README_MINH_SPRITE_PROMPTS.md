# RoleCraft PM60 – Bộ prompt sprite ANH MINH (Trưởng phòng/PM Lead)

Cùng cơ chế v3 với bộ PM (`docs/PM`): nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`.

**Khác bộ PM**

- **Chỉ 4 sheet nhân vật / 172 ô.** Đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**: mọi món Anh Minh cầm hay ngồi (folder, tablet, điện thoại, bút, sổ, clicker, thẻ xanh, ghế họp, bàn họp, màn chiếu) đều đã có ở đó.
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
|---|---|---|---|
| A | Master: chân dung, đứng, chào đón, đi, nói/nghe, ngồi, rời đi, cảm xúc | 8×7 | Ảnh thật + sheet A của PM (mẫu phong cách) |
| B | Tài liệu, tablet ngân sách, điện thoại, trình bày, bắt tay/thẻ, giảng giải | 8×6 | Ảnh thật + sheet A của Minh |
| C | Bàn họp, phòng 1-1, Final Review, 4 kết thúc, Level 3 | 8×6 | Ảnh thật + sheet A của Minh |
| D | 20 chân dung cảm xúc cho hộp thoại | 4×5 | Ảnh thật + sheet A của Minh |

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

Tên trong bảng là **nhóm animation** (bỏ hậu tố `_01`, `_02`…), đúng với khoá `minh/<nhóm>` trong manifest. `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Cột "Kịch bản" trích câu hoặc diễn biến trong docs, mỗi dòng là một lần Anh Minh xuất hiện.

### Level 1 – Khởi động (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 4)

| Cảnh | Kịch bản | Sprite Anh Minh |
|---|---|---|
| Intro nhận việc | "Chào mừng em đến với team…" | `walk` → `greet` → `shake` · face_welcome |
| | Bàn giao: 40%, demo sau 7 ngày | `doc_give` · face_explain |
| | "…team ba người và có 100 điểm ngân sách" | `tab_present` · face_explain |
| | "Quyết định đầu tiên là của em…" | `point` → `crossarms` · face_challenge |
| S01 | "Anh Minh rời cuộc họp sau khi bàn giao" | `leave` |
| Tổng kết | Kết quả tốt | `good` → `encourage` · face_approving |
| | Kết quả trung bình | `talk` → `concern` · face_concerned |
| | Kết quả rủi ro | `serious` → `sigh` · face_serious |

### Level 2 – Hòa nhập (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 5)

| Cảnh | Kịch bản | Sprite Anh Minh |
|---|---|---|
| Intro | "Hai tuần đầu của em đã kết thúc… thêm một dự án mới" | `talk` · face_explain |
| | "…làm rõ dữ kiện và chỉ ra đánh đổi" | `weigh` · face_serious |
| S05 Hai dự án | "trình bày thông tin dự án B trên màn hình" | `present` → `count` → `two_projects` → `assign` · face_explain |
| | "yêu cầu đưa ra phương án nguồn lực ngay trong ngày" | `wait` · face_serious |
| S05 · A | "Công ty đồng ý nếu em kiểm soát được ngân sách…" | `meet_table_talk` · face_serious |
| S05 · C | "Như vậy dự án B sẽ không có bản demo đầy đủ sau hai tuần." | `meet_table_doubt` · face_skeptical |
| S07 Giữ Huy | "Huy là nhân sự quan trọng, nhưng ngân sách dự án không vô hạn…" | `invite_sit` → `oneone_show` · face_serious |
| S07 · A | "Anh đồng ý nếu em xác định rõ vai trò của Huy…" | `oneone_agree` · face_approving |
| S07 · B | "Đây là phương án có rủi ro cao trong ngắn hạn…" | `oneone_warn` · face_warning |
| S08 Complain | Anh Minh **nhắn riêng**: "Em là người chủ trì cuộc họp…" | `phone_type` (Minh ngoài cảnh; hộp thoại face_serious) |
| S08 kết cảnh | "Em đã đi hết 30 ngày đầu…" | `talk` → `finger` · face_serious |
| Tổng kết | tốt / trung bình / rủi ro | như Level 1: `good` / `concern` / `sigh` |

### Level 3 – Bứt phá (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 6: `MANAGER` tham gia S10, S12)

Docs không có thoại Level 3, chỉ có người tham gia, bối cảnh và lựa chọn. S09 (sự cố production) **không có** `MANAGER` nên không có sprite.

| Cảnh | Kịch bản (spec) | Sprite Anh Minh |
|---|---|---|
| S10 Sales hứa quá khả năng | Sales đã hứa tính năng AI trong 10 ngày | `phone_read` (tin xấu) → `overcommit_listen` → `overcommit_doubt` · face_skeptical |
| S10 · A | nhận deadline (`management_trust +5`) | `nod` · face_neutral |
| S10 · B | nói với khách rằng Sales hứa sai (`management_trust -10`) | `overcommit_displeased` · face_stern |
| S10 · C | MVP 10 ngày + phase 2 (`management_trust +10`) | `overcommit_approve` · face_approving |
| S12 Cơ hội dự án lớn | Ban giám đốc muốn team nhận dự án lớn | `phone_call` → `offer` · face_challenge |
| S12 · A / B / C | nhận ngay (+10) / từ chối (−10) / nhận có điều kiện (+10) | A: `good` · B: `frown` · C: `offer_listen` → `offer_accept` |

### Level 4 – Thu hoạch (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 7)

| Cảnh | Kịch bản | Sprite Anh Minh |
|---|---|---|
| Intro | "Em còn 15 ngày trước buổi đánh giá cuối kỳ." | `watch` → `talk` · face_serious |
| | "…ba thứ: kết quả, sự trưởng thành của đội ngũ, trách nhiệm" | `list` · face_explain |
| | "Đừng chỉ chuẩn bị một bản báo cáo đẹp…" | `emph` · face_serious |
| S13 | "Nếu Huy nghỉ hoặc Lan chuyển dự án, team có tiếp tục vận hành được không?" | `meet_table_ask` · face_concerned |
| | "Em có 15 ngày cuối. Em sẽ ưu tiên…?" | `point` · face_challenge |
| S13 kết cảnh | "xem lại bảng phân công và tài liệu vận hành" | `doc_read` → `doc_flip` → `doc_close` · face_thinking |
| S14 | "Anh cần em đánh giá từng thành viên…" | `oneone_talk` · face_explain |
| S14 kết cảnh | "Người chơi gửi bản đánh giá… cho Anh Minh" | `doc_receive` → `doc_read` · face_thinking |
| S15 | "Công ty muốn mở rộng hợp tác, nhưng… phải bảo đảm khả năng thực hiện" | `meet_table_talk` · face_serious |
| S15 kết cảnh | "Một hợp đồng mới chỉ là kết quả tốt khi…" | `talk` → `finger` · face_serious |
| S16 Final Review | "Một PM tốt không phải người không gặp vấn đề…" | `sit` → `panel_open` · face_formal |
| S16 · A | "Thành tích là cần thiết, nhưng việc giảm nhẹ vấn đề…" | `panel_disappoint` · face_disappointed |
| S16 · B | "Minh bạch không có nghĩa là liệt kê toàn bộ khó khăn…" | `panel_critique` · face_serious |
| S16 · C | "Đây là cách một PM chịu trách nhiệm…" | `panel_approve` · face_approving |
| S16 phản biện (HR hỏi) | 4 câu hỏi | `panel_listen` / `panel_note` / `panel_confer` · face_formal |
| S16 kết cảnh | "cảm ơn người chơi và đề nghị chờ kết quả" | `review_thank` → `review_stand` · face_formal |

### Kết thúc campaign (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 9)

| Kết quả | Kịch bản | Sprite Anh Minh |
|---|---|---|
| Pass xuất sắc | "…Công ty đề xuất giao cho em phạm vi lớn hơn…" | `excellent_announce` → `excellent_applaud` → `pass_shake` · face_proud |
| Pass | "Chúc mừng em đã vượt qua thời gian thử việc…" | `pass_announce` → `pass_shake` → `badge_give` (khớp hàng badge swap của PM) · face_congrats |
| Gia hạn thử việc | "…Thời gian gia hạn sẽ tập trung vào những năng lực còn thiếu…" | `extend_talk` → `extend_encourage` · face_serious |
| Không đạt | "…Công ty chưa thể giao vai trò PM chính thức…" | `fail_talk` → `fail_sigh` → `fail_reassure` → `fail_goodbye` · face_regretful |

---

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, chào đón, đi, nói/nghe, ngồi, rời đi, cảm xúc

File `MINH_A_master.png`, lưới 8×7, prompt `prompts/MINH_A_master.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `minh/portrait` | [portrait cell, see LAYOUT] calm confident smile, navy folder against the chest, a few sparkles |
| 2 | `minh/idle_01` | idle loop 1/4: upright relaxed stance, folder held at his side in the right hand [markers: magenta = folder] |
| 3 | `minh/idle_02` | idle loop 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = folder] |
| 4 | `minh/idle_03` | idle loop 3/4: head turned very slightly, attentive [markers: magenta = folder] |
| 5 | `minh/idle_back_01` | standing seen from behind (back view), folder in the right hand [markers: magenta = folder] |
| 6 | `minh/idle_04` | idle loop 4/4: slight exhale, calm face [markers: magenta = folder] |
| 7 | `minh/greet_01` | small welcoming nod with a warm smile, free hand slightly raised |
| 8 | `minh/greet_02` | open palm toward the viewer, welcoming gesture |
| 9 | `minh/walk_01` | walk contact: left foot forward heel touching [markers: magenta = folder] |
| 10 | `minh/walk_02` | walk down: weight on left leg, knee bent [markers: magenta = folder] |
| 11 | `minh/walk_03` | walk passing: right leg passing the left [markers: magenta = folder] |
| 12 | `minh/walk_04` | walk up: rising on left toes [markers: magenta = folder] |
| 13 | `minh/walk_05` | walk contact: right foot forward heel touching [markers: magenta = folder] |
| 14 | `minh/walk_06` | walk down: weight on right leg, knee bent [markers: magenta = folder] |
| 15 | `minh/walk_07` | walk passing: left leg passing the right [markers: magenta = folder] |
| 16 | `minh/walk_08` | walk up: rising on right toes [markers: magenta = folder] |
| 17 | `minh/talk_01` | talking, right hand open at chest height, calm |
| 18 | `minh/talk_02` | talking, both hands slightly open, explaining |
| 19 | `minh/talk_03` | talking, index finger lightly raised making a point |
| 20 | `minh/talk_04` | talking, hand returning down, small smile |
| 21 | `minh/listen_01` | listening, arms loosely crossed, attentive |
| 22 | `minh/listen_02` | listening, head tilted, one hand on the chin |
| 23 | `minh/nod_01` | nodding, eyes half closed, approving |
| 24 | `minh/nod_02` | nodding, chin lifted back up |
| 25 | `minh/sit_01` | standing next to the chair, about to sit, unbuttoning the blazer |
| 26 | `minh/sit_02` | lowering onto the chair [markers: cyan = seat] |
| 27 | `minh/sit_03` | seated upright, hands resting on the thighs [markers: cyan = seat] |
| 28 | `minh/sit_04` | seated leaning back, arms crossed, evaluating [markers: cyan = seat] |
| 29 | `minh/sit_05` | seated leaning forward, elbows on knees, fingers laced [markers: cyan = seat] |
| 30 | `minh/sit_06` | standing up from the chair, buttoning the blazer [markers: cyan = seat] |
| 31 | `minh/leave_01` | turning away to leave, glancing back over the shoulder with an encouraging nod [markers: magenta = folder] |
| 32 | `minh/leave_02` | walking away seen from behind, small wave over the shoulder [markers: magenta = folder] |
| 33 | `minh/good_01` | approving smile, small nod, two golden sparkles |
| 34 | `minh/good_02` | proud smile, arms crossed, chin up |
| 35 | `minh/good_03` | warm smile, open hand toward the viewer, praising |
| 36 | `minh/encourage_01` | small encouraging fist at chest height, 'the next stage will be harder' |
| 37 | `minh/applaud_01` | applauding, hands apart |
| 38 | `minh/applaud_02` | applauding, hands together, sparkles |
| 39 | `minh/impressed_01` | eyebrows raised, pleasantly impressed |
| 40 | `minh/satisfied_01` | satisfied closed-eye smile, hands behind the back |
| 41 | `minh/serious_01` | stern straight face, hands behind the back |
| 42 | `minh/frown_01` | frowning, arms crossed tightly |
| 43 | `minh/doubt_01` | skeptical raised eyebrow, hand on the chin, small question mark |
| 44 | `minh/warn_01` | index finger raised in warning, serious face |
| 45 | `minh/concern_01` | concerned, one hand raised palm out, 'watch the consequences' |
| 46 | `minh/sigh_01` | sighing, eyes closed, small grey puff |
| 47 | `minh/disappoint_01` | slow head shake, eyes closed, lips pressed |
| 48 | `minh/critique_01` | one hand turning palm up, mild critique, 'transparency is not a list of problems' |
| 49 | `minh/think_01` | thinking, hand on the chin, looking up |
| 50 | `minh/think_02` | thinking, eyes closed, finger tapping the chin |
| 51 | `minh/watch_01` | raising the left wrist and checking the watch, 'you have 15 days left' |
| 52 | `minh/crossarms_01` | arms crossed, neutral, waiting for an answer |
| 53 | `minh/behind_01` | hands clasped behind the back, calm evaluating look |
| 54 | `minh/point_01` | open hand toward the viewer, 'the decision is yours' |
| 55 | `minh/weigh_01` | both palms up like a scale, weighing two options |
| 56 | `minh/weigh_02` | one palm higher than the other, pointing out the trade-off |

### Sheet B – Tài liệu, tablet ngân sách, điện thoại, trình bày, bắt tay/thẻ, giảng giải

File `MINH_B_hands_gestures.png`, lưới 8×6, prompt `prompts/MINH_B_hands_gestures.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `minh/doc_carry_01` | folder tucked under the left arm, standing [markers: magenta = folder] |
| 2 | `minh/doc_give_01` | extending the folder forward with both hands (handover) [markers: magenta = folder] |
| 3 | `minh/doc_give_02` | folder handed over, hands returning, encouraging smile [markers: magenta = folder] |
| 4 | `minh/doc_receive_01` | receiving a folder offered from the left with both hands [markers: magenta = folder] |
| 5 | `minh/doc_read_01` | reading an open folder held in both hands [markers: magenta = folder] |
| 6 | `minh/doc_read_02` | reading the open folder, thoughtful frown [markers: magenta = folder] |
| 7 | `minh/doc_flip_01` | flipping a page in the open folder [markers: magenta = folder] |
| 8 | `minh/doc_close_01` | closing the folder, small nod [markers: magenta = folder] |
| 9 | `minh/tab_hold_01` | holding the tablet at chest height with both hands [markers: magenta = tablet] |
| 10 | `minh/tab_read_01` | reading the tablet, calm [markers: magenta = tablet] |
| 11 | `minh/tab_read_02` | reading the tablet, eyebrows raised at a number [markers: magenta = tablet] |
| 12 | `minh/tab_present_01` | turning the tablet screen toward the viewer [markers: magenta = tablet] |
| 13 | `minh/tab_present_02` | tablet turned, pointing at the screen with the free hand [markers: magenta = tablet] |
| 14 | `minh/tab_present_03` | tablet turned, explaining with a small nod [markers: magenta = tablet] |
| 15 | `minh/tab_swipe_01` | swiping on the tablet screen, which faces the viewer [markers: magenta = tablet] |
| 16 | `minh/tab_tuck_01` | tucking the tablet under the arm [markers: magenta = tablet] |
| 17 | `minh/phone_type_01` | typing a private message with the thumb, discreet [markers: magenta = phone] |
| 18 | `minh/phone_type_02` | typing, glancing up over the phone [markers: magenta = phone] |
| 19 | `minh/phone_read_01` | reading a message on the phone, neutral [markers: magenta = phone] |
| 20 | `minh/phone_read_02` | reading the phone, frowning at bad news [markers: magenta = phone] |
| 21 | `minh/phone_call_01` | phone at the ear, listening [markers: magenta = phone] |
| 22 | `minh/phone_call_02` | phone at the ear, nodding, free hand open [markers: magenta = phone] |
| 23 | `minh/phone_glance_01` | lowering the phone and looking up at the viewer [markers: magenta = phone] |
| 24 | `minh/phone_pocket_01` | putting the phone back into the blazer pocket [markers: magenta = phone] |
| 25 | `minh/present_01` | holding a clicker, pointing toward the screen [markers: magenta = clicker] |
| 26 | `minh/present_02` | clicker click, explaining a slide [markers: magenta = clicker] |
| 27 | `minh/present_03` | turning back from the screen to the viewer [markers: magenta = clicker] |
| 28 | `minh/count_01` | one finger up, 'project B: demo in two weeks' [markers: magenta = clicker] |
| 29 | `minh/count_02` | two fingers up, 'project A keeps its release date' [markers: magenta = clicker] |
| 30 | `minh/two_projects_01` | hands apart at two heights, two projects, one team [markers: magenta = clicker] |
| 31 | `minh/assign_01` | open hand toward the viewer, 'use the resources you have' [markers: magenta = clicker] |
| 32 | `minh/wait_01` | clicker lowered, waiting for the PM's plan today [markers: magenta = clicker] |
| 33 | `minh/shake_01` | reaching out the right hand for a handshake |
| 34 | `minh/shake_02` | firm handshake, warm smile |
| 35 | `minh/badge_give_01` | holding out a royal-blue official staff badge on a lanyard [markers: magenta = badge] |
| 36 | `minh/badge_give_02` | badge handed over, proud nod [markers: magenta = badge] |
| 37 | `minh/pat_01` | patting an offscreen shoulder, encouraging |
| 38 | `minh/invite_sit_01` | gesturing to an offscreen chair, 'please sit' |
| 39 | `minh/reassure_01` | hand on the chest, sincere and regretful |
| 40 | `minh/bow_01` | formal slight bow, respectful |
| 41 | `minh/emph_01` | both hands forward emphasizing, firm face |
| 42 | `minh/emph_02` | chopping gesture with one hand, decisive |
| 43 | `minh/list_01` | counting three points on the fingers: results, team growth, accountability |
| 44 | `minh/list_02` | last point counted, nodding |
| 45 | `minh/calm_01` | palms down, calming the discussion |
| 46 | `minh/shrug_01` | small shrug, palms up, 'that is the trade-off' |
| 47 | `minh/finger_01` | one finger up, 'what I care about is…' |
| 48 | `minh/open_01` | both hands open toward the team, asking the team a question |

### Sheet C – Bàn họp, phòng 1-1, Final Review, 4 kết thúc, Level 3

File `MINH_C_scenes_review.png`, lưới 8×6, prompt `prompts/MINH_C_scenes_review.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `minh/meet_table_talk_01` | seated at the table, talking with an open hand [markers: cyan = seat] |
| 2 | `minh/meet_table_talk_02` | seated, leaning in, explaining [markers: cyan = seat] |
| 3 | `minh/meet_table_listen_01` | seated, listening, notebook on the table [markers: cyan = seat] |
| 4 | `minh/meet_table_listen_02` | seated, writing notes while listening [markers: cyan = seat; magenta = pen] |
| 5 | `minh/meet_table_ask_01` | seated, asking the team an open question, both palms up [markers: cyan = seat] |
| 6 | `minh/meet_table_doubt_01` | seated, skeptical raised eyebrow, hand on the chin [markers: cyan = seat] |
| 7 | `minh/meet_table_frown_01` | seated, arms crossed on the table, frowning [markers: cyan = seat] |
| 8 | `minh/meet_table_agree_01` | seated, nodding with a satisfied smile [markers: cyan = seat] |
| 9 | `minh/oneone_talk_01` | seated, talking calmly [markers: cyan = seat] |
| 10 | `minh/oneone_talk_02` | seated, leaning forward, sincere [markers: cyan = seat] |
| 11 | `minh/oneone_listen_01` | seated, listening, notebook on the knee [markers: cyan = seat; magenta = notebook] |
| 12 | `minh/oneone_listen_02` | seated, listening, hand on the chin [markers: cyan = seat] |
| 13 | `minh/oneone_show_01` | seated, showing the tablet screen with the budget to the other person [markers: magenta = tablet] |
| 14 | `minh/oneone_show_02` | seated, pointing at a number on the tablet [markers: magenta = tablet] |
| 15 | `minh/oneone_agree_01` | seated, conditional agreement: nodding with one finger raised [markers: cyan = seat] |
| 16 | `minh/oneone_warn_01` | seated, serious warning, hands clasped [markers: cyan = seat] |
| 17 | `minh/panel_open_01` | seated, opening the review, hands folded on the table, speaking [markers: cyan = seat] |
| 18 | `minh/panel_open_02` | seated, opening remark, one open hand [markers: cyan = seat] |
| 19 | `minh/panel_listen_01` | seated, listening attentively, slight nod [markers: cyan = seat] |
| 20 | `minh/panel_note_01` | seated, writing notes with a pen [markers: cyan = seat; magenta = pen] |
| 21 | `minh/panel_confer_01` | seated, turning to the side to confer quietly with HR offscreen [markers: cyan = seat] |
| 22 | `minh/panel_disappoint_01` | seated, disappointed, leaning back, lips pressed (report only shows achievements) [markers: cyan = seat] |
| 23 | `minh/panel_critique_01` | seated, mild critique, palm up (report lists problems without a plan) [markers: cyan = seat] |
| 24 | `minh/panel_approve_01` | seated, approving nod and small smile (structured report with a 90-day roadmap) [markers: cyan = seat] |
| 25 | `minh/review_thank_01` | seated, thanking the PM with a nod, 'please wait for the result' [markers: cyan = seat] |
| 26 | `minh/review_stand_01` | standing up from the panel table |
| 27 | `minh/pass_announce_01` | standing, announcing good news with a smile |
| 28 | `minh/pass_announce_02` | standing, arms slightly open, 'congratulations' |
| 29 | `minh/pass_shake_01` | reaching out for a congratulating handshake |
| 30 | `minh/pass_shake_02` | firm congratulating handshake, big smile |
| 31 | `minh/excellent_announce_01` | standing, sweeping open arm, 'a bigger scope for you' |
| 32 | `minh/excellent_applaud_01` | applauding warmly, sparkles |
| 33 | `minh/extend_talk_01` | standing, calm serious explanation |
| 34 | `minh/extend_talk_02` | standing, counting the missing competencies on the fingers |
| 35 | `minh/extend_encourage_01` | standing, encouraging open hand, 'focus on what is missing' |
| 36 | `minh/fail_talk_01` | standing, regretful, hand on the chest |
| 37 | `minh/fail_talk_02` | standing, looking down, choosing words carefully |
| 38 | `minh/fail_sigh_01` | sighing, eyes closed, small grey puff |
| 39 | `minh/fail_reassure_01` | sympathetic gesture toward an offscreen shoulder |
| 40 | `minh/fail_goodbye_01` | formal slight bow, respectful goodbye |
| 41 | `minh/overcommit_listen_01` | arms crossed, listening to Sales on the left with a frown |
| 42 | `minh/overcommit_doubt_01` | turning to the PM with a skeptical look, 'how will you handle this commitment?' |
| 43 | `minh/overcommit_displeased_01` | displeased, pinching the bridge of the nose (the PM blamed Sales in front of the client) |
| 44 | `minh/overcommit_approve_01` | approving nod (MVP in 10 days + estimated phase 2) |
| 45 | `minh/offer_01` | leaning forward with an open hand, presenting the big project from the board |
| 46 | `minh/offer_02` | raising an eyebrow with a small challenging smile, 'success would count a lot' |
| 47 | `minh/offer_listen_01` | listening to the PM's conditions, hand on the chin |
| 48 | `minh/offer_accept_01` | nodding, agreeing to add people and budget |

### Sheet D – 20 chân dung cảm xúc cho hộp thoại

File `MINH_D_portraits.png`, lưới 4×5, prompt `prompts/MINH_D_portraits.txt`.

| # | Tên | Mô tả |
|---|---|---|
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
| 13 | `minh/face_approving` | approving nod, gentle smile |
| 14 | `minh/face_satisfied` | satisfied closed-eye smile |
| 15 | `minh/face_proud` | proud smile, chin slightly up |
| 16 | `minh/face_congrats` | big congratulating smile |
| 17 | `minh/face_encouraging` | encouraging, bright eyes |
| 18 | `minh/face_regretful` | regretful, soft sad eyes |
| 19 | `minh/face_sympathetic` | sympathetic, soft sad smile |
| 20 | `minh/face_formal` | formal, blazer buttoned, neutral |

