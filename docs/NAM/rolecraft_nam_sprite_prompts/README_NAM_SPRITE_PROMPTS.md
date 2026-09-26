# Bộ prompt sprite NAM (SALE – Sales Executive)

Sinh bởi `build.py` – sửa ở `build.py` rồi chạy lại, không sửa tay file này.

Cùng cơ chế v3 với bộ PM (`docs/PM`), MINH, LAN, HA, HUY: nhân vật vẽ tay không + chấm neo (magenta = cầm chính, green = tay kia, cyan = điểm ngồi); đồ vật, nội thất, icon **dùng lại sheet P, O, F của PM**.

## Thứ tự tạo ảnh

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8x7) | `prompts/NAM_A_master.txt` | ảnh thật + `PM_A_master.png` (chỉ lấy style) | Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (hào hứng, lúng túng) |
| B (8x7) | `prompts/NAM_B_sales_scenes.txt` | ảnh thật + `NAM_A_master.png` | Điện thoại, hứa 10 ngày (S10), báo giá + họp mở rộng (S15), kết thúc |
| D (4x5) | `prompts/NAM_D_portraits.txt` | ảnh thật + `NAM_A_master.png` | 20 chân dung cảm xúc cho hộp thoại |

Tạo sheet A trước và duyệt, sau đó B, D đính kèm A làm chuẩn. Không có sheet C: Nam chỉ xuất hiện ở L3 S10 và L4 S15, nên các cảnh gộp vào sheet B (như bộ HA).

## Tạo hình nhân vật (theo docs)

- Vai trò: Sales Executive – “ưu tiên cơ hội và cam kết với khách hàng” (docs/KICH_BAN_ROLECRAFT_PM60.md, mục 2), “thúc đẩy cơ hội mở rộng hợp đồng” (L4 S15).
- Xưng “anh” với PM → lớn tuổi hơn PM một chút; hào hứng, thuyết phục, hay hứa trước với khách rồi mới hỏi team.
- Đạo cụ đặc trưng: điện thoại (`prop/phone_back`, `prop/phone_screen`); báo giá dùng `prop/contract_sheet`, danh thiếp dùng `prop/task_card`.
- Ô `dropby_*` tựa vào bàn PM: nội thất gắn điểm `lean_left` (mới, chưa có ở bộ khác) – code cần đặt `furn/desk_monitor` ngay dưới bàn tay tì lên bàn.

## Cảnh → animation gợi ý (bám thoại của Nam)

| Scenario | Nhịp | Thoại (tóm tắt) | Animation / chân dung |
|---|---|---|---|
| `P3_S10_SALES_OVERCOMMIT` | Mở cảnh | Nam ghé qua bàn PM: anh chốt với khách rồi, tính năng AI xong trong mười ngày! | `nam/walk`, `nam/dropby`, `nam/announce`, `nam/face_excited` |
| `P3_S10_SALES_OVERCOMMIT` | PM phản ứng | Mười ngày? Team còn chưa được hỏi! | `nam/pushback_01`, `nam/promise_01`, `nam/easy_01`, `nam/face_sheepish` |
| `P3_S10_SALES_OVERCOMMIT` | Nhánh A | PM nhận deadline, cả team chạy nước rút. | `nam/accept_02`, `nam/good_02`, `nam/face_grin` |
| `P3_S10_SALES_OVERCOMMIT` | Nhánh B | PM nói với khách rằng Sales đã hứa sai. | `nam/blamed`, `nam/offended_01`, `nam/face_offended` |
| `P3_S10_SALES_OVERCOMMIT` | Nhánh C | MVP 10 ngày, phase 2 có estimate. | `nam/reluctant_01`, `nam/accept_01`, `nam/face_relieved` |
| `P4_S15_CLIENT_EXPANSION` | Mở cảnh | Cơ hội tốt để mở rộng hợp đồng… team xác nhận để anh hoàn thiện báo giá. | `nam/meet_table_talk`, `nam/meet_table_tap_01`, `nam/face_eager` |
| `P4_S15_CLIENT_EXPANSION` | Nhánh A | Anh sẽ tiến hành báo giá và thủ tục mở rộng ngay. | `nam/excited_01`, `nam/quote_give`, `nam/shake`, `nam/face_grin` |
| `P4_S15_CLIENT_EXPANSION` | Nhánh B | Chậm hơn, nhưng anh có cơ sở rõ hơn để xây dựng báo giá. | `nam/think_01`, `nam/quote_hold_01`, `nam/face_calculating` |
| `P4_S15_CLIENT_EXPANSION` | Nhánh C | Anh tách báo giá và kế hoạch thanh toán theo từng phase. | `nam/quote_split_01`, `nam/tab_present`, `nam/face_proud` |
| `END` | Kết thúc | Chúc mừng / chia tay PM (không có thoại trong docs – dùng cho màn kết). | `nam/cheer`, `nam/congrats`, `nam/sad_01`, `nam/wave_01` |

Tổng: 132 ô, 64 animation.
