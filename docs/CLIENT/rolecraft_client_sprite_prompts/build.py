# -*- coding: utf-8 -*-
# Bo prompt sprite CHI MAI (CLIENT – Dai dien khach hang/PO), cung co che v3 voi bo PM (docs/PM):
# nhan vat ve tay khong + cham neo, do vat / noi that / icon DUNG LAI sheet P, O, F cua PM.
#     python3 build.py        # sinh prompts/MAI_*.txt + mai_sprite_manifest.json
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

OUTFIT = ("OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): Chi Mai, the "
"client representative / product owner from the customer company, a composed businesswoman around forty. Soft cream "
"blouse; tailored wine-red blazer, worn open; dark navy tailored trousers; low black block heels; small pearl stud "
"earrings; a thin gold wristwatch on the left wrist. A grey lanyard around the neck with a plain white VISITOR badge card "
"at the chest (blank, no text) — she visits the vendor's office. Signature prop: a smartphone, always at hand. It is added "
"later by code, so do NOT draw it (except in the framed portrait cell).")

STYLE = ("ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style, exactly matching the reference "
"sheet. Big head, about 2.4 to 2.5 heads tall in total, same height as the young PM; "
"expressive eyes with highlights but a more mature, composed look; small nose and mouth; clean dark-brown pixel outline "
"(not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; consistent top-left light. "
"Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, small grey "
"puff, exclamation mark, question mark) are drawn next to a figure only where a cell asks for them.")

def LAYOUT(cols, rows, portrait_first):
    s = (f"LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly {cols} columns x {rows} rows "
         f"= {cols*rows} cells, packed like a professional game asset sheet: each figure fills most of its cell but never "
         "touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared "
         "baseline. Figures face LEFT in a 3/4 view (she sits opposite the PM at the meeting table; the PM faces right) unless a cell says "
         "otherwise. Reading order: left to right, top to bottom. ")
    if portrait_first:
        s += ("Cell 1 (top-left) is special: a head-and-shoulders portrait inside a rounded-square frame with a thin dark "
              "outline and a soft pastel-mint background with a few sparkles, the character with a polite professional smile, "
              "holding the smartphone near the chest. Cell 1 is the ONLY cell with a background; every other cell is a "
              "full-body figure on pure white.")
    return s

OBJECT_RULE = ("OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites "
"that will be placed by code. Wherever a cell mentions a folder, document, contract, tablet, phone, notebook, pen, mug, "
"clicker, marker, checklist, badge held in the hand, chair, desk, table, whiteboard or screen, do NOT draw that object. "
"Instead draw the empty hand(s) in the exact grip pose as if holding it, and the body sitting at the correct height as if "
"on the invisible furniture. Keep the worn visitor badge, earrings and wristwatch as part of the character. MARKER DOTS: small "
"solid round dots about 1.5% of the cell width, flat color, no outline, no shading, drawn on top of the character. "
"MAGENTA #FF00FF = grip point of the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = "
"grip point of a second object held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they "
"touch the seat) for sitting poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no "
"dots. Never use these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw "
"grid lines or cell borders (except the frame of the portrait cells); add scenery, floor or walls; add extra characters "
"(the PM and the vendor team are offscreen); crop limbs; repeat an identical pose; change the face, hair, "
"outfit colors or proportions between cells; use pure white for clothing edges that touch the background.")

