# -*- coding: utf-8 -*-
# Bo prompt sprite ANH HIEP v4 (CLIENT – dai dien khach hang / Product Owner), thay cho bo "Chi Mai" cu.
# MOI O bam mot cau thoai hoac mot dien bien cua khach hang trong docs/KICH_BAN_ROLECRAFT_PM60.md (xem SCENES):
# L1 S03, L2 S06, S08, L3 S09, S10 (goi dien), L4 S15. Cung co che v3: ve tay khong + cham neo, do vat / noi that /
# icon DUNG LAI sheet P, O, F cua PM. Hiep quay PHAI nhu PM de dung chung ghe, ban hop; game lat ca cum (flip) khi
# Hiep ngoi doi dien PM. Nhan dien tu ANH THAT. Nen trong suot.
#     python build.py   -> prompts/HIEP_*.txt, hiep_sprite_manifest.json, SOL_ONE_SHOT_PROMPT.txt,
#                          mapping_section.md, README_CLIENT_SPRITE_PROMPTS.md (ca ban o docs/CLIENT/)
import copy, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT", HERE)

# ---------------------------------------------------------------- van ban chung (ngan, khong lap y)
WHO = ("Anh Hiep, the client's representative and product owner: a business customer who wants fast results, "
       "pushes for extra features and deadlines, but accepts a clear plan")

ATTACH_A = ("ATTACHED IMAGES: Image 1 is a photo of a real person who agreed to become this character: the ONLY source "
"for the face. Image 2 is the master sheet of ANOTHER character (the young PM): use it ONLY for the grid layout, sprite "
"size, outline and shading; never copy the PM's face or clothes.")
ATTACH_MASTER = ("ATTACHED IMAGES: Image 1 is the approved master sheet of this character (Anh Hiep, Sheet A): match it "
"exactly (face, hair, outfit, colors, proportions, outline, shading, sprite size). Image 2 is the photo of the real "
"person: use it only to keep the face recognizable.")

IDENTITY = ("IDENTITY: keep the person in the photo clearly recognizable: face shape, eyes and eyebrows, nose and mouth, "
"hairstyle, hair length, color and parting, skin tone, and features such as glasses, moles or beard (glasses, if any, "
"in every cell). Stylize into the art style; do not trace the photo. Ignore the photo's background, pose, expression "
"and clothing.")

CHARACTER = ("CHARACTER (identical in every cell unless a row says otherwise): Anh Hiep, a man around forty from the "
"customer company, confident businessman. White dress shirt with thin light-blue stripes, no tie, top button open; "
"camel-tan single-breasted blazer worn open; dark chocolate-brown trousers; brown leather loafers; a silver wristwatch "
"on the left wrist; a grey lanyard with a plain white VISITOR badge card at the chest (blank, no text). About 2.5 heads "
"tall, slightly taller and broader than the PM, mature and self-assured look.")

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
              "outline and a soft pastel-mint background with a few sparkles; Anh Hiep with a confident business smile "
              "holding a smartphone near the chest. No other cell has a background or a drawn object.")
    return t

OBJECT_RULE = ("OBJECTS AND FURNITURE ARE ADDED BY CODE, SO NEVER DRAW THEM: no phone, tablet, page, folder, notebook, pen, "
"chair or table (the worn visitor badge and the watch stay). Draw the empty hand(s) in the exact grip pose, and seated "
"bodies at the right height on an invisible chair. MARKER DOTS, only where a cell has a [markers] tag: small solid flat "
"dots about 1.5% of the cell width drawn on top of the figure. MAGENTA #FF00FF = grip point of the main held object (two "
"hands: midway between them); GREEN #00FF00 = grip point of a second object in the other hand; CYAN #00FFFF = middle of "
"the hips where they touch the seat. Never use these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; add text, letters, numbers or watermark; draw grid lines or "
"cell borders; add scenery, floor or walls; add other characters (the PM, Lan, Huy or Sales are offscreen; phone calls "
"show only Anh Hiep); crop limbs; repeat an identical pose; change face, hair, outfit colors or proportions between cells.")

