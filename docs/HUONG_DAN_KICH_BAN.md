# Hướng dẫn dùng nguyên sheet theo kịch bản RoleCraft PM60

Gói này giữ nguyên 8 sprite sheet PNG. Không có ảnh sprite đã cắt. Tất cả sheet dùng nền trong suốt (RGBA).

## 1. Quy ước đọc atlas

- Đếm hàng `r` và cột `c` từ góc trên bên trái, bắt đầu bằng 1.
- Ví dụ `A r2 c1–8` là toàn bộ 8 khung của hàng 2 trong sheet A.
- `→`: phát nối tiếp.
- `+`: dùng cùng một nhịp/cảnh hoặc chồng thêm icon.
- `/`: chọn một trong hai biến thể theo nhịp thoại.
- `loop`: lặp trong khi chờ người chơi; `once`: phát một lần rồi giữ khung cuối.
- Tên như `face_worried` là chân dung hộp thoại ở sheet D; tên như `emo_coffee` là icon nổi ở sheet F.

| ID | File | Lưới | Nội dung |
|---|---|---:|---|
| A | `PM_A_master.png` | 8×7 | Cơ bản: idle, đi, chạy, nhảy, ngồi, nằm, phản ứng |
| B | `PM_B_hands_gestures.png` | 8×7 | Tablet, tài liệu, điện thoại, cử chỉ, cảm xúc thân người |
| C | `PM_C_work_scenes.png` | 8×7 | Bàn làm việc, OT, 1-1, họp, bảng trắng, incident |
| D | `PM_D_portraits.png` | 4×5 | 20 chân dung hộp thoại |
| E | `PM_E_review_endings_tired.png` | 8×7 | Final Review, ending, biến thể kiệt sức |
| P | `PM_P_props.png` | 8×4 | Đồ cầm tay và đồ để bàn |
| O | `PM_O_furniture.png` | 4×3 | Nội thất và đồ trong cảnh |
| F | `PM_F_icons.png` | 6×4 | Emote và icon chỉ số |

Nếu engine đọc trực tiếp từ atlas, không cần xuất các PNG con. Với sheet có kích thước `W×H`, lưới `C×R`, ô `(col,row)` dùng:

```js
const x0 = Math.floor((col - 1) * W / C);
const x1 = Math.floor(col * W / C);
const y0 = Math.floor((row - 1) * H / R);
const y1 = Math.floor(row * H / R);
ctx.drawImage(sheet, x0, y0, x1 - x0, y1 - y0, dx, dy, dw, dh);
```

Cách tính theo hai biên như trên giữ đủ phần dư khi kích thước ảnh không chia hết cho số hàng/cột. Không chia trước thành các file riêng.

## 2. Kịch bản Level 1 – Khởi động

| Tình huống | Mở cảnh | Nhánh A | Nhánh B | Nhánh C |
|---|---|---|---|---|
| Intro nhận việc | `walk` — A r2 c1–8, 10 fps loop → `greet` — A r1 c7–8, 6 fps once → `shake` — B r3 c7–8, 8 fps once. Khi thấy giấy tờ bàn giao lộn xộn, phát `crouch` — A r5 c1–3, 8 fps once. | — | — | — |
| S01 Tiếp quản | `tab_read` — B r1 c2–3, 8 fps once; hộp thoại `face_worried` — D r1 c4. | `wb_write` — C r5 c1–3, 8 fps loop → `wb_point` — C r5 c4–5, 8 fps once. Đạo cụ: bảng trắng O r2 c2, bút P r3 c4. | `goahead` — B r5 c6–7, 8 fps once. | `night_type` — C r2 c1–2, 6 fps loop → `night_rub` — C r2 c3; thêm `emo_coffee` — F r2 c4. Bối cảnh bàn: O r1 c1 + O r1 c4; đèn/cốc: P r4 c4 + P r4 c3. |
| S02 Senior tự quyết | `phone_read` — B r3 c3–4, 8 fps once → `crossarms` — B r6 c3 (nghi ngờ "thay đổi nhỏ"); `face_worried` — D r1 c4. | `stop` — B r5 c1–2, 8 fps once; `face_serious` — D r1 c3. | `goahead` — B r5 c6–7, 8 fps once. | `talk` — B r4 c1–2, 6 fps loop; `face_confident` — D r1 c2. Đứng nói chuyện với Huy (NPC không có sprite ngồi). |
| S03 Thay đổi phạm vi | `idle` — A r1 c2–4, 6 fps loop (đứng nghe khách) → `sigh` — A r7 c7–8. Đứng họp như khách và team: NPC không có sprite ngồi. | `thumbs` — B r5 c3; `face_happy` — D r2 c2. | `doc_raise` — B r2 c5–6, 8 fps once / `stop` — B r5 c1–2. | `count` — B r4 c3–5, 8 fps once (ba phương án). |
| S04 Quỹ công cụ | `think` — B r7 c1–2 + `tab_read` — B r1 c2–3. | `tab_present` — B r1 c4–6, 8 fps once. | `talk` — B r4 c1–2, 6 fps loop + `headshake` — B r4 c8. | `talk` — B r4 c1–2, 6 fps loop ("một licence": không dùng `count` giơ nhiều ngón). |
| Tổng kết Level 1 (tốt) | `good` — A r7 c1–3, 8 fps once. | — | — | — |
| Tổng kết Level 1 (trung bình) | `nod` — B r4 c6–7, 6 fps loop. | — | — | — |
| Tổng kết Level 1 (rủi ro) | `bad` — A r7 c4–6, 8 fps once. | — | — | — |

