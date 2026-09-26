Tên trong bảng là **nhóm animation** (bỏ hậu tố `_01`, `_02`…), đúng với khoá `minh/<nhóm>` trong manifest. `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Cột "Kịch bản" trích câu hoặc diễn biến trong docs, mỗi dòng là một lần Anh Minh xuất hiện.

### Level 1 – Khởi động (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 4)

| Cảnh | Kịch bản | Sprite Anh Minh |
|---|---|---|
| Intro nhận việc | "Chào mừng em đến với team…" | `walk` → `greet` → `shake` · face_welcome |
| | Bàn giao: 40%, demo sau 7 ngày | `doc_give` · face_explain |
| | "…team ba người và có 100 điểm ngân sách" | `tab_present` · face_explain |
| | "Quyết định đầu tiên là của em…" | `point` → `crossarms` · face_challenge |
| S01 | "Anh Minh rời cuộc họp sau khi bàn giao" | `leave` |
| Tổng kết | Kết quả tốt | `good` → `encourage` · face_approving |
| | Kết quả trung bình | `talk` → `concern` · face_concerned |
| | Kết quả rủi ro | `serious` → `sigh` · face_serious |

### Level 2 – Hòa nhập (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 5)

| Cảnh | Kịch bản | Sprite Anh Minh |
|---|---|---|
| Intro | "Hai tuần đầu của em đã kết thúc… thêm một dự án mới" | `talk` · face_explain |
| | "…làm rõ dữ kiện và chỉ ra đánh đổi" | `weigh` · face_serious |
| S05 Hai dự án | "trình bày thông tin dự án B trên màn hình" | `present` → `count` → `two_projects` → `assign` · face_explain |
| | "yêu cầu đưa ra phương án nguồn lực ngay trong ngày" | `wait` · face_serious |
| S05 · A | "Công ty đồng ý nếu em kiểm soát được ngân sách…" | `meet_table_talk` · face_serious |
| S05 · C | "Như vậy dự án B sẽ không có bản demo đầy đủ sau hai tuần." | `meet_table_doubt` · face_skeptical |
| S07 Giữ Huy | "Huy là nhân sự quan trọng, nhưng ngân sách dự án không vô hạn…" | `invite_sit` → `oneone_show` · face_serious |
| S07 · A | "Anh đồng ý nếu em xác định rõ vai trò của Huy…" | `oneone_agree` · face_approving |
| S07 · B | "Đây là phương án có rủi ro cao trong ngắn hạn…" | `oneone_warn` · face_warning |
| S08 Complain | Anh Minh **nhắn riêng**: "Em là người chủ trì cuộc họp…" | `phone_type` (Minh ngoài cảnh; hộp thoại face_serious) |
| S08 kết cảnh | "Em đã đi hết 30 ngày đầu…" | `talk` → `finger` · face_serious |
| Tổng kết | tốt / trung bình / rủi ro | như Level 1: `good` / `concern` / `sigh` |

### Level 3 – Bứt phá (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 6: `MANAGER` tham gia S10, S12)

Docs không có thoại Level 3, chỉ có người tham gia, bối cảnh và lựa chọn. S09 (sự cố production) **không có** `MANAGER` nên không có sprite.

| Cảnh | Kịch bản (spec) | Sprite Anh Minh |
|---|---|---|
| S10 Sales hứa quá khả năng | Sales đã hứa tính năng AI trong 10 ngày | `phone_read` (tin xấu) → `overcommit_listen` → `overcommit_doubt` · face_skeptical |
| S10 · A | nhận deadline (`management_trust +5`) | `nod` · face_neutral |
| S10 · B | nói với khách rằng Sales hứa sai (`management_trust -10`) | `overcommit_displeased` · face_stern |
| S10 · C | MVP 10 ngày + phase 2 (`management_trust +10`) | `overcommit_approve` · face_approving |
| S12 Cơ hội dự án lớn | Ban giám đốc muốn team nhận dự án lớn | `phone_call` → `offer` · face_challenge |
| S12 · A / B / C | nhận ngay (+10) / từ chối (−10) / nhận có điều kiện (+10) | A: `good` · B: `frown` · C: `offer_listen` → `offer_accept` |

### Level 4 – Thu hoạch (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 7)

| Cảnh | Kịch bản | Sprite Anh Minh |
|---|---|---|
| Intro | "Em còn 15 ngày trước buổi đánh giá cuối kỳ." | `watch` → `talk` · face_serious |
| | "…ba thứ: kết quả, sự trưởng thành của đội ngũ, trách nhiệm" | `list` · face_explain |
| | "Đừng chỉ chuẩn bị một bản báo cáo đẹp…" | `emph` · face_serious |
| S13 | "Nếu Huy nghỉ hoặc Lan chuyển dự án, team có tiếp tục vận hành được không?" | `meet_table_ask` · face_concerned |
| | "Em có 15 ngày cuối. Em sẽ ưu tiên…?" | `point` · face_challenge |
| S13 kết cảnh | "xem lại bảng phân công và tài liệu vận hành" | `doc_read` → `doc_flip` → `doc_close` · face_thinking |
| S14 | "Anh cần em đánh giá từng thành viên…" | `oneone_talk` · face_explain |
| S14 kết cảnh | "Người chơi gửi bản đánh giá… cho Anh Minh" | `doc_receive` → `doc_read` · face_thinking |
| S15 | "Công ty muốn mở rộng hợp tác, nhưng… phải bảo đảm khả năng thực hiện" | `meet_table_talk` · face_serious |
| S15 kết cảnh | "Một hợp đồng mới chỉ là kết quả tốt khi…" | `talk` → `finger` · face_serious |
| S16 Final Review | "Một PM tốt không phải người không gặp vấn đề…" | `sit` → `panel_open` · face_formal |
| S16 · A | "Thành tích là cần thiết, nhưng việc giảm nhẹ vấn đề…" | `panel_disappoint` · face_disappointed |
| S16 · B | "Minh bạch không có nghĩa là liệt kê toàn bộ khó khăn…" | `panel_critique` · face_serious |
| S16 · C | "Đây là cách một PM chịu trách nhiệm…" | `panel_approve` · face_approving |
| S16 phản biện (HR hỏi) | 4 câu hỏi | `panel_listen` / `panel_note` / `panel_confer` · face_formal |
| S16 kết cảnh | "cảm ơn người chơi và đề nghị chờ kết quả" | `review_thank` → `review_stand` · face_formal |

### Kết thúc campaign (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 9)

| Kết quả | Kịch bản | Sprite Anh Minh |
|---|---|---|
| Pass xuất sắc | "…Công ty đề xuất giao cho em phạm vi lớn hơn…" | `excellent_announce` → `excellent_applaud` → `pass_shake` · face_proud |
| Pass | "Chúc mừng em đã vượt qua thời gian thử việc…" | `pass_announce` → `pass_shake` → `badge_give` (khớp hàng badge swap của PM) · face_congrats |
| Gia hạn thử việc | "…Thời gian gia hạn sẽ tập trung vào những năng lực còn thiếu…" | `extend_talk` → `extend_encourage` · face_serious |
| Không đạt | "…Công ty chưa thể giao vai trò PM chính thức…" | `fail_talk` → `fail_sigh` → `fail_reassure` → `fail_goodbye` · face_regretful |
