# -*- coding: utf-8 -*-
# Bo prompt sprite LINH (JUNIOR_DEV – Frontend Developer), cung co che v3 voi bo PM (docs/PM):
# nhan vat ve tay khong + cham neo, do vat / noi that / icon DUNG LAI sheet P, O, F cua PM.
#     python3 build.py        # sinh prompts/LINH_*.txt + linh_sprite_manifest.json
import copy, json, os, re
OUT = os.environ.get("OUT", os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------- van ban chung
ATTACH_A = ("ATTACHED IMAGES: Image 1 is a photo of a real person (identity source for this character). Image 2 is the "
"approved master sprite sheet of ANOTHER character from the same game (the young PM). Use Image 2 ONLY as the style and "
"scale reference: same chibi proportions, outline, shading, pixel density, shadow and sprite size. Do not copy the PM's "
"face, hair or outfit.")
ATTACH_MASTER = ("ATTACHED IMAGES: Image 1 is a photo of a real person (identity source). Image 2 is the approved master "
"sprite sheet of this same character (Sheet A). Match Image 2 exactly: same chibi proportions, face, hair, outfit, colors, "
"outline and shading style, and the same sprite size.")

IDENTITY = ("IDENTITY: Convert the person in the photo into a game character. Keep them clearly recognizable: face shape, "
"eye shape and eyebrows, nose and mouth character, hairstyle, hair length, hair color and parting, skin tone, and any "
"distinctive features such as glasses, freckles, moles, beard or earrings (if the person wears glasses, keep the same "
"glasses in every cell). Stylize the features into the art style below; do not trace or paste the photo. Ignore the "
"photo's background, lighting, pose, expression and clothing.")

OUTFIT = ("OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): Linh, a junior "
"frontend developer in their early twenties, eager but still inexperienced. Pastel lavender crew-neck sweater over a white "
"collared shirt (collar visible); beige chino trousers; clean white sneakers; slim black over-ear headphones resting around "
"the neck. A royal-blue lanyard with a plain royal-blue staff ID badge card at the chest (blank, no text). Signature prop: "
"a slim silver laptop. It is added later by code, so do NOT draw it (except in the framed portrait cell).")

VARIANT_TIRED = ("same outfit after two weeks of overtime: hair messier, faint dark circles, sweater sleeves pushed up "
"unevenly, collar crooked, headphones askew, slouched posture")

STYLE = ("ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style, exactly matching the reference "
"sheet. Big head, about 2.3 to 2.4 heads tall in total, slightly shorter and younger-looking than the young PM; "
"large expressive eyes with highlights, an eager youthful look; small nose and mouth; clean dark-brown pixel outline "
"(not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; consistent top-left light. "
"Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, small grey "
"puff, exclamation mark, question mark) are drawn next to a figure only where a cell asks for them.")

def LAYOUT(cols, rows, portrait_first):
    s = (f"LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly {cols} columns x {rows} rows "
         f"= {cols*rows} cells, packed like a professional game asset sheet: each figure fills most of its cell but never "
         "touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared "
         "baseline. Figures face LEFT in a 3/4 view (the PM, who faces right, talks to Linh face to face) unless a cell says "
         "otherwise. Reading order: left to right, top to bottom. ")
    if portrait_first:
        s += ("Cell 1 (top-left) is special: a head-and-shoulders portrait inside a rounded-square frame with a thin dark "
              "outline and a soft pastel-lavender background with a few sparkles, the character with a bright eager smile, "
              "holding the closed laptop against the chest. Cell 1 is the ONLY cell with a background; every other cell is a "
              "full-body figure on pure white.")
    return s

OBJECT_RULE = ("OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites "
"that will be placed by code. Wherever a cell mentions a folder, document, contract, tablet, phone, notebook, pen, mug, "
"clicker, marker, checklist, badge held in the hand, chair, desk, table, whiteboard or screen, do NOT draw that object. "
"Instead draw the empty hand(s) in the exact grip pose as if holding it, and the body sitting at the correct height as if "
"on the invisible furniture. Keep the worn lanyard badge and the headphones around the neck as part of the character. MARKER DOTS: small "
"solid round dots about 1.5% of the cell width, flat color, no outline, no shading, drawn on top of the character. "
"MAGENTA #FF00FF = grip point of the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = "
"grip point of a second object held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they "
"touch the seat) for sitting poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no "
"dots. Never use these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw "
"grid lines or cell borders (except the frame of the portrait cells); add scenery, floor or walls; add extra characters "
"(the PM and other team members are offscreen); crop limbs; repeat an identical pose; change the face, hair, "
"outfit colors or proportions between cells; use pure white for clothing edges that touch the background.")

# Moi o bam mot canh Linh xuat hien trong kich ban (docs/KICH_BAN_ROLECRAFT_PM60.md).
# Doi chieu day du: mapping_section.md.
# ---------------------------------------------------------------- sheet A – master
A = [
 ("Row 1 - Portrait + idle + greeting", [
  ("portrait","[portrait cell, see LAYOUT] bright eager smile, closed laptop against the chest, a few sparkles"),
  ("idle_01","idle loop 1/4: standing, closed laptop held against the chest with both arms"),
  ("idle_02","idle loop 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03","idle loop 3/4: small curious head tilt"),
  ("idle_back_01","standing seen from behind (back view), laptop under the right arm"),
  ("idle_04","idle loop 4/4: slight exhale, attentive face"),
  ("greet_01","cheerful small wave"),("greet_02","quick polite bow of the head, eager smile")]),
 ("Row 2 - Walk cycle 8 frames, light quick steps, closed laptop under the right arm, left arm swings", [
  ("walk_01","walk contact: left foot forward heel touching"),("walk_02","walk down: weight on left leg, knee bent"),
  ("walk_03","walk passing: right leg passing the left"),("walk_04","walk up: rising on left toes"),
  ("walk_05","walk contact: right foot forward heel touching"),("walk_06","walk down: weight on right leg, knee bent"),
  ("walk_07","walk passing: left leg passing the right"),("walk_08","walk up: rising on right toes")]),
 ("Row 3 - Talking + listening (dialogue loops, hands free)", [
  ("talk_01","talking, one hand open at chest height, a little shy"),("talk_02","talking, both hands moving, explaining eagerly"),
  ("talk_03","talking, pointing to self, 'I can help'"),("talk_04","talking, hand returning down, small smile"),
  ("listen_01","listening, hands clasped in front, attentive"),("listen_02","listening, head tilted, finger on the chin"),
  ("nod_01","eager nod"),("nod_02","nodding, chin lifted back up")]),
 ("Row 4 - Sit on an invisible office chair (same seat height in every sit cell)", [
  ("sit_01","standing next to the chair, about to sit"),("sit_02","lowering onto the chair"),
  ("sit_03","seated upright, hands on the knees"),("sit_04","seated, hunched forward, focused"),
  ("sit_05","seated, leaning back, stretching the arms"),("sit_06","standing up quickly from the chair"),
  ("sit_07","seated, headphones pulled up over the ears, focused"),("sit_08","seated, headphones pushed down to listen")]),
 ("Row 5 - Positive reactions", [
  ("eager_01","eager, both fists at chest height, bright eyes"),("happy_01","happy smile, small sparkles"),
  ("proud_01","proud smile, hand on the chest (the deploy checklist works)"),("relieved_01","relieved exhale, shoulders dropping"),
  ("determined_01","determined nod, small fist, 'I will try'"),("thankful_01","thankful small bow, hands together"),
  ("confident_01","confident stance, chin up, small smile"),("excited_01","small excited hop, sparkles")]),
 ("Row 6 - Worried / ashamed reactions (after the mistake, publicly blamed, overload)", [
  ("worried_01","worried, hands clasped at the chest, one sweat drop"),("anxious_01","anxious, biting the lip, looking aside"),
  ("ashamed_01","head down, shoulders hunched, ashamed"),("ashamed_02","hiding the face with one hand, embarrassed"),
  ("apologize_01","deep apologetic bow"),("apologize_02","rising from the bow, eyes lowered, 'I am sorry'"),
  ("hesitant_01","hesitant, fingers fidgeting, 'I am not sure I am experienced enough'"),("stressed_01","stressed, both hands on the head, small grey swirl")]),
 ("Row 7 - Unsure, asking, trying", [
  ("unsure_01","unsure, scratching the back of the head"),("confused_01","confused, small question mark"),
  ("ask_01","raising a hand to ask a question"),("ask_02","hand half raised, shy"),
  ("busy_01","showing both hands full, 'my tasks this week are already full'"),("try_01","small fist, nervous smile, 'I will try, but the team is stretched'"),
  ("accept_01","hand on the chest, 'I want to try taking that module'"),("breath_01","deep breath, eyes closed, gathering courage")]),
]

# ---------------------------------------------------------------- sheet B – ban lam viec, OT, tai lieu, cu chi
B = [
 ("Row 1 - At the desk (desk, monitor and chair are invisible; the desk would be on the LEFT; same seat height in every cell)", [
  ("desk_type_01","seated, typing code, focused"),("desk_type_02","seated, typing, glancing at the monitor"),
  ("desk_fix_01","seated, small victory fist: a bug fixed"),("desk_think_01","seated, chin on the hand, reading code"),
  ("desk_push_01","seated, pressing Enter to push the code"),("desk_panic_01","seated, frozen, eyes wide at the monitor, exclamation mark"),
  ("desk_panic_02","seated, both hands on the head, panicking"),("desk_stand_01","standing up from the desk in alarm")]),
 ("Row 2 - OUTFIT FOR THIS ROW: " + VARIANT_TIRED + ". Overtime at night (desk, lamp, mugs and chair invisible; warm lamp light from the left on the character only)", [
  ("night_type_01","seated, typing late at night, tired eyes"),("night_type_02","seated, typing, yawning"),
  ("night_rub_01","seated, rubbing the eyes"),("tired_idle_01","standing, tired, shoulders slumped"),
  ("tired_idle_02","standing, tired, small sway"),("tired_talk_01","tired, talking with a weak smile, 'the team is already stretched'"),
  ("tired_yawn_01","big yawn, hand over the mouth"),("tired_slump_01","slumped over the desk, forehead on the arms")]),
 ("Row 3 - Checklist and documents (runs the process docs as a newcomer; owns the deploy / onboarding checklist)", [
  ("checklist_read_01","reading a checklist sheet"),("checklist_tick_01","ticking a checklist item with a pen"),
  ("checklist_tick_02","ticking the next item, nodding"),("checklist_show_01","proudly holding up the checklist"),
  ("note_01","writing notes in a notebook"),("tab_read_01","reading documentation on the tablet"),
  ("guide_01","pointing at the checklist, guiding a newcomer offscreen"),("laptop_show_01","holding the open laptop, screen turned toward the viewer")]),
 ("Row 4 - Mistake moment (L3 S11: pushed the wrong code, test data lost)", [
  ("mistake_shock_01","standing, hands on the cheeks, shocked"),("mistake_confess_01","approaching with a clasped laptop, 'I pushed the wrong code…'"),
  ("blamed_01","standing, head bowed, being criticized in front of the team"),("blamed_02","standing, shrinking, clutching the laptop, eyes wet"),
  ("forgiven_01","small relieved smile, 'thank you'"),("analyze_01","pointing at the open laptop screen, explaining the cause"),
  ("analyze_02","explaining, counting the missed steps on the fingers"),("resolve_01","determined nod, checklist in hand")]),
]

# ---------------------------------------------------------------- sheet C – ngoi hop va 1-1
C = [
 ("Row 1 - Seated at an invisible round meeting table on the LEFT (L2 S05, L2 S06, L4 S13; chair and table invisible, same seat height)", [
  ("meet_table_listen_01","seated, listening, notebook on the table"),("meet_table_listen_02","seated, writing notes while listening"),
  ("meet_table_talk_01","seated, talking with an open hand"),("meet_table_busy_01","seated, apologetic smile, 'my tasks are full this week'"),
  ("meet_table_try_01","seated, small fist, tired smile, 'I will try'"),("meet_table_report_01","seated, reporting: 'I fixed the bugs in my tasks'"),
  ("meet_table_unsure_01","seated, unsure what can be decided alone"),("meet_table_volunteer_01","seated, raising a hand to volunteer for the checklist")]),
 ("Row 2 - One-on-one: seated on an invisible chair, no table (L3 S11 option C, L4 S14)", [
  ("oneone_listen_01","seated, listening, notebook on the knee"),("oneone_listen_02","seated, listening, nodding slowly"),
  ("oneone_talk_01","seated, 'I want bigger tasks and to become a full developer'"),("oneone_unsure_01","seated, looking down, 'does the team still trust me?'"),
  ("oneone_proud_01","seated, showing the deploy checklist proudly"),("oneone_agree_01","seated, agreeing, 'I want clear criteria to track my progress'"),
  ("oneone_accept_01","seated, accepting the module, 'I will need reviews at the first milestones'"),("oneone_confused_01","seated, 'I still do not know what to improve'")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral","neutral"),("face_eager","eager, bright eyes"),("face_happy","happy smile"),("face_proud","proud smile")]),
 ("Row 2", [("face_shy","shy smile, slight blush"),("face_unsure","unsure, small awkward smile"),("face_confused","confused, head tilted"),("face_thinking","thinking, eyes looking up")]),
 ("Row 3", [("face_worried","worried, eyebrows tilted"),("face_anxious","anxious, biting the lip"),("face_shocked","shocked, mouth open"),("face_panic","panicking, sweat drops")]),
 ("Row 4", [("face_ashamed","ashamed, eyes lowered"),("face_sorry","apologetic, eyes wet"),("face_tired","tired, dark circles"),("face_relieved","relieved exhale")]),
 ("Row 5", [("face_determined","determined"),("face_confident","confident small smile"),("face_thankful","thankful, gentle smile"),("face_hesitant","hesitant, looking aside")]),
]

SHEETS = [
 {"id":"A","key":"master","cols":8,"rows":7,"attach":"photo+pm","grid":A,"portrait_first":True,
  "task":"framed portrait, idle and greeting, walk cycle, talking and listening, sitting, and reactions",
  "title":"Master: chân dung, đứng, chào, đi, nói/nghe, ngồi, cảm xúc"},
 {"id":"B","key":"desk_work","cols":8,"rows":4,"attach":"master","grid":B,
  "task":"coding at the desk and pushing the wrong code, night overtime in a tired variant, checklists and documents, and the mistake moment",
  "title":"Bàn code, OT (biến thể mệt), checklist/tài liệu, khoảnh khắc push nhầm"},
 {"id":"C","key":"meetings","cols":8,"rows":2,"attach":"master","grid":C,
  "task":"seated at the meeting table and in one-on-one talks",
  "title":"Ngồi họp và 1-1"},
 {"id":"D","key":"portraits","cols":4,"rows":5,"attach":"master","grid":D,"portrait":True,
  "task":"20 framed facial-expression portraits for a dialogue box","title":"20 chân dung cảm xúc cho hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua sheet P, O cua PM)
def P(id, at="grip", z="front", rot=0): return {"prop": id, "at": at, "z": z, "rot": rot}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
MCHAIR, MTABLE = F("meeting_chair"), F("meeting_table", z="front")
CHAIR, DESK = F("office_chair"), F("desk_monitor", z="front")
NIGHT = [CHAIR, DESK, P("lamp_on", "surface:desk_monitor", "front"), P("mugs_pair", "surface:desk_monitor", "front")]
RULES = [  # (regex, bindings) – khop dau tien
 (r"portrait$|^face_", []),
 (r"^idle_0|^walk_|mistake_confess|blamed_02", [P("laptop_closed")]),
 (r"idle_back", [P("laptop_closed")]),
 (r"sit_01", [F("office_chair", "beside_left")]),
 (r"^sit_", [CHAIR]),
 (r"desk_stand", [F("desk_monitor", "beside_left")]),
 (r"^desk_", [CHAIR, DESK]),
 (r"^night_|tired_slump", NIGHT),
 (r"checklist_tick", [P("checklist_sheet"), P("pen", "grip2")]),
 (r"checklist_|guide_|resolve_", [P("checklist_sheet")]),
 (r"note_", [P("notebook_open"), P("pen", "grip2")]),
 (r"tab_read", [P("tablet_back")]),
 (r"laptop_show|analyze_01", [P("laptop_open_front")]),
 (r"meet_table_listen_01", [F("meeting_chair"), F("meeting_table", z="front"), P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_listen_02", [F("meeting_chair"), F("meeting_table", z="front"), P("pen"), P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_", [F("meeting_chair"), F("meeting_table", z="front")]),
 (r"oneone_listen_01", [F("meeting_chair"), P("notebook_open")]),
 (r"oneone_proud", [F("meeting_chair"), P("checklist_sheet")]),
 (r"oneone_", [F("meeting_chair")]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green", "seat": "cyan"}
WORD = {"folder": "folder", "contract": "page", "tablet": "tablet", "phone": "phone", "notebook": "notebook", "pen": "pen",
        "badge": "badge", "task": "card", "clicker": "clicker", "marker": "marker", "checklist": "checklist", "mug": "mug", "laptop": "laptop", "lamp": "lamp", "mugs": "mugs"}
def marker_tag(name):
    ms = []
    for x in bindings(name):
        at = x["at"]
        if at not in LABEL: continue
        if at == "seat":
            if "cyan = seat" not in ms: ms.append("cyan = seat")
        else:
            ms.append(f"{LABEL[at]} = {WORD.get(x['prop'].split('_')[0], x['prop'])}")
    return ("  [markers: " + "; ".join(ms) + "]") if ms else ""

# ---------------------------------------------------------------- dung prompt
def cells(s):
    out, n = [], 0
    for r, (title, row) in enumerate(s["grid"]):
        for c, (name, desc) in enumerate(row):
            n += 1
            out.append({"index": n, "row": r + 1, "col": c + 1, "name": name, "desc": desc})
    return out

def content(s):
    lines, n = [], 0
    for title, row in s["grid"]:
        parts = []
        for name, desc in row:
            n += 1
            tag = "" if s.get("portrait") or name == "portrait" else marker_tag(name)
            parts.append(f"({n}) {desc}{tag}")
        lines.append(f"{title}: " + "; ".join(parts) + ".")
    return "\n".join(lines)

def prompt(s):
    cols, rows = s["cols"], s["rows"]
    kind = "portrait sheet (head-and-shoulders, framed)" if s.get("portrait") else "sprite sheet"
    parts = [f"TASK: create a {cols}x{rows} chibi pixel-art game {kind} of the person in the attached photo, dressed as "
             f"Linh, the junior frontend developer in the young PM's team. Sheet content: {s['task']}.",
             ATTACH_A if s["attach"] == "photo+pm" else ATTACH_MASTER, IDENTITY, OUTFIT, STYLE]
    if s.get("portrait"):
        parts.append(f"LAYOUT: portrait sheet, square 1:1, pure white background outside the frames. Exactly {cols} columns x "
            f"{rows} rows = {cols*rows} cells. Every cell is a head-and-shoulders portrait of the same character inside a "
            "rounded-square frame with a thin dark outline and a soft pastel-lavender background, identical frame size and "
            "crop in every cell, exactly like the portrait in cell 1 of the master sheet. Character faces the viewer, "
            "turned slightly left, hands empty unless an expression says otherwise. Frames never touch. Reading order left "
            "to right, top to bottom.")
        parts.append("EXPRESSIONS:\n" + content(s))
    else:
        parts += [LAYOUT(cols, rows, s.get("portrait_first", False)), OBJECT_RULE, "CELLS:\n" + content(s)]
    parts.append(NEG)
    return "\n\n".join(parts)

FPS = {"idle": (6, True), "walk": (11, True), "talk": (6, True), "listen": (4, True), "nod": (7, True), "sit": (8, False),
       "desk_type": (8, True), "desk_panic": (8, False), "night_type": (6, True), "tired_idle": (5, True),
       "apologize": (6, False), "ashamed": (4, False), "blamed": (4, True), "checklist_tick": (6, False),
       "analyze": (6, False), "meet_table_listen": (4, True), "oneone_listen": (4, True), "ask": (6, False)}

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    man = {"version": 3, "character": {"id": "LINH", "role": "JUNIOR_DEV", "name": "Linh – Junior Frontend Developer"},
           "shared": {"note": "Đồ vật, nội thất, icon dùng lại sheet P, O, F của bộ PM (docs/PM): prop/*, furn/*, icon/*"},
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}}
    for s in SHEETS:
        open(f"{OUT}/prompts/LINH_{s['id']}_{s['key']}.txt", "w").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"linh/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        man["sheets"].append({"id": s["id"], "key": s["key"], "kind": "linh", "file": f"LINH_{s['id']}_{s['key']}.png",
                              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl})
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (8, False) if len(fr) > 1 else (1, False))
            man["animations"][f"linh/{k}"] = {"frames": [f"linh/{f}" for f in fr], "fps": fps, "loop": loop}
    json.dump(man, open(f"{OUT}/linh_sprite_manifest.json", "w"), ensure_ascii=False, indent=1)
    n = sum(len(cells(s)) for s in SHEETS)
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation -> prompts/ + linh_sprite_manifest.json")

if __name__ == "__main__":
    main()
