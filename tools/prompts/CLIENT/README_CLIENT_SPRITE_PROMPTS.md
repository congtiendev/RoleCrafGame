# RoleCraft PM60 – Bộ prompt sprite Anh Hiệp (Khách hàng / Product Owner)

Sinh bởi `rolecraft_client_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.

**3 sheet / 140 ô / 65 animation.** Thay cho bộ “Chị Mai” cũ (kịch bản đã đổi khách hàng thành **Anh Hiệp**, xưng “anh”). Mỗi ô gắn với một câu thoại hoặc diễn biến của khách hàng trong kịch bản (mục 5). Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM.

## Thiết kế

- **Tạo hình:** nam khoảng 40 tuổi, sơ mi trắng sọc xanh nhạt, blazer nâu camel mở cúc, quần nâu sô-cô-la, giày lười nâu, đồng hồ bạc, **thẻ VISITOR trắng** (khách đến văn phòng bên PM). Vật đặc trưng: điện thoại.
- **Quay PHẢI** như PM, bàn họp bên phải: dùng thẳng ghế, bàn họp của bộ PM; khi ngồi đối diện PM thì game lật cả cụm (`flip: true`).
- **Theo kịch bản:** 4 cuộc họp ngồi bàn (S03 kickoff, S06 release, S08 complain, S15 mở rộng) và 2 cảnh gọi điện (S09 sự cố production, S10 Sales hứa 10 ngày). Không có làm đêm, sofa, chạy, màn kết thúc.
- **3 sheet:** A (8×7), C (8×8 – mỗi câu thoại/phản ứng có 2 khung để cử động), D (4×5). Không có sheet B/E vì kịch bản không cần (khách hàng không làm đêm, không xử lý sự cố tại chỗ, không kiệt sức).
- **Nền trong suốt**; quy tắc tiết kiệm token trong `SOL_ONE_SHOT_PROMPT.txt`.

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8×7) | `prompts/HIEP_A_master.txt` | ảnh thật + `PM_A_master.png` | Master: chân dung, đứng, đi, rời phòng, bắt tay, gọi điện S09/S10, nói/nghe đứng, ngồi vào bàn họp |
| C (8×8) | `prompts/HIEP_C_meetings.txt` | `HIEP_A` đã duyệt + ảnh thật | Ngồi bàn họp theo 4 cuộc họp: S03 kickoff, S06 release, S08 complain, S15 mở rộng (mỗi câu thoại 2 khung) |
| D (4×5) | `prompts/HIEP_D_portraits.txt` | `HIEP_A` đã duyệt + ảnh thật | 20 chân dung hộp thoại |

**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip thư mục `rolecraft_client_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Mỗi sheet 1 lần sinh, chỉ sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả); nền trắng thì chỉ chạy `tools/make_transparent.py`; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.

**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm C, D.

## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)

