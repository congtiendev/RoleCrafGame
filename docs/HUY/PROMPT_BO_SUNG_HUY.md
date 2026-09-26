# HUY – prompt tạo bổ sung ảnh

Đã nhập bộ `HUY_Sprite_Assets_Clean.zip` vào trang xem nhân vật (`import_characters.py`). Khi đo khung ô, có các lỗi sau:

| Sheet | Tình trạng | Hậu quả khi phát |
|---|---|---|
| **A master** | **Phải tạo lại.** Ảnh không xếp theo lưới 8×7: mỗi hàng có khoảng 9 hình, hàng 6–7 chồng lên nhau, hàng 5–7 nhiều hình chỉ có nửa người hoặc nằm. Thứ tự hình cũng không khớp tên ô trong manifest (ví dụ ô `idle_back_01` lại là hình cầm tablet). | 24 animation cơ bản (`idle`, `walk`, `talk`, `listen`, `nod`, `sit`, `good`, `applaud`, `annoyed`, `sigh`, `think`, `pocket`, `crossarms`, `warn`, `point`…) lấy nhầm hình, bị cụt chân, dính hình bên cạnh và nhấp nháy |
| B cử chỉ | Dùng được. Hàng 6 (`handover`, `doc_read`, `runbook_tick`, `mentor_*`, `delegate`) vẽ nhỏ và mảnh hơn các hàng khác. Ô 6,4 dính một mẩu tay của hình bên cạnh | Nhân vật co lại khi chuyển sang các animation này |
| C công việc | Dùng được. Hàng 6 (`lead`, `shake`, `farewell`) có cùng lỗi vẽ nhỏ | Như trên |
| D chân dung | Tốt | — |

**Tạm thời:** `import_characters.py` tách sheet A hiện tại theo từng hình và gán mỗi ô vào hình toàn thân gần nghĩa nhất (`BLOB_REMAP`, khóa theo md5 — thay A mới đúng lưới là tự bỏ). Hết nhấp nháy, cụt chân, nhưng nhiều hành động đang **dùng chung một hình đứng yên**:

| Dùng chung hình | Hành động |
|---|---|
| đứng thẳng | `idle` (4 khung giống nhau), `nod`, `pocket`, `lean` |
| tay chống cằm | `listen`, `sigh`, `scratch`, `think` |
| khoanh tay | `annoyed`, `frown`, `crossarms` |
| có ?/! | `doubt`, `worry` |
| vẫy vui | `good`, `applaud` |
| nói (1 hình) | `talk`, `defend` gần giống |
| ngồi (1 hình) | `sit` 2–8 |

So với PM, Huy còn thiếu nhóm di chuyển: đi ra khỏi cảnh / quay lưng đi (`leave`, `leave_back`), `run`, `stop`, đứng dậy khỏi ghế (`desk_stand`, `getup`). Nếu sân khấu cần cho Huy vào/ra cảnh thì thêm vào sheet A mới (thay hàng 1 ô 7–8 hoặc tạo sheet E).

Level 1 cần các animation sau của Huy từ sheet A: `talk` (P1_INTRO, S04), `nod` (S01-A), `good` và `pocket` (S01-B/C), `annoyed` (S02-A). Vì vậy **sheet A là thứ cần tạo trước tiên**.

---

## 1. Tạo lại `HUY_A_master.png` (bắt buộc)

**Đính kèm theo thứ tự:**
1. `HUY_B_hands_gestures.png`: nguồn nhận diện và trang phục (áo polo navy).
2. `HUY_D_portraits.png`: nguồn gương mặt và biểu cảm.
3. `sheets/PM_A_master.png`: chỉ dùng để tham chiếu bố cục lưới và cỡ sprite.

Không đính kèm ảnh người thật.

