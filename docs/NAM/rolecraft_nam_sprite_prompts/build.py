# -*- coding: utf-8 -*-
# Bo prompt sprite NAM v4 (JUNIOR_DEV – Frontend Developer), cung khuon voi bo LAN / ANH HIEP v4.
# MOI O bam mot cau thoai hoac mot canh Nam co mat trong docs/KICH_BAN_ROLECRAFT_PM60.md (xem SCENES):
# L1 canh team (nen), L2 S05, S06, L3 S11, L4 S13, S14, co team_ot_14_days / junior_publicly_blamed /
# deployment_checklist_added. Ve tay khong + cham neo; do vat / noi that / icon DUNG LAI sheet P, O, F cua PM.
# Nam quay PHAI nhu PM de dung chung ghe, ban cua bo PM; game lat ca cum (flip) khi Nam dung doi dien PM.
# Nhan dien tu ANH THAT. Nen trong suot.
#     python build.py   -> prompts/NAM_*.txt, nam_sprite_manifest.json, SOL_ONE_SHOT_PROMPT.txt,
#                          mapping_section.md, README_NAM_SPRITE_PROMPTS.md (ca ban o docs/NAM/)
import copy, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT", HERE)

# ---------------------------------------------------------------- van ban chung (ngan, khong lap y)
WHO = ("Nam, the team's junior frontend developer: eager and hard-working but still inexperienced, easily worried, "
       "grows more confident after a serious mistake")

ATTACH_A = ("ATTACHED IMAGES: Image 1 is a photo of a real person who agreed to become this character: the ONLY source "
"for the face. Image 2 is the master sheet of ANOTHER character (the young PM): use it ONLY for the grid layout, sprite "
"size, outline and shading; never copy the PM's face or clothes.")
ATTACH_MASTER = ("ATTACHED IMAGES: Image 1 is the approved master sheet of this character (Nam, Sheet A): match it "
"exactly (face, hair, outfit, colors, proportions, outline, shading, sprite size). Image 2 is the photo of the real "
"person: use it only to keep the face recognizable.")

IDENTITY = ("IDENTITY: keep the person in the photo clearly recognizable: face shape, eyes and eyebrows, nose and mouth, "
"hairstyle, hair length, color and parting, skin tone, and features such as glasses, moles or earrings (glasses, if any, "
"in every cell). Stylize into the art style; do not trace the photo. Ignore the photo's background, pose, expression "
"and clothing.")

CHARACTER = ("CHARACTER (identical in every cell unless a row says otherwise): Nam, a young man in his early twenties, the "
"youngest on the team. Pastel lavender crew-neck sweater over a white collared shirt (collar visible); beige chino trousers; clean white "
"sneakers; slim black over-ear headphones resting around the neck (on the ears ONLY where a cell says so); royal-blue "
"lanyard with a plain royal-blue ID badge card at the chest (blank, no text). About 2.3 heads tall, slightly shorter and "
"slimmer than the PM, bright eager eyes.")

STYLE = ("ART STYLE: cute chibi game sprite, soft high-resolution pixel art: big head, expressive glossy eyes, small nose "
"and mouth, short limbs, clean dark-brown outline (not pure black), soft cel shading, warm natural colors, top-left light. "
"Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, tear drop, "
"grey puff, exclamation or question mark, Zzz) only where a cell asks for them, kept inside the cell.")

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
              "outline and a soft pastel-lavender background with a few sparkles; Nam with a bright eager smile hugging "
              "a closed slim silver laptop to the chest. No other cell has a background or a drawn object.")
    return t

OBJECT_RULE = ("OBJECTS AND FURNITURE ARE ADDED BY CODE, SO NEVER DRAW THEM: no laptop, checklist, pen, notebook, mug, "
"chair, desk, table, monitor or lamp (the worn headphones and lanyard badge stay). Draw the empty hand(s) in the exact "
"grip pose, and seated bodies at the right height on an invisible chair. MARKER DOTS, only where a cell has a [markers] "
"tag: small solid flat dots about 1.5% of the cell width drawn on top of the figure. MAGENTA #FF00FF = grip point of the "
"main held object (two hands: midway between them); GREEN #00FF00 = grip point of a second object in the other hand; "
"CYAN #00FFFF = middle of the hips where they touch the seat. Never use these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; add text, letters, numbers or watermark; draw grid lines or "
"cell borders; add scenery, floor or walls; add other characters (the PM, Huy, Lan or Anh Minh are offscreen); crop "
"limbs; repeat an identical pose; change face, hair, outfit colors or proportions between cells.")

