# RoleCraft PM60 – Bộ prompt sprite CHỊ MAI (Đại diện khách hàng/PO)

Cùng cơ chế v3 với bộ PM (`docs/PM`) và bộ Anh Minh (`docs/MINH`): nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`.

**Điểm riêng của bộ này**

- **Chỉ 4 sheet nhân vật / 148 ô.** Đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**: điện thoại, tablet, folder, trang yêu cầu, sổ, bút, ghế họp, bàn họp đều đã có.
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
|---|---|---|---|
| A | Master: chân dung, đứng, chào, đi, nói/nghe, ngồi, rời đi, cảm xúc | 8×7 | Ảnh thật + sheet A của PM (mẫu phong cách) |
| B | Tài liệu yêu cầu, tablet, điện thoại, bắt tay/đếm | 8×4 | Ảnh thật + sheet A của Chị Mai |
| C | Ngồi họp: kickoff, release, complain, mở rộng; Level 3 | 8×5 | Ảnh thật + sheet A của Chị Mai |
| D | 20 chân dung cảm xúc cho hộp thoại | 4×5 | Ảnh thật + sheet A của Chị Mai |

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

Tên trong bảng là **nhóm animation** (bỏ hậu tố `_01`, `_02`…), đúng với khoá `mai/<nhóm>` trong manifest. `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Cột "Kịch bản" trích câu hoặc diễn biến trong docs, mỗi dòng là một lần Chị Mai xuất hiện.

### Level 1 – Khởi động (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 4)

| Cảnh | Kịch bản | Sprite Chị Mai |
|---|---|---|
| S03 Thay đổi phạm vi – phòng họp kickoff | vào phòng họp | `walk` → `greet` → `sit` |
| | "Bên chị muốn bổ sung thêm hai chức năng này vào bản demo." | `meet_table_request` · face_eager |
| | "Các chức năng này không quá phức tạp, chắc chỉ mất thêm vài ngày thôi đúng không?" | `meet_table_assume` · face_assume |
| | (Huy, Lan phản hồi) | `meet_table_listen` · face_neutral |
| S03 · A | "Tốt, vậy bên chị chờ bản demo có đủ hai chức năng này." | `meet_table_pleased` · face_pleased |
| S03 · B | "Bên chị hiểu vấn đề hợp đồng, nhưng cách xử lý này hơi cứng nhắc." | `meet_table_displeased` · face_annoyed |
| S03 · C | "Được, chị cần biết rõ tác động trước khi quyết định." | `meet_table_consider` · face_thinking |

### Level 2 – Hòa nhập (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 5)

| Cảnh | Kịch bản | Sprite Chị Mai |
|---|---|---|
| S06 Deadline/chất lượng – phòng họp release | "Bên chị đã lên kế hoạch đào tạo người dùng theo ngày release…" | `meet_table_schedule` · face_concerned |
| | "Chị cần một phương án chính thức ngay hôm nay." | `meet_table_demand` → `meet_table_impatient` · face_impatient |
| S06 · A | "Tốt. Bên chị sẽ giữ lịch đào tạo như đã thông báo." | `meet_table_ok` · face_satisfied |
| S06 · B | "Việc thay đổi lịch sẽ ảnh hưởng phía chị. Chị cần bảo đảm ba ngày này thực sự giúp giảm rủi ro…" | `meet_table_doubt` · face_skeptical |
| S06 · C | "Nếu các chức năng phục vụ đào tạo vẫn hoạt động… chị có thể chấp nhận." | `meet_table_accept` · face_conditional |
| S08 Complain – họp với khách hàng | "Chức năng này đang hoạt động khác với cách bên chị đã yêu cầu…" | `complain` · face_frown |
| | (biến thể 2) "Kết quả hiện tại không giống cách bên chị hiểu khi trao đổi…" | `complain` · face_concerned |
| S08 Complain – diễn biến chung | "Chị không muốn nghe mỗi bên nói mình đúng…" | `complain_demand` · face_firm |
| S08 · A | "…chị không thể chấp nhận việc đẩy toàn bộ trách nhiệm sang khách hàng." | `defend` · face_annoyed |
| S08 · B | "Chị ghi nhận tinh thần hợp tác. Chị cần mốc hoàn thành cụ thể." | `cooperate` · face_cooperative |
| S08 · C | "Chị đồng ý nếu kết quả cuối cùng giải quyết được quy trình vận hành…" | `resolve` · face_conditional |
| S08 kết cảnh | "Chị sẽ xác nhận lại trong hôm nay. Điều chị cần là… hai bên cùng tìm giải pháp…" | `confirm` → `solution` · face_cooperative |

