# -*- coding: utf-8 -*-
# Bo prompt sprite ANH MINH (MANAGER – Truong phong/PM Lead), cung co che v3 voi bo PM (docs/PM):
# nhan vat ve tay khong + cham neo, do vat / noi that / icon DUNG LAI sheet P, O, F cua PM.
#     python3 build.py        # sinh prompts/MINH_*.txt + minh_sprite_manifest.json
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

OUTFIT = ("OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): an experienced "
"department head / PM lead in his late thirties, calm and composed. White button-up shirt, no tie, top button open; "
"charcoal-grey single-breasted blazer worn open; charcoal-grey trousers; black leather belt; black leather shoes; a "
"simple dark wristwatch on the left wrist. A royal-blue lanyard around the neck with a plain royal-blue ID badge card at "
"the chest (blank, no text) — the official staff badge. Signature prop: a closed navy document folder. It is added later "
"by code, so do NOT draw it (except in the framed portrait cell).")

STYLE = ("ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style, exactly matching the reference "
"sheet. Big head, about 2.4 to 2.6 heads tall in total (a little taller and broader-shouldered than the young PM); "
"expressive eyes with highlights but a more mature, composed look; small nose and mouth; clean dark-brown pixel outline "
"(not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; consistent top-left light. "
"Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, small grey "
"puff, exclamation mark, question mark) are drawn next to a figure only where a cell asks for them.")

def LAYOUT(cols, rows, portrait_first):
    s = (f"LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly {cols} columns x {rows} rows "
         f"= {cols*rows} cells, packed like a professional game asset sheet: each figure fills most of its cell but never "
         "touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared "
         "baseline. Figures face LEFT in a 3/4 view (he usually stands opposite the PM, who faces right) unless a cell says "
         "otherwise. Reading order: left to right, top to bottom. ")
    if portrait_first:
        s += ("Cell 1 (top-left) is special: a head-and-shoulders portrait inside a rounded-square frame with a thin dark "
              "outline and a soft pastel-blue background with a few sparkles, the character with a calm confident smile, "
              "holding the navy folder against the chest. Cell 1 is the ONLY cell with a background; every other cell is a "
              "full-body figure on pure white.")
    return s

OBJECT_RULE = ("OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites "
"that will be placed by code. Wherever a cell mentions a folder, document, contract, tablet, phone, notebook, pen, mug, "
"clicker, marker, checklist, badge held in the hand, chair, desk, table, whiteboard or screen, do NOT draw that object. "
"Instead draw the empty hand(s) in the exact grip pose as if holding it, and the body sitting at the correct height as if "
"on the invisible furniture. Keep the worn lanyard badge and the wristwatch as part of the character. MARKER DOTS: small "
"solid round dots about 1.5% of the cell width, flat color, no outline, no shading, drawn on top of the character. "
"MAGENTA #FF00FF = grip point of the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = "
"grip point of a second object held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they "
"touch the seat) for sitting poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no "
"dots. Never use these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw "
"grid lines or cell borders (except the frame of the portrait cells); add scenery, floor or walls; add extra characters "
"(the other person in a handshake or 1-1 is offscreen); crop limbs; repeat an identical pose; change the face, hair, "
"outfit colors or proportions between cells; use pure white for clothing edges that touch the background.")

