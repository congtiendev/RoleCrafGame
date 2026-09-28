# RoleCraft PM60 – Bộ prompt sprite Lan v4 (BA/QA)

Sinh bởi `rolecraft_lan_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.

**5 sheet / 220 ô / 117 animation**, đầy đủ các nhóm như bộ PM (đứng, đi, chạy, ngồi, cúi nhặt, sofa, làm đêm, sự cố, bộ kiệt sức) nhưng **mỗi ô đều gắn với một câu thoại hoặc một cảnh Lan có mặt** trong kịch bản (mục 5). Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM.

## Thay đổi so với bản cũ

- **Quay PHẢI** như PM, nội thất bên phải: dùng thẳng ghế, bàn, bảng trắng, sofa của bộ PM. Khi Lan đứng đối diện PM, game lật cả cụm: `pc.draw(ctx, key, x, y, s, { flip: true })`. (Bản cũ quay trái, bind `beside_left` mà `pm_compose.js` không hỗ trợ.)
- **Bám kịch bản thống nhất**: bản cũ trích thoại bản chi tiết cũ (có cảnh S02 nhắn tin, “test report từng ngày”, màn kết chúc mừng…) — nay mỗi dòng mapping là một câu hoặc một cảnh có `QA_BA` trong `KICH_BAN_ROLECRAFT_PM60.md`; ô không có cảnh nào dùng thì bỏ (`cheer`, `congrats`, `bow`, `sit_07`…).
- Thêm theo kịch bản: chạy tới sự cố (S09), cúi gom tài liệu rải rác (S13), nhảy mừng khi mua công cụ (S04 A), sofa + làm regression đêm (S05 B `team_ot_14_days`, S06 B), cho xem nhóm chat (S13), gộp checklist (S13 B), nhận quyền chặn release (S14 C), bộ kiệt sức (sheet E).
- Sheet **E 8×4 ảnh ngang 3:2** (không độn ô cho đủ 56). Prompt ngắn; quy tắc tiết kiệm token trong `SOL_ONE_SHOT_PROMPT.txt`.

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8×7) | `prompts/LAN_A_master.txt` | ảnh thật + `PM_A_master.png` | Master: chân dung, đứng, đi, chạy, ngồi, nhặt tài liệu, sofa sau OT, cảm xúc |
| B (8×7) | `prompts/LAN_B_hands_gestures.txt` | `LAN_A` đã duyệt + ảnh thật | Checklist, đối chiếu tài liệu, nói/nghe, phản biện – cổng chất lượng, điện thoại, đề xuất công cụ, suy nghĩ |
| C (8×7) | `prompts/LAN_C_work_scenes.txt` | `LAN_A` đã duyệt + ảnh thật | Bàn test ngày/đêm, bàn họp, 1-1, bảng trắng, go/no-go, sự cố + mất dữ liệu test |
| E (8×4) | `prompts/LAN_E_ownership_tired.txt` | `LAN_A` đã duyệt + ảnh thật | Ownership chất lượng, áp lực deadline/OT, biến thể kiệt sức |
| D (4×5) | `prompts/LAN_D_portraits.txt` | `LAN_A` đã duyệt + ảnh thật | 20 chân dung hộp thoại |

**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip thư mục `rolecraft_lan_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Mỗi sheet 1 lần sinh, chỉ sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả; nền trắng thì chỉ chạy `tools/make_transparent.py`, không sinh lại); lỗi nhỏ ghi lại chứ không sinh lại; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.

**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm các sheet còn lại.

## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)