### Level 3 – Bứt phá (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 6: `CLIENT` tham gia S09, S10)

Docs không có thoại Level 3, chỉ có người tham gia, bối cảnh và lựa chọn.

| Cảnh | Kịch bản (spec) | Sprite Chị Mai |
|---|---|---|
| S09 Production Incident | "lỗi lúc 14:00, ảnh hưởng tới hoạt động của khách hàng" | `incident_call` → `incident_angry` · face_worried |
| S09 · A / C | client_trust +15 / +10 (sự cố được ưu tiên / rollback) | `incident_calm` · face_relieved |
| S09 · B | client_trust −5 (phục hồi kéo dài) | `phone_urgent` · face_annoyed |
| S09 sau mọi nhánh | PM gọi báo khách | `phone_call` → `phone_calm` · face_neutral |
| S10 Sales hứa quá khả năng | Sales đã hứa tính năng AI trong 10 ngày | `promise_expect` · face_eager |
| S10 · B | PM nói Sales hứa sai (client_trust −10) | `promise_shock` · face_shocked |
| S10 · C | MVP 10 ngày + phase 2 có estimate (client_trust +10) | `promise_ok` · face_satisfied |

### Level 4 – Thu hoạch (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 7)

| Cảnh | Kịch bản | Sprite Chị Mai |
|---|---|---|
| S15 Mở rộng hợp tác – phòng họp với khách hàng | "Bên chị đánh giá tích cực kết quả hiện tại và muốn mở rộng thêm module quản lý báo cáo…" | `propose` · face_eager |
| | "Nếu thống nhất trong tuần này, bên chị có thể trình ngân sách ngay trong tháng." | `budget_submit` · face_firm |
| S15 · A | (Nam báo giá ngay, Huy cảnh báo) | `meet_table_listen` · face_pleased |
| S15 · B | "Chị đồng ý về nguyên tắc, nhưng cần một mốc cụ thể để còn trình ngân sách." | `principle_ok` · face_conditional |
| S15 · C | "Cách chia phase này giống phương án MVP trước và bên chị thấy hiệu quả…" (khi có cờ `mvp_plan_agreed`) | `phase_ok` · face_satisfied |
| | "Chị cần chắc chắn Phase 1 vẫn tạo ra giá trị sử dụng thực tế, không chỉ là bản demo." | `value_check` · face_firm |
| Kết cảnh | chốt hợp tác | `satisfied` → `shake_seated` · face_cooperative |

---

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, chào, đi, nói/nghe, ngồi, rời đi, cảm xúc

