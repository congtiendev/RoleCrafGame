# -*- coding: utf-8 -*-
# Bo prompt sprite HUY (SENIOR_DEV – Backend Developer gioi, nhanh nhung thich tu quyet), cung co che v3 voi bo PM
# (docs/PM), MINH, LAN, HA: nhan vat ve tay khong + cham neo, do vat / noi that / icon DUNG LAI sheet P, O, F cua PM.
# Noi dung o bam theo loi thoai cua Huy trong docs/KICH_BAN_ROLECRAFT_PM60.md (kich ban thong nhat) va THOAI_MAU.json.
#     python3 build.py        # sinh prompts/HUY_*.txt + huy_sprite_manifest.json + README_HUY_SPRITE_PROMPTS.md
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

OUTFIT = ("OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): a senior "
"backend developer around thirty, a few years older than the PM, confident and a little stubborn, relaxed tech-office "
"style. Charcoal-grey zip hoodie worn open with the sleeves pushed up to the forearm; plain navy crew-neck t-shirt "
"underneath; dark indigo jeans; grey-and-white sneakers; black over-ear headphones resting around the neck; a black "
"sport watch on the left wrist. A royal-blue lanyard around the neck with a plain royal-blue ID badge card at the chest "
"(blank, no text) — the official staff badge. Signature prop: a silver laptop. It is added later by code, so do NOT draw "
"it (except in the framed portrait cell).")

STYLE = ("ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style, exactly matching the reference "
"sheet. Big head, about 2.4 to 2.6 heads tall in total (a little taller and broader than the young PM); expressive eyes "
"with highlights, sharp and self-assured, often a slight confident half-smile; small nose and mouth; clean dark-brown "
"pixel outline (not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; consistent "
"top-left light. Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat "
"drop, small grey puff, exclamation mark, question mark) are drawn next to a figure only where a cell asks for them.")

def LAYOUT(cols, rows, portrait_first):
    s = (f"LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly {cols} columns x {rows} rows "
         f"= {cols*rows} cells, packed like a professional game asset sheet: each figure fills most of its cell but never "
         "touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared "
         "baseline. Figures face LEFT in a 3/4 view (the character usually stands opposite the PM, who faces right) unless "
         "a cell says otherwise. Reading order: left to right, top to bottom. ")
    if portrait_first:
        s += ("Cell 1 (top-left) is special: a head-and-shoulders portrait inside a rounded-square frame with a thin dark "
              "outline and a soft pastel-blue background with a few sparkles, the character with a confident half-smile, "
              "a closed silver laptop tucked under one arm. Cell 1 is the ONLY cell with a background; every other cell "
              "is a full-body figure on pure white.")
    return s

OBJECT_RULE = ("OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites "
"that will be placed by code. Wherever a cell mentions a laptop, tablet, phone, folder, page, checklist, card, notebook, "
"pen, marker, mug, box, chair, desk, table, monitor or whiteboard, do NOT draw that object. Instead draw the empty "
"hand(s) in the exact grip pose as if holding it, and the body sitting at the correct height as if on the invisible "
"furniture. Keep the worn lanyard badge, the headphones and the wristwatch as part of the character. MARKER DOTS: small "
"solid round dots about 1.5% of the cell width, flat color, no outline, no shading, drawn on top of the character. "
"MAGENTA #FF00FF = grip point of the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = "
"grip point of a second object held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they "
"touch the seat) for sitting poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no "
"dots. Never use these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw "
"grid lines or cell borders (except the frame of the portrait cells); add scenery, floor or walls; add extra characters "
"(the other person in a handshake, a 1-1, a meeting or a mentoring moment is offscreen); crop limbs; repeat an identical "
"pose; change the face, hair, outfit colors or proportions between cells; use pure white for clothing edges that touch "
"the background.")