## 3. Kịch bản Level 2 – Hòa nhập

| Tình huống | Mở cảnh | Nhánh A | Nhánh B | Nhánh C |
|---|---|---|---|---|
| Intro | `nod` — B r4 c6–7, 6 fps loop → `talk` — B r4 c1–2, 6 fps loop. | — | — | — |
| S05 Hai dự án | `idle` — A r1 c2–4, 6 fps loop (đứng họp) → `sigh` — A r7 c7–8; thêm `emo_exclaim` — F r1 c1. | `tab_present` — B r1 c4–6 (thuê Freelancer). | `rally` — B r5 c4–5, 8 fps once (OT). | `count` — B r4 c3–5 → `tab_present` — B r1 c4–6. |
| S06 Deadline/chất lượng | `tab_read` — B r1 c2–3, 8 fps once; `face_worried` — D r1 c4 nếu có thoại. | `goahead` — B r5 c6–7. | `bow` — B r6 c1–2 → `tab_present` — B r1 c4–6. | `tab_present` — B r1 c4–6 + `count` — B r4 c3–5. |
| S07 Giữ Huy | `idle` — A r1 c2–4, 6 fps loop (đứng nghe Huy) → `sigh` — A r7 c7–8. Đứng đối diện Huy: NPC không có sprite ngồi. | `tab_present` — B r1 c4–6; màn hình hiển thị ngân sách retention. | `talk` — B r4 c1–2, 6 fps loop → `sigh` — A r7 c7–8 (Anh Minh bước vào). | `tab_present` — B r1 c4–6 (lộ trình Technical Lead); kết quả xem hai dòng C1/C2 bên dưới. |
| S07 C1 thương lượng thành công | `jump` — A r4 c1–6. | — | — | — |
| S07 C2 thương lượng thất bại | `sigh` — A r7 c7–8. | — | — | — |
| S07 kết cảnh | `desk_type` — C r1 c1–2, 8 fps loop. Dùng ghế O r1 c1 và bàn/monitor O r1 c4. | — | — | — |
| S08 Complain | `idle` — A r1 c2–4, 6 fps loop (đứng nghe khách) → `phone_read` — B r3 c3–4 khi anh Minh nhắn riêng. | `doc_raise` — B r2 c5–6 / `crossarms` — B r6 c3. | `bow` — B r6 c1–2; giữ thêm khung c2 cho cúi sâu. | `count` — B r4 c3–5 → `good` — A r7 c1–3. |
| S08 Complain (biến thể 1) | `idle` — A r1 c2–4, 6 fps loop → `phone_read` — B r3 c3–4 khi anh Minh nhắn riêng. | — | — | — |
| Tổng kết Level 2 (tốt) | `good` — A r7 c1–3, 8 fps once. | — | — | — |
| Tổng kết Level 2 (trung bình) | `nod` — B r4 c6–7, 6 fps loop. | — | — | — |
| Tổng kết Level 2 (rủi ro) | `bad` — A r7 c4–6, 8 fps once. | — | — | — |

## 4. Kịch bản Level 3 – Bứt phá

Mapping Level 3 được suy từ flow hiện có vì phần thoại chi tiết chưa có trong tài liệu gốc.