# ---------------------------------------------------------------- sheet A – master (co the, cam xuc)
A = [
 ("Row 1 - Portrait + idle (closed laptop hugged against the chest)", [
  ("portrait", "[portrait cell, see LAYOUT]"),
  ("idle_01", "idle 1/4: upright, a little stiff and eager"),
  ("idle_02", "idle 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03", "idle 3/4: glancing around, curious"),
  ("idle_04", "idle 4/4: slight exhale, soft smile"),
  ("idle_back_01", "seen from BEHIND (back view), standing"),
  ("greet_01", "small shy wave at shoulder height"),
  ("greet_02", "quick polite bow of the head, bright smile")]),
 ("Row 2 - Walk cycle 8 frames, light quick steps, closed laptop hugged against the chest", [
  ("walk_01", "contact: right foot forward, heel touching"), ("walk_02", "down: weight on right leg, knee bent"),
  ("walk_03", "passing: left leg passing the right"), ("walk_04", "up: rising on right toes"),
  ("walk_05", "contact: left foot forward, heel touching"), ("walk_06", "down: weight on left leg, knee bent"),
  ("walk_07", "passing: right leg passing the left"), ("walk_08", "up: rising on left toes")]),
 ("Row 3 - Run cycle 8 frames, hurrying early in the morning to report a mistake, closed laptop clutched to the chest, "
  "panicked face, sweat drop", [
  ("run_01", "contact right foot"), ("run_02", "push-off from right foot"), ("run_03", "airborne, legs apart"),
  ("run_04", "landing on left foot"), ("run_05", "contact left foot"), ("run_06", "push-off from left foot"),
  ("run_07", "airborne, legs apart, mirrored"), ("run_08", "landing on right foot")]),
 ("Row 4 - Office chair (invisible; same seat height in the seated cells), shock and shrinking", [
  ("sit_01", "standing in front of the chair, about to sit"),
  ("sit_02", "lowering onto the chair"),
  ("sit_03", "seated upright, hands on the knees"),
  ("sit_04", "standing up from the chair, hands on the knees"),
  ("startle_01", "startled jump, eyes wide, both hands up, exclamation mark"),
  ("startle_02", "landing, both hands on the cheeks, 'oh no', sweat drops"),
  ("shrink_01", "shrinking, shoulders raised, head lowered, hands clasped tight"),
  ("shrink_02", "hugging the own arms, looking at the floor, small")]),
 ("Row 5 - Apologizing for the mistake and what comes after", [
  ("apologize_01", "polite bow, hands clasped in front, 'I'm so sorry'"),
  ("apologize_02", "deep bow, eyes shut, sweat drop"),
  ("sorry_talk_01", "hands clasped at the chest, teary eyes, speaking"),
  ("sorry_talk_02", "hands clasped at the chest, looking down, speaking quietly"),
  ("teary_01", "wiping one eye with the back of the hand, small tear drop"),
  ("hurt_01", "looking down, lip trembling, sweat drop, publicly blamed"),
  ("uneasy_01", "small relieved smile but rubbing the own arm, uneasy"),
  ("resolve_01", "both fists at the chest, determined to do better")]),
 ("Row 6 - Positive reactions", [
  ("good_01", "relieved smile, small nod, two golden sparkles"),
  ("good_02", "small fist pump, sparkles"),
  ("try_01", "small fist in front, brave smile, 'I'll try'"),
  ("eager_01", "raising one hand eagerly, 'I want to take this on'"),
  ("eager_02", "hand up, bright smile, sparkles"),
  ("happy_01", "both hands on the cheeks, happily surprised"),
  ("happy_02", "hands clasped under the chin, beaming"),
  ("thankful_01", "hand on the chest, grateful small bow")]),
 ("Row 7 - Worry and hesitation", [
  ("worry_01", "worried eyebrows, fingers touching the lips"),
  ("worry_02", "anxious, hands clasped at the chest, sweat drop"),
  ("hesitant_01", "fidgeting fingers, looking down"),
  ("hesitant_02", "rubbing the back of the neck, awkward smile"),
  ("confused_01", "head tilted, small question mark"),
  ("sigh_01", "small sigh, shoulders dropped, grey puff"),
  ("listen_01", "listening, hands clasped in front, attentive"),
  ("listen_02", "listening, head tilted, nodding slightly")]),
]