# ---------------------------------------------------------------- sheet A – master (co the, dung, goi dien)
A = [
 ("Row 1 - Portrait + idle (smartphone held loosely in the right hand)", [
  ("portrait", "[portrait cell, see LAYOUT]"),
  ("idle_01", "idle 1/4: upright confident stance"),
  ("idle_02", "idle 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03", "idle 3/4: glancing briefly at the phone"),
  ("idle_04", "idle 4/4: slight exhale, attentive face"),
  ("idle_back_01", "seen from BEHIND (back view), standing"),
  ("greet_01", "entering the meeting room: polite nod with a business smile"),
  ("greet_02", "friendly open palm greeting, 'hello team'")]),
 ("Row 2 - Walk cycle 8 frames, brisk business pace, phone in the right hand, left arm swings", [
  ("walk_01", "contact: right foot forward, heel touching"), ("walk_02", "down: weight on right leg, knee bent"),
  ("walk_03", "passing: left leg passing the right"), ("walk_04", "up: rising on right toes"),
  ("walk_05", "contact: left foot forward, heel touching"), ("walk_06", "down: weight on left leg, knee bent"),
  ("walk_07", "passing: right leg passing the left"), ("walk_08", "up: rising on left toes")]),
 ("Row 3 - Leaving the meeting room and handshakes (the other person is offscreen on the right)", [
  ("walk_back_01", "walking away seen from BEHIND, step 1, phone in the right hand"),
  ("walk_back_02", "walking away from behind, step 2"),
  ("walk_back_03", "walking away from behind, step 3"),
  ("walk_back_04", "walking away from behind, step 4"),
  ("turn_01", "turning away to leave, polite nod over the shoulder"),
  ("shake_01", "reaching out the right hand for a handshake, business smile"),
  ("shake_02", "firm handshake, satisfied smile"),
  ("bow_01", "short polite nod goodbye, hands free")]),
 ("Row 4 - Phone call about a production incident at his company (phone in the right hand or at the right ear)", [
  ("phone_read_01", "reading an alert on the phone, frowning, exclamation mark"),
  ("phone_call_01", "phone at the ear, listening, serious"),
  ("phone_urgent_01", "phone at the ear, upset, free hand raised, 'our operations are affected'"),
  ("phone_angry_01", "phone at the ear, angry, free hand on the hip, small anger mark (payment flow down)"),
  ("phone_listen_01", "phone at the ear, listening to the PM's report, eyes narrowed"),
  ("phone_calm_01", "phone at the ear, calming down, relieved exhale"),
  ("phone_annoyed_01", "phone at the ear, annoyed, rubbing the forehead, 'it is taking too long'"),
  ("phone_thanks_01", "phone at the ear, appreciative nod, small smile")]),
 ("Row 5 - Phone call about the AI feature Sales promised in ten days", [
  ("phone_expect_01", "phone at the ear, expectant smile, 'ten days, right?'"),
  ("phone_pleased_01", "phone at the ear, pleased, thumbs up with the free hand"),
  ("phone_shock_01", "phone at the ear, shocked, eyebrows up, exclamation mark"),
  ("phone_displeased_01", "phone at the ear, displeased, pinching the bridge of the nose"),
  ("phone_think_01", "phone at the ear, considering, free hand at the chin"),
  ("phone_ok_01", "phone at the ear, agreeing, nodding"),
  ("phone_type_01", "typing a confirmation on the phone with the thumb"),
  ("phone_pocket_01", "putting the phone into the blazer pocket, call ended")]),
 ("Row 6 - Standing talk and reactions (arriving and leaving the meeting room)", [
  ("talk_01", "talking, right hand open at chest height"),
  ("talk_02", "talking, both hands slightly open, explaining a business need"),
  ("listen_01", "listening, arms loosely crossed, attentive"),
  ("listen_02", "listening, head tilted, one hand at the chin"),
  ("nod_01", "nodding, accepting"), ("nod_02", "chin back up after the nod"),
  ("pleased_01", "pleased smile, small nod, two golden sparkles"),
  ("stern_01", "stern straight face, hands clasped in front, expecting guarantees")]),
 ("Row 7 - Invisible meeting chair at an invisible table on the RIGHT (same seat height in every seated cell)", [
  ("sit_01", "standing in front of the chair, about to sit, unbuttoning the blazer"),
  ("sit_02", "lowering onto the chair"),
  ("sit_03", "seated upright, forearms on the table"),
  ("sit_04", "seated, leaning back, arms crossed"),
  ("sit_05", "standing up from the chair"),
  ("meet_wait_01", "seated, fingers laced on the table, waiting for the PM's answer"),
  ("meet_wait_02", "seated, leaning back, one eyebrow raised, waiting"),
  ("sit_06", "seated, straightening the blazer before the meeting starts")]),
]

