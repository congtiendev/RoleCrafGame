# RoleCraft PM60 – Bộ prompt sprite Huy – Senior Developer

Cùng cơ chế v3 với bộ PM (`docs/PM`) và các bộ MINH, CLIENT, LINH: nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`. **4 sheet nhân vật / 188 ô**; đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**. Kịch bản gốc: `docs/KICH_BAN_ROLECRAFT_PM60.md`.

**Các file**

| File | Dùng để |
|---|---|
| `rolecraft_huy_sprite_prompts/SOL_ONE_SHOT_PROMPT.txt` | Prompt gửi **một lần** cho GPT-5.6 Sol (đính kèm ảnh thật, `PM_A_master.png`, file zip thư mục này) |
| `rolecraft_huy_sprite_prompts/prompts/HUY_*.txt` | Prompt từng sheet, nếu muốn sinh thủ công |
| `rolecraft_huy_sprite_prompts/huy_sprite_manifest.json` | Lưới, ảnh đính kèm, tên sprite `huy/*`, **bind** từng ô → `prop/*`, `furn/*` của bộ PM |
| `rolecraft_huy_sprite_prompts/mapping_section.md` | Đối chiếu kịch bản → sprite (bản gốc của mục 5) |
| `rolecraft_huy_sprite_prompts/tools/` | `extract_anchors.py` (bản nhận mọi nhân vật), `pm_compose.js` |
| `rolecraft_huy_sprite_prompts/build.py`, `readme.py` | Nguồn sinh prompt/manifest/README: `python3 build.py && python3 readme.py` |

---

## 1. Thứ tự sinh, ảnh đính kèm, tạo hình


### Thứ tự tạo ảnh

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8x7) | `prompts/HUY_A_master.txt` | ảnh thật + `PM_A_master.png` (chỉ lấy style) | Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (tự tin, phòng thủ, quá tải) |
| B (8x7) | `prompts/HUY_B_hands_gestures.txt` | ảnh thật + `HUY_A_master.png` | Cầm nắm + cử chỉ Senior Dev |
| C (8x7) | `prompts/HUY_C_work_scenes.txt` | ảnh thật + `HUY_A_master.png` | Bàn code, họp, 1-1 (tự quyết / offer), sự cố + rollback, OT, Tech Lead / nghỉ, kết thúc |
| D (4x5) | `prompts/HUY_D_portraits.txt` | ảnh thật + `HUY_A_master.png` | 20 chân dung cảm xúc cho hộp thoại |

Tạo sheet A trước và duyệt, sau đó B, C, D đính kèm A làm chuẩn.

### Tạo hình nhân vật (theo docs)

- Vai trò: Backend Developer giỏi, nhanh nhưng thích tự quyết (L1); người hiểu hệ thống nhất, gánh việc critical.
- Xưng “anh” với PM → lớn tuổi hơn PM; tự tin, hơi bướng, dễ phòng thủ khi bị siết quy trình.
- Cung truyện: tự đổi requirement (L1 S02) → quá tải, nhận offer (L2 S07) → ở lại làm Technical Lead hoặc nghỉ (`key_developer_retained` / `key_developer_left`) → runbook, mentoring (L4).
- Đạo cụ đặc trưng: laptop (`prop/laptop_closed`, `prop/laptop_open_34`); tai nghe đeo cổ là một phần nhân vật.

---

## 2. Điểm kiểm tra

> ✅ **Sheet A:** nhận ra người thật; nét vẽ, viền, bóng và cỡ người khớp sheet A của PM; ô 1 là chân dung có khung; các ô khác **không có đồ vật**, tay ở tư thế cầm; chấm màu đúng các ô có `[markers]`.
>
> ✅ **Các sheet còn lại:** khớp sheet A; không vẽ ghế, bàn, màn hình, đồ cầm tay; tư thế ngồi cùng độ cao trong một hàng; nhân vật khác nằm ngoài khung.
>
> ✅ **Sau khi chạy script:** mở `build/report.json`; mỗi dòng `missing grip/seat marker` là một ô cần sinh lại.

---

## 3. Dùng tool

```bash
python3 tools/extract_anchors.py --manifest huy_sprite_manifest.json --sheets sheets --out build
```

Kết quả `build/sprites/huy/*.png`, `anim/*.png`, `anchors.json`, `animations.json`, `report.json`. Ghép với đồ vật: nạp `anchors.json` của cả bộ PM (có `prop/*`, `furn/*`) và bộ này, rồi `PMCompose.create(anchors, manifest, base)`.

---

## 4. Chấm neo theo ô

Ô có `[markers]` trong prompt được gắn đồ vật/nội thất trong manifest (`cells[].bind`); danh sách đầy đủ ở mục 6.

---

## 5. Mapping kịch bản → sprite

Tên trong bảng là **nhóm animation** (`huy/<nhóm>`) hoặc một ô cụ thể (`huy/<ô>_01`). `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Kịch bản gốc: `docs/KICH_BAN_ROLECRAFT_PM60.md`; thoại trong game: `THOAI_MAU.json`.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
|---|---|---|---|
| `P1_INTRO` | Mở đầu | Backend chính đã chạy được… nếu không thay đổi nhiều thì vẫn kịp demo. | `huy/talk_01`, `huy/face_smirk` |
| `P1_S01_PROJECT_TAKEOVER` | Mở cảnh | Task cũ vẫn chạy, khoảng một tuần nữa có thể demo. | `huy/lap_carry_01` → `huy/lap_show` → `huy/talk`, `huy/face_neutral` |
| `P1_S01_PROJECT_TAKEOVER` | Nhánh A | Mất một ngày nhưng cả team thống nhất được hiện trạng. | `huy/nod`, `huy/face_serious` |
| `P1_S01_PROJECT_TAKEOVER` | Nhánh B/C | Vậy team tiếp tục theo kế hoạch / có gì cần làm rõ thì báo anh. | `huy/good_01`, `huy/pocket_01` |
| `P1_S02_SENIOR_AUTONOMY` | Mở cảnh | Anh đã đổi cách xử lý để kịp demo… thay đổi nhỏ, không cần review. | `huy/desk_turn_01` → `huy/explain` → `huy/desk_wave_01`, `huy/face_smirk` |
| `P1_S02_SENIOR_AUTONOMY` | Nhánh A | Việc gì cũng chờ phê duyệt thì tiến độ sẽ chậm hơn. | `huy/defend_03`, `huy/annoyed_01`, `huy/face_annoyed` |
| `P1_S02_SENIOR_AUTONOMY` | Nhánh B | Vậy anh sẽ chủ động xử lý để bảo đảm tiến độ. | `huy/smirk_01`, `huy/face_grin` |
| `P1_S02_SENIOR_AUTONOMY` | Nhánh C | Hợp lý. Thay đổi ảnh hưởng requirement sẽ đưa ra review. | `huy/oneone_agree_01`, `huy/agree`, `huy/face_relieved` |
| `P1_S03_SCOPE_CHANGE` | Mở cảnh | Nhìn giao diện thì nhỏ, nhưng backend phải đổi một số luồng. | `huy/meet_table_warn_01`, `huy/face_skeptical` |
| `P1_S04_TOOL_BUDGET` | Mở cảnh | Có monitoring và công cụ tốt hơn, team phát hiện vấn đề nhanh hơn. | `huy/talk_02`, `huy/face_neutral` |
| `P2_S05_DUAL_DEADLINE` | Mở cảnh | Anh chuyển sang B thì backend của A thiếu người review. | `huy/est_stop_01`, `huy/face_frown` |
| `P2_S05_DUAL_DEADLINE` | Nhánh A/B/C | Vẫn tốn onboarding / lịch không còn dự phòng / tập trung phần tích hợp. | `huy/explain_03`, `huy/worry_01`, `huy/agree_01` |
| `P2_S06_DEADLINE_QUALITY` | Mở cảnh | Release đúng ngày thì phải bỏ vòng regression cuối. | `huy/meet_table_talk`, `huy/face_serious` |
| `P2_S06_DEADLINE_QUALITY` | Nhánh A | Lỗi luồng cũ lọt lên production thì tốn hơn nhiều. | `huy/warn_01`, `huy/face_worried` |
| `P2_S06_DEADLINE_QUALITY` | Nhánh C | Anh sẽ dùng feature flag để kiểm soát phạm vi mở. | `huy/flag`, `huy/face_determined` |
| `P2_S07_KEY_PERSON_RETENTION` | Mở cảnh | Anh vừa nhận offer cao hơn 30%… việc critical dồn hết vào anh. | `huy/phone_read_02`, `huy/oneone_offer_01`, `huy/oneone_tired_01`, `huy/face_tired` |
| `P2_S07_KEY_PERSON_RETENTION` | Cờ OT / restricted | Hai tuần OT… / chịu trách nhiệm mà không đủ quyền. | `huy/oneone_frustrated_01`, `huy/face_exhausted` |
| `P2_S07_KEY_PERSON_RETENTION` | Nhánh A / C1 | Anh sẽ ở lại (quyền lợi / lộ trình Technical Lead). | `huy/oneone_think_01`, `huy/oneone_agree_01`, `huy/shake`, `huy/face_grateful` |
| `P2_S07_KEY_PERSON_RETENTION` | Nhánh B / C2 | Anh nhận offer mới, sẽ hỗ trợ bàn giao. | `huy/oneone_decline_01`, `huy/handover`, `huy/farewell`, `huy/face_apologetic` |
| `P2_S08_CUSTOMER_COMPLAINT` | Biến thể 1/2 | Team tối ưu để kịp demo nhưng chưa ghi thành requirement / đúng tài liệu. | `huy/meet_table_talk`, `huy/defend_01`, `huy/face_defensive` |
| `P2_S08_CUSTOMER_COMPLAINT` | Nhánh B/C | Không chỉ sửa lỗi nhỏ / estimate hai phương án kỹ thuật. | `huy/sigh_01`, `huy/est_weigh`, `huy/wb_explain_01` |
| `P3_S09_PRODUCTION_INCIDENT` | Mở cảnh | Production lỗi lúc 14:00. | `huy/alert`, `huy/incident_type_01`, `huy/face_surprised` |
| `P3_S09_PRODUCTION_INCIDENT` | Nhánh C | Rollback trước, lập nhóm incident rồi điều tra. | `huy/incident_rollback_01`, `huy/incident_monitor_01`, `huy/incident_fixed_01` |
| `P3_S10_SALES_OVERCOMMIT` | Mở cảnh | Sales hứa tính năng AI trong 10 ngày. | `huy/est_count`, `huy/est_stop_01`, `huy/face_frown` |
| `P3_S11_JUNIOR_MISTAKE` | Nhánh C | Bổ sung checklist review/deploy. | `huy/mentor_point_01`, `huy/runbook_tick_01`, `huy/mentor_pat_01` |
| `P3_S12_BIG_PROJECT` | Mở cảnh | Nhận thêm dự án lớn với nguồn lực có hạn. | `huy/crossarms_01`, `huy/face_worried` |
| `P4_S13_OPERATING_SYSTEM` | Mở cảnh | Kiến trúc vẫn phụ thuộc vào anh, cần chuyển quyền review. | `huy/scratch_01`, `huy/delegate_01`, `huy/face_serious` |
| `P4_S13_OPERATING_SYSTEM` | Nhánh A | Output tăng trước mắt, nhưng điểm nghẽn cũ sẽ quay lại. | `huy/warn_01`, `huy/face_skeptical` |
| `P4_S13_OPERATING_SYSTEM` | Nhánh B/C | Anh bổ sung runbook deploy, rollback… team hiểu lý do từng bước. | `huy/doc_read_01`, `huy/runbook_tick_01`, `huy/face_determined` |
| `P4_S14_TEAM_DEVELOPMENT` | Mở cảnh | Anh muốn lên Technical Lead, không ôm mọi vấn đề khó nữa. | `huy/oneone_talk`, `huy/face_determined` |
| `P4_S14_TEAM_DEVELOPMENT` | Nhánh A | Chỉ nhìn số task thì mentoring, review không được ghi nhận. | `huy/frown_01`, `huy/face_frown` |
| `P4_S14_TEAM_DEVELOPMENT` | Nhánh B/C | Phù hợp hướng Technical Lead / đồng ý nếu phạm vi quyết định được ghi rõ. | `huy/lead`, `huy/face_grateful` |
| `P4_S15_CLIENT_EXPANSION` | Nhánh A | Mình đang cam kết khi chưa biết hết phạm vi tích hợp. | `huy/est_warn_01`, `huy/face_worried` |
| `END` | Kết thúc | Chúc mừng / chia tay PM (không có thoại trong docs – dùng cho màn kết). | `huy/cheer`, `huy/congrats`, `huy/sad_01`, `huy/bye_01` |

---

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (tự tin, phòng thủ, quá tải)

File `HUY_A_master.png`, lưới 8×7, prompt `prompts/HUY_A_master.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `huy/portrait` | [portrait cell, see LAYOUT] confident half-smile, closed laptop under one arm, a few sparkles |
| 2 | `huy/idle_01` | idle loop 1/4: relaxed confident stance, closed laptop tucked under the left arm [markers: magenta = laptop] |
| 3 | `huy/idle_02` | idle loop 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = laptop] |
| 4 | `huy/idle_03` | idle loop 3/4: rolling the neck a little, casual [markers: magenta = laptop] |
| 5 | `huy/idle_back_01` | standing seen from behind (back view), closed laptop under the left arm [markers: magenta = laptop] |
| 6 | `huy/idle_04` | idle loop 4/4: slight exhale, calm self-assured face [markers: magenta = laptop] |
| 7 | `huy/greet_01` | casual nod with a half-smile, free hand raised briefly |
| 8 | `huy/greet_02` | two-finger salute from the brow, 'hey' |
| 9 | `huy/walk_01` | walk contact: left foot forward heel touching [markers: magenta = laptop] |
| 10 | `huy/walk_02` | walk down: weight on left leg, knee bent [markers: magenta = laptop] |
| 11 | `huy/walk_03` | walk passing: right leg passing the left [markers: magenta = laptop] |
| 12 | `huy/walk_04` | walk up: rising on left toes [markers: magenta = laptop] |
| 13 | `huy/walk_05` | walk contact: right foot forward heel touching [markers: magenta = laptop] |
| 14 | `huy/walk_06` | walk down: weight on right leg, knee bent [markers: magenta = laptop] |
| 15 | `huy/walk_07` | walk passing: left leg passing the right [markers: magenta = laptop] |
| 16 | `huy/walk_08` | walk up: rising on right toes [markers: magenta = laptop] |
| 17 | `huy/talk_01` | talking, right hand open at chest height, matter-of-fact |
| 18 | `huy/talk_02` | talking, both hands shaping a box in the air, explaining the system |
| 19 | `huy/talk_03` | talking with a small shrug, 'it's only a small change' |
| 20 | `huy/talk_04` | talking, hand returning down, confident smile |
| 21 | `huy/listen_01` | listening, hands in the hoodie pockets, half attentive |
| 22 | `huy/listen_02` | listening, head tilted, one hand rubbing the chin |
| 23 | `huy/nod_01` | nodding, eyes half closed, 'fair enough' |
| 24 | `huy/nod_02` | nodding, chin lifted back up |
| 25 | `huy/sit_01` | standing next to the chair, about to sit |
| 26 | `huy/sit_02` | dropping casually onto the chair [markers: cyan = seat] |
| 27 | `huy/sit_03` | seated, leaning back, relaxed [markers: cyan = seat] |
| 28 | `huy/sit_04` | seated, leaning back, arms crossed, unconvinced [markers: cyan = seat] |
| 29 | `huy/sit_05` | seated, leaning forward, elbows on the knees, fingers laced, serious [markers: cyan = seat] |
| 30 | `huy/sit_06` | seated, typing on a laptop resting on the lap [markers: cyan = seat; magenta = laptop] |
| 31 | `huy/sit_07` | seated, reading a phone held in the right hand [markers: cyan = seat; magenta = phone] |
| 32 | `huy/sit_08` | standing up from the chair [markers: cyan = seat] |
| 33 | `huy/good_01` | satisfied smirk, small nod, two golden sparkles |
| 34 | `huy/good_02` | thumbs up with the right hand, sparkles |
| 35 | `huy/good_03` | proud grin, arms crossed, chin up |
| 36 | `huy/good_04` | laughing, eyes closed, head tipped back |
| 37 | `huy/applaud_01` | applauding, hands apart |
| 38 | `huy/applaud_02` | applauding, hands together |
| 39 | `huy/impressed_01` | eyebrows raised, impressed 'oh', small exclamation mark |
| 40 | `huy/relieved_01` | relieved exhale, hand rubbing the back of the neck, small smile |
| 41 | `huy/defend_01` | both palms up at chest height, defensive, 'I did it to hit the demo' |
| 42 | `huy/annoyed_01` | annoyed, eyes rolling slightly, arms crossed |
| 43 | `huy/frown_01` | frowning, jaw set, arms crossed tightly |
| 44 | `huy/doubt_01` | skeptical raised eyebrow, small question mark |
| 45 | `huy/sigh_01` | sighing, shoulders dropped, small grey puff |
| 46 | `huy/scratch_01` | scratching the back of the head, frustrated |
| 47 | `huy/overload_01` | both hands on the head, overloaded, sweat drops |
| 48 | `huy/worry_01` | worried, hand on the back of the neck, one sweat drop |
| 49 | `huy/think_01` | thinking, hand on the chin, looking up |
| 50 | `huy/think_02` | thinking, eyes closed, finger tapping the temple |
| 51 | `huy/pocket_01` | confident stance, both hands in the hoodie pockets |
| 52 | `huy/crossarms_01` | arms crossed, neutral, waiting |
| 53 | `huy/crossarms_02` | arms crossed, small confident smile |
| 54 | `huy/lean_01` | leaning back on one leg, relaxed, one hand in a pocket |
| 55 | `huy/warn_01` | index finger raised, serious, 'that will cost more later' |
| 56 | `huy/point_01` | pointing forward with an open hand, 'your call' |

### Sheet B – Cầm nắm + cử chỉ Senior Dev

File `HUY_B_hands_gestures.png`, lưới 8×7, prompt `prompts/HUY_B_hands_gestures.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `huy/lap_carry_01` | closed laptop tucked under the left arm, about to report [markers: magenta = laptop] |
| 2 | `huy/lap_hold_01` | open laptop balanced on the left forearm, looking at the screen [markers: magenta = laptop] |
| 3 | `huy/lap_type_01` | typing fast with the right hand on the balanced laptop [markers: magenta = laptop] |
| 4 | `huy/lap_type_02` | typing, glancing up over the laptop [markers: magenta = laptop] |
| 5 | `huy/lap_show_01` | turning the laptop screen toward the viewer, 'here is where we are' [markers: magenta = laptop] |
| 6 | `huy/lap_show_02` | laptop turned toward the viewer, pointing at the screen with the free hand [markers: magenta = laptop] |
| 7 | `huy/lap_show_03` | laptop turned toward the viewer, explaining with a small nod [markers: magenta = laptop] |
| 8 | `huy/lap_close_01` | closing the laptop with one hand, done [markers: magenta = laptop] |
| 9 | `huy/explain_01` | both hands shaping a box, describing a module |
| 10 | `huy/explain_02` | one hand drawing an arrow in the air, showing the flow |
| 11 | `huy/explain_03` | small shrug, palms up, 'the old way was too slow' |
| 12 | `huy/explain_04` | hand waving it off casually, 'no need for a review' |
| 13 | `huy/defend_02` | palm on the chest, a bit defensive, 'I know the system best' |
| 14 | `huy/defend_03` | arms crossed, frowning, 'waiting for approval slows everything' |
| 15 | `huy/agree_01` | open palm, conceding nod, 'that's reasonable' |
| 16 | `huy/agree_02` | thumbs up, relaxed smile, 'deal' |
| 17 | `huy/wb_draw_01` | drawing a box on the whiteboard with a marker [markers: magenta = marker] |
| 18 | `huy/wb_draw_02` | drawing a connecting arrow [markers: magenta = marker] |
| 19 | `huy/wb_circle_01` | circling a bottleneck on the board, serious [markers: magenta = marker] |
| 20 | `huy/wb_point_01` | pointing at the diagram with the marker [markers: magenta = marker] |
| 21 | `huy/wb_point_02` | tapping the board, 'this part' [markers: magenta = marker] |
| 22 | `huy/wb_explain_01` | marker raised, half turned to the viewer, explaining two technical options [markers: magenta = marker] |
| 23 | `huy/wb_review_01` | one step back from the board, arms crossed, reviewing the diagram |
| 24 | `huy/wb_turn_01` | turning back to the viewer from the board [markers: magenta = marker] |
| 25 | `huy/est_count_01` | counting on fingers: two fingers up (days) |
| 26 | `huy/est_count_02` | counting: all five fingers spread, 'five days of refactor' |
| 27 | `huy/est_weigh_01` | both palms up like a scale, two technical options |
| 28 | `huy/est_weigh_02` | one palm higher than the other, recommending one |
| 29 | `huy/est_card_01` | holding a small estimate card, reading it [markers: magenta = card] |
| 30 | `huy/est_card_02` | handing the estimate card forward [markers: magenta = card] |
| 31 | `huy/est_stop_01` | palm raised, 'we can't commit before knowing the scope' |
| 32 | `huy/est_warn_01` | finger raised, eyebrows lowered, pointing out a risk |
| 33 | `huy/phone_read_01` | reading a message on the phone, neutral [markers: magenta = phone] |
| 34 | `huy/phone_read_02` | reading the phone, thoughtful, weighing a job offer [markers: magenta = phone] |
| 35 | `huy/phone_type_01` | typing quickly with the thumb [markers: magenta = phone] |
| 36 | `huy/phone_call_01` | phone at the ear, listening, frowning [markers: magenta = phone] |
| 37 | `huy/phone_alert_01` | reading an alert on the phone, eyes wide, exclamation mark [markers: magenta = phone] |
| 38 | `huy/phone_pocket_01` | sliding the phone into the jeans pocket [markers: magenta = phone] |
| 39 | `huy/headset_on_01` | pulling the headphones up onto the ears, focus mode |
| 40 | `huy/headset_off_01` | pulling the headphones down to the neck to listen |
| 41 | `huy/handover_01` | holding out a closed folder of architecture notes with both hands [markers: magenta = folder] |
| 42 | `huy/handover_02` | folder handed over, hands returning, serious nod [markers: magenta = folder] |
| 43 | `huy/doc_read_01` | reading an open runbook folder [markers: magenta = folder] |
| 44 | `huy/runbook_tick_01` | ticking a deploy/rollback checklist with a pen [markers: magenta = checklist; green = pen] |
| 45 | `huy/mentor_point_01` | leaning slightly, pointing down to the LEFT as if at a junior's screen, patient |
| 46 | `huy/mentor_pat_01` | encouraging pat toward an offscreen shoulder |
| 47 | `huy/mentor_thumb_01` | thumbs up to someone offscreen, 'good job' |
| 48 | `huy/delegate_01` | open palm offered forward, handing over the review, 'your turn' |
| 49 | `huy/coffee_01` | holding a coffee mug, relaxed [markers: magenta = mug] |
| 50 | `huy/coffee_02` | sipping the coffee, eyes closed [markers: magenta = mug] |
| 51 | `huy/stretch_01` | stretching the neck to one side, hand on the shoulder |
| 52 | `huy/stretch_02` | stretching both arms up, yawning |
| 53 | `huy/knuckles_01` | interlocking fingers and stretching them forward, ready to code |
| 54 | `huy/sleeves_01` | pushing the hoodie sleeves higher, determined |
| 55 | `huy/yawn_01` | yawning, hand over the mouth |
| 56 | `huy/smirk_01` | hands in the pockets, sly confident smirk |

### Sheet C – Bàn code, họp, 1-1 (tự quyết / offer), sự cố + rollback, OT, Tech Lead / nghỉ, kết thúc

File `HUY_C_work_scenes.png`, lưới 8×7, prompt `prompts/HUY_C_work_scenes.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `huy/desk_type_01` | seated, typing fast [markers: cyan = seat] |
| 2 | `huy/desk_type_02` | seated, typing, glancing at the monitor [markers: cyan = seat] |
| 3 | `huy/desk_focus_01` | seated, headphones on, typing intensely, focused [markers: cyan = seat] |
| 4 | `huy/desk_think_01` | seated, leaning back, hands behind the head, thinking [markers: cyan = seat] |
| 5 | `huy/desk_bug_01` | seated, frowning at the monitor, hand on the chin [markers: cyan = seat] |
| 6 | `huy/desk_fixed_01` | seated, small fist pump, sparkles (fixed) [markers: cyan = seat] |
| 7 | `huy/desk_turn_01` | seated, swiveling around on the chair to talk to someone behind [markers: cyan = seat] |
| 8 | `huy/desk_wave_01` | seated, half turned, waving it off casually, 'it's a small change' [markers: cyan = seat] |
| 9 | `huy/meet_table_talk_01` | seated at the table, talking with an open hand [markers: cyan = seat] |
| 10 | `huy/meet_table_talk_02` | seated, leaning in, explaining a technical point [markers: cyan = seat] |
| 11 | `huy/meet_table_listen_01` | seated, listening, arms resting on the table [markers: cyan = seat] |
| 12 | `huy/meet_table_frown_01` | seated, arms crossed on the table, frowning [markers: cyan = seat] |
| 13 | `huy/meet_table_lap_01` | seated, typing on a laptop on the table [markers: cyan = seat] |
| 14 | `huy/meet_table_show_01` | seated, turning the laptop on the table toward the others [markers: cyan = seat] |
| 15 | `huy/meet_table_warn_01` | seated, index finger raised, warning about a risk [markers: cyan = seat] |
| 16 | `huy/meet_table_agree_01` | seated, nodding, satisfied [markers: cyan = seat] |
| 17 | `huy/oneone_talk_01` | seated, talking calmly, open hand [markers: cyan = seat] |
| 18 | `huy/oneone_offer_01` | seated, looking down, rubbing the hands together, telling about a new job offer [markers: cyan = seat] |
| 19 | `huy/oneone_tired_01` | seated, elbows on the knees, weary, 'all the critical work lands on me' [markers: cyan = seat] |
| 20 | `huy/oneone_frustrated_01` | seated, one hand gesturing, frustrated, eyebrows lowered [markers: cyan = seat] |
| 21 | `huy/oneone_listen_01` | seated, listening carefully to a proposal [markers: cyan = seat] |
| 22 | `huy/oneone_think_01` | seated, hand on the chin, seriously considering [markers: cyan = seat] |
| 23 | `huy/oneone_agree_01` | seated, small smile and nod, 'I'll stay and try it' [markers: cyan = seat] |
| 24 | `huy/oneone_decline_01` | seated, respectful slight head shake, apologetic, 'I'm taking the offer' [markers: cyan = seat] |
| 25 | `huy/alert_01` | reading a production alert on the phone, shocked, exclamation mark [markers: magenta = phone] |
| 26 | `huy/alert_02` | phone lowered, jaw set, switching into crisis mode [markers: magenta = phone] |
| 27 | `huy/incident_type_01` | typing fast on the laptop balanced on the forearm, sweat drop [markers: magenta = laptop] |
| 28 | `huy/incident_rollback_01` | decisive chopping hand gesture, 'roll back first' |
| 29 | `huy/incident_monitor_01` | standing, arms crossed, tense, watching a monitor on the LEFT |
| 30 | `huy/incident_fixed_01` | big relieved exhale, hand wiping the forehead |
| 31 | `huy/flag_01` | index finger flicking an imaginary switch, 'feature flag off' |
| 32 | `huy/flag_02` | thumbs up, calm, 'scope under control' |
| 33 | `huy/tired_01` | rubbing the eyes under the lifted hand, tired |
| 34 | `huy/tired_02` | slumped shoulders, holding a mug, faint dark circles [markers: magenta = mug] |
| 35 | `huy/tired_03` | long yawn, arms hanging |
| 36 | `huy/burnout_01` | blank stare, drooping posture, small grey puff |
| 37 | `huy/overload_02` | hands on the knees, bent forward, exhausted, sweat drops |
| 38 | `huy/frustrated_01` | scratching the head hard with both hands |
| 39 | `huy/breath_01` | deep breath, eyes closed, hands on the hips |
| 40 | `huy/determined_01` | sleeves pushed up, fist in the palm, determined |
| 41 | `huy/lead_01` | confident stance, arms crossed, calm smile, a technical lead |
| 42 | `huy/lead_02` | leading a stand-up, both arms slightly open toward the team |
| 43 | `huy/lead_03` | pointing to assign a task, supportive |
| 44 | `huy/shake_01` | reaching out the right hand for a handshake, 'deal' |
| 45 | `huy/shake_02` | firm handshake, grin |
| 46 | `huy/farewell_01` | carrying a cardboard box with personal items, leaving [markers: magenta = box] |
| 47 | `huy/farewell_02` | box under one arm, small wave goodbye [markers: magenta = box] |
| 48 | `huy/farewell_03` | hand on the chest, grateful slight bow, 'thanks for everything' |
| 49 | `huy/cheer_01` | cheering, one fist raised, sparkles |
| 50 | `huy/cheer_02` | both fists raised, big grin |
| 51 | `huy/congrats_01` | offering a fist bump |
| 52 | `huy/congrats_02` | high-five hand raised |
| 53 | `huy/proud_01` | proud nod, hands in the pockets |
| 54 | `huy/sad_01` | sad, looking down, hand on the back of the neck |
| 55 | `huy/pat_01` | sympathetic pat toward an offscreen shoulder |
| 56 | `huy/bye_01` | two-finger salute goodbye, soft smile |

### Sheet D – 20 chân dung cảm xúc cho hộp thoại

File `HUY_D_portraits.png`, lưới 4×5, prompt `prompts/HUY_D_portraits.txt`.

| # | Tên | Mô tả |
|---|---|---|
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