# Moi o bam mot canh Chi Mai xuat hien trong kich ban (docs/KICH_BAN_ROLECRAFT_PM60.md).
# Doi chieu day du: mapping_section.md.
# ---------------------------------------------------------------- sheet A – master
A = [
 ("Row 1 - Portrait + idle + polite greeting", [
  ("portrait","[portrait cell, see LAYOUT] polite professional smile, smartphone near the chest, a few sparkles"),
  ("idle_01","idle loop 1/4: upright poised stance, smartphone held loosely in the right hand"),
  ("idle_02","idle loop 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03","idle loop 3/4: glancing briefly at the smartphone"),
  ("idle_back_01","standing seen from behind (back view), smartphone in the right hand"),
  ("idle_04","idle loop 4/4: slight exhale, attentive face"),
  ("greet_01","polite nod with a small smile, hands together in front"),
  ("greet_02","friendly open palm greeting, 'hello team'")]),
 ("Row 2 - Walk cycle 8 frames, brisk business pace, smartphone in the right hand, left arm swings (arrives at the vendor's meeting room)", [
  ("walk_01","walk contact: left foot forward heel touching"),("walk_02","walk down: weight on left leg, knee bent"),
  ("walk_03","walk passing: right leg passing the left"),("walk_04","walk up: rising on left toes"),
  ("walk_05","walk contact: right foot forward heel touching"),("walk_06","walk down: weight on right leg, knee bent"),
  ("walk_07","walk passing: left leg passing the right"),("walk_08","walk up: rising on right toes")]),
 ("Row 3 - Talking + listening (dialogue loops, hands free)", [
  ("talk_01","talking, right hand open at chest height"),("talk_02","talking, both hands slightly open, explaining a business need"),
  ("talk_03","talking, index finger raised making a point"),("talk_04","talking, hand returning down, small smile"),
  ("listen_01","listening, arms loosely crossed, attentive"),("listen_02","listening, head tilted, one hand on the chin"),
  ("nod_01","nodding, accepting"),("nod_02","nodding, chin lifted back up")]),
 ("Row 4 - Sit down on an invisible meeting chair (same seat height in every sit cell) + leaving", [
  ("sit_01","standing next to the chair, about to sit"),("sit_02","lowering onto the chair"),
  ("sit_03","seated upright, hands resting on the lap"),("sit_04","seated leaning back, arms crossed, waiting for an answer"),
  ("sit_05","seated leaning forward, fingers laced, expectant"),("sit_06","standing up from the chair"),
  ("leave_01","turning away to leave, polite nod over the shoulder"),("leave_02","walking away seen from behind, smartphone at the ear")]),
 ("Row 5 - Positive reactions ('Tốt, vậy bên chị chờ…', 'chị có thể chấp nhận', 'đánh giá tích cực kết quả')", [
  ("pleased_01","pleased smile, small nod"),("pleased_02","pleased, hands clasped together, sparkles"),
  ("agree_01","agreeing, open palm forward"),("agree_02","conditional agreement: nodding with one finger raised"),
  ("impressed_01","eyebrows raised, pleasantly impressed"),("warm_01","warm cooperative smile, hand on the chest"),
  ("eager_01","eager, leaning slightly forward with bright eyes, proposing something new"),("relieved_01","relieved exhale, hand on the chest")]),
 ("Row 6 - Pressure and dissatisfaction (complaint, rigid refusal, deadline pressure, incident)", [
  ("frown_01","frowning, arms crossed tightly"),("displeased_01","displeased, lips pressed, looking aside ('hơi cứng nhắc')"),
  ("skeptical_01","skeptical raised eyebrow, hand on the hip"),("impatient_01","impatient, checking the wristwatch, 'I need a plan today'"),
  ("defensive_01","defensive, both palms raised, 'you cannot push all the responsibility to us'"),("worried_01","worried, hand at the mouth, one sweat drop"),
  ("stern_01","stern straight face, hands clasped in front"),("sigh_01","sighing, eyes closed, small grey puff")]),
 ("Row 7 - Asking and negotiating stances", [
  ("request_01","asking for more: two fingers up, 'two more features for the demo'"),("assume_01","casual dismissive wave, confident smile, 'surely only a few more days'"),
  ("demand_01","palm down, firm, 'an official plan today'"),("think_01","thinking, hand on the chin, looking up"),
  ("think_02","thinking, weighing the impact, eyes narrowed"),("weigh_01","both palms up like a scale, weighing the options"),
  ("point_01","open hand toward the viewer, 'your proposal?'"),("open_01","both hands open, 'let us find a solution together'")]),
]