# ---------------------------------------------------------------- sheet A – master
A = [
 ("Row 1 - Portrait + idle", [
  ("portrait","[portrait cell, see LAYOUT] confident half-smile, closed laptop under one arm, a few sparkles"),
  ("idle_01","idle loop 1/4: relaxed confident stance, closed laptop tucked under the left arm"),
  ("idle_02","idle loop 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03","idle loop 3/4: rolling the neck a little, casual"),
  ("idle_back_01","standing seen from behind (back view), closed laptop under the left arm"),
  ("idle_04","idle loop 4/4: slight exhale, calm self-assured face"),
  ("greet_01","casual nod with a half-smile, free hand raised briefly"),
  ("greet_02","two-finger salute from the brow, 'hey'")]),
 ("Row 2 - Walk cycle 8 frames, quick confident pace, closed laptop under the left arm, right arm swings", [
  ("walk_01","walk contact: left foot forward heel touching"),("walk_02","walk down: weight on left leg, knee bent"),
  ("walk_03","walk passing: right leg passing the left"),("walk_04","walk up: rising on left toes"),
  ("walk_05","walk contact: right foot forward heel touching"),("walk_06","walk down: weight on right leg, knee bent"),
  ("walk_07","walk passing: left leg passing the right"),("walk_08","walk up: rising on right toes")]),
 ("Row 3 - Talking + listening (dialogue loops, hands free)", [
  ("talk_01","talking, right hand open at chest height, matter-of-fact"),
  ("talk_02","talking, both hands shaping a box in the air, explaining the system"),
  ("talk_03","talking with a small shrug, 'it's only a small change'"),
  ("talk_04","talking, hand returning down, confident smile"),
  ("listen_01","listening, hands in the hoodie pockets, half attentive"),
  ("listen_02","listening, head tilted, one hand rubbing the chin"),
  ("nod_01","nodding, eyes half closed, 'fair enough'"),("nod_02","nodding, chin lifted back up")]),
 ("Row 4 - Sit on an invisible office chair (same seat height in every sit cell)", [
  ("sit_01","standing next to the chair, about to sit"),
  ("sit_02","dropping casually onto the chair"),("sit_03","seated, leaning back, relaxed"),
  ("sit_04","seated, leaning back, arms crossed, unconvinced"),
  ("sit_05","seated, leaning forward, elbows on the knees, fingers laced, serious"),
  ("sit_06","seated, typing on a laptop resting on the lap"),("sit_07","seated, reading a phone held in the right hand"),
  ("sit_08","standing up from the chair")]),
 ("Row 5 - Positive reactions with small effect icons", [
  ("good_01","satisfied smirk, small nod, two golden sparkles"),("good_02","thumbs up with the right hand, sparkles"),
  ("good_03","proud grin, arms crossed, chin up"),("good_04","laughing, eyes closed, head tipped back"),
  ("applaud_01","applauding, hands apart"),("applaud_02","applauding, hands together"),
  ("impressed_01","eyebrows raised, impressed 'oh', small exclamation mark"),
  ("relieved_01","relieved exhale, hand rubbing the back of the neck, small smile")]),
 ("Row 6 - Defensive, annoyed and overloaded reactions", [
  ("defend_01","both palms up at chest height, defensive, 'I did it to hit the demo'"),
  ("annoyed_01","annoyed, eyes rolling slightly, arms crossed"),
  ("frown_01","frowning, jaw set, arms crossed tightly"),
  ("doubt_01","skeptical raised eyebrow, small question mark"),
  ("sigh_01","sighing, shoulders dropped, small grey puff"),
  ("scratch_01","scratching the back of the head, frustrated"),
  ("overload_01","both hands on the head, overloaded, sweat drops"),
  ("worry_01","worried, hand on the back of the neck, one sweat drop")]),
 ("Row 7 - Thinking + senior stances", [
  ("think_01","thinking, hand on the chin, looking up"),("think_02","thinking, eyes closed, finger tapping the temple"),
  ("pocket_01","confident stance, both hands in the hoodie pockets"),
  ("crossarms_01","arms crossed, neutral, waiting"),("crossarms_02","arms crossed, small confident smile"),
  ("lean_01","leaning back on one leg, relaxed, one hand in a pocket"),
  ("warn_01","index finger raised, serious, 'that will cost more later'"),
  ("point_01","pointing forward with an open hand, 'your call'")]),
]

