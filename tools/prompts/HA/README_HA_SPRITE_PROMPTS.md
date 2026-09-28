# RoleCraft PM60 – Bộ prompt sprite Chị Hà v4 (HR)

Sinh bởi `rolecraft_ha_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.

**3 sheet / 92 ô / 40 animation.** Mỗi ô gắn với một câu thoại hoặc diễn biến của Chị Hà trong kịch bản (mục 5). Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM.

## Thiết kế

- **Tạo hình:** chuyên viên nhân sự khoảng 30–35 tuổi, áo blouse kem, blazer hồng đất cài một cúc, quần navy, giày gót thấp nâu, bông tai ngọc trai, đồng hồ vàng, thẻ xanh royal. Vật đặc trưng: folder navy đựng phiếu đánh giá.
- **Theo kịch bản:** S16 ngồi bàn đánh giá cạnh Anh Minh (mở đầu, đọc báo cáo, phản ứng theo nhánh A/B/C và hậu quả trước review, 4 câu hỏi phản biện, trao đổi với Anh Minh); 4 màn kết thúc đứng (trao hợp đồng + lộ trình, trao hợp đồng, trao mục tiêu gia hạn, hỗ trợ thủ tục kết thúc).
- **Quay PHẢI** như PM; khi ngồi đối diện PM thì game lật cả cụm (`flip: true`).
- **Sheet:** A (8×6), C (8×3, ảnh ngang 3:2 – không độn ô), D (4×5). Nền trong suốt; quy tắc tiết kiệm token trong `SOL_ONE_SHOT_PROMPT.txt`.
- **Thay bản cũ:** bản cũ quay trái + bind `beside_left` (không ghép được); chân dung `face_tired` (không có cảnh nào) đổi thành `face_listening`.

## 1. Thứ tự sinh và ảnh đính kèm

| Sheet | File prompt | Đính kèm | Nội dung |
|---|---|---|---|
| A (8×6) | `prompts/HA_A_master.txt` | ảnh thật + `PM_A_master.png` | Master: chân dung, đứng, đi, rời đi, ngồi bàn đánh giá, 4 màn kết thúc (đứng), nói/nghe |
| C (8×3) | `prompts/HA_C_review.txt` | `HA_A` đã duyệt + ảnh thật | Ngồi bàn Final Review S16: mở đầu, phản ứng báo cáo, 4 câu hỏi phản biện, trao đổi với Anh Minh |
| D (4×5) | `prompts/HA_D_portraits.txt` | `HA_A` đã duyệt + ảnh thật | 20 chân dung hộp thoại |

**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip thư mục `rolecraft_ha_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Mỗi sheet 1 lần sinh, chỉ sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả); nền trắng thì chỉ chạy `tools/make_transparent.py`; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.

**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm C, D.

## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)

