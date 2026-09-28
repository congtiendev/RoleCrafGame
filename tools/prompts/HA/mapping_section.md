Tên là **nhóm animation** `ha/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `ha/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi “Chị Hà (HR):” là phản ứng của Chị Hà khi người khác nói hoặc theo kết quả.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L4 S16 Final Review | Trước cảnh | Chị Hà vào phòng đánh giá cùng Anh Minh | `walk` → `greet_01` → `sit_01` → `sit_02` · `face_formal` |
| L4 S16 Final Review | Mở cảnh | Dẫn truyện: Anh Minh và Chị Hà bên nhân sự ngồi ở bàn đánh giá. | `panel_listen` · `face_neutral` |
| L4 S16 Final Review |  | Chị Hà (HR): “Chị bên nhân sự, sẽ cùng anh Minh đánh giá kết quả thử việc của em.” | `panel_intro` · `face_polite_smile` |
| L4 S16 Final Review |  | Anh Minh: “…Em có 10 phút cho kết quả, quyết định quan trọng và kế hoạch 90 ngày.” | `panel_read_01` → `panel_flip_01` · `face_listening` |
| L4 S16 Final Review | Hậu quả trước review | team_ot_14_days + tinh thần dưới 40: báo cáo gắn cảnh báo burnout | `panel_warn_01` · `face_concerned` |
| L4 S16 Final Review | Hậu quả trước review | process_gap_unresolved: hội đồng yêu cầu giải trình | `panel_probe_01` · `face_probing` |
| L4 S16 Final Review | Hậu quả trước review | process_standardized / team_ownership / development_plan_created / ownership_delegated: bằng chứng tích cực | `panel_evidence_01` · `face_pleased` |
| L4 S16 Final Review | Câu hỏi | PM: “Em xin bắt đầu ạ.” | `panel_note` · `face_serious` |
| L4 S16 Final Review | A | Chị Hà (HR): “Báo cáo chưa nói gì về sự cố production và tải của team.” | `panel_frown_01` → `panel_point_01` · `face_skeptical` → `face_frown` |
| L4 S16 Final Review | B | PM nhận trách nhiệm; Anh Minh: “Minh bạch là tốt, nhưng em cần biến nó thành kế hoạch hành động.” | `panel_consider_01` · `face_thinking` |
| L4 S16 Final Review | C | PM báo cáo bốn phần; Anh Minh: “Đây là cách một PM chịu trách nhiệm.” | `panel_impressed_01` → `panel_pleased_01` · `face_impressed` |
| L4 S16 Phản biện | Câu 1 | Chị Hà (HR): “Quyết định nào trong 60 ngày tạo ra ảnh hưởng lớn nhất, và vì sao?” | `panel_ask_01` · `face_questioning` |
| L4 S16 Phản biện | Câu 2 | Chị Hà (HR): “Nếu được làm lại một quyết định, em sẽ thay đổi điều gì?” | `panel_ask_02` · `face_probing` |
| L4 S16 Phản biện | Câu 3 | Chị Hà (HR): “Team hiện tại có vận hành được mà không cần em không?” | `panel_ask_03` · `face_skeptical` |
| L4 S16 Phản biện | Câu 4 | Chị Hà (HR): “Ba ưu tiên của em trong 90 ngày tới là gì?” | `panel_ask_04` · `face_questioning` |
| L4 S16 Phản biện | PM trả lời | sau mỗi câu trả lời | `panel_think_01` → `panel_tick_01` · `face_thinking` |
| L4 S16 Phản biện | Kết cảnh | Dẫn truyện: Chị Hà và Anh Minh trao đổi với nhau... | `panel_confer` · `face_formal` → `sit_03` |
| Kết thúc | Pass xuất sắc | Chị Hà (HR): “Phòng nhân sự sẽ gửi em hợp đồng chính thức và lộ trình phát triển quản lý.” | `congrats` → `contract_give` → `roadmap_show_01` · `face_congrats` |
| Kết thúc | Pass | Chị Hà (HR): “Phòng nhân sự sẽ gửi em hợp đồng chính thức trong tuần này.” | `congrats_02` → `contract_give` → `shake` → `pleased_01` · `face_warm` |
| Kết thúc | PM cảm ơn (Pass) | PM: “Em cảm ơn ạ!!” / “Phù... em cảm ơn anh ạ.” | `nod` → `greet_02` · `face_laugh` |
| Kết thúc | Gia hạn | Chị Hà (HR): “Chị sẽ gửi em mục tiêu và tiêu chí đánh giá cho giai đoạn gia hạn.” | `goals_give_01` → `goals_explain_01` → `encourage_01` · `face_encouraging` |
| Kết thúc | Không đạt | Chị Hà (HR): “Chị sẽ hỗ trợ em các thủ tục kết thúc thử việc.” | `sympathetic_01` → `procedure_give_01` → `comfort_01` → `sigh_01` · `face_sympathetic` → `face_regretful` |
| Kết thúc | Chào tạm biệt | Dẫn truyện (Không đạt): Ôm thùng đồ ra cửa... / các kết thúc khác | `bow_01` → `turn_01` → `idle_back_01` → `walk_back` · `face_sigh` |
| Hội thoại | Chị Hà đứng nói / nghe | Mặc định khi đứng ở màn kết thúc | `idle` · `talk` · `listen` · `face_formal` |

Chị Hà chỉ có ở L4 S16 Final Review và các màn kết thúc (kịch bản mục 2), nên không có cảnh làm việc, họp team hay gặp khách. Mọi ô trong các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).
