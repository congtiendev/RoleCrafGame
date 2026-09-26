# RoleCraft PM60 – Bộ prompt sprite Lan – BA/QA

Cùng cơ chế v3 với bộ PM (`docs/PM`) và các bộ MINH, CLIENT, LINH: nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`. **4 sheet nhân vật / 188 ô**; đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**. Kịch bản gốc: `docs/KICH_BAN_ROLECRAFT_PM60.md`.

**Các file**

| File | Dùng để |
|---|---|
| `rolecraft_lan_sprite_prompts/SOL_ONE_SHOT_PROMPT.txt` | Prompt gửi **một lần** cho GPT-5.6 Sol (đính kèm ảnh thật, `PM_A_master.png`, file zip thư mục này) |
| `rolecraft_lan_sprite_prompts/prompts/LAN_*.txt` | Prompt từng sheet, nếu muốn sinh thủ công |
| `rolecraft_lan_sprite_prompts/lan_sprite_manifest.json` | Lưới, ảnh đính kèm, tên sprite `lan/*`, **bind** từng ô → `prop/*`, `furn/*` của bộ PM |
| `rolecraft_lan_sprite_prompts/mapping_section.md` | Đối chiếu kịch bản → sprite (bản gốc của mục 5) |
| `rolecraft_lan_sprite_prompts/tools/` | `extract_anchors.py` (bản nhận mọi nhân vật), `pm_compose.js` |
| `rolecraft_lan_sprite_prompts/build.py`, `readme.py` | Nguồn sinh prompt/manifest/README: `python3 build.py && python3 readme.py` |

---

## 1. Thứ tự sinh, ảnh đính kèm, tạo hình


### Thứ tự tạo ảnh

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8x7) | `prompts/LAN_A_master.txt` | ảnh thật + `PM_A_master.png` (chỉ lấy style) | Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (lo lắng, phản biện) |
| B (8x7) | `prompts/LAN_B_hands_gestures.txt` | ảnh thật + `LAN_A_master.png` | Cầm nắm + cử chỉ BA/QA |
| C (8x7) | `prompts/LAN_C_work_scenes.txt` | ảnh thật + `LAN_A_master.png` | Bàn test, họp khách, 1-1, go/no-go, sự cố, OT, kết thúc |
| D (4x5) | `prompts/LAN_D_portraits.txt` | ảnh thật + `LAN_A_master.png` | 20 chân dung cảm xúc cho hộp thoại |

Tạo sheet A trước và duyệt, sau đó B, C, D đính kèm A làm chuẩn.

### Tạo hình nhân vật (theo docs)

- Vai trò: BA/QA – “cẩn thận, quan tâm quy trình và chất lượng” (docs/KICH_BAN_ROLECRAFT_PM60.md, mục 2).
- Xưng “em” với PM và Huy → trẻ hơn PM một chút; lịch sự nhưng dám phản biện (“Nhưng…”, “Em vẫn lo…”).
- Đạo cụ đặc trưng: tờ test checklist (`prop/checklist_sheet`); laptop mở trên cẳng tay khi chạy test.
- Thẻ nhân viên xanh (nhân viên chính thức), khác thẻ cam của PM thử việc.

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
python3 tools/extract_anchors.py --manifest lan_sprite_manifest.json --sheets sheets --out build
```

Kết quả `build/sprites/lan/*.png`, `anim/*.png`, `anchors.json`, `animations.json`, `report.json`. Ghép với đồ vật: nạp `anchors.json` của cả bộ PM (có `prop/*`, `furn/*`) và bộ này, rồi `PMCompose.create(anchors, manifest, base)`.

---

## 4. Chấm neo theo ô

Ô có `[markers]` trong prompt được gắn đồ vật/nội thất trong manifest (`cells[].bind`); danh sách đầy đủ ở mục 6.

---

## 5. Mapping kịch bản → sprite

Tên trong bảng là **nhóm animation** (`lan/<nhóm>`) hoặc một ô cụ thể (`lan/<ô>_01`). `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Kịch bản gốc: `docs/KICH_BAN_ROLECRAFT_PM60.md`; thoại trong game: `THOAI_MAU.json`.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| `P1_INTRO` | Mở đầu | Một số requirement và test case chưa được xác nhận đầy đủ. | `lan/talk_03`, `lan/face_cautious` |
| `P1_S01_PROJECT_TAKEOVER` | Mở cảnh | Tài liệu chưa phản ánh hết… requirement chỉ trao đổi qua tin nhắn. | `lan/doc_read` → `lan/doc_compare` → `lan/check_flag_01`, `lan/face_worried` |
| `P1_S01_PROJECT_TAKEOVER` | Nhánh A | Em sẽ tổng hợp requirement, test status… | `lan/check_tick`, `lan/face_focused` |
| `P1_S01_PROJECT_TAKEOVER` | Nhánh B | Em vẫn lo một số giả định cũ chưa được kiểm tra lại. | `lan/worry_01`, `lan/face_worried` |
| `P1_S02_SENIOR_AUTONOMY` | Tin nhắn | Em chưa xác nhận thay đổi này… có thể phát sinh tranh chấp. | `lan/phone_type`, `lan/face_anxious` |
| `P1_S03_SCOPE_CHANGE` | Mở cảnh | Hai chức năng này chưa nằm trong phạm vi… cần acceptance criteria. | `lan/meet_table_talk`, `lan/face_cautious` |
| `P1_S04_TOOL_BUDGET` | Mở cảnh | Team quản lý test case thủ công. Em đề xuất mua bộ công cụ chung. | `lan/tab_present` → `lan/propose`, `lan/face_hopeful` |
| `P2_S05_DUAL_DEADLINE` | Mở cảnh | Em cần hoàn tất test case và xác nhận requirement với chị Mai… | `lan/talk_02`, `lan/worry_02`, `lan/face_worried` |
| `P2_S05_DUAL_DEADLINE` | Nhánh A/B/C | Tách requirement / regression bị dồn cuối ngày / workshop khách hàng B. | `lan/check_tick`, `lan/stress_02`, `lan/wb_sticky` |
| `P2_S05_DUAL_DEADLINE` | Kết cảnh | Giữ deadline hay giữ đủ vòng kiểm thử. | `lan/think_01`, `lan/face_serious` |
| `P2_S06_DEADLINE_QUALITY` | Mở cảnh | Chức năng mới pass, regression luồng cũ chưa chạy hết. | `lan/lap_show`, `lan/face_serious` |
| `P2_S06_DEADLINE_QUALITY` | Nhánh A | Em sẽ theo dõi sau release, nhưng vẫn còn rủi ro. | `lan/release_watch_01`, `lan/face_worried` |
| `P2_S06_DEADLINE_QUALITY` | Nhánh B | Em sẽ cung cấp test report từng ngày. | `lan/release_report_01`, `lan/face_focused` |
| `P2_S06_DEADLINE_QUALITY` | Nhánh C | Em xác định test scope và tiêu chí go/no-go. | `lan/release_check`, `lan/count`, `lan/release_go` |
| `P2_S08_CUSTOMER_COMPLAINT` | Mở cảnh | Requirement có một câu hiểu được theo hai cách. | `lan/doc_raise_01`, `lan/two_ways`, `lan/face_cautious` |
| `P2_S08_CUSTOMER_COMPLAINT` | Nhánh A/B | Chưa giải quyết kỳ vọng thực tế / không làm rõ thì lần sau vẫn hiểu sai. | `lan/meet_table_worry_01`, `lan/firm_01` |
| `P2_S08_CUSTOMER_COMPLAINT` | Nhánh C + kết | Cập nhật acceptance criteria bằng ví dụ; gửi biên bản mới. | `lan/meet_table_note`, `lan/doc_give`, `lan/face_relieved` |
| `P3_S09_PRODUCTION_INCIDENT` | Mở cảnh | Sự cố production (QA_BA có mặt). | `lan/alert`, `lan/incident_lap_01`, `lan/face_surprised` |
| `P3_S11_JUNIOR_MISTAKE` | Mở cảnh | Team sẽ mất gần một ngày để khôi phục. | `lan/incident_calc_01`, `lan/face_sigh` |
| `P3_S11_JUNIOR_MISTAKE` | Nhánh C | Bổ sung checklist review/deploy. | `lan/support`, `lan/checklist_write_01`, `lan/checklist_show_01` |
| `P4_S13_OPERATING_SYSTEM` | Mở cảnh | Checklist, requirement, deploy nằm rải rác, có bước chỉ nhắc trong chat. | `lan/talk_02`, `lan/face_serious` |
| `P4_S13_OPERATING_SYSTEM` | Nhánh A | Lỗi regression vẫn phụ thuộc vào việc từng người tự nhớ. | `lan/disappoint_01`, `lan/face_sigh` |
| `P4_S13_OPERATING_SYSTEM` | Nhánh B/C | Hợp nhất test checklist… mỗi quy trình có một chỉ số theo dõi. | `lan/check_hold_01`, `lan/own`, `lan/face_bright` |
| `P4_S14_TEAM_DEVELOPMENT` | 1-1 | QA chỉ được đánh giá bằng số lỗi tìm thấy, phần ngăn lỗi chưa được ghi nhận. | `lan/oneone_talk`, `lan/oneone_hope_01`, `lan/face_hopeful` |
| `P4_S14_TEAM_DEVELOPMENT` | Nhánh A | Việc QA ngăn lỗi không tạo ra ticket. | `lan/sigh_01`, `lan/face_sympathetic` |
| `P4_S14_TEAM_DEVELOPMENT` | Nhánh B | Công việc chất lượng sẽ được ghi nhận đúng hơn. | `lan/oneone_relieved_01`, `lan/happy_01`, `lan/face_relieved` |
| `P4_S14_TEAM_DEVELOPMENT` | Nhánh C | QA có quyền chặn release theo tiêu chí thống nhất. | `lan/gate_stop`, `lan/own`, `lan/face_firm` |
| `P4_S15_CLIENT_EXPANSION` | Mở cảnh | Phạm vi mới chỉ ở mức mong muốn, chưa có acceptance criteria. | `lan/meet_table_talk`, `lan/caution_01`, `lan/face_cautious` |
| `P4_S15_CLIENT_EXPANSION` | Nhánh A | Acceptance criteria chưa rõ, về sau khó xác định phạm vi. | `lan/worry_01`, `lan/face_worried` |
| `END` | Kết thúc | Chúc mừng / chia tay PM (không có thoại trong docs – dùng cho màn kết). | `lan/cheer`, `lan/congrats`, `lan/sad_01`, `lan/bow_01` |

---

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (lo lắng, phản biện)

File `LAN_A_master.png`, lưới 8×7, prompt `prompts/LAN_A_master.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `lan/portrait` | [portrait cell, see LAYOUT] gentle attentive smile, checklist sheet against the chest, a few sparkles |
| 2 | `lan/idle_01` | idle loop 1/4: upright tidy stance, checklist sheet held against the chest with the left arm [markers: magenta = checklist] |
| 3 | `lan/idle_02` | idle loop 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = checklist] |
| 4 | `lan/idle_03` | idle loop 3/4: glancing down at the checklist for a moment [markers: magenta = checklist] |
| 5 | `lan/idle_back_01` | standing seen from behind (back view), checklist sheet in the left hand [markers: magenta = checklist] |
| 6 | `lan/idle_04` | idle loop 4/4: slight exhale, calm attentive face [markers: magenta = checklist] |
| 7 | `lan/greet_01` | small polite bow of the head, friendly smile, hands together in front |
| 8 | `lan/greet_02` | small friendly wave at shoulder height, 'hello' |
| 9 | `lan/walk_01` | walk contact: left foot forward heel touching [markers: magenta = checklist] |
| 10 | `lan/walk_02` | walk down: weight on left leg, knee bent [markers: magenta = checklist] |
| 11 | `lan/walk_03` | walk passing: right leg passing the left [markers: magenta = checklist] |
| 12 | `lan/walk_04` | walk up: rising on left toes [markers: magenta = checklist] |
| 13 | `lan/walk_05` | walk contact: right foot forward heel touching [markers: magenta = checklist] |
| 14 | `lan/walk_06` | walk down: weight on right leg, knee bent [markers: magenta = checklist] |
| 15 | `lan/walk_07` | walk passing: left leg passing the right [markers: magenta = checklist] |
| 16 | `lan/walk_08` | walk up: rising on right toes [markers: magenta = checklist] |
| 17 | `lan/talk_01` | talking, right hand open at chest height, polite |
| 18 | `lan/talk_02` | talking, both hands slightly open, explaining step by step |
| 19 | `lan/talk_03` | talking, index finger lightly raised, 'but...' — adding a careful objection |
| 20 | `lan/talk_04` | talking, hand returning down, small reassuring smile |
| 21 | `lan/listen_01` | listening, hands loosely clasped in front, attentive |
| 22 | `lan/listen_02` | listening, head tilted, one hand at the chin |
| 23 | `lan/nod_01` | nodding, eyes half closed, agreeing |
| 24 | `lan/nod_02` | nodding, chin lifted back up |
| 25 | `lan/sit_01` | standing next to the chair, about to sit |
| 26 | `lan/sit_02` | lowering onto the chair [markers: cyan = seat] |
| 27 | `lan/sit_03` | seated upright, hands resting on the knees [markers: cyan = seat] |
| 28 | `lan/sit_04` | seated, leaning slightly forward, listening carefully [markers: cyan = seat] |
| 29 | `lan/sit_05` | seated, hands clasped on the lap, a little tense [markers: cyan = seat] |
| 30 | `lan/sit_06` | seated, writing in a notebook on the lap with a pen [markers: cyan = seat; magenta = notebook; green = pen] |
| 31 | `lan/sit_07` | seated, reading a phone held in the right hand [markers: cyan = seat; magenta = phone] |
| 32 | `lan/sit_08` | standing up from the chair [markers: cyan = seat] |
| 33 | `lan/good_01` | relieved small smile, soft nod, two golden sparkles |
| 34 | `lan/good_02` | thumbs up with the right hand, 'test passed', sparkles |
| 35 | `lan/good_03` | quietly proud smile, hands clasped in front |
| 36 | `lan/good_04` | laughing softly, hand covering the mouth |
| 37 | `lan/applaud_01` | applauding, hands apart |
| 38 | `lan/applaud_02` | applauding, hands together |
| 39 | `lan/happy_01` | eyes shining, both hands clasped at the chest, 'my work is finally recognized' |
| 40 | `lan/relieved_01` | relieved exhale, hand on the chest, small smile |
| 41 | `lan/worry_01` | worried eyebrows, hand at the chin, 'I'm still worried about it' |
| 42 | `lan/worry_02` | anxious, both hands clasped at the chest, one sweat drop |
| 43 | `lan/doubt_01` | doubtful, head tilted, small question mark |
| 44 | `lan/object_01` | raising one hand at shoulder height, hesitant but determined to object |
| 45 | `lan/frown_01` | frowning slightly, arms crossed over the chest |
| 46 | `lan/sigh_01` | sighing, shoulders dropped, small grey puff |
| 47 | `lan/firm_01` | firm but polite, small head shake, eyes closed, 'not confirmed yet' |
| 48 | `lan/disappoint_01` | disappointed, eyes lowered, lips pressed |
| 49 | `lan/think_01` | thinking, hand at the chin, looking up |
| 50 | `lan/think_02` | thinking, eyes closed, finger tapping the lips |
| 51 | `lan/inspect_01` | leaning forward, eyes narrowed, inspecting something closely |
| 52 | `lan/caution_01` | index finger raised beside the face, 'wait, let's check first' |
| 53 | `lan/crossarms_01` | arms crossed, calm, waiting for an answer |
| 54 | `lan/front_hands_01` | hands politely folded in front, standing straight, ready |
| 55 | `lan/stop_01` | palm raised forward at chest height, calmly stopping a hasty decision |
| 56 | `lan/point_01` | open hand gesturing forward, 'your decision' |

### Sheet B – Cầm nắm + cử chỉ BA/QA

File `LAN_B_hands_gestures.png`, lưới 8×7, prompt `prompts/LAN_B_hands_gestures.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `lan/check_hold_01` | holding the checklist sheet in both hands at chest height, reading [markers: magenta = checklist] |
| 2 | `lan/check_tick_01` | ticking an item on the checklist with a pen [markers: magenta = checklist; green = pen] |
| 3 | `lan/check_tick_02` | ticking the next item, small satisfied nod [markers: magenta = checklist; green = pen] |
| 4 | `lan/check_flag_01` | circling an item with the pen, frowning slightly (found a gap) [markers: magenta = checklist; green = pen] |
| 5 | `lan/check_tap_01` | tapping the pen against the checklist, thinking [markers: magenta = checklist; green = pen] |
| 6 | `lan/check_show_01` | turning the checklist toward the viewer to show it [markers: magenta = checklist] |
| 7 | `lan/check_give_01` | handing the checklist forward with both hands [markers: magenta = checklist] |
| 8 | `lan/check_hug_01` | hugging the checklist to the chest, small smile [markers: magenta = checklist] |
| 9 | `lan/lap_hold_01` | laptop balanced on the left forearm, looking at the screen [markers: magenta = laptop] |
| 10 | `lan/lap_type_01` | typing with the right hand on the balanced laptop [markers: magenta = laptop] |
| 11 | `lan/lap_type_02` | typing, glancing up over the laptop [markers: magenta = laptop] |
| 12 | `lan/lap_read_01` | reading a test result on the laptop, frowning [markers: magenta = laptop] |
| 13 | `lan/lap_bug_01` | spotting a bug on the laptop, eyes wide, small exclamation mark [markers: magenta = laptop] |
| 14 | `lan/lap_show_01` | turning the laptop screen toward the viewer [markers: magenta = laptop] |
| 15 | `lan/lap_show_02` | laptop turned toward the viewer, pointing at the screen with the free hand [markers: magenta = laptop] |
| 16 | `lan/lap_pass_01` | looking at the laptop, satisfied small nod, one sparkle [markers: magenta = laptop] |
| 17 | `lan/doc_read_01` | reading an open folder held in both hands [markers: magenta = folder] |
| 18 | `lan/doc_read_02` | reading the open folder, flipping a page [markers: magenta = folder] |
| 19 | `lan/doc_compare_01` | holding two pages side by side, one in each hand, comparing them [markers: magenta = page; green = checklist] |
| 20 | `lan/doc_compare_02` | still holding the two pages, eyebrows raised, noticing a mismatch [markers: magenta = page; green = checklist] |
| 21 | `lan/doc_raise_01` | raising a single page and pointing at one line on it, 'this sentence can be read two ways' [markers: magenta = page] |
| 22 | `lan/doc_stack_01` | carrying a small stack of papers in both arms [markers: magenta = papers] |
| 23 | `lan/doc_give_01` | extending a closed folder forward with both hands (the new meeting minutes) [markers: magenta = folder] |
| 24 | `lan/doc_give_02` | folder handed over, hands returning, polite smile [markers: magenta = folder] |
| 25 | `lan/wb_write_01` | writing on the whiteboard with a marker [markers: magenta = marker] |
| 26 | `lan/wb_write_02` | writing, underlining a key point [markers: magenta = marker] |
| 27 | `lan/wb_sticky_01` | sticking a sticky note onto the whiteboard [markers: magenta = sticky notes] |
| 28 | `lan/wb_sticky_02` | pressing the sticky note flat with the fingertips [markers: magenta = sticky notes] |
| 29 | `lan/wb_point_01` | pointing at the whiteboard with the marker [markers: magenta = marker] |
| 30 | `lan/wb_point_02` | tapping the board, serious [markers: magenta = marker] |
| 31 | `lan/wb_review_01` | one step back from the board, hand at the chin, reviewing it |
| 32 | `lan/wb_turn_01` | turning back to the viewer from the board, explaining [markers: magenta = marker] |
| 33 | `lan/phone_read_01` | reading a message on the phone, neutral [markers: magenta = phone] |
| 34 | `lan/phone_read_02` | reading the phone, worried frown [markers: magenta = phone] |
| 35 | `lan/phone_type_01` | typing a careful message with both thumbs [markers: magenta = phone] |
| 36 | `lan/phone_type_02` | typing, glancing up over the phone, hesitant [markers: magenta = phone] |
| 37 | `lan/phone_call_01` | phone at the ear, listening, nodding [markers: magenta = phone] |
| 38 | `lan/phone_call_02` | phone at the ear, talking politely with the free hand open [markers: magenta = phone] |
| 39 | `lan/phone_alert_01` | reading an alert on the phone, eyes wide, exclamation mark [markers: magenta = phone] |
| 40 | `lan/phone_pocket_01` | putting the phone back into the cardigan pocket [markers: magenta = phone] |
| 41 | `lan/gate_stop_01` | palm pushed forward, firm face, 'no-go' |
| 42 | `lan/gate_stop_02` | forearms crossed in an X in front of the chest, 'not yet' |
| 43 | `lan/gate_go_01` | OK sign with the right hand, confident small smile, 'go' |
| 44 | `lan/gate_go_02` | both thumbs up, bright smile, sparkles |
| 45 | `lan/two_ways_01` | both palms up side by side, weighing two interpretations |
| 46 | `lan/two_ways_02` | tilting the head toward the higher palm, puzzled |
| 47 | `lan/count_01` | counting on fingers: one finger up (the critical flows) |
| 48 | `lan/count_02` | counting: three fingers up |
| 49 | `lan/tab_hold_01` | holding the tablet at chest height with both hands [markers: magenta = tablet] |
| 50 | `lan/tab_present_01` | turning the tablet screen toward the viewer, proposing [markers: magenta = tablet] |
| 51 | `lan/tab_present_02` | tablet turned, pointing at the screen with the free hand [markers: magenta = tablet] |
| 52 | `lan/tab_swipe_01` | swiping on the tablet screen, which faces the viewer [markers: magenta = tablet] |
| 53 | `lan/propose_01` | open palm forward, earnest proposal |
| 54 | `lan/propose_02` | hands pressed together in front, 'please consider it' |
| 55 | `lan/coffee_01` | holding a coffee mug with both hands, relaxed [markers: magenta = mug] |
| 56 | `lan/coffee_02` | sipping the coffee, eyes closed [markers: magenta = mug] |

### Sheet C – Bàn test, họp khách, 1-1, go/no-go, sự cố, OT, kết thúc

File `LAN_C_work_scenes.png`, lưới 8×7, prompt `prompts/LAN_C_work_scenes.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `lan/desk_type_01` | seated, typing [markers: cyan = seat] |
| 2 | `lan/desk_type_02` | seated, typing, glancing at the monitor [markers: cyan = seat] |
| 3 | `lan/desk_bug_01` | seated, leaning toward the monitor, eyes wide, small exclamation mark (bug found) [markers: cyan = seat] |
| 4 | `lan/desk_log_01` | seated, typing a bug report, focused [markers: cyan = seat] |
| 5 | `lan/desk_frown_01` | seated, frowning at the monitor, hand at the chin [markers: cyan = seat] |
| 6 | `lan/desk_pass_01` | seated, small fist pump, sparkles (all tests pass) [markers: cyan = seat] |
| 7 | `lan/desk_stretch_01` | seated, stretching both arms up, tired [markers: cyan = seat] |
| 8 | `lan/desk_turn_01` | seated, turning around on the chair to talk to someone behind [markers: cyan = seat] |
| 9 | `lan/meet_table_talk_01` | seated at the table, talking with an open hand [markers: cyan = seat] |
| 10 | `lan/meet_table_talk_02` | seated, explaining calmly, both hands on the table [markers: cyan = seat] |
| 11 | `lan/meet_table_note_01` | seated, taking minutes with a pen in a notebook on the table [markers: cyan = seat; magenta = pen] |
| 12 | `lan/meet_table_note_02` | seated, writing, looking up to listen [markers: cyan = seat; magenta = pen] |
| 13 | `lan/meet_table_show_01` | seated, pointing at a line in an open folder lying on the table [markers: cyan = seat] |
| 14 | `lan/meet_table_listen_01` | seated, listening, hands folded on the table [markers: cyan = seat] |
| 15 | `lan/meet_table_worry_01` | seated, worried glance to the side, one sweat drop [markers: cyan = seat] |
| 16 | `lan/meet_table_agree_01` | seated, nodding with a relieved smile [markers: cyan = seat] |
| 17 | `lan/oneone_talk_01` | seated, talking calmly [markers: cyan = seat] |
| 18 | `lan/oneone_talk_02` | seated, hand on the chest, sincere [markers: cyan = seat] |
| 19 | `lan/oneone_listen_01` | seated, listening, hands on the knees [markers: cyan = seat] |
| 20 | `lan/oneone_hope_01` | seated, leaning forward slightly, hopeful eyes [markers: cyan = seat] |
| 21 | `lan/oneone_relieved_01` | seated, relieved smile, shoulders relaxed [markers: cyan = seat] |
| 22 | `lan/oneone_show_01` | seated, showing a tablet screen to the other person [markers: magenta = tablet] |
| 23 | `lan/oneone_note_01` | seated, writing in a notebook on the knee [markers: cyan = seat; magenta = notebook; green = pen] |
| 24 | `lan/oneone_nod_01` | seated, grateful nod [markers: cyan = seat] |
| 25 | `lan/release_check_01` | reviewing the release checklist with a pen, serious [markers: magenta = checklist; green = pen] |
| 26 | `lan/release_check_02` | ticking the last item, careful [markers: magenta = checklist; green = pen] |
| 27 | `lan/release_nogo_01` | checklist in the left hand, right palm raised firmly, 'we can't release yet' [markers: green = checklist] |
| 28 | `lan/release_nogo_02` | serious slow head shake, checklist lowered |
| 29 | `lan/release_go_01` | nodding, pointing forward with an open hand, 'go' |
| 30 | `lan/release_go_02` | thumbs up with a bright smile, sparkles |
| 31 | `lan/release_report_01` | handing over the daily test report pages with both hands [markers: magenta = papers] |
| 32 | `lan/release_watch_01` | standing, arms crossed, tense, watching a monitor on the LEFT after release |
| 33 | `lan/alert_01` | reading an alert on the phone, shocked, exclamation mark [markers: magenta = phone] |
| 34 | `lan/alert_02` | phone lowered, determined face [markers: magenta = phone] |
| 35 | `lan/incident_lap_01` | typing fast on the laptop balanced on the forearm, sweat drop [markers: magenta = laptop] |
| 36 | `lan/incident_calc_01` | counting on the fingers, grim, estimating the recovery time |
| 37 | `lan/support_01` | gentle hand reaching to an offscreen shoulder, supportive |
| 38 | `lan/support_02` | palms down, calm reassuring smile, 'we'll fix it together' |
| 39 | `lan/checklist_write_01` | writing a new deploy checklist on a sheet with a pen [markers: magenta = checklist; green = pen] |
| 40 | `lan/checklist_show_01` | holding up the finished checklist with both hands, proud [markers: magenta = checklist] |
| 41 | `lan/tired_01` | rubbing the eyes, tired |
| 42 | `lan/tired_02` | yawning, hand over the mouth |
| 43 | `lan/tired_03` | slumped shoulders, holding a mug, faint dark circles [markers: magenta = mug] |
| 44 | `lan/stress_01` | both hands on the head, overwhelmed, sweat drops |
| 45 | `lan/stress_02` | staring at the checklist, sweat drop, too many items left [markers: magenta = checklist] |
| 46 | `lan/breath_01` | deep calming breath, eyes closed, hand on the chest |
| 47 | `lan/determined_01` | both fists in front, determined face |
| 48 | `lan/determined_02` | folding the sleeves higher, ready to work |
| 49 | `lan/own_01` | hand on the chest, accepting ownership of quality |
| 50 | `lan/own_02` | confident nod, hands on the hips lightly |
| 51 | `lan/cheer_01` | cheering, both arms up, sparkles |
| 52 | `lan/cheer_02` | small hop, clapping happily |
| 53 | `lan/congrats_01` | reaching out the right hand for a congratulating handshake |
| 54 | `lan/congrats_02` | handshake, warm smile |
| 55 | `lan/sad_01` | sad, eyes lowered, hands clasped in front |
| 56 | `lan/bow_01` | polite bow, respectful goodbye |

### Sheet D – 20 chân dung cảm xúc cho hộp thoại

File `LAN_D_portraits.png`, lưới 4×5, prompt `prompts/LAN_D_portraits.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `lan/face_neutral` | neutral, attentive |
| 2 | `lan/face_polite_smile` | polite small smile |
| 3 | `lan/face_warm` | warm friendly smile |
| 4 | `lan/face_bright` | bright happy smile, sparkles |
| 5 | `lan/face_laugh` | laughing softly, eyes closed |
| 6 | `lan/face_serious` | serious, straight mouth |
| 7 | `lan/face_focused` | focused, eyes slightly narrowed |
| 8 | `lan/face_cautious` | cautious, index finger raised into the frame |
| 9 | `lan/face_worried` | worried, eyebrows tilted |
| 10 | `lan/face_anxious` | anxious, sweat drop |
| 11 | `lan/face_doubtful` | doubtful, head tilted, small question mark |
| 12 | `lan/face_thinking` | thinking, eyes looking up |
| 13 | `lan/face_surprised` | surprised, eyebrows up, mouth open (bug found) |
| 14 | `lan/face_frown` | frowning, displeased |
| 15 | `lan/face_firm` | firm, determined, lips pressed |
| 16 | `lan/face_sigh` | sighing, eyes closed, small grey puff |
| 17 | `lan/face_tired` | tired, faint dark circles |
| 18 | `lan/face_relieved` | relieved, soft smile |
| 19 | `lan/face_hopeful` | hopeful, shining eyes |
| 20 | `lan/face_sympathetic` | sympathetic, soft sad smile |

