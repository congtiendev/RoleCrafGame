# Bộ prompt sprite HUY (SENIOR_DEV – Senior Backend Developer)

Sinh bởi `build.py` – sửa ở `build.py` rồi chạy lại, không sửa tay file này.

Cùng cơ chế v3 với bộ PM (`docs/PM`), MINH, LAN, HA: nhân vật vẽ tay không + chấm neo (magenta = cầm chính, green = tay kia, cyan = điểm ngồi); đồ vật, nội thất, icon **dùng lại sheet P, O, F của PM**.

## Thứ tự tạo ảnh

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8x7) | `prompts/HUY_A_master.txt` | ảnh thật + `PM_A_master.png` (chỉ lấy style) | Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (tự tin, phòng thủ, quá tải) |
| B (8x7) | `prompts/HUY_B_hands_gestures.txt` | ảnh thật + `HUY_A_master.png` | Cầm nắm + cử chỉ Senior Dev |
| C (8x7) | `prompts/HUY_C_work_scenes.txt` | ảnh thật + `HUY_A_master.png` | Bàn code, họp, 1-1 (tự quyết / offer), sự cố + rollback, OT, Tech Lead / nghỉ, kết thúc |
| D (4x5) | `prompts/HUY_D_portraits.txt` | ảnh thật + `HUY_A_master.png` | 20 chân dung cảm xúc cho hộp thoại |

Tạo sheet A trước và duyệt, sau đó B, C, D đính kèm A làm chuẩn.

## Tạo hình nhân vật (theo docs)

- Vai trò: Backend Developer giỏi, nhanh nhưng thích tự quyết (L1); người hiểu hệ thống nhất, gánh việc critical.
- Xưng “anh” với PM → lớn tuổi hơn PM; tự tin, hơi bướng, dễ phòng thủ khi bị siết quy trình.
- Cung truyện: tự đổi requirement (L1 S02) → quá tải, nhận offer (L2 S07) → ở lại làm Technical Lead hoặc nghỉ (`key_developer_retained` / `key_developer_left`) → runbook, mentoring (L4).
- Đạo cụ đặc trưng: laptop (`prop/laptop_closed`, `prop/laptop_open_34`); tai nghe đeo cổ là một phần nhân vật.

## Animation kịch bản đặt tên sẵn

| Tên trong docs | Chuỗi animation HUY |
|---|---|
| `SENIOR_DEV.projectStatusBriefing` | `huy/lap_carry_01` → `huy/lap_show` → `huy/talk` |
| `SENIOR_DEV.requirementChangeExplanation` | `huy/desk_turn_01` → `huy/explain` → `huy/desk_wave_01` |

## Cảnh → animation gợi ý (bám thoại của Huy trong docs)

