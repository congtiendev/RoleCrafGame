# -*- coding: utf-8 -*-
# Bo prompt sprite LAN (QA_BA – BA/QA: can than, quan tam requirement, quy trinh va chat luong), cung co che v3 voi
# bo PM (docs/PM) va bo MINH (docs/MINH): nhan vat ve tay khong + cham neo, do vat / noi that / icon DUNG LAI sheet
# P, O, F cua PM. Noi dung o bam theo loi thoai cua Lan trong docs/KICH_BAN_ROLECRAFT_PM60.md (xem SCENES).
#     python3 build.py        # sinh prompts/LAN_*.txt + lan_sprite_manifest.json + README_LAN_SPRITE_PROMPTS.md
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

OUTFIT = ("OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): a careful, "
"detail-minded BA/QA analyst in their mid-twenties, a little younger than the PM, tidy and neat. Soft mint-green collared "
"shirt with the sleeves neatly folded to the forearm, tucked in; a light oatmeal-beige knit cardigan worn open; navy "
"straight-leg trousers; clean white low sneakers; a thin tan leather strap watch on the left wrist. A royal-blue lanyard "
"around the neck with a plain royal-blue ID badge card at the chest (blank, no text) — the official staff badge. "
"Signature prop: a printed test checklist sheet. It is added later by code, so do NOT draw it (except in the framed "
"portrait cell).")

STYLE = ("ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style, exactly matching the reference "
"sheet. Big head, about 2.3 to 2.5 heads tall in total (the same height as the young PM or slightly shorter, a slimmer "
"build); expressive eyes with highlights, attentive and a little cautious; small nose and mouth; clean dark-brown pixel "
"outline (not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; consistent top-left "
"light. Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, small "
"grey puff, exclamation mark, question mark) are drawn next to a figure only where a cell asks for them.")

def LAYOUT(cols, rows, portrait_first):
    s = (f"LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly {cols} columns x {rows} rows "
         f"= {cols*rows} cells, packed like a professional game asset sheet: each figure fills most of its cell but never "
         "touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared "
         "baseline. Figures face LEFT in a 3/4 view (the character usually stands opposite the PM, who faces right) unless "
         "a cell says otherwise. Reading order: left to right, top to bottom. ")
    if portrait_first:
        s += ("Cell 1 (top-left) is special: a head-and-shoulders portrait inside a rounded-square frame with a thin dark "
              "outline and a soft pastel-blue background with a few sparkles, the character with a gentle attentive smile, "
              "holding a printed checklist sheet (grey check boxes, no readable text) against the chest. Cell 1 is the "
              "ONLY cell with a background; every other cell is a full-body figure on pure white.")
    return s

OBJECT_RULE = ("OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites "
"that will be placed by code. Wherever a cell mentions a checklist, page, folder, stack of papers, laptop, tablet, phone, "
"notebook, pen, marker, sticky notes, mug, chair, desk, table, monitor or whiteboard, do NOT draw that object. Instead draw "
"the empty hand(s) in the exact grip pose as if holding it, and the body sitting at the correct height as if on the "
"invisible furniture. Keep the worn lanyard badge and the wristwatch as part of the character. MARKER DOTS: small solid "
"round dots about 1.5% of the cell width, flat color, no outline, no shading, drawn on top of the character. MAGENTA "
"#FF00FF = grip point of the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = grip "
"point of a second object held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they touch "
"the seat) for sitting poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no dots. "
"Never use these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw "
"grid lines or cell borders (except the frame of the portrait cells); add scenery, floor or walls; add extra characters "
"(the other person in a handshake, a 1-1 or a meeting is offscreen); crop limbs; repeat an identical pose; change the "
"face, hair, outfit colors or proportions between cells; use pure white for clothing edges that touch the background.")