# ---------------------------------------------------------------- sheet B – cam nam + cu chi
B = [
 ("Row 1 - Documents: requirements, acceptance criteria, roadmap", [
  ("doc_carry_01","document folder tucked under the left arm"),("doc_show_01","holding up a requirement page, 'we described this flow clearly'"),
  ("doc_show_02","tapping the page with the finger, insistent"),("doc_read_01","reading an open folder (change request, estimate, roadmap)"),
  ("doc_read_02","reading the open folder, thoughtful frown"),("doc_point_01","pointing at a line in the open folder"),
  ("doc_sign_01","signing the acceptance criteria on the folder with a pen"),("doc_give_01","handing a document forward")]),
 ("Row 2 - Tablet: training schedule and expansion scope", [
  ("tab_hold_01","holding the tablet at chest height"),("tab_read_01","reading the tablet, calm"),
  ("tab_read_02","reading the tablet, frowning (the feature works differently)"),("tab_present_01","turning the tablet screen toward the viewer (training schedule)"),
  ("tab_present_02","tablet turned, pointing at the screen (new module scope)"),("tab_swipe_01","swiping on the tablet screen, which faces the viewer"),
  ("tab_calendar_01","tapping a date on the tablet, 'training is planned on release day'"),("tab_tuck_01","tucking the tablet under the arm")]),
 ("Row 3 - Phone: incident, calls with the PM, confirmations", [
  ("phone_call_01","phone at the ear, listening"),("phone_call_02","phone at the ear, talking, free hand open"),
  ("phone_urgent_01","phone at the ear, urgent and upset, free hand raised (production problem)"),("phone_calm_01","phone at the ear, calming down, small nod"),
  ("phone_read_01","reading a message on the phone"),("phone_type_01","typing a confirmation on the phone"),
  ("phone_show_01","showing the phone screen toward the viewer"),("phone_pocket_01","putting the phone into the blazer pocket")]),
 ("Row 4 - Meeting etiquette and counting", [
  ("shake_01","reaching out the right hand for a handshake"),("shake_02","handshake, polite smile"),
  ("count_01","one finger up"),("count_02","two fingers up, 'two features' / 'two phases'"),
  ("timeline_01","hand sliding sideways in the air, 'within this month'"),("budget_01","hand raised flat, 'we can submit the budget'"),
  ("wave_01","small goodbye wave"),("bow_01","polite slight bow")]),
]