# ---------------------------------------------------------------- sheet B – laptop, checklist, ban, hop, 1-1
B = [
 ("Row 1 - Laptop (the signature prop)", [
  ("lap_carry_01", "closed laptop tucked under the left arm"),
  ("lap_hold_01", "open laptop balanced on the left forearm, looking at the screen"),
  ("lap_type_01", "typing on the balanced laptop"),
  ("lap_type_02", "typing, glancing up over the laptop"),
  ("lap_show_01", "turning the open laptop so its screen faces the viewer, showing the error"),
  ("lap_show_02", "laptop screen toward the viewer, pointing at it, apologetic"),
  ("lap_close_01", "closing the laptop slowly, dejected"),
  ("lap_hug_01", "hugging the closed laptop tightly, nervous")]),
 ("Row 2 - Talking (dialogue loop) and nodding", [
  ("talk_01", "talking, right hand open at chest height"),
  ("talk_02", "talking, both hands slightly open"),
  ("talk_03", "talking, index finger lightly raised"),
  ("talk_04", "talking, hand returning down, small smile"),
  ("nod_01", "nodding down"), ("nod_02", "chin back up after the nod"),
  ("proud_01", "holding up a finished checklist sheet with both hands, proud"),
  ("proud_02", "checklist hugged to the chest, confident small smile")]),
 ("Row 3 - Writing the deploy checklist and onboarding a new member (checklist in the left hand, pen in the right)", [
  ("check_write_01", "writing a step on the checklist"),
  ("check_write_02", "writing the next step, tongue slightly out, focused"),
  ("check_tick_01", "ticking an item"),
  ("check_read_01", "reading the checklist carefully"),
  ("check_point_01", "pointing at one step on the checklist, explaining to a newcomer offscreen on the right"),
  ("check_give_01", "handing the checklist forward with both hands, welcoming smile"),
  ("check_hold_01", "holding the checklist in both hands at chest height"),
  ("check_hug_01", "hugging the checklist, happy")]),
 ("Row 4 - Own desk by day (desk, monitor and office chair invisible; the desk is on the RIGHT; same seat height)", [
  ("desk_type_01", "typing frontend code"),
  ("desk_type_02", "typing, glancing at the monitor"),
  ("desk_focus_01", "headphones ON the ears, typing, focused"),
  ("desk_panic_01", "both hands on the head, staring at the monitor in panic, sweat drops"),
  ("desk_panic_02", "frozen, mouth open, exclamation mark"),
  ("desk_fix_01", "typing fast to restore the data, sweat drop"),
  ("desk_turn_01", "swiveled on the chair to face the viewer"),
  ("desk_stand_01", "pushing the chair back, starting to stand")]),
 ("Row 5 - Overtime at the desk at night (desk, lamp and chair invisible; warm lamp light from the right on the "
  "character only; background stays transparent)", [
  ("night_type_01", "typing late at night, tired eyes"),
  ("night_type_02", "typing, head drooping slightly"),
  ("night_rub_01", "rubbing the eyes with one hand"),
  ("night_yawn_01", "yawning, hand over the mouth"),
  ("night_coffee_01", "holding a mug, eyes on the monitor"),
  ("night_sleep_01", "asleep with the head on folded arms on the desk, small Zzz"),
  ("night_sleep_02", "asleep, slightly different breathing pose"),
  ("night_wake_01", "jolting awake, eyes wide")]),
 ("Row 6 - Seated at an invisible round meeting table on the RIGHT (same seat height)", [
  ("meet_table_listen_01", "listening, forearms on the table"),
  ("meet_table_listen_02", "listening, glancing at the others"),
  ("meet_table_talk_01", "talking with an open hand"),
  ("meet_table_talk_02", "talking, leaning in a little"),
  ("meet_table_worry_01", "worried, hands clasped on the table, sweat drop"),
  ("meet_table_note_01", "taking notes with a pen"),
  ("meet_table_raise_01", "raising one hand, volunteering"),
  ("meet_table_nod_01", "nodding, relieved")]),
 ("Row 7 - One-on-one on an invisible chair, no table", [
  ("oneone_listen_01", "listening, hands on the knees, a little tense"),
  ("oneone_nod_01", "nodding, taking it in"),
  ("oneone_sad_01", "looking down, hands squeezed between the knees, 'will the team still trust me?'"),
  ("oneone_fidget_01", "fidgeting with the lanyard, unsure"),
  ("oneone_talk_01", "talking, open hand"),
  ("oneone_proud_01", "holding up the deploy checklist, proud smile"),
  ("oneone_eager_01", "leaning forward, eager nod, 'with clear criteria I can track my progress'"),
  ("oneone_surprised_01", "happily surprised, both hands open, 'a module of my own?'")]),
]

# ---------------------------------------------------------------- sheet E – bien the kiet suc (8x3, anh ngang)
E = [
 ("Row 1 - OUTFIT FOR THIS ROW: same outfit after two weeks of overtime: hair messier, faint dark circles, sweater "
  "sleeves pushed up unevenly, collar crooked, headphones askew, slouched. Tired idle + tired talk", [
  ("tired_idle_01", "slouched idle 1/4, closed laptop hanging from one hand"),
  ("tired_idle_02", "slouched idle 2/4"), ("tired_idle_03", "slouched idle 3/4, eyes half closed"),
  ("tired_idle_04", "slouched idle 4/4"),
  ("tired_talk_01", "talking wearily, low hand gesture"), ("tired_talk_02", "talking, forced smile"),
  ("tired_talk_03", "talking, rubbing the neck"), ("tired_talk_04", "talking, sighing")]),
 ("Row 2 - Tired outfit as row 1. Tired walk cycle, dragging feet, closed laptop hanging from one hand", [
  ("tired_walk_01", "contact right"), ("tired_walk_02", "down"), ("tired_walk_03", "passing"),
  ("tired_walk_04", "up"), ("tired_walk_05", "contact left"), ("tired_walk_06", "down"),
  ("tired_walk_07", "passing"), ("tired_walk_08", "up")]),
 ("Row 3 - Tired outfit as row 1. Tired reactions", [
  ("tired_worry_01", "worried, hands clasped, 'if we speed up again I'm afraid quality will drop'"),
  ("tired_worry_02", "worried, looking aside"),
  ("tired_try_01", "forcing a small fist, tired smile, 'I'll try'"),
  ("weary_01", "rubbing the eyes"), ("weary_02", "long yawn"),
  ("weary_03", "holding a mug with both hands, faint dark circles"),
  ("exhausted_01", "head down, arms hanging, grey puff"),
  ("tired_sigh_01", "deep sigh, shoulders dropping")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral", "neutral"), ("face_eager", "eager, bright eyes"),
            ("face_happy", "happy smile"), ("face_proud", "proud smile")]),
 ("Row 2", [("face_shy", "shy smile, slight blush"), ("face_unsure", "unsure, small awkward smile"),
            ("face_confused", "confused, head tilted"), ("face_thinking", "thinking, eyes looking up")]),
 ("Row 3", [("face_worried", "worried, eyebrows tilted"), ("face_anxious", "anxious, biting the lip"),
            ("face_shocked", "shocked, mouth open"), ("face_panic", "panicking, sweat drops")]),
 ("Row 4", [("face_ashamed", "ashamed, eyes lowered"), ("face_sorry", "apologetic, eyes wet"),
            ("face_tired", "tired, dark circles"), ("face_relieved", "relieved exhale")]),
 ("Row 5", [("face_determined", "determined"), ("face_confident", "confident small smile"),
            ("face_thankful", "thankful, gentle smile"), ("face_hesitant", "hesitant, looking aside")]),
]

