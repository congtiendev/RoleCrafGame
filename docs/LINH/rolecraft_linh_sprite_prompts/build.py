# -*- coding: utf-8 -*-
# Bo prompt sprite LINH v4 (SALE – Sales Executive), cung khuon voi bo LAN / ANH HIEP / NAM v4.
# MOI O bam mot cau thoai hoac mot dien bien cua Linh trong docs/KICH_BAN_ROLECRAFT_PM60.md (xem SCENES):
# L3 S10 (ghe ban PM bao da hua tinh nang AI trong 10 ngay) va L4 S15 (hop mo rong hop tac, bao gia theo phase).
# Ve tay khong + cham neo; do vat / noi that / icon DUNG LAI sheet P, O, F cua PM. Linh quay PHAI nhu PM; game lat ca
# cum (flip) khi Linh dung doi dien PM. Nhan dien tu ANH THAT. Nen trong suot.
#     python build.py   -> prompts/LINH_*.txt, linh_sprite_manifest.json, SOL_ONE_SHOT_PROMPT.txt,
#                          mapping_section.md, README_LINH_SPRITE_PROMPTS.md (ca ban o docs/LINH/)
import copy, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT", HERE)

# ---------------------------------------------------------------- van ban chung (ngan, khong lap y)
WHO = ("Linh, the company's sales executive: energetic, charming and eager to close deals, sometimes promises clients "
       "more than the team can deliver")

ATTACH_A = ("ATTACHED IMAGES: Image 1 is a photo of a real person who agreed to become this character: the ONLY source "
"for the face. Image 2 is the master sheet of ANOTHER character (the young PM): use it ONLY for the grid layout, sprite "
"size, outline and shading; never copy the PM's face or clothes.")
ATTACH_MASTER = ("ATTACHED IMAGES: Image 1 is the approved master sheet of this character (Linh, Sheet A): match it "
"exactly (face, hair, outfit, colors, proportions, outline, shading, sprite size). Image 2 is the photo of the real "
"person: use it only to keep the face recognizable.")

IDENTITY = ("IDENTITY: keep the person in the photo clearly recognizable: face shape, eyes and eyebrows, nose and mouth, "
"hairstyle, hair length, color and parting, skin tone, and features such as glasses, moles or beard (glasses, if any, "
"in every cell). Stylize into the art style; do not trace the photo. Ignore the photo's background, pose, expression "
"and clothing.")

CHARACTER = ("CHARACTER (identical in every cell unless a row says otherwise): Linh, a woman around thirty, a few years older "
"than the PM, sharp and client-ready. Light sky-blue blouse with a soft collar; slim navy blazer worn open with a "
"small silver pin on the lapel; tan tailored trousers; polished brown low-heel loafers; small stud earrings; a shiny silver wristwatch on the left wrist; "
"royal-blue lanyard with a plain royal-blue ID badge card at the chest (blank, no text). About 2.5 heads tall, slightly "
"taller than the PM, big confident smile.")

STYLE = ("ART STYLE: cute chibi game sprite, soft high-resolution pixel art: big head, expressive glossy eyes, small nose "
"and mouth, short limbs, clean dark-brown outline (not pure black), soft cel shading, warm natural colors, top-left light. "
"Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, grey puff, "
"anger mark, exclamation or question mark) only where a cell asks for them, kept inside the cell.")

def LAYOUT(s):
    cols, rows = s["cols"], s["rows"]
    shape = "landscape 3:2 image" if s.get("aspect") == "3:2" else "square 1:1 image"
    t = (f"LAYOUT (most important): {shape}, fully TRANSPARENT background (PNG with alpha channel): no white, no color, "
         f"no checkerboard pattern painted in. Exactly {cols} columns x {rows} rows = {cols*rows} equal invisible cells, "
         "ONE full-body figure per cell (head to shoes, never cut), centred in its cell, same size in every cell, clear "
         "empty gap between neighbours; no arm, icon or shadow crosses a cell edge. In each row all feet rest on one shared "
         "baseline. Figures face RIGHT in a 3/4 view unless a cell says otherwise. Reading order left to right, top to "
         "bottom.")
    if s.get("portrait_first"):
        t += (" Cell 1 is the only exception: a head-and-shoulders portrait in a rounded-square frame with a thin dark "
              "outline and a soft pastel-blue background with a few sparkles; Linh with a big confident grin holding a "
              "smartphone near the chest. No other cell has a background or a drawn object.")
    return t

