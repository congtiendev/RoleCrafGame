# RoleCraft PM60 – Bộ prompt sprite Huy v4 (Senior Developer)

Sinh bởi `rolecraft_huy_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.

Làm lại cho đủ như bộ PM: thêm chạy, nhảy, giật mình, ngồi/đứng dậy, sofa sau OT, làm đêm, bảng trắng, sự cố + rollback, Technical Lead, chuỗi nghỉ việc ôm thùng, phản ứng kết thúc, bộ kiệt sức (`team_ot_14_days`). **6 sheet / 252 ô / 129 animation.**

## Thay đổi so với bản cũ

- **Huy quay PHẢI** như PM, nội thất ở bên phải: dùng thẳng ghế, bàn, bảng trắng, sofa của bộ PM. Khi Huy đứng đối diện PM, game lật cả cụm: `pc.draw(ctx, key, x, y, s, { flip: true })`. (Bản cũ đặt bàn/bảng bên trái, `pm_compose.js` không hỗ trợ → đồ bị ghép sai phía.)
- Tạo hình theo sheet Huy **đã duyệt** (polo navy viền đỏ, logo tròn trắng, quần đen) – không dùng ảnh người thật, bỏ hoodie/thẻ đeo của `build.py` cũ.
- Nền **trong suốt** (PNG alpha). Công cụ vẫn trả nền trắng thì không sinh lại: `python3 tools/make_transparent.py sheets/*.png`.
- Thêm sheet **E** (sự cố, Technical Lead, nghỉ việc, kết thúc, kiệt sức) và **P** (laptop navy của Huy, lon nước, runbook, thùng đồ). Sheet **D giữ nguyên**, không sinh lại.
- Prompt ngắn, mỗi ý một lần; quy tắc tiết kiệm token cho agent trong `SOL_ONE_SHOT_PROMPT.txt`.

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8×7) | `prompts/HUY_A_master.txt` | `HUY_B` cũ + `HUY_D` + `PM_A_master.png` | Master: chân dung, đứng, đi, chạy, nhảy, ngồi ghế, sofa OT, cảm xúc |
| B (8×7) | `prompts/HUY_B_hands_gestures.txt` | `HUY_A` mới + `HUY_D` | Laptop, nói/nghe, giải thích – phòng thủ – đồng ý, estimate, điện thoại (offer), thái độ, suy nghĩ |
| C (8×7) | `prompts/HUY_C_work_scenes.txt` | `HUY_A` mới + `HUY_D` | Bàn code ngày/đêm, bàn họp, 1-1, bảng trắng, mentoring/runbook, bàn giao |
| E (8×7) | `prompts/HUY_E_crisis_growth_endings.txt` | `HUY_A` mới + `HUY_D` | Sự cố + rollback, Technical Lead, nghỉ việc ôm thùng, kết thúc, biến thể kiệt sức |
| D (4×5) | — (giữ ảnh đang có) | — | 20 chân dung hộp thoại (ĐÃ CÓ – giữ) |
| P (4×2) | `prompts/HUY_P_props.txt` | `HUY_A` mới | Đồ vật riêng của Huy (laptop navy, lon nước, runbook, thùng đồ) |

**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm `HUY_B_old.png` (đổi tên từ `HUY_B_hands_gestures.png` cũ trong `HUY_Sprite_Assets_Clean.zip`), `HUY_D_portraits.png`, `sheets/PM_A_master.png` và zip thư mục `rolecraft_huy_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Prompt đã giới hạn: mỗi sheet 1 lần sinh, chỉ sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, khác người, có chữ, nền vẽ ô caro giả; nền trắng thì chỉ chạy `tools/make_transparent.py`, không sinh lại); lỗi nhỏ ghi lại chứ không sinh lại; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.

**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm B, C, E, P.

## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)

> ✅ Đúng lưới 8×7 (P: 4×2), mỗi ô một hình toàn thân, không dính ô bên, **nền trong suốt** (không trắng, không ô caro vẽ giả), cùng cỡ trong cả sheet.
>
> ✅ Cùng người với sheet D; polo navy viền đỏ; ô 1 sheet A là chân dung khung xanh nhạt.
>
> ✅ Không vẽ đồ vật/nội thất (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.
>
> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.

## 3. Dùng tool

```bash
cd docs/HUY/rolecraft_huy_sprite_prompts
python3 tools/extract_anchors.py --manifest huy_sprite_manifest.json --sheets sheets --out build
```

Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*` dùng chung) gộp với `anchors.json` của bộ này (`huy/*`, `prop/huy_*`, `prop/energy_can`, `prop/runbook_binder`), rồi `PMCompose.create(anchors, manifest, base)`. Nhập vào trang xem nhân vật: thay các PNG trong `HUY_Sprite_Assets_Clean.zip` (giữ tên file, thêm `HUY_E_crisis_growth_endings.png`, `HUY_P_props.png`, manifest mới) rồi chạy `python3 import_characters.py`.

## 4. Gắn kết ô → đồ vật / nội thất

Quy tắc `RULES` trong `build.py`, ghi vào `cells[].bind`. Id không có tiền tố `huy_` là của bộ PM.

| Nhóm tư thế | Đồ vật | Nội thất |
|---|---|---|
| idle, walk, lap_carry | huy_laptop_closed (kẹp nách, sau tay) | |
| run, startle_01, tired_idle, tired_walk, handover_lap | huy_laptop_closed (trước ngực / cầm tay) | |
| lap_hold, lap_type, lap_close, headset_02, rollback_type/enter | huy_laptop_open_34 (trên cẳng tay) | |
| lap_show | huy_laptop_screen_34 (màn hình quay phải, vẽ UI) | |
| sit_*, desk_turn/wave | | office_chair |
| slump, lie, getup | huy_laptop_closed ở lie_01 | sofa |
| desk_* / night_* | energy_can (night_drink), lamp_on trên bàn (night) | office_chair + desk_monitor |
| meet_table_* | laptop trên mặt bàn (lap/show) | meeting_chair + meeting_table |
| oneone_* | | meeting_chair |
| wb_* | marker | whiteboard (bên phải) |
| phone_*, alert_* | phone_back | |
| coffee / pack_01 | mug_steam / mug_plain | |
| runbook_write / runbook_tick | runbook_binder / checklist_sheet (tay trái) + pen | |
| delegate_01, handover_01 | task_card, folder_closed | |
| pack_02, farewell_01, leave, leave_back, farewell_wave | huy_box | |
| incident_monitor_01 | | monitor_alert (bên phải) |

## 5. Mapping kịch bản → sprite

Tên là **nhóm animation** `huy/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `huy/<ô>_01`; `face_*` là chân dung hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng ghi “(… nói)” là phản ứng của Huy khi người khác nói.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| L1 S01 Tiếp quản | Mở cảnh | Huy: “Cứ chạy tiếp thì một tuần nữa demo được.” | `walk` → `lap_carry` → `lap_show` → `talk` · `face_smirk` |
| L1 S01 Tiếp quản | Lan nói | Lan: tài liệu chưa phản ánh hết… | `listen` · `face_neutral` |
| L1 S01 Tiếp quản | A | Huy: “Mất một ngày, nhưng cả team thống nhất được hiện trạng.” | `nod` → `agree_01` · `face_serious` |
| L1 S01 Tiếp quản | B | (Lan nói) | `good_01` · `face_smirk` |
| L1 S01 Tiếp quản | C | Huy: “Có gì cần làm rõ thì báo anh.” | `askme_01` · `face_grin` |
| L1 S02 Senior tự quyết | Mở cảnh | Hệ thống: Huy đổi requirement chưa báo BA/QA · Huy: “Thay đổi nhỏ thôi, không cần review đâu.” | `desk_type` → `desk_turn_01` → `desk_wave_01` · `face_smirk` |
| L1 S02 Senior tự quyết | A | Huy: “Việc gì cũng chờ duyệt thì tiến độ sẽ chậm.” | `sit_annoyed_01` · `face_annoyed` |
| L1 S02 Senior tự quyết | B | Huy: “Vậy anh sẽ chủ động xử lý cho kịp tiến độ.” | `sit_smirk_01` · `face_grin` |
| L1 S02 Senior tự quyết | C | Huy: “Hợp lý. Việc ảnh hưởng requirement anh sẽ đưa ra review.” | `sit_nod_01` · `face_relieved` |
| L1 S03 Thay đổi phạm vi | Mở cảnh | Anh Hiệp muốn thêm hai chức năng | `meet_table_listen` → `meet_table_frown_01` · `face_skeptical` |
| L1 S03 Thay đổi phạm vi | A | Huy: “Team phải điều chỉnh lại kế hoạch ngay.” | `meet_table_frown_01` → `meet_table_talk` · `face_worried` |
| L1 S03 Thay đổi phạm vi | B / C | (Anh Hiệp nói) | B: `meet_table_listen` · C: `meet_table_lap_01` (estimate) · `face_focused` |
| L1 S04 Quỹ công cụ | Mở cảnh + nhánh | (Huy không thoại) | `listen_02` · A: `good_01` · B: `sigh_01` · C: `doubt_01` (licence dùng chung thành điểm nghẽn) |
| L2 S05 Hai dự án | Mở cảnh | Huy: “Anh mà chuyển sang B thì backend của A thiếu người review.” | `meet_table_warn_01` · `face_frown` |
| L2 S05 Hai dự án | A | Huy: “Được, nhưng team vẫn mất thời gian onboarding và review.” | `meet_table_agree_01` → `meet_table_talk` · `face_serious` |
| L2 S05 Hai dự án | B / C | (Nam / Anh Minh nói) | B: `meet_table_frown_01` · `face_tired` (bật cờ team_ot_14_days) · C: `meet_table_agree_01` |
| L2 S06 Deadline/chất lượng | Mở cảnh | Huy: “Muốn release đúng ngày thì phải bỏ vòng regression cuối.” | `meet_table_talk` · `face_serious` |
| L2 S06 Deadline/chất lượng | A | Huy: “Lỗi ở luồng cũ mà lọt lên production thì tốn hơn nhiều.” | `meet_table_warn_01` · `face_worried` |
| L2 S06 Deadline/chất lượng | B | (Anh Hiệp nói) | `meet_table_agree_01` |
| L2 S06 Deadline/chất lượng | C | Huy: “Anh sẽ dùng feature flag để kiểm soát phạm vi mở.” | `meet_table_lap_01` (ngồi) hoặc `flag_01` (đứng) · `face_determined` |
| L2 S07 Giữ Huy | Trước cảnh | Huy đọc offer | `phone_read_02` → `phone_hold_01` → `phone_pocket_01` |
| L2 S07 Giữ Huy | Mở cảnh | Huy: “Anh vừa nhận offer mới…” · “Việc critical dồn hết vào anh…” | `oneone_offer_01` → `oneone_tired_01` · `face_worried` → `face_tired` |
| L2 S07 Giữ Huy | Cờ | team_ot_14_days / senior_restricted / senior_has_guardrails | `oneone_frustrated_01` · `face_exhausted` / `oneone_frustrated_01` · `face_frown` / `oneone_think_01` · `face_thinking` |
| L2 S07 Giữ Huy | A | Huy: “Nếu khối lượng việc cũng được kiểm soát, anh sẽ ở lại.” | `oneone_think_01` → `oneone_agree_01` · `face_relieved` |
| L2 S07 Giữ Huy | B | (PM, Anh Minh nói) → key_developer_left | `oneone_listen_01` · `face_apologetic` → chuỗi nghỉ việc |
| L2 S07 Giữ Huy | C | Huy: “Anh quan tâm, nhưng team không được tiếp tục sống bằng OT.” | `oneone_listen_01` → `oneone_talk` · `face_serious` |
| L2 S07 Giữ Huy | C1 | Huy: “Anh ở lại và thử lộ trình này.” | `oneone_agree_01` → `shake` · `face_grateful` |
| L2 S07 Giữ Huy | C2 | Huy: “Anh trân trọng đề xuất, nhưng anh quyết định nhận offer mới.” | `oneone_decline_01` · `face_apologetic` → chuỗi nghỉ việc |
| L2 S07 Giữ Huy | Chuỗi nghỉ việc | key_developer_left | `handover` → `handover_lap_01` → `pack_01` → `pack_02` → `farewell_bow_01` → `farewell_01` → `leave` → `leave_back_01` → `farewell_wave_01` |
| L2 S08 Complain | Mở cảnh | (Anh Hiệp, Lan nói) | `meet_table_listen` · `face_serious` |
| L2 S08 Complain | Biến thể 1 | Huy: “Team đổi cách xử lý để kịp demo nhưng chưa ghi nhận thành requirement.” | `meet_table_talk` → `sigh_01` · `face_apologetic` |
| L2 S08 Complain | A / B / C | (PM, Anh Hiệp, Lan nói) | A: `meet_table_frown_01` · B: `meet_table_frown_01` · C: `meet_table_agree_01` |
| L3 S09 Incident | Mở cảnh | Hệ thống: 14:00 production lỗi | `alert` → `startle` → `run` → `desk_focus_01` · `face_surprised` |
| L3 S09 Incident | A | Cả team dừng việc | `headset_01` → `desk_type` · `face_focused` |
| L3 S09 Incident | B | Giao một dev (Huy) | `desk_bug_01` → `stress_01` · `face_tired` |
| L3 S09 Incident | C | Rollback trước, lập nhóm incident | `rollback_call_01` → `rollback_type` → `rollback_enter_01` → `rollback_done_01` → `incident_fixed_01` · `face_determined` → `face_relieved` |
| L3 S09 Incident | Sau mọi nhánh | PM báo khách | `incident_monitor_01` → `relief_01` → `stretch_01` |
| L3 S10 Sales hứa 10 ngày | Mở cảnh | (Linh, PM nói) | `doubt_01` · `face_skeptical` |
| L3 S10 Sales hứa 10 ngày | A / B / C | (PM nói) | A: `overload_01` · `face_exhausted` · B: `facepalm_01` · C: `est_count` → `agree_02` · `face_relieved` |
| L3 S11 Junior gây lỗi | Mở cảnh | (Nam, Lan nói) | `sigh_01` · `face_serious` |
| L3 S11 Junior gây lỗi | A / B / C | (PM nói) | A: `crossarms_01` · `face_frown` · B: `sigh_02` · C: `mentor_point_01` → `mentor_explain_01` → `runbook_tick_01` → `mentor_pat_01` · `face_determined` |
| L3 S12 Dự án lớn | Mở cảnh + nhánh | (Anh Minh, PM nói) | `crossarms_01` · `face_worried` · A: `overload_01` · B: `talk_03` · C: `good_01` |
| L4 S13 Hệ thống vận hành | Mở cảnh | Anh Minh: “Nếu Huy nghỉ…” | `scratch_01` · `face_serious` |
| L4 S13 Hệ thống vận hành | A | Huy: “Output tăng trước mắt, nhưng điểm nghẽn cũ sẽ quay lại.” | `warn_01` · `face_skeptical` |
| L4 S13 Hệ thống vận hành | B / C | (Lan / Nam nói) | B: `runbook_write_01` → `runbook_tick_01` · C: `delegate_01` → `mentor_thumb_01` · `face_grin` |
| L4 S14 Phát triển team | Mở cảnh | Huy: “Anh muốn lên Technical Lead, không muốn ôm mọi vấn đề khó nữa.” | `oneone_talk` · `face_determined` |
| L4 S14 Phát triển team | A / B | (Lan / Nam nói) | A: `frown_01` · `face_frown` · B: `nod` |
| L4 S14 Phát triển team | C | Huy: “Anh đồng ý nếu phạm vi quyết định được ghi rõ.” | `agree_01` → `lead_01` · `face_grateful` |
| L4 S15 Mở rộng hợp tác | Cờ large_project_without_resources | Huy: “Team đang chia nguồn lực cho dự án lớn vừa nhận…” | `meet_table_warn_01` · `face_worried` |
| L4 S15 Mở rộng hợp tác | A | Huy: “Mình đang cam kết khi chưa biết hết phạm vi tích hợp.” | `meet_table_warn_01` · `face_worried` |
| L4 S15 Mở rộng hợp tác | B / C | (Anh Hiệp / Linh nói) | `meet_table_agree_01` |
| Kết thúc | Pass xuất sắc / Pass | Huy chúc mừng PM | `cheer` → `congrats_02` / `clap` → `congrats_01` · `face_laugh` |
| Kết thúc | Gia hạn / Không đạt | Huy an ủi PM | `pat_01` / `sad_01` → `pat_01` → `bye_01` · `face_apologetic` |
| Chuyển ngày | Bình thường |  | `walk` → `coffee` |
| Chuyển ngày | team_ot_14_days | Từ L2 S06: thay idle / talk / walk bằng tired_idle / tired_talk / tired_walk | `night_type` → `night_drink_01` → `night_sleep` → `night_wake_01` hoặc `slump` → `lie` → `getup` |
| Chuyển ngày | Incident đã khắc phục |  | `desk_fixed_01` → `desk_stand_01` → `stretch_02` |
| Popup chỉ số | Tăng / giảm |  | `good` / `bad` |

Nếu `key_developer_left` (Huy nghỉ ở L2 S07): Huy không xuất hiện từ L3 (thoại thay bằng thông báo thiếu nhân sự chủ chốt, mục 2 kịch bản), bỏ các dòng L3–L4 và kết thúc ở bảng trên.

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, đi, chạy, nhảy, ngồi ghế, sofa OT, cảm xúc

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `huy/portrait` | [portrait cell, see LAYOUT] |
| 2 | `huy/idle_01` | idle 1/4: relaxed confident stance [markers: magenta = laptop] |
| 3 | `huy/idle_02` | idle 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = laptop] |
| 4 | `huy/idle_03` | idle 3/4: rolling the neck a little [markers: magenta = laptop] |
| 5 | `huy/idle_04` | idle 4/4: slight exhale, calm self-assured face [markers: magenta = laptop] |
| 6 | `huy/idle_back_01` | seen from BEHIND (back view), standing [markers: magenta = laptop] |
| 7 | `huy/greet_01` | free hand raised briefly in a casual hello, half-smile |
| 8 | `huy/greet_02` | two-finger salute from the brow, 'hey' |
| 9 | `huy/walk_01` | contact: right foot forward, heel touching [markers: magenta = laptop] |
| 10 | `huy/walk_02` | down: weight on right leg, knee bent [markers: magenta = laptop] |
| 11 | `huy/walk_03` | passing: left leg passing the right [markers: magenta = laptop] |
| 12 | `huy/walk_04` | up: rising on right toes [markers: magenta = laptop] |
| 13 | `huy/walk_05` | contact: left foot forward, heel touching [markers: magenta = laptop] |
| 14 | `huy/walk_06` | down: weight on left leg, knee bent [markers: magenta = laptop] |
| 15 | `huy/walk_07` | passing: right leg passing the left [markers: magenta = laptop] |
| 16 | `huy/walk_08` | up: rising on left toes [markers: magenta = laptop] |
| 17 | `huy/run_01` | contact right foot [markers: magenta = laptop] |
| 18 | `huy/run_02` | push-off from right foot [markers: magenta = laptop] |
| 19 | `huy/run_03` | airborne, legs apart [markers: magenta = laptop] |
| 20 | `huy/run_04` | landing on left foot [markers: magenta = laptop] |
| 21 | `huy/run_05` | contact left foot [markers: magenta = laptop] |
| 22 | `huy/run_06` | push-off from left foot [markers: magenta = laptop] |
| 23 | `huy/run_07` | airborne, legs apart, mirrored [markers: magenta = laptop] |
| 24 | `huy/run_08` | landing on right foot [markers: magenta = laptop] |
| 25 | `huy/jump_01` | anticipation: crouching, arms back |
| 26 | `huy/jump_02` | take-off: arms swinging up |
| 27 | `huy/jump_03` | rising, knees tucked |
| 28 | `huy/jump_04` | peak: both arms up, big open-mouth grin |
| 29 | `huy/jump_05` | falling, arms coming down |
| 30 | `huy/jump_06` | landing: knees bent, arms out for balance |
| 31 | `huy/startle_01` | small startled hop, eyes wide, closed laptop lifted to the chest, exclamation mark [markers: magenta = laptop] |
| 32 | `huy/startle_02` | landing from the startle, hand on the chest, sweat drop |
| 33 | `huy/sit_01` | standing in front of the chair, about to sit |
| 34 | `huy/sit_02` | dropping casually onto the chair [markers: cyan = seat] |
| 35 | `huy/sit_03` | seated upright, hands on the knees [markers: cyan = seat] |
| 36 | `huy/sit_04` | seated, leaning far back, hands behind the head, relaxed [markers: cyan = seat] |
| 37 | `huy/sit_05` | standing up from the chair, hands on the knees pushing up [markers: cyan = seat] |
| 38 | `huy/sit_annoyed_01` | seated, turned toward the viewer, arms crossed, eyes rolling slightly, annoyed [markers: cyan = seat] |
| 39 | `huy/sit_smirk_01` | seated, turned toward the viewer, confident smirk, thumbs up [markers: cyan = seat] |
| 40 | `huy/sit_nod_01` | seated, turned toward the viewer, calm nod with an open palm, 'that's reasonable' [markers: cyan = seat] |
| 41 | `huy/slump_01` | sitting on the sofa, exhausted, head tilted back [markers: cyan = seat] |
| 42 | `huy/slump_02` | sliding sideways down onto the sofa [markers: cyan = seat] |
| 43 | `huy/lie_01` | lying on the back, forearm over the eyes, closed laptop resting on the stomach [markers: cyan = seat; magenta = laptop] |
| 44 | `huy/lie_02` | curled up asleep, head on a folded arm, small Zzz [markers: cyan = seat] |
| 45 | `huy/lie_03` | lying face down, one arm dangling, drained [markers: cyan = seat] |
| 46 | `huy/getup_01` | sitting up groggy on the sofa, rubbing one eye [markers: cyan = seat] |
| 47 | `huy/getup_02` | sitting on the sofa edge, stretching both arms [markers: cyan = seat] |
| 48 | `huy/getup_03` | standing up from the sofa, refreshed and determined [markers: cyan = seat] |
| 49 | `huy/good_01` | satisfied smirk, small nod, two golden sparkles |
| 50 | `huy/good_02` | small fist pump at the chest, sparkles |
| 51 | `huy/impressed_01` | eyebrows raised, impressed 'oh', small exclamation mark |
| 52 | `huy/bad_01` | wincing, one blue sweat drop |
| 53 | `huy/bad_02` | leaning back, grimacing, small dark swirl |
| 54 | `huy/bad_03` | awkward teeth-clenched grimace, sweat drop |
| 55 | `huy/sigh_01` | sighing, shoulders dropped, small grey puff |
| 56 | `huy/sigh_02` | looking down, deflated, hand on the back of the neck |

### Sheet B – Laptop, nói/nghe, giải thích – phòng thủ – đồng ý, estimate, điện thoại (offer), thái độ, suy nghĩ

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `huy/lap_carry_01` | closed laptop tucked under the left arm, about to report [markers: magenta = laptop] |
| 2 | `huy/lap_hold_01` | open laptop balanced on the left forearm, looking at the screen [markers: magenta = laptop] |
| 3 | `huy/lap_type_01` | typing fast with the right hand on the balanced laptop [markers: magenta = laptop] |
| 4 | `huy/lap_type_02` | typing, glancing up over the laptop [markers: magenta = laptop] |
| 5 | `huy/lap_show_01` | turning the open laptop so its screen faces right, toward someone, 'here is where we are' [markers: magenta = laptop] |
| 6 | `huy/lap_show_02` | laptop screen turned right, pointing at the screen with the free hand [markers: magenta = laptop] |
| 7 | `huy/lap_show_03` | laptop screen turned right, explaining with a small nod [markers: magenta = laptop] |
| 8 | `huy/lap_close_01` | closing the laptop with one hand, done [markers: magenta = laptop] |
| 9 | `huy/talk_01` | talking, right hand open at chest height, matter-of-fact |
| 10 | `huy/talk_02` | talking, both hands shaping a box in the air |
| 11 | `huy/talk_03` | talking with a small shrug |
| 12 | `huy/talk_04` | talking, hand returning down, confident smile |
| 13 | `huy/listen_01` | listening, hands in the trouser pockets |
| 14 | `huy/listen_02` | listening, head tilted, hand rubbing the chin |
| 15 | `huy/nod_01` | nodding down, eyes half closed |
| 16 | `huy/nod_02` | chin back up after the nod, slight smile |
| 17 | `huy/explain_01` | both hands shaping a box, describing a module |
| 18 | `huy/explain_02` | one hand drawing an arrow in the air, showing the flow |
| 19 | `huy/explain_03` | palms up, small shrug, 'the old way was too slow' |
| 20 | `huy/explain_04` | waving it off casually, 'it's a small change, no review needed' |
| 21 | `huy/defend_01` | both palms up at chest height, defensive |
| 22 | `huy/askme_01` | thumb pointing at his own chest, easy smile, 'just ask me' |
| 23 | `huy/agree_01` | open palm, conceding nod, 'fair enough' |
| 24 | `huy/agree_02` | thumbs up, relaxed smile, 'deal' |
| 25 | `huy/est_count_01` | holding up one finger, option one |
| 26 | `huy/est_count_02` | holding up two fingers |
| 27 | `huy/est_count_03` | all five fingers spread, 'five more days' |
| 28 | `huy/est_weigh_01` | both palms up like a scale, weighing two options |
| 29 | `huy/est_weigh_02` | one palm higher than the other, recommending one |
| 30 | `huy/est_stop_01` | palm raised forward, firm, 'we can't commit to that yet' |
| 31 | `huy/warn_01` | index finger raised, eyebrows lowered, warning about a risk |
| 32 | `huy/headshake_01` | shaking the head no, eyes closed |
| 33 | `huy/phone_read_01` | reading the phone, neutral [markers: magenta = phone] |
| 34 | `huy/phone_read_02` | reading the phone, thoughtful, weighing a job offer [markers: magenta = phone] |
| 35 | `huy/phone_hold_01` | phone held at chest level, looking aside, torn [markers: magenta = phone] |
| 36 | `huy/phone_type_01` | typing a reply with the thumb [markers: magenta = phone] |
| 37 | `huy/phone_call_01` | phone at the right ear, listening, frowning [markers: magenta = phone] |
| 38 | `huy/phone_call_02` | phone at the ear, calm, free hand gesturing [markers: magenta = phone] |
| 39 | `huy/phone_lower_01` | lowering the phone, sighing [markers: magenta = phone] |
| 40 | `huy/phone_pocket_01` | sliding the phone into the trouser pocket [markers: magenta = phone] |
| 41 | `huy/pocket_01` | both hands in the pockets, confident |
| 42 | `huy/lean_01` | weight on one leg, one hand in a pocket, relaxed |
| 43 | `huy/crossarms_01` | arms crossed, neutral, waiting |
| 44 | `huy/crossarms_02` | arms crossed, small confident smile |
| 45 | `huy/annoyed_01` | arms crossed, eyes rolling slightly, annoyed |
| 46 | `huy/frown_01` | frowning, jaw set, hands on the hips |
| 47 | `huy/doubt_01` | one eyebrow raised, skeptical, small question mark |
| 48 | `huy/point_01` | open hand pointing forward, 'your call' |
| 49 | `huy/think_01` | hand on the chin, looking up |
| 50 | `huy/think_02` | eyes closed, finger tapping the temple |
| 51 | `huy/scratch_01` | scratching the back of the head, awkward |
| 52 | `huy/facepalm_01` | facepalm, eyes closed |
| 53 | `huy/stress_01` | rubbing the temples with both hands |
| 54 | `huy/overload_01` | both hands on the head, overloaded, sweat drops |
| 55 | `huy/coffee_01` | holding a coffee mug with both hands, steam rising [markers: magenta = mug] |
| 56 | `huy/coffee_02` | sipping from the mug, eyes closed [markers: magenta = mug] |

### Sheet C – Bàn code ngày/đêm, bàn họp, 1-1, bảng trắng, mentoring/runbook, bàn giao

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `huy/desk_type_01` | seated typing fast, focused [markers: cyan = seat] |
| 2 | `huy/desk_type_02` | typing, glancing at the monitor [markers: cyan = seat] |
| 3 | `huy/desk_focus_01` | black over-ear headphones ON the ears, typing intensely [markers: cyan = seat] |
| 4 | `huy/desk_bug_01` | frowning at the monitor, hand on the chin [markers: cyan = seat] |
| 5 | `huy/desk_fixed_01` | small fist pump at the monitor, sparkles [markers: cyan = seat] |
| 6 | `huy/desk_turn_01` | swiveled on the chair to face the viewer, one arm on the backrest, talking over the shoulder [markers: cyan = seat] |
| 7 | `huy/desk_wave_01` | swiveled toward the viewer, waving it off casually, 'it's small' [markers: cyan = seat] |
| 8 | `huy/desk_stand_01` | pushing the chair back, starting to stand [markers: cyan = seat] |
| 9 | `huy/night_type_01` | typing late at night, tired eyes [markers: cyan = seat] |
| 10 | `huy/night_type_02` | typing, head drooping slightly [markers: cyan = seat] |
| 11 | `huy/night_rub_01` | rubbing the eyes with one hand [markers: cyan = seat] |
| 12 | `huy/night_yawn_01` | big yawn [markers: cyan = seat] |
| 13 | `huy/night_drink_01` | drinking from a can, eyes on the monitor [markers: cyan = seat; magenta = can] |
| 14 | `huy/night_sleep_01` | asleep with the head on folded arms on the desk, small Zzz [markers: cyan = seat] |
| 15 | `huy/night_sleep_02` | asleep, slightly different breathing pose [markers: cyan = seat] |
| 16 | `huy/night_wake_01` | jolting awake, eyes wide [markers: cyan = seat] |
| 17 | `huy/meet_table_talk_01` | talking with an open hand [markers: cyan = seat] |
| 18 | `huy/meet_table_talk_02` | leaning in, explaining a technical point [markers: cyan = seat] |
| 19 | `huy/meet_table_listen_01` | listening, forearms resting on the table [markers: cyan = seat] |
| 20 | `huy/meet_table_frown_01` | arms crossed, frowning [markers: cyan = seat] |
| 21 | `huy/meet_table_lap_01` | typing on a laptop standing on the table [markers: cyan = seat] |
| 22 | `huy/meet_table_show_01` | turning the laptop on the table toward the other side [markers: cyan = seat] |
| 23 | `huy/meet_table_warn_01` | index finger raised, warning about a risk [markers: cyan = seat] |
| 24 | `huy/meet_table_agree_01` | nodding, satisfied [markers: cyan = seat] |
| 25 | `huy/oneone_talk_01` | talking calmly, open hand [markers: cyan = seat] |
| 26 | `huy/oneone_offer_01` | looking down, rubbing the hands together, telling about a new job offer [markers: cyan = seat] |
| 27 | `huy/oneone_tired_01` | elbows on the knees, weary, 'all the critical work lands on me' [markers: cyan = seat] |
| 28 | `huy/oneone_frustrated_01` | one hand gesturing, frustrated, eyebrows lowered [markers: cyan = seat] |
| 29 | `huy/oneone_listen_01` | listening carefully to a proposal [markers: cyan = seat] |
| 30 | `huy/oneone_think_01` | hand on the chin, seriously considering [markers: cyan = seat] |
| 31 | `huy/oneone_agree_01` | small smile and nod, 'I'll stay and try it' [markers: cyan = seat] |
| 32 | `huy/oneone_decline_01` | respectful slight head shake, apologetic, 'I'm taking the offer' [markers: cyan = seat] |
| 33 | `huy/wb_draw_01` | drawing a box with a marker, arm raised [markers: magenta = marker] |
| 34 | `huy/wb_draw_02` | drawing a connecting arrow, arm lower [markers: magenta = marker] |
| 35 | `huy/wb_circle_01` | circling a bottleneck, serious [markers: magenta = marker] |
| 36 | `huy/wb_point_01` | tapping the diagram with the marker, 'this part' [markers: magenta = marker] |
| 37 | `huy/wb_explain_01` | half turned to the viewer, marker in hand, explaining two options [markers: magenta = marker] |
| 38 | `huy/wb_explain_02` | half turned to the viewer, explaining with an open palm |
| 39 | `huy/wb_review_01` | one step back from the board, arms crossed, reviewing |
| 40 | `huy/wb_cap_01` | capping the marker, satisfied smile [markers: magenta = marker] |
| 41 | `huy/mentor_point_01` | leaning forward, pointing down-right as if at a junior's screen, patient |
| 42 | `huy/mentor_explain_01` | standing, bent slightly toward a seated colleague on the right, explaining calmly |
| 43 | `huy/mentor_pat_01` | encouraging pat toward an offscreen shoulder on the right |
| 44 | `huy/mentor_thumb_01` | thumbs up to someone offscreen, 'good job' |
| 45 | `huy/runbook_write_01` | writing in an open binder held in the left hand, pen in the right [markers: green = binder; magenta = pen] |
| 46 | `huy/runbook_tick_01` | ticking a checklist sheet with a pen [markers: green = checklist; magenta = pen] |
| 47 | `huy/delegate_01` | handing a task card forward, 'your turn' [markers: magenta = card] |
| 48 | `huy/delegate_02` | confident nod after handing over the task |
| 49 | `huy/handover_01` | holding out a closed folder of architecture notes with both hands [markers: magenta = folder] |
| 50 | `huy/handover_02` | folder released, hands returning, serious nod |
| 51 | `huy/handover_lap_01` | holding out the closed laptop with both hands, returning it [markers: magenta = laptop] |
| 52 | `huy/pack_01` | holding his mug, about to put it into a box, wistful [markers: magenta = mug] |
| 53 | `huy/pack_02` | lifting a packed cardboard box with both hands [markers: magenta = box] |
| 54 | `huy/shake_01` | reaching out the right hand for a handshake |
| 55 | `huy/shake_02` | firm handshake, grin |
| 56 | `huy/farewell_bow_01` | hand on the chest, grateful slight bow, 'thanks for everything' |

### Sheet E – Sự cố + rollback, Technical Lead, nghỉ việc ôm thùng, kết thúc, biến thể kiệt sức

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `huy/alert_01` | reading an alert on the phone, shocked, exclamation mark [markers: magenta = phone] |
| 2 | `huy/alert_02` | phone lowered, jaw set, switching into crisis mode [markers: magenta = phone] |
| 3 | `huy/headset_01` | black over-ear headphones ON, speaking, one hand on the ear cup |
| 4 | `huy/headset_02` | headphones ON, typing on a laptop balanced on the left forearm while talking [markers: magenta = laptop] |
| 5 | `huy/command_01` | pointing right, giving urgent instructions |
| 6 | `huy/command_02` | both arms directing calmly, in control |
| 7 | `huy/incident_monitor_01` | arms crossed, tense, watching a monitor on the RIGHT |
| 8 | `huy/rollback_call_01` | decisive chopping hand gesture, 'roll back first' |
| 9 | `huy/rollback_type_01` | typing fast, intense focus, sweat drop [markers: magenta = laptop] |
| 10 | `huy/rollback_type_02` | typing fast, eyes narrowed [markers: magenta = laptop] |
| 11 | `huy/rollback_enter_01` | pressing enter decisively [markers: magenta = laptop] |
| 12 | `huy/rollback_done_01` | small victory fist, laptop now held in the other hand [markers: green = laptop] |
| 13 | `huy/flag_01` | index finger flicking an imaginary switch, 'feature flag off' |
| 14 | `huy/incident_fixed_01` | big relieved exhale, wiping the forehead |
| 15 | `huy/relief_01` | shoulders dropped, hand on the chest, relieved |
| 16 | `huy/stretch_01` | stretching both arms overhead |
| 17 | `huy/lead_01` | arms crossed, calm smile, a technical lead |
| 18 | `huy/lead_02` | leading a stand-up, both arms slightly open toward the team |
| 19 | `huy/lead_03` | pointing to assign a task, supportive smile |
| 20 | `huy/lead_04` | listening to the team, hand on the chin, nodding |
| 21 | `huy/determined_01` | fist in the palm, determined |
| 22 | `huy/confident_01` | hands on the hips, chin up, confident smile |
| 23 | `huy/proud_01` | proud nod, hands in the pockets |
| 24 | `huy/stretch_02` | twisting the torso to stretch, relaxed |
| 25 | `huy/farewell_01` | holding a box of personal items with both hands, looking at it [markers: magenta = box] |
| 26 | `huy/leave_01` | walking with the box, contact right foot [markers: magenta = box] |
| 27 | `huy/leave_02` | walking with the box, passing [markers: magenta = box] |
| 28 | `huy/leave_03` | walking with the box, contact left foot [markers: magenta = box] |
| 29 | `huy/leave_04` | walking with the box, passing [markers: magenta = box] |
| 30 | `huy/leave_back_01` | glancing back over the shoulder with a sad smile, box in the arms [markers: magenta = box] |
| 31 | `huy/farewell_wave_01` | box under one arm, small wave goodbye [markers: magenta = box] |
| 32 | `huy/bye_01` | hands free, two-finger salute goodbye, soft smile |
| 33 | `huy/cheer_01` | cheering, one fist raised, sparkles |
| 34 | `huy/cheer_02` | both fists raised, big grin |
| 35 | `huy/congrats_01` | offering a fist bump |
| 36 | `huy/congrats_02` | high-five hand raised |
| 37 | `huy/clap_01` | applauding, hands apart |
| 38 | `huy/clap_02` | applauding, hands together |
| 39 | `huy/sad_01` | sad, looking down, hand on the back of the neck |
| 40 | `huy/pat_01` | sympathetic pat toward an offscreen shoulder |
| 41 | `huy/tired_idle_01` | slouched idle 1/4, closed laptop hanging from one hand [markers: magenta = laptop] |
| 42 | `huy/tired_idle_02` | slouched idle 2/4 [markers: magenta = laptop] |
| 43 | `huy/tired_idle_03` | slouched idle 3/4, eyes half closed [markers: magenta = laptop] |
| 44 | `huy/tired_idle_04` | slouched idle 4/4 [markers: magenta = laptop] |
| 45 | `huy/tired_talk_01` | talking wearily, low hand gesture |
| 46 | `huy/tired_talk_02` | talking, forced smile |
| 47 | `huy/tired_talk_03` | talking, rubbing the neck |
| 48 | `huy/tired_talk_04` | talking, sighing |
| 49 | `huy/tired_walk_01` | contact right [markers: magenta = laptop] |
| 50 | `huy/tired_walk_02` | down [markers: magenta = laptop] |
| 51 | `huy/tired_walk_03` | passing [markers: magenta = laptop] |
| 52 | `huy/tired_walk_04` | up [markers: magenta = laptop] |
| 53 | `huy/tired_walk_05` | contact left [markers: magenta = laptop] |
| 54 | `huy/tired_walk_06` | down [markers: magenta = laptop] |
| 55 | `huy/tired_walk_07` | passing [markers: magenta = laptop] |
| 56 | `huy/tired_walk_08` | up [markers: magenta = laptop] |

### Sheet D – 20 chân dung hộp thoại (ĐÃ CÓ – giữ)

Ảnh `HUY_D_portraits.png` đã duyệt, **không sinh lại**. Prompt giữ ở `prompts/HUY_D_portraits.txt` để dùng khi cần.

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `huy/face_neutral` | neutral, self-assured |
| 2 | `huy/face_smirk` | confident half-smile |
| 3 | `huy/face_grin` | big friendly grin |
| 4 | `huy/face_laugh` | laughing, eyes closed |
| 5 | `huy/face_focused` | focused, eyes narrowed, headphones on |
| 6 | `huy/face_serious` | serious, straight mouth |
| 7 | `huy/face_frown` | frowning, jaw set |
| 8 | `huy/face_annoyed` | annoyed, eyes rolling slightly |
| 9 | `huy/face_defensive` | defensive, eyebrows up, palm raised into the frame |
| 10 | `huy/face_skeptical` | one eyebrow raised, skeptical |
| 11 | `huy/face_thinking` | thinking, eyes looking up |
| 12 | `huy/face_surprised` | surprised, eyebrows up, mouth open |
| 13 | `huy/face_worried` | worried, eyebrows tilted, sweat drop |
| 14 | `huy/face_tired` | tired, faint dark circles |
| 15 | `huy/face_exhausted` | exhausted, half-closed eyes, small grey puff |
| 16 | `huy/face_sigh` | sighing, eyes closed |
| 17 | `huy/face_relieved` | relieved, soft smile |
| 18 | `huy/face_determined` | determined, sharp eyes |
| 19 | `huy/face_grateful` | grateful, warm small smile |
| 20 | `huy/face_apologetic` | apologetic, sad smile, looking aside |

### Sheet P – Đồ vật riêng của Huy (laptop navy, lon nước, runbook, thùng đồ)

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `prop/huy_laptop_closed` | closed laptop seen 3/4, as tucked under an arm |
| 2 | `prop/huy_laptop_open_34` | open laptop seen 3/4 from behind-left, as balanced on a forearm (lid back visible, keyboard partly visible) |
| 3 | `prop/huy_laptop_screen_34` | open laptop turned so the screen faces right at a 3/4 angle; visible screen is flat solid GREEN #00FF00 |
| 4 | `prop/huy_laptop_open_front` | open laptop with the screen facing the viewer; screen flat solid GREEN #00FF00 |
| 5 | `prop/energy_can` | plain dark-blue energy drink can, no text |
| 6 | `prop/runbook_binder` | open navy ring binder with colored tab dividers and grey lines (no readable text) |
| 7 | `prop/huy_box` | open cardboard box holding a small cactus, black headphones, a rolled cable and a mug |
| 8 | `prop/huy_headphones` | black over-ear headphones lying on a desk |