> ✅ Đúng lưới (A: 8×7; C: 8×8; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, **nền trong suốt** (không trắng, không ô caro vẽ giả).
>
> ✅ Nhận ra người thật; blazer camel, sơ mi trắng sọc xanh, thẻ VISITOR trắng; ô 1 sheet A là chân dung khung xanh mint.
>
> ✅ Không vẽ điện thoại, tablet, giấy, ghế, bàn (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.
>
> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.

## 3. Dùng tool

```bash
cd tools/prompts/CLIENT
python3 tools/make_transparent.py sheets/*.png
python3 tools/extract_anchors.py --manifest hiep_sprite_manifest.json --sheets sheets --out build
```

Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`hiep/*`), rồi `PMCompose.create(anchors, manifest, base)`.

## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)

| Nhóm tư thế | Đồ vật | Nội thất |
|---|---|---|
| idle, walk, walk_back, turn_01, phone_* | phone_back | |
| sit_01 | | meeting_chair (bên phải) |
| sit_02–05, meet_* | | meeting_chair + meeting_table |
| meet_schedule, meet_complain_03, meet_propose_02, meet_milestone | tablet_screen_34 (vẽ lịch / phạm vi lên màn hình) | meeting_chair + meeting_table |
| meet_complain_01 | contract_sheet trên mặt bàn | meeting_chair + meeting_table |
| meet_sign_01 / meet_note_01 | pen + folder_open / notebook_open trên mặt bàn | meeting_chair + meeting_table |

## 5. Mapping kịch bản → sprite

Tên là **nhóm animation** `hiep/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `hiep/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi “Anh Hiệp:” là phản ứng của Anh Hiệp khi người khác nói hoặc theo kết quả lựa chọn.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L1 S03 Thay đổi phạm vi | Vào phòng | Ngày 10 · Phòng họp kickoff, lần đầu gặp PM mới | `walk` → `greet` → `shake` → `listen` → `nod` → `talk` → `sit_01` → `sit_02` → `sit_06` → `sit_03` · `face_polite` |
| L1 S03 Thay đổi phạm vi | Mở cảnh | Anh Hiệp: “Anh muốn thêm hai chức năng vào bản demo. Chắc chỉ vài ngày thôi nhỉ?” | `meet_request` → `meet_assume` · `face_assume` |
| L1 S03 Thay đổi phạm vi |  | Lan: “Hai chức năng này nằm ngoài phạm vi đã xác nhận.” | `meet_listen` → `meet_skeptical` · `face_skeptical` |
| L1 S03 Thay đổi phạm vi | Câu hỏi | PM: “Hai chức năng... mà demo chỉ còn vài ngày.” (PM đang chọn) | `meet_wait_01` · `face_neutral` |
| L1 S03 Thay đổi phạm vi | A | PM: “Được ạ, team sẽ thêm vào.” (client_trust +10) | `meet_pleased` · `face_delighted` |
| L1 S03 Thay đổi phạm vi | B | Anh Hiệp: “Anh hiểu, nhưng cách xử lý này hơi cứng nhắc.” | `meet_displeased` · `face_annoyed` |
| L1 S03 Thay đổi phạm vi | C | Anh Hiệp: “Được, anh cần biết rõ tác động trước.” | `meet_consider` → `meet_note` · `face_conditional` |
| L1 S03 Thay đổi phạm vi | Rời phòng |  | `sit_05` → `bow_01` → `turn_01` → `idle_back_01` → `walk_back` · `face_neutral` |
| L2 S06 Deadline/chất lượng | Vào phòng | Ngày 22 · Phòng họp release | `walk` → `greet_01` → `sit` · `face_polite` |
| L2 S06 Deadline/chất lượng | Mở cảnh | Huy: “Muốn release đúng ngày thì phải bỏ vòng regression cuối.” | `meet_worried_01` · `face_worried` |
| L2 S06 Deadline/chất lượng |  | Anh Hiệp: “Lùi ba ngày thì bên anh phải đổi lịch đào tạo. Anh cần phương án ngay.” | `meet_schedule` → `meet_demand` → `meet_watch_01` → `meet_impatient` · `face_impatient` |
| L2 S06 Deadline/chất lượng | Câu hỏi | PM: “Deadline hay chất lượng... phải chọn thôi.” | `meet_wait_02` · `face_stern` |
| L2 S06 Deadline/chất lượng | A | Release đúng hạn (client_trust +10) · Huy cảnh báo lỗi luồng cũ | `meet_ok` · `face_pleased` |
| L2 S06 Deadline/chất lượng | B | Anh Hiệp: “Anh cần chắc ba ngày này thực sự giảm được rủi ro.” | `meet_doubt` · `face_skeptical` |
| L2 S06 Deadline/chất lượng | C | Release luồng critical trước (client_trust +3) | `meet_accept` · `face_conditional` |
| L2 S08 Complain | Mở cảnh | Anh Hiệp: “Kết quả không giống cách bên anh hiểu. Bên em giải quyết thế nào?” | `meet_complain_01` → `meet_complain_02` → `meet_talk` · `face_annoyed` |
| L2 S08 Complain |  | Lan: “Requirement có một câu hiểu được theo hai cách.” | `sit_04` → `meet_annoyed_01` · `face_concerned` |
| L2 S08 Complain | Biến thể 1 | Anh Hiệp: “Chức năng này chạy khác với cách bên anh đã yêu cầu.” · Huy thừa nhận đổi cách xử lý | `meet_complain_03` → `meet_complain_04` · `face_concerned` |
| L2 S08 Complain | Câu hỏi | PM: “Không phải lúc tranh luận ai đúng ai sai...” | `meet_wait_01` · `face_firm` |
| L2 S08 Complain | A | Anh Hiệp: “Anh không chấp nhận việc đẩy hết trách nhiệm sang khách hàng.” | `meet_reject` · `face_angry` |
| L2 S08 Complain | B | PM nhận lỗi, sửa miễn phí (client_trust +10) | `meet_satisfied` · `face_satisfied` |
| L2 S08 Complain | C | Anh Hiệp: “Anh đồng ý, miễn là trách nhiệm hai bên rõ ràng.” | `meet_resolve` → `meet_sign` → `meet_relieved_01` · `face_cooperative` |
| L3 S09 Incident | Mở cảnh | Hệ thống: 14:00 — Production lỗi, khách hàng bị ảnh hưởng | `phone_read_01` → `phone_call_01` → `phone_urgent_01` · `face_worried` |
| L3 S09 Incident | critical_payment_incident | Cờ regression_test_skipped: lỗi luồng thanh toán | `phone_angry_01` · `face_angry` |
| L3 S09 Incident | Sau mọi nhánh | PM: “Anh Hiệp ơi, em báo về sự cố chiều nay và cách bên em đã xử lý ạ.” | `phone_listen_01` |
| L3 S09 Incident | A / B / C | Cả team xử lý (+15) / một dev, phục hồi kéo dài (−5) / rollback, nhóm incident (+10) | A: `phone_thanks_01` · `face_relieved` · B: `phone_annoyed_01` · `face_impatient` · C: `phone_calm_01` · `face_relieved` → `phone_pocket_01` |
| L3 S10 Sales hứa 10 ngày | Mở cảnh | Linh: “Chị chốt với khách rồi: tính năng AI xong trong mười ngày!” | `phone_expect_01` · `face_eager` |
| L3 S10 Sales hứa 10 ngày | A | PM nhận deadline mười ngày | `phone_pleased_01` · `face_delighted` |
| L3 S10 Sales hứa 10 ngày | B | PM: “Anh Hiệp, bên Sales đã hứa sai, mười ngày là không khả thi.” (client_trust −10) | `phone_shock_01` → `phone_displeased_01` · `face_shocked` |
| L3 S10 Sales hứa 10 ngày | C | PM: “Mười ngày bên em giao MVP, phase 2 có estimate cụ thể.” (+10) | `phone_think_01` → `phone_ok_01` → `phone_type_01` · `face_thinking` → `face_cooperative` |
| L4 S15 Mở rộng hợp tác | Vào phòng | Ngày 56 · Phòng họp với khách hàng | `walk` → `greet_02` → `sit` · `face_polite` |
| L4 S15 Mở rộng hợp tác | client_trust thấp | Anh Hiệp yêu cầu bảo đảm mạnh hơn trước khi mở rộng | `stern_01` → `meet_guarantee` · `face_stern` |
| L4 S15 Mở rộng hợp tác | Mở cảnh | Anh Hiệp: “Bên anh muốn mở rộng thêm module báo cáo và luồng phê duyệt.” | `meet_propose` · `face_eager` |
| L4 S15 Mở rộng hợp tác |  | Linh: “Cơ hội tốt!…” · Lan: “Phạm vi mới chỉ là mong muốn…” | `meet_listen` → `meet_think` · `face_thinking` |
| L4 S15 Mở rộng hợp tác | A | PM nhận toàn bộ (client_trust +10) | `meet_delighted` · `face_delighted` |
| L4 S15 Mở rộng hợp tác | B | Anh Hiệp: “Được, nhưng anh cần mốc cụ thể để trình ngân sách.” | `meet_milestone_01` → `meet_budget_01` → `meet_sigh_01` · `face_conditional` |
| L4 S15 Mở rộng hợp tác | C | Linh tách báo giá theo phase (client_trust +15) | `meet_nod_01` → `meet_shake` · `face_satisfied` |
| L4 S15 Mở rộng hợp tác | C + mvp_plan_agreed | Anh Hiệp: “Cách chia phase này giống phương án MVP trước… Anh đồng ý nếu tiêu chí nghiệm thu của từng phase được ghi rõ.” | `meet_phase_ok` · `face_satisfied` |
| L4 S15 Mở rộng hợp tác | Kết cảnh | Chốt hợp tác | `sit_05` → `shake` → `pleased_01` → `bow_01` → `turn_01` → `walk_back` |
| Hội thoại | Anh Hiệp đứng chờ / đang nói | Mặc định khi đứng (vào phòng, bắt tay) | `idle` · `talk` · `listen` · `nod` |

Anh Hiệp chỉ có ở L1 S03, L2 S06, S08, L3 S09, S10 (qua điện thoại) và L4 S15 (kịch bản mục 2), nên không có làm đêm, sofa, chạy hay màn kết thúc. Mọi ô trong các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, đi, rời phòng, bắt tay, gọi điện S09/S10, nói/nghe đứng, ngồi vào bàn họp

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `hiep/portrait` | [portrait cell, see LAYOUT] |
| 2 | `hiep/idle_01` | idle 1/4: upright confident stance [markers: magenta = phone] |
| 3 | `hiep/idle_02` | idle 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = phone] |
| 4 | `hiep/idle_03` | idle 3/4: glancing briefly at the phone [markers: magenta = phone] |
| 5 | `hiep/idle_04` | idle 4/4: slight exhale, attentive face [markers: magenta = phone] |
| 6 | `hiep/idle_back_01` | seen from BEHIND (back view), standing [markers: magenta = phone] |
| 7 | `hiep/greet_01` | entering the meeting room: polite nod with a business smile |
| 8 | `hiep/greet_02` | friendly open palm greeting, 'hello team' |
| 9 | `hiep/walk_01` | contact: right foot forward, heel touching [markers: magenta = phone] |
| 10 | `hiep/walk_02` | down: weight on right leg, knee bent [markers: magenta = phone] |
| 11 | `hiep/walk_03` | passing: left leg passing the right [markers: magenta = phone] |
| 12 | `hiep/walk_04` | up: rising on right toes [markers: magenta = phone] |
| 13 | `hiep/walk_05` | contact: left foot forward, heel touching [markers: magenta = phone] |
| 14 | `hiep/walk_06` | down: weight on left leg, knee bent [markers: magenta = phone] |
| 15 | `hiep/walk_07` | passing: right leg passing the left [markers: magenta = phone] |
| 16 | `hiep/walk_08` | up: rising on left toes [markers: magenta = phone] |
| 17 | `hiep/walk_back_01` | walking away seen from BEHIND, step 1, phone in the right hand [markers: magenta = phone] |
| 18 | `hiep/walk_back_02` | walking away from behind, step 2 [markers: magenta = phone] |
| 19 | `hiep/walk_back_03` | walking away from behind, step 3 [markers: magenta = phone] |
| 20 | `hiep/walk_back_04` | walking away from behind, step 4 [markers: magenta = phone] |
| 21 | `hiep/turn_01` | turning away to leave, polite nod over the shoulder [markers: magenta = phone] |
| 22 | `hiep/shake_01` | reaching out the right hand for a handshake, business smile |
| 23 | `hiep/shake_02` | firm handshake, satisfied smile |
| 24 | `hiep/bow_01` | short polite nod goodbye, hands free |
| 25 | `hiep/phone_read_01` | reading an alert on the phone, frowning, exclamation mark [markers: magenta = phone] |
| 26 | `hiep/phone_call_01` | phone at the ear, listening, serious [markers: magenta = phone] |
| 27 | `hiep/phone_urgent_01` | phone at the ear, upset, free hand raised, 'our operations are affected' [markers: magenta = phone] |
| 28 | `hiep/phone_angry_01` | phone at the ear, angry, free hand on the hip, small anger mark (payment flow down) [markers: magenta = phone] |
| 29 | `hiep/phone_listen_01` | phone at the ear, listening to the PM's report, eyes narrowed [markers: magenta = phone] |
| 30 | `hiep/phone_calm_01` | phone at the ear, calming down, relieved exhale [markers: magenta = phone] |
| 31 | `hiep/phone_annoyed_01` | phone at the ear, annoyed, rubbing the forehead, 'it is taking too long' [markers: magenta = phone] |
| 32 | `hiep/phone_thanks_01` | phone at the ear, appreciative nod, small smile [markers: magenta = phone] |
| 33 | `hiep/phone_expect_01` | phone at the ear, expectant smile, 'ten days, right?' [markers: magenta = phone] |
| 34 | `hiep/phone_pleased_01` | phone at the ear, pleased, thumbs up with the free hand [markers: magenta = phone] |
| 35 | `hiep/phone_shock_01` | phone at the ear, shocked, eyebrows up, exclamation mark [markers: magenta = phone] |
| 36 | `hiep/phone_displeased_01` | phone at the ear, displeased, pinching the bridge of the nose [markers: magenta = phone] |
| 37 | `hiep/phone_think_01` | phone at the ear, considering, free hand at the chin [markers: magenta = phone] |
| 38 | `hiep/phone_ok_01` | phone at the ear, agreeing, nodding [markers: magenta = phone] |
| 39 | `hiep/phone_type_01` | typing a confirmation on the phone with the thumb [markers: magenta = phone] |
| 40 | `hiep/phone_pocket_01` | putting the phone into the blazer pocket, call ended [markers: magenta = phone] |
| 41 | `hiep/talk_01` | talking, right hand open at chest height |
| 42 | `hiep/talk_02` | talking, both hands slightly open, explaining a business need |
| 43 | `hiep/listen_01` | listening, arms loosely crossed, attentive |
| 44 | `hiep/listen_02` | listening, head tilted, one hand at the chin |
| 45 | `hiep/nod_01` | nodding, accepting |
| 46 | `hiep/nod_02` | chin back up after the nod |
| 47 | `hiep/pleased_01` | pleased smile, small nod, two golden sparkles |
| 48 | `hiep/stern_01` | stern straight face, hands clasped in front, expecting guarantees |
| 49 | `hiep/sit_01` | standing in front of the chair, about to sit, unbuttoning the blazer |
| 50 | `hiep/sit_02` | lowering onto the chair [markers: cyan = seat] |
| 51 | `hiep/sit_03` | seated upright, forearms on the table [markers: cyan = seat] |
| 52 | `hiep/sit_04` | seated, leaning back, arms crossed [markers: cyan = seat] |
| 53 | `hiep/sit_05` | standing up from the chair [markers: cyan = seat] |
| 54 | `hiep/meet_wait_01` | seated, fingers laced on the table, waiting for the PM's answer [markers: cyan = seat] |
| 55 | `hiep/meet_wait_02` | seated, leaning back, one eyebrow raised, waiting [markers: cyan = seat] |
| 56 | `hiep/sit_06` | seated, straightening the blazer before the meeting starts [markers: cyan = seat] |