> ✅ Đúng lưới (A, B, C: 8×7 vuông; E: 8×4 ảnh ngang; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, **nền trong suốt** (không trắng, không ô caro vẽ giả).
>
> ✅ Nhận ra người thật; sơ mi xanh mint, cardigan be, thẻ xanh royal; ô 1 sheet A là chân dung khung xanh nhạt.
>
> ✅ Không vẽ đồ vật/nội thất (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.
>
> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.

## 3. Dùng tool

```bash
cd tools/prompts/LAN
python3 tools/extract_anchors.py --manifest lan_sprite_manifest.json --sheets sheets --out build
```

Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`lan/*`), rồi `PMCompose.create(anchors, manifest, base)`.

## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)

| Nhóm tư thế | Đồ vật | Nội thất |
|---|---|---|
| idle, walk, run, startle_01, tired_idle, tired_walk, check_hold/show/give/hug, checklist_show, stress_02, tense_01, handoff_01, release_nogo_02 | checklist_sheet | |
| check_tick/flag/tap, release_check, checklist_write | checklist_sheet (tay trái) + pen | |
| crouch | papers_scattered trên sàn, paper_stack trên tay | |
| doc_stack, merge, release_report | paper_stack | |
| doc_read / doc_compare / doc_raise / doc_give_01 | folder_open / contract_sheet + checklist_sheet / contract_sheet / folder_closed | |
| phone_show_01 | phone_screen (vẽ nhóm chat lên vùng màn hình) | |
| phone_*, alert_* | phone_back | |
| tab_* | tablet_back; tablet_screen_34 (present); tablet_screen_front (swipe) | |
| coffee, night_coffee / weary_03 | mug_steam / mug_plain | |
| incident_lap | laptop_open_34 | |
| sit_*, desk_turn | | office_chair |
| desk_* / night_* | lamp_on trên bàn (night) | office_chair + desk_monitor |
| slump, lie, getup | | sofa |
| meet_table_* | pen + notebook_open (note), folder_open trên bàn (show) | meeting_chair + meeting_table |
| oneone_* | | meeting_chair |
| wb_* | marker; sticky_notes (wb_sticky) | whiteboard (bên phải) |
| release_watch_01 | | desk_monitor (bên phải) |

## 5. Mapping kịch bản → sprite

Tên là **nhóm animation** `lan/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `lan/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng ghi “(… nói)” là phản ứng của Lan khi người khác nói.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L1 S01 Tiếp quản | Vào cảnh | Ngày 1 · khu vực làm việc, PM gặp team lần đầu | `walk` → `idle` → `greet` · `face_polite_smile` |
| L1 S01 Tiếp quản | Mở cảnh | Lan: “Nhưng tài liệu chưa phản ánh hết những gì team đang làm.” | `listen_02` (Huy nói) → `doc_read` → `doc_compare` → `talk_03` · `face_cautious` |
| L1 S01 Tiếp quản | A | Review một ngày → sơ đồ hệ thống, phạm vi, checklist rủi ro | `wb_write` → `wb_point_01` → `wb_sticky` → `wb_review_01` → `check_tick` → `check_give_01` · `face_focused` |
| L1 S01 Tiếp quản | B | Lan: “Em vẫn lo vài giả định cũ chưa được kiểm tra.” | `worry_01` → `check_flag_01` · `face_worried` |
| L1 S01 Tiếp quản | C | PM tự đọc tài liệu ngoài giờ | `doc_stack_01` → `doc_give` · `face_anxious` |
| L1 S03 Thay đổi phạm vi | Mở cảnh | Lan: “Hai chức năng này nằm ngoài phạm vi đã xác nhận.” | `meet_table_show_01` → `meet_table_talk` · `face_cautious` |
| L1 S03 Thay đổi phạm vi | A / B / C | (PM, Anh Hiệp nói) | A: `meet_table_worry_01` · `face_worried` · B: `meet_table_listen_01` · C: `meet_table_note` → `meet_table_agree_01` · `face_relieved` |
| L1 S04 Quỹ công cụ | Mở cảnh | Lan: “Team đang quản lý test case thủ công. Em đề xuất mua bộ công cụ.” | `tab_hold_01` → `tab_swipe_01` → `tab_present` → `propose` · `face_hopeful` |
| L1 S04 Quỹ công cụ | Hệ thống | Đầy đủ 15 · dùng chung 5 · miễn phí 0 điểm | `count` · `face_thinking` → `point_01` (chờ PM quyết) |
| L1 S04 Quỹ công cụ | A | Mua đầy đủ | `happy_01` → `hop` · `face_bright` → `face_laugh` |
| L1 S04 Quỹ công cụ | B | Chỉ công cụ miễn phí → làm tay | `sigh_01` → `desk_type` · `face_sigh` |
| L1 S04 Quỹ công cụ | C | Licence dùng chung → điểm nghẽn | `doubt_01` → `nod` · `face_doubtful` |
| L1 S04 Quỹ công cụ | Sau cảnh | Test tay / test có công cụ | `walk` → `idle_back_01` (về bàn) → `sit` → `desk_type` → `desk_bug_01` → `desk_log_01` → `desk_frown_01` / `desk_pass_01` → `desk_turn_01` → `desk_stand_01` |
| L2 S05 Hai dự án | Mở cảnh + nhánh | (QA_BA có mặt; Anh Minh, Huy, Nam nói) | `meet_table_listen_01` · A: `meet_table_note` · B: `meet_table_worry_01` · `face_worried` · C: `meet_table_agree_01` |
| L2 S05 Hai dự án | B → team_ot_14_days | Dẫn truyện: Hai tuần OT liên tục. Cả team kiệt sức. | `night_type` → `night_rub_01` → `night_yawn_01` → `night_coffee_01` → `night_sleep` → `night_wake_01` · `face_tired`; từ đây `idle`/`talk`/`walk` → `tired_idle` / `tired_talk` / `tired_walk` |
| L2 S05 Hai dự án | B → sáng hôm sau |  | `slump` → `lie_01` → `getup` → `stretch` · `face_tired` |
| L2 S05 Hai dự án | Áp lực OT |  | `weary` → `stress_01` → `rushed_01` → `exhausted_01` · `face_tired` |
| L2 S06 Deadline/chất lượng | Mở cảnh | (QA_BA có mặt) Huy: phải bỏ vòng regression cuối | `listen_01` → `release_check` → `tense_01` · `face_worried` |
| L2 S06 Deadline/chất lượng | A | Bỏ regression, release đúng hạn | `release_nogo` → `uneasy_01` → `release_watch_01` · `face_anxious` |
| L2 S06 Deadline/chất lượng | B | Delay ba ngày, chạy đủ regression | `night_type` → `release_report_01` → `release_go` · `face_relieved` |
| L2 S06 Deadline/chất lượng | C | Test luồng critical, release từng phần | `check_hold_01` → `check_tick` → `two_ways_01` → `gate_go_01` · `face_focused` |
| L2 S08 Complain | Mở cảnh | Lan: “Requirement có một câu hiểu được theo hai cách.” | `doc_raise_01` → `two_ways` · `face_cautious` |
| L2 S08 Complain | A | PM: team đã làm đúng tài liệu | `firm_01` → `frown_01` · `face_frown` |
| L2 S08 Complain | B | Lan: “Không làm rõ requirement thì lần sau vẫn sẽ hiểu sai.” | `object_01` → `firm_01` · `face_firm` |
| L2 S08 Complain | C | Làm rõ kỳ vọng, chốt tiêu chí nghiệm thu | `meet_table_note` → `wb_write` → `wb_explain` · `face_relieved` |
| L3 S09 Incident | Mở cảnh | Hệ thống: 14:00 production lỗi (QA_BA có mặt) | `alert` → `startle_01` → `run` → `incident_lap` · `face_surprised` |
| L3 S09 Incident | critical_payment_incident | Cờ regression_test_skipped | `stress_02` → `bad_01` · `face_anxious` |
| L3 S09 Incident | A / B / C | (PM nói) | A: `phone_call_01` (xác nhận lỗi với phía khách) → `desk_type` · B: `worry_02` · C: `release_watch_01` → `breath_01` → `relieved_01` · `face_relieved` |
| L3 S11 Junior gây lỗi | Mở cảnh | Lan: “Team sẽ mất gần một ngày để khôi phục.” | `incident_calc_01` · `face_sigh` |
| L3 S11 Junior gây lỗi | A | PM phê bình Nam trước team | `uneasy_01` → `disappoint_01` · `face_sympathetic` |
| L3 S11 Junior gây lỗi | B | PM tự xử lý, bỏ qua | `sigh_01` · `face_worried` |
| L3 S11 Junior gây lỗi | C | 1-1 và thêm checklist deploy | `support` → `checklist_write` → `checklist_show_01` · `face_warm` |
| L4 S13 Hệ thống vận hành | Mở cảnh | Lan: “Checklist và quy trình deploy vẫn nằm rải rác, có bước chỉ nhắc trong nhóm chat.” | `phone_type_01` → `phone_show_01` → `phone_pocket_01` → `crouch` → `talk_02` · `face_serious` |
| L4 S13 Hệ thống vận hành | deployment_checklist_added | Lan: “Sau sự cố mất dữ liệu test, team đã có checklist deploy mới…” | `check_show_01` → `check_tap_01` → `caution_01` · `face_serious` |
| L4 S13 Hệ thống vận hành | process_gap_unresolved | Lan: “Lỗ hổng lần trước chưa được xử lý…” | `phone_read_01` → `phone_read_02` → `worry_02` · `face_anxious` |
| L4 S13 Hệ thống vận hành | A | (Huy: điểm nghẽn cũ sẽ quay lại) | `disappoint_01` · `face_sigh` |
| L4 S13 Hệ thống vận hành | B | Lan: “Em sẽ gộp test checklist và tiêu chí nghiệm thu về một chỗ.” | `merge` → `check_hug_01` → `own` · `face_bright` |
| L4 S13 Hệ thống vận hành | C | Mỗi người sở hữu một phần: Lan chất lượng | `own_01` → `handoff_01` → `applaud_01` · `face_warm` |
| L4 S14 Phát triển team | Mở cảnh | (1-1; Anh Minh, Huy nói) | `oneone_listen_01` · `face_neutral` |
| L4 S14 Phát triển team | A | Lan: “Việc QA ngăn được lỗi sẽ không có ticket nào ghi nhận.” | `oneone_talk` → `oneone_sigh_01` · `face_sigh` |
| L4 S14 Phát triển team | B | IDP 90 ngày cho từng người | `oneone_hope_01` → `oneone_relieved_01` → `oneone_nod_01` · `face_relieved` |
| L4 S14 Phát triển team | C | PM: “…Lan được chặn release…” | `oneone_own_01` → `gate_stop` → `proud_01` · `face_firm` |
| L4 S15 Mở rộng hợp tác | Mở cảnh | Lan: “Phạm vi mới chỉ là mong muốn, chưa có tiêu chí nghiệm thu.” | `meet_table_talk` → `caution_01` · `face_cautious` |
| L4 S15 Mở rộng hợp tác | key_developer_left | Lan: “Hiện tại team chưa có người thay thế hoàn toàn phần kỹ thuật chủ chốt…” | `meet_table_worry_01` · `face_worried` |
| L4 S15 Mở rộng hợp tác | A / B / C | (PM, Huy, Anh Hiệp, Linh nói) | A: `frown_01` · `face_worried` · B: `nod` → `determined` · C: `good_01` → `meet_table_agree_01` · `face_relieved` |
| Chuyển ngày | Bình thường |  | `walk` → `coffee` → `sit` → `desk_type` |
| Chuyển ngày | Chờ quyết định / câu hỏi | PM đang chọn A/B/C | `think` → `crossarms_01` → `front_hands_01` → `inspect_01` |
| Popup chỉ số | Tăng / giảm (khi Lan có mặt) |  | `good` / `bad_01` |

Lan không có trong S02, S07, S10, S12, S16 và các màn kết thúc (kịch bản mục 2) nên không có sprite cho các cảnh đó; bản cũ có `cheer`, `congrats`, `bow` cho màn kết — đã bỏ. Mọi ô trong 5 sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, đi, chạy, ngồi, nhặt tài liệu, sofa sau OT, cảm xúc

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `lan/portrait` | [portrait cell, see LAYOUT] |
| 2 | `lan/idle_01` | idle 1/4: upright tidy stance [markers: magenta = checklist] |
| 3 | `lan/idle_02` | idle 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = checklist] |
| 4 | `lan/idle_03` | idle 3/4: glancing down at the checklist for a moment [markers: magenta = checklist] |
| 5 | `lan/idle_04` | idle 4/4: slight exhale, calm attentive face [markers: magenta = checklist] |
| 6 | `lan/idle_back_01` | seen from BEHIND (back view), standing [markers: magenta = checklist] |
| 7 | `lan/greet_01` | small polite bow of the head, friendly smile, meeting the new PM |
| 8 | `lan/greet_02` | small friendly wave at shoulder height |
| 9 | `lan/walk_01` | contact: right foot forward, heel touching [markers: magenta = checklist] |
| 10 | `lan/walk_02` | down: weight on right leg, knee bent [markers: magenta = checklist] |
| 11 | `lan/walk_03` | passing: left leg passing the right [markers: magenta = checklist] |
| 12 | `lan/walk_04` | up: rising on right toes [markers: magenta = checklist] |
| 13 | `lan/walk_05` | contact: left foot forward, heel touching [markers: magenta = checklist] |
| 14 | `lan/walk_06` | down: weight on left leg, knee bent [markers: magenta = checklist] |
| 15 | `lan/walk_07` | passing: right leg passing the left [markers: magenta = checklist] |
| 16 | `lan/walk_08` | up: rising on left toes [markers: magenta = checklist] |
| 17 | `lan/run_01` | contact right foot [markers: magenta = checklist] |
| 18 | `lan/run_02` | push-off from right foot [markers: magenta = checklist] |
| 19 | `lan/run_03` | airborne, legs apart [markers: magenta = checklist] |
| 20 | `lan/run_04` | landing on left foot [markers: magenta = checklist] |
| 21 | `lan/run_05` | contact left foot [markers: magenta = checklist] |
| 22 | `lan/run_06` | push-off from left foot [markers: magenta = checklist] |
| 23 | `lan/run_07` | airborne, legs apart, mirrored [markers: magenta = checklist] |
| 24 | `lan/run_08` | landing on right foot [markers: magenta = checklist] |
| 25 | `lan/sit_01` | standing in front of the chair, about to sit |
| 26 | `lan/sit_02` | lowering onto the chair [markers: cyan = seat] |
| 27 | `lan/sit_03` | seated upright, hands on the knees [markers: cyan = seat] |
| 28 | `lan/sit_04` | standing up from the chair, hands on the knees [markers: cyan = seat] |
| 29 | `lan/crouch_01` | bending down toward scattered pages on the floor |
| 30 | `lan/crouch_02` | crouching, gathering pages into a pile [markers: magenta = papers] |
| 31 | `lan/crouch_03` | rising back up holding the gathered pages [markers: magenta = papers] |
| 32 | `lan/startle_01` | small startled hop, eyes wide, checklist lifted, exclamation mark [markers: magenta = checklist] |
| 33 | `lan/slump_01` | sitting on the sofa, exhausted, head tilted back [markers: cyan = seat] |
| 34 | `lan/slump_02` | sliding sideways down onto the sofa [markers: cyan = seat] |
| 35 | `lan/lie_01` | curled up asleep on the sofa, head on a folded arm, small Zzz [markers: cyan = seat] |
| 36 | `lan/getup_01` | sitting up groggy on the sofa, rubbing one eye [markers: cyan = seat] |
| 37 | `lan/getup_02` | standing up from the sofa, tidying the cardigan [markers: cyan = seat] |
| 38 | `lan/stretch_01` | standing, stretching both arms overhead |
| 39 | `lan/stretch_02` | standing, rolling the shoulders, relieved |
| 40 | `lan/breath_01` | deep calming breath, eyes closed, hand on the chest |
| 41 | `lan/good_01` | relieved small smile, soft nod, two golden sparkles |
| 42 | `lan/good_02` | thumbs up with the right hand, 'test passed', sparkles |
| 43 | `lan/happy_01` | eyes shining, both hands clasped at the chest, delighted |
| 44 | `lan/hop_01` | small hop of joy: crouching slightly, fists in front |
| 45 | `lan/hop_02` | small hop of joy: in the air, both fists up, big smile, sparkles |
| 46 | `lan/hop_03` | landing from the hop, hands clasped, beaming |
| 47 | `lan/applaud_01` | applauding softly, pleased |
| 48 | `lan/relieved_01` | relieved exhale, hand on the chest, small smile |
| 49 | `lan/worry_01` | worried eyebrows, hand at the chin |
| 50 | `lan/worry_02` | anxious, both hands clasped at the chest, one sweat drop |
| 51 | `lan/doubt_01` | head tilted, doubtful, small question mark |
| 52 | `lan/sigh_01` | sighing, shoulders dropped, small grey puff |
| 53 | `lan/disappoint_01` | disappointed, eyes lowered, lips pressed |
| 54 | `lan/bad_01` | wincing, one blue sweat drop |
| 55 | `lan/frown_01` | frowning slightly, arms crossed over the chest |
| 56 | `lan/uneasy_01` | uneasy, glancing aside, hands clasped low, uncomfortable |