SHEETS = [
 {"id": "A", "key": "master", "cols": 8, "rows": 7, "attach": "photo+pm", "grid": A, "portrait_first": True,
  "task": "framed portrait, idle, back view, walk and run cycles, chair, shock, apologizing, positive reactions, "
          "worry and hesitation",
  "title": "Master: chân dung, đứng, đi, chạy, ngồi, hoảng hốt, xin lỗi, vui, lo lắng/ngập ngừng"},
 {"id": "B", "key": "work_scenes", "cols": 8, "rows": 7, "attach": "master", "grid": B,
  "task": "laptop, talking, writing a deploy checklist and onboarding, own desk, overtime at night, meeting table, "
          "one-on-one",
  "title": "Laptop, nói, checklist/onboarding, bàn làm việc ngày/đêm, bàn họp, 1-1"},
 {"id": "E", "key": "tired", "cols": 8, "rows": 3, "aspect": "3:2", "attach": "master", "grid": E,
  "task": "an exhausted variant after two weeks of overtime", "title": "Biến thể kiệt sức (team_ot_14_days)"},
 {"id": "D", "key": "portraits", "cols": 4, "rows": 5, "attach": "master", "grid": D, "portrait": True,
  "task": "20 framed facial-expression portraits for a dialogue box", "title": "20 chân dung hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua bo PM)
def P(id, at="grip", z="front"): return {"prop": id, "at": at, "z": z}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
CHAIR, MCHAIR = F("office_chair"), F("meeting_chair")
DESK, MTABLE = F("desk_monitor", z="front"), F("meeting_table", z="front")
LAPC, CHECK = P("laptop_closed"), P("checklist_sheet")
RULES = [  # (regex, bindings) – khop dau tien
 (r"^portrait$|^face_", []),
 (r"lap_carry", [P("laptop_closed", z="back")]),
 (r"^idle_|^walk_|^run_|lap_hug|^tired_idle|^tired_walk", [LAPC]),
 (r"lap_show", [P("laptop_open_front")]),
 (r"^lap_", [P("laptop_open_34")]),
 (r"check_(write|tick)", [P("checklist_sheet", "grip2"), P("pen")]),
 (r"^check_|^proud_", [CHECK]),
 (r"^sit_01$", [F("office_chair", "beside")]),
 (r"^sit_", [CHAIR]),
 (r"desk_turn", [CHAIR]),
 (r"^desk_", [CHAIR, DESK]),
 (r"night_coffee", [CHAIR, DESK, P("mug_steam")]),
 (r"^night_", [CHAIR, DESK, P("lamp_on", "surface:desk_monitor")]),
 (r"meet_table_note", [MCHAIR, MTABLE, P("pen"), P("notebook_open", "surface:meeting_table")]),
 (r"^meet_table_", [MCHAIR, MTABLE]),
 (r"oneone_proud", [MCHAIR, CHECK]),
 (r"^oneone_", [MCHAIR]),
 (r"weary_03", [P("mug_plain")]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green"}
WORD = {"laptop": "laptop", "checklist": "checklist", "pen": "pen", "mug": "mug", "notebook": "notebook"}
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
            "rounded-square frame with a thin dark outline and a soft pastel-lavender background, identical frame size "
            "and crop, exactly like cell 1 of the master sheet. Face the viewer, turned slightly right, hands empty. "
            "Frames never touch.",
            "EXPRESSIONS:\n" + rows_text(s, tags=False), NEG])
    return "\n\n".join([
        head + f"sprite sheet of {WHO}. Sheet content: {s['task']}.", attach, IDENTITY, CHARACTER, STYLE,
        LAYOUT(s), OBJECT_RULE, "CELLS:\n" + rows_text(s), NEG])

FPS = {"idle": (6, True), "walk": (10, True), "run": (14, True), "greet": (6, False), "sit": (8, False),
       "startle": (10, False), "shrink": (4, False), "apologize": (5, False), "sorry_talk": (4, True),
       "good": (6, False), "eager": (6, False), "happy": (6, False), "worry": (4, True), "hesitant": (4, True),
       "listen": (3, True), "lap_type": (8, True), "lap_show": (6, False), "talk": (6, True), "nod": (6, False),
       "proud": (6, False), "check_write": (6, True), "desk_type": (8, True), "desk_panic": (6, False),
       "night_type": (6, True), "night_sleep": (2, True), "meet_table_listen": (3, True),
       "meet_table_talk": (6, True), "tired_idle": (4, True), "tired_talk": (5, True), "tired_walk": (7, True),
       "tired_worry": (4, True), "weary": (4, False)}

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

# ---------------------------------------------------------------- bam kich ban: MOI O phai co mat o day
# (canh, nhip, thoai / dien bien theo docs/KICH_BAN_ROLECRAFT_PM60.md, chuoi animation va chan dung)
SCENES = [
 ("L1 Cảnh team", "Nền khu làm việc", "Nam (JUNIOR_DEV) có mặt ở khu team, không thoại; PM gặp team lần đầu", "desk_type → desk_focus_01 → desk_turn_01 → greet_01 · face_shy"),
 ("L1 Cảnh team", "Đi lại", "Vào / rời khu làm việc", "walk → idle → sit → desk_stand_01 → sit_04 → idle_back_01"),
 ("L2 S05 Hai dự án", "Mở cảnh", "Ngày 18 · Phòng họp nội bộ (Anh Minh, Huy nói)", "walk → lap_carry_01 → meet_table_listen · face_neutral"),
 ("L2 S05 Hai dự án", "A", "Thuê Freelancer (Huy: team vẫn mất thời gian onboarding)", "meet_table_nod_01 → good_01 · face_relieved"),
 ("L2 S05 Hai dự án", "B", "Nam: “Em sẽ cố, nhưng team đã căng từ đợt demo trước.”", "meet_table_worry_01 → meet_table_talk → try_01 · face_worried"),
 ("L2 S05 Hai dự án", "C", "Đàm phán lại ưu tiên với quản lý", "meet_table_nod_01 · face_relieved"),
 ("L2 S05 Hai dự án", "B → team_ot_14_days", "Dẫn truyện: Hai tuần OT liên tục. Cả team kiệt sức.", "night_type → night_coffee_01 → night_rub_01 → night_yawn_01 → night_sleep → night_wake_01 · face_tired; từ đây idle/talk/walk → tired_idle / tired_talk / tired_walk"),
 ("L2 S05 Hai dự án", "Áp lực OT", "", "weary → tired_try_01 → tired_sigh_01 → exhausted_01 · face_tired"),
 ("L2 S06 Deadline/chất lượng", "Mở cảnh + nhánh", "(JUNIOR_DEV có mặt; Huy, Anh Hiệp nói)", "meet_table_listen · A: worry_01 · face_anxious · B: meet_table_nod_01 · face_relieved · C: meet_table_note_01 · face_thinking"),
 ("L3 S11 Junior gây lỗi", "Trước cảnh", "Ngày 41 · sáng sớm, Nam phát hiện push nhầm code", "desk_type → desk_panic → startle_01 → startle_02 · face_shocked → face_panic"),
 ("L3 S11 Junior gây lỗi", "Chạy đi báo", "", "desk_stand_01 → run → lap_hold_01 → lap_show · face_panic"),
 ("L3 S11 Junior gây lỗi", "Mở cảnh", "Nam: “Em xin lỗi... em push nhầm code, dữ liệu test mất hết rồi.”", "apologize → sorry_talk → teary_01 · face_sorry"),
 ("L3 S11 Junior gây lỗi", "", "Lan: “Team sẽ mất gần một ngày để khôi phục.”", "lap_close_01 → lap_hug_01 → worry_02 · face_ashamed"),
 ("L3 S11 Junior gây lỗi", "A", "PM: “Mọi người nghe đây: lỗi lần này là do Nam!” → junior_publicly_blamed", "hurt_01 → shrink · face_ashamed"),
 ("L3 S11 Junior gây lỗi", "B", "PM: “Để mình xử lý nốt. Chuyện này bỏ qua nhé.”", "confused_01 → uneasy_01 · face_confused"),
 ("L3 S11 Junior gây lỗi", "C", "PM: “Nam, mình nói chuyện riêng, cùng tìm nguyên nhân rồi thêm checklist deploy.”", "oneone_listen_01 → oneone_nod_01 → oneone_talk_01 · face_thankful"),
 ("L3 S11 Junior gây lỗi", "C → khôi phục + checklist", "deployment_checklist_added", "desk_fix_01 → check_write → check_tick_01 → check_read_01 → resolve_01 · face_determined"),
 ("L4 S13 Hệ thống vận hành", "Mở cảnh", "(JUNIOR_DEV có mặt; Anh Minh, Lan nói)", "meet_table_listen · face_neutral"),
 ("L4 S13 Hệ thống vận hành", "A + team_ot_14_days", "Nam: “Team vừa trải qua một giai đoạn làm việc kéo dài. Nếu tiếp tục tăng tốc, em lo mọi người sẽ không giữ được chất lượng.”", "tired_worry · face_worried"),
 ("L4 S13 Hệ thống vận hành", "B", "Chuẩn hóa quy trình (Lan gộp checklist)", "meet_table_nod_01 → meet_table_note_01 · face_happy"),
 ("L4 S13 Hệ thống vận hành", "C", "Nam: “Em muốn phụ trách checklist cho thành viên mới.”", "meet_table_raise_01 → eager · face_eager"),
 ("L4 S13 Hệ thống vận hành", "C + junior_publicly_blamed", "Nam: “Em hơi lo mình chưa đủ kinh nghiệm để nhận phần này. Nếu có người review cùng, em sẽ thử.”", "hesitant_01 → hesitant_02 → try_01 · face_hesitant"),
 ("L4 S13 Hệ thống vận hành", "C → onboarding", "Nam phụ trách checklist cho thành viên mới", "check_hold_01 → check_point_01 → check_give_01 → check_hug_01 · face_confident"),
 ("L4 S14 Phát triển team", "Mở cảnh", "Ngày 52 · Phòng họp 1-1 (Anh Minh, Huy nói)", "oneone_listen_01 · face_neutral"),
 ("L4 S14 Phát triển team", "junior_publicly_blamed", "Nam: “Sau lỗi lần trước, em không chắc team còn tin tưởng giao việc quan trọng cho em không.”", "oneone_sad_01 → oneone_fidget_01 · face_unsure"),
 ("L4 S14 Phát triển team", "deployment_checklist_added", "Nam: “Em đã hoàn thiện checklist deploy và hỗ trợ team dùng trong các lần release gần đây. Em muốn tiếp tục chịu trách nhiệm phần này.”", "oneone_proud_01 → oneone_talk_01 · face_proud"),
 ("L4 S14 Phát triển team", "A", "Đánh giá theo số task (Lan: QA ngăn lỗi không có ticket)", "sigh_01 · face_worried"),
 ("L4 S14 Phát triển team", "B", "Nam: “Em đồng ý. Có tiêu chí em sẽ tự theo dõi được tiến bộ.”", "oneone_eager_01 → nod · face_eager"),
 ("L4 S14 Phát triển team", "C", "PM: “…Nam sở hữu một module.”", "oneone_surprised_01 → happy → thankful_01 · face_happy"),
 ("L4 S14 Phát triển team", "C + junior_publicly_blamed", "Nam: “Em vẫn hơi lo mắc lỗi. Nếu có checklist và người hỗ trợ ở các mốc quan trọng, em sẽ nhận.”", "worry_01 → nod · face_hesitant"),
 ("L4 S14 Phát triển team", "Kết cảnh", "Nhận module / IDP", "proud → good_02 · face_confident"),
 ("Hội thoại", "Nam đứng nói / nghe", "Mặc định khi đứng", "talk · listen · greet_02 · lap_type · meet_table_talk"),
]
NOTE = ("Nam chỉ có ở cảnh team L1 (nền, không thoại), L2 S05, S06, L3 S11 và L4 S13, S14 (kịch bản mục 2), nên không có "
        "sự cố production, gặp khách hay màn kết thúc. Mọi ô trong các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).")

def anim_refs(text):
    refs = []
    for part in text.replace("·", "→").replace("/", "→").replace("(", " ").replace(")", " ").replace(";", " ").split("→"):
        for tok in part.split():
            if re.fullmatch(r"[a-z][a-z0-9_]+", tok): refs.append(tok)
    return refs

# ---------------------------------------------------------------- SOL one-shot (toi uu token)
SOL = """Work autonomously. Do not ask questions. Keep chat output short.

GOAL: sprite sheets A, B, E, D for the game character "Nam – junior frontend developer".

ATTACHMENTS
1. The photo of the real person (who agreed to this): face source.
2. PM_A_master.png – another character's master sheet: grid, size and style reference only.
3. rolecraft_nam_sprite_prompts.zip – prompts/NAM_*.txt, nam_sprite_manifest.json, tools/.
Props, furniture and icons already exist in the PM set: never generate them.

TOKEN BUDGET RULES (follow strictly)
- Always ask the image tool for a TRANSPARENT background (PNG with alpha). If a sheet still comes back on plain white, do NOT regenerate it: remove the white with tools/make_transparent.py (step below).
- One image call per sheet, using the prompt file text EXACTLY. Do not rewrite, shorten or "improve" prompts. Sheet E is a landscape 3:2 image; the others are square.
- Regenerate a whole sheet ONLY for a HARD FAIL: wrong grid (not the stated columns x rows), figures overlapping or cut off, a face that does not resemble the photo, drawn objects/furniture in many cells, visible text, or a checkerboard pattern / scenery painted as the background. Maximum 1 retry per sheet; keep the better of the two.
- On a retry, append this line to the prompt and nothing else: "GRID CHECK: exactly the stated columns and rows, one figure per cell, nothing crosses a cell edge."
- Everything else is a SOFT issue (a pose slightly off, a missing or extra dot, small color drift): do not regenerate, just list it.
- Never regenerate a sheet that passed. Never regenerate A after B has started.
- Do not describe images or repeat prompts in chat. After each sheet print one line: `<sheet> | attempts | PASS / FAIL: reason`.

STEPS
1. Unzip; read the manifest (file names) and prompts.
2. Sheet A: NAM_A_master.txt with Image 1 = the photo, Image 2 = PM_A_master.png.
3. Sheets B, E, D: their prompt files with Image 1 = approved NAM_A_master.png, Image 2 = the photo.
4. Save to sheets/ with the manifest file names. Make every saved sheet transparent (no image call needed):
   python3 tools/make_transparent.py sheets/*.png
   Then run once:
   python3 tools/extract_anchors.py --manifest nam_sprite_manifest.json --sheets sheets --out build
5. Read build/report.json. Only for a ROW where 3 or more cells report "missing ... marker", make ONE edit call on that sheet with the ROW FIX prompt below (max 2 row fixes in total for the whole job), then run the script once more. Leave all other warnings as they are.
6. DELIVER: show the final sheets; one file rolecraft_nam_sprites.zip with sheets/, build/, nam_sprite_manifest.json, tools/pm_compose.js; a table: sheet, attempts, result, remaining warnings.

ROW FIX PROMPT (Image 1 = NAM_A_master.png, Image 2 = the sheet to fix):
"Edit Image 2: redraw ONLY row {N}; keep every other row pixel-identical. Same character as Image 1. Draw no objects or furniture: empty hands in the grip pose. Add the marker dots exactly as tagged: {paste the Row N line from the prompt file}. Dots are small solid flat circles: MAGENTA #FF00FF, GREEN #00FF00, CYAN #00FFFF."

If you run out of room, stop after the last finished step and write: "Resume from step X."
"""

# ---------------------------------------------------------------- README
def cell_table(s):
    L = ["| # | Tên | Mô tả |", "|---:|---|---|"]
    for c in cells(s):
        tag = "" if s.get("portrait") or c["name"] == "portrait" else marker_tag(c["name"])
        L.append(f"| {c['index']} | `nam/{c['name']}` | {c['desc']}{tag} |")
    return L

KNOWN = set()
def mapping_md():
    L = ["Tên là **nhóm animation** `nam/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `nam/<ô>_01`; `face_*` là chân dung "
         "hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi "
         "“Nam:” là phản ứng của Nam khi người khác nói hoặc theo kết quả lựa chọn.", "",
         "| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anim in SCENES:
        a = re.sub(r"\b([a-z][a-z0-9_]{2,})\b", lambda m: f"`{m.group(1)}`" if m.group(1) in KNOWN else m.group(1), anim)
        L.append(f"| {sc} | {beat} | {line} | {a} |")
    L += ["", NOTE]
    return "\n".join(L)

def readme(man):
    n_cells = sum(len(s["cells"]) for s in man["sheets"])
    L = ["# RoleCraft PM60 – Bộ prompt sprite Nam v4 (Frontend Developer)", "",
         "Sinh bởi `rolecraft_nam_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.", "",
         f"**{len(man['sheets'])} sheet / {n_cells} ô / {len(man['animations'])} animation.** Mỗi ô gắn với một câu thoại "
         "hoặc cảnh Nam có mặt trong kịch bản (mục 5). Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM.", "",
         "## Thiết kế", "",
         "- **Tạo hình:** nam, thành viên trẻ nhất team, áo len lavender ngoài sơ mi trắng, quần chino be, giày trắng, tai nghe "
         "đeo cổ, thẻ xanh royal. Vật đặc trưng: laptop bạc mỏng (dùng `laptop_*` của bộ PM).",
         "- **Cung truyện theo kịch bản:** “Em sẽ cố” khi team OT (S05) → push nhầm code, xin lỗi (S11) → bị phê bình / "
         "được bỏ qua / 1-1 và viết checklist deploy (S11 A/B/C) → xin phụ trách onboarding (S13) → 1-1 đánh giá, nhận "
         "module (S14), kèm các biến thể theo cờ `team_ot_14_days`, `junior_publicly_blamed`, `deployment_checklist_added`.",
         "- **Quay PHẢI** như PM, nội thất bên phải: dùng thẳng ghế, bàn của bộ PM; khi đứng đối diện PM thì game lật cả "
         "cụm (`flip: true`).",
         "- **Sheet:** A (8×7), B (8×7), E kiệt sức (8×3, ảnh ngang 3:2 – không độn ô), D (4×5). Nền trong suốt; quy tắc "
         "tiết kiệm token trong `SOL_ONE_SHOT_PROMPT.txt`.",
         "- **Thay bản cũ:** bản cũ quay trái + bind `beside_left` (không ghép được), mapping theo kịch bản chi tiết cũ.", "",
         "## 1. Thứ tự sinh và ảnh đính kèm", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    att = {"photo+pm": "ảnh thật + `PM_A_master.png`", "master": "`NAM_A` đã duyệt + ảnh thật"}
    for s in SHEETS:
        L.append(f"| {s['id']} ({s['cols']}×{s['rows']}) | `prompts/NAM_{s['id']}_{s['key']}.txt` | {att[s['attach']]} | {s['title']} |")
    L += ["", "**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip "
          "thư mục `rolecraft_nam_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Mỗi sheet 1 lần sinh, chỉ "
          "sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả); nền "
          "trắng thì chỉ chạy `tools/make_transparent.py`; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.", "",
          "**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm các sheet còn lại.", "",
          "## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)", "",
          "> ✅ Đúng lưới (A, B: 8×7 vuông; E: 8×3 ảnh ngang; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, "
          "**nền trong suốt** (không trắng, không ô caro vẽ giả).",
          ">",
          "> ✅ Nhận ra người thật; áo len lavender, cổ sơ mi trắng, tai nghe đeo cổ, thẻ xanh royal; ô 1 sheet A là chân dung khung tím nhạt.",
          ">",
          "> ✅ Không vẽ laptop, checklist, ghế, bàn (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.",
          ">",
          "> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.", "",
          "## 3. Dùng tool", "",
          "```bash",
          "cd docs/NAM/rolecraft_nam_sprite_prompts",
          "python3 tools/make_transparent.py sheets/*.png",
          "python3 tools/extract_anchors.py --manifest nam_sprite_manifest.json --sheets sheets --out build",
          "```", "",
          "Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`nam/*`), "
          "rồi `PMCompose.create(anchors, manifest, base)`.", "",
          "## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)", "",
          "| Nhóm tư thế | Đồ vật | Nội thất |", "|---|---|---|",
          "| idle, walk, run, lap_hug, tired_idle, tired_walk / lap_carry | laptop_closed (ôm trước ngực / kẹp nách) | |",
          "| lap_hold, lap_type, lap_close / lap_show | laptop_open_34 / laptop_open_front (vẽ lỗi lên màn hình) | |",
          "| check_write, check_tick | checklist_sheet (tay trái) + pen | |",
          "| check_read/point/give/hold/hug, proud, oneone_proud | checklist_sheet | |",
          "| sit_*, desk_turn | | office_chair |",
          "| desk_* / night_* | lamp_on trên bàn (night), mug_steam (night_coffee) | office_chair + desk_monitor |",
          "| meet_table_* | pen + notebook_open (note) | meeting_chair + meeting_table |",
          "| oneone_* | | meeting_chair |",
          "| weary_03 | mug_plain | |", "",
          "## 5. Mapping kịch bản → sprite", "", mapping_md(), "",
          "## 6. Chi tiết từng sheet", ""]
    for s in SHEETS:
        L += [f"### Sheet {s['id']} – {s['title']}", ""] + cell_table(s) + [""]
    return "\n".join(L)

# ---------------------------------------------------------------- main
def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    for f in os.listdir(f"{OUT}/prompts"):
        if f.startswith("NAM_") and f.endswith(".txt"): os.remove(f"{OUT}/prompts/{f}")
    man = {"version": 4, "character": {"id": "NAM", "role": "JUNIOR_DEV", "name": "Nam – Frontend Developer"},
           "shared": {"note": "prop/*, furn/*, icon/* dùng lại sheet P, O, F của bộ PM (docs/PM)"},
           "facing": "right",
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/NAM_{s['id']}_{s['key']}.txt", "w", encoding="utf-8").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"nam/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        sh = {"id": s["id"], "key": s["key"], "kind": "nam", "file": f"NAM_{s['id']}_{s['key']}.png",
              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl}
        if s.get("aspect"): sh["aspect"] = s["aspect"]
        man["sheets"].append(sh)
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (6, False) if len(fr) > 1 else (1, False))
            man["animations"][f"nam/{k}"] = {"frames": [f"nam/{f}" for f in fr], "fps": fps, "loop": loop}
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
    json.dump(man, open(f"{OUT}/nam_sprite_manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(f"{OUT}/SOL_ONE_SHOT_PROMPT.txt", "w", encoding="utf-8").write(SOL)
    open(f"{OUT}/mapping_section.md", "w", encoding="utf-8").write(mapping_md() + "\n")
    md = readme(man)
    for p in (f"{OUT}/README_NAM_SPRITE_PROMPTS.md", os.path.join(OUT, "..", "README_NAM_SPRITE_PROMPTS.md")):
        open(p, "w", encoding="utf-8").write(md + "\n")
    n = sum(len(s["cells"]) for s in man["sheets"])
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} dong mapping, 0 o thua")

if __name__ == "__main__":
    main()