# ---------------------------------------------------------------- sheet A – master
A = [
 ("Row 1 - Portrait + idle", [
  ("portrait","[portrait cell, see LAYOUT] gentle attentive smile, checklist sheet against the chest, a few sparkles"),
  ("idle_01","idle loop 1/4: upright tidy stance, checklist sheet held against the chest with the left arm"),
  ("idle_02","idle loop 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03","idle loop 3/4: glancing down at the checklist for a moment"),
  ("idle_back_01","standing seen from behind (back view), checklist sheet in the left hand"),
  ("idle_04","idle loop 4/4: slight exhale, calm attentive face"),
  ("greet_01","small polite bow of the head, friendly smile, hands together in front"),
  ("greet_02","small friendly wave at shoulder height, 'hello'")]),
 ("Row 2 - Walk cycle 8 frames, light careful pace, checklist sheet held against the chest with the left arm, right arm swings", [
  ("walk_01","walk contact: left foot forward heel touching"),("walk_02","walk down: weight on left leg, knee bent"),
  ("walk_03","walk passing: right leg passing the left"),("walk_04","walk up: rising on left toes"),
  ("walk_05","walk contact: right foot forward heel touching"),("walk_06","walk down: weight on right leg, knee bent"),
  ("walk_07","walk passing: left leg passing the right"),("walk_08","walk up: rising on right toes")]),
 ("Row 3 - Talking + listening (dialogue loops, hands free)", [
  ("talk_01","talking, right hand open at chest height, polite"),
  ("talk_02","talking, both hands slightly open, explaining step by step"),
  ("talk_03","talking, index finger lightly raised, 'but...' — adding a careful objection"),
  ("talk_04","talking, hand returning down, small reassuring smile"),
  ("listen_01","listening, hands loosely clasped in front, attentive"),
  ("listen_02","listening, head tilted, one hand at the chin"),
  ("nod_01","nodding, eyes half closed, agreeing"),("nod_02","nodding, chin lifted back up")]),
 ("Row 4 - Sit on an invisible office chair (same seat height in every sit cell)", [
  ("sit_01","standing next to the chair, about to sit"),
  ("sit_02","lowering onto the chair"),("sit_03","seated upright, hands resting on the knees"),
  ("sit_04","seated, leaning slightly forward, listening carefully"),("sit_05","seated, hands clasped on the lap, a little tense"),
  ("sit_06","seated, writing in a notebook on the lap with a pen"),("sit_07","seated, reading a phone held in the right hand"),
  ("sit_08","standing up from the chair")]),
 ("Row 5 - Positive reactions with small effect icons", [
  ("good_01","relieved small smile, soft nod, two golden sparkles"),("good_02","thumbs up with the right hand, 'test passed', sparkles"),
  ("good_03","quietly proud smile, hands clasped in front"),("good_04","laughing softly, hand covering the mouth"),
  ("applaud_01","applauding, hands apart"),("applaud_02","applauding, hands together"),
  ("happy_01","eyes shining, both hands clasped at the chest, 'my work is finally recognized'"),
  ("relieved_01","relieved exhale, hand on the chest, small smile")]),
 ("Row 6 - Worry, doubt and firm objections (this character's typical reactions)", [
  ("worry_01","worried eyebrows, hand at the chin, 'I'm still worried about it'"),
  ("worry_02","anxious, both hands clasped at the chest, one sweat drop"),
  ("doubt_01","doubtful, head tilted, small question mark"),
  ("object_01","raising one hand at shoulder height, hesitant but determined to object"),
  ("frown_01","frowning slightly, arms crossed over the chest"),
  ("sigh_01","sighing, shoulders dropped, small grey puff"),
  ("firm_01","firm but polite, small head shake, eyes closed, 'not confirmed yet'"),
  ("disappoint_01","disappointed, eyes lowered, lips pressed")]),
 ("Row 7 - Thinking + careful stances", [
  ("think_01","thinking, hand at the chin, looking up"),("think_02","thinking, eyes closed, finger tapping the lips"),
  ("inspect_01","leaning forward, eyes narrowed, inspecting something closely"),
  ("caution_01","index finger raised beside the face, 'wait, let's check first'"),
  ("crossarms_01","arms crossed, calm, waiting for an answer"),
  ("front_hands_01","hands politely folded in front, standing straight, ready"),
  ("stop_01","palm raised forward at chest height, calmly stopping a hasty decision"),
  ("point_01","open hand gesturing forward, 'your decision'")]),
]

