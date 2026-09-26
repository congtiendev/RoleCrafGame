# RoleCraft PM60 – Bộ prompt sprite LINH (JUNIOR_DEV – Frontend Developer)

Cùng cơ chế v3 với bộ PM (`docs/PM`), Anh Minh (`docs/MINH`), Chị Mai (`docs/CLIENT`): nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`.

**Điểm riêng của bộ này**

- **4 sheet nhân vật / 124 ô.** Đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**: laptop, checklist, sổ, bút, tablet, đèn bàn, cốc, bàn + màn hình, ghế văn phòng, ghế/bàn họp đều đã có.
- **Sheet A đính kèm sheet A của PM** làm mẫu phong cách; Linh thấp và trẻ hơn PM một chút.
- **Quay trái** (3/4 view), đối diện PM.
- **Cảnh chính là L3-S11 (push nhầm code)**: sheet B có hàng bàn code (push → hoảng) và hàng "khoảnh khắc sai sót" (sốc, thú nhận, bị phê bình, được bỏ qua, phân tích nguyên nhân, quyết tâm) cho đủ 3 nhánh.
- **Biến thể mệt** (sheet B hàng 2) cho cờ `team_ot_14_days` — giống bộ tired của PM.
- **Biến thể theo cờ L4** (`junior_publicly_blamed` → rụt rè, `deployment_checklist_added` → tự hào): sheet A hàng 6–7, sheet C hàng 2.
- **Trang phục:** áo len cổ tròn tím lavender khoác ngoài sơ mi trắng, quần chino be, giày sneaker trắng, **tai nghe đeo cổ**, **dây + thẻ nhân viên xanh royal**. Vật đặc trưng: laptop bạc. Khung chân dung nền **tím lavender**. Docs không nói giới tính của Linh: prompt dùng từ trung tính, ngoại hình theo ảnh thật.
- **Mọi ô bám một cảnh Linh xuất hiện trong kịch bản** — xem mục 5. L1 Linh chỉ có mặt, S16 chỉ được nhắc trong báo cáo.

**Các file**

| File | Dùng để |
|---|---|
| `rolecraft_linh_sprite_prompts/SOL_ONE_SHOT_PROMPT.txt` | Prompt gửi **một lần** cho GPT-5.6 Sol (đính kèm ảnh thật, `PM_A_master.png`, file zip thư mục này) |
| `rolecraft_linh_sprite_prompts/prompts/LINH_*.txt` | Prompt từng sheet, nếu muốn sinh thủ công |
| `rolecraft_linh_sprite_prompts/linh_sprite_manifest.json` | Lưới, ảnh đính kèm, tên sprite `linh/*`, **bind** từng ô → `prop/*`, `furn/*` của bộ PM |
| `rolecraft_linh_sprite_prompts/mapping_section.md` | Đối chiếu kịch bản → sprite (bản gốc của mục 5) |
| `rolecraft_linh_sprite_prompts/tools/` | `extract_anchors.py` (bản nhận mọi nhân vật), `pm_compose.js` |
| `rolecraft_linh_sprite_prompts/build.py`, `readme.py` | Nguồn sinh prompt/manifest/README: `python3 build.py && python3 readme.py` |

---

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | Nội dung | Lưới | Đính kèm |
|---|---|---|---|
| A | Master: chân dung, đứng, chào, đi, nói/nghe, ngồi, cảm xúc | 8×7 | Ảnh thật + sheet A của PM (mẫu phong cách) |
| B | Bàn code, OT (biến thể mệt), checklist/tài liệu, khoảnh khắc push nhầm | 8×4 | Ảnh thật + sheet A của Linh |
| C | Ngồi họp và 1-1 | 8×2 | Ảnh thật + sheet A của Linh |
| D | 20 chân dung cảm xúc cho hộp thoại | 4×5 | Ảnh thật + sheet A của Linh |

Sinh A trước; bản A được duyệt là ảnh tham chiếu cho B, C, D. Cách nhanh nhất: mở chat mới với **GPT-5.6 Sol**, đính kèm ảnh thật, `PM_A_master.png` và zip thư mục `rolecraft_linh_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`.

---

## 2. Điểm kiểm tra

> ✅ **Sheet A:** nhận ra người thật; nét vẽ, viền, bóng và cỡ người khớp sheet A của PM; ô 1 là chân dung khung nền **tím lavender** (chỉ ô này được vẽ laptop); các ô khác **không có đồ vật**, tay ở tư thế cầm; quay trái; chấm màu đúng các ô có `[markers]`.
>
> ✅ **Sheet B, C:** khớp sheet A; không vẽ ghế, bàn, màn hình, laptop, checklist, đèn, cốc; tư thế ngồi cùng độ cao trong một hàng; hàng OT dùng biến thể mệt; PM và team nằm ngoài khung.
>
> ✅ **Sheet D:** 20 khung giống hệt ô 1 sheet A, nền tím lavender.
>
> ✅ **Sau khi chạy script:** mở `build/report.json`; mỗi dòng `missing grip/seat marker` là một ô cần sinh lại.

---

## 3. Dùng tool

```bash
# sheets/ chứa ảnh đã duyệt, đặt tên đúng trường "file" trong manifest
python3 tools/extract_anchors.py --manifest linh_sprite_manifest.json --sheets sheets --out build
```

Kết quả `build/sprites/linh/*.png`, `anim/*.png`, `anchors.json`, `animations.json`, `report.json`. Ghép với đồ vật: nạp `anchors.json` của **cả hai** bộ (PM có `prop/*`, `furn/*`), rồi `PMCompose.create(anchors, manifest, base)` như bộ PM. Đã chạy thử tool trên sheet giả: 124 sprite, 68 strip, 0 cảnh báo.

---

## 4. Chấm neo theo ô

Ô có `[markers]` trong prompt được gắn đồ vật/nội thất trong manifest (`cells[].bind`). Nhóm chính:

| Nhóm tư thế | Đồ vật (sheet P của PM) | Nội thất (sheet O của PM) |
|---|---|---|
| idle, walk, mistake_confess, blamed_02 | laptop_closed | |
| sit_* | | office_chair |
| desk_* | | office_chair + desk_monitor |
| night_*, tired_slump | lamp_on + mugs_pair trên mặt bàn | office_chair + desk_monitor |
| checklist_*, guide, resolve, oneone_proud | checklist_sheet (+ pen khi tick) | |
| note, tab_read, laptop_show, analyze_01 | notebook_open + pen / tablet_back / laptop_open_front | |
| meet_table_*, oneone_* | notebook_open + pen khi ghi chép | meeting_chair (+ meeting_table) |

---

## 5. Mapping kịch bản → sprite

Tên trong bảng là **nhóm animation** (bỏ hậu tố `_01`, `_02`…), đúng với khoá `linh/<nhóm>` trong manifest. `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Cột "Kịch bản" trích câu hoặc diễn biến trong docs, mỗi dòng là một lần Linh xuất hiện.

### Level 1 – Khởi động (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 4)

Linh "xuất hiện trong cảnh team", không có thoại.

| Cảnh | Kịch bản | Sprite Linh |
|---|---|---|
| Cảnh team (S01, S02…) | có mặt ở khu làm việc | `desk_type` / `idle` · — |

### Level 2 – Hòa nhập (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 5)

| Cảnh | Kịch bản | Sprite Linh |
|---|---|---|
| S05 Hai dự án – phòng họp nội bộ | "Em có thể hỗ trợ thêm, nhưng hiện tại các task của dự án A đã kín trong tuần này." | `meet_table_busy` · face_unsure |
| S05 · B (OT) | "Em sẽ cố gắng, nhưng team đã làm khá căng từ đợt demo trước." | `meet_table_try` · face_worried |
| Sau S05 · B – cờ `team_ot_14_days` | team OT 2 tuần | `night_type` → `night_rub` → `tired_idle` · face_tired |
| S06 Deadline/chất lượng – phòng họp release | "Em đã sửa các lỗi trong phạm vi task của mình. Một số luồng liên quan cần dữ liệu và công cụ test chung…" | `meet_table_report` · face_neutral |

### Level 3 – Bứt phá (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 6 – S11 "Thành viên mắc lỗi nghiêm trọng", `JUNIOR_DEV` là nhân vật chính)

Docs không có thoại Level 3; thoại trong trang chơi (`THOAI_MAU.json`) do mình viết theo đúng ý lựa chọn.

| Cảnh | Kịch bản (spec) | Sprite Linh |
|---|---|---|
| S11 mở cảnh | "Junior Developer push nhầm code, làm mất dữ liệu test…" | `desk_push` → `desk_panic` → `desk_stand` · face_panic |
| | báo với PM | `mistake_shock` → `mistake_confess` · face_sorry |
| S11 · A | "Phê bình nhân sự trước team" → cờ `junior_publicly_blamed` | `blamed` · face_ashamed |
| S11 · B | "PM tự xử lý và bỏ qua để giữ hòa khí" | `forgiven` · face_relieved |
| S11 · C | "1-1, phân tích nguyên nhân và bổ sung checklist review/deploy" | `oneone_listen` → `analyze` → `resolve` · face_determined |

### Level 4 – Thu hoạch (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 7)

| Cảnh | Kịch bản | Sprite Linh |
|---|---|---|
| S13 – phòng họp nội bộ | "Có nhiều việc em làm được, nhưng em chưa rõ phần nào mình được tự quyết…" | `meet_table_unsure` · face_unsure |
| S13 · A (cờ `team_ot_14_days`) | "Team vừa trải qua một giai đoạn làm việc kéo dài…" | `tired_talk` · face_tired |
| S13 · B | "Em sẽ chạy thử theo tài liệu. Bước nào người mới không làm được thì team sửa lại ngay." | `checklist_read` → `checklist_tick` · face_determined |
| S13 · C | "Em muốn phụ trách checklist dành cho thành viên mới…" | `meet_table_volunteer` → `guide` · face_eager |
| S13 · C (cờ `junior_publicly_blamed`) | "Em hơi lo mình chưa đủ kinh nghiệm để nhận phần này…" | `hesitant` · face_hesitant |
| S14 – phòng 1-1 | "Em muốn được giao task lớn hơn và có cơ hội trở thành Developer chính thức…" | `oneone_talk` · face_eager |
| S14 (cờ `junior_publicly_blamed`) | "Sau lỗi lần trước, em không chắc team còn tin tưởng…" | `oneone_unsure` · face_anxious |
| S14 (cờ `deployment_checklist_added`) | "Em đã hoàn thiện checklist deploy… Em muốn tiếp tục chịu trách nhiệm phần này." | `oneone_proud` · face_proud |
| S14 · A | "Em sẽ cố hoàn thành nhiều task hơn, nhưng vẫn chưa biết mình cần phát triển năng lực nào…" | `oneone_confused` · face_confused |
| S14 · B | "Em đồng ý. Em muốn biết rõ tiêu chí để có thể tự theo dõi tiến bộ." | `oneone_agree` · face_happy |
| S14 · C | "Em muốn thử nhận module đó. Em sẽ cần review ở những mốc đầu tiên." | `oneone_accept` · face_determined |
| S14 · C (cờ `junior_publicly_blamed`) | "Em vẫn hơi lo mắc lỗi. Nếu có checklist và người hỗ trợ…, em sẽ nhận." | `breath` → `accept` · face_hesitant |
| S16 Final Review | chỉ được nhắc trong báo cáo ("Checklist deploy và bài học từ sai sót của Linh") | — (không có mặt) |

---

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, chào, đi, nói/nghe, ngồi, cảm xúc

File `LINH_A_master.png`, lưới 8×7, prompt `prompts/LINH_A_master.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `linh/portrait` | [portrait cell, see LAYOUT] bright eager smile, closed laptop against the chest, a few sparkles |
| 2 | `linh/idle_01` | idle loop 1/4: standing, closed laptop held against the chest with both arms [markers: magenta = laptop] |
| 3 | `linh/idle_02` | idle loop 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = laptop] |
| 4 | `linh/idle_03` | idle loop 3/4: small curious head tilt [markers: magenta = laptop] |
| 5 | `linh/idle_back_01` | standing seen from behind (back view), laptop under the right arm [markers: magenta = laptop] |
| 6 | `linh/idle_04` | idle loop 4/4: slight exhale, attentive face [markers: magenta = laptop] |
| 7 | `linh/greet_01` | cheerful small wave |
| 8 | `linh/greet_02` | quick polite bow of the head, eager smile |
| 9 | `linh/walk_01` | walk contact: left foot forward heel touching [markers: magenta = laptop] |
| 10 | `linh/walk_02` | walk down: weight on left leg, knee bent [markers: magenta = laptop] |
| 11 | `linh/walk_03` | walk passing: right leg passing the left [markers: magenta = laptop] |
| 12 | `linh/walk_04` | walk up: rising on left toes [markers: magenta = laptop] |
| 13 | `linh/walk_05` | walk contact: right foot forward heel touching [markers: magenta = laptop] |
| 14 | `linh/walk_06` | walk down: weight on right leg, knee bent [markers: magenta = laptop] |
| 15 | `linh/walk_07` | walk passing: left leg passing the right [markers: magenta = laptop] |
| 16 | `linh/walk_08` | walk up: rising on right toes [markers: magenta = laptop] |
| 17 | `linh/talk_01` | talking, one hand open at chest height, a little shy |
| 18 | `linh/talk_02` | talking, both hands moving, explaining eagerly |
| 19 | `linh/talk_03` | talking, pointing to self, 'I can help' |
| 20 | `linh/talk_04` | talking, hand returning down, small smile |
| 21 | `linh/listen_01` | listening, hands clasped in front, attentive |
| 22 | `linh/listen_02` | listening, head tilted, finger on the chin |
| 23 | `linh/nod_01` | eager nod |
| 24 | `linh/nod_02` | nodding, chin lifted back up |
| 25 | `linh/sit_01` | standing next to the chair, about to sit |
| 26 | `linh/sit_02` | lowering onto the chair [markers: cyan = seat] |
| 27 | `linh/sit_03` | seated upright, hands on the knees [markers: cyan = seat] |
| 28 | `linh/sit_04` | seated, hunched forward, focused [markers: cyan = seat] |
| 29 | `linh/sit_05` | seated, leaning back, stretching the arms [markers: cyan = seat] |
| 30 | `linh/sit_06` | standing up quickly from the chair [markers: cyan = seat] |
| 31 | `linh/sit_07` | seated, headphones pulled up over the ears, focused [markers: cyan = seat] |
| 32 | `linh/sit_08` | seated, headphones pushed down to listen [markers: cyan = seat] |
| 33 | `linh/eager_01` | eager, both fists at chest height, bright eyes |
| 34 | `linh/happy_01` | happy smile, small sparkles |
| 35 | `linh/proud_01` | proud smile, hand on the chest (the deploy checklist works) |
| 36 | `linh/relieved_01` | relieved exhale, shoulders dropping |
| 37 | `linh/determined_01` | determined nod, small fist, 'I will try' |
| 38 | `linh/thankful_01` | thankful small bow, hands together |
| 39 | `linh/confident_01` | confident stance, chin up, small smile |
| 40 | `linh/excited_01` | small excited hop, sparkles |
| 41 | `linh/worried_01` | worried, hands clasped at the chest, one sweat drop |
| 42 | `linh/anxious_01` | anxious, biting the lip, looking aside |
| 43 | `linh/ashamed_01` | head down, shoulders hunched, ashamed |
| 44 | `linh/ashamed_02` | hiding the face with one hand, embarrassed |
| 45 | `linh/apologize_01` | deep apologetic bow |
| 46 | `linh/apologize_02` | rising from the bow, eyes lowered, 'I am sorry' |
| 47 | `linh/hesitant_01` | hesitant, fingers fidgeting, 'I am not sure I am experienced enough' |
| 48 | `linh/stressed_01` | stressed, both hands on the head, small grey swirl |
| 49 | `linh/unsure_01` | unsure, scratching the back of the head |
| 50 | `linh/confused_01` | confused, small question mark |
| 51 | `linh/ask_01` | raising a hand to ask a question |
| 52 | `linh/ask_02` | hand half raised, shy |
| 53 | `linh/busy_01` | showing both hands full, 'my tasks this week are already full' |
| 54 | `linh/try_01` | small fist, nervous smile, 'I will try, but the team is stretched' |
| 55 | `linh/accept_01` | hand on the chest, 'I want to try taking that module' |
| 56 | `linh/breath_01` | deep breath, eyes closed, gathering courage |

### Sheet B – Bàn code, OT (biến thể mệt), checklist/tài liệu, khoảnh khắc push nhầm

File `LINH_B_desk_work.png`, lưới 8×4, prompt `prompts/LINH_B_desk_work.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `linh/desk_type_01` | seated, typing code, focused [markers: cyan = seat] |
| 2 | `linh/desk_type_02` | seated, typing, glancing at the monitor [markers: cyan = seat] |
| 3 | `linh/desk_fix_01` | seated, small victory fist: a bug fixed [markers: cyan = seat] |
| 4 | `linh/desk_think_01` | seated, chin on the hand, reading code [markers: cyan = seat] |
| 5 | `linh/desk_push_01` | seated, pressing Enter to push the code [markers: cyan = seat] |
| 6 | `linh/desk_panic_01` | seated, frozen, eyes wide at the monitor, exclamation mark [markers: cyan = seat] |
| 7 | `linh/desk_panic_02` | seated, both hands on the head, panicking [markers: cyan = seat] |
| 8 | `linh/desk_stand_01` | standing up from the desk in alarm |
| 9 | `linh/night_type_01` | seated, typing late at night, tired eyes [markers: cyan = seat] |
| 10 | `linh/night_type_02` | seated, typing, yawning [markers: cyan = seat] |
| 11 | `linh/night_rub_01` | seated, rubbing the eyes [markers: cyan = seat] |
| 12 | `linh/tired_idle_01` | standing, tired, shoulders slumped |
| 13 | `linh/tired_idle_02` | standing, tired, small sway |
| 14 | `linh/tired_talk_01` | tired, talking with a weak smile, 'the team is already stretched' |
| 15 | `linh/tired_yawn_01` | big yawn, hand over the mouth |
| 16 | `linh/tired_slump_01` | slumped over the desk, forehead on the arms [markers: cyan = seat] |
| 17 | `linh/checklist_read_01` | reading a checklist sheet [markers: magenta = checklist] |
| 18 | `linh/checklist_tick_01` | ticking a checklist item with a pen [markers: magenta = checklist; green = pen] |
| 19 | `linh/checklist_tick_02` | ticking the next item, nodding [markers: magenta = checklist; green = pen] |
| 20 | `linh/checklist_show_01` | proudly holding up the checklist [markers: magenta = checklist] |
| 21 | `linh/note_01` | writing notes in a notebook [markers: magenta = notebook; green = pen] |
| 22 | `linh/tab_read_01` | reading documentation on the tablet [markers: magenta = tablet] |
| 23 | `linh/guide_01` | pointing at the checklist, guiding a newcomer offscreen [markers: magenta = checklist] |
| 24 | `linh/laptop_show_01` | holding the open laptop, screen turned toward the viewer [markers: magenta = laptop] |
| 25 | `linh/mistake_shock_01` | standing, hands on the cheeks, shocked |
| 26 | `linh/mistake_confess_01` | approaching with a clasped laptop, 'I pushed the wrong code…' [markers: magenta = laptop] |
| 27 | `linh/blamed_01` | standing, head bowed, being criticized in front of the team |
| 28 | `linh/blamed_02` | standing, shrinking, clutching the laptop, eyes wet [markers: magenta = laptop] |
| 29 | `linh/forgiven_01` | small relieved smile, 'thank you' |
| 30 | `linh/analyze_01` | pointing at the open laptop screen, explaining the cause [markers: magenta = laptop] |
| 31 | `linh/analyze_02` | explaining, counting the missed steps on the fingers |
| 32 | `linh/resolve_01` | determined nod, checklist in hand [markers: magenta = checklist] |

### Sheet C – Ngồi họp và 1-1

File `LINH_C_meetings.png`, lưới 8×2, prompt `prompts/LINH_C_meetings.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `linh/meet_table_listen_01` | seated, listening, notebook on the table [markers: cyan = seat] |
| 2 | `linh/meet_table_listen_02` | seated, writing notes while listening [markers: cyan = seat; magenta = pen] |
| 3 | `linh/meet_table_talk_01` | seated, talking with an open hand [markers: cyan = seat] |
| 4 | `linh/meet_table_busy_01` | seated, apologetic smile, 'my tasks are full this week' [markers: cyan = seat] |
| 5 | `linh/meet_table_try_01` | seated, small fist, tired smile, 'I will try' [markers: cyan = seat] |
| 6 | `linh/meet_table_report_01` | seated, reporting: 'I fixed the bugs in my tasks' [markers: cyan = seat] |
| 7 | `linh/meet_table_unsure_01` | seated, unsure what can be decided alone [markers: cyan = seat] |
| 8 | `linh/meet_table_volunteer_01` | seated, raising a hand to volunteer for the checklist [markers: cyan = seat] |
| 9 | `linh/oneone_listen_01` | seated, listening, notebook on the knee [markers: cyan = seat; magenta = notebook] |
| 10 | `linh/oneone_listen_02` | seated, listening, nodding slowly [markers: cyan = seat] |
| 11 | `linh/oneone_talk_01` | seated, 'I want bigger tasks and to become a full developer' [markers: cyan = seat] |
| 12 | `linh/oneone_unsure_01` | seated, looking down, 'does the team still trust me?' [markers: cyan = seat] |
| 13 | `linh/oneone_proud_01` | seated, showing the deploy checklist proudly [markers: cyan = seat; magenta = checklist] |
| 14 | `linh/oneone_agree_01` | seated, agreeing, 'I want clear criteria to track my progress' [markers: cyan = seat] |
| 15 | `linh/oneone_accept_01` | seated, accepting the module, 'I will need reviews at the first milestones' [markers: cyan = seat] |
| 16 | `linh/oneone_confused_01` | seated, 'I still do not know what to improve' [markers: cyan = seat] |

### Sheet D – 20 chân dung cảm xúc cho hộp thoại

File `LINH_D_portraits.png`, lưới 4×5, prompt `prompts/LINH_D_portraits.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `linh/face_neutral` | neutral |
| 2 | `linh/face_eager` | eager, bright eyes |
| 3 | `linh/face_happy` | happy smile |
| 4 | `linh/face_proud` | proud smile |
| 5 | `linh/face_shy` | shy smile, slight blush |
| 6 | `linh/face_unsure` | unsure, small awkward smile |
| 7 | `linh/face_confused` | confused, head tilted |
| 8 | `linh/face_thinking` | thinking, eyes looking up |
| 9 | `linh/face_worried` | worried, eyebrows tilted |
| 10 | `linh/face_anxious` | anxious, biting the lip |
| 11 | `linh/face_shocked` | shocked, mouth open |
| 12 | `linh/face_panic` | panicking, sweat drops |
| 13 | `linh/face_ashamed` | ashamed, eyes lowered |
| 14 | `linh/face_sorry` | apologetic, eyes wet |
| 15 | `linh/face_tired` | tired, dark circles |
| 16 | `linh/face_relieved` | relieved exhale |
| 17 | `linh/face_determined` | determined |
| 18 | `linh/face_confident` | confident small smile |
| 19 | `linh/face_thankful` | thankful, gentle smile |
| 20 | `linh/face_hesitant` | hesitant, looking aside |

