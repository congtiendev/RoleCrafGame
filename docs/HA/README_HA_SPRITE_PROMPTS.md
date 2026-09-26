# RoleCraft PM60 – Bộ prompt sprite Chị Hà – HR (Hội đồng đánh giá)

Cùng cơ chế v3 với bộ PM (`docs/PM`) và các bộ MINH, CLIENT, LINH: nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`. **3 sheet nhân vật / 132 ô**; đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**. Kịch bản gốc: `docs/KICH_BAN_ROLECRAFT_PM60.md`.

**Các file**

| File | Dùng để |
|---|---|
| `rolecraft_ha_sprite_prompts/SOL_ONE_SHOT_PROMPT.txt` | Prompt gửi **một lần** cho GPT-5.6 Sol (đính kèm ảnh thật, `PM_A_master.png`, file zip thư mục này) |
| `rolecraft_ha_sprite_prompts/prompts/HA_*.txt` | Prompt từng sheet, nếu muốn sinh thủ công |
| `rolecraft_ha_sprite_prompts/ha_sprite_manifest.json` | Lưới, ảnh đính kèm, tên sprite `ha/*`, **bind** từng ô → `prop/*`, `furn/*` của bộ PM |
| `rolecraft_ha_sprite_prompts/mapping_section.md` | Đối chiếu kịch bản → sprite (bản gốc của mục 5) |
| `rolecraft_ha_sprite_prompts/tools/` | `extract_anchors.py` (bản nhận mọi nhân vật), `pm_compose.js` |
| `rolecraft_ha_sprite_prompts/build.py`, `readme.py` | Nguồn sinh prompt/manifest/README: `python3 build.py && python3 readme.py` |

---

## 1. Thứ tự sinh, ảnh đính kèm, tạo hình


### Thứ tự tạo ảnh

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8x7) | `prompts/HA_A_master.txt` | ảnh thật + `PM_A_master.png` (chỉ lấy style) | Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc |
| B (8x7) | `prompts/HA_B_review_endings.txt` | ảnh thật + `HA_A_master.png` | Cầm nắm, Final Review (hội đồng + phản biện), 4 kết thúc |
| D (4x5) | `prompts/HA_D_portraits.txt` | ảnh thật + `HA_A_master.png` | 20 chân dung cảm xúc cho hộp thoại |

Tạo sheet A trước và duyệt, sau đó B, D đính kèm A làm chuẩn. Không có sheet C: chị Hà chỉ xuất hiện ở S16 và màn kết, nên cảnh bàn hội đồng và 4 kết thúc gộp vào sheet B.

### Tạo hình nhân vật

- Không có trong docs gốc: `THOAI_MAU.json` thêm chị Hà thay cho “Hội đồng đánh giá” (`REVIEW_PANEL`, docs/KICH_BAN_ROLECRAFT_PM60.md – L4 S16 và mục 9) – lời “Đại diện hội đồng” trong docs do chị Hà nói.
- Xưng “chị” với PM → lớn tuổi hơn PM; chuyên nghiệp, trung lập, hỏi thẳng nhưng không gay gắt.
- Đạo cụ đặc trưng: folder navy đựng phiếu đánh giá (`prop/folder_closed`); phiếu đánh giá dùng `prop/checklist_sheet`.
- Ngồi cạnh anh Minh ở bàn hội đồng (anh Minh ở bên phải chị trong khung hình, ngoài ô).

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
python3 tools/extract_anchors.py --manifest ha_sprite_manifest.json --sheets sheets --out build
```

Kết quả `build/sprites/ha/*.png`, `anim/*.png`, `anchors.json`, `animations.json`, `report.json`. Ghép với đồ vật: nạp `anchors.json` của cả bộ PM (có `prop/*`, `furn/*`) và bộ này, rồi `PMCompose.create(anchors, manifest, base)`.

---

## 4. Chấm neo theo ô

Ô có `[markers]` trong prompt được gắn đồ vật/nội thất trong manifest (`cells[].bind`); danh sách đầy đủ ở mục 6.

---

## 5. Mapping kịch bản → sprite

Tên trong bảng là **nhóm animation** (`ha/<nhóm>`) hoặc một ô cụ thể (`ha/<ô>_01`). `face_*` là chân dung hộp thoại (sheet D). Mũi tên `→` là chuỗi phát nối tiếp. Kịch bản gốc: `docs/KICH_BAN_ROLECRAFT_PM60.md`; thoại trong game: `THOAI_MAU.json`.

| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |
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

---

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc

File `HA_A_master.png`, lưới 8×7, prompt `prompts/HA_A_master.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `ha/portrait` | [portrait cell, see LAYOUT] calm professional smile, navy folder against the chest, a few sparkles |
| 2 | `ha/idle_01` | idle loop 1/4: upright poised stance, folder held against the chest with the left arm [markers: magenta = folder] |
| 3 | `ha/idle_02` | idle loop 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = folder] |
| 4 | `ha/idle_03` | idle loop 3/4: glancing at the wristwatch on the left wrist for a moment [markers: magenta = folder] |
| 5 | `ha/idle_back_01` | standing seen from behind (back view), folder in the left hand [markers: magenta = folder] |
| 6 | `ha/idle_04` | idle loop 4/4: slight exhale, calm observant face [markers: magenta = folder] |
| 7 | `ha/greet_01` | polite nod with a warm professional smile, free hand at the waist |
| 8 | `ha/greet_02` | hand lightly on the chest, introducing oneself: 'I'm from HR' |
| 9 | `ha/walk_01` | walk contact: left foot forward heel touching [markers: magenta = folder] |
| 10 | `ha/walk_02` | walk down: weight on left leg, knee bent [markers: magenta = folder] |
| 11 | `ha/walk_03` | walk passing: right leg passing the left [markers: magenta = folder] |
| 12 | `ha/walk_04` | walk up: rising on left toes [markers: magenta = folder] |
| 13 | `ha/walk_05` | walk contact: right foot forward heel touching [markers: magenta = folder] |
| 14 | `ha/walk_06` | walk down: weight on right leg, knee bent [markers: magenta = folder] |
| 15 | `ha/walk_07` | walk passing: left leg passing the right [markers: magenta = folder] |
| 16 | `ha/walk_08` | walk up: rising on right toes [markers: magenta = folder] |
| 17 | `ha/talk_01` | talking, right hand open at chest height, measured |
| 18 | `ha/talk_02` | talking, both hands slightly open, explaining a procedure |
| 19 | `ha/talk_03` | talking, index finger lightly raised, asking a pointed question |
| 20 | `ha/talk_04` | talking, hand returning down, small polite smile |
| 21 | `ha/listen_01` | listening, hands loosely clasped in front, neutral and attentive |
| 22 | `ha/listen_02` | listening, head tilted, one hand at the chin, evaluating |
| 23 | `ha/nod_01` | nodding, eyes half closed, noting it |
| 24 | `ha/nod_02` | nodding, chin lifted back up |
| 25 | `ha/sit_01` | standing next to the chair, about to sit, smoothing the blazer |
| 26 | `ha/sit_02` | lowering onto the chair [markers: cyan = seat] |
| 27 | `ha/sit_03` | seated upright, hands resting on the lap [markers: cyan = seat] |
| 28 | `ha/sit_04` | seated, legs crossed, hands folded on the knee, evaluating [markers: cyan = seat] |
| 29 | `ha/sit_05` | seated, leaning slightly forward, listening closely [markers: cyan = seat] |
| 30 | `ha/sit_06` | seated, writing in a notebook on the lap with a pen [markers: cyan = seat; magenta = notebook; green = pen] |
| 31 | `ha/sit_07` | seated, reading a phone held in the right hand [markers: cyan = seat; magenta = phone] |
| 32 | `ha/sit_08` | standing up from the chair, buttoning the blazer [markers: cyan = seat] |
| 33 | `ha/good_01` | approving small smile, soft nod, two golden sparkles |
| 34 | `ha/good_02` | impressed, eyebrows raised, small 'oh' mouth, exclamation mark |
| 35 | `ha/good_03` | warm smile, hands clasped in front |
| 36 | `ha/good_04` | soft laugh, hand near the mouth |
| 37 | `ha/applaud_01` | applauding politely, hands apart |
| 38 | `ha/applaud_02` | applauding politely, hands together |
| 39 | `ha/pleased_01` | pleased, chin slightly up, satisfied look |
| 40 | `ha/relieved_01` | relieved exhale, hand on the chest, small smile |
| 41 | `ha/neutral_01` | neutral poker face, hands clasped in front |
| 42 | `ha/serious_01` | serious, lips pressed, direct gaze |
| 43 | `ha/doubt_01` | skeptical raised eyebrow, small question mark |
| 44 | `ha/frown_01` | slight frown, 'the report left something out' |
| 45 | `ha/concern_01` | concerned, eyebrows tilted, hand at the collar |
| 46 | `ha/sigh_01` | quiet sigh, eyes closed, small grey puff |
| 47 | `ha/regret_01` | regretful, eyes lowered, hand on the chest |
| 48 | `ha/headshake_01` | slow small head shake, calm |
| 49 | `ha/think_01` | thinking, hand at the chin, looking up |
| 50 | `ha/think_02` | thinking, eyes closed, finger tapping the chin |
| 51 | `ha/watch_01` | raising the left wrist and checking the watch, 'you have ten minutes' |
| 52 | `ha/crossarms_01` | arms loosely crossed, neutral, waiting for an answer |
| 53 | `ha/front_hands_01` | hands folded in front, standing straight, formal |
| 54 | `ha/behind_01` | hands clasped behind the back, calm observing look |
| 55 | `ha/invite_01` | open palm toward the viewer, 'please begin' |
| 56 | `ha/point_01` | open hand gesturing forward, 'the floor is yours' |

### Sheet B – Cầm nắm, Final Review (hội đồng + phản biện), 4 kết thúc

File `HA_B_review_endings.png`, lưới 8×7, prompt `prompts/HA_B_review_endings.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `ha/doc_hold_01` | folder held in both hands at chest height [markers: magenta = folder] |
| 2 | `ha/doc_read_01` | reading the open folder held in both hands [markers: magenta = folder] |
| 3 | `ha/doc_read_02` | reading the open folder, flipping a page [markers: magenta = folder] |
| 4 | `ha/form_note_01` | writing on an evaluation form with a pen [markers: magenta = form; green = pen] |
| 5 | `ha/form_note_02` | underlining something on the form, thoughtful [markers: magenta = form; green = pen] |
| 6 | `ha/doc_raise_01` | raising a single page to show it [markers: magenta = page] |
| 7 | `ha/doc_give_01` | extending a closed folder forward with both hands [markers: magenta = folder] |
| 8 | `ha/doc_give_02` | folder handed over, hands returning, polite smile [markers: magenta = folder] |
| 9 | `ha/tab_hold_01` | holding the tablet at chest height with both hands [markers: magenta = tablet] |
| 10 | `ha/tab_read_01` | reading the tablet, calm [markers: magenta = tablet] |
| 11 | `ha/tab_present_01` | turning the tablet screen toward the viewer [markers: magenta = tablet] |
| 12 | `ha/tab_present_02` | tablet turned, pointing at the screen with the free hand [markers: magenta = tablet] |
| 13 | `ha/phone_read_01` | reading a message on the phone, neutral [markers: magenta = phone] |
| 14 | `ha/phone_type_01` | typing a message with the thumb [markers: magenta = phone] |
| 15 | `ha/phone_call_01` | phone at the ear, listening [markers: magenta = phone] |
| 16 | `ha/phone_pocket_01` | putting the phone back into the blazer pocket [markers: magenta = phone] |
| 17 | `ha/panel_intro_01` | seated, hand on the chest, introducing oneself to the PM [markers: cyan = seat] |
| 18 | `ha/panel_intro_02` | seated, open palm forward, 'please begin' [markers: cyan = seat] |
| 19 | `ha/panel_listen_01` | seated, listening, hands folded on the table [markers: cyan = seat] |
| 20 | `ha/panel_listen_02` | seated, listening, slight head tilt [markers: cyan = seat] |
| 21 | `ha/panel_note_01` | seated, writing notes on the evaluation form with a pen [markers: cyan = seat; magenta = pen] |
| 22 | `ha/panel_note_02` | seated, pausing the pen, looking up at the speaker [markers: cyan = seat; magenta = pen] |
| 23 | `ha/panel_frown_01` | seated, pen stopped, slight frown, 'something is missing' [markers: cyan = seat; magenta = pen] |
| 24 | `ha/panel_nod_01` | seated, approving nod, small smile [markers: cyan = seat] |
| 25 | `ha/panel_ask_01` | seated, asking a question with an open palm [markers: cyan = seat] |
| 26 | `ha/panel_ask_02` | seated, asking a follow-up, index finger raised [markers: cyan = seat] |
| 27 | `ha/panel_ask_03` | seated, leaning forward, probing 'what would you change?' [markers: cyan = seat] |
| 28 | `ha/panel_ask_04` | seated, three fingers raised, 'your three priorities?' [markers: cyan = seat] |
| 29 | `ha/panel_confer_01` | seated, turning to the right side to confer quietly with a colleague offscreen [markers: cyan = seat] |
| 30 | `ha/panel_confer_02` | seated, hand beside the mouth, whispering to the side [markers: cyan = seat] |
| 31 | `ha/panel_score_01` | seated, ticking a box on the evaluation form [markers: cyan = seat; magenta = pen] |
| 32 | `ha/panel_close_01` | seated, closing the folder on the table, decision made [markers: cyan = seat] |
| 33 | `ha/pass_smile_01` | standing, warm smile, 'congratulations' |
| 34 | `ha/pass_contract_01` | holding out the official contract folder with both hands [markers: magenta = folder] |
| 35 | `ha/pass_contract_02` | contract handed over, proud nod [markers: magenta = folder] |
| 36 | `ha/pass_shake_01` | reaching out the right hand for a congratulating handshake |
| 37 | `ha/pass_shake_02` | firm handshake, big smile |
| 38 | `ha/pass_roadmap_01` | presenting the management development roadmap on a tablet [markers: magenta = tablet] |
| 39 | `ha/pass_applaud_01` | applauding warmly, sparkles |
| 40 | `ha/pass_applaud_02` | applauding, small thumbs up, sparkles |
| 41 | `ha/extend_talk_01` | standing, calm serious explanation |
| 42 | `ha/extend_goals_01` | handing over a sheet of goals and criteria [markers: magenta = form] |
| 43 | `ha/extend_count_01` | counting the evaluation criteria on the fingers |
| 44 | `ha/extend_encourage_01` | small encouraging fist, kind smile, 'you can do it' |
| 45 | `ha/fail_talk_01` | standing, regretful, hand on the chest, soft voice |
| 46 | `ha/fail_doc_01` | handing over the closing paperwork folder, sympathetic [markers: magenta = folder] |
| 47 | `ha/fail_pat_01` | sympathetic gesture toward an offscreen shoulder |
| 48 | `ha/fail_bow_01` | formal slight bow, respectful goodbye |
| 49 | `ha/invite_sit_01` | gesturing to an offscreen chair, 'please take a seat' |
| 50 | `ha/door_01` | gently gesturing toward a door on the LEFT, showing the way |
| 51 | `ha/reassure_01` | palms down, calm reassuring smile |
| 52 | `ha/wave_01` | small goodbye wave |
| 53 | `ha/coffee_01` | holding a coffee mug, relaxed [markers: magenta = mug] |
| 54 | `ha/coffee_02` | sipping the coffee, eyes closed [markers: magenta = mug] |
| 55 | `ha/badge_give_01` | holding out a royal-blue official staff badge on a lanyard [markers: magenta = badge] |
| 56 | `ha/badge_give_02` | badge handed over, proud smile [markers: magenta = badge] |

### Sheet D – 20 chân dung cảm xúc cho hộp thoại

File `HA_D_portraits.png`, lưới 4×5, prompt `prompts/HA_D_portraits.txt`.

| # | Tên | Mô tả |
|---|---|---|
| 1 | `ha/face_neutral` | neutral, composed poker face |
| 2 | `ha/face_polite_smile` | polite professional smile |
| 3 | `ha/face_warm` | warm friendly smile |
| 4 | `ha/face_pleased` | pleased, satisfied smile |
| 5 | `ha/face_laugh` | soft laugh, eyes closed |
| 6 | `ha/face_serious` | serious, straight mouth |
| 7 | `ha/face_probing` | probing, eyes slightly narrowed, leaning in |
| 8 | `ha/face_questioning` | questioning, index finger raised into the frame |
| 9 | `ha/face_skeptical` | one eyebrow raised, skeptical |
| 10 | `ha/face_thinking` | thinking, eyes looking up |
| 11 | `ha/face_impressed` | impressed, eyebrows up, small 'oh' |
| 12 | `ha/face_concerned` | concerned, eyebrows tilted |
| 13 | `ha/face_frown` | slight frown, displeased |
| 14 | `ha/face_sigh` | quiet sigh, eyes closed, small grey puff |
| 15 | `ha/face_regretful` | regretful, eyes lowered |
| 16 | `ha/face_sympathetic` | sympathetic, soft sad smile |
| 17 | `ha/face_encouraging` | encouraging, bright eyes, slight smile |
| 18 | `ha/face_congrats` | congratulating, big smile, sparkles |
| 19 | `ha/face_formal` | formal, blazer buttoned, neutral |
| 20 | `ha/face_tired` | tired, faint dark circles |