# ---------------------------------------------------------------- sheet B – cam nam + cu chi
B = [
 ("Row 1 - Laptop (the signature prop): status briefing", [
  ("lap_carry_01","closed laptop tucked under the left arm, about to report"),
  ("lap_hold_01","open laptop balanced on the left forearm, looking at the screen"),
  ("lap_type_01","typing fast with the right hand on the balanced laptop"),
  ("lap_type_02","typing, glancing up over the laptop"),
  ("lap_show_01","turning the laptop screen toward the viewer, 'here is where we are'"),
  ("lap_show_02","laptop turned toward the viewer, pointing at the screen with the free hand"),
  ("lap_show_03","laptop turned toward the viewer, explaining with a small nod"),
  ("lap_close_01","closing the laptop with one hand, done")]),
 ("Row 2 - Explaining a technical change (hands free)", [
  ("explain_01","both hands shaping a box, describing a module"),
  ("explain_02","one hand drawing an arrow in the air, showing the flow"),
  ("explain_03","small shrug, palms up, 'the old way was too slow'"),
  ("explain_04","hand waving it off casually, 'no need for a review'"),
  ("defend_02","palm on the chest, a bit defensive, 'I know the system best'"),
  ("defend_03","arms crossed, frowning, 'waiting for approval slows everything'"),
  ("agree_01","open palm, conceding nod, 'that's reasonable'"),
  ("agree_02","thumbs up, relaxed smile, 'deal'")]),
 ("Row 3 - Whiteboard architecture sketch; the whiteboard is on the LEFT", [
  ("wb_draw_01","drawing a box on the whiteboard with a marker"),
  ("wb_draw_02","drawing a connecting arrow"),
  ("wb_circle_01","circling a bottleneck on the board, serious"),
  ("wb_point_01","pointing at the diagram with the marker"),
  ("wb_point_02","tapping the board, 'this part'"),
  ("wb_explain_01","marker raised, half turned to the viewer, explaining two technical options"),
  ("wb_review_01","one step back from the board, arms crossed, reviewing the diagram"),
  ("wb_turn_01","turning back to the viewer from the board")]),
 ("Row 4 - Estimates and trade-offs", [
  ("est_count_01","counting on fingers: two fingers up (days)"),
  ("est_count_02","counting: all five fingers spread, 'five days of refactor'"),
  ("est_weigh_01","both palms up like a scale, two technical options"),
  ("est_weigh_02","one palm higher than the other, recommending one"),
  ("est_card_01","holding a small estimate card, reading it"),
  ("est_card_02","handing the estimate card forward"),
  ("est_stop_01","palm raised, 'we can't commit before knowing the scope'"),
  ("est_warn_01","finger raised, eyebrows lowered, pointing out a risk")]),
 ("Row 5 - Phone and headphones", [
  ("phone_read_01","reading a message on the phone, neutral"),
  ("phone_read_02","reading the phone, thoughtful, weighing a job offer"),
  ("phone_type_01","typing quickly with the thumb"),
  ("phone_call_01","phone at the ear, listening, frowning"),
  ("phone_alert_01","reading an alert on the phone, eyes wide, exclamation mark"),
  ("phone_pocket_01","sliding the phone into the jeans pocket"),
  ("headset_on_01","pulling the headphones up onto the ears, focus mode"),
  ("headset_off_01","pulling the headphones down to the neck to listen")]),
 ("Row 6 - Handover, runbook and mentoring", [
  ("handover_01","holding out a closed folder of architecture notes with both hands"),
  ("handover_02","folder handed over, hands returning, serious nod"),
  ("doc_read_01","reading an open runbook folder"),
  ("runbook_tick_01","ticking a deploy/rollback checklist with a pen"),
  ("mentor_point_01","leaning slightly, pointing down to the LEFT as if at a junior's screen, patient"),
  ("mentor_pat_01","encouraging pat toward an offscreen shoulder"),
  ("mentor_thumb_01","thumbs up to someone offscreen, 'good job'"),
  ("delegate_01","open palm offered forward, handing over the review, 'your turn'")]),
 ("Row 7 - Coffee and stretching", [
  ("coffee_01","holding a coffee mug, relaxed"),("coffee_02","sipping the coffee, eyes closed"),
  ("stretch_01","stretching the neck to one side, hand on the shoulder"),
  ("stretch_02","stretching both arms up, yawning"),
  ("knuckles_01","interlocking fingers and stretching them forward, ready to code"),
  ("sleeves_01","pushing the hoodie sleeves higher, determined"),
  ("yawn_01","yawning, hand over the mouth"),
  ("smirk_01","hands in the pockets, sly confident smirk")]),
]