> ✅ Đúng lưới (A: 8×6 vuông; C: 8×3 ảnh ngang; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, **nền trong suốt** (không trắng, không ô caro vẽ giả).
>
> ✅ Nhận ra người thật; blazer hồng đất, blouse kem, thẻ xanh royal; ô 1 sheet A là chân dung khung xanh nhạt.
>
> ✅ Không vẽ folder, giấy, bút, ghế, bàn (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.
>
> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.

## 3. Dùng tool

```bash
cd tools/prompts/HA
python3 tools/make_transparent.py sheets/*.png
python3 tools/extract_anchors.py --manifest ha_sprite_manifest.json --sheets sheets --out build
```

Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`ha/*`), rồi `PMCompose.create(anchors, manifest, base)`.

## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)

| Nhóm tư thế | Đồ vật | Nội thất |
|---|---|---|
| idle, walk, walk_back, turn_01, contract_give_01 | folder_closed | |
| roadmap_show_01 / goals_* / procedure_give_01 | folder_open / contract_sheet / paper_stack | |
| sit_01 | | meeting_chair (bên phải) |
| sit_02, sit_03, panel_* | | meeting_chair + meeting_table |
| panel_note / panel_tick, panel_evidence | pen + notebook_open / checklist_sheet trên bàn | meeting_chair + meeting_table |
| panel_read, panel_flip / panel_point, panel_warn | folder_open trên tay / trên bàn | meeting_chair + meeting_table |

## 5. Mapping kịch bản → sprite

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

## 6. Chi tiết từng sheet

### Sheet A – Master: chân dung, đứng, đi, rời đi, ngồi bàn đánh giá, 4 màn kết thúc (đứng), nói/nghe

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `ha/portrait` | [portrait cell, see LAYOUT] |
| 2 | `ha/idle_01` | idle 1/4: upright, composed [markers: magenta = folder] |
| 3 | `ha/idle_02` | idle 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = folder] |
| 4 | `ha/idle_03` | idle 3/4: glancing down at the folder [markers: magenta = folder] |
| 5 | `ha/idle_04` | idle 4/4: slight exhale, calm face [markers: magenta = folder] |
| 6 | `ha/idle_back_01` | seen from BEHIND (back view), standing [markers: magenta = folder] |
| 7 | `ha/greet_01` | polite nod with a professional smile |
| 8 | `ha/greet_02` | small respectful bow of the head |
| 9 | `ha/walk_01` | contact: right foot forward, heel touching [markers: magenta = folder] |
| 10 | `ha/walk_02` | down: weight on right leg, knee bent [markers: magenta = folder] |
| 11 | `ha/walk_03` | passing: left leg passing the right [markers: magenta = folder] |
| 12 | `ha/walk_04` | up: rising on right toes [markers: magenta = folder] |
| 13 | `ha/walk_05` | contact: left foot forward, heel touching [markers: magenta = folder] |
| 14 | `ha/walk_06` | down: weight on left leg, knee bent [markers: magenta = folder] |
| 15 | `ha/walk_07` | passing: right leg passing the left [markers: magenta = folder] |
| 16 | `ha/walk_08` | up: rising on left toes [markers: magenta = folder] |
| 17 | `ha/walk_back_01` | walking away seen from BEHIND, step 1, folder in the arm [markers: magenta = folder] |
| 18 | `ha/walk_back_02` | walking away from behind, step 2 [markers: magenta = folder] |
| 19 | `ha/walk_back_03` | walking away from behind, step 3 [markers: magenta = folder] |
| 20 | `ha/walk_back_04` | walking away from behind, step 4 [markers: magenta = folder] |
| 21 | `ha/turn_01` | turning away to leave, kind nod over the shoulder [markers: magenta = folder] |
| 22 | `ha/sit_01` | standing in front of the chair, about to sit |
| 23 | `ha/sit_02` | lowering onto the chair, smoothing the blazer [markers: cyan = seat] |
| 24 | `ha/sit_03` | standing up from the chair [markers: cyan = seat] |
| 25 | `ha/congrats_01` | applauding warmly, sparkles |
| 26 | `ha/congrats_02` | hands clasped in front, big congratulating smile |
| 27 | `ha/contract_give_01` | holding out a closed folder with the official contract with both hands [markers: magenta = folder] |
| 28 | `ha/contract_give_02` | folder handed over, hands returning, warm nod |
| 29 | `ha/roadmap_show_01` | holding an open folder toward the right, showing the management development path [markers: magenta = folder] |
| 30 | `ha/shake_01` | reaching out the right hand for a handshake |
| 31 | `ha/shake_02` | handshake, warm smile |
| 32 | `ha/pleased_01` | pleased smile, small nod, sparkles |
| 33 | `ha/goals_give_01` | holding out a single page of goals and criteria with both hands [markers: magenta = page] |
| 34 | `ha/goals_explain_01` | pointing at one line on the page, explaining calmly [markers: magenta = page] |
| 35 | `ha/encourage_01` | encouraging nod, one hand forward, 'focus on what is missing' |
| 36 | `ha/sympathetic_01` | hand on the chest, sympathetic soft sad smile |
| 37 | `ha/procedure_give_01` | holding out a small stack of papers for the procedures, gentle [markers: magenta = papers] |
| 38 | `ha/comfort_01` | gentle hand reaching toward an offscreen shoulder on the right |
| 39 | `ha/sigh_01` | quiet sigh, eyes closed, small grey puff |
| 40 | `ha/bow_01` | respectful slight bow, goodbye |
| 41 | `ha/talk_01` | talking, right hand open at chest height |
| 42 | `ha/talk_02` | talking, both hands slightly open |
| 43 | `ha/talk_03` | talking, index finger lightly raised |
| 44 | `ha/talk_04` | talking, hand returning down, small smile |
| 45 | `ha/listen_01` | listening, hands folded in front |
| 46 | `ha/listen_02` | listening, head tilted |
| 47 | `ha/nod_01` | nodding |
| 48 | `ha/nod_02` | chin back up after the nod |