# ---------------------------------------------------------------- sheet B – cam nam + cu chi
B = [
 ("Row 1 - Checklist sheet and pen (the signature prop)", [
  ("check_hold_01","holding the checklist sheet in both hands at chest height, reading"),
  ("check_tick_01","ticking an item on the checklist with a pen"),
  ("check_tick_02","ticking the next item, small satisfied nod"),
  ("check_flag_01","circling an item with the pen, frowning slightly (found a gap)"),
  ("check_tap_01","tapping the pen against the checklist, thinking"),
  ("check_show_01","turning the checklist toward the viewer to show it"),
  ("check_give_01","handing the checklist forward with both hands"),
  ("check_hug_01","hugging the checklist to the chest, small smile")]),
 ("Row 2 - Open laptop balanced on the left forearm (running test cases)", [
  ("lap_hold_01","laptop balanced on the left forearm, looking at the screen"),
  ("lap_type_01","typing with the right hand on the balanced laptop"),
  ("lap_type_02","typing, glancing up over the laptop"),
  ("lap_read_01","reading a test result on the laptop, frowning"),
  ("lap_bug_01","spotting a bug on the laptop, eyes wide, small exclamation mark"),
  ("lap_show_01","turning the laptop screen toward the viewer"),
  ("lap_show_02","laptop turned toward the viewer, pointing at the screen with the free hand"),
  ("lap_pass_01","looking at the laptop, satisfied small nod, one sparkle")]),
 ("Row 3 - Documents and requirement audit (comparing what was agreed with what was built)", [
  ("doc_read_01","reading an open folder held in both hands"),
  ("doc_read_02","reading the open folder, flipping a page"),
  ("doc_compare_01","holding two pages side by side, one in each hand, comparing them"),
  ("doc_compare_02","still holding the two pages, eyebrows raised, noticing a mismatch"),
  ("doc_raise_01","raising a single page and pointing at one line on it, 'this sentence can be read two ways'"),
  ("doc_stack_01","carrying a small stack of papers in both arms"),
  ("doc_give_01","extending a closed folder forward with both hands (the new meeting minutes)"),
  ("doc_give_02","folder handed over, hands returning, polite smile")]),
 ("Row 4 - Whiteboard and sticky notes (acceptance-criteria workshop); the whiteboard is on the LEFT", [
  ("wb_write_01","writing on the whiteboard with a marker"),("wb_write_02","writing, underlining a key point"),
  ("wb_sticky_01","sticking a sticky note onto the whiteboard"),
  ("wb_sticky_02","pressing the sticky note flat with the fingertips"),
  ("wb_point_01","pointing at the whiteboard with the marker"),("wb_point_02","tapping the board, serious"),
  ("wb_review_01","one step back from the board, hand at the chin, reviewing it"),
  ("wb_turn_01","turning back to the viewer from the board, explaining")]),
 ("Row 5 - Phone and messages", [
  ("phone_read_01","reading a message on the phone, neutral"),("phone_read_02","reading the phone, worried frown"),
  ("phone_type_01","typing a careful message with both thumbs"),
  ("phone_type_02","typing, glancing up over the phone, hesitant"),
  ("phone_call_01","phone at the ear, listening, nodding"),
  ("phone_call_02","phone at the ear, talking politely with the free hand open"),
  ("phone_alert_01","reading an alert on the phone, eyes wide, exclamation mark"),
  ("phone_pocket_01","putting the phone back into the cardigan pocket")]),
 ("Row 6 - Quality-gate gestures (hands free)", [
  ("gate_stop_01","palm pushed forward, firm face, 'no-go'"),
  ("gate_stop_02","forearms crossed in an X in front of the chest, 'not yet'"),
  ("gate_go_01","OK sign with the right hand, confident small smile, 'go'"),
  ("gate_go_02","both thumbs up, bright smile, sparkles"),
  ("two_ways_01","both palms up side by side, weighing two interpretations"),
  ("two_ways_02","tilting the head toward the higher palm, puzzled"),
  ("count_01","counting on fingers: one finger up (the critical flows)"),
  ("count_02","counting: three fingers up")]),
 ("Row 7 - Tablet (proposing the testing tool) and coffee", [
  ("tab_hold_01","holding the tablet at chest height with both hands"),
  ("tab_present_01","turning the tablet screen toward the viewer, proposing"),
  ("tab_present_02","tablet turned, pointing at the screen with the free hand"),
  ("tab_swipe_01","swiping on the tablet screen, which faces the viewer"),
  ("propose_01","open palm forward, earnest proposal"),
  ("propose_02","hands pressed together in front, 'please consider it'"),
  ("coffee_01","holding a coffee mug with both hands, relaxed"),("coffee_02","sipping the coffee, eyes closed")]),
]