| Scenario | Nhịp | Thoại (tóm tắt) | Animation / chân dung |
|---|---|---|---|
| `P1_INTRO` | Mở đầu | Backend chính đã chạy được… nếu không thay đổi nhiều thì vẫn kịp demo. | `huy/talk_01`, `huy/face_smirk` |
| `P1_S01_PROJECT_TAKEOVER` | Mở cảnh | Task cũ vẫn chạy, khoảng một tuần nữa có thể demo. | `SENIOR_DEV.projectStatusBriefing`, `huy/face_neutral` |
| `P1_S01_PROJECT_TAKEOVER` | Nhánh A | Mất một ngày nhưng cả team thống nhất được hiện trạng. | `huy/nod`, `huy/face_serious` |
| `P1_S01_PROJECT_TAKEOVER` | Nhánh B/C | Vậy team tiếp tục theo kế hoạch / có gì cần làm rõ thì báo anh. | `huy/good_01`, `huy/pocket_01` |
| `P1_S02_SENIOR_AUTONOMY` | Mở cảnh | Anh đã đổi cách xử lý để kịp demo… thay đổi nhỏ, không cần review. | `SENIOR_DEV.requirementChangeExplanation`, `huy/face_smirk` |
| `P1_S02_SENIOR_AUTONOMY` | Nhánh A | Việc gì cũng chờ phê duyệt thì tiến độ sẽ chậm hơn. | `huy/defend_03`, `huy/annoyed_01`, `huy/face_annoyed` |
| `P1_S02_SENIOR_AUTONOMY` | Nhánh B | Vậy anh sẽ chủ động xử lý để bảo đảm tiến độ. | `huy/smirk_01`, `huy/face_grin` |
| `P1_S02_SENIOR_AUTONOMY` | Nhánh C | Hợp lý. Thay đổi ảnh hưởng requirement sẽ đưa ra review. | `huy/oneone_agree_01`, `huy/agree`, `huy/face_relieved` |
| `P1_S03_SCOPE_CHANGE` | Mở cảnh | Nhìn giao diện thì nhỏ, nhưng backend phải đổi một số luồng. | `huy/meet_table_warn_01`, `huy/face_skeptical` |
| `P1_S04_TOOL_BUDGET` | Mở cảnh | Có monitoring và công cụ tốt hơn, team phát hiện vấn đề nhanh hơn. | `huy/talk_02`, `huy/face_neutral` |
| `P2_S05_DUAL_DEADLINE` | Mở cảnh | Anh chuyển sang B thì backend của A thiếu người review. | `huy/est_stop_01`, `huy/face_frown` |
| `P2_S05_DUAL_DEADLINE` | Nhánh A/B/C | Vẫn tốn onboarding / lịch không còn dự phòng / tập trung phần tích hợp. | `huy/explain_03`, `huy/worry_01`, `huy/agree_01` |
| `P2_S06_DEADLINE_QUALITY` | Mở cảnh | Release đúng ngày thì phải bỏ vòng regression cuối. | `huy/meet_table_talk`, `huy/face_serious` |
| `P2_S06_DEADLINE_QUALITY` | Nhánh A | Lỗi luồng cũ lọt lên production thì tốn hơn nhiều. | `huy/warn_01`, `huy/face_worried` |
| `P2_S06_DEADLINE_QUALITY` | Nhánh C | Anh sẽ dùng feature flag để kiểm soát phạm vi mở. | `huy/flag`, `huy/face_determined` |
| `P2_S07_KEY_PERSON_RETENTION` | Mở cảnh | Anh vừa nhận offer cao hơn 30%… việc critical dồn hết vào anh. | `huy/phone_read_02`, `huy/oneone_offer_01`, `huy/oneone_tired_01`, `huy/face_tired` |
| `P2_S07_KEY_PERSON_RETENTION` | Cờ OT / restricted | Hai tuần OT… / chịu trách nhiệm mà không đủ quyền. | `huy/oneone_frustrated_01`, `huy/face_exhausted` |
| `P2_S07_KEY_PERSON_RETENTION` | Nhánh A / C1 | Anh sẽ ở lại (quyền lợi / lộ trình Technical Lead). | `huy/oneone_think_01`, `huy/oneone_agree_01`, `huy/shake`, `huy/face_grateful` |
| `P2_S07_KEY_PERSON_RETENTION` | Nhánh B / C2 | Anh nhận offer mới, sẽ hỗ trợ bàn giao. | `huy/oneone_decline_01`, `huy/handover`, `huy/farewell`, `huy/face_apologetic` |
| `P2_S08_CUSTOMER_COMPLAINT` | Biến thể 1/2 | Team tối ưu để kịp demo nhưng chưa ghi thành requirement / đúng tài liệu. | `huy/meet_table_talk`, `huy/defend_01`, `huy/face_defensive` |
| `P2_S08_CUSTOMER_COMPLAINT` | Nhánh B/C | Không chỉ sửa lỗi nhỏ / estimate hai phương án kỹ thuật. | `huy/sigh_01`, `huy/est_weigh`, `huy/wb_explain_01` |
| `P3_S09_PRODUCTION_INCIDENT` | Mở cảnh | Production lỗi lúc 14:00. | `huy/alert`, `huy/incident_type_01`, `huy/face_surprised` |
| `P3_S09_PRODUCTION_INCIDENT` | Nhánh C | Rollback trước, lập nhóm incident rồi điều tra. | `huy/incident_rollback_01`, `huy/incident_monitor_01`, `huy/incident_fixed_01` |
| `P3_S10_SALES_OVERCOMMIT` | Mở cảnh | Sales hứa tính năng AI trong 10 ngày. | `huy/est_count`, `huy/est_stop_01`, `huy/face_frown` |
| `P3_S11_JUNIOR_MISTAKE` | Nhánh C | Bổ sung checklist review/deploy. | `huy/mentor_point_01`, `huy/runbook_tick_01`, `huy/mentor_pat_01` |
| `P3_S12_BIG_PROJECT` | Mở cảnh | Nhận thêm dự án lớn với nguồn lực có hạn. | `huy/crossarms_01`, `huy/face_worried` |
| `P4_S13_OPERATING_SYSTEM` | Mở cảnh | Kiến trúc vẫn phụ thuộc vào anh, cần chuyển quyền review. | `huy/scratch_01`, `huy/delegate_01`, `huy/face_serious` |
| `P4_S13_OPERATING_SYSTEM` | Nhánh A | Output tăng trước mắt, nhưng điểm nghẽn cũ sẽ quay lại. | `huy/warn_01`, `huy/face_skeptical` |
| `P4_S13_OPERATING_SYSTEM` | Nhánh B/C | Anh bổ sung runbook deploy, rollback… team hiểu lý do từng bước. | `huy/doc_read_01`, `huy/runbook_tick_01`, `huy/face_determined` |
| `P4_S14_TEAM_DEVELOPMENT` | Mở cảnh | Anh muốn lên Technical Lead, không ôm mọi vấn đề khó nữa. | `huy/oneone_talk`, `huy/face_determined` |
| `P4_S14_TEAM_DEVELOPMENT` | Nhánh A | Chỉ nhìn số task thì mentoring, review không được ghi nhận. | `huy/frown_01`, `huy/face_frown` |
| `P4_S14_TEAM_DEVELOPMENT` | Nhánh B/C | Phù hợp hướng Technical Lead / đồng ý nếu phạm vi quyết định được ghi rõ. | `huy/lead`, `huy/face_grateful` |
| `P4_S15_CLIENT_EXPANSION` | Nhánh A | Mình đang cam kết khi chưa biết hết phạm vi tích hợp. | `huy/est_warn_01`, `huy/face_worried` |
| `END` | Kết thúc | Chúc mừng / chia tay PM (không có thoại trong docs – dùng cho màn kết). | `huy/cheer`, `huy/congrats`, `huy/sad_01`, `huy/bye_01` |

Tổng: 188 ô, 106 animation.