# ---------------------------------------------------------------- sheet C – ngoi ban hop theo tung canh (8x8)
T = "seated at the invisible meeting table on the RIGHT, same seat height"
C = [
 (f"Row 1 - Kickoff meeting, Day 10, opening ({T})", [
  ("meet_request_01", "two fingers up, asking, 'two more features for the demo'"),
  ("meet_request_02", "two fingers up, leaning in, mouth open mid-sentence"),
  ("meet_assume_01", "casual dismissive wave with a confident smile, 'just a few days, right?'"),
  ("meet_assume_02", "leaning back, relaxed confident smile, palm up"),
  ("meet_listen_01", "listening, forearms on the table"),
  ("meet_listen_02", "listening, slight head tilt"),
  ("meet_skeptical_01", "one eyebrow raised, skeptical, hand at the chin"),
  ("meet_skeptical_02", "skeptical, arms crossed on the table")]),
 (f"Row 2 - Kickoff meeting, reactions to the PM's answer ({T})", [
  ("meet_pleased_01", "pleased smile, nodding"),
  ("meet_pleased_02", "delighted, hands clasped on the table, sparkles"),
  ("meet_displeased_01", "displeased, lips pressed, looking aside, 'that is a bit rigid'"),
  ("meet_displeased_02", "leaning back, small sigh, still polite"),
  ("meet_consider_01", "one finger raised, 'fine, but I need to know the impact first'"),
  ("meet_consider_02", "hand at the chin, considering, calm"),
  ("meet_note_01", "writing a note with a pen"),
  ("meet_note_02", "writing, looking up to listen")]),
 (f"Row 3 - Release meeting, Day 22, opening ({T})", [
  ("meet_worried_01", "worried frown, hearing the last regression round may be dropped"),
  ("meet_schedule_01", "turning a tablet toward the other side, showing the training schedule"),
  ("meet_schedule_02", "tapping a date on the tablet, 'training is on release day'"),
  ("meet_demand_01", "palm flat on the table, firm, 'I need a plan now'"),
  ("meet_demand_02", "index finger tapping the table, firm"),
  ("meet_watch_01", "checking the wristwatch, pressed for time"),
  ("meet_impatient_01", "drumming the fingers on the table, impatient"),
  ("meet_impatient_02", "drumming the fingers, glancing at the other side")]),
 (f"Row 4 - Release meeting, reactions ({T})", [
  ("meet_ok_01", "satisfied nod, 'release on time, good'"),
  ("meet_ok_02", "relaxed smile, leaning back"),
  ("meet_doubt_01", "leaning back, doubtful, 'will three days really reduce the risk?'"),
  ("meet_doubt_02", "palm up, questioning look"),
  ("meet_accept_01", "conditional agreement: nodding with one finger raised"),
  ("meet_accept_02", "small nod, hands folded on the table"),
  ("meet_talk_01", "talking with an open hand"),
  ("meet_talk_02", "leaning in, explaining")]),
 (f"Row 5 - Complaint meeting, Day 30, opening and choice A ({T})", [
  ("meet_complain_01", "pointing at a requirement page lying on the table, upset"),
  ("meet_complain_02", "both hands open, 'this is not how we understood it, how will you fix it?'"),
  ("meet_complain_03", "turning a tablet toward the other side, showing the feature behaving differently"),
  ("meet_complain_04", "tapping the tablet screen, frowning"),
  ("meet_annoyed_01", "annoyed, eyes narrowed, tapping the table once"),
  ("meet_reject_01", "arms crossed, firm, 'I don't accept pushing all the responsibility onto us'"),
  ("meet_reject_02", "palm raised forward, stern"),
  ("meet_reject_03", "leaning back, shaking the head, disappointed")]),
 (f"Row 6 - Complaint meeting, choices B and C ({T})", [
  ("meet_satisfied_01", "satisfied smile, hands folded on the table"),
  ("meet_satisfied_02", "satisfied nod, leaning back"),
  ("meet_resolve_01", "calm nod, open palms, 'agreed, as long as both sides' responsibilities are clear'"),
  ("meet_resolve_02", "one hand on the chest, cooperative"),
  ("meet_sign_01", "signing the acceptance criteria in an open folder on the table with a pen"),
  ("meet_sign_02", "pen lifted after signing, small nod"),
  ("meet_nod_01", "nodding, agreeing"),
  ("meet_sigh_01", "sighing, eyes closed, small grey puff")]),
 (f"Row 7 - Expansion meeting, Day 56, opening ({T})", [
  ("meet_propose_01", "leaning forward, enthusiastic, proposing a new reporting module"),
  ("meet_propose_02", "turning a tablet toward the other side, showing the new scope"),
  ("meet_propose_03", "both hands open, eager, 'and an approval flow too'"),
  ("meet_guarantee_01", "arms crossed, serious, asking for stronger guarantees first"),
  ("meet_guarantee_02", "index finger raised, stern"),
  ("meet_think_01", "thinking, hand at the chin, looking up"),
  ("meet_think_02", "thinking, eyes narrowed, weighing the offer"),
  ("meet_relieved_01", "relieved, shoulders relaxed, small smile")]),
 (f"Row 8 - Expansion meeting, reactions and closing the deal ({T})", [
  ("meet_delighted_01", "delighted, both hands open, 'you take all of it? great'"),
  ("meet_delighted_02", "delighted laugh, leaning back"),
  ("meet_milestone_01", "tapping a date on the tablet, 'I need concrete milestones'"),
  ("meet_budget_01", "hand raised flat, 'so I can submit the budget'"),
  ("meet_phase_ok_01", "pleased, one finger raised, 'phasing worked with the MVP'"),
  ("meet_phase_ok_02", "counting two fingers, 'acceptance criteria for each phase'"),
  ("meet_shake_01", "reaching across the table for a handshake, deal"),
  ("meet_shake_02", "handshake across the table, big smile")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral", "neutral, composed"), ("face_polite", "polite business smile"),
            ("face_pleased", "pleased smile"), ("face_delighted", "delighted, big smile, sparkles")]),
 ("Row 2", [("face_assume", "casual confident smile, 'it's simple, right?'"), ("face_eager", "eager, bright eyes"),
            ("face_concerned", "concerned, eyebrows tilted"), ("face_worried", "worried, sweat drop")]),
 ("Row 3", [("face_impatient", "impatient, lips pressed, eyebrows lowered"), ("face_annoyed", "annoyed, eyes narrowed"),
            ("face_angry", "angry, small anger mark"), ("face_shocked", "shocked, mouth open")]),
 ("Row 4", [("face_skeptical", "one eyebrow raised, skeptical"), ("face_stern", "stern, straight mouth"),
            ("face_firm", "firm, determined, jaw set"), ("face_thinking", "thinking, eyes looking up")]),
 ("Row 5", [("face_conditional", "conditional agreement, one eyebrow up, slight smile"),
            ("face_cooperative", "cooperative warm smile"), ("face_relieved", "relieved, soft smile"),
            ("face_satisfied", "satisfied closed-eye smile")]),
]

