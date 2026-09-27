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
