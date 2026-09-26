Tên trong bảng là **nhóm animation** (bỏ hậu tố `_01`, `_02`…), đúng với khoá `linh/<nhóm>` trong manifest. `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Cột "Kịch bản" trích câu hoặc diễn biến trong docs, mỗi dòng là một lần Linh xuất hiện.

### Level 1 – Khởi động (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 4)

Linh "xuất hiện trong cảnh team", không có thoại.

| Cảnh | Kịch bản | Sprite Linh |
|---|---|---|
| Cảnh team (S01, S02…) | có mặt ở khu làm việc | `desk_type` / `idle` · — |

### Level 2 – Hòa nhập (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 5)

| Cảnh | Kịch bản | Sprite Linh |
|---|---|---|
| S05 Hai dự án – phòng họp nội bộ | "Em có thể hỗ trợ thêm, nhưng hiện tại các task của dự án A đã kín trong tuần này." | `meet_table_busy` · face_unsure |
| S05 · B (OT) | "Em sẽ cố gắng, nhưng team đã làm khá căng từ đợt demo trước." | `meet_table_try` · face_worried |
| Sau S05 · B – cờ `team_ot_14_days` | team OT 2 tuần | `night_type` → `night_rub` → `tired_idle` · face_tired |
| S06 Deadline/chất lượng – phòng họp release | "Em đã sửa các lỗi trong phạm vi task của mình. Một số luồng liên quan cần dữ liệu và công cụ test chung…" | `meet_table_report` · face_neutral |

### Level 3 – Bứt phá (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 6 – S11 "Thành viên mắc lỗi nghiêm trọng", `JUNIOR_DEV` là nhân vật chính)

Docs không có thoại Level 3; thoại trong trang chơi (`THOAI_MAU.json`) do mình viết theo đúng ý lựa chọn.

| Cảnh | Kịch bản (spec) | Sprite Linh |
|---|---|---|
| S11 mở cảnh | "Junior Developer push nhầm code, làm mất dữ liệu test…" | `desk_push` → `desk_panic` → `desk_stand` · face_panic |
| | báo với PM | `mistake_shock` → `mistake_confess` · face_sorry |
| S11 · A | "Phê bình nhân sự trước team" → cờ `junior_publicly_blamed` | `blamed` · face_ashamed |
| S11 · B | "PM tự xử lý và bỏ qua để giữ hòa khí" | `forgiven` · face_relieved |
| S11 · C | "1-1, phân tích nguyên nhân và bổ sung checklist review/deploy" | `oneone_listen` → `analyze` → `resolve` · face_determined |

### Level 4 – Thu hoạch (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 7)

| Cảnh | Kịch bản | Sprite Linh |
|---|---|---|
| S13 – phòng họp nội bộ | "Có nhiều việc em làm được, nhưng em chưa rõ phần nào mình được tự quyết…" | `meet_table_unsure` · face_unsure |
| S13 · A (cờ `team_ot_14_days`) | "Team vừa trải qua một giai đoạn làm việc kéo dài…" | `tired_talk` · face_tired |
| S13 · B | "Em sẽ chạy thử theo tài liệu. Bước nào người mới không làm được thì team sửa lại ngay." | `checklist_read` → `checklist_tick` · face_determined |
| S13 · C | "Em muốn phụ trách checklist dành cho thành viên mới…" | `meet_table_volunteer` → `guide` · face_eager |
| S13 · C (cờ `junior_publicly_blamed`) | "Em hơi lo mình chưa đủ kinh nghiệm để nhận phần này…" | `hesitant` · face_hesitant |
| S14 – phòng 1-1 | "Em muốn được giao task lớn hơn và có cơ hội trở thành Developer chính thức…" | `oneone_talk` · face_eager |
| S14 (cờ `junior_publicly_blamed`) | "Sau lỗi lần trước, em không chắc team còn tin tưởng…" | `oneone_unsure` · face_anxious |
| S14 (cờ `deployment_checklist_added`) | "Em đã hoàn thiện checklist deploy… Em muốn tiếp tục chịu trách nhiệm phần này." | `oneone_proud` · face_proud |
| S14 · A | "Em sẽ cố hoàn thành nhiều task hơn, nhưng vẫn chưa biết mình cần phát triển năng lực nào…" | `oneone_confused` · face_confused |
| S14 · B | "Em đồng ý. Em muốn biết rõ tiêu chí để có thể tự theo dõi tiến bộ." | `oneone_agree` · face_happy |
| S14 · C | "Em muốn thử nhận module đó. Em sẽ cần review ở những mốc đầu tiên." | `oneone_accept` · face_determined |
| S14 · C (cờ `junior_publicly_blamed`) | "Em vẫn hơi lo mắc lỗi. Nếu có checklist và người hỗ trợ…, em sẽ nhận." | `breath` → `accept` · face_hesitant |
| S16 Final Review | chỉ được nhắc trong báo cáo ("Checklist deploy và bài học từ sai sót của Linh") | — (không có mặt) |
