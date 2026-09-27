Tên là **nhóm animation** `minh/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `minh/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng ghi “(… nói)” là phản ứng của Anh Minh khi người khác nói.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L1 Intro nhận việc | Mở cảnh | Anh Minh: “Dự án xong 40%, PM cũ nghỉ, tài liệu thiếu. Khách muốn demo sau 7 ngày.” | `walk` → `greet` → `doc_give` · `face_explain` |
| L1 Intro nhận việc |  | Anh Minh: “Em có team 3 người và 100 điểm ngân sách. Quyết định là của em.” | `tab_present` → `point_01` · `face_challenge` |
| L1 Intro nhận việc |  | PM: “Em hiểu rồi ạ. Để em gặp team trước.” | `nod` → `encourage_01` · `face_encouraging` |
| L1 S01 Tiếp quản | Mở cảnh | (MANAGER có mặt, không thoại; Huy, Lan nói) | `listen` → `turn_01` → `walk_back` (rời cảnh) |
| L1 Tổng kết | Tốt | Anh Minh: “Em đã bắt đầu kiểm soát được dự án. Giai đoạn tới sẽ khó hơn.” | `good_03` → `encourage_01` · `face_approving` |
| L1 Tổng kết | Trung bình | Anh Minh: “Dự án vẫn chạy, nhưng vài quyết định đang tạo ra rủi ro. Theo dõi kỹ nhé.” | `talk` → `concern_01` · `face_concerned` |
| L1 Tổng kết | Rủi ro | Anh Minh: “Tiến độ trước mắt ổn, nhưng nền tảng chưa vững. Vấn đề sẽ quay lại.” | `serious_01` → `warn_01` · `face_serious` |
| L2 Intro | Mở cảnh | Anh Minh: “Công ty có thêm dự án B. Từ giờ em không chỉ quản lý một deadline.” | `two_projects_01` → `assign_01` · `face_explain` |
| L2 S05 Hai dự án | Mở cảnh | Anh Minh: “Dự án B cần demo sau hai tuần, dự án A vẫn giữ mốc release.” | `present` → `count` · `face_explain` → `wait_01` |
| L2 S05 Hai dự án | A / B | (PM, Huy / Nam nói) | A: `weigh_02` · `face_thinking` · B: `frown_01` · `face_concerned` |
| L2 S05 Hai dự án | C | Anh Minh: “Vậy B sẽ không có demo đầy đủ sau hai tuần.” | `doubt_01` → `nod` · `face_skeptical` |
| L2 S07 Giữ Huy | Mở cảnh | (Huy nói với PM) | `oneone_listen` · `face_serious` |
| L2 S07 Giữ Huy | A | PM đề xuất ngân sách retention | `oneone_show` → `oneone_agree_01` · `face_thinking` |
| L2 S07 Giữ Huy | B | Anh Minh: “Rủi ro ngắn hạn rất cao. Dự án phải chạy được khi chưa có người mới.” | `oneone_warn_01` · `face_warning` |
| L2 S07 Giữ Huy | C → C1 / C2 | PM đề xuất lộ trình Technical Lead | `oneone_listen` → C1: `oneone_agree_01` · `face_approving` / C2: `sigh_01` · `face_concerned` |
| L2 S08 Complain | Mở cảnh | (MANAGER có mặt, không thoại; Anh Hiệp, Lan nói) | `meet_table_listen` · `face_serious` |
| L2 S08 Complain | A / B / C | (PM, Anh Hiệp, Lan nói) | A: `meet_table_frown_01` · `face_stern` · B: `meet_table_doubt_01` · C: `meet_table_agree_01` · `face_approving` |
| L2 Tổng kết | Tốt | Anh Minh: “Em đã biết quản lý đánh đổi thay vì chỉ phản ứng với từng yêu cầu.” | `good_02` → `applaud` · `face_proud` |
| L2 Tổng kết | Trung bình | Anh Minh: “Dự án vẫn chạy, nhưng đang dựa nhiều vào nỗ lực cá nhân.” | `talk` → `concern_01` · `face_concerned` |
| L2 Tổng kết | Rủi ro | Anh Minh: “Tiến độ tăng, nhưng team và chất lượng đang phải trả giá.” | `warn_01` → `sigh_01` · `face_stern` |
| L3 S10 Sales hứa 10 ngày | Mở cảnh | (MANAGER có mặt; Linh: “Chị chốt với khách rồi…”) | `phone_read_02` → `overcommit_listen_01` → `overcommit_doubt_01` · `face_skeptical` |
| L3 S10 Sales hứa 10 ngày | A / B / C | (PM nói) | A: `nod` · `face_neutral` · B: `overcommit_displeased_01` · `face_stern` · C: `overcommit_approve_01` · `face_approving` |
| L3 S12 Dự án lớn | Mở cảnh | Dẫn truyện: Anh Minh gọi PM lên phòng | `desk_phone_01` → `desk_turn_01` → `desk_invite_01` |
| L3 S12 Dự án lớn |  | Anh Minh: “Ban giám đốc muốn team nhận thêm một dự án lớn. Làm tốt thì rất có lợi cho em.” | `desk_offer` · `face_challenge` |
| L3 S12 Dự án lớn | A / B / C | Em nhận ngay / Em xin từ chối / Em nhận, nếu có thêm một người… | A: `desk_pleased_01` · `face_satisfied` · B: `desk_frown_01` · `face_disappointed` · C: `desk_listen_01` → `desk_agree_01` · `face_approving` |
| L4 Intro | Mở cảnh | Anh Minh: “Em còn 15 ngày trước buổi đánh giá cuối kỳ.” | `watch_01` → `talk` · `face_serious` |
| L4 Intro |  | Anh Minh: “Hãy để các quyết định 15 ngày cuối thành bằng chứng cho năng lực của em.” | `finger_01` → `encourage_01` · `face_encouraging` |
| L4 S13 Hệ thống vận hành | Mở cảnh | Anh Minh: “Nếu Huy nghỉ hoặc Lan chuyển dự án, team có tự vận hành được không?” | `meet_table_ask_01` · `face_concerned` |
| L4 S13 Hệ thống vận hành | A / B / C | (PM, Huy, Lan, Nam nói) | A: `meet_table_frown_01` · B: `meet_table_note_01` → `meet_table_agree_01` · C: `meet_table_agree_01` · `face_satisfied` |
| L4 S13 Hệ thống vận hành | Kết cảnh | xem lại tài liệu vận hành | `doc_read` → `doc_flip_01` → `doc_close_01` · `face_thinking` |
| L4 S14 Phát triển team | Mở cảnh | Anh Minh: “Đánh giá từng người theo kết quả, năng lực và tiềm năng phát triển.” | `oneone_talk` → `list` · `face_explain` |
| L4 S14 Phát triển team | A / B / C | (PM, Lan, Nam, Huy nói) | A: `oneone_warn_01` · `face_concerned` · B: `oneone_agree_01` · C: `oneone_agree_01` · `face_approving` |
| L4 S14 Phát triển team | Kết cảnh | PM nộp bản đánh giá | `doc_receive_01` → `doc_read` · `face_thinking` |
| L4 S15 Mở rộng hợp tác | Mở cảnh + nhánh | (MANAGER có mặt, không thoại) | `meet_table_listen` · A: `meet_table_frown_01` · `face_concerned` · B: `meet_table_agree_01` · C: `meet_table_agree_01` · `face_satisfied` |
| L4 S16 Final Review | Mở cảnh | Anh Minh: “PM tốt không phải người không gặp vấn đề, mà là người biết chịu trách nhiệm.” | `walk` → `adjust_02` → `sit` → `panel_open_01` · `face_formal` |
| L4 S16 Final Review |  | Anh Minh: “Em có 10 phút cho kết quả, quyết định quan trọng và kế hoạch 90 ngày.” | `panel_open_02` · `face_formal` |
| L4 S16 Final Review | A | (Chị Hà: báo cáo chưa nói gì về sự cố…) | `panel_disappoint_01` · `face_disappointed` |
| L4 S16 Final Review | B | Anh Minh: “Minh bạch là tốt, nhưng em cần biến nó thành kế hoạch hành động.” | `panel_critique_01` · `face_serious` |
| L4 S16 Final Review | C | Anh Minh: “Đây là cách một PM chịu trách nhiệm.” | `panel_approve_01` · `face_approving` |
| L4 S16 Final Review | Phản biện | Chị Hà hỏi 4 câu · Dẫn truyện: Chị Hà và Anh Minh trao đổi… | `panel_listen_01` / `panel_note_01` → `panel_confer_01` → `review_thank_01` → `review_stand_01` · `face_formal` |
| Kết thúc | Pass xuất sắc | Anh Minh: “Em không chỉ qua thử việc mà còn giúp team vận hành tốt hơn…” | `excellent_announce_01` → `excellent_applaud_01` → `pass_shake` · `face_proud` |
| Kết thúc | Pass | Anh Minh: “Chúc mừng em đã trở thành PM chính thức…” | `pass_announce` → `pass_shake` → `badge_give` (khớp hàng đổi thẻ của PM) · `face_congrats` |
| Kết thúc | Gia hạn | Anh Minh: “Em có tiềm năng, nhưng kết quả chưa đủ ổn định…” | `extend_talk` → `extend_encourage_01` · `face_serious` |
| Kết thúc | Không đạt | Anh Minh: “Công ty chưa thể giao em vai trò PM chính thức ở thời điểm này.” | `fail_talk` → `fail_sigh_01` → `fail_reassure_01` → `fail_goodbye_01` · `face_regretful` |

Anh Minh không có mặt ở S02, S03, S04, S06, S09, S11 (kịch bản mục 2) nên không có sprite cho các cảnh đó. Vào/ra cảnh: `walk` (lật để đi sang trái), rời phòng bằng `turn_01` → `walk_back`.
