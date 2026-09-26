Tên trong bảng là **nhóm animation** (`nam/<nhóm>`) hoặc một ô cụ thể (`nam/<ô>_01`). `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Kịch bản gốc: `docs/KICH_BAN_ROLECRAFT_PM60.md`; thoại trong game: `THOAI_MAU.json`.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
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
