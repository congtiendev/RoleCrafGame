Tên trong bảng là **nhóm animation** (bỏ hậu tố `_01`, `_02`…), đúng với khoá `pm/<nhóm>` trong manifest. Trường `action` trong JSON kịch bản trỏ tới nhóm này; `emotion` chọn chân dung `pm/face_<cảm xúc>` trong hộp thoại và emote `icon/emo_*` nổi trên đầu. Mũi tên `→` là chuỗi phát nối tiếp. Khi cảnh đang ngồi ở bàn họp, dùng `meet_table_present` thay cho `tab_present`.

### Level 1 – Khởi động

| Cảnh | Mở màn | A | B | C |
|---|---|---|---|---|
| Intro nhận việc | `walk` → `greet` → `shake`; giấy tờ bàn giao lộn xộn: `crouch` | | | |
| S01 Tiếp quản | `tab_read` · face_worried | `wb_write` → `wb_point` | `goahead` | `night_type` → `night_rub` · emo_coffee |
| S02 Senior tự quyết | `phone_read` → `nod` · face_worried | `stop` · face_serious | `goahead` | `oneone_talk` · face_confident |
| S03 Thay đổi phạm vi | `sit` → `meet_table_listen` | `thumbs` · face_happy | `doc_raise` / `stop` | `count` → `meet_table_present` |
| S04 Quỹ công cụ | `think` + `tab_read` | `tab_present` | `talk` + `headshake` | `count` |
| Tổng kết | `good` / `bad` theo kết quả | | | |

### Level 2 – Hòa nhập

| Cảnh | Mở màn | A | B | C |
|---|---|---|---|---|
| Intro | `nod` → `talk` | | | |
| S05 Hai dự án | `meet_table_listen` · emo_exclaim | `meet_table_present` (thuê Freelancer) | `rally` (OT) | `count` → `tab_present` |
| S06 Deadline/chất lượng | `meet_table_worry` | `goahead` | `bow` + `tab_present` | `tab_present` + `count` |
| S07 Giữ Huy | `oneone_listen` → `oneone_worry` | `tab_present` (ngân sách retention) | `oneone_talk` → `doc_give` | `oneone_talk` → C1 `jump` / C2 `sigh` |
| S07 kết cảnh | `desk_type` | | | |
| S08 Complain | `meet_table_listen` → `phone_read` (anh Minh nhắn riêng) | `doc_raise` / `crossarms` | `bow` (sâu) | `count` → `meet_table_present` → `meet_table_agree` |

### Level 3 – Bứt phá

Kịch bản Level 3 chưa có thoại chi tiết, mapping này suy từ flow và cần rà lại.

| Cảnh | Mở màn | A | B | C |
|---|---|---|---|---|
| S09 Production Incident | `alert` → `startle` → `run` | `command` (dừng cả team) | `delegate` (giao một dev) | `rollback` → `relief` |
| S09 sau mọi nhánh | `phone_call` · face_apologetic (báo khách) | | | |
| S10 Sales hứa 10 ngày | `phone_read` · face_surprised | `thumbs` / `rally` | `stop` | `count` → `tab_present` (MVP + Phase 2) |
| S11 Junior gây lỗi | `facepalm` → `think` | `scold` | `goahead` | `coach` → `checklist` |
| S12 Cơ hội dự án lớn | `phone_call` · face_surprised | `thumbs` → `jump` | `headshake` → `stop` | `count` → `tab_present` |

### Level 4 – Thu hoạch

| Cảnh | Mở màn | A | B | C |
|---|---|---|---|---|
| Intro | `nod` → `talk` | | | |
| S13 Hệ thống vận hành | `meet_note` | `talk` → `stress` | `wb_write` → `wb_explain` | `delegate` → `clap` |
| S14 Phát triển team | `desk_type` | `tab_read` → `talk` | `oneone_talk` → `oneone_show` | `delegate` → `coach` |
| S15 Mở rộng hợp tác | `shake` → `meet_table_listen` | `thumbs` | `meet_table_talk` | `count` → `meet_table_present` |
| S16 Final Review | `formal_walk` → `adjust` → `present` | `present` → `bad` | `bowthank` → `reflect` | `present` → `answer` |
| S16 phản biện | `answer` / `reflect`; chờ kết quả `wait` | | | |

### Kết thúc campaign

| Kết quả | Chuỗi sprite |
|---|---|
| Pass xuất sắc | `badge` → `celebrate` (kèm `jump`) |
| Pass | `badge` → `relieved` |
| Gia hạn thử việc | `sigh` · face_worried |
| Không đạt | `fail` → `leave` → `leave_back` (tuỳ chọn `resolve` cho kết mở) |

### Cảnh chuyển ngày và biến thể theo cờ

| Điều kiện | Sprite |
|---|---|
| Chuyển ngày bình thường | `walk` → `stretch` |
| `pm_overloaded` | Chuyển ngày bằng `night_sleep` → `night_wake`; từ Level 2 thay `idle` / `talk` / `walk` bằng `tired_idle` / `tired_talk` / `tired_walk` |
| `team_ot_14_days` | Chuyển ngày bằng `slump` → `lie`; Level 3 dùng bộ `tired_*` |
| Sau incident đã khắc phục | `slump` → `getup` |
| Popup chỉ số tăng / giảm | `good` / `bad` kèm `emo_check` / `emo_cross` |
| HUD 7 chỉ số | `stat_budget`, `stat_progress`, `stat_quality`, `stat_morale`, `stat_client`, `stat_management`, `stat_risk` |
| Avatar mặc định hộp thoại | `pm/portrait` (ô 1 sheet A); đổi theo cảm xúc dùng `pm/face_*` (sheet D) |