| Tình huống | Mở cảnh | Nhánh A | Nhánh B | Nhánh C |
|---|---|---|---|---|
| S09 Production Incident | `alert` — C r6 c1–2, 8 fps once → `startle` — A r4 c7–8, 10 fps once → `run` — A r3 c1–8, 14 fps loop. Thêm monitor cảnh báo O r3 c3. | `command` — C r6 c3–5, 6 fps loop; dừng cả team. | `delegate` — C r7 c5–6, 8 fps once; giao một dev. | `rollback` — C r7 c1–4, 12 fps loop → `relief` — C r6 c8. Laptop: P r3 c6. |
| S09 sau mọi nhánh | `phone_call` — B r3 c1–2, 8 fps once; `face_apologetic` — D r2 c3 để báo khách. | — | — | — |
| S10 Sales hứa 10 ngày | `phone_read` — B r3 c3–4; `face_surprised` — D r2 c1. | `thumbs` — B r5 c3 / `rally` — B r5 c4–5. | `stop` — B r5 c1–2. | `count` — B r4 c3–5 → `tab_present` — B r1 c4–6; màn hình trình bày MVP + Phase 2. |
| S11 Junior gây lỗi | `facepalm` — B r6 c6 → `think` — B r7 c1–2. | `scold` — B r6 c4–5. | `goahead` — B r5 c6–7. | `coach` — B r7 c8 → `checklist` — C r7 c7–8. Nếu cờ quy trình đã chuẩn hóa, thêm poster O r3 c2. |
| S12 Cơ hội dự án lớn | `phone_call` — B r3 c1–2; `face_surprised` — D r2 c1. | `thumbs` — B r5 c3 → `jump` — A r4 c1–6. | `headshake` — B r4 c8 → `sigh` — A r7 c7–8 (cơ hội bị bỏ lỡ). | `count` — B r4 c3–5 → `tab_present` — B r1 c4–6. Nếu nhận dự án thiếu nguồn lực, dùng kanban quá tải O r3 c1. |

## 5. Kịch bản Level 4 – Thu hoạch

| Tình huống | Mở cảnh | Nhánh A | Nhánh B | Nhánh C |
|---|---|---|---|---|
| Intro | `nod` — B r4 c6–7 → `talk` — B r4 c1–2. | — | — | — |
| S13 Hệ thống vận hành | `meet_note` — C r1 c7–8. | `talk` — B r4 c1–2 → `stress` — B r7 c3–4. | `wb_write` — C r5 c1–3 → `wb_explain` — C r5 c6–7. Bảng trắng O r2 c2. | `delegate` — C r7 c5–6 → `clap` — B r5 c8. |
| S14 Phát triển team | `desk_type` — C r1 c1–2. | `tab_read` — B r1 c2–3 → `talk` — B r4 c1–2. | `tab_present` — B r1 c4–6 (kế hoạch phát triển 90 ngày). | `delegate` — C r7 c5–6 → `coach` — B r7 c8. |
| S15 Mở rộng hợp tác | `idle` — A r1 c2–4, 6 fps loop (đứng họp với khách) → `startle` — A r4 c7–8, 10 fps once khi team cảnh báo → `sigh` — A r7 c7–8. | `thumbs` — B r5 c3. | `talk` — B r4 c1–2, 6 fps loop. | `count` — B r4 c3–5 (chia hai phase) → `nod` — B r4 c6–7. |
| S16 Final Review | `formal_walk` — E r1 c1–8, 10 fps loop → `adjust` — E r2 c7–8, 8 fps once → `present` — E r2 c1–4, 8 fps once. Dùng màn chiếu O r2 c3 và clicker P r3 c5. | `present` — E r2 c1–4 → `bad` — A r7 c4–6. | `bowthank` — E r3 c5–6 → `reflect` — E r3 c3–4. | `present` — E r2 c1–4 → `answer` — E r3 c1–2. |
| S16 phản biện | `answer` — E r3 c1–2 / `reflect` — E r3 c3–4; sau đó `wait` — E r3 c7–8, 8 fps once. | — | — | — |

## 6. Kết thúc campaign

