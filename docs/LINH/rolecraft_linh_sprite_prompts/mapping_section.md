Tên là **nhóm animation** `linh/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `linh/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi “Linh:” là phản ứng của Linh khi người khác nói hoặc theo kết quả lựa chọn.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L3 S10 Sales hứa 10 ngày | Vào cảnh | Dẫn truyện: Ngày 37 · Linh ghé qua bàn PM. | `walk` → `greet_01` · `face_grin` |
| L3 S10 Sales hứa 10 ngày | Mở cảnh | Linh: “Chị chốt với khách rồi: tính năng AI xong trong mười ngày!” | `announce` → `phone_show_01` → `wink_01` · `face_excited` → `face_wink` |
| L3 S10 Sales hứa 10 ngày |  | PM: “Mười ngày? Team còn chưa được hỏi!” | `shrug_01` → `persuade_01` → `sheepish_01` · `face_persuading` → `face_sheepish` |
| L3 S10 Sales hứa 10 ngày | Câu hỏi | PM đang chọn (Anh Minh, Huy có mặt) | `listen` → `idle` · `face_neutral` |
| L3 S10 Sales hứa 10 ngày | A | PM: “Nhận. Cả team chạy nước rút mười ngày.” | `cheer` → `highfive_01` · `face_laugh` |
| L3 S10 Sales hứa 10 ngày | B | PM: “Anh Hiệp, bên Sales đã hứa sai, mười ngày là không khả thi.” | `shock_01` → `offended_01` → `angry_01` · `face_surprised` → `face_offended` → `face_frown` |
| L3 S10 Sales hứa 10 ngày | B → gọi khách chữa cháy |  | `phone_call_01` → `phone_nervous_01` · `face_nervous` → `face_apologetic` |
| L3 S10 Sales hứa 10 ngày | C | PM: “Mười ngày bên em giao MVP, phase 2 có estimate cụ thể.” | `calc_01` → `agree_01` → `nod` · `face_calculating` |
| L3 S10 Sales hứa 10 ngày | C → báo lại khách |  | `phone_call_02` → `phone_type_01` → `relieved_01` · `face_relieved` |
| L3 S10 Sales hứa 10 ngày | Rời cảnh |  | `phone_pocket_01` → `turn_01` → `idle_back_01` → `walk_back` |
| L4 S15 Mở rộng hợp tác | Vào phòng | Ngày 56 · Phòng họp với khách hàng | `walk` → `greet_02` → `shake` → `sit_01` → `sit_02` → `sit_03` · `face_charming` |
| L4 S15 Mở rộng hợp tác | Mở cảnh | Anh Hiệp muốn mở rộng module báo cáo · Linh: “Cơ hội tốt! Team xác nhận để chị làm báo giá nhé.” | `meet_eager` → `meet_rub_01` · `face_eager` |
| L4 S15 Mở rộng hợp tác |  | Lan: “Phạm vi mới chỉ là mong muốn, chưa có tiêu chí nghiệm thu.” | `meet_listen_01` → `meet_impatient` · `face_impatient` |
| L4 S15 Mở rộng hợp tác | large_project_without_resources | Huy: “Team đang chia nguồn lực cho dự án lớn vừa nhận…” | `meet_frown_01` · `face_frown` |
| L4 S15 Mở rộng hợp tác | Câu hỏi | PM: “Cơ hội lớn, nhưng nhận thế nào cho an toàn?” | `meet_wait_01` · `face_thinking` |
| L4 S15 Mở rộng hợp tác | A | PM nhận toàn bộ (budget +25) | `meet_celebrate` → `meet_calc_01` · `face_excited` |
| L4 S15 Mở rộng hợp tác | B | Khảo sát ba ngày rồi gửi roadmap | `meet_disappointed` · `face_disappointed` |
| L4 S15 Mở rộng hợp tác | C | Linh: “Chị tách báo giá theo từng phase cho khách dễ duyệt.” | `meet_think_01` → `meet_talk` → `meet_quote` → `meet_show` · `face_thinking` → `face_proud` |
| L4 S15 Mở rộng hợp tác | C → khách đồng ý |  | `meet_pleased` → `meet_shake` · `face_proud` |
| L4 S15 Mở rộng hợp tác | Rời phòng |  | `sit_04` → `shake` → `phone_read_01` → `talk` → `turn_01` → `walk_back` |

Linh chỉ có ở L3 S10 và L4 S15 (kịch bản mục 2), nên không có làm đêm, sự cố, 1-1 hay màn kết thúc. Mọi ô trong các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).