### Sheet C – Ngồi bàn Final Review S16: mở đầu, phản ứng báo cáo, 4 câu hỏi phản biện, trao đổi với Anh Minh

| # | Tên | Mô tả |
|---:|---|---|
| 1 | `ha/panel_intro_01` | hand on the chest, introducing herself, 'I'm from HR' [markers: cyan = seat] |
| 2 | `ha/panel_intro_02` | open palm toward the other side, 'we'll evaluate your probation together' [markers: cyan = seat] |
| 3 | `ha/panel_listen_01` | listening attentively, hands folded on the table [markers: cyan = seat] |
| 4 | `ha/panel_listen_02` | listening, slight nod [markers: cyan = seat] |
| 5 | `ha/panel_note_01` | writing notes with a pen [markers: cyan = seat; magenta = pen] |
| 6 | `ha/panel_note_02` | writing, looking up to listen [markers: cyan = seat; magenta = pen] |
| 7 | `ha/panel_read_01` | reading the report in an open folder held in both hands [markers: cyan = seat; magenta = folder] |
| 8 | `ha/panel_flip_01` | flipping a page of the report [markers: cyan = seat; magenta = folder] |
| 9 | `ha/panel_frown_01` | slight frown, lips pressed, the report hides the incident [markers: cyan = seat] |
| 10 | `ha/panel_point_01` | tapping a page in the open folder on the table, 'nothing about the incident or the team's load' [markers: cyan = seat] |
| 11 | `ha/panel_consider_01` | neutral, considering, hand at the chin [markers: cyan = seat] |
| 12 | `ha/panel_impressed_01` | eyebrows up, pleasantly impressed [markers: cyan = seat] |
| 13 | `ha/panel_pleased_01` | pleased smile, small nod [markers: cyan = seat] |
| 14 | `ha/panel_warn_01` | tapping a line in the open folder with a concerned look, burnout warning [markers: cyan = seat] |
| 15 | `ha/panel_probe_01` | leaning in, probing, 'please explain this gap' [markers: cyan = seat] |
| 16 | `ha/panel_evidence_01` | satisfied nod, ticking a box on the form with a pen [markers: cyan = seat; magenta = pen] |
| 17 | `ha/panel_ask_01` | index finger raised, asking, 'which decision had the biggest impact?' [markers: cyan = seat] |
| 18 | `ha/panel_ask_02` | open palm up, asking, 'what would you change?' [markers: cyan = seat] |
| 19 | `ha/panel_ask_03` | fingers laced on the table, probing, 'can the team run without you?' [markers: cyan = seat] |
| 20 | `ha/panel_ask_04` | three fingers up, 'your three priorities for the next 90 days?' [markers: cyan = seat] |
| 21 | `ha/panel_think_01` | weighing the answer, eyes narrowed slightly [markers: cyan = seat] |
| 22 | `ha/panel_tick_01` | ticking the evaluation form with a pen [markers: cyan = seat; magenta = pen] |
| 23 | `ha/panel_confer_01` | turning toward the viewer to confer with the manager beside her [markers: cyan = seat] |
| 24 | `ha/panel_confer_02` | hand beside the mouth, speaking quietly to the manager [markers: cyan = seat] |

### Sheet D – 20 chân dung hộp thoại

| # | Tên | Mô tả |
|---:|---|---|
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
| 20 | `ha/face_listening` | attentive, listening, slight nod |