SHEETS = [
 {"id": "A", "key": "master", "cols": 8, "rows": 7, "attach": "photo+pm", "grid": A, "portrait_first": True,
  "task": "framed portrait, idle, walk cycle, walking away, handshakes, phone calls about an incident and about a "
          "Sales promise, standing talk and reactions, sitting down at a meeting table",
  "title": "Master: chân dung, đứng, đi, rời phòng, bắt tay, gọi điện S09/S10, nói/nghe đứng, ngồi vào bàn họp"},
 {"id": "C", "key": "meetings", "cols": 8, "rows": 8, "attach": "master", "grid": C,
  "task": "seated at a meeting table in four client meetings: kickoff, release, complaint and expansion",
  "title": "Ngồi bàn họp theo 4 cuộc họp: S03 kickoff, S06 release, S08 complain, S15 mở rộng (mỗi câu thoại 2 khung)"},
 {"id": "D", "key": "portraits", "cols": 4, "rows": 5, "attach": "master", "grid": D, "portrait": True,
  "task": "20 framed facial-expression portraits for a dialogue box", "title": "20 chân dung hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua bo PM)
def P(id, at="grip", z="front"): return {"prop": id, "at": at, "z": z}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
MCHAIR, MTABLE = F("meeting_chair"), F("meeting_table", z="front")
TABLE = [MCHAIR, MTABLE]
PHONE, TAB = P("phone_back"), P("tablet_screen_34")
RULES = [  # (regex, bindings) – khop dau tien
 (r"^portrait$|^face_", []),
 (r"^idle_|^walk_|^walk_back_|^turn_01$|^phone_", [PHONE]),
 (r"^sit_01$", [F("meeting_chair", "beside")]),
 (r"meet_schedule|meet_complain_03|meet_propose_02|meet_milestone", TABLE + [TAB]),
 (r"meet_complain_01", TABLE + [P("contract_sheet", "surface:meeting_table")]),
 (r"meet_sign", TABLE + [P("pen"), P("folder_open", "surface:meeting_table")]),
 (r"meet_note", TABLE + [P("pen"), P("notebook_open", "surface:meeting_table")]),
 (r"^sit_|^meet_", TABLE),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green"}
WORD = {"phone": "phone", "tablet": "tablet", "pen": "pen", "contract": "page", "folder": "folder", "notebook": "notebook"}
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
            "rounded-square frame with a thin dark outline and a soft pastel-mint background, identical frame size and "
            "crop, exactly like cell 1 of the master sheet. Face the viewer, turned slightly right, hands empty. Frames "
            "never touch.",
            "EXPRESSIONS:\n" + rows_text(s, tags=False), NEG])
    return "\n\n".join([
        head + f"sprite sheet of {WHO}. Sheet content: {s['task']}.", attach, IDENTITY, CHARACTER, STYLE,
        LAYOUT(s), OBJECT_RULE, "CELLS:\n" + rows_text(s), NEG])

FPS = {"idle": (6, True), "walk": (10, True), "walk_back": (8, True), "greet": (6, False), "shake": (6, False),
       "talk": (6, True), "listen": (3, True), "nod": (6, False), "sit": (8, False), "meet_wait": (3, True),
       "meet_pleased": (6, False), "meet_schedule": (6, False), "meet_complain": (6, False), "meet_reject": (6, False),
       "meet_propose": (6, False), "meet_talk": (6, True), "phone_call": (4, True)}

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

# ---------------------------------------------------------------- bam kich ban: MOI O phai co mat o day
# (canh, nhip, thoai / dien bien theo docs/KICH_BAN_ROLECRAFT_PM60.md, chuoi animation va chan dung)
SCENES = [
 ("L1 S03 Thay đổi phạm vi", "Vào phòng", "Ngày 10 · Phòng họp kickoff, lần đầu gặp PM mới", "walk → greet → shake → listen → nod → talk → sit_01 → sit_02 → sit_06 → sit_03 · face_polite"),
 ("L1 S03 Thay đổi phạm vi", "Mở cảnh", "Anh Hiệp: “Anh muốn thêm hai chức năng vào bản demo. Chắc chỉ vài ngày thôi nhỉ?”", "meet_request → meet_assume · face_assume"),
 ("L1 S03 Thay đổi phạm vi", "", "Lan: “Hai chức năng này nằm ngoài phạm vi đã xác nhận.”", "meet_listen → meet_skeptical · face_skeptical"),
 ("L1 S03 Thay đổi phạm vi", "Câu hỏi", "PM: “Hai chức năng... mà demo chỉ còn vài ngày.” (PM đang chọn)", "meet_wait_01 · face_neutral"),
 ("L1 S03 Thay đổi phạm vi", "A", "PM: “Được ạ, team sẽ thêm vào.” (client_trust +10)", "meet_pleased · face_delighted"),
 ("L1 S03 Thay đổi phạm vi", "B", "Anh Hiệp: “Anh hiểu, nhưng cách xử lý này hơi cứng nhắc.”", "meet_displeased · face_annoyed"),
 ("L1 S03 Thay đổi phạm vi", "C", "Anh Hiệp: “Được, anh cần biết rõ tác động trước.”", "meet_consider → meet_note · face_conditional"),
 ("L1 S03 Thay đổi phạm vi", "Rời phòng", "", "sit_05 → bow_01 → turn_01 → idle_back_01 → walk_back · face_neutral"),
 ("L2 S06 Deadline/chất lượng", "Vào phòng", "Ngày 22 · Phòng họp release", "walk → greet_01 → sit · face_polite"),
 ("L2 S06 Deadline/chất lượng", "Mở cảnh", "Huy: “Muốn release đúng ngày thì phải bỏ vòng regression cuối.”", "meet_worried_01 · face_worried"),
 ("L2 S06 Deadline/chất lượng", "", "Anh Hiệp: “Lùi ba ngày thì bên anh phải đổi lịch đào tạo. Anh cần phương án ngay.”", "meet_schedule → meet_demand → meet_watch_01 → meet_impatient · face_impatient"),
 ("L2 S06 Deadline/chất lượng", "Câu hỏi", "PM: “Deadline hay chất lượng... phải chọn thôi.”", "meet_wait_02 · face_stern"),
 ("L2 S06 Deadline/chất lượng", "A", "Release đúng hạn (client_trust +10) · Huy cảnh báo lỗi luồng cũ", "meet_ok · face_pleased"),
 ("L2 S06 Deadline/chất lượng", "B", "Anh Hiệp: “Anh cần chắc ba ngày này thực sự giảm được rủi ro.”", "meet_doubt · face_skeptical"),
 ("L2 S06 Deadline/chất lượng", "C", "Release luồng critical trước (client_trust +3)", "meet_accept · face_conditional"),
 ("L2 S08 Complain", "Mở cảnh", "Anh Hiệp: “Kết quả không giống cách bên anh hiểu. Bên em giải quyết thế nào?”", "meet_complain_01 → meet_complain_02 → meet_talk · face_annoyed"),
 ("L2 S08 Complain", "", "Lan: “Requirement có một câu hiểu được theo hai cách.”", "sit_04 → meet_annoyed_01 · face_concerned"),
 ("L2 S08 Complain", "Biến thể 1", "Anh Hiệp: “Chức năng này chạy khác với cách bên anh đã yêu cầu.” · Huy thừa nhận đổi cách xử lý", "meet_complain_03 → meet_complain_04 · face_concerned"),
 ("L2 S08 Complain", "Câu hỏi", "PM: “Không phải lúc tranh luận ai đúng ai sai...”", "meet_wait_01 · face_firm"),
 ("L2 S08 Complain", "A", "Anh Hiệp: “Anh không chấp nhận việc đẩy hết trách nhiệm sang khách hàng.”", "meet_reject · face_angry"),
 ("L2 S08 Complain", "B", "PM nhận lỗi, sửa miễn phí (client_trust +10)", "meet_satisfied · face_satisfied"),
 ("L2 S08 Complain", "C", "Anh Hiệp: “Anh đồng ý, miễn là trách nhiệm hai bên rõ ràng.”", "meet_resolve → meet_sign → meet_relieved_01 · face_cooperative"),
 ("L3 S09 Incident", "Mở cảnh", "Hệ thống: 14:00 — Production lỗi, khách hàng bị ảnh hưởng", "phone_read_01 → phone_call_01 → phone_urgent_01 · face_worried"),
 ("L3 S09 Incident", "critical_payment_incident", "Cờ regression_test_skipped: lỗi luồng thanh toán", "phone_angry_01 · face_angry"),
 ("L3 S09 Incident", "Sau mọi nhánh", "PM: “Anh Hiệp ơi, em báo về sự cố chiều nay và cách bên em đã xử lý ạ.”", "phone_listen_01"),
 ("L3 S09 Incident", "A / B / C", "Cả team xử lý (+15) / một dev, phục hồi kéo dài (−5) / rollback, nhóm incident (+10)", "A: phone_thanks_01 · face_relieved · B: phone_annoyed_01 · face_impatient · C: phone_calm_01 · face_relieved → phone_pocket_01"),
 ("L3 S10 Sales hứa 10 ngày", "Mở cảnh", "Linh: “Chị chốt với khách rồi: tính năng AI xong trong mười ngày!”", "phone_expect_01 · face_eager"),
 ("L3 S10 Sales hứa 10 ngày", "A", "PM nhận deadline mười ngày", "phone_pleased_01 · face_delighted"),
 ("L3 S10 Sales hứa 10 ngày", "B", "PM: “Anh Hiệp, bên Sales đã hứa sai, mười ngày là không khả thi.” (client_trust −10)", "phone_shock_01 → phone_displeased_01 · face_shocked"),
 ("L3 S10 Sales hứa 10 ngày", "C", "PM: “Mười ngày bên em giao MVP, phase 2 có estimate cụ thể.” (+10)", "phone_think_01 → phone_ok_01 → phone_type_01 · face_thinking → face_cooperative"),
 ("L4 S15 Mở rộng hợp tác", "Vào phòng", "Ngày 56 · Phòng họp với khách hàng", "walk → greet_02 → sit · face_polite"),
 ("L4 S15 Mở rộng hợp tác", "client_trust thấp", "Anh Hiệp yêu cầu bảo đảm mạnh hơn trước khi mở rộng", "stern_01 → meet_guarantee · face_stern"),
 ("L4 S15 Mở rộng hợp tác", "Mở cảnh", "Anh Hiệp: “Bên anh muốn mở rộng thêm module báo cáo và luồng phê duyệt.”", "meet_propose · face_eager"),
 ("L4 S15 Mở rộng hợp tác", "", "Linh: “Cơ hội tốt!…” · Lan: “Phạm vi mới chỉ là mong muốn…”", "meet_listen → meet_think · face_thinking"),
 ("L4 S15 Mở rộng hợp tác", "A", "PM nhận toàn bộ (client_trust +10)", "meet_delighted · face_delighted"),
 ("L4 S15 Mở rộng hợp tác", "B", "Anh Hiệp: “Được, nhưng anh cần mốc cụ thể để trình ngân sách.”", "meet_milestone_01 → meet_budget_01 → meet_sigh_01 · face_conditional"),
 ("L4 S15 Mở rộng hợp tác", "C", "Linh tách báo giá theo phase (client_trust +15)", "meet_nod_01 → meet_shake · face_satisfied"),
 ("L4 S15 Mở rộng hợp tác", "C + mvp_plan_agreed", "Anh Hiệp: “Cách chia phase này giống phương án MVP trước… Anh đồng ý nếu tiêu chí nghiệm thu của từng phase được ghi rõ.”", "meet_phase_ok · face_satisfied"),
 ("L4 S15 Mở rộng hợp tác", "Kết cảnh", "Chốt hợp tác", "sit_05 → shake → pleased_01 → bow_01 → turn_01 → walk_back"),
 ("Hội thoại", "Anh Hiệp đứng chờ / đang nói", "Mặc định khi đứng (vào phòng, bắt tay)", "idle · talk · listen · nod"),
]
NOTE = ("Anh Hiệp chỉ có ở L1 S03, L2 S06, S08, L3 S09, S10 (qua điện thoại) và L4 S15 (kịch bản mục 2), nên không có "
        "làm đêm, sofa, chạy hay màn kết thúc. Mọi ô trong các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).")

def anim_refs(text):
    refs = []
    for part in text.replace("·", "→").replace("/", "→").replace("(", " ").replace(")", " ").split("→"):
        for tok in part.split():
            if re.fullmatch(r"[a-z][a-z0-9_]+", tok): refs.append(tok)
    return refs

# ---------------------------------------------------------------- SOL one-shot (toi uu token)
SOL = """Work autonomously. Do not ask questions. Keep chat output short.

GOAL: sprite sheets A, C, D for the game character "Anh Hiep – client representative / product owner".

ATTACHMENTS
1. The photo of the real person (who agreed to this): face source.
2. PM_A_master.png – another character's master sheet: grid, size and style reference only.
3. rolecraft_client_sprite_prompts.zip – prompts/HIEP_*.txt, hiep_sprite_manifest.json, tools/.
Props, furniture and icons already exist in the PM set: never generate them.

TOKEN BUDGET RULES (follow strictly)
- Always ask the image tool for a TRANSPARENT background (PNG with alpha). If a sheet still comes back on plain white, do NOT regenerate it: remove the white with tools/make_transparent.py (step below).
- One image call per sheet, using the prompt file text EXACTLY. Do not rewrite, shorten or "improve" prompts. All sheets are square 1:1.
- Regenerate a whole sheet ONLY for a HARD FAIL: wrong grid (not the stated columns x rows), figures overlapping or cut off, a face that does not resemble the photo, drawn objects/furniture in many cells, visible text, or a checkerboard pattern / scenery painted as the background. Maximum 1 retry per sheet; keep the better of the two.
- On a retry, append this line to the prompt and nothing else: "GRID CHECK: exactly the stated columns and rows, one figure per cell, nothing crosses a cell edge."
- Everything else is a SOFT issue (a pose slightly off, a missing or extra dot, small color drift): do not regenerate, just list it.
- Never regenerate a sheet that passed. Never regenerate A after C has started.
- Do not describe images or repeat prompts in chat. After each sheet print one line: `<sheet> | attempts | PASS / FAIL: reason`.

STEPS
1. Unzip; read the manifest (file names) and prompts.
2. Sheet A: HIEP_A_master.txt with Image 1 = the photo, Image 2 = PM_A_master.png.
3. Sheets C, D: their prompt files with Image 1 = approved HIEP_A_master.png, Image 2 = the photo.
4. Save to sheets/ with the manifest file names. Make every saved sheet transparent (no image call needed):
   python3 tools/make_transparent.py sheets/*.png
   Then run once:
   python3 tools/extract_anchors.py --manifest hiep_sprite_manifest.json --sheets sheets --out build
5. Read build/report.json. Only for a ROW where 3 or more cells report "missing ... marker", make ONE edit call on that sheet with the ROW FIX prompt below (max 2 row fixes in total for the whole job), then run the script once more. Leave all other warnings as they are.
6. DELIVER: show the final sheets; one file rolecraft_hiep_sprites.zip with sheets/, build/, hiep_sprite_manifest.json, tools/pm_compose.js; a table: sheet, attempts, result, remaining warnings.

ROW FIX PROMPT (Image 1 = HIEP_A_master.png, Image 2 = the sheet to fix):
"Edit Image 2: redraw ONLY row {N}; keep every other row pixel-identical. Same character as Image 1. Draw no objects or furniture: empty hands in the grip pose. Add the marker dots exactly as tagged: {paste the Row N line from the prompt file}. Dots are small solid flat circles: MAGENTA #FF00FF, GREEN #00FF00, CYAN #00FFFF."

If you run out of room, stop after the last finished step and write: "Resume from step X."
"""

# ---------------------------------------------------------------- README
def cell_table(s):
    L = ["| # | Tên | Mô tả |", "|---:|---|---|"]
    for c in cells(s):
        tag = "" if s.get("portrait") or c["name"] == "portrait" else marker_tag(c["name"])
        L.append(f"| {c['index']} | `hiep/{c['name']}` | {c['desc']}{tag} |")
    return L

KNOWN = set()
def mapping_md():
    L = ["Tên là **nhóm animation** `hiep/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `hiep/<ô>_01`; `face_*` là chân dung "
         "hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi "
         "“Anh Hiệp:” là phản ứng của Anh Hiệp khi người khác nói hoặc theo kết quả lựa chọn.", "",
         "| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anim in SCENES:
        a = re.sub(r"\b([a-z][a-z0-9_]{2,})\b", lambda m: f"`{m.group(1)}`" if m.group(1) in KNOWN else m.group(1), anim)
        L.append(f"| {sc} | {beat} | {line} | {a} |")
    L += ["", NOTE]
    return "\n".join(L)

def readme(man):
    n_cells = sum(len(s["cells"]) for s in man["sheets"])
    L = ["# RoleCraft PM60 – Bộ prompt sprite Anh Hiệp (Khách hàng / Product Owner)", "",
         "Sinh bởi `rolecraft_client_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.", "",
         f"**{len(man['sheets'])} sheet / {n_cells} ô / {len(man['animations'])} animation.** Thay cho bộ “Chị Mai” cũ "
         "(kịch bản đã đổi khách hàng thành **Anh Hiệp**, xưng “anh”). Mỗi ô gắn với một câu thoại hoặc diễn biến của "
         "khách hàng trong kịch bản (mục 5). Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM.", "",
         "## Thiết kế", "",
         "- **Tạo hình:** nam khoảng 40 tuổi, sơ mi trắng sọc xanh nhạt, blazer nâu camel mở cúc, quần nâu sô-cô-la, giày "
         "lười nâu, đồng hồ bạc, **thẻ VISITOR trắng** (khách đến văn phòng bên PM). Vật đặc trưng: điện thoại.",
         "- **Quay PHẢI** như PM, bàn họp bên phải: dùng thẳng ghế, bàn họp của bộ PM; khi ngồi đối diện PM thì game lật "
         "cả cụm (`flip: true`).",
         "- **Theo kịch bản:** 4 cuộc họp ngồi bàn (S03 kickoff, S06 release, S08 complain, S15 mở rộng) và 2 cảnh gọi "
         "điện (S09 sự cố production, S10 Sales hứa 10 ngày). Không có làm đêm, sofa, chạy, màn kết thúc.",
         "- **3 sheet:** A (8×7), C (8×8 – mỗi câu thoại/phản ứng có 2 khung để cử động), D (4×5). Không có sheet B/E vì kịch bản không cần (khách hàng không làm đêm, không xử lý sự cố tại chỗ, không kiệt sức).",
         "- **Nền trong suốt**; quy tắc tiết kiệm token trong `SOL_ONE_SHOT_PROMPT.txt`.", "",
         "## 1. Thứ tự sinh và ảnh đính kèm", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    att = {"photo+pm": "ảnh thật + `PM_A_master.png`", "master": "`HIEP_A` đã duyệt + ảnh thật"}
    for s in SHEETS:
        L.append(f"| {s['id']} ({s['cols']}×{s['rows']}) | `prompts/HIEP_{s['id']}_{s['key']}.txt` | {att[s['attach']]} | {s['title']} |")
    L += ["", "**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip "
          "thư mục `rolecraft_client_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Mỗi sheet 1 lần sinh, chỉ "
          "sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả); nền "
          "trắng thì chỉ chạy `tools/make_transparent.py`; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.", "",
          "**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm C, D.", "",
          "## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)", "",
          "> ✅ Đúng lưới (A: 8×7; C: 8×8; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, "
          "**nền trong suốt** (không trắng, không ô caro vẽ giả).",
          ">",
          "> ✅ Nhận ra người thật; blazer camel, sơ mi trắng sọc xanh, thẻ VISITOR trắng; ô 1 sheet A là chân dung khung xanh mint.",
          ">",
          "> ✅ Không vẽ điện thoại, tablet, giấy, ghế, bàn (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.",
          ">",
          "> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.", "",
          "## 3. Dùng tool", "",
          "```bash",
          "cd docs/CLIENT/rolecraft_client_sprite_prompts",
          "python3 tools/make_transparent.py sheets/*.png",
          "python3 tools/extract_anchors.py --manifest hiep_sprite_manifest.json --sheets sheets --out build",
          "```", "",
          "Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`hiep/*`), "
          "rồi `PMCompose.create(anchors, manifest, base)`.", "",
          "## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)", "",
          "| Nhóm tư thế | Đồ vật | Nội thất |", "|---|---|---|",
          "| idle, walk, walk_back, turn_01, phone_* | phone_back | |",
          "| sit_01 | | meeting_chair (bên phải) |",
          "| sit_02–05, meet_* | | meeting_chair + meeting_table |",
          "| meet_schedule, meet_complain_03, meet_propose_02, meet_milestone | tablet_screen_34 (vẽ lịch / phạm vi lên màn hình) | meeting_chair + meeting_table |",
          "| meet_complain_01 | contract_sheet trên mặt bàn | meeting_chair + meeting_table |",
          "| meet_sign_01 / meet_note_01 | pen + folder_open / notebook_open trên mặt bàn | meeting_chair + meeting_table |", "",
          "## 5. Mapping kịch bản → sprite", "", mapping_md(), "",
          "## 6. Chi tiết từng sheet", ""]
    for s in SHEETS:
        L += [f"### Sheet {s['id']} – {s['title']}", ""] + cell_table(s) + [""]
    return "\n".join(L)

# ---------------------------------------------------------------- main
def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    for f in os.listdir(f"{OUT}/prompts"):
        if f.endswith(".txt") and (f.startswith("HIEP_") or f.startswith("MAI_")): os.remove(f"{OUT}/prompts/{f}")
    man = {"version": 4, "character": {"id": "HIEP", "role": "CLIENT", "name": "Anh Hiệp – Khách hàng / Product Owner"},
           "shared": {"note": "prop/*, furn/*, icon/* dùng lại sheet P, O, F của bộ PM (docs/PM)"},
           "facing": "right",
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/HIEP_{s['id']}_{s['key']}.txt", "w", encoding="utf-8").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"hiep/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        sh = {"id": s["id"], "key": s["key"], "kind": "hiep", "file": f"HIEP_{s['id']}_{s['key']}.png",
              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl}
        if s.get("aspect"): sh["aspect"] = s["aspect"]
        man["sheets"].append(sh)
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (6, False) if len(fr) > 1 else (1, False))
            man["animations"][f"hiep/{k}"] = {"frames": [f"hiep/{f}" for f in fr], "fps": fps, "loop": loop}
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
    json.dump(man, open(f"{OUT}/hiep_sprite_manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(f"{OUT}/SOL_ONE_SHOT_PROMPT.txt", "w", encoding="utf-8").write(SOL)
    open(f"{OUT}/mapping_section.md", "w", encoding="utf-8").write(mapping_md() + "\n")
    md = readme(man)
    for p in (f"{OUT}/README_CLIENT_SPRITE_PROMPTS.md", os.path.join(OUT, "..", "README_CLIENT_SPRITE_PROMPTS.md")):
        open(p, "w", encoding="utf-8").write(md + "\n")
    n = sum(len(s["cells"]) for s in man["sheets"])
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} dong mapping, 0 o thua")

if __name__ == "__main__":
    main()
