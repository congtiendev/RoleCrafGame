Tên là **nhóm animation** `hiep/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `hiep/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi “Anh Hiệp:” là phản ứng của Anh Hiệp khi người khác nói hoặc theo kết quả lựa chọn.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L1 S03 Thay đổi phạm vi | Vào phòng | Ngày 10 · Phòng họp kickoff, lần đầu gặp PM mới | `walk` → `greet` → `shake` → `listen` → `nod` → `talk` → `sit_01` → `sit_02` → `sit_06` → `sit_03` · `face_polite` |
| L1 S03 Thay đổi phạm vi | Mở cảnh | Anh Hiệp: “Anh muốn thêm hai chức năng vào bản demo. Chắc chỉ vài ngày thôi nhỉ?” | `meet_request` → `meet_assume` · `face_assume` |
| L1 S03 Thay đổi phạm vi |  | Lan: “Hai chức năng này nằm ngoài phạm vi đã xác nhận.” | `meet_listen` → `meet_skeptical` · `face_skeptical` |
| L1 S03 Thay đổi phạm vi | Câu hỏi | PM: “Hai chức năng... mà demo chỉ còn vài ngày.” (PM đang chọn) | `meet_wait_01` · `face_neutral` |
| L1 S03 Thay đổi phạm vi | A | PM: “Được ạ, team sẽ thêm vào.” (client_trust +10) | `meet_pleased` · `face_delighted` |
| L1 S03 Thay đổi phạm vi | B | Anh Hiệp: “Anh hiểu, nhưng cách xử lý này hơi cứng nhắc.” | `meet_displeased` · `face_annoyed` |
| L1 S03 Thay đổi phạm vi | C | Anh Hiệp: “Được, anh cần biết rõ tác động trước.” | `meet_consider` → `meet_note` · `face_conditional` |
| L1 S03 Thay đổi phạm vi | Rời phòng |  | `sit_05` → `bow_01` → `turn_01` → `idle_back_01` → `walk_back` · `face_neutral` |
| L2 S06 Deadline/chất lượng | Vào phòng | Ngày 22 · Phòng họp release | `walk` → `greet_01` → `sit` · `face_polite` |
| L2 S06 Deadline/chất lượng | Mở cảnh | Huy: “Muốn release đúng ngày thì phải bỏ vòng regression cuối.” | `meet_worried_01` · `face_worried` |
| L2 S06 Deadline/chất lượng |  | Anh Hiệp: “Lùi ba ngày thì bên anh phải đổi lịch đào tạo. Anh cần phương án ngay.” | `meet_schedule` → `meet_demand` → `meet_watch_01` → `meet_impatient` · `face_impatient` |
| L2 S06 Deadline/chất lượng | Câu hỏi | PM: “Deadline hay chất lượng... phải chọn thôi.” | `meet_wait_02` · `face_stern` |
| L2 S06 Deadline/chất lượng | A | Release đúng hạn (client_trust +10) · Huy cảnh báo lỗi luồng cũ | `meet_ok` · `face_pleased` |
| L2 S06 Deadline/chất lượng | B | Anh Hiệp: “Anh cần chắc ba ngày này thực sự giảm được rủi ro.” | `meet_doubt` · `face_skeptical` |
| L2 S06 Deadline/chất lượng | C | Release luồng critical trước (client_trust +3) | `meet_accept` · `face_conditional` |
| L2 S08 Complain | Mở cảnh | Anh Hiệp: “Kết quả không giống cách bên anh hiểu. Bên em giải quyết thế nào?” | `meet_complain_01` → `meet_complain_02` → `meet_talk` · `face_annoyed` |
| L2 S08 Complain |  | Lan: “Requirement có một câu hiểu được theo hai cách.” | `sit_04` → `meet_annoyed_01` · `face_concerned` |
| L2 S08 Complain | Biến thể 1 | Anh Hiệp: “Chức năng này chạy khác với cách bên anh đã yêu cầu.” · Huy thừa nhận đổi cách xử lý | `meet_complain_03` → `meet_complain_04` · `face_concerned` |
| L2 S08 Complain | Câu hỏi | PM: “Không phải lúc tranh luận ai đúng ai sai...” | `meet_wait_01` · `face_firm` |
| L2 S08 Complain | A | Anh Hiệp: “Anh không chấp nhận việc đẩy hết trách nhiệm sang khách hàng.” | `meet_reject` · `face_angry` |
| L2 S08 Complain | B | PM nhận lỗi, sửa miễn phí (client_trust +10) | `meet_satisfied` · `face_satisfied` |
| L2 S08 Complain | C | Anh Hiệp: “Anh đồng ý, miễn là trách nhiệm hai bên rõ ràng.” | `meet_resolve` → `meet_sign` → `meet_relieved_01` · `face_cooperative` |
| L3 S09 Incident | Mở cảnh | Hệ thống: 14:00 — Production lỗi, khách hàng bị ảnh hưởng | `phone_read_01` → `phone_call_01` → `phone_urgent_01` · `face_worried` |
| L3 S09 Incident | critical_payment_incident | Cờ regression_test_skipped: lỗi luồng thanh toán | `phone_angry_01` · `face_angry` |
| L3 S09 Incident | Sau mọi nhánh | PM: “Anh Hiệp ơi, em báo về sự cố chiều nay và cách bên em đã xử lý ạ.” | `phone_listen_01` |
| L3 S09 Incident | A / B / C | Cả team xử lý (+15) / một dev, phục hồi kéo dài (−5) / rollback, nhóm incident (+10) | A: `phone_thanks_01` · `face_relieved` · B: `phone_annoyed_01` · `face_impatient` · C: `phone_calm_01` · `face_relieved` → `phone_pocket_01` |
| L3 S10 Sales hứa 10 ngày | Mở cảnh | Linh: “Chị chốt với khách rồi: tính năng AI xong trong mười ngày!” | `phone_expect_01` · `face_eager` |
| L3 S10 Sales hứa 10 ngày | A | PM nhận deadline mười ngày | `phone_pleased_01` · `face_delighted` |
| L3 S10 Sales hứa 10 ngày | B | PM: “Anh Hiệp, bên Sales đã hứa sai, mười ngày là không khả thi.” (client_trust −10) | `phone_shock_01` → `phone_displeased_01` · `face_shocked` |
| L3 S10 Sales hứa 10 ngày | C | PM: “Mười ngày bên em giao MVP, phase 2 có estimate cụ thể.” (+10) | `phone_think_01` → `phone_ok_01` → `phone_type_01` · `face_thinking` → `face_cooperative` |
| L4 S15 Mở rộng hợp tác | Vào phòng | Ngày 56 · Phòng họp với khách hàng | `walk` → `greet_02` → `sit` · `face_polite` |
| L4 S15 Mở rộng hợp tác | client_trust thấp | Anh Hiệp yêu cầu bảo đảm mạnh hơn trước khi mở rộng | `stern_01` → `meet_guarantee` · `face_stern` |
| L4 S15 Mở rộng hợp tác | Mở cảnh | Anh Hiệp: “Bên anh muốn mở rộng thêm module báo cáo và luồng phê duyệt.” | `meet_propose` · `face_eager` |
| L4 S15 Mở rộng hợp tác |  | Linh: “Cơ hội tốt!…” · Lan: “Phạm vi mới chỉ là mong muốn…” | `meet_listen` → `meet_think` · `face_thinking` |
| L4 S15 Mở rộng hợp tác | A | PM nhận toàn bộ (client_trust +10) | `meet_delighted` · `face_delighted` |
| L4 S15 Mở rộng hợp tác | B | Anh Hiệp: “Được, nhưng anh cần mốc cụ thể để trình ngân sách.” | `meet_milestone_01` → `meet_budget_01` → `meet_sigh_01` · `face_conditional` |
| L4 S15 Mở rộng hợp tác | C | Linh tách báo giá theo phase (client_trust +15) | `meet_nod_01` → `meet_shake` · `face_satisfied` |
| L4 S15 Mở rộng hợp tác | C + mvp_plan_agreed | Anh Hiệp: “Cách chia phase này giống phương án MVP trước… Anh đồng ý nếu tiêu chí nghiệm thu của từng phase được ghi rõ.” | `meet_phase_ok` · `face_satisfied` |
| L4 S15 Mở rộng hợp tác | Kết cảnh | Chốt hợp tác | `sit_05` → `shake` → `pleased_01` → `bow_01` → `turn_01` → `walk_back` |
| Hội thoại | Anh Hiệp đứng chờ / đang nói | Mặc định khi đứng (vào phòng, bắt tay) | `idle` · `talk` · `listen` · `nod` |

Anh Hiệp chỉ có ở L1 S03, L2 S06, S08, L3 S09, S10 (qua điện thoại) và L4 S15 (kịch bản mục 2), nên không có làm đêm, sofa, chạy hay màn kết thúc. Mọi ô trong các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).
