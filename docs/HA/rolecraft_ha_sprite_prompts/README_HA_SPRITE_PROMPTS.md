# Bộ prompt sprite CHỊ HÀ (HR – đại diện nhân sự trong hội đồng Final Review)

Sinh bởi `build.py` – sửa ở `build.py` rồi chạy lại, không sửa tay file này.

Cùng cơ chế v3 với bộ PM (`docs/PM`), MINH (`docs/MINH`), LAN (`docs/LAN`): nhân vật vẽ tay không + chấm neo (magenta = cầm chính, green = tay kia, cyan = điểm ngồi); đồ vật, nội thất, icon **dùng lại sheet P, O, F của PM**.

## Thứ tự tạo ảnh

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8x7) | `prompts/HA_A_master.txt` | ảnh thật + `PM_A_master.png` (chỉ lấy style) | Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc |
| B (8x7) | `prompts/HA_B_review_endings.txt` | ảnh thật + `HA_A_master.png` | Cầm nắm, Final Review (hội đồng + phản biện), 4 kết thúc |
| D (4x5) | `prompts/HA_D_portraits.txt` | ảnh thật + `HA_A_master.png` | 20 chân dung cảm xúc cho hộp thoại |

Tạo sheet A trước và duyệt, sau đó B, D đính kèm A làm chuẩn. Không có sheet C: chị Hà chỉ xuất hiện ở S16 và màn kết, nên cảnh bàn hội đồng và 4 kết thúc gộp vào sheet B.

## Tạo hình nhân vật

- Không có trong docs gốc: `THOAI_MAU.json` thêm chị Hà thay cho “Hội đồng đánh giá” (`REVIEW_PANEL`, docs/KICH_BAN_ROLECRAFT_PM60.md – L4 S16 và mục 9) – lời “Đại diện hội đồng” trong docs do chị Hà nói.
- Xưng “chị” với PM → lớn tuổi hơn PM; chuyên nghiệp, trung lập, hỏi thẳng nhưng không gay gắt.
- Đạo cụ đặc trưng: folder navy đựng phiếu đánh giá (`prop/folder_closed`); phiếu đánh giá dùng `prop/checklist_sheet`.
- Ngồi cạnh anh Minh ở bàn hội đồng (anh Minh ở bên phải chị trong khung hình, ngoài ô).

## Cảnh → animation gợi ý (bám thoại chị Hà trong THOAI_MAU.json)

| Khoá thoại | Nhịp | Thoại (tóm tắt) | Animation / chân dung |
|---|---|---|---|
| `L4 | S16 Final Review | Mở cảnh` | Dẫn truyện | Anh Minh và Chị Hà ngồi ở bàn đánh giá. | `ha/panel_listen`, `ha/face_neutral` |
| `L4 | S16 Final Review | Mở cảnh` | Chị Hà | Chị bên nhân sự, sẽ cùng anh Minh đánh giá kết quả thử việc của em. | `ha/panel_intro`, `ha/face_polite_smile` |
| `L4 | S16 Final Review | Mở cảnh` | PM trình bày | (Hội đồng chờ PM trình bày.) | `ha/panel_note`, `ha/face_neutral` |
| `L4 | S16 Final Review | Nhánh A` | Chị Hà | Báo cáo chưa nói gì về sự cố production và tải của team. | `ha/panel_frown_01`, `ha/face_skeptical` |
| `L4 | S16 Final Review | Nhánh B` | (nghe) | Minh bạch là tốt, nhưng cần kế hoạch hành động (Anh Minh). | `ha/panel_listen`, `ha/face_concerned` |
| `L4 | S16 Final Review | Nhánh C` | (nghe) | Đây là cách một PM chịu trách nhiệm (Anh Minh). | `ha/panel_nod_01`, `ha/face_pleased` |
| `L4 | S16 phản biện | Mở cảnh` | Câu hỏi 1 | Quyết định nào trong 60 ngày tạo ra ảnh hưởng lớn nhất, và vì sao? | `ha/panel_ask`, `ha/face_questioning` |
| `L4 | S16 phản biện | Mở cảnh` | Câu hỏi 2 | Nếu được làm lại một quyết định, em sẽ thay đổi điều gì? | `ha/panel_ask_03`, `ha/face_probing` |
| `L4 | S16 phản biện | Mở cảnh` | Câu hỏi 3 | Team hiện tại có vận hành được mà không cần em không? | `ha/panel_ask_02`, `ha/face_skeptical` |
| `L4 | S16 phản biện | Mở cảnh` | Câu hỏi 4 | Ba ưu tiên của em trong 90 ngày tới là gì? | `ha/panel_ask_04`, `ha/face_questioning` |
| `L4 | S16 phản biện | Mở cảnh` | Dẫn truyện | Chị Hà và Anh Minh trao đổi với nhau... | `ha/panel_confer`, `ha/panel_score_01`, `ha/panel_close_01` |
| `END | Pass xuất sắc | Trình tự dùng sheet` | Chị Hà | Gửi hợp đồng chính thức và lộ trình phát triển quản lý. | `ha/pass_contract`, `ha/pass_roadmap_01`, `ha/pass_applaud`, `ha/face_congrats` |
| `END | Pass | Trình tự dùng sheet` | Chị Hà | Phòng nhân sự sẽ gửi em hợp đồng chính thức trong tuần này. | `ha/pass_smile_01`, `ha/pass_contract`, `ha/pass_shake`, `ha/face_warm` |
| `END | Gia hạn thử việc | Trình tự dùng sheet` | Chị Hà | Chị sẽ gửi em mục tiêu và tiêu chí đánh giá cho giai đoạn gia hạn. | `ha/extend_talk_01`, `ha/extend_goals_01`, `ha/extend_count_01`, `ha/extend_encourage_01`, `ha/face_encouraging` |
| `END | Không đạt | Trình tự dùng sheet` | Chị Hà | Chị sẽ hỗ trợ em các thủ tục kết thúc thử việc. | `ha/fail_talk_01`, `ha/fail_doc_01`, `ha/fail_pat_01`, `ha/fail_bow_01`, `ha/face_sympathetic` |
| `END | Không đạt | Trình tự dùng sheet` | Dẫn truyện | Ôm thùng đồ ra cửa... | `ha/door_01`, `ha/wave_01`, `ha/face_regretful` |

Tổng: 132 ô, 67 animation.