### Sheet C – Ngồi bàn họp theo 4 cuộc họp: S03 kickoff, S06 release, S08 complain, S15 mở rộng (mỗi câu thoại 2 khung)

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `hiep/meet_request_01` | two fingers up, asking, 'two more features for the demo' [markers: cyan = seat] |
| 2 | `hiep/meet_request_02` | two fingers up, leaning in, mouth open mid-sentence [markers: cyan = seat] |
| 3 | `hiep/meet_assume_01` | casual dismissive wave with a confident smile, 'just a few days, right?' [markers: cyan = seat] |
| 4 | `hiep/meet_assume_02` | leaning back, relaxed confident smile, palm up [markers: cyan = seat] |
| 5 | `hiep/meet_listen_01` | listening, forearms on the table [markers: cyan = seat] |
| 6 | `hiep/meet_listen_02` | listening, slight head tilt [markers: cyan = seat] |
| 7 | `hiep/meet_skeptical_01` | one eyebrow raised, skeptical, hand at the chin [markers: cyan = seat] |
| 8 | `hiep/meet_skeptical_02` | skeptical, arms crossed on the table [markers: cyan = seat] |
| 9 | `hiep/meet_pleased_01` | pleased smile, nodding [markers: cyan = seat] |
| 10 | `hiep/meet_pleased_02` | delighted, hands clasped on the table, sparkles [markers: cyan = seat] |
| 11 | `hiep/meet_displeased_01` | displeased, lips pressed, looking aside, 'that is a bit rigid' [markers: cyan = seat] |
| 12 | `hiep/meet_displeased_02` | leaning back, small sigh, still polite [markers: cyan = seat] |
| 13 | `hiep/meet_consider_01` | one finger raised, 'fine, but I need to know the impact first' [markers: cyan = seat] |
| 14 | `hiep/meet_consider_02` | hand at the chin, considering, calm [markers: cyan = seat] |
| 15 | `hiep/meet_note_01` | writing a note with a pen [markers: cyan = seat; magenta = pen] |
| 16 | `hiep/meet_note_02` | writing, looking up to listen [markers: cyan = seat; magenta = pen] |
| 17 | `hiep/meet_worried_01` | worried frown, hearing the last regression round may be dropped [markers: cyan = seat] |
| 18 | `hiep/meet_schedule_01` | turning a tablet toward the other side, showing the training schedule [markers: cyan = seat; magenta = tablet] |
| 19 | `hiep/meet_schedule_02` | tapping a date on the tablet, 'training is on release day' [markers: cyan = seat; magenta = tablet] |
| 20 | `hiep/meet_demand_01` | palm flat on the table, firm, 'I need a plan now' [markers: cyan = seat] |
| 21 | `hiep/meet_demand_02` | index finger tapping the table, firm [markers: cyan = seat] |
| 22 | `hiep/meet_watch_01` | checking the wristwatch, pressed for time [markers: cyan = seat] |
| 23 | `hiep/meet_impatient_01` | drumming the fingers on the table, impatient [markers: cyan = seat] |
| 24 | `hiep/meet_impatient_02` | drumming the fingers, glancing at the other side [markers: cyan = seat] |
| 25 | `hiep/meet_ok_01` | satisfied nod, 'release on time, good' [markers: cyan = seat] |
| 26 | `hiep/meet_ok_02` | relaxed smile, leaning back [markers: cyan = seat] |
| 27 | `hiep/meet_doubt_01` | leaning back, doubtful, 'will three days really reduce the risk?' [markers: cyan = seat] |
| 28 | `hiep/meet_doubt_02` | palm up, questioning look [markers: cyan = seat] |
| 29 | `hiep/meet_accept_01` | conditional agreement: nodding with one finger raised [markers: cyan = seat] |
| 30 | `hiep/meet_accept_02` | small nod, hands folded on the table [markers: cyan = seat] |
| 31 | `hiep/meet_talk_01` | talking with an open hand [markers: cyan = seat] |
| 32 | `hiep/meet_talk_02` | leaning in, explaining [markers: cyan = seat] |
| 33 | `hiep/meet_complain_01` | pointing at a requirement page lying on the table, upset [markers: cyan = seat] |
| 34 | `hiep/meet_complain_02` | both hands open, 'this is not how we understood it, how will you fix it?' [markers: cyan = seat] |
| 35 | `hiep/meet_complain_03` | turning a tablet toward the other side, showing the feature behaving differently [markers: cyan = seat; magenta = tablet] |
| 36 | `hiep/meet_complain_04` | tapping the tablet screen, frowning [markers: cyan = seat] |
| 37 | `hiep/meet_annoyed_01` | annoyed, eyes narrowed, tapping the table once [markers: cyan = seat] |
| 38 | `hiep/meet_reject_01` | arms crossed, firm, 'I don't accept pushing all the responsibility onto us' [markers: cyan = seat] |
| 39 | `hiep/meet_reject_02` | palm raised forward, stern [markers: cyan = seat] |
| 40 | `hiep/meet_reject_03` | leaning back, shaking the head, disappointed [markers: cyan = seat] |
| 41 | `hiep/meet_satisfied_01` | satisfied smile, hands folded on the table [markers: cyan = seat] |
| 42 | `hiep/meet_satisfied_02` | satisfied nod, leaning back [markers: cyan = seat] |
| 43 | `hiep/meet_resolve_01` | calm nod, open palms, 'agreed, as long as both sides' responsibilities are clear' [markers: cyan = seat] |
| 44 | `hiep/meet_resolve_02` | one hand on the chest, cooperative [markers: cyan = seat] |
| 45 | `hiep/meet_sign_01` | signing the acceptance criteria in an open folder on the table with a pen [markers: cyan = seat; magenta = pen] |
| 46 | `hiep/meet_sign_02` | pen lifted after signing, small nod [markers: cyan = seat; magenta = pen] |
| 47 | `hiep/meet_nod_01` | nodding, agreeing [markers: cyan = seat] |
| 48 | `hiep/meet_sigh_01` | sighing, eyes closed, small grey puff [markers: cyan = seat] |
| 49 | `hiep/meet_propose_01` | leaning forward, enthusiastic, proposing a new reporting module [markers: cyan = seat] |
| 50 | `hiep/meet_propose_02` | turning a tablet toward the other side, showing the new scope [markers: cyan = seat; magenta = tablet] |
| 51 | `hiep/meet_propose_03` | both hands open, eager, 'and an approval flow too' [markers: cyan = seat] |
| 52 | `hiep/meet_guarantee_01` | arms crossed, serious, asking for stronger guarantees first [markers: cyan = seat] |
| 53 | `hiep/meet_guarantee_02` | index finger raised, stern [markers: cyan = seat] |
| 54 | `hiep/meet_think_01` | thinking, hand at the chin, looking up [markers: cyan = seat] |
| 55 | `hiep/meet_think_02` | thinking, eyes narrowed, weighing the offer [markers: cyan = seat] |
| 56 | `hiep/meet_relieved_01` | relieved, shoulders relaxed, small smile [markers: cyan = seat] |
| 57 | `hiep/meet_delighted_01` | delighted, both hands open, 'you take all of it? great' [markers: cyan = seat] |
| 58 | `hiep/meet_delighted_02` | delighted laugh, leaning back [markers: cyan = seat] |
| 59 | `hiep/meet_milestone_01` | tapping a date on the tablet, 'I need concrete milestones' [markers: cyan = seat; magenta = tablet] |
| 60 | `hiep/meet_budget_01` | hand raised flat, 'so I can submit the budget' [markers: cyan = seat] |
| 61 | `hiep/meet_phase_ok_01` | pleased, one finger raised, 'phasing worked with the MVP' [markers: cyan = seat] |
| 62 | `hiep/meet_phase_ok_02` | counting two fingers, 'acceptance criteria for each phase' [markers: cyan = seat] |
| 63 | `hiep/meet_shake_01` | reaching across the table for a handshake, deal [markers: cyan = seat] |
| 64 | `hiep/meet_shake_02` | handshake across the table, big smile [markers: cyan = seat] |