OBJECT_RULE = ("OBJECTS AND FURNITURE ARE ADDED BY CODE, SO NEVER DRAW THEM: no phone, tablet, page, pen, chair or table "
"(the worn lanyard badge, lapel pin and watch stay). Draw the empty hand(s) in the exact grip pose, and seated bodies at "
"the right height on an invisible chair. MARKER DOTS, only where a cell has a [markers] tag: small solid flat dots about "
"1.5% of the cell width drawn on top of the figure. MAGENTA #FF00FF = grip point of the main held object (two hands: "
"midway between them); GREEN #00FF00 = grip point of a second object in the other hand; CYAN #00FFFF = middle of the "
"hips where they touch the seat. Never use these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; add text, letters, numbers or watermark; draw grid lines or "
"cell borders; add scenery, floor or walls; add other characters (the PM, the client and the team are offscreen; phone "
"calls show only Linh); crop limbs; repeat an identical pose; change face, hair, outfit colors or proportions between cells.")

# ---------------------------------------------------------------- sheet A – master (co the, S10 dung o ban PM)
A = [
 ("Row 1 - Portrait + idle (smartphone held in the right hand)", [
  ("portrait", "[portrait cell, see LAYOUT]"),
  ("idle_01", "idle 1/4: relaxed confident stance"),
  ("idle_02", "idle 2/4: slight inhale, bouncing a little on the toes"),
  ("idle_03", "idle 3/4: glancing at the phone"),
  ("idle_04", "idle 4/4: slight exhale, confident grin"),
  ("idle_back_01", "seen from BEHIND (back view), standing"),
  ("greet_01", "energetic wave, 'hey!'"),
  ("greet_02", "finger-gun point with a wink")]),
 ("Row 2 - Walk cycle 8 frames, brisk bouncy pace, phone in the right hand, left arm swings", [
  ("walk_01", "contact: right foot forward, heel touching"), ("walk_02", "down: weight on right leg, knee bent"),
  ("walk_03", "passing: left leg passing the right"), ("walk_04", "up: rising on right toes"),
  ("walk_05", "contact: left foot forward, heel touching"), ("walk_06", "down: weight on left leg, knee bent"),
  ("walk_07", "passing: right leg passing the left"), ("walk_08", "up: rising on left toes")]),
 ("Row 3 - Leaving, handshake, high five (the other person is offscreen on the right)", [
  ("walk_back_01", "walking away seen from BEHIND, step 1, phone at the ear"),
  ("walk_back_02", "walking away from behind, step 2"),
  ("walk_back_03", "walking away from behind, step 3"),
  ("walk_back_04", "walking away from behind, step 4"),
  ("turn_01", "turning away, pointing back with a grin, 'leave it to me'"),
  ("shake_01", "reaching out the right hand for a handshake, big smile"),
  ("shake_02", "firm two-handed handshake, beaming"),
  ("highfive_01", "right hand raised for a high five, excited")]),
 ("Row 4 - Announcing the promise at the PM's desk", [
  ("announce_01", "phone raised high in the right hand, excited, 'deal closed!'"),
  ("announce_02", "arms spread wide, big grin, sparkles"),
  ("announce_03", "both hands up with all ten fingers spread, 'ten days!'"),
  ("phone_show_01", "turning the phone screen to the right, showing the client's message"),
  ("wink_01", "wink and thumbs up"),
  ("persuade_01", "hands pressed together, persuading, 'the team can do it'"),
  ("shrug_01", "palms up shrug, 'the client needs it'"),
  ("sheepish_01", "scratching the back of the head, sheepish grin, sweat drop")]),
 ("Row 5 - Reactions to the PM's answer", [
  ("cheer_01", "cheering, one fist up"),
  ("cheer_02", "both fists up, jumping slightly, sparkles"),
  ("shock_01", "shocked, eyebrows up, mouth open, exclamation mark"),
  ("offended_01", "offended, eyebrows up, lips pressed, hand on the chest"),
  ("angry_01", "hands on the hips, frowning, small anger mark"),
  ("calc_01", "one eye narrowed, calculating, finger at the chin"),
  ("agree_01", "pointing forward with a nod, 'OK, MVP first'"),
  ("relieved_01", "relieved exhale, hand wiping the forehead")]),
 ("Row 6 - Phone calls with the client and talking", [
  ("phone_call_01", "phone at the ear, charming smile, talking"),
  ("phone_call_02", "phone at the ear, free hand gesturing"),
  ("phone_nervous_01", "phone at the ear, nervous smile, two sweat drops, smoothing things over"),
  ("phone_type_01", "typing a message with the thumb, quick"),
  ("phone_read_01", "reading the phone, eyebrows up"),
  ("phone_pocket_01", "sliding the phone into the blazer pocket"),
  ("talk_01", "talking, right hand open at chest height"),
  ("talk_02", "talking, both hands open, enthusiastic")]),
 ("Row 7 - Invisible meeting chair at an invisible table on the RIGHT (same seat height in the seated cells), "
  "listening", [
  ("sit_01", "standing in front of the chair, about to sit"),
  ("sit_02", "lowering onto the chair"),
  ("sit_03", "seated upright, forearms on the table"),
  ("sit_04", "standing up from the chair"),
  ("listen_01", "standing, listening, hands in the pockets"),
  ("listen_02", "standing, listening, head tilted"),
  ("nod_01", "standing, nodding"), ("nod_02", "chin back up after the nod")]),
]