File `MAI_A_master.png`, lưới 8×7, prompt `prompts/MAI_A_master.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `mai/portrait` | [portrait cell, see LAYOUT] polite professional smile, smartphone near the chest, a few sparkles |
| 2 | `mai/idle_01` | idle loop 1/4: upright poised stance, smartphone held loosely in the right hand [markers: magenta = phone] |
| 3 | `mai/idle_02` | idle loop 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = phone] |
| 4 | `mai/idle_03` | idle loop 3/4: glancing briefly at the smartphone [markers: magenta = phone] |
| 5 | `mai/idle_back_01` | standing seen from behind (back view), smartphone in the right hand [markers: magenta = phone] |
| 6 | `mai/idle_04` | idle loop 4/4: slight exhale, attentive face [markers: magenta = phone] |
| 7 | `mai/greet_01` | polite nod with a small smile, hands together in front |
| 8 | `mai/greet_02` | friendly open palm greeting, 'hello team' |
| 9 | `mai/walk_01` | walk contact: left foot forward heel touching [markers: magenta = phone] |
| 10 | `mai/walk_02` | walk down: weight on left leg, knee bent [markers: magenta = phone] |
| 11 | `mai/walk_03` | walk passing: right leg passing the left [markers: magenta = phone] |
| 12 | `mai/walk_04` | walk up: rising on left toes [markers: magenta = phone] |
| 13 | `mai/walk_05` | walk contact: right foot forward heel touching [markers: magenta = phone] |
| 14 | `mai/walk_06` | walk down: weight on right leg, knee bent [markers: magenta = phone] |
| 15 | `mai/walk_07` | walk passing: left leg passing the right [markers: magenta = phone] |
| 16 | `mai/walk_08` | walk up: rising on right toes [markers: magenta = phone] |
| 17 | `mai/talk_01` | talking, right hand open at chest height |
| 18 | `mai/talk_02` | talking, both hands slightly open, explaining a business need |
| 19 | `mai/talk_03` | talking, index finger raised making a point |
| 20 | `mai/talk_04` | talking, hand returning down, small smile |
| 21 | `mai/listen_01` | listening, arms loosely crossed, attentive |
| 22 | `mai/listen_02` | listening, head tilted, one hand on the chin |
| 23 | `mai/nod_01` | nodding, accepting |
| 24 | `mai/nod_02` | nodding, chin lifted back up |
| 25 | `mai/sit_01` | standing next to the chair, about to sit |
| 26 | `mai/sit_02` | lowering onto the chair [markers: cyan = seat] |
| 27 | `mai/sit_03` | seated upright, hands resting on the lap [markers: cyan = seat] |
| 28 | `mai/sit_04` | seated leaning back, arms crossed, waiting for an answer [markers: cyan = seat] |
| 29 | `mai/sit_05` | seated leaning forward, fingers laced, expectant [markers: cyan = seat] |
| 30 | `mai/sit_06` | standing up from the chair [markers: cyan = seat] |
| 31 | `mai/leave_01` | turning away to leave, polite nod over the shoulder [markers: magenta = phone] |
| 32 | `mai/leave_02` | walking away seen from behind, smartphone at the ear [markers: magenta = phone] |
| 33 | `mai/pleased_01` | pleased smile, small nod |
| 34 | `mai/pleased_02` | pleased, hands clasped together, sparkles |
| 35 | `mai/agree_01` | agreeing, open palm forward |
| 36 | `mai/agree_02` | conditional agreement: nodding with one finger raised |
| 37 | `mai/impressed_01` | eyebrows raised, pleasantly impressed |
| 38 | `mai/warm_01` | warm cooperative smile, hand on the chest |
| 39 | `mai/eager_01` | eager, leaning slightly forward with bright eyes, proposing something new |
| 40 | `mai/relieved_01` | relieved exhale, hand on the chest |
| 41 | `mai/frown_01` | frowning, arms crossed tightly |
| 42 | `mai/displeased_01` | displeased, lips pressed, looking aside ('hơi cứng nhắc') |
| 43 | `mai/skeptical_01` | skeptical raised eyebrow, hand on the hip |
| 44 | `mai/impatient_01` | impatient, checking the wristwatch, 'I need a plan today' |
| 45 | `mai/defensive_01` | defensive, both palms raised, 'you cannot push all the responsibility to us' |
| 46 | `mai/worried_01` | worried, hand at the mouth, one sweat drop |
| 47 | `mai/stern_01` | stern straight face, hands clasped in front |
| 48 | `mai/sigh_01` | sighing, eyes closed, small grey puff |
| 49 | `mai/request_01` | asking for more: two fingers up, 'two more features for the demo' |
| 50 | `mai/assume_01` | casual dismissive wave, confident smile, 'surely only a few more days' |
| 51 | `mai/demand_01` | palm down, firm, 'an official plan today' |
| 52 | `mai/think_01` | thinking, hand on the chin, looking up |
| 53 | `mai/think_02` | thinking, weighing the impact, eyes narrowed |
| 54 | `mai/weigh_01` | both palms up like a scale, weighing the options |
| 55 | `mai/point_01` | open hand toward the viewer, 'your proposal?' |
| 56 | `mai/open_01` | both hands open, 'let us find a solution together' |

### Sheet B – Tài liệu yêu cầu, tablet, điện thoại, bắt tay/đếm

File `MAI_B_hands_gestures.png`, lưới 8×4, prompt `prompts/MAI_B_hands_gestures.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `mai/doc_carry_01` | document folder tucked under the left arm [markers: magenta = folder] |
| 2 | `mai/doc_show_01` | holding up a requirement page, 'we described this flow clearly' [markers: magenta = page] |
| 3 | `mai/doc_show_02` | tapping the page with the finger, insistent [markers: magenta = page] |
| 4 | `mai/doc_read_01` | reading an open folder (change request, estimate, roadmap) [markers: magenta = folder] |
| 5 | `mai/doc_read_02` | reading the open folder, thoughtful frown [markers: magenta = folder] |
| 6 | `mai/doc_point_01` | pointing at a line in the open folder [markers: magenta = folder] |
| 7 | `mai/doc_sign_01` | signing the acceptance criteria on the folder with a pen [markers: magenta = folder; green = pen] |
| 8 | `mai/doc_give_01` | handing a document forward [markers: magenta = folder] |
| 9 | `mai/tab_hold_01` | holding the tablet at chest height [markers: magenta = tablet] |
| 10 | `mai/tab_read_01` | reading the tablet, calm [markers: magenta = tablet] |
| 11 | `mai/tab_read_02` | reading the tablet, frowning (the feature works differently) [markers: magenta = tablet] |
| 12 | `mai/tab_present_01` | turning the tablet screen toward the viewer (training schedule) [markers: magenta = tablet] |
| 13 | `mai/tab_present_02` | tablet turned, pointing at the screen (new module scope) [markers: magenta = tablet] |
| 14 | `mai/tab_swipe_01` | swiping on the tablet screen, which faces the viewer [markers: magenta = tablet] |
| 15 | `mai/tab_calendar_01` | tapping a date on the tablet, 'training is planned on release day' [markers: magenta = tablet] |
| 16 | `mai/tab_tuck_01` | tucking the tablet under the arm [markers: magenta = tablet] |
| 17 | `mai/phone_call_01` | phone at the ear, listening [markers: magenta = phone] |
| 18 | `mai/phone_call_02` | phone at the ear, talking, free hand open [markers: magenta = phone] |
| 19 | `mai/phone_urgent_01` | phone at the ear, urgent and upset, free hand raised (production problem) [markers: magenta = phone] |
| 20 | `mai/phone_calm_01` | phone at the ear, calming down, small nod [markers: magenta = phone] |
| 21 | `mai/phone_read_01` | reading a message on the phone [markers: magenta = phone] |
| 22 | `mai/phone_type_01` | typing a confirmation on the phone [markers: magenta = phone] |
| 23 | `mai/phone_show_01` | showing the phone screen toward the viewer [markers: magenta = phone] |
| 24 | `mai/phone_pocket_01` | putting the phone into the blazer pocket [markers: magenta = phone] |
| 25 | `mai/shake_01` | reaching out the right hand for a handshake |
| 26 | `mai/shake_02` | handshake, polite smile |
| 27 | `mai/count_01` | one finger up |
| 28 | `mai/count_02` | two fingers up, 'two features' / 'two phases' |
| 29 | `mai/timeline_01` | hand sliding sideways in the air, 'within this month' |
| 30 | `mai/budget_01` | hand raised flat, 'we can submit the budget' |
| 31 | `mai/wave_01` | small goodbye wave |
| 32 | `mai/bow_01` | polite slight bow |