# ---------------------------------------------------------------- sheet C – ngoi hop theo kich ban
C = [
 ("Row 1 - Kickoff meeting, L1 S03: seated at an invisible round meeting table on the LEFT (chair and table invisible, same seat height)", [
  ("meet_table_request_01","seated, asking to add two features to the demo, two fingers up"),("meet_table_assume_01","seated, casual confident smile, 'only a few more days, right?'"),
  ("meet_table_listen_01","seated, listening, hands on the table"),("meet_table_listen_02","seated, writing notes while listening"),
  ("meet_table_pleased_01","seated, pleased: 'we will wait for the demo with both features'"),("meet_table_displeased_01","seated, displeased, leaning back ('rather rigid')"),
  ("meet_table_consider_01","seated, considering: 'I need to know the impact first'"),("meet_table_talk_01","seated, talking with an open hand")]),
 ("Row 2 - Release meeting, L2 S06 (same table)", [
  ("meet_table_schedule_01","seated, showing the training schedule on the tablet"),("meet_table_demand_01","seated, palm on the table, 'I need an official plan today'"),
  ("meet_table_impatient_01","seated, tapping the table with the fingers, impatient"),("meet_table_ok_01","seated, satisfied nod: 'we keep the training schedule'"),
  ("meet_table_doubt_01","seated, skeptical: 'are these three days really reducing risk?'"),("meet_table_accept_01","seated, conditional acceptance, one finger raised"),
  ("meet_table_talk_02","seated, leaning in, explaining"),("meet_table_note_01","seated, writing a note")]),
 ("Row 3 - Complaint meeting, L2 S08 (same table)", [
  ("complain_01","seated, pointing at the requirement page on the table, upset"),("complain_02","seated, both hands open, 'this is not how we understood it'"),
  ("complain_demand_01","seated, 'I do not want to hear who is right, I want a solution'"),("defend_01","seated, arms crossed, rejecting the blame"),
  ("cooperate_01","seated, acknowledging the cooperative attitude, 'I need a concrete date'"),("resolve_01","seated, agreeing to clear shared responsibilities"),
  ("confirm_01","seated, typing a confirmation on the phone, 'I will confirm today'"),("solution_01","seated, open palms, 'let both sides look for a solution'")]),
 ("Row 4 - Expansion meeting, L4 S15 (same table)", [
  ("propose_01","seated, proposing a new reporting module, enthusiastic"),("propose_02","seated, showing the scope on the tablet"),
  ("budget_submit_01","seated, 'if we agree this week, I can submit the budget this month'"),("principle_ok_01","seated, agreeing in principle, 'I need a concrete milestone'"),
  ("phase_ok_01","seated, pleased: 'phasing worked well with the MVP before'"),("value_check_01","seated, one finger raised: 'phase 1 must bring real value'"),
  ("satisfied_01","seated, satisfied smile, hands folded"),("shake_seated_01","seated, reaching across the table for a handshake")]),
 ("Row 5 - Level 3 moments (spec: CLIENT joins S09 production incident and S10 sales over-commitment)", [
  ("incident_call_01","standing, phone at the ear, alarmed, operations are affected"),("incident_call_02","standing, phone at the ear, demanding updates"),
  ("incident_angry_01","standing, hands on the hips, upset"),("incident_calm_01","standing, relieved after the rollback, phone lowered"),
  ("promise_expect_01","standing, expectant smile: the AI feature was promised in 10 days"),("promise_shock_01","shocked and annoyed: the PM says Sales promised wrongly"),
  ("promise_ok_01","nodding at the MVP + estimated phase 2 plan"),("promise_listen_01","listening, arms crossed, evaluating")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral","neutral, composed"),("face_polite","polite professional smile"),("face_pleased","pleased smile"),("face_eager","eager, bright eyes, proposing something new")]),
 ("Row 2", [("face_assume","casual confident smile, 'it is simple, right?'"),("face_concerned","concerned, eyebrows tilted"),("face_worried","worried, hand near the mouth"),("face_frown","frowning, displeased")]),
 ("Row 3", [("face_annoyed","annoyed, eyes narrowed"),("face_stern","stern, straight mouth"),("face_skeptical","one eyebrow raised, skeptical"),("face_impatient","impatient, glancing at the watch")]),
 ("Row 4", [("face_thinking","thinking, eyes looking up"),("face_conditional","conditional agreement, eyebrow up, slight smile"),("face_satisfied","satisfied closed-eye smile"),("face_relieved","relieved exhale")]),
 ("Row 5", [("face_cooperative","cooperative warm smile"),("face_shocked","shocked, mouth open"),("face_firm","firm, determined"),("face_formal","formal, neutral")]),
]

SHEETS = [
 {"id":"A","key":"master","cols":8,"rows":7,"attach":"photo+pm","grid":A,"portrait_first":True,
  "task":"framed portrait, idle and greeting, walk cycle, talking and listening, sitting down and leaving, and reactions",
  "title":"Master: chân dung, đứng, chào, đi, nói/nghe, ngồi, rời đi, cảm xúc"},
 {"id":"B","key":"hands_gestures","cols":8,"rows":4,"attach":"master","grid":B,
  "task":"requirement documents, tablet with the training schedule and scope, phone calls and confirmations, handshake and counting gestures",
  "title":"Tài liệu yêu cầu, tablet, điện thoại, bắt tay/đếm"},
 {"id":"C","key":"meetings","cols":8,"rows":5,"attach":"master","grid":C,
  "task":"seated at the meeting table in the kickoff, release, complaint and expansion meetings, and the Level 3 incident and over-commitment moments",
  "title":"Ngồi họp: kickoff, release, complain, mở rộng; Level 3"},
 {"id":"D","key":"portraits","cols":4,"rows":5,"attach":"master","grid":D,"portrait":True,
  "task":"20 framed facial-expression portraits for a dialogue box","title":"20 chân dung cảm xúc cho hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua sheet P, O cua PM)
def P(id, at="grip", z="front", rot=0): return {"prop": id, "at": at, "z": z, "rot": rot}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
MCHAIR, MTABLE = F("meeting_chair"), F("meeting_table", z="front")
RULES = [  # (regex, bindings) – khop dau tien
 (r"portrait$|^face_", []),
 (r"^idle_0|idle_back|^walk_|^leave_", [P("phone_back")]),
 (r"sit_01", [F("meeting_chair", "beside_left")]),
 (r"^sit_", [MCHAIR]),
 (r"doc_carry|doc_give", [P("folder_closed")]),
 (r"doc_show", [P("contract_sheet")]),
 (r"doc_read|doc_point", [P("folder_open")]),
 (r"doc_sign", [P("folder_closed"), P("pen", "grip2")]),
 (r"tab_present|tab_calendar", [P("tablet_screen_34")]),
 (r"tab_swipe", [P("tablet_screen_front")]),
 (r"tab_tuck", [P("tablet_edge", z="back")]),
 (r"tab_", [P("tablet_back")]),
 (r"phone_show", [P("phone_screen")]),
 (r"phone_|incident_call|incident_calm", [P("phone_back")]),
 (r"meet_table_schedule|propose_02", [MCHAIR, MTABLE, P("tablet_screen_34")]),
 (r"meet_table_listen_01", [MCHAIR, MTABLE, P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_listen_02|meet_table_note", [MCHAIR, MTABLE, P("pen"), P("notebook_open", "surface:meeting_table")]),
 (r"complain_01", [MCHAIR, MTABLE, P("contract_sheet", "surface:meeting_table")]),
 (r"confirm_01", [MCHAIR, MTABLE, P("phone_back")]),
 (r"meet_table_|complain_|defend_|cooperate_|resolve_|solution_|propose_|budget_submit|principle_ok|phase_ok|value_check|satisfied_|shake_seated", [MCHAIR, MTABLE]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green", "seat": "cyan"}
WORD = {"folder": "folder", "contract": "page", "tablet": "tablet", "phone": "phone", "notebook": "notebook", "pen": "pen",
        "badge": "badge", "task": "card", "clicker": "clicker", "marker": "marker", "checklist": "checklist", "mug": "mug"}
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
             f"Chi Mai, the client representative / product owner who works with the young PM's team. Sheet content: {s['task']}.",
             ATTACH_A if s["attach"] == "photo+pm" else ATTACH_MASTER, IDENTITY, OUTFIT, STYLE]
    if s.get("portrait"):
        parts.append(f"LAYOUT: portrait sheet, square 1:1, pure white background outside the frames. Exactly {cols} columns x "
            f"{rows} rows = {cols*rows} cells. Every cell is a head-and-shoulders portrait of the same character inside a "
            "rounded-square frame with a thin dark outline and a soft pastel-mint background, identical frame size and "
            "crop in every cell, exactly like the portrait in cell 1 of the master sheet. Character faces the viewer, "
            "turned slightly left, hands empty unless an expression says otherwise. Frames never touch. Reading order left "
            "to right, top to bottom.")
        parts.append("EXPRESSIONS:\n" + content(s))
    else:
        parts += [LAYOUT(cols, rows, s.get("portrait_first", False)), OBJECT_RULE, "CELLS:\n" + content(s)]
    parts.append(NEG)
    return "\n\n".join(parts)

FPS = {"idle": (6, True), "walk": (10, True), "talk": (6, True), "listen": (4, True), "nod": (6, True), "sit": (8, False),
       "leave": (6, False), "pleased": (6, False), "phone_call": (6, True), "shake": (6, False), "count": (6, False),
       "meet_table_listen": (4, True), "meet_table_talk": (6, True), "complain": (6, True), "propose": (6, False),
       "incident_call": (6, True)}

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    man = {"version": 3, "character": {"id": "MAI", "role": "CLIENT", "name": "Chị Mai – Đại diện khách hàng/PO"},
           "shared": {"note": "Đồ vật, nội thất, icon dùng lại sheet P, O, F của bộ PM (docs/PM): prop/*, furn/*, icon/*"},
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}}
    for s in SHEETS:
        open(f"{OUT}/prompts/MAI_{s['id']}_{s['key']}.txt", "w").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"mai/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        man["sheets"].append({"id": s["id"], "key": s["key"], "kind": "mai", "file": f"MAI_{s['id']}_{s['key']}.png",
                              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl})
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (8, False) if len(fr) > 1 else (1, False))
            man["animations"][f"mai/{k}"] = {"frames": [f"mai/{f}" for f in fr], "fps": fps, "loop": loop}
    json.dump(man, open(f"{OUT}/mai_sprite_manifest.json", "w"), ensure_ascii=False, indent=1)
    n = sum(len(cells(s)) for s in SHEETS)
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation -> prompts/ + mai_sprite_manifest.json")

if __name__ == "__main__":
    main()