# ---------------------------------------------------------------- sheet C – canh lam viec
C = [
 ("Row 1 - At the own desk running tests (desk, monitor and chair invisible; the desk would be on the LEFT)", [
  ("desk_type_01","seated, typing"),("desk_type_02","seated, typing, glancing at the monitor"),
  ("desk_bug_01","seated, leaning toward the monitor, eyes wide, small exclamation mark (bug found)"),
  ("desk_log_01","seated, typing a bug report, focused"),
  ("desk_frown_01","seated, frowning at the monitor, hand at the chin"),
  ("desk_pass_01","seated, small fist pump, sparkles (all tests pass)"),
  ("desk_stretch_01","seated, stretching both arms up, tired"),
  ("desk_turn_01","seated, turning around on the chair to talk to someone behind")]),
 ("Row 2 - Seated at an invisible round meeting table on the LEFT (client meetings; same seat height in every cell)", [
  ("meet_table_talk_01","seated at the table, talking with an open hand"),
  ("meet_table_talk_02","seated, explaining calmly, both hands on the table"),
  ("meet_table_note_01","seated, taking minutes with a pen in a notebook on the table"),
  ("meet_table_note_02","seated, writing, looking up to listen"),
  ("meet_table_show_01","seated, pointing at a line in an open folder lying on the table"),
  ("meet_table_listen_01","seated, listening, hands folded on the table"),
  ("meet_table_worry_01","seated, worried glance to the side, one sweat drop"),
  ("meet_table_agree_01","seated, nodding with a relieved smile")]),
 ("Row 3 - One-on-one with the PM: seated on an invisible chair, no table", [
  ("oneone_talk_01","seated, talking calmly"),("oneone_talk_02","seated, hand on the chest, sincere"),
  ("oneone_listen_01","seated, listening, hands on the knees"),
  ("oneone_hope_01","seated, leaning forward slightly, hopeful eyes"),
  ("oneone_relieved_01","seated, relieved smile, shoulders relaxed"),
  ("oneone_show_01","seated, showing a tablet screen to the other person"),
  ("oneone_note_01","seated, writing in a notebook on the knee"),("oneone_nod_01","seated, grateful nod")]),
 ("Row 4 - Release go / no-go (standing)", [
  ("release_check_01","reviewing the release checklist with a pen, serious"),
  ("release_check_02","ticking the last item, careful"),
  ("release_nogo_01","checklist in the left hand, right palm raised firmly, 'we can't release yet'"),
  ("release_nogo_02","serious slow head shake, checklist lowered"),
  ("release_go_01","nodding, pointing forward with an open hand, 'go'"),
  ("release_go_02","thumbs up with a bright smile, sparkles"),
  ("release_report_01","handing over the daily test report pages with both hands"),
  ("release_watch_01","standing, arms crossed, tense, watching a monitor on the LEFT after release")]),
 ("Row 5 - Incident and lost test data (standing)", [
  ("alert_01","reading an alert on the phone, shocked, exclamation mark"),
  ("alert_02","phone lowered, determined face"),
  ("incident_lap_01","typing fast on the laptop balanced on the forearm, sweat drop"),
  ("incident_calc_01","counting on the fingers, grim, estimating the recovery time"),
  ("support_01","gentle hand reaching to an offscreen shoulder, supportive"),
  ("support_02","palms down, calm reassuring smile, 'we'll fix it together'"),
  ("checklist_write_01","writing a new deploy checklist on a sheet with a pen"),
  ("checklist_show_01","holding up the finished checklist with both hands, proud")]),
 ("Row 6 - Overtime and regression pressure (standing)", [
  ("tired_01","rubbing the eyes, tired"),("tired_02","yawning, hand over the mouth"),
  ("tired_03","slumped shoulders, holding a mug, faint dark circles"),
  ("stress_01","both hands on the head, overwhelmed, sweat drops"),
  ("stress_02","staring at the checklist, sweat drop, too many items left"),
  ("breath_01","deep calming breath, eyes closed, hand on the chest"),
  ("determined_01","both fists in front, determined face"),
  ("determined_02","folding the sleeves higher, ready to work")]),
 ("Row 7 - Ownership and team endings (standing)", [
  ("own_01","hand on the chest, accepting ownership of quality"),
  ("own_02","confident nod, hands on the hips lightly"),
  ("cheer_01","cheering, both arms up, sparkles"),("cheer_02","small hop, clapping happily"),
  ("congrats_01","reaching out the right hand for a congratulating handshake"),
  ("congrats_02","handshake, warm smile"),
  ("sad_01","sad, eyes lowered, hands clasped in front"),
  ("bow_01","polite bow, respectful goodbye")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral","neutral, attentive"),("face_polite_smile","polite small smile"),("face_warm","warm friendly smile"),("face_bright","bright happy smile, sparkles")]),
 ("Row 2", [("face_laugh","laughing softly, eyes closed"),("face_serious","serious, straight mouth"),("face_focused","focused, eyes slightly narrowed"),("face_cautious","cautious, index finger raised into the frame")]),
 ("Row 3", [("face_worried","worried, eyebrows tilted"),("face_anxious","anxious, sweat drop"),("face_doubtful","doubtful, head tilted, small question mark"),("face_thinking","thinking, eyes looking up")]),
 ("Row 4", [("face_surprised","surprised, eyebrows up, mouth open (bug found)"),("face_frown","frowning, displeased"),("face_firm","firm, determined, lips pressed"),("face_sigh","sighing, eyes closed, small grey puff")]),
 ("Row 5", [("face_tired","tired, faint dark circles"),("face_relieved","relieved, soft smile"),("face_hopeful","hopeful, shining eyes"),("face_sympathetic","sympathetic, soft sad smile")]),
]

SHEETS = [
 {"id":"A","key":"master","cols":8,"rows":7,"attach":"photo+pm","grid":A,"portrait_first":True,
  "task":"framed portrait, idle, back view, walk cycle, talking and listening, sitting on a chair, and reactions",
  "title":"Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (lo lắng, phản biện)"},
 {"id":"B","key":"hands_gestures","cols":8,"rows":7,"attach":"master","grid":B,
  "task":"checklist and pen, laptop on the forearm, comparing documents, whiteboard and sticky notes, phone, quality-gate gestures and proposing with a tablet",
  "title":"Cầm nắm + cử chỉ BA/QA"},
 {"id":"C","key":"work_scenes","cols":8,"rows":7,"attach":"master","grid":C,
  "task":"testing at the own desk, client meeting table, one-on-one, release go/no-go, incident, overtime pressure, ownership and endings",
  "title":"Bàn test, họp khách, 1-1, go/no-go, sự cố, OT, kết thúc"},
 {"id":"D","key":"portraits","cols":4,"rows":5,"attach":"master","grid":D,"portrait":True,
  "task":"20 framed facial-expression portraits for a dialogue box","title":"20 chân dung cảm xúc cho hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua sheet P, O cua PM)
def P(id, at="grip", z="front", rot=0): return {"prop": id, "at": at, "z": z, "rot": rot}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
CHAIR, MCHAIR, MTABLE, DESK = F("office_chair"), F("meeting_chair"), F("meeting_table", z="front"), F("desk_monitor", z="front")
WB = F("whiteboard", "beside_left")
CHECK, PEN2 = P("checklist_sheet"), P("pen", "grip2")
RULES = [  # (regex, bindings) – khop dau tien
 (r"portrait$|^face_", []),
 (r"^idle_0|idle_back|^walk_", [CHECK]),
 (r"sit_06", [CHAIR, P("notebook_open"), PEN2]),
 (r"sit_07", [CHAIR, P("phone_back")]),
 (r"sit_01", [F("office_chair", "beside_left")]),
 (r"^sit_", [CHAIR]),
 (r"check_tick|check_flag|check_tap|release_check|checklist_write", [CHECK, PEN2]),
 (r"^check_|checklist_show|stress_02", [CHECK]),
 (r"release_nogo_01", [P("checklist_sheet", "grip2")]),
 (r"lap_show", [P("laptop_open_front")]),
 (r"^lap_|incident_lap", [P("laptop_open_34")]),
 (r"doc_read", [P("folder_open")]),
 (r"doc_compare", [P("contract_sheet"), P("checklist_sheet", "grip2")]),
 (r"doc_raise", [P("contract_sheet")]),
 (r"doc_stack|release_report", [P("paper_stack")]),
 (r"doc_give", [P("folder_closed")]),
 (r"wb_sticky", [P("sticky_notes"), WB]),
 (r"wb_review", [WB]),
 (r"^wb_", [P("marker"), WB]),
 (r"^phone_|^alert_", [P("phone_back")]),
 (r"tab_present|oneone_show", [P("tablet_screen_34")]),
 (r"tab_swipe", [P("tablet_screen_front")]),
 (r"tab_", [P("tablet_back")]),
 (r"coffee_", [P("mug_steam")]),
 (r"tired_03", [P("mug_plain")]),
 (r"release_watch", [F("desk_monitor", "beside_left")]),
 (r"desk_turn", [CHAIR]),
 (r"^desk_", [CHAIR, DESK]),
 (r"meet_table_note", [MCHAIR, MTABLE, P("pen"), P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_show", [MCHAIR, MTABLE, P("folder_open", "surface:meeting_table")]),
 (r"meet_table_", [MCHAIR, MTABLE]),
 (r"oneone_note", [MCHAIR, P("notebook_open"), PEN2]),
 (r"oneone_", [MCHAIR]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green", "seat": "cyan"}
WORD = {"checklist": "checklist", "contract": "page", "folder": "folder", "paper": "papers", "laptop": "laptop",
        "tablet": "tablet", "phone": "phone", "notebook": "notebook", "pen": "pen", "marker": "marker",
        "sticky": "sticky notes", "mug": "mug"}
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
        assert len(row) == s["cols"], f"sheet {s['id']} {title}: {len(row)} o, can {s['cols']}"
        for c, (name, desc) in enumerate(row):
            n += 1
            out.append({"index": n, "row": r + 1, "col": c + 1, "name": name, "desc": desc})
    assert len(s["grid"]) == s["rows"], f"sheet {s['id']}: {len(s['grid'])} hang, can {s['rows']}"
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
             f"Lan, the team's BA/QA analyst — careful, process-minded, the one who guards requirements and quality and "
             f"politely but firmly raises risks. Sheet content: {s['task']}.",
             ATTACH_A if s["attach"] == "photo+pm" else ATTACH_MASTER, IDENTITY, OUTFIT, STYLE]
    if s.get("portrait"):
        parts.append(f"LAYOUT: portrait sheet, square 1:1, pure white background outside the frames. Exactly {cols} columns x "
            f"{rows} rows = {cols*rows} cells. Every cell is a head-and-shoulders portrait of the same character inside a "
            "rounded-square frame with a thin dark outline and a soft pastel-blue background, identical frame size and "
            "crop in every cell, exactly like the portrait in cell 1 of the master sheet. Character faces the viewer, "
            "turned slightly left, hands empty unless an expression says otherwise. Frames never touch. Reading order left "
            "to right, top to bottom.")
        parts.append("EXPRESSIONS:\n" + content(s))
    else:
        parts += [LAYOUT(cols, rows, s.get("portrait_first", False)), OBJECT_RULE, "CELLS:\n" + content(s)]
    parts.append(NEG)
    return "\n\n".join(parts)

FPS = {"idle": (6, True), "walk": (10, True), "talk": (6, True), "listen": (4, True), "nod": (6, True), "sit": (8, False),
       "applaud": (8, True), "check_tick": (6, False), "lap_type": (8, True), "doc_read": (4, True),
       "doc_compare": (4, False), "doc_give": (8, False), "wb_write": (6, True), "wb_sticky": (6, False),
       "phone_type": (8, True), "phone_call": (6, True), "gate_stop": (6, False), "gate_go": (6, False),
       "two_ways": (4, True), "count": (6, False), "tab_present": (6, False), "propose": (6, False),
       "coffee": (4, False), "desk_type": (8, True), "meet_table_talk": (6, True), "meet_table_note": (6, True),
       "oneone_talk": (6, True), "release_check": (6, False), "release_nogo": (6, False), "release_go": (6, False),
       "alert": (6, False), "support": (6, False), "tired": (4, True), "stress": (5, True), "determined": (6, False),
       "own": (6, False), "cheer": (8, True), "congrats": (6, False)}

# ---------------------------------------------------------------- bam kich ban: canh -> animation goi y (lan/<nhom>)
SCRIPT_ANIM = {  # ten animation duoc docs dat san cho QA_BA -> chuoi animation cua bo LAN
 "QA_BA.projectHandoverAudit": ["lan/doc_read", "lan/doc_compare", "lan/check_flag_01"],
 "QA_BA.qualityToolingProposal": ["lan/tab_present", "lan/propose"],
}
SCENES = [  # (scenario, nhip, cau thoai tom tat theo docs, animation / chan dung)
 ("P1_INTRO", "Mở đầu", "Một số requirement và test case chưa được xác nhận đầy đủ.", ["lan/talk_03", "lan/face_cautious"]),
 ("P1_S01_PROJECT_TAKEOVER", "Mở cảnh", "Tài liệu chưa phản ánh hết… requirement chỉ trao đổi qua tin nhắn.", ["QA_BA.projectHandoverAudit", "lan/face_worried"]),
 ("P1_S01_PROJECT_TAKEOVER", "Nhánh A", "Em sẽ tổng hợp requirement, test status…", ["lan/check_tick", "lan/face_focused"]),
 ("P1_S01_PROJECT_TAKEOVER", "Nhánh B", "Em vẫn lo một số giả định cũ chưa được kiểm tra lại.", ["lan/worry_01", "lan/face_worried"]),
 ("P1_S02_SENIOR_AUTONOMY", "Tin nhắn", "Em chưa xác nhận thay đổi này… có thể phát sinh tranh chấp.", ["lan/phone_type", "lan/face_anxious"]),
 ("P1_S03_SCOPE_CHANGE", "Mở cảnh", "Hai chức năng này chưa nằm trong phạm vi… cần acceptance criteria.", ["lan/meet_table_talk", "lan/face_cautious"]),
 ("P1_S04_TOOL_BUDGET", "Mở cảnh", "Team quản lý test case thủ công. Em đề xuất mua bộ công cụ chung.", ["QA_BA.qualityToolingProposal", "lan/face_hopeful"]),
 ("P2_S05_DUAL_DEADLINE", "Mở cảnh", "Em cần hoàn tất test case và xác nhận requirement với chị Mai…", ["lan/talk_02", "lan/worry_02", "lan/face_worried"]),
 ("P2_S05_DUAL_DEADLINE", "Nhánh A/B/C", "Tách requirement / regression bị dồn cuối ngày / workshop khách hàng B.", ["lan/check_tick", "lan/stress_02", "lan/wb_sticky"]),
 ("P2_S05_DUAL_DEADLINE", "Kết cảnh", "Giữ deadline hay giữ đủ vòng kiểm thử.", ["lan/think_01", "lan/face_serious"]),
 ("P2_S06_DEADLINE_QUALITY", "Mở cảnh", "Chức năng mới pass, regression luồng cũ chưa chạy hết.", ["lan/lap_show", "lan/face_serious"]),
 ("P2_S06_DEADLINE_QUALITY", "Nhánh A", "Em sẽ theo dõi sau release, nhưng vẫn còn rủi ro.", ["lan/release_watch_01", "lan/face_worried"]),
 ("P2_S06_DEADLINE_QUALITY", "Nhánh B", "Em sẽ cung cấp test report từng ngày.", ["lan/release_report_01", "lan/face_focused"]),
 ("P2_S06_DEADLINE_QUALITY", "Nhánh C", "Em xác định test scope và tiêu chí go/no-go.", ["lan/release_check", "lan/count", "lan/release_go"]),
 ("P2_S08_CUSTOMER_COMPLAINT", "Mở cảnh", "Requirement có một câu hiểu được theo hai cách.", ["lan/doc_raise_01", "lan/two_ways", "lan/face_cautious"]),
 ("P2_S08_CUSTOMER_COMPLAINT", "Nhánh A/B", "Chưa giải quyết kỳ vọng thực tế / không làm rõ thì lần sau vẫn hiểu sai.", ["lan/meet_table_worry_01", "lan/firm_01"]),
 ("P2_S08_CUSTOMER_COMPLAINT", "Nhánh C + kết", "Cập nhật acceptance criteria bằng ví dụ; gửi biên bản mới.", ["lan/meet_table_note", "lan/doc_give", "lan/face_relieved"]),
 ("P3_S09_PRODUCTION_INCIDENT", "Mở cảnh", "Sự cố production (QA_BA có mặt).", ["lan/alert", "lan/incident_lap_01", "lan/face_surprised"]),
 ("P3_S11_JUNIOR_MISTAKE", "Mở cảnh", "Team sẽ mất gần một ngày để khôi phục.", ["lan/incident_calc_01", "lan/face_sigh"]),
 ("P3_S11_JUNIOR_MISTAKE", "Nhánh C", "Bổ sung checklist review/deploy.", ["lan/support", "lan/checklist_write_01", "lan/checklist_show_01"]),
 ("P4_S13_OPERATING_SYSTEM", "Mở cảnh", "Checklist, requirement, deploy nằm rải rác, có bước chỉ nhắc trong chat.", ["lan/talk_02", "lan/face_serious"]),
 ("P4_S13_OPERATING_SYSTEM", "Nhánh A", "Lỗi regression vẫn phụ thuộc vào việc từng người tự nhớ.", ["lan/disappoint_01", "lan/face_sigh"]),
 ("P4_S13_OPERATING_SYSTEM", "Nhánh B/C", "Hợp nhất test checklist… mỗi quy trình có một chỉ số theo dõi.", ["lan/check_hold_01", "lan/own", "lan/face_bright"]),
 ("P4_S14_TEAM_DEVELOPMENT", "1-1", "QA chỉ được đánh giá bằng số lỗi tìm thấy, phần ngăn lỗi chưa được ghi nhận.", ["lan/oneone_talk", "lan/oneone_hope_01", "lan/face_hopeful"]),
 ("P4_S14_TEAM_DEVELOPMENT", "Nhánh A", "Việc QA ngăn lỗi không tạo ra ticket.", ["lan/sigh_01", "lan/face_sympathetic"]),
 ("P4_S14_TEAM_DEVELOPMENT", "Nhánh B", "Công việc chất lượng sẽ được ghi nhận đúng hơn.", ["lan/oneone_relieved_01", "lan/happy_01", "lan/face_relieved"]),
 ("P4_S14_TEAM_DEVELOPMENT", "Nhánh C", "QA có quyền chặn release theo tiêu chí thống nhất.", ["lan/gate_stop", "lan/own", "lan/face_firm"]),
 ("P4_S15_CLIENT_EXPANSION", "Mở cảnh", "Phạm vi mới chỉ ở mức mong muốn, chưa có acceptance criteria.", ["lan/meet_table_talk", "lan/caution_01", "lan/face_cautious"]),
 ("P4_S15_CLIENT_EXPANSION", "Nhánh A", "Acceptance criteria chưa rõ, về sau khó xác định phạm vi.", ["lan/worry_01", "lan/face_worried"]),
 ("END", "Kết thúc", "Chúc mừng / chia tay PM (không có thoại trong docs – dùng cho màn kết).", ["lan/cheer", "lan/congrats", "lan/sad_01", "lan/bow_01"]),
]

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

def readme(man):
    L = ["# Bộ prompt sprite LAN (QA_BA – BA/QA)", "",
         "Sinh bởi `build.py` – sửa ở `build.py` rồi chạy lại, không sửa tay file này.", "",
         "Cùng cơ chế v3 với bộ PM (`docs/PM`) và bộ MINH (`docs/MINH`): nhân vật vẽ tay không + chấm neo "
         "(magenta = cầm chính, green = tay kia, cyan = điểm ngồi); đồ vật, nội thất, icon **dùng lại sheet P, O, F của PM**.", "",
         "## Thứ tự tạo ảnh", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    for s in SHEETS:
        att = "ảnh thật + `PM_A_master.png` (chỉ lấy style)" if s["attach"] == "photo+pm" else "ảnh thật + `LAN_A_master.png`"
        L.append(f"| {s['id']} ({s['cols']}x{s['rows']}) | `prompts/LAN_{s['id']}_{s['key']}.txt` | {att} | {s['title']} |")
    L += ["", "Tạo sheet A trước và duyệt, sau đó B, C, D đính kèm A làm chuẩn.", "",
          "## Tạo hình nhân vật (theo docs)", "",
          "- Vai trò: BA/QA – “cẩn thận, quan tâm quy trình và chất lượng” (docs/KICH_BAN_ROLECRAFT_PM60.md, mục 2).",
          "- Xưng “em” với PM và Huy → trẻ hơn PM một chút; lịch sự nhưng dám phản biện (“Nhưng…”, “Em vẫn lo…”).",
          "- Đạo cụ đặc trưng: tờ test checklist (`prop/checklist_sheet`); laptop mở trên cẳng tay khi chạy test.",
          "- Thẻ nhân viên xanh (nhân viên chính thức), khác thẻ cam của PM thử việc.", "",
          "## Animation kịch bản đặt tên sẵn", "", "| Tên trong docs | Chuỗi animation LAN |", "|---|---|"]
    for k, v in SCRIPT_ANIM.items(): L.append(f"| `{k}` | {' → '.join(f'`{x}`' for x in v)} |")
    L += ["", "## Cảnh → animation gợi ý (bám thoại của Lan trong docs)", "",
          "| Scenario | Nhịp | Thoại (tóm tắt) | Animation / chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anims in SCENES:
        L.append(f"| `{sc}` | {beat} | {line} | {', '.join(f'`{a}`' for a in anims)} |")
    L += ["", f"Tổng: {sum(len(s['cells']) for s in man['sheets'])} ô, {len(man['animations'])} animation.", ""]
    return "\n".join(L)

def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    man = {"version": 3, "character": {"id": "QA_BA", "role": "QA_BA", "name": "Lan – BA/QA"},
           "shared": {"note": "Đồ vật, nội thất, icon dùng lại sheet P, O, F của bộ PM (docs/PM): prop/*, furn/*, icon/*"},
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}, "script_animations": SCRIPT_ANIM,
           "scenes": [{"scenario": sc, "beat": b, "line": l, "use": a} for sc, b, l, a in SCENES]}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/LAN_{s['id']}_{s['key']}.txt", "w").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"lan/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        man["sheets"].append({"id": s["id"], "key": s["key"], "kind": "lan", "file": f"LAN_{s['id']}_{s['key']}.png",
                              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl})
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (8, False) if len(fr) > 1 else (1, False))
            man["animations"][f"lan/{k}"] = {"frames": [f"lan/{f}" for f in fr], "fps": fps, "loop": loop}
    # moi tham chieu trong SCENES / SCRIPT_ANIM phai ton tai (animation, o don hoac chan dung)
    known = set(man["animations"]) | {f"lan/{n}" for n in seen} | set(SCRIPT_ANIM)
    for ref in [x for *_, a in SCENES for x in a] + [x for v in SCRIPT_ANIM.values() for x in v]:
        assert ref in known, f"tham chieu khong ton tai: {ref}"
    json.dump(man, open(f"{OUT}/lan_sprite_manifest.json", "w"), ensure_ascii=False, indent=1)
    open(f"{OUT}/README_LAN_SPRITE_PROMPTS.md", "w").write(readme(man))
    n = sum(len(cells(s)) for s in SHEETS)
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} canh -> prompts/ + lan_sprite_manifest.json + README")

if __name__ == "__main__":
    main()