```text
TASK: create a 8x7 chibi pixel-art game sprite sheet of Huy, the team's senior backend developer — the fastest and most knowledgeable on the team, confident, likes to decide on his own, carries most of the critical work. Sheet content: framed portrait, idle, back view, walk cycle, talking and listening, sitting on a chair, and reactions.

ATTACHED IMAGES: Image 1 and Image 2 are the approved sprite sheets of THIS SAME character (Huy). They are the ONLY source for his face, hair, outfit, proportions, outline, shading and sprite size — copy them exactly. Image 3 is the master sheet of ANOTHER character (the young PM); use it ONLY as the layout reference: how 56 separate full-body figures sit in a strict 8x7 grid. Do not copy the PM's face or outfit.

CHARACTER (identical in every cell, exactly as in Image 1): short thick black hair, slightly messy, falling over the forehead; big dark-brown eyes; navy-blue short-sleeve polo shirt with a thin red trim on the collar and sleeve cuffs and a small white round logo on the left chest (no text); dark charcoal trousers; dark-brown shoes. Same head-to-body ratio and same total height as the standing figures in rows 1-5 of Image 1. Signature prop: a laptop. It is added later by code, so do NOT draw it (except in the framed portrait cell).

ART STYLE: exactly the style of Image 1: cute chibi game sprite, soft high-resolution pixel art, big head, clean dark-brown outline, soft cel shading, warm natural colors, top-left light. Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, small grey puff, exclamation mark, question mark) only where a cell asks for them.

LAYOUT — STRICT GRID, THIS IS THE MOST IMPORTANT RULE: one square 1:1 sprite sheet, fully TRANSPARENT background. Exactly 8 columns x 7 rows = 56 equal invisible cells, exactly ONE figure per cell, centred horizontally in its cell. Every figure is FULL BODY from the top of the hair to the soles of the shoes (never cut at the waist, never lying down across two cells). Leave a clear empty gap of at least 4% of the cell size between neighbouring figures and between rows; no arm, effect icon or shadow may cross into another cell. Same sprite size in every cell; within each row all feet rest on one shared baseline at the bottom of the cell. Figures face LEFT in a 3/4 view unless a cell says otherwise. Reading order: left to right, top to bottom. Cell 1 is special: a head-and-shoulders portrait inside a rounded-square frame with a thin dark outline and a soft pastel-blue background with a few sparkles, confident half-smile, a closed laptop under one arm. Cell 1 is the ONLY cell with a background.

OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites placed by code. Wherever a cell mentions a laptop, phone, chair or any other object, do NOT draw it; draw the empty hand(s) in the exact grip pose, and the body at the correct height as if on the invisible furniture. MARKER DOTS: small solid round dots about 1.5% of the cell width, flat color, no outline, drawn on top of the character. MAGENTA #FF00FF = grip point of the main held object. GREEN #00FF00 = grip point of a second object. CYAN #00FFFF = seat contact point (middle of the hips) for sitting poses. Draw only the dots listed in each cell's [markers] tag. Never use these three colors anywhere else.

CELLS:
Row 1 - Portrait + idle: (1) [portrait cell, see LAYOUT]; (2) idle loop 1/4: relaxed confident stance, arm bent as if holding a closed laptop against the left side [markers: magenta = laptop]; (3) idle loop 2/4: slight inhale, shoulders a tiny bit higher [markers: magenta = laptop]; (4) idle loop 3/4: rolling the neck a little, casual [markers: magenta = laptop]; (5) standing seen from BEHIND (back view), same laptop grip [markers: magenta = laptop]; (6) idle loop 4/4: slight exhale, calm self-assured face [markers: magenta = laptop]; (7) casual greeting, free hand raised briefly, half-smile; (8) two-finger salute from the brow, 'hey'.
Row 2 - Walk cycle 8 frames, quick confident pace, laptop grip on the left side, right arm swings, NO motion lines: (9) contact: left foot forward heel touching [markers: magenta = laptop]; (10) down: weight on left leg, knee bent [markers: magenta = laptop]; (11) passing: right leg passing the left [markers: magenta = laptop]; (12) up: rising on left toes [markers: magenta = laptop]; (13) contact: right foot forward heel touching [markers: magenta = laptop]; (14) down: weight on right leg, knee bent [markers: magenta = laptop]; (15) passing: left leg passing the right [markers: magenta = laptop]; (16) up: rising on right toes [markers: magenta = laptop].
Row 3 - Talking + listening (hands free, standing): (17) talking, right hand open at chest height, matter-of-fact; (18) talking, both hands shaping a box in the air; (19) talking with a small shrug, 'it's only a small change'; (20) talking, hand returning down, confident smile; (21) listening, hands in the trouser pockets; (22) listening, head tilted, hand rubbing the chin; (23) nodding, eyes half closed; (24) nodding, chin lifted back up.
Row 4 - Sit on an invisible office chair (same seat height in every sit cell, full body with legs and shoes visible): (25) standing next to the chair, about to sit; (26) dropping onto the chair [markers: cyan = seat]; (27) seated, leaning back, relaxed [markers: cyan = seat]; (28) seated, arms crossed, unconvinced [markers: cyan = seat]; (29) seated, leaning forward, elbows on the knees, fingers laced [markers: cyan = seat]; (30) seated, typing on a laptop on the lap [markers: cyan = seat; magenta = laptop]; (31) seated, reading a phone in the right hand [markers: cyan = seat; magenta = phone]; (32) standing up from the chair [markers: cyan = seat].
Row 5 - Positive reactions, standing full body: (33) satisfied smirk, small nod, two golden sparkles; (34) thumbs up with the right hand; (35) proud grin, arms crossed, chin up; (36) laughing, eyes closed, head tipped back; (37) applauding, hands apart; (38) applauding, hands together; (39) eyebrows raised, impressed, small exclamation mark; (40) relieved exhale, hand rubbing the back of the neck.
Row 6 - Defensive, annoyed and overloaded, standing full body: (41) both palms up at chest height, defensive; (42) annoyed, eyes rolling slightly, arms crossed; (43) frowning, jaw set, arms crossed tightly; (44) skeptical raised eyebrow, small question mark; (45) sighing, shoulders dropped, small grey puff; (46) scratching the back of the head; (47) both hands on the head, overloaded, sweat drops; (48) worried, hand on the back of the neck, one sweat drop.
Row 7 - Thinking + senior stances, standing full body: (49) hand on the chin, looking up; (50) eyes closed, finger tapping the temple; (51) both hands in the trouser pockets; (52) arms crossed, neutral; (53) arms crossed, small confident smile; (54) leaning back on one leg, one hand in a pocket; (55) index finger raised, serious warning; (56) pointing forward with an open hand, 'your call'.

DO NOT: put two figures in one cell; draw half-body, bust or lying poses; let any figure, icon or shadow cross a cell edge; draw grid lines, borders, text, letters, numbers or watermark; add scenery or floor; add other characters; crop limbs; change the face, hair, outfit colors or proportions between cells; use a white or colored background (except cell 1).
```

**Kiểm tra ảnh trước khi nhập:** đếm đủ 8 hình mỗi hàng. Không hình nào bị cắt ngang eo hay dính sang ô bên cạnh. Hàng 2 phải là 8 bước đi. Ô 5 phải là hình quay lưng. Nền phải trong suốt.

---

## 2. Sửa hàng 6 của B và C (không bắt buộc)

Sinh lại sheet bằng prompt gốc trong `rolecraft_huy_sprite_prompts/prompts/HUY_B_hands_gestures.txt` / `HUY_C_work_scenes.txt`, đính kèm `HUY_A_master.png` **mới**. Thêm đoạn sau vào cuối prompt:

```text
SCALE CHECK: every standing figure in every row — including row 6 — must have exactly the same height, head size and body width as the standing figures in rows 1-5. Row 6 must NOT be drawn smaller or slimmer. Leave a clear gap between neighbours so no hand or arm crosses into the next cell.
```

---

## 3. Nhập ảnh mới

1. Thay file trong zip, giữ nguyên tên: `HUY_Sprite_Pack/HUY_A_master.png` (và B, C nếu có sinh lại).
2. Chạy:

```bash
python3 import_characters.py   # mất vài phút
npm run build
```