### Sheet C – Ngồi họp: kickoff, release, complain, mở rộng; Level 3

File `MAI_C_meetings.png`, lưới 8×5, prompt `prompts/MAI_C_meetings.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `mai/meet_table_request_01` | seated, asking to add two features to the demo, two fingers up [markers: cyan = seat] |
| 2 | `mai/meet_table_assume_01` | seated, casual confident smile, 'only a few more days, right?' [markers: cyan = seat] |
| 3 | `mai/meet_table_listen_01` | seated, listening, hands on the table [markers: cyan = seat] |
| 4 | `mai/meet_table_listen_02` | seated, writing notes while listening [markers: cyan = seat; magenta = pen] |
| 5 | `mai/meet_table_pleased_01` | seated, pleased: 'we will wait for the demo with both features' [markers: cyan = seat] |
| 6 | `mai/meet_table_displeased_01` | seated, displeased, leaning back ('rather rigid') [markers: cyan = seat] |
| 7 | `mai/meet_table_consider_01` | seated, considering: 'I need to know the impact first' [markers: cyan = seat] |
| 8 | `mai/meet_table_talk_01` | seated, talking with an open hand [markers: cyan = seat] |
| 9 | `mai/meet_table_schedule_01` | seated, showing the training schedule on the tablet [markers: cyan = seat; magenta = tablet] |
| 10 | `mai/meet_table_demand_01` | seated, palm on the table, 'I need an official plan today' [markers: cyan = seat] |
| 11 | `mai/meet_table_impatient_01` | seated, tapping the table with the fingers, impatient [markers: cyan = seat] |
| 12 | `mai/meet_table_ok_01` | seated, satisfied nod: 'we keep the training schedule' [markers: cyan = seat] |
| 13 | `mai/meet_table_doubt_01` | seated, skeptical: 'are these three days really reducing risk?' [markers: cyan = seat] |
| 14 | `mai/meet_table_accept_01` | seated, conditional acceptance, one finger raised [markers: cyan = seat] |
| 15 | `mai/meet_table_talk_02` | seated, leaning in, explaining [markers: cyan = seat] |
| 16 | `mai/meet_table_note_01` | seated, writing a note [markers: cyan = seat; magenta = pen] |
| 17 | `mai/complain_01` | seated, pointing at the requirement page on the table, upset [markers: cyan = seat] |
| 18 | `mai/complain_02` | seated, both hands open, 'this is not how we understood it' [markers: cyan = seat] |
| 19 | `mai/complain_demand_01` | seated, 'I do not want to hear who is right, I want a solution' [markers: cyan = seat] |
| 20 | `mai/defend_01` | seated, arms crossed, rejecting the blame [markers: cyan = seat] |
| 21 | `mai/cooperate_01` | seated, acknowledging the cooperative attitude, 'I need a concrete date' [markers: cyan = seat] |
| 22 | `mai/resolve_01` | seated, agreeing to clear shared responsibilities [markers: cyan = seat] |
| 23 | `mai/confirm_01` | seated, typing a confirmation on the phone, 'I will confirm today' [markers: cyan = seat; magenta = phone] |
| 24 | `mai/solution_01` | seated, open palms, 'let both sides look for a solution' [markers: cyan = seat] |
| 25 | `mai/propose_01` | seated, proposing a new reporting module, enthusiastic [markers: cyan = seat] |
| 26 | `mai/propose_02` | seated, showing the scope on the tablet [markers: cyan = seat; magenta = tablet] |
| 27 | `mai/budget_submit_01` | seated, 'if we agree this week, I can submit the budget this month' [markers: cyan = seat] |
| 28 | `mai/principle_ok_01` | seated, agreeing in principle, 'I need a concrete milestone' [markers: cyan = seat] |
| 29 | `mai/phase_ok_01` | seated, pleased: 'phasing worked well with the MVP before' [markers: cyan = seat] |
| 30 | `mai/value_check_01` | seated, one finger raised: 'phase 1 must bring real value' [markers: cyan = seat] |
| 31 | `mai/satisfied_01` | seated, satisfied smile, hands folded [markers: cyan = seat] |
| 32 | `mai/shake_seated_01` | seated, reaching across the table for a handshake [markers: cyan = seat] |
| 33 | `mai/incident_call_01` | standing, phone at the ear, alarmed, operations are affected [markers: magenta = phone] |
| 34 | `mai/incident_call_02` | standing, phone at the ear, demanding updates [markers: magenta = phone] |
| 35 | `mai/incident_angry_01` | standing, hands on the hips, upset |
| 36 | `mai/incident_calm_01` | standing, relieved after the rollback, phone lowered [markers: magenta = phone] |
| 37 | `mai/promise_expect_01` | standing, expectant smile: the AI feature was promised in 10 days |
| 38 | `mai/promise_shock_01` | shocked and annoyed: the PM says Sales promised wrongly |
| 39 | `mai/promise_ok_01` | nodding at the MVP + estimated phase 2 plan |
| 40 | `mai/promise_listen_01` | listening, arms crossed, evaluating |

### Sheet D – 20 chân dung cảm xúc cho hộp thoại

File `MAI_D_portraits.png`, lưới 4×5, prompt `prompts/MAI_D_portraits.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `mai/face_neutral` | neutral, composed |
| 2 | `mai/face_polite` | polite professional smile |
| 3 | `mai/face_pleased` | pleased smile |
| 4 | `mai/face_eager` | eager, bright eyes, proposing something new |
| 5 | `mai/face_assume` | casual confident smile, 'it is simple, right?' |
| 6 | `mai/face_concerned` | concerned, eyebrows tilted |
| 7 | `mai/face_worried` | worried, hand near the mouth |
| 8 | `mai/face_frown` | frowning, displeased |
| 9 | `mai/face_annoyed` | annoyed, eyes narrowed |
| 10 | `mai/face_stern` | stern, straight mouth |
| 11 | `mai/face_skeptical` | one eyebrow raised, skeptical |
| 12 | `mai/face_impatient` | impatient, glancing at the watch |
| 13 | `mai/face_thinking` | thinking, eyes looking up |
| 14 | `mai/face_conditional` | conditional agreement, eyebrow up, slight smile |
| 15 | `mai/face_satisfied` | satisfied closed-eye smile |
| 16 | `mai/face_relieved` | relieved exhale |
| 17 | `mai/face_cooperative` | cooperative warm smile |
| 18 | `mai/face_shocked` | shocked, mouth open |
| 19 | `mai/face_firm` | firm, determined |
| 20 | `mai/face_formal` | formal, neutral |