# ---------------------------------------------------------------- sheet C – hop mo rong hop tac S15 (8x3, anh ngang)
T = "seated at the invisible meeting table on the RIGHT, same seat height"
C = [
 (f"Row 1 - Expansion meeting, Day 56, opening ({T})", [
  ("meet_eager_01", "leaning forward, excited, 'great opportunity!'"),
  ("meet_eager_02", "open palm toward the team, 'confirm it so I can quote'"),
  ("meet_rub_01", "rubbing the hands together, smelling a deal"),
  ("meet_listen_01", "listening, forearms on the table"),
  ("meet_impatient_01", "drumming the fingers, impatient"),
  ("meet_impatient_02", "glancing at the wristwatch, impatient"),
  ("meet_frown_01", "frowning, arms crossed on the table"),
  ("meet_wait_01", "fingers laced on the table, waiting for the PM's answer")]),
 (f"Row 2 - Reactions to the PM's answer ({T})", [
  ("meet_celebrate_01", "fist pump, big grin"),
  ("meet_celebrate_02", "both hands open, delighted, sparkles"),
  ("meet_disappointed_01", "leaning back, disappointed, small grey puff"),
  ("meet_disappointed_02", "sighing, rubbing the neck"),
  ("meet_calc_01", "tapping numbers on the phone, calculating"),
  ("meet_think_01", "hand at the chin, thinking"),
  ("meet_talk_01", "talking with an open hand"),
  ("meet_talk_02", "leaning in, explaining")]),
 (f"Row 3 - Splitting the quote into phases and closing ({T})", [
  ("meet_quote_01", "writing figures on a page with a pen"),
  ("meet_quote_02", "holding two pages apart, one in each hand, 'phase 1, phase 2'"),
  ("meet_show_01", "turning a tablet toward the other side, showing the quote"),
  ("meet_show_02", "pointing at the tablet screen"),
  ("meet_pleased_01", "pleased smile, nodding"),
  ("meet_pleased_02", "thumbs up, confident"),
  ("meet_shake_01", "reaching across the table for a handshake"),
  ("meet_shake_02", "handshake across the table, beaming")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral", "neutral, friendly"), ("face_grin", "big confident grin"),
            ("face_wink", "wink with a smile"), ("face_excited", "excited, sparkling eyes")]),
 ("Row 2", [("face_laugh", "laughing, eyes closed"), ("face_charming", "charming saleswoman smile"),
            ("face_eager", "eager, leaning into the frame"), ("face_persuading", "persuading, eyebrows raised, hands pressed together")]),
 ("Row 3", [("face_thinking", "thinking, eyes looking up"), ("face_calculating", "calculating, one eye narrowed"),
            ("face_surprised", "surprised, eyebrows up, mouth open"), ("face_sheepish", "sheepish grin, sweat drop")]),
 ("Row 4", [("face_nervous", "nervous smile, two sweat drops"), ("face_frown", "frowning, displeased"),
            ("face_offended", "offended, eyebrows up, lips pressed"), ("face_disappointed", "disappointed, small grey puff")]),
 ("Row 5", [("face_relieved", "relieved, soft smile"), ("face_impatient", "impatient, eyes to the side"),
            ("face_apologetic", "apologetic, awkward smile"), ("face_proud", "proud, chin up")]),
]