# ---------------------------------------------------------------- sheet C – canh lam viec
C = [
 ("Row 1 - At the own desk coding (desk, monitor and chair invisible; the desk would be on the LEFT)", [
  ("desk_type_01","seated, typing fast"),("desk_type_02","seated, typing, glancing at the monitor"),
  ("desk_focus_01","seated, headphones on, typing intensely, focused"),
  ("desk_think_01","seated, leaning back, hands behind the head, thinking"),
  ("desk_bug_01","seated, frowning at the monitor, hand on the chin"),
  ("desk_fixed_01","seated, small fist pump, sparkles (fixed)"),
  ("desk_turn_01","seated, swiveling around on the chair to talk to someone behind"),
  ("desk_wave_01","seated, half turned, waving it off casually, 'it's a small change'")]),
 ("Row 2 - Seated at an invisible round meeting table on the LEFT (same seat height in every cell)", [
  ("meet_table_talk_01","seated at the table, talking with an open hand"),
  ("meet_table_talk_02","seated, leaning in, explaining a technical point"),
  ("meet_table_listen_01","seated, listening, arms resting on the table"),
  ("meet_table_frown_01","seated, arms crossed on the table, frowning"),
  ("meet_table_lap_01","seated, typing on a laptop on the table"),
  ("meet_table_show_01","seated, turning the laptop on the table toward the others"),
  ("meet_table_warn_01","seated, index finger raised, warning about a risk"),
  ("meet_table_agree_01","seated, nodding, satisfied")]),
 ("Row 3 - One-on-one with the PM: seated on an invisible chair, no table (autonomy talk and job-offer talk)", [
  ("oneone_talk_01","seated, talking calmly, open hand"),
  ("oneone_offer_01","seated, looking down, rubbing the hands together, telling about a new job offer"),
  ("oneone_tired_01","seated, elbows on the knees, weary, 'all the critical work lands on me'"),
  ("oneone_frustrated_01","seated, one hand gesturing, frustrated, eyebrows lowered"),
  ("oneone_listen_01","seated, listening carefully to a proposal"),
  ("oneone_think_01","seated, hand on the chin, seriously considering"),
  ("oneone_agree_01","seated, small smile and nod, 'I'll stay and try it'"),
  ("oneone_decline_01","seated, respectful slight head shake, apologetic, 'I'm taking the offer'")]),
 ("Row 4 - Production incident and rollback (standing)", [
  ("alert_01","reading a production alert on the phone, shocked, exclamation mark"),
  ("alert_02","phone lowered, jaw set, switching into crisis mode"),
  ("incident_type_01","typing fast on the laptop balanced on the forearm, sweat drop"),
  ("incident_rollback_01","decisive chopping hand gesture, 'roll back first'"),
  ("incident_monitor_01","standing, arms crossed, tense, watching a monitor on the LEFT"),
  ("incident_fixed_01","big relieved exhale, hand wiping the forehead"),
  ("flag_01","index finger flicking an imaginary switch, 'feature flag off'"),
  ("flag_02","thumbs up, calm, 'scope under control'")]),
 ("Row 5 - Overtime and overload (standing)", [
  ("tired_01","rubbing the eyes under the lifted hand, tired"),
  ("tired_02","slumped shoulders, holding a mug, faint dark circles"),
  ("tired_03","long yawn, arms hanging"),
  ("burnout_01","blank stare, drooping posture, small grey puff"),
  ("overload_02","hands on the knees, bent forward, exhausted, sweat drops"),
  ("frustrated_01","scratching the head hard with both hands"),
  ("breath_01","deep breath, eyes closed, hands on the hips"),
  ("determined_01","sleeves pushed up, fist in the palm, determined")]),
 ("Row 6 - Growth into Technical Lead, or leaving (standing)", [
  ("lead_01","confident stance, arms crossed, calm smile, a technical lead"),
  ("lead_02","leading a stand-up, both arms slightly open toward the team"),
  ("lead_03","pointing to assign a task, supportive"),
  ("shake_01","reaching out the right hand for a handshake, 'deal'"),
  ("shake_02","firm handshake, grin"),
  ("farewell_01","carrying a cardboard box with personal items, leaving"),
  ("farewell_02","box under one arm, small wave goodbye"),
  ("farewell_03","hand on the chest, grateful slight bow, 'thanks for everything'")]),
 ("Row 7 - Team endings (standing)", [
  ("cheer_01","cheering, one fist raised, sparkles"),("cheer_02","both fists raised, big grin"),
  ("congrats_01","offering a fist bump"),("congrats_02","high-five hand raised"),
  ("proud_01","proud nod, hands in the pockets"),
  ("sad_01","sad, looking down, hand on the back of the neck"),
  ("pat_01","sympathetic pat toward an offscreen shoulder"),
  ("bye_01","two-finger salute goodbye, soft smile")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral","neutral, self-assured"),("face_smirk","confident half-smile"),("face_grin","big friendly grin"),("face_laugh","laughing, eyes closed")]),
 ("Row 2", [("face_focused","focused, eyes narrowed, headphones on"),("face_serious","serious, straight mouth"),("face_frown","frowning, jaw set"),("face_annoyed","annoyed, eyes rolling slightly")]),
 ("Row 3", [("face_defensive","defensive, eyebrows up, palm raised into the frame"),("face_skeptical","one eyebrow raised, skeptical"),("face_thinking","thinking, eyes looking up"),("face_surprised","surprised, eyebrows up, mouth open")]),
 ("Row 4", [("face_worried","worried, eyebrows tilted, sweat drop"),("face_tired","tired, faint dark circles"),("face_exhausted","exhausted, half-closed eyes, small grey puff"),("face_sigh","sighing, eyes closed")]),
 ("Row 5", [("face_relieved","relieved, soft smile"),("face_determined","determined, sharp eyes"),("face_grateful","grateful, warm small smile"),("face_apologetic","apologetic, sad smile, looking aside")]),
]

SHEETS = [
 {"id":"A","key":"master","cols":8,"rows":7,"attach":"photo+pm","grid":A,"portrait_first":True,
  "task":"framed portrait, idle, back view, walk cycle, talking and listening, sitting on a chair, and reactions",
  "title":"Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (tự tin, phòng thủ, quá tải)"},
 {"id":"B","key":"hands_gestures","cols":8,"rows":7,"attach":"master","grid":B,
  "task":"laptop status briefing, explaining a technical change, whiteboard architecture, estimates, phone and headphones, handover and mentoring, coffee and stretching",
  "title":"Cầm nắm + cử chỉ Senior Dev"},
 {"id":"C","key":"work_scenes","cols":8,"rows":7,"attach":"master","grid":C,
  "task":"coding at the own desk, meeting table, one-on-one about autonomy and a job offer, production incident and rollback, overtime, becoming a technical lead or leaving, and team endings",
  "title":"Bàn code, họp, 1-1 (tự quyết / offer), sự cố + rollback, OT, Tech Lead / nghỉ, kết thúc"},
 {"id":"D","key":"portraits","cols":4,"rows":5,"attach":"master","grid":D,"portrait":True,
  "task":"20 framed facial-expression portraits for a dialogue box","title":"20 chân dung cảm xúc cho hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua sheet P, O cua PM)
def P(id, at="grip", z="front", rot=0): return {"prop": id, "at": at, "z": z, "rot": rot}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
CHAIR, MCHAIR, MTABLE, DESK = F("office_chair"), F("meeting_chair"), F("meeting_table", z="front"), F("desk_monitor", z="front")
WB, LAPC, LAP = F("whiteboard", "beside_left"), P("laptop_closed", z="back"), P("laptop_open_34")
RULES = [  # (regex, bindings) – khop dau tien
 (r"portrait$|^face_", []),
 (r"^idle_0|idle_back|^walk_|lap_carry", [LAPC]),
 (r"sit_06", [CHAIR, LAP]),
 (r"sit_07", [CHAIR, P("phone_back")]),
 (r"sit_01", [F("office_chair", "beside_left")]),
 (r"^sit_", [CHAIR]),
 (r"lap_show|incident_report", [P("laptop_open_front")]),
 (r"^lap_|incident_type", [LAP]),
 (r"wb_review", [WB]),
 (r"^wb_", [P("marker"), WB]),
 (r"est_card", [P("task_card")]),
 (r"^phone_|^alert_", [P("phone_back")]),
 (r"handover_", [P("folder_closed")]),
 (r"doc_read", [P("folder_open")]),
 (r"runbook_tick", [P("checklist_sheet"), P("pen", "grip2")]),
 (r"coffee_", [P("mug_steam")]),
 (r"tired_02", [P("mug_plain")]),
 (r"incident_monitor", [F("desk_monitor", "beside_left")]),
 (r"farewell_0[12]", [P("cardboard_box")]),
 (r"desk_turn|desk_wave", [CHAIR]),
 (r"^desk_", [CHAIR, DESK]),
 (r"meet_table_lap", [MCHAIR, MTABLE, P("laptop_open_34", "surface:meeting_table")]),
 (r"meet_table_show", [MCHAIR, MTABLE, P("laptop_open_front", "surface:meeting_table")]),
 (r"meet_table_", [MCHAIR, MTABLE]),
 (r"oneone_", [MCHAIR]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green", "seat": "cyan"}
WORD = {"laptop": "laptop", "phone": "phone", "folder": "folder", "checklist": "checklist", "task": "card", "pen": "pen",
        "marker": "marker", "mug": "mug", "cardboard": "box"}
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
             f"Huy, the team's senior backend developer — the fastest and most knowledgeable on the team, confident, "
             f"likes to decide on his own, carries most of the critical work. Sheet content: {s['task']}.",
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
       "applaud": (8, True), "lap_type": (10, True), "lap_show": (6, False), "explain": (6, False), "defend": (6, False),
       "agree": (6, False), "wb_draw": (6, True), "wb_point": (6, False), "est_count": (6, False), "est_weigh": (4, True),
       "est_card": (6, False), "phone_read": (4, True), "handover": (8, False), "coffee": (4, False), "desk_type": (10, True),
       "meet_table_talk": (6, True), "oneone_talk": (6, True), "alert": (6, False), "flag": (6, False), "tired": (4, True),
       "overload": (5, True), "lead": (6, False), "shake": (6, False), "farewell": (6, False), "cheer": (8, True),
       "congrats": (6, False), "crossarms": (4, False), "good": (6, False)}

# ---------------------------------------------------------------- bam kich ban: canh -> animation goi y (huy/<nhom>)
SCRIPT_ANIM = {  # ten animation duoc docs L1 dat san cho SENIOR_DEV -> chuoi animation cua bo HUY
 "SENIOR_DEV.projectStatusBriefing": ["huy/lap_carry_01", "huy/lap_show", "huy/talk"],
 "SENIOR_DEV.requirementChangeExplanation": ["huy/desk_turn_01", "huy/explain", "huy/desk_wave_01"],
}
SCENES = [  # (scenario, nhip, cau thoai tom tat theo docs, animation / chan dung)
 ("P1_INTRO", "Mở đầu", "Backend chính đã chạy được… nếu không thay đổi nhiều thì vẫn kịp demo.", ["huy/talk_01", "huy/face_smirk"]),
 ("P1_S01_PROJECT_TAKEOVER", "Mở cảnh", "Task cũ vẫn chạy, khoảng một tuần nữa có thể demo.", ["SENIOR_DEV.projectStatusBriefing", "huy/face_neutral"]),
 ("P1_S01_PROJECT_TAKEOVER", "Nhánh A", "Mất một ngày nhưng cả team thống nhất được hiện trạng.", ["huy/nod", "huy/face_serious"]),
 ("P1_S01_PROJECT_TAKEOVER", "Nhánh B/C", "Vậy team tiếp tục theo kế hoạch / có gì cần làm rõ thì báo anh.", ["huy/good_01", "huy/pocket_01"]),
 ("P1_S02_SENIOR_AUTONOMY", "Mở cảnh", "Anh đã đổi cách xử lý để kịp demo… thay đổi nhỏ, không cần review.", ["SENIOR_DEV.requirementChangeExplanation", "huy/face_smirk"]),
 ("P1_S02_SENIOR_AUTONOMY", "Nhánh A", "Việc gì cũng chờ phê duyệt thì tiến độ sẽ chậm hơn.", ["huy/defend_03", "huy/annoyed_01", "huy/face_annoyed"]),
 ("P1_S02_SENIOR_AUTONOMY", "Nhánh B", "Vậy anh sẽ chủ động xử lý để bảo đảm tiến độ.", ["huy/smirk_01", "huy/face_grin"]),
 ("P1_S02_SENIOR_AUTONOMY", "Nhánh C", "Hợp lý. Thay đổi ảnh hưởng requirement sẽ đưa ra review.", ["huy/oneone_agree_01", "huy/agree", "huy/face_relieved"]),
 ("P1_S03_SCOPE_CHANGE", "Mở cảnh", "Nhìn giao diện thì nhỏ, nhưng backend phải đổi một số luồng.", ["huy/meet_table_warn_01", "huy/face_skeptical"]),
 ("P1_S04_TOOL_BUDGET", "Mở cảnh", "Có monitoring và công cụ tốt hơn, team phát hiện vấn đề nhanh hơn.", ["huy/talk_02", "huy/face_neutral"]),
 ("P2_S05_DUAL_DEADLINE", "Mở cảnh", "Anh chuyển sang B thì backend của A thiếu người review.", ["huy/est_stop_01", "huy/face_frown"]),
 ("P2_S05_DUAL_DEADLINE", "Nhánh A/B/C", "Vẫn tốn onboarding / lịch không còn dự phòng / tập trung phần tích hợp.", ["huy/explain_03", "huy/worry_01", "huy/agree_01"]),
 ("P2_S06_DEADLINE_QUALITY", "Mở cảnh", "Release đúng ngày thì phải bỏ vòng regression cuối.", ["huy/meet_table_talk", "huy/face_serious"]),
 ("P2_S06_DEADLINE_QUALITY", "Nhánh A", "Lỗi luồng cũ lọt lên production thì tốn hơn nhiều.", ["huy/warn_01", "huy/face_worried"]),
 ("P2_S06_DEADLINE_QUALITY", "Nhánh C", "Anh sẽ dùng feature flag để kiểm soát phạm vi mở.", ["huy/flag", "huy/face_determined"]),
 ("P2_S07_KEY_PERSON_RETENTION", "Mở cảnh", "Anh vừa nhận offer cao hơn 30%… việc critical dồn hết vào anh.", ["huy/phone_read_02", "huy/oneone_offer_01", "huy/oneone_tired_01", "huy/face_tired"]),
 ("P2_S07_KEY_PERSON_RETENTION", "Cờ OT / restricted", "Hai tuần OT… / chịu trách nhiệm mà không đủ quyền.", ["huy/oneone_frustrated_01", "huy/face_exhausted"]),
 ("P2_S07_KEY_PERSON_RETENTION", "Nhánh A / C1", "Anh sẽ ở lại (quyền lợi / lộ trình Technical Lead).", ["huy/oneone_think_01", "huy/oneone_agree_01", "huy/shake", "huy/face_grateful"]),
 ("P2_S07_KEY_PERSON_RETENTION", "Nhánh B / C2", "Anh nhận offer mới, sẽ hỗ trợ bàn giao.", ["huy/oneone_decline_01", "huy/handover", "huy/farewell", "huy/face_apologetic"]),
 ("P2_S08_CUSTOMER_COMPLAINT", "Biến thể 1/2", "Team tối ưu để kịp demo nhưng chưa ghi thành requirement / đúng tài liệu.", ["huy/meet_table_talk", "huy/defend_01", "huy/face_defensive"]),
 ("P2_S08_CUSTOMER_COMPLAINT", "Nhánh B/C", "Không chỉ sửa lỗi nhỏ / estimate hai phương án kỹ thuật.", ["huy/sigh_01", "huy/est_weigh", "huy/wb_explain_01"]),
 ("P3_S09_PRODUCTION_INCIDENT", "Mở cảnh", "Production lỗi lúc 14:00.", ["huy/alert", "huy/incident_type_01", "huy/face_surprised"]),
 ("P3_S09_PRODUCTION_INCIDENT", "Nhánh C", "Rollback trước, lập nhóm incident rồi điều tra.", ["huy/incident_rollback_01", "huy/incident_monitor_01", "huy/incident_fixed_01"]),
 ("P3_S10_SALES_OVERCOMMIT", "Mở cảnh", "Sales hứa tính năng AI trong 10 ngày.", ["huy/est_count", "huy/est_stop_01", "huy/face_frown"]),
 ("P3_S11_JUNIOR_MISTAKE", "Nhánh C", "Bổ sung checklist review/deploy.", ["huy/mentor_point_01", "huy/runbook_tick_01", "huy/mentor_pat_01"]),
 ("P3_S12_BIG_PROJECT", "Mở cảnh", "Nhận thêm dự án lớn với nguồn lực có hạn.", ["huy/crossarms_01", "huy/face_worried"]),
 ("P4_S13_OPERATING_SYSTEM", "Mở cảnh", "Kiến trúc vẫn phụ thuộc vào anh, cần chuyển quyền review.", ["huy/scratch_01", "huy/delegate_01", "huy/face_serious"]),
 ("P4_S13_OPERATING_SYSTEM", "Nhánh A", "Output tăng trước mắt, nhưng điểm nghẽn cũ sẽ quay lại.", ["huy/warn_01", "huy/face_skeptical"]),
 ("P4_S13_OPERATING_SYSTEM", "Nhánh B/C", "Anh bổ sung runbook deploy, rollback… team hiểu lý do từng bước.", ["huy/doc_read_01", "huy/runbook_tick_01", "huy/face_determined"]),
 ("P4_S14_TEAM_DEVELOPMENT", "Mở cảnh", "Anh muốn lên Technical Lead, không ôm mọi vấn đề khó nữa.", ["huy/oneone_talk", "huy/face_determined"]),
 ("P4_S14_TEAM_DEVELOPMENT", "Nhánh A", "Chỉ nhìn số task thì mentoring, review không được ghi nhận.", ["huy/frown_01", "huy/face_frown"]),
 ("P4_S14_TEAM_DEVELOPMENT", "Nhánh B/C", "Phù hợp hướng Technical Lead / đồng ý nếu phạm vi quyết định được ghi rõ.", ["huy/lead", "huy/face_grateful"]),
 ("P4_S15_CLIENT_EXPANSION", "Nhánh A", "Mình đang cam kết khi chưa biết hết phạm vi tích hợp.", ["huy/est_warn_01", "huy/face_worried"]),
 ("END", "Kết thúc", "Chúc mừng / chia tay PM (không có thoại trong docs – dùng cho màn kết).", ["huy/cheer", "huy/congrats", "huy/sad_01", "huy/bye_01"]),
]

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

def readme(man):
    L = ["# Bộ prompt sprite HUY (SENIOR_DEV – Senior Backend Developer)", "",
         "Sinh bởi `build.py` – sửa ở `build.py` rồi chạy lại, không sửa tay file này.", "",
         "Cùng cơ chế v3 với bộ PM (`docs/PM`), MINH, LAN, HA: nhân vật vẽ tay không + chấm neo "
         "(magenta = cầm chính, green = tay kia, cyan = điểm ngồi); đồ vật, nội thất, icon **dùng lại sheet P, O, F của PM**.", "",
         "## Thứ tự tạo ảnh", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    for s in SHEETS:
        att = "ảnh thật + `PM_A_master.png` (chỉ lấy style)" if s["attach"] == "photo+pm" else "ảnh thật + `HUY_A_master.png`"
        L.append(f"| {s['id']} ({s['cols']}x{s['rows']}) | `prompts/HUY_{s['id']}_{s['key']}.txt` | {att} | {s['title']} |")
    L += ["", "Tạo sheet A trước và duyệt, sau đó B, C, D đính kèm A làm chuẩn.", "",
          "## Tạo hình nhân vật (theo docs)", "",
          "- Vai trò: Backend Developer giỏi, nhanh nhưng thích tự quyết (L1); người hiểu hệ thống nhất, gánh việc critical.",
          "- Xưng “anh” với PM → lớn tuổi hơn PM; tự tin, hơi bướng, dễ phòng thủ khi bị siết quy trình.",
          "- Cung truyện: tự đổi requirement (L1 S02) → quá tải, nhận offer (L2 S07) → ở lại làm Technical Lead hoặc nghỉ "
          "(`key_developer_retained` / `key_developer_left`) → runbook, mentoring (L4).",
          "- Đạo cụ đặc trưng: laptop (`prop/laptop_closed`, `prop/laptop_open_34`); tai nghe đeo cổ là một phần nhân vật.", "",
          "## Animation kịch bản đặt tên sẵn", "", "| Tên trong docs | Chuỗi animation HUY |", "|---|---|"]
    for k, v in SCRIPT_ANIM.items(): L.append(f"| `{k}` | {' → '.join(f'`{x}`' for x in v)} |")
    L += ["", "## Cảnh → animation gợi ý (bám thoại của Huy trong docs)", "",
          "| Scenario | Nhịp | Thoại (tóm tắt) | Animation / chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anims in SCENES:
        L.append(f"| `{sc}` | {beat} | {line} | {', '.join(f'`{a}`' for a in anims)} |")
    L += ["", f"Tổng: {sum(len(s['cells']) for s in man['sheets'])} ô, {len(man['animations'])} animation.", ""]
    return "\n".join(L)

def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    man = {"version": 3, "character": {"id": "SENIOR_DEV", "role": "SENIOR_DEV", "name": "Huy – Senior Developer"},
           "shared": {"note": "Đồ vật, nội thất, icon dùng lại sheet P, O, F của bộ PM (docs/PM): prop/*, furn/*, icon/*"},
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}, "script_animations": SCRIPT_ANIM,
           "scenes": [{"scenario": sc, "beat": b, "line": l, "use": a} for sc, b, l, a in SCENES]}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/HUY_{s['id']}_{s['key']}.txt", "w").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"huy/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        man["sheets"].append({"id": s["id"], "key": s["key"], "kind": "huy", "file": f"HUY_{s['id']}_{s['key']}.png",
                              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl})
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (8, False) if len(fr) > 1 else (1, False))
            man["animations"][f"huy/{k}"] = {"frames": [f"huy/{f}" for f in fr], "fps": fps, "loop": loop}
    # moi tham chieu trong SCENES / SCRIPT_ANIM phai ton tai (animation, o don hoac chan dung)
    known = set(man["animations"]) | {f"huy/{n}" for n in seen} | set(SCRIPT_ANIM)
    for ref in [x for *_, a in SCENES for x in a] + [x for v in SCRIPT_ANIM.values() for x in v]:
        assert ref in known, f"tham chieu khong ton tai: {ref}"
    json.dump(man, open(f"{OUT}/huy_sprite_manifest.json", "w"), ensure_ascii=False, indent=1)
    open(f"{OUT}/README_HUY_SPRITE_PROMPTS.md", "w").write(readme(man))
    n = sum(len(cells(s)) for s in SHEETS)
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} canh -> prompts/ + huy_sprite_manifest.json + README")

if __name__ == "__main__":
    main()