# Moi o bam mot canh Anh Minh xuat hien trong kich ban (docs/KICH_BAN_ROLECRAFT_PM60.md).
# Doi chieu day du: mapping_section.md.
# ---------------------------------------------------------------- sheet A – master
A = [
 ("Row 1 - Portrait + idle + welcome (L1 intro: 'Chào mừng em đến với team')", [
  ("portrait","[portrait cell, see LAYOUT] calm confident smile, navy folder against the chest, a few sparkles"),
  ("idle_01","idle loop 1/4: upright relaxed stance, folder held at his side in the right hand"),
  ("idle_02","idle loop 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03","idle loop 3/4: head turned very slightly, attentive"),
  ("idle_back_01","standing seen from behind (back view), folder in the right hand"),
  ("idle_04","idle loop 4/4: slight exhale, calm face"),
  ("greet_01","small welcoming nod with a warm smile, free hand slightly raised"),
  ("greet_02","open palm toward the viewer, welcoming gesture")]),
 ("Row 2 - Walk cycle 8 frames, calm confident pace, folder in the right hand, left arm swings (arrives, and leaves the meeting after the handover)", [
  ("walk_01","walk contact: left foot forward heel touching"),("walk_02","walk down: weight on left leg, knee bent"),
  ("walk_03","walk passing: right leg passing the left"),("walk_04","walk up: rising on left toes"),
  ("walk_05","walk contact: right foot forward heel touching"),("walk_06","walk down: weight on right leg, knee bent"),
  ("walk_07","walk passing: left leg passing the right"),("walk_08","walk up: rising on right toes")]),
 ("Row 3 - Talking + listening (dialogue loops, hands free)", [
  ("talk_01","talking, right hand open at chest height, calm"),("talk_02","talking, both hands slightly open, explaining"),
  ("talk_03","talking, index finger lightly raised making a point"),("talk_04","talking, hand returning down, small smile"),
  ("listen_01","listening, arms loosely crossed, attentive"),("listen_02","listening, head tilted, one hand on the chin"),
  ("nod_01","nodding, eyes half closed, approving"),("nod_02","nodding, chin lifted back up")]),
 ("Row 4 - Sit down on an invisible meeting chair (same seat height in every sit cell) + leaving after the handover", [
  ("sit_01","standing next to the chair, about to sit, unbuttoning the blazer"),
  ("sit_02","lowering onto the chair"),("sit_03","seated upright, hands resting on the thighs"),
  ("sit_04","seated leaning back, arms crossed, evaluating"),("sit_05","seated leaning forward, elbows on knees, fingers laced"),
  ("sit_06","standing up from the chair, buttoning the blazer"),
  ("leave_01","turning away to leave, glancing back over the shoulder with an encouraging nod"),
  ("leave_02","walking away seen from behind, small wave over the shoulder")]),
 ("Row 5 - Positive reactions (summary 'good', review choice C, pass endings)", [
  ("good_01","approving smile, small nod, two golden sparkles"),("good_02","proud smile, arms crossed, chin up"),
  ("good_03","warm smile, open hand toward the viewer, praising"),("encourage_01","small encouraging fist at chest height, 'the next stage will be harder'"),
  ("applaud_01","applauding, hands apart"),("applaud_02","applauding, hands together, sparkles"),
  ("impressed_01","eyebrows raised, pleasantly impressed"),("satisfied_01","satisfied closed-eye smile, hands behind the back")]),
 ("Row 6 - Serious / critical reactions (summary 'average' and 'risky', skeptical questions, warnings, review choice A)", [
  ("serious_01","stern straight face, hands behind the back"),("frown_01","frowning, arms crossed tightly"),
  ("doubt_01","skeptical raised eyebrow, hand on the chin, small question mark"),("warn_01","index finger raised in warning, serious face"),
  ("concern_01","concerned, one hand raised palm out, 'watch the consequences'"),("sigh_01","sighing, eyes closed, small grey puff"),
  ("disappoint_01","slow head shake, eyes closed, lips pressed"),("critique_01","one hand turning palm up, mild critique, 'transparency is not a list of problems'")]),
 ("Row 7 - Thinking + manager stances (asking the PM to decide)", [
  ("think_01","thinking, hand on the chin, looking up"),("think_02","thinking, eyes closed, finger tapping the chin"),
  ("watch_01","raising the left wrist and checking the watch, 'you have 15 days left'"),("crossarms_01","arms crossed, neutral, waiting for an answer"),
  ("behind_01","hands clasped behind the back, calm evaluating look"),("point_01","open hand toward the viewer, 'the decision is yours'"),
  ("weigh_01","both palms up like a scale, weighing two options"),("weigh_02","one palm higher than the other, pointing out the trade-off")]),
]