### Sheet D – 20 chân dung hộp thoại

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `hiep/face_neutral` | neutral, composed |
| 2 | `hiep/face_polite` | polite business smile |
| 3 | `hiep/face_pleased` | pleased smile |
| 4 | `hiep/face_delighted` | delighted, big smile, sparkles |
| 5 | `hiep/face_assume` | casual confident smile, 'it's simple, right?' |
| 6 | `hiep/face_eager` | eager, bright eyes |
| 7 | `hiep/face_concerned` | concerned, eyebrows tilted |
| 8 | `hiep/face_worried` | worried, sweat drop |
| 9 | `hiep/face_impatient` | impatient, lips pressed, eyebrows lowered |
| 10 | `hiep/face_annoyed` | annoyed, eyes narrowed |
| 11 | `hiep/face_angry` | angry, small anger mark |
| 12 | `hiep/face_shocked` | shocked, mouth open |
| 13 | `hiep/face_skeptical` | one eyebrow raised, skeptical |
| 14 | `hiep/face_stern` | stern, straight mouth |
| 15 | `hiep/face_firm` | firm, determined, jaw set |
| 16 | `hiep/face_thinking` | thinking, eyes looking up |
| 17 | `hiep/face_conditional` | conditional agreement, one eyebrow up, slight smile |
| 18 | `hiep/face_cooperative` | cooperative warm smile |
| 19 | `hiep/face_relieved` | relieved, soft smile |
| 20 | `hiep/face_satisfied` | satisfied closed-eye smile |

