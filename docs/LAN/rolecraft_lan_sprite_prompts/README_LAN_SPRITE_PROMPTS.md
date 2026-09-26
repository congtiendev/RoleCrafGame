# Bộ prompt sprite LAN (QA_BA – BA/QA)

Sinh bởi `build.py` – sửa ở `build.py` rồi chạy lại, không sửa tay file này.

Cùng cơ chế v3 với bộ PM (`docs/PM`) và bộ MINH (`docs/MINH`): nhân vật vẽ tay không + chấm neo (magenta = cầm chính, green = tay kia, cyan = điểm ngồi); đồ vật, nội thất, icon **dùng lại sheet P, O, F của PM**.

## Thứ tự tạo ảnh

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8x7) | `prompts/LAN_A_master.txt` | ảnh thật + `PM_A_master.png` (chỉ lấy style) | Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (lo lắng, phản biện) |
| B (8x7) | `prompts/LAN_B_hands_gestures.txt` | ảnh thật + `LAN_A_master.png` | Cầm nắm + cử chỉ BA/QA |
| C (8x7) | `prompts/LAN_C_work_scenes.txt` | ảnh thật + `LAN_A_master.png` | Bàn test, họp khách, 1-1, go/no-go, sự cố, OT, kết thúc |
| D (4x5) | `prompts/LAN_D_portraits.txt` | ảnh thật + `LAN_A_master.png` | 20 chân dung cảm xúc cho hộp thoại |

Tạo sheet A trước và duyệt, sau đó B, C, D đính kèm A làm chuẩn.

## Tạo hình nhân vật (theo docs)

- Vai trò: BA/QA – “cẩn thận, quan tâm quy trình và chất lượng” (docs/KICH_BAN_ROLECRAFT_PM60.md, mục 2).
- Xưng “em” với PM và Huy → trẻ hơn PM một chút; lịch sự nhưng dám phản biện (“Nhưng…”, “Em vẫn lo…”).
- Đạo cụ đặc trưng: tờ test checklist (`prop/checklist_sheet`); laptop mở trên cẳng tay khi chạy test.
- Thẻ nhân viên xanh (nhân viên chính thức), khác thẻ cam của PM thử việc.

## Animation kịch bản đặt tên sẵn

| Tên trong docs | Chuỗi animation LAN |
|---|---|
| `QA_BA.projectHandoverAudit` | `lan/doc_read` → `lan/doc_compare` → `lan/check_flag_01` |
| `QA_BA.qualityToolingProposal` | `lan/tab_present` → `lan/propose` |

## Cảnh → animation gợi ý (bám thoại của Lan trong docs)

| Scenario | Nhịp | Thoại (tóm tắt) | Animation / chân dung |
|---|---|---|---|
| `P1_INTRO` | Mở đầu | Một số requirement và test case chưa được xác nhận đầy đủ. | `lan/talk_03`, `lan/face_cautious` |
| `P1_S01_PROJECT_TAKEOVER` | Mở cảnh | Tài liệu chưa phản ánh hết… requirement chỉ trao đổi qua tin nhắn. | `QA_BA.projectHandoverAudit`, `lan/face_worried` |
| `P1_S01_PROJECT_TAKEOVER` | Nhánh A | Em sẽ tổng hợp requirement, test status… | `lan/check_tick`, `lan/face_focused` |
| `P1_S01_PROJECT_TAKEOVER` | Nhánh B | Em vẫn lo một số giả định cũ chưa được kiểm tra lại. | `lan/worry_01`, `lan/face_worried` |
| `P1_S02_SENIOR_AUTONOMY` | Tin nhắn | Em chưa xác nhận thay đổi này… có thể phát sinh tranh chấp. | `lan/phone_type`, `lan/face_anxious` |
| `P1_S03_SCOPE_CHANGE` | Mở cảnh | Hai chức năng này chưa nằm trong phạm vi… cần acceptance criteria. | `lan/meet_table_talk`, `lan/face_cautious` |
| `P1_S04_TOOL_BUDGET` | Mở cảnh | Team quản lý test case thủ công. Em đề xuất mua bộ công cụ chung. | `QA_BA.qualityToolingProposal`, `lan/face_hopeful` |
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

Tổng: 188 ô, 103 animation.