# ---------------------------------------------------------------- sheet B – cam nam + cu chi
B = [
 ("Row 1 - Documents (L1 handover; L4 S13 reviews the operating documents; L4 S14 receives the PM's team assessment)", [
  ("doc_carry_01","folder tucked under the left arm, standing"),("doc_give_01","extending the folder forward with both hands (handover)"),
  ("doc_give_02","folder handed over, hands returning, encouraging smile"),("doc_receive_01","receiving a folder offered from the left with both hands"),
  ("doc_read_01","reading an open folder held in both hands"),("doc_read_02","reading the open folder, thoughtful frown"),
  ("doc_flip_01","flipping a page in the open folder"),("doc_close_01","closing the folder, small nod")]),
 ("Row 2 - Tablet: budget and numbers (L1 '100 budget points'; L2 S05 budget condition; L2 S07 retention budget)", [
  ("tab_hold_01","holding the tablet at chest height with both hands"),("tab_read_01","reading the tablet, calm"),
  ("tab_read_02","reading the tablet, eyebrows raised at a number"),("tab_present_01","turning the tablet screen toward the viewer"),
  ("tab_present_02","tablet turned, pointing at the screen with the free hand"),("tab_present_03","tablet turned, explaining with a small nod"),
  ("tab_swipe_01","swiping on the tablet screen, which faces the viewer"),("tab_tuck_01","tucking the tablet under the arm")]),
 ("Row 3 - Phone (L2 S08 private message to the PM during the client meeting; L3 S10 news of the sales over-commitment; L3 S12 call from the board)", [
  ("phone_type_01","typing a private message with the thumb, discreet"),("phone_type_02","typing, glancing up over the phone"),
  ("phone_read_01","reading a message on the phone, neutral"),("phone_read_02","reading the phone, frowning at bad news"),
  ("phone_call_01","phone at the ear, listening"),("phone_call_02","phone at the ear, nodding, free hand open"),
  ("phone_glance_01","lowering the phone and looking up at the viewer"),("phone_pocket_01","putting the phone back into the blazer pocket")]),
 ("Row 4 - Presenting project B on a screen (L2 S05; the screen is invisible on the LEFT)", [
  ("present_01","holding a clicker, pointing toward the screen"),("present_02","clicker click, explaining a slide"),
  ("present_03","turning back from the screen to the viewer"),("count_01","one finger up, 'project B: demo in two weeks'"),
  ("count_02","two fingers up, 'project A keeps its release date'"),("two_projects_01","hands apart at two heights, two projects, one team"),
  ("assign_01","open hand toward the viewer, 'use the resources you have'"),("wait_01","clicker lowered, waiting for the PM's plan today")]),
 ("Row 5 - Handshake, badge, encouragement (the other person is offscreen)", [
  ("shake_01","reaching out the right hand for a handshake"),("shake_02","firm handshake, warm smile"),
  ("badge_give_01","holding out a royal-blue official staff badge on a lanyard"),("badge_give_02","badge handed over, proud nod"),
  ("pat_01","patting an offscreen shoulder, encouraging"),("invite_sit_01","gesturing to an offscreen chair, 'please sit'"),
  ("reassure_01","hand on the chest, sincere and regretful"),("bow_01","formal slight bow, respectful")]),
 ("Row 6 - Explaining principles (his short lectures: 'A good PM is not someone without problems…')", [
  ("emph_01","both hands forward emphasizing, firm face"),("emph_02","chopping gesture with one hand, decisive"),
  ("list_01","counting three points on the fingers: results, team growth, accountability"),("list_02","last point counted, nodding"),
  ("calm_01","palms down, calming the discussion"),("shrug_01","small shrug, palms up, 'that is the trade-off'"),
  ("finger_01","one finger up, 'what I care about is…'"),("open_01","both hands open toward the team, asking the team a question")]),
]

