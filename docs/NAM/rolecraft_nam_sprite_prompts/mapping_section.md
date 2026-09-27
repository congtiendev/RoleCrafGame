Tên là **nhóm animation** `nam/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `nam/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi “Nam:” là phản ứng của Nam khi người khác nói hoặc theo kết quả lựa chọn.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L1 Cảnh team | Nền khu làm việc | Nam (JUNIOR_DEV) có mặt ở khu team, không thoại; PM gặp team lần đầu | `desk_type` → `desk_focus_01` → `desk_turn_01` → `greet_01` · `face_shy` |
| L1 Cảnh team | Đi lại | Vào / rời khu làm việc | `walk` → `idle` → `sit` → `desk_stand_01` → `sit_04` → `idle_back_01` |
| L2 S05 Hai dự án | Mở cảnh | Ngày 18 · Phòng họp nội bộ (Anh Minh, Huy nói) | `walk` → `lap_carry_01` → `meet_table_listen` · `face_neutral` |
| L2 S05 Hai dự án | A | Thuê Freelancer (Huy: team vẫn mất thời gian onboarding) | `meet_table_nod_01` → `good_01` · `face_relieved` |
| L2 S05 Hai dự án | B | Nam: “Em sẽ cố, nhưng team đã căng từ đợt demo trước.” | `meet_table_worry_01` → `meet_table_talk` → `try_01` · `face_worried` |
| L2 S05 Hai dự án | C | Đàm phán lại ưu tiên với quản lý | `meet_table_nod_01` · `face_relieved` |
| L2 S05 Hai dự án | B → team_ot_14_days | Dẫn truyện: Hai tuần OT liên tục. Cả team kiệt sức. | `night_type` → `night_coffee_01` → `night_rub_01` → `night_yawn_01` → `night_sleep` → `night_wake_01` · `face_tired`; từ đây `idle`/`talk`/`walk` → `tired_idle` / `tired_talk` / `tired_walk` |
| L2 S05 Hai dự án | Áp lực OT |  | `weary` → `tired_try_01` → `tired_sigh_01` → `exhausted_01` · `face_tired` |
| L2 S06 Deadline/chất lượng | Mở cảnh + nhánh | (JUNIOR_DEV có mặt; Huy, Anh Hiệp nói) | `meet_table_listen` · A: `worry_01` · `face_anxious` · B: `meet_table_nod_01` · `face_relieved` · C: `meet_table_note_01` · `face_thinking` |
| L3 S11 Junior gây lỗi | Trước cảnh | Ngày 41 · sáng sớm, Nam phát hiện push nhầm code | `desk_type` → `desk_panic` → `startle_01` → `startle_02` · `face_shocked` → `face_panic` |
| L3 S11 Junior gây lỗi | Chạy đi báo |  | `desk_stand_01` → `run` → `lap_hold_01` → `lap_show` · `face_panic` |
| L3 S11 Junior gây lỗi | Mở cảnh | Nam: “Em xin lỗi... em push nhầm code, dữ liệu test mất hết rồi.” | `apologize` → `sorry_talk` → `teary_01` · `face_sorry` |
| L3 S11 Junior gây lỗi |  | Lan: “Team sẽ mất gần một ngày để khôi phục.” | `lap_close_01` → `lap_hug_01` → `worry_02` · `face_ashamed` |
| L3 S11 Junior gây lỗi | A | PM: “Mọi người nghe đây: lỗi lần này là do Nam!” → junior_publicly_blamed | `hurt_01` → `shrink` · `face_ashamed` |
| L3 S11 Junior gây lỗi | B | PM: “Để mình xử lý nốt. Chuyện này bỏ qua nhé.” | `confused_01` → `uneasy_01` · `face_confused` |
| L3 S11 Junior gây lỗi | C | PM: “Nam, mình nói chuyện riêng, cùng tìm nguyên nhân rồi thêm checklist deploy.” | `oneone_listen_01` → `oneone_nod_01` → `oneone_talk_01` · `face_thankful` |
| L3 S11 Junior gây lỗi | C → khôi phục + checklist | deployment_checklist_added | `desk_fix_01` → `check_write` → `check_tick_01` → `check_read_01` → `resolve_01` · `face_determined` |
| L4 S13 Hệ thống vận hành | Mở cảnh | (JUNIOR_DEV có mặt; Anh Minh, Lan nói) | `meet_table_listen` · `face_neutral` |
| L4 S13 Hệ thống vận hành | A + team_ot_14_days | Nam: “Team vừa trải qua một giai đoạn làm việc kéo dài. Nếu tiếp tục tăng tốc, em lo mọi người sẽ không giữ được chất lượng.” | `tired_worry` · `face_worried` |
| L4 S13 Hệ thống vận hành | B | Chuẩn hóa quy trình (Lan gộp checklist) | `meet_table_nod_01` → `meet_table_note_01` · `face_happy` |
| L4 S13 Hệ thống vận hành | C | Nam: “Em muốn phụ trách checklist cho thành viên mới.” | `meet_table_raise_01` → `eager` · `face_eager` |
| L4 S13 Hệ thống vận hành | C + junior_publicly_blamed | Nam: “Em hơi lo mình chưa đủ kinh nghiệm để nhận phần này. Nếu có người review cùng, em sẽ thử.” | `hesitant_01` → `hesitant_02` → `try_01` · `face_hesitant` |
| L4 S13 Hệ thống vận hành | C → onboarding | Nam phụ trách checklist cho thành viên mới | `check_hold_01` → `check_point_01` → `check_give_01` → `check_hug_01` · `face_confident` |
| L4 S14 Phát triển team | Mở cảnh | Ngày 52 · Phòng họp 1-1 (Anh Minh, Huy nói) | `oneone_listen_01` · `face_neutral` |
| L4 S14 Phát triển team | junior_publicly_blamed | Nam: “Sau lỗi lần trước, em không chắc team còn tin tưởng giao việc quan trọng cho em không.” | `oneone_sad_01` → `oneone_fidget_01` · `face_unsure` |
| L4 S14 Phát triển team | deployment_checklist_added | Nam: “Em đã hoàn thiện checklist deploy và hỗ trợ team dùng trong các lần release gần đây. Em muốn tiếp tục chịu trách nhiệm phần này.” | `oneone_proud_01` → `oneone_talk_01` · `face_proud` |
| L4 S14 Phát triển team | A | Đánh giá theo số task (Lan: QA ngăn lỗi không có ticket) | `sigh_01` · `face_worried` |
| L4 S14 Phát triển team | B | Nam: “Em đồng ý. Có tiêu chí em sẽ tự theo dõi được tiến bộ.” | `oneone_eager_01` → `nod` · `face_eager` |
| L4 S14 Phát triển team | C | PM: “…Nam sở hữu một module.” | `oneone_surprised_01` → `happy` → `thankful_01` · `face_happy` |
| L4 S14 Phát triển team | C + junior_publicly_blamed | Nam: “Em vẫn hơi lo mắc lỗi. Nếu có checklist và người hỗ trợ ở các mốc quan trọng, em sẽ nhận.” | `worry_01` → `nod` · `face_hesitant` |
| L4 S14 Phát triển team | Kết cảnh | Nhận module / IDP | `proud` → `good_02` · `face_confident` |
| Hội thoại | Nam đứng nói / nghe | Mặc định khi đứng | `talk` · `listen` · `greet_02` · `lap_type` · `meet_table_talk` |

Nam chỉ có ở cảnh team L1 (nền, không thoại), L2 S05, S06, L3 S11 và L4 S13, S14 (kịch bản mục 2), nên không có sự cố production, gặp khách hay màn kết thúc. Mọi ô trong các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).