SHEETS = [
 {"id": "A", "key": "master", "cols": 8, "rows": 7, "attach": "photo+pm", "grid": A, "portrait_first": True,
  "task": "framed portrait, idle, walk cycle, walking away, handshake and high five, announcing a promise, reactions, "
          "phone calls, sitting down and listening",
  "title": "Master: chân dung, đứng, đi, rời đi, bắt tay/đập tay, S10 báo tin – phản ứng, gọi điện, ngồi, nghe"},
 {"id": "C", "key": "meetings", "cols": 8, "rows": 3, "aspect": "3:2", "attach": "master", "grid": C,
  "task": "seated at a meeting table in the expansion meeting: pitching, reacting, splitting the quote into phases",
  "title": "Ngồi bàn họp S15: chào cơ hội, phản ứng, tách báo giá theo phase, chốt"},
 {"id": "D", "key": "portraits", "cols": 4, "rows": 5, "attach": "master", "grid": D, "portrait": True,
  "task": "20 framed facial-expression portraits for a dialogue box", "title": "20 chân dung hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua bo PM)
def P(id, at="grip", z="front"): return {"prop": id, "at": at, "z": z}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
MCHAIR, MTABLE = F("meeting_chair"), F("meeting_table", z="front")
TABLE = [MCHAIR, MTABLE]
PHONE = P("phone_back")
RULES = [  # (regex, bindings) – khop dau tien
 (r"^portrait$|^face_", []),
 (r"phone_show", [P("phone_screen")]),
 (r"^idle_|^walk_|^walk_back_|^turn_01$|^phone_|announce_01", [PHONE]),
 (r"^sit_01$", [F("meeting_chair", "beside")]),
 (r"meet_calc", TABLE + [PHONE]),
 (r"meet_quote_01", TABLE + [P("pen"), P("contract_sheet", "surface:meeting_table")]),
 (r"meet_quote_02", TABLE + [P("contract_sheet"), P("contract_sheet", "grip2")]),
 (r"meet_show", TABLE + [P("tablet_screen_34")]),
 (r"^sit_0[234]$|^meet_", TABLE),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green"}
WORD = {"phone": "phone", "tablet": "tablet", "pen": "pen", "contract": "page"}
def marker_tag(name):
    ms = []
    for x in bindings(name):
        if x["at"] == "seat" and "cyan = seat" not in ms: ms.append("cyan = seat")
        elif x["at"] in LABEL:
            ms.append(f"{LABEL[x['at']]} = {WORD.get(x['prop'].split('_')[0], x['prop'])}")
    return f" [markers: {'; '.join(ms)}]" if ms else ""

# ---------------------------------------------------------------- dung prompt
def cells(s):
    out, n = [], 0
    assert len(s["grid"]) == s["rows"], f"sheet {s['id']}: {len(s['grid'])} hang, can {s['rows']}"
    for r, (title, row) in enumerate(s["grid"]):
        assert len(row) == s["cols"], f"sheet {s['id']} {title}: {len(row)} o, can {s['cols']}"
        for c, (name, desc) in enumerate(row):
            n += 1
            out.append({"index": n, "row": r + 1, "col": c + 1, "name": name, "desc": desc})
    return out

def rows_text(s, tags=True):
    lines, n = [], 0
    for title, row in s["grid"]:
        parts = []
        for name, desc in row:
            n += 1
            parts.append(f"({n}) {desc}{marker_tag(name) if tags and name != 'portrait' else ''}")
        lines.append(f"{title}: " + "; ".join(parts) + ".")
    return "\n".join(lines)

def prompt(s):
    cols, rows = s["cols"], s["rows"]
    head = f"TASK: create a {cols}x{rows} chibi pixel-art game "
    attach = ATTACH_A if s["attach"] == "photo+pm" else ATTACH_MASTER
    if s.get("portrait"):
        return "\n\n".join([
            head + f"portrait sheet of {WHO}. Sheet content: {s['task']}.", attach, IDENTITY, CHARACTER, STYLE,
            f"LAYOUT: square 1:1, fully transparent background outside the frames (no white, no checkerboard). Exactly "
            f"{cols} columns x {rows} rows = {cols*rows} cells. Every cell is a head-and-shoulders portrait inside a "
            "rounded-square frame with a thin dark outline and a soft pastel-blue background, identical frame size and "
            "crop, exactly like cell 1 of the master sheet. Face the viewer, turned slightly right, hands empty unless an "
            "expression says otherwise. Frames never touch.",
            "EXPRESSIONS:\n" + rows_text(s, tags=False), NEG])
    return "\n\n".join([
        head + f"sprite sheet of {WHO}. Sheet content: {s['task']}.", attach, IDENTITY, CHARACTER, STYLE,
        LAYOUT(s), OBJECT_RULE, "CELLS:\n" + rows_text(s), NEG])

FPS = {"idle": (6, True), "walk": (11, True), "walk_back": (9, True), "greet": (6, False), "shake": (6, False),
       "announce": (6, False), "cheer": (8, True), "phone_call": (4, True), "talk": (6, True), "listen": (3, True),
       "nod": (6, False), "sit": (8, False), "meet_eager": (6, False), "meet_impatient": (4, True),
       "meet_celebrate": (6, False), "meet_disappointed": (4, False), "meet_talk": (6, True), "meet_quote": (5, False),
       "meet_show": (6, False), "meet_pleased": (6, False), "meet_shake": (6, False)}

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

# ---------------------------------------------------------------- bam kich ban: MOI O phai co mat o day
# (canh, nhip, thoai / dien bien theo docs/KICH_BAN_ROLECRAFT_PM60.md, chuoi animation va chan dung)
SCENES = [
 ("L3 S10 Sales hứa 10 ngày", "Vào cảnh", "Dẫn truyện: Ngày 37 · Linh ghé qua bàn PM.", "walk → greet_01 · face_grin"),
 ("L3 S10 Sales hứa 10 ngày", "Mở cảnh", "Linh: “Chị chốt với khách rồi: tính năng AI xong trong mười ngày!”", "announce → phone_show_01 → wink_01 · face_excited → face_wink"),
 ("L3 S10 Sales hứa 10 ngày", "", "PM: “Mười ngày? Team còn chưa được hỏi!”", "shrug_01 → persuade_01 → sheepish_01 · face_persuading → face_sheepish"),
 ("L3 S10 Sales hứa 10 ngày", "Câu hỏi", "PM đang chọn (Anh Minh, Huy có mặt)", "listen → idle · face_neutral"),
 ("L3 S10 Sales hứa 10 ngày", "A", "PM: “Nhận. Cả team chạy nước rút mười ngày.”", "cheer → highfive_01 · face_laugh"),
 ("L3 S10 Sales hứa 10 ngày", "B", "PM: “Anh Hiệp, bên Sales đã hứa sai, mười ngày là không khả thi.”", "shock_01 → offended_01 → angry_01 · face_surprised → face_offended → face_frown"),
 ("L3 S10 Sales hứa 10 ngày", "B → gọi khách chữa cháy", "", "phone_call_01 → phone_nervous_01 · face_nervous → face_apologetic"),
 ("L3 S10 Sales hứa 10 ngày", "C", "PM: “Mười ngày bên em giao MVP, phase 2 có estimate cụ thể.”", "calc_01 → agree_01 → nod · face_calculating"),
 ("L3 S10 Sales hứa 10 ngày", "C → báo lại khách", "", "phone_call_02 → phone_type_01 → relieved_01 · face_relieved"),
 ("L3 S10 Sales hứa 10 ngày", "Rời cảnh", "", "phone_pocket_01 → turn_01 → idle_back_01 → walk_back"),
 ("L4 S15 Mở rộng hợp tác", "Vào phòng", "Ngày 56 · Phòng họp với khách hàng", "walk → greet_02 → shake → sit_01 → sit_02 → sit_03 · face_charming"),
 ("L4 S15 Mở rộng hợp tác", "Mở cảnh", "Anh Hiệp muốn mở rộng module báo cáo · Linh: “Cơ hội tốt! Team xác nhận để chị làm báo giá nhé.”", "meet_eager → meet_rub_01 · face_eager"),
 ("L4 S15 Mở rộng hợp tác", "", "Lan: “Phạm vi mới chỉ là mong muốn, chưa có tiêu chí nghiệm thu.”", "meet_listen_01 → meet_impatient · face_impatient"),
 ("L4 S15 Mở rộng hợp tác", "large_project_without_resources", "Huy: “Team đang chia nguồn lực cho dự án lớn vừa nhận…”", "meet_frown_01 · face_frown"),
 ("L4 S15 Mở rộng hợp tác", "Câu hỏi", "PM: “Cơ hội lớn, nhưng nhận thế nào cho an toàn?”", "meet_wait_01 · face_thinking"),
 ("L4 S15 Mở rộng hợp tác", "A", "PM nhận toàn bộ (budget +25)", "meet_celebrate → meet_calc_01 · face_excited"),
 ("L4 S15 Mở rộng hợp tác", "B", "Khảo sát ba ngày rồi gửi roadmap", "meet_disappointed · face_disappointed"),
 ("L4 S15 Mở rộng hợp tác", "C", "Linh: “Chị tách báo giá theo từng phase cho khách dễ duyệt.”", "meet_think_01 → meet_talk → meet_quote → meet_show · face_thinking → face_proud"),
 ("L4 S15 Mở rộng hợp tác", "C → khách đồng ý", "", "meet_pleased → meet_shake · face_proud"),
 ("L4 S15 Mở rộng hợp tác", "Rời phòng", "", "sit_04 → shake → phone_read_01 → talk → turn_01 → walk_back"),
]
NOTE = ("Linh chỉ có ở L3 S10 và L4 S15 (kịch bản mục 2), nên không có làm đêm, sự cố, 1-1 hay màn kết thúc. Mọi ô trong "
        "các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).")

def anim_refs(text):
    refs = []
    for part in text.replace("·", "→").replace("/", "→").replace("(", " ").replace(")", " ").split("→"):
        for tok in part.split():
            if re.fullmatch(r"[a-z][a-z0-9_]+", tok): refs.append(tok)
    return refs

# ---------------------------------------------------------------- SOL one-shot (toi uu token)
SOL = """Work autonomously. Do not ask questions. Keep chat output short.

GOAL: sprite sheets A, C, D for the game character "Linh – sales executive".

ATTACHMENTS
1. The photo of the real person (who agreed to this): face source.
2. PM_A_master.png – another character's master sheet: grid, size and style reference only.
3. rolecraft_linh_sprite_prompts.zip – prompts/LINH_*.txt, linh_sprite_manifest.json, tools/.
Props, furniture and icons already exist in the PM set: never generate them.

TOKEN BUDGET RULES (follow strictly)
- Always ask the image tool for a TRANSPARENT background (PNG with alpha). If a sheet still comes back on plain white, do NOT regenerate it: remove the white with tools/make_transparent.py (step below).
- One image call per sheet, using the prompt file text EXACTLY. Do not rewrite, shorten or "improve" prompts. Sheet C is a landscape 3:2 image; A and D are square.
- Regenerate a whole sheet ONLY for a HARD FAIL: wrong grid (not the stated columns x rows), figures overlapping or cut off, a face that does not resemble the photo, drawn objects/furniture in many cells, visible text, or a checkerboard pattern / scenery painted as the background. Maximum 1 retry per sheet; keep the better of the two.
- On a retry, append this line to the prompt and nothing else: "GRID CHECK: exactly the stated columns and rows, one figure per cell, nothing crosses a cell edge."
- Everything else is a SOFT issue (a pose slightly off, a missing or extra dot, small color drift): do not regenerate, just list it.
- Never regenerate a sheet that passed. Never regenerate A after C has started.
- Do not describe images or repeat prompts in chat. After each sheet print one line: `<sheet> | attempts | PASS / FAIL: reason`.

STEPS
1. Unzip; read the manifest (file names) and prompts.
2. Sheet A: LINH_A_master.txt with Image 1 = the photo, Image 2 = PM_A_master.png.
3. Sheets C, D: their prompt files with Image 1 = approved LINH_A_master.png, Image 2 = the photo.
4. Save to sheets/ with the manifest file names. Make every saved sheet transparent (no image call needed):
   python3 tools/make_transparent.py sheets/*.png
   Then run once:
   python3 tools/extract_anchors.py --manifest linh_sprite_manifest.json --sheets sheets --out build
5. Read build/report.json. Only for a ROW where 3 or more cells report "missing ... marker", make ONE edit call on that sheet with the ROW FIX prompt below (max 2 row fixes in total for the whole job), then run the script once more. Leave all other warnings as they are.
6. DELIVER: show the final sheets; one file rolecraft_linh_sprites.zip with sheets/, build/, linh_sprite_manifest.json, tools/pm_compose.js; a table: sheet, attempts, result, remaining warnings.

ROW FIX PROMPT (Image 1 = LINH_A_master.png, Image 2 = the sheet to fix):
"Edit Image 2: redraw ONLY row {N}; keep every other row pixel-identical. Same character as Image 1. Draw no objects or furniture: empty hands in the grip pose. Add the marker dots exactly as tagged: {paste the Row N line from the prompt file}. Dots are small solid flat circles: MAGENTA #FF00FF, GREEN #00FF00, CYAN #00FFFF."

If you run out of room, stop after the last finished step and write: "Resume from step X."
"""

# ---------------------------------------------------------------- README
def cell_table(s):
    L = ["| # | Tên | Mô tả |", "|---:|---|---|"]
    for c in cells(s):
        tag = "" if s.get("portrait") or c["name"] == "portrait" else marker_tag(c["name"])
        L.append(f"| {c['index']} | `linh/{c['name']}` | {c['desc']}{tag} |")
    return L

KNOWN = set()
def mapping_md():
    L = ["Tên là **nhóm animation** `linh/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `linh/<ô>_01`; `face_*` là chân dung "
         "hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi "
         "“Linh:” là phản ứng của Linh khi người khác nói hoặc theo kết quả lựa chọn.", "",
         "| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anim in SCENES:
        a = re.sub(r"\b([a-z][a-z0-9_]{2,})\b", lambda m: f"`{m.group(1)}`" if m.group(1) in KNOWN else m.group(1), anim)
        L.append(f"| {sc} | {beat} | {line} | {a} |")
    L += ["", NOTE]
    return "\n".join(L)

def readme(man):
    n_cells = sum(len(s["cells"]) for s in man["sheets"])
    L = ["# RoleCraft PM60 – Bộ prompt sprite Linh v4 (Sales Executive)", "",
         "Sinh bởi `rolecraft_linh_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.", "",
         f"**{len(man['sheets'])} sheet / {n_cells} ô / {len(man['animations'])} animation.** Mỗi ô gắn với một câu thoại "
         "hoặc diễn biến của Linh trong kịch bản (mục 5). Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM.", "",
         "## Thiết kế", "",
         "- **Tạo hình:** nữ nhân viên kinh doanh khoảng 30 tuổi (xưng “chị” với PM), áo sơ mi nữ xanh da trời, bông tai nhỏ, blazer navy có ghim bạc, quần âu kaki, giày "
         "lười gót thấp nâu, đồng hồ bạc, thẻ xanh royal. Vật đặc trưng: điện thoại (luôn nói chuyện với khách).",
         "- **Theo kịch bản:** S10 ghé bàn PM báo đã hứa tính năng AI trong 10 ngày, phản ứng theo nhánh A/B/C (vui, bị "
         "“bóc” trước khách rồi gọi chữa cháy, chấp nhận MVP rồi báo lại khách); S15 họp mở rộng, tách báo giá theo phase.",
         "- **Quay PHẢI** như PM; khi đứng đối diện PM thì game lật cả cụm (`flip: true`).",
         "- **Sheet:** A (8×7), C (8×3, ảnh ngang 3:2 – không độn ô), D (4×5). Nền trong suốt; quy tắc tiết kiệm token "
         "trong `SOL_ONE_SHOT_PROMPT.txt`.",
         "- **Thay bản cũ:** bản cũ quay trái + bind `beside_left` (không ghép được), mapping theo kịch bản chi tiết cũ.", "",
         "## 1. Thứ tự sinh và ảnh đính kèm", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    att = {"photo+pm": "ảnh thật + `PM_A_master.png`", "master": "`LINH_A` đã duyệt + ảnh thật"}
    for s in SHEETS:
        L.append(f"| {s['id']} ({s['cols']}×{s['rows']}) | `prompts/LINH_{s['id']}_{s['key']}.txt` | {att[s['attach']]} | {s['title']} |")
    L += ["", "**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip "
          "thư mục `rolecraft_linh_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Mỗi sheet 1 lần sinh, chỉ "
          "sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả); nền "
          "trắng thì chỉ chạy `tools/make_transparent.py`; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.", "",
          "**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm C, D.", "",
          "## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)", "",
          "> ✅ Đúng lưới (A: 8×7 vuông; C: 8×3 ảnh ngang; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, "
          "**nền trong suốt** (không trắng, không ô caro vẽ giả).",
          ">",
          "> ✅ Nhận ra người thật; áo sơ mi nữ xanh da trời, blazer navy, thẻ xanh royal; ô 1 sheet A là chân dung khung xanh nhạt.",
          ">",
          "> ✅ Không vẽ điện thoại, tablet, giấy, ghế, bàn (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.",
          ">",
          "> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.", "",
          "## 3. Dùng tool", "",
          "```bash",
          "cd docs/LINH/rolecraft_linh_sprite_prompts",
          "python3 tools/make_transparent.py sheets/*.png",
          "python3 tools/extract_anchors.py --manifest linh_sprite_manifest.json --sheets sheets --out build",
          "```", "",
          "Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`linh/*`), "
          "rồi `PMCompose.create(anchors, manifest, base)`.", "",
          "## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)", "",
          "| Nhóm tư thế | Đồ vật | Nội thất |", "|---|---|---|",
          "| idle, walk, walk_back, turn_01, announce_01, phone_* | phone_back | |",
          "| phone_show_01 | phone_screen (vẽ tin nhắn của khách lên màn hình) | |",
          "| sit_01 | | meeting_chair (bên phải) |",
          "| sit_02–04, meet_* | | meeting_chair + meeting_table |",
          "| meet_calc_01 | phone_back | meeting_chair + meeting_table |",
          "| meet_quote_01 / meet_quote_02 | pen + contract_sheet trên bàn / hai contract_sheet trên tay | meeting_chair + meeting_table |",
          "| meet_show | tablet_screen_34 (vẽ báo giá lên màn hình) | meeting_chair + meeting_table |", "",
          "## 5. Mapping kịch bản → sprite", "", mapping_md(), "",
          "## 6. Chi tiết từng sheet", ""]
    for s in SHEETS:
        L += [f"### Sheet {s['id']} – {s['title']}", ""] + cell_table(s) + [""]
    return "\n".join(L)

# ---------------------------------------------------------------- main
def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    for f in os.listdir(f"{OUT}/prompts"):
        if f.startswith("LINH_") and f.endswith(".txt"): os.remove(f"{OUT}/prompts/{f}")
    man = {"version": 4, "character": {"id": "LINH", "role": "SALE", "name": "Linh – Sales Executive"},
           "shared": {"note": "prop/*, furn/*, icon/* dùng lại sheet P, O, F của bộ PM (docs/PM)"},
           "facing": "right",
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/LINH_{s['id']}_{s['key']}.txt", "w", encoding="utf-8").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"linh/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        sh = {"id": s["id"], "key": s["key"], "kind": "linh", "file": f"LINH_{s['id']}_{s['key']}.png",
              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl}
        if s.get("aspect"): sh["aspect"] = s["aspect"]
        man["sheets"].append(sh)
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (6, False) if len(fr) > 1 else (1, False))
            man["animations"][f"linh/{k}"] = {"frames": [f"linh/{f}" for f in fr], "fps": fps, "loop": loop}
    KNOWN.update(k.split("/")[1] for k in man["animations"]); KNOWN.update(seen)
    used = set()
    for *_, anim in SCENES:                                       # moi tham chieu phai ton tai ...
        for r in anim_refs(anim):
            if "_" in r or r in KNOWN:
                assert r in KNOWN, f"mapping tro toi animation khong co: {r}"
                used.add(r)
    grp = lambda n: re.sub(r"_\d\d$", "", n)
    unused = sorted(n for n in seen if n != "portrait" and n not in used and grp(n) not in used)
    assert not unused, f"o khong gan voi canh nao trong kich ban: {unused}"   # ... va moi o phai duoc dung
    pm = json.load(open(os.path.join(HERE, "..", "..", "PM", "rolecraft_pm_sprite_prompts", "pm_sprite_manifest.json"),
                        encoding="utf-8"))
    have = {c["key"] for s in pm["sheets"] for c in s["cells"]}
    for s in man["sheets"]:
        for c in s["cells"]:
            for b in c.get("bind", []):
                k = f"prop/{b['prop']}" if "prop" in b else f"furn/{b['furniture']}"
                assert k in have, f"{c['key']}: khong co {k} trong bo PM"
    json.dump(man, open(f"{OUT}/linh_sprite_manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(f"{OUT}/SOL_ONE_SHOT_PROMPT.txt", "w", encoding="utf-8").write(SOL)
    open(f"{OUT}/mapping_section.md", "w", encoding="utf-8").write(mapping_md() + "\n")
    md = readme(man)
    for p in (f"{OUT}/README_LINH_SPRITE_PROMPTS.md", os.path.join(OUT, "..", "README_LINH_SPRITE_PROMPTS.md")):
        open(p, "w", encoding="utf-8").write(md + "\n")
    n = sum(len(s["cells"]) for s in man["sheets"])
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} dong mapping, 0 o thua")

if __name__ == "__main__":
    main()
