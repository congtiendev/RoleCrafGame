Tên trong bảng là **nhóm animation** (bỏ hậu tố `_01`, `_02`…), đúng với khoá `mai/<nhóm>` trong manifest. `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Cột "Kịch bản" trích câu hoặc diễn biến trong docs, mỗi dòng là một lần Chị Mai xuất hiện.

### Level 1 – Khởi động (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 4)

| Cảnh | Kịch bản | Sprite Chị Mai |
|---|---|---|
| S03 Thay đổi phạm vi – phòng họp kickoff | vào phòng họp | `walk` → `greet` → `sit` |
| | "Bên chị muốn bổ sung thêm hai chức năng này vào bản demo." | `meet_table_request` · face_eager |
| | "Các chức năng này không quá phức tạp, chắc chỉ mất thêm vài ngày thôi đúng không?" | `meet_table_assume` · face_assume |
| | (Huy, Lan phản hồi) | `meet_table_listen` · face_neutral |
| S03 · A | "Tốt, vậy bên chị chờ bản demo có đủ hai chức năng này." | `meet_table_pleased` · face_pleased |
| S03 · B | "Bên chị hiểu vấn đề hợp đồng, nhưng cách xử lý này hơi cứng nhắc." | `meet_table_displeased` · face_annoyed |
| S03 · C | "Được, chị cần biết rõ tác động trước khi quyết định." | `meet_table_consider` · face_thinking |

### Level 2 – Hòa nhập (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 5)

| Cảnh | Kịch bản | Sprite Chị Mai |
|---|---|---|
| S06 Deadline/chất lượng – phòng họp release | "Bên chị đã lên kế hoạch đào tạo người dùng theo ngày release…" | `meet_table_schedule` · face_concerned |
| | "Chị cần một phương án chính thức ngay hôm nay." | `meet_table_demand` → `meet_table_impatient` · face_impatient |
| S06 · A | "Tốt. Bên chị sẽ giữ lịch đào tạo như đã thông báo." | `meet_table_ok` · face_satisfied |
| S06 · B | "Việc thay đổi lịch sẽ ảnh hưởng phía chị. Chị cần bảo đảm ba ngày này thực sự giúp giảm rủi ro…" | `meet_table_doubt` · face_skeptical |
| S06 · C | "Nếu các chức năng phục vụ đào tạo vẫn hoạt động… chị có thể chấp nhận." | `meet_table_accept` · face_conditional |
| S08 Complain – họp với khách hàng | "Chức năng này đang hoạt động khác với cách bên chị đã yêu cầu…" | `complain` · face_frown |
| | (biến thể 2) "Kết quả hiện tại không giống cách bên chị hiểu khi trao đổi…" | `complain` · face_concerned |
| S08 Complain – diễn biến chung | "Chị không muốn nghe mỗi bên nói mình đúng…" | `complain_demand` · face_firm |
| S08 · A | "…chị không thể chấp nhận việc đẩy toàn bộ trách nhiệm sang khách hàng." | `defend` · face_annoyed |
| S08 · B | "Chị ghi nhận tinh thần hợp tác. Chị cần mốc hoàn thành cụ thể." | `cooperate` · face_cooperative |
| S08 · C | "Chị đồng ý nếu kết quả cuối cùng giải quyết được quy trình vận hành…" | `resolve` · face_conditional |
| S08 kết cảnh | "Chị sẽ xác nhận lại trong hôm nay. Điều chị cần là… hai bên cùng tìm giải pháp…" | `confirm` → `solution` · face_cooperative |

### Level 3 – Bứt phá (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 6: `CLIENT` tham gia S09, S10)

Docs không có thoại Level 3, chỉ có người tham gia, bối cảnh và lựa chọn.

| Cảnh | Kịch bản (spec) | Sprite Chị Mai |
|---|---|---|
| S09 Production Incident | "lỗi lúc 14:00, ảnh hưởng tới hoạt động của khách hàng" | `incident_call` → `incident_angry` · face_worried |
| S09 · A / C | client_trust +15 / +10 (sự cố được ưu tiên / rollback) | `incident_calm` · face_relieved |
| S09 · B | client_trust −5 (phục hồi kéo dài) | `phone_urgent` · face_annoyed |
| S09 sau mọi nhánh | PM gọi báo khách | `phone_call` → `phone_calm` · face_neutral |
| S10 Sales hứa quá khả năng | Sales đã hứa tính năng AI trong 10 ngày | `promise_expect` · face_eager |
| S10 · B | PM nói Sales hứa sai (client_trust −10) | `promise_shock` · face_shocked |
| S10 · C | MVP 10 ngày + phase 2 có estimate (client_trust +10) | `promise_ok` · face_satisfied |

### Level 4 – Thu hoạch (docs/KICH_BAN_ROLECRAFT_PM60.md – mục 7)

| Cảnh | Kịch bản | Sprite Chị Mai |
|---|---|---|
| S15 Mở rộng hợp tác – phòng họp với khách hàng | "Bên chị đánh giá tích cực kết quả hiện tại và muốn mở rộng thêm module quản lý báo cáo…" | `propose` · face_eager |
| | "Nếu thống nhất trong tuần này, bên chị có thể trình ngân sách ngay trong tháng." | `budget_submit` · face_firm |
| S15 · A | (Nam báo giá ngay, Huy cảnh báo) | `meet_table_listen` · face_pleased |
| S15 · B | "Chị đồng ý về nguyên tắc, nhưng cần một mốc cụ thể để còn trình ngân sách." | `principle_ok` · face_conditional |
| S15 · C | "Cách chia phase này giống phương án MVP trước và bên chị thấy hiệu quả…" (khi có cờ `mvp_plan_agreed`) | `phase_ok` · face_satisfied |
| | "Chị cần chắc chắn Phase 1 vẫn tạo ra giá trị sử dụng thực tế, không chỉ là bản demo." | `value_check` · face_firm |
| Kết cảnh | chốt hợp tác | `satisfied` → `shake_seated` · face_cooperative |
