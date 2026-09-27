Tên là **nhóm animation** `huy/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `huy/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng ghi “(… nói)” là phản ứng của Huy khi người khác nói.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L1 S01 Tiếp quản | Mở cảnh | Huy: “Cứ chạy tiếp thì một tuần nữa demo được.” | `walk` → `lap_carry` → `lap_show` → `talk` · `face_smirk` |
| L1 S01 Tiếp quản | Lan nói | Lan: tài liệu chưa phản ánh hết… | `listen` · `face_neutral` |
| L1 S01 Tiếp quản | A | Huy: “Mất một ngày, nhưng cả team thống nhất được hiện trạng.” | `nod` → `agree_01` · `face_serious` |
| L1 S01 Tiếp quản | B | (Lan nói) | `good_01` · `face_smirk` |
| L1 S01 Tiếp quản | C | Huy: “Có gì cần làm rõ thì báo anh.” | `askme_01` · `face_grin` |
| L1 S02 Senior tự quyết | Mở cảnh | Hệ thống: Huy đổi requirement chưa báo BA/QA · Huy: “Thay đổi nhỏ thôi, không cần review đâu.” | `desk_type` → `desk_turn_01` → `desk_wave_01` · `face_smirk` |
| L1 S02 Senior tự quyết | A | Huy: “Việc gì cũng chờ duyệt thì tiến độ sẽ chậm.” | `sit_annoyed_01` · `face_annoyed` |
| L1 S02 Senior tự quyết | B | Huy: “Vậy anh sẽ chủ động xử lý cho kịp tiến độ.” | `sit_smirk_01` · `face_grin` |
| L1 S02 Senior tự quyết | C | Huy: “Hợp lý. Việc ảnh hưởng requirement anh sẽ đưa ra review.” | `sit_nod_01` · `face_relieved` |
| L1 S03 Thay đổi phạm vi | Mở cảnh | Anh Hiệp muốn thêm hai chức năng | `meet_table_listen` → `meet_table_frown_01` · `face_skeptical` |
| L1 S03 Thay đổi phạm vi | A | Huy: “Team phải điều chỉnh lại kế hoạch ngay.” | `meet_table_frown_01` → `meet_table_talk` · `face_worried` |
| L1 S03 Thay đổi phạm vi | B / C | (Anh Hiệp nói) | B: `meet_table_listen` · C: `meet_table_lap_01` (estimate) · `face_focused` |
| L1 S04 Quỹ công cụ | Mở cảnh + nhánh | (Huy không thoại) | `listen_02` · A: `good_01` · B: `sigh_01` · C: `doubt_01` (licence dùng chung thành điểm nghẽn) |
| L2 S05 Hai dự án | Mở cảnh | Huy: “Anh mà chuyển sang B thì backend của A thiếu người review.” | `meet_table_warn_01` · `face_frown` |
| L2 S05 Hai dự án | A | Huy: “Được, nhưng team vẫn mất thời gian onboarding và review.” | `meet_table_agree_01` → `meet_table_talk` · `face_serious` |
| L2 S05 Hai dự án | B / C | (Nam / Anh Minh nói) | B: `meet_table_frown_01` · `face_tired` (bật cờ team_ot_14_days) · C: `meet_table_agree_01` |
| L2 S06 Deadline/chất lượng | Mở cảnh | Huy: “Muốn release đúng ngày thì phải bỏ vòng regression cuối.” | `meet_table_talk` · `face_serious` |
| L2 S06 Deadline/chất lượng | A | Huy: “Lỗi ở luồng cũ mà lọt lên production thì tốn hơn nhiều.” | `meet_table_warn_01` · `face_worried` |
| L2 S06 Deadline/chất lượng | B | (Anh Hiệp nói) | `meet_table_agree_01` |
| L2 S06 Deadline/chất lượng | C | Huy: “Anh sẽ dùng feature flag để kiểm soát phạm vi mở.” | `meet_table_lap_01` (ngồi) hoặc `flag_01` (đứng) · `face_determined` |
| L2 S07 Giữ Huy | Trước cảnh | Huy đọc offer | `phone_read_02` → `phone_hold_01` → `phone_pocket_01` |
| L2 S07 Giữ Huy | Mở cảnh | Huy: “Anh vừa nhận offer mới…” · “Việc critical dồn hết vào anh…” | `oneone_offer_01` → `oneone_tired_01` · `face_worried` → `face_tired` |
| L2 S07 Giữ Huy | Cờ | team_ot_14_days / senior_restricted / senior_has_guardrails | `oneone_frustrated_01` · `face_exhausted` / `oneone_frustrated_01` · `face_frown` / `oneone_think_01` · `face_thinking` |
| L2 S07 Giữ Huy | A | Huy: “Nếu khối lượng việc cũng được kiểm soát, anh sẽ ở lại.” | `oneone_think_01` → `oneone_agree_01` · `face_relieved` |
| L2 S07 Giữ Huy | B | (PM, Anh Minh nói) → key_developer_left | `oneone_listen_01` · `face_apologetic` → chuỗi nghỉ việc |
| L2 S07 Giữ Huy | C | Huy: “Anh quan tâm, nhưng team không được tiếp tục sống bằng OT.” | `oneone_listen_01` → `oneone_talk` · `face_serious` |
| L2 S07 Giữ Huy | C1 | Huy: “Anh ở lại và thử lộ trình này.” | `oneone_agree_01` → `shake` · `face_grateful` |
| L2 S07 Giữ Huy | C2 | Huy: “Anh trân trọng đề xuất, nhưng anh quyết định nhận offer mới.” | `oneone_decline_01` · `face_apologetic` → chuỗi nghỉ việc |
| L2 S07 Giữ Huy | Chuỗi nghỉ việc | key_developer_left | `handover` → `handover_lap_01` → `pack_01` → `pack_02` → `farewell_bow_01` → `farewell_01` → `leave` → `leave_back_01` → `farewell_wave_01` |
| L2 S08 Complain | Mở cảnh | (Anh Hiệp, Lan nói) | `meet_table_listen` · `face_serious` |
| L2 S08 Complain | Biến thể 1 | Huy: “Team đổi cách xử lý để kịp demo nhưng chưa ghi nhận thành requirement.” | `meet_table_talk` → `sigh_01` · `face_apologetic` |
| L2 S08 Complain | A / B / C | (PM, Anh Hiệp, Lan nói) | A: `meet_table_frown_01` · B: `meet_table_frown_01` · C: `meet_table_agree_01` |
| L3 S09 Incident | Mở cảnh | Hệ thống: 14:00 production lỗi | `alert` → `startle` → `run` → `desk_focus_01` · `face_surprised` |
| L3 S09 Incident | A | Cả team dừng việc | `headset_01` → `desk_type` · `face_focused` |
| L3 S09 Incident | B | Giao một dev (Huy) | `desk_bug_01` → `stress_01` · `face_tired` |
| L3 S09 Incident | C | Rollback trước, lập nhóm incident | `rollback_call_01` → `rollback_type` → `rollback_enter_01` → `rollback_done_01` → `incident_fixed_01` · `face_determined` → `face_relieved` |
| L3 S09 Incident | Sau mọi nhánh | PM báo khách | `incident_monitor_01` → `relief_01` → `stretch_01` |
| L3 S10 Sales hứa 10 ngày | Mở cảnh | (Linh, PM nói) | `doubt_01` · `face_skeptical` |
| L3 S10 Sales hứa 10 ngày | A / B / C | (PM nói) | A: `overload_01` · `face_exhausted` · B: `facepalm_01` · C: `est_count` → `agree_02` · `face_relieved` |
| L3 S11 Junior gây lỗi | Mở cảnh | (Nam, Lan nói) | `sigh_01` · `face_serious` |
| L3 S11 Junior gây lỗi | A / B / C | (PM nói) | A: `crossarms_01` · `face_frown` · B: `sigh_02` · C: `mentor_point_01` → `mentor_explain_01` → `runbook_tick_01` → `mentor_pat_01` · `face_determined` |
| L3 S12 Dự án lớn | Mở cảnh + nhánh | (Anh Minh, PM nói) | `crossarms_01` · `face_worried` · A: `overload_01` · B: `talk_03` · C: `good_01` |
| L4 S13 Hệ thống vận hành | Mở cảnh | Anh Minh: “Nếu Huy nghỉ…” | `scratch_01` · `face_serious` |
| L4 S13 Hệ thống vận hành | A | Huy: “Output tăng trước mắt, nhưng điểm nghẽn cũ sẽ quay lại.” | `warn_01` · `face_skeptical` |
| L4 S13 Hệ thống vận hành | B / C | (Lan / Nam nói) | B: `runbook_write_01` → `runbook_tick_01` · C: `delegate_01` → `mentor_thumb_01` · `face_grin` |
| L4 S14 Phát triển team | Mở cảnh | Huy: “Anh muốn lên Technical Lead, không muốn ôm mọi vấn đề khó nữa.” | `oneone_talk` · `face_determined` |
| L4 S14 Phát triển team | A / B | (Lan / Nam nói) | A: `frown_01` · `face_frown` · B: `nod` |
| L4 S14 Phát triển team | C | Huy: “Anh đồng ý nếu phạm vi quyết định được ghi rõ.” | `agree_01` → `lead_01` · `face_grateful` |
| L4 S15 Mở rộng hợp tác | Cờ large_project_without_resources | Huy: “Team đang chia nguồn lực cho dự án lớn vừa nhận…” | `meet_table_warn_01` · `face_worried` |
| L4 S15 Mở rộng hợp tác | A | Huy: “Mình đang cam kết khi chưa biết hết phạm vi tích hợp.” | `meet_table_warn_01` · `face_worried` |
| L4 S15 Mở rộng hợp tác | B / C | (Anh Hiệp / Linh nói) | `meet_table_agree_01` |
| Kết thúc | Pass xuất sắc / Pass | Huy chúc mừng PM | `cheer` → `congrats_02` / `clap` → `congrats_01` · `face_laugh` |
| Kết thúc | Gia hạn / Không đạt | Huy an ủi PM | `pat_01` / `sad_01` → `pat_01` → `bye_01` · `face_apologetic` |
| Chuyển ngày | Bình thường |  | `walk` → `coffee` |
| Chuyển ngày | team_ot_14_days | Từ L2 S06: thay idle / talk / walk bằng tired_idle / tired_talk / tired_walk | `night_type` → `night_drink_01` → `night_sleep` → `night_wake_01` hoặc `slump` → `lie` → `getup` |
| Chuyển ngày | Incident đã khắc phục |  | `desk_fixed_01` → `desk_stand_01` → `stretch_02` |
| Popup chỉ số | Tăng / giảm |  | `good` / `bad` |

Nếu `key_developer_left` (Huy nghỉ ở L2 S07): Huy không xuất hiện từ L3 (thoại thay bằng thông báo thiếu nhân sự chủ chốt, mục 2 kịch bản), bỏ các dòng L3–L4 và kết thúc ở bảng trên.