### Sheet B – Checklist, đối chiếu tài liệu, nói/nghe, phản biện – cổng chất lượng, điện thoại, đề xuất công cụ, suy nghĩ

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `lan/check_hold_01` | holding the checklist in both hands at chest height, reading [markers: magenta = checklist] |
| 2 | `lan/check_tick_01` | ticking an item with the pen [markers: green = checklist; magenta = pen] |
| 3 | `lan/check_tick_02` | ticking the next item, small satisfied nod [markers: green = checklist; magenta = pen] |
| 4 | `lan/check_flag_01` | circling an item, frowning slightly, a gap found [markers: green = checklist; magenta = pen] |
| 5 | `lan/check_tap_01` | tapping the pen against the checklist, thinking [markers: green = checklist; magenta = pen] |
| 6 | `lan/check_show_01` | turning the checklist to the right to show it [markers: magenta = checklist] |
| 7 | `lan/check_give_01` | handing the checklist forward with both hands [markers: magenta = checklist] |
| 8 | `lan/check_hug_01` | hugging the checklist to the chest, small proud smile [markers: magenta = checklist] |
| 9 | `lan/doc_read_01` | reading an open folder held in both hands [markers: magenta = folder] |
| 10 | `lan/doc_read_02` | reading the open folder, flipping a page [markers: magenta = folder] |
| 11 | `lan/doc_compare_01` | holding two pages side by side, one in each hand, comparing [markers: magenta = page; green = checklist] |
| 12 | `lan/doc_compare_02` | still holding the two pages, eyebrows raised, a mismatch [markers: magenta = page; green = checklist] |
| 13 | `lan/doc_raise_01` | raising one page and pointing at a line on it, 'this sentence reads two ways' [markers: magenta = page] |
| 14 | `lan/doc_stack_01` | carrying an untidy stack of papers in both arms [markers: magenta = papers] |
| 15 | `lan/doc_give_01` | extending a closed folder forward with both hands [markers: magenta = folder] |
| 16 | `lan/doc_give_02` | folder handed over, hands returning, polite smile |
| 17 | `lan/talk_01` | talking, right hand open at chest height, polite |
| 18 | `lan/talk_02` | talking, both hands slightly open, explaining step by step |
| 19 | `lan/talk_03` | talking, index finger lightly raised, 'but...' |
| 20 | `lan/talk_04` | talking, hand returning down, small reassuring smile |
| 21 | `lan/listen_01` | listening, hands loosely clasped in front |
| 22 | `lan/listen_02` | listening, head tilted, one hand at the chin |
| 23 | `lan/nod_01` | nodding, eyes half closed |
| 24 | `lan/nod_02` | chin back up after the nod |
| 25 | `lan/object_01` | raising one hand at shoulder height, hesitant but determined to object |
| 26 | `lan/firm_01` | firm but polite, small head shake, eyes closed |
| 27 | `lan/caution_01` | index finger raised beside the face, 'wait, it is not defined yet' |
| 28 | `lan/two_ways_01` | both palms up side by side, weighing two interpretations |
| 29 | `lan/two_ways_02` | tilting the head toward the higher palm, puzzled |
| 30 | `lan/gate_stop_01` | palm pushed forward, firm, 'no-go' |
| 31 | `lan/gate_stop_02` | forearms crossed in an X in front of the chest, 'not yet' |
| 32 | `lan/gate_go_01` | OK sign with the right hand, confident small smile, 'go' |
| 33 | `lan/phone_read_01` | reading the phone, neutral [markers: magenta = phone] |
| 34 | `lan/phone_read_02` | reading the phone, worried frown [markers: magenta = phone] |
| 35 | `lan/phone_type_01` | typing a careful message with both thumbs [markers: magenta = phone] |
| 36 | `lan/phone_show_01` | turning the phone screen toward the right to show a chat thread [markers: magenta = phone] |
| 37 | `lan/phone_call_01` | phone at the ear, listening, nodding [markers: magenta = phone] |
| 38 | `lan/alert_01` | reading an alert on the phone, shocked, exclamation mark [markers: magenta = phone] |
| 39 | `lan/alert_02` | phone lowered, determined face [markers: magenta = phone] |
| 40 | `lan/phone_pocket_01` | putting the phone into the cardigan pocket [markers: magenta = phone] |
| 41 | `lan/tab_hold_01` | holding the tablet at chest height with both hands [markers: magenta = tablet] |
| 42 | `lan/tab_present_01` | turning the tablet screen to the right, proposing [markers: magenta = tablet] |
| 43 | `lan/tab_present_02` | tablet turned, pointing at the screen with the free hand [markers: magenta = tablet] |
| 44 | `lan/tab_swipe_01` | swiping on the tablet screen, which faces the viewer [markers: magenta = tablet] |
| 45 | `lan/propose_01` | open palm forward, earnest proposal |
| 46 | `lan/propose_02` | hands pressed together in front, 'please consider it' |
| 47 | `lan/count_01` | one finger up, first option |
| 48 | `lan/count_02` | three fingers up, three options |
| 49 | `lan/think_01` | hand at the chin, looking up |
| 50 | `lan/think_02` | eyes closed, finger tapping the lips |
| 51 | `lan/inspect_01` | leaning forward, eyes narrowed, inspecting closely |
| 52 | `lan/crossarms_01` | arms crossed, calm, waiting for an answer |
| 53 | `lan/front_hands_01` | hands politely folded in front, standing straight, ready |
| 54 | `lan/point_01` | open hand gesturing forward, 'your decision' |
| 55 | `lan/coffee_01` | holding a coffee mug with both hands [markers: magenta = mug] |
| 56 | `lan/coffee_02` | sipping the coffee, eyes closed [markers: magenta = mug] |