| Kết quả | Trình tự dùng sheet |
|---|---|
| Pass xuất sắc | `badge` — E r4 c1–3, 8 fps once → `celebrate` — E r4 c4–6, 8 fps once; có thể nối thêm `jump` — A r4 c1–6. Chân dung sau khi đậu: D r5 c4 (`face_pm_proud`). |
| Pass | `badge` — E r4 c1–3 → `relieved` — E r4 c7–8. Chân dung: D r5 c3 (`face_pm_happy`). |
| Gia hạn thử việc | `sigh` — A r7 c7–8; hộp thoại `face_worried` — D r1 c4. |
| Không đạt | `fail` — E r5 c1–3 → `leave` — E r5 c4–6, 8 fps loop → `leave_back` — E r5 c7. Nếu dùng kết mở, nối `resolve` — E r5 c8. |

## 7. Cảnh chuyển ngày và biến thể theo cờ

| Điều kiện | Cách dùng |
|---|---|
| Chuyển ngày bình thường | `walk` — A r2 c1–8 → `stretch` — B r7 c6–7. |
| `pm_overloaded` | Chuyển ngày bằng `night_sleep` — C r2 c5–6 → `night_wake` — C r2 c7–8. Từ Level 2 thay `idle` / `talk` / `walk` bằng `tired_idle` — E r6 c1–4 / `tired_talk` — E r6 c5–8 / `tired_walk` — E r7 c1–8. |
| `team_ot_14_days` | Chuyển ngày bằng `slump` — A r6 c1–2 → `lie` — A r6 c3–5. Từ Level 3 dùng bộ `tired_*` ở sheet E. |
| Incident đã khắc phục | `slump` — A r6 c1–2 → `getup` — A r6 c6–8. |
| Chỉ số tăng | `good` — A r7 c1–3 + `emo_check` — F r2 c5. |
| Chỉ số giảm | `bad` — A r7 c4–6 + `emo_cross` — F r2 c6. |
| `large_project_without_resources` | Dùng `kanban_overloaded` — O r3 c1. |
| `deployment_checklist_added` hoặc `process_standardized` | Dùng `checklist_poster` — O r3 c2. |
| L3-S09 Production Incident | Dùng `monitor_alert` — O r3 c3. |

## 8. Chân dung hộp thoại

| Hàng | Cột 1 | Cột 2 | Cột 3 | Cột 4 |
|---:|---|---|---|---|
| D r1 | `face_neutral` | `face_confident` | `face_serious` | `face_worried` |
| D r2 | `face_surprised` | `face_happy` | `face_apologetic` | `face_stressed` |
| D r3 | `face_stern` | `face_sad` | `face_proud` | `face_thinking` |
| D r4 | `face_relieved` | `face_determined` | `face_exhausted` | `face_embarrassed` |
| D r5 | `face_formal_neutral` | `face_formal_confident` | `face_pm_happy` | `face_pm_proud` |

Avatar mặc định là `portrait` — A r1 c1.

## 9. Icon HUD và emote thường dùng

| Tên | Vị trí |
|---|---|
| `emo_exclaim`, `emo_question`, `emo_sweat`, `emo_idea`, `emo_anger`, `emo_zzz` | F r1 c1–6 |
| `emo_sparkle`, `emo_heart`, `emo_storm`, `emo_coffee`, `emo_check`, `emo_cross` | F r2 c1–6 |
| `stat_budget`, `stat_progress`, `stat_quality`, `stat_morale`, `stat_client`, `stat_management` | F r3 c1–6 |
| `stat_risk`, `ico_deadline`, `ico_up`, `ico_down`, `ico_calendar`, `ico_checklist` | F r4 c1–6 |

## 10. Đạo cụ và nội thất

- Sheet P hàng 1: tablet, phone, laptop đóng.
- Sheet P hàng 2: folder, hợp đồng, giấy, notebook, bút, checklist.
- Sheet P hàng 3: task card, cốc, marker, clicker, laptop mở, thùng đồ.
- Sheet P hàng 4: badge cam/xanh, cặp cốc, đèn bàn, cây nhỏ, sticky note, notebook đóng.
- Sheet O hàng 1: ghế văn phòng, ghế họp, sofa, bàn + monitor.
- Sheet O hàng 2: bàn họp, bảng trắng, màn chiếu, kanban bình thường.
- Sheet O hàng 3: kanban quá tải, poster checklist, monitor cảnh báo, cây cao.

File `docs/CHI_MUC_ATLAS.csv` liệt kê toàn bộ 312 ô với tên sheet, hàng, cột, animation, FPS và chế độ lặp. File `tools/prompts/PM/pm_sprite_manifest.json` giữ cấu trúc máy đọc nếu cần tích hợp trực tiếp.