# ---------------------------------------------------------------- sheet C – canh theo kich ban
C = [
 ("Row 1 - Seated at an invisible round meeting table on the LEFT (L2 S05 internal meeting, L4 S13 team meeting, L4 S15 client meeting; chair and table invisible, same seat height)", [
  ("meet_table_talk_01","seated at the table, talking with an open hand"),("meet_table_talk_02","seated, leaning in, explaining"),
  ("meet_table_listen_01","seated, listening, notebook on the table"),("meet_table_listen_02","seated, writing notes while listening"),
  ("meet_table_ask_01","seated, asking the team an open question, both palms up"),("meet_table_doubt_01","seated, skeptical raised eyebrow, hand on the chin"),
  ("meet_table_frown_01","seated, arms crossed on the table, frowning"),("meet_table_agree_01","seated, nodding with a satisfied smile")]),
 ("Row 2 - One-on-one room: seated on an invisible chair, no table (L2 S07 retention talk, L4 S14 team assessment)", [
  ("oneone_talk_01","seated, talking calmly"),("oneone_talk_02","seated, leaning forward, sincere"),
  ("oneone_listen_01","seated, listening, notebook on the knee"),("oneone_listen_02","seated, listening, hand on the chin"),
  ("oneone_show_01","seated, showing the tablet screen with the budget to the other person"),("oneone_show_02","seated, pointing at a number on the tablet"),
  ("oneone_agree_01","seated, conditional agreement: nodding with one finger raised"),("oneone_warn_01","seated, serious warning, hands clasped")]),
 ("Row 3 - Final Review: seated at an invisible long panel table on the LEFT, blazer buttoned, next to HR (L4 S16; same seat height)", [
  ("panel_open_01","seated, opening the review, hands folded on the table, speaking"),("panel_open_02","seated, opening remark, one open hand"),
  ("panel_listen_01","seated, listening attentively, slight nod"),("panel_note_01","seated, writing notes with a pen"),
  ("panel_confer_01","seated, turning to the side to confer quietly with HR offscreen"),("panel_disappoint_01","seated, disappointed, leaning back, lips pressed (report only shows achievements)"),
  ("panel_critique_01","seated, mild critique, palm up (report lists problems without a plan)"),("panel_approve_01","seated, approving nod and small smile (structured report with a 90-day roadmap)")]),
 ("Row 4 - End of the review + pass endings (standing, blazer buttoned)", [
  ("review_thank_01","seated, thanking the PM with a nod, 'please wait for the result'"),("review_stand_01","standing up from the panel table"),
  ("pass_announce_01","standing, announcing good news with a smile"),("pass_announce_02","standing, arms slightly open, 'congratulations'"),
  ("pass_shake_01","reaching out for a congratulating handshake"),("pass_shake_02","firm congratulating handshake, big smile"),
  ("excellent_announce_01","standing, sweeping open arm, 'a bigger scope for you'"),("excellent_applaud_01","applauding warmly, sparkles")]),
 ("Row 5 - Extension and fail endings (standing, blazer buttoned)", [
  ("extend_talk_01","standing, calm serious explanation"),("extend_talk_02","standing, counting the missing competencies on the fingers"),
  ("extend_encourage_01","standing, encouraging open hand, 'focus on what is missing'"),("fail_talk_01","standing, regretful, hand on the chest"),
  ("fail_talk_02","standing, looking down, choosing words carefully"),("fail_sigh_01","sighing, eyes closed, small grey puff"),
  ("fail_reassure_01","sympathetic gesture toward an offscreen shoulder"),("fail_goodbye_01","formal slight bow, respectful goodbye")]),
 ("Row 6 - Level 3 moments (spec: MANAGER joins S10 sales over-commitment and S12 big project offer)", [
  ("overcommit_listen_01","arms crossed, listening to Sales on the left with a frown"),("overcommit_doubt_01","turning to the PM with a skeptical look, 'how will you handle this commitment?'"),
  ("overcommit_displeased_01","displeased, pinching the bridge of the nose (the PM blamed Sales in front of the client)"),("overcommit_approve_01","approving nod (MVP in 10 days + estimated phase 2)"),
  ("offer_01","leaning forward with an open hand, presenting the big project from the board"),("offer_02","raising an eyebrow with a small challenging smile, 'success would count a lot'"),
  ("offer_listen_01","listening to the PM's conditions, hand on the chin"),("offer_accept_01","nodding, agreeing to add people and budget")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral","neutral, composed"),("face_welcome","warm welcoming smile"),("face_explain","calm, explaining, mouth slightly open"),("face_serious","serious, straight mouth")]),
 ("Row 2", [("face_stern","stern, eyebrows lowered"),("face_skeptical","one eyebrow raised, skeptical"),("face_concerned","concerned, eyebrows tilted"),("face_warning","warning, index finger raised into the frame")]),
 ("Row 3", [("face_thinking","thinking, eyes looking up"),("face_challenge","small challenging smile, eyebrow raised"),("face_disappointed","disappointed, eyes lowered"),("face_sigh","sighing, eyes closed, small grey puff")]),
 ("Row 4", [("face_approving","approving nod, gentle smile"),("face_satisfied","satisfied closed-eye smile"),("face_proud","proud smile, chin slightly up"),("face_congrats","big congratulating smile")]),
 ("Row 5", [("face_encouraging","encouraging, bright eyes"),("face_regretful","regretful, soft sad eyes"),("face_sympathetic","sympathetic, soft sad smile"),("face_formal","formal, blazer buttoned, neutral")]),
]

SHEETS = [
 {"id":"A","key":"master","cols":8,"rows":7,"attach":"photo+pm","grid":A,"portrait_first":True,
  "task":"framed portrait, idle and welcome, walk cycle, talking and listening, sitting down and leaving, and reactions",
  "title":"Master: chân dung, đứng, chào đón, đi, nói/nghe, ngồi, rời đi, cảm xúc"},
 {"id":"B","key":"hands_gestures","cols":8,"rows":6,"attach":"master","grid":B,
  "task":"handing over and reviewing documents, budget tablet, discreet phone messages and calls, presenting on a screen, handshake and badge, explaining principles",
  "title":"Tài liệu, tablet ngân sách, điện thoại, trình bày, bắt tay/thẻ, giảng giải"},
 {"id":"C","key":"scenes_review","cols":8,"rows":6,"attach":"master","grid":C,
  "task":"meeting table, one-on-one room, chairing the final probation review, announcing the four endings, and the Level 3 moments",
  "title":"Bàn họp, phòng 1-1, Final Review, 4 kết thúc, Level 3"},
 {"id":"D","key":"portraits","cols":4,"rows":5,"attach":"master","grid":D,"portrait":True,
  "task":"20 framed facial-expression portraits for a dialogue box","title":"20 chân dung cảm xúc cho hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua sheet P, O cua PM)
def P(id, at="grip", z="front", rot=0): return {"prop": id, "at": at, "z": z, "rot": rot}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
MCHAIR, MTABLE = F("meeting_chair"), F("meeting_table", z="front")
RULES = [  # (regex, bindings) – khop dau tien
 (r"portrait$|^face_", []),
 (r"^idle_0|idle_back|^walk_|^leave_", [P("folder_closed")]),
 (r"sit_01", [F("meeting_chair", "beside_left")]),
 (r"^sit_", [MCHAIR]),
 (r"doc_carry|doc_give|doc_receive", [P("folder_closed")]),
 (r"doc_read|doc_flip|doc_close", [P("folder_open")]),
 (r"tab_present|oneone_show", [P("tablet_screen_34")]),
 (r"tab_swipe", [P("tablet_screen_front")]),
 (r"tab_tuck", [P("tablet_edge", z="back")]),
 (r"tab_", [P("tablet_back")]),
 (r"phone_", [P("phone_back")]),
 (r"present_0|^count_|two_projects|assign_01|wait_01", [P("clicker"), F("presentation_screen", "beside_left")]),
 (r"badge_give", [P("badge_blue")]),
 (r"meet_table_listen_01", [MCHAIR, MTABLE, P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_listen_02", [MCHAIR, MTABLE, P("pen"), P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_", [MCHAIR, MTABLE]),
 (r"oneone_listen_01", [MCHAIR, P("notebook_open")]),
 (r"oneone_", [MCHAIR]),
 (r"panel_note", [MCHAIR, MTABLE, P("pen")]),
 (r"panel_|review_thank", [MCHAIR, MTABLE]),
 (r"review_stand", [F("meeting_table", "beside_left")]),
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
             f"Anh Minh, the department head / PM lead who hires and evaluates the young PM. Sheet content: {s['task']}.",
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
       "leave": (6, False), "applaud": (8, True), "doc_give": (8, False), "phone_type": (8, True), "phone_call": (6, True),
       "present": (6, False), "count": (6, False), "shake": (6, False), "badge_give": (6, False), "list": (6, False),
       "panel_open": (5, True), "pass_announce": (6, False), "pass_shake": (6, False), "extend_talk": (6, True),
       "fail_talk": (5, True), "offer": (6, False), "meet_table_talk": (6, True), "oneone_talk": (6, True)}

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    man = {"version": 3, "character": {"id": "MINH", "role": "MANAGER", "name": "Anh Minh – Trưởng phòng/PM Lead"},
           "shared": {"note": "Đồ vật, nội thất, icon dùng lại sheet P, O, F của bộ PM (docs/PM): prop/*, furn/*, icon/*"},
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}}
    for s in SHEETS:
        open(f"{OUT}/prompts/MINH_{s['id']}_{s['key']}.txt", "w").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"minh/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        man["sheets"].append({"id": s["id"], "key": s["key"], "kind": "minh", "file": f"MINH_{s['id']}_{s['key']}.png",
                              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl})
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (8, False) if len(fr) > 1 else (1, False))
            man["animations"][f"minh/{k}"] = {"frames": [f"minh/{f}" for f in fr], "fps": fps, "loop": loop}
    json.dump(man, open(f"{OUT}/minh_sprite_manifest.json", "w"), ensure_ascii=False, indent=1)
    n = sum(len(cells(s)) for s in SHEETS)
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation -> prompts/ + minh_sprite_manifest.json")

if __name__ == "__main__":
    main()