### Sheet C – Bàn test ngày/đêm, bàn họp, 1-1, bảng trắng, go/no-go, sự cố + mất dữ liệu test

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `lan/desk_type_01` | seated, typing test steps [markers: cyan = seat] |
| 2 | `lan/desk_type_02` | typing, glancing at the monitor [markers: cyan = seat] |
| 3 | `lan/desk_bug_01` | leaning toward the monitor, eyes wide, small exclamation mark, a bug [markers: cyan = seat] |
| 4 | `lan/desk_log_01` | typing a bug report, focused [markers: cyan = seat] |
| 5 | `lan/desk_frown_01` | frowning at the monitor, hand at the chin [markers: cyan = seat] |
| 6 | `lan/desk_pass_01` | small fist pump, sparkles, all tests pass [markers: cyan = seat] |
| 7 | `lan/desk_turn_01` | swiveled on the chair to face the viewer, talking over the shoulder [markers: cyan = seat] |
| 8 | `lan/desk_stand_01` | pushing the chair back, starting to stand [markers: cyan = seat] |
| 9 | `lan/night_type_01` | typing late at night, tired eyes [markers: cyan = seat] |
| 10 | `lan/night_type_02` | typing, head drooping slightly [markers: cyan = seat] |
| 11 | `lan/night_rub_01` | rubbing the eyes with one hand [markers: cyan = seat] |
| 12 | `lan/night_yawn_01` | yawning, hand over the mouth [markers: cyan = seat] |
| 13 | `lan/night_coffee_01` | holding a mug, eyes on the monitor [markers: cyan = seat; magenta = mug] |
| 14 | `lan/night_sleep_01` | asleep with the head on folded arms on the desk, small Zzz [markers: cyan = seat] |
| 15 | `lan/night_sleep_02` | asleep, slightly different breathing pose [markers: cyan = seat] |
| 16 | `lan/night_wake_01` | jolting awake, eyes wide [markers: cyan = seat] |
| 17 | `lan/meet_table_talk_01` | talking with an open hand [markers: cyan = seat] |
| 18 | `lan/meet_table_talk_02` | explaining calmly, both hands on the table [markers: cyan = seat] |
| 19 | `lan/meet_table_note_01` | taking minutes with a pen in a notebook on the table [markers: cyan = seat; magenta = pen] |
| 20 | `lan/meet_table_note_02` | writing, looking up to listen [markers: cyan = seat; magenta = pen] |
| 21 | `lan/meet_table_show_01` | pointing at a line in an open folder lying on the table [markers: cyan = seat] |
| 22 | `lan/meet_table_listen_01` | listening, hands folded on the table [markers: cyan = seat] |
| 23 | `lan/meet_table_worry_01` | worried glance aside, one sweat drop [markers: cyan = seat] |
| 24 | `lan/meet_table_agree_01` | nodding with a relieved smile [markers: cyan = seat] |
| 25 | `lan/oneone_talk_01` | talking calmly, open hand [markers: cyan = seat] |
| 26 | `lan/oneone_talk_02` | hand on the chest, sincere [markers: cyan = seat] |
| 27 | `lan/oneone_listen_01` | listening, hands on the knees [markers: cyan = seat] |
| 28 | `lan/oneone_sigh_01` | looking down, small sigh [markers: cyan = seat] |
| 29 | `lan/oneone_hope_01` | leaning forward slightly, hopeful eyes [markers: cyan = seat] |
| 30 | `lan/oneone_relieved_01` | relieved smile, shoulders relaxed [markers: cyan = seat] |
| 31 | `lan/oneone_nod_01` | grateful nod [markers: cyan = seat] |
| 32 | `lan/oneone_own_01` | hand on the chest, firm small nod, accepting responsibility [markers: cyan = seat] |
| 33 | `lan/wb_write_01` | writing with a marker, arm raised [markers: magenta = marker] |
| 34 | `lan/wb_write_02` | underlining a key point [markers: magenta = marker] |
| 35 | `lan/wb_sticky_01` | sticking a sticky note onto the board [markers: magenta = sticky notes] |
| 36 | `lan/wb_sticky_02` | pressing the sticky note flat with the fingertips [markers: magenta = sticky notes] |
| 37 | `lan/wb_point_01` | pointing at the board with the marker [markers: magenta = marker] |
| 38 | `lan/wb_explain_01` | half turned to the viewer, marker in hand, explaining [markers: magenta = marker] |
| 39 | `lan/wb_explain_02` | half turned to the viewer, explaining with an open palm |
| 40 | `lan/wb_review_01` | one step back from the board, hand at the chin, reviewing |
| 41 | `lan/release_check_01` | reviewing the release checklist with a pen, serious [markers: green = checklist; magenta = pen] |
| 42 | `lan/release_check_02` | ticking the last item, careful [markers: green = checklist; magenta = pen] |
| 43 | `lan/release_nogo_01` | checklist in the left hand, right palm raised firmly, 'we can't release yet' [markers: green = checklist] |
| 44 | `lan/release_nogo_02` | serious slow head shake, checklist lowered [markers: magenta = checklist] |
| 45 | `lan/release_go_01` | nodding, pointing forward with an open hand, 'go' |
| 46 | `lan/release_go_02` | thumbs up, bright smile, sparkles |
| 47 | `lan/release_report_01` | handing over a stack of test report pages with both hands [markers: magenta = papers] |
| 48 | `lan/release_watch_01` | standing, arms crossed, tense, watching a monitor on the RIGHT |
| 49 | `lan/incident_lap_01` | typing fast on an open laptop balanced on the left forearm, sweat drop [markers: magenta = laptop] |
| 50 | `lan/incident_lap_02` | reading the laptop, grim [markers: magenta = laptop] |
| 51 | `lan/incident_calc_01` | counting on the fingers, grim, estimating the recovery time |
| 52 | `lan/support_01` | gentle hand reaching to an offscreen shoulder on the right, supportive |
| 53 | `lan/support_02` | palms down, calm reassuring smile, 'we'll fix it together' |
| 54 | `lan/checklist_write_01` | writing a new deploy checklist with a pen [markers: green = checklist; magenta = pen] |
| 55 | `lan/checklist_write_02` | adding one more line, focused [markers: green = checklist; magenta = pen] |
| 56 | `lan/checklist_show_01` | holding up the finished checklist with both hands, proud [markers: magenta = checklist] |

### Sheet E – Ownership chất lượng, áp lực deadline/OT, biến thể kiệt sức

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `lan/own_01` | hand on the chest, accepting ownership of quality |
| 2 | `lan/own_02` | confident nod, hands lightly on the hips |
| 3 | `lan/merge_01` | gathering loose pages into one neat stack [markers: magenta = papers] |
| 4 | `lan/merge_02` | tapping the stack edges straight on an invisible surface [markers: magenta = papers] |
| 5 | `lan/handoff_01` | handing the unified checklist forward to the team [markers: magenta = checklist] |
| 6 | `lan/proud_01` | quietly proud smile, hands clasped in front |
| 7 | `lan/determined_01` | both fists in front, determined |
| 8 | `lan/determined_02` | folding the sleeves higher, ready to work |
| 9 | `lan/weary_01` | rubbing the eyes, tired |
| 10 | `lan/weary_02` | long yawn, hand over the mouth |
| 11 | `lan/weary_03` | slumped shoulders, holding a mug, faint dark circles [markers: magenta = mug] |
| 12 | `lan/stress_01` | both hands on the head, overwhelmed, sweat drops |
| 13 | `lan/stress_02` | staring at the checklist, sweat drop, too many items left [markers: magenta = checklist] |
| 14 | `lan/rushed_01` | checking the wristwatch, sweat drop, out of time |
| 15 | `lan/tense_01` | biting the lip, clutching the checklist to the chest, worried about the old flows [markers: magenta = checklist] |
| 16 | `lan/exhausted_01` | head down, arms hanging, small grey puff |
| 17 | `lan/tired_idle_01` | slouched idle 1/4, checklist hanging from one hand [markers: magenta = checklist] |
| 18 | `lan/tired_idle_02` | slouched idle 2/4 [markers: magenta = checklist] |
| 19 | `lan/tired_idle_03` | slouched idle 3/4, eyes half closed [markers: magenta = checklist] |
| 20 | `lan/tired_idle_04` | slouched idle 4/4 [markers: magenta = checklist] |
| 21 | `lan/tired_talk_01` | talking wearily, low hand gesture |
| 22 | `lan/tired_talk_02` | talking, forced smile |
| 23 | `lan/tired_talk_03` | talking, rubbing the neck |
| 24 | `lan/tired_talk_04` | talking, sighing |
| 25 | `lan/tired_walk_01` | contact right [markers: magenta = checklist] |
| 26 | `lan/tired_walk_02` | down [markers: magenta = checklist] |
| 27 | `lan/tired_walk_03` | passing [markers: magenta = checklist] |
| 28 | `lan/tired_walk_04` | up [markers: magenta = checklist] |
| 29 | `lan/tired_walk_05` | contact left [markers: magenta = checklist] |
| 30 | `lan/tired_walk_06` | down [markers: magenta = checklist] |
| 31 | `lan/tired_walk_07` | passing [markers: magenta = checklist] |
| 32 | `lan/tired_walk_08` | up [markers: magenta = checklist] |

### Sheet D – 20 chân dung hộp thoại

| # | Tên | Mô tả |
|---:|---|---|
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
| 13 | `lan/face_surprised` | surprised, eyebrows up, mouth open |
| 14 | `lan/face_frown` | frowning, displeased |
| 15 | `lan/face_firm` | firm, determined, lips pressed |
| 16 | `lan/face_sigh` | sighing, eyes closed, small grey puff |
| 17 | `lan/face_tired` | tired, faint dark circles |
| 18 | `lan/face_relieved` | relieved, soft smile |
| 19 | `lan/face_hopeful` | hopeful, shining eyes |
| 20 | `lan/face_sympathetic` | sympathetic, soft sad smile |

