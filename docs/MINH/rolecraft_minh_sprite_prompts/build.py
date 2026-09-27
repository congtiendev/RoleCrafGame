# -*- coding: utf-8 -*-
# Bo prompt sprite ANH MINH v4 (MANAGER – Truong phong/PM Lead), cung khuon voi bo HUY v4 va co che v3 cua bo PM:
# ve tay khong + cham neo, do vat / noi that / icon DUNG LAI sheet P, O, F cua PM (moi mon Minh can deu co san).
# Minh quay PHAI nhu PM de dung chung ghe, ban, man chieu cua bo PM; game lat ca cum (flip) khi Minh dung doi dien PM.
# Nhan dien tu ANH THAT (chua co sheet Minh nao duoc duyet). Noi dung o va mapping bam docs/KICH_BAN_ROLECRAFT_PM60.md.
#     python build.py   -> prompts/MINH_*.txt, minh_sprite_manifest.json, SOL_ONE_SHOT_PROMPT.txt,
#                          mapping_section.md, README_MINH_SPRITE_PROMPTS.md (ca ban o docs/MINH/)
import copy, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT", HERE)

# ---------------------------------------------------------------- van ban chung (ngan, khong lap y)
WHO = "Anh Minh, the department head / PM lead who hands the project to the young PM and chairs the 60-day review"

ATTACH_A = ("ATTACHED IMAGES: Image 1 is a photo of a real person who agreed to become this character: the ONLY source "
"for the face. Image 2 is the master sheet of ANOTHER character (the young PM): use it ONLY for the grid layout, sprite "
"size, outline and shading; never copy the PM's face or clothes.")
ATTACH_MASTER = ("ATTACHED IMAGES: Image 1 is the approved master sheet of this character (Anh Minh, Sheet A): match it "
"exactly (face, hair, outfit, colors, proportions, outline, shading, sprite size). Image 2 is the photo of the real "
"person: use it only to keep the face recognizable.")

IDENTITY = ("IDENTITY: keep the person in the photo clearly recognizable: face shape, eyes and eyebrows, nose and mouth, "
"hairstyle, hair length, color and parting, skin tone, and features such as glasses, moles or beard (glasses, if any, "
"in every cell). Stylize into the art style; do not trace the photo. Ignore the photo's background, pose, expression "
"and clothing.")

CHARACTER = ("CHARACTER (identical in every cell unless a row says otherwise): Anh Minh, late thirties, calm and composed, "
"an experienced manager. White button-up shirt, no tie, top button open; charcoal-grey single-breasted blazer worn open; "
"charcoal-grey trousers; black belt; black leather shoes; a simple dark wristwatch on the left wrist; a royal-blue "
"lanyard with a plain royal-blue ID badge card at the chest (blank, no text). About 2.5 heads tall, slightly taller and "
"broader-shouldered than the PM, with a more mature look.")

STYLE = ("ART STYLE: cute chibi game sprite, soft high-resolution pixel art: big head, expressive glossy eyes, small nose "
"and mouth, short limbs, clean dark-brown outline (not pure black), soft cel shading, warm natural colors, top-left light. "
"Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, grey puff, "
"exclamation or question mark) only where a cell asks for them, kept inside the cell.")

def LAYOUT(cols, rows, portrait_first):
    s = (f"LAYOUT (most important): square 1:1 image, fully TRANSPARENT background (PNG with alpha channel): no white, no color, no checkerboard pattern painted in. Exactly {cols} columns x {rows} "
         f"rows = {cols*rows} equal invisible cells, ONE full-body figure per cell (head to shoes, never cut), centred in its "
         "cell, same size in every cell, clear empty gap between neighbours; no arm, icon or shadow crosses a cell edge. In "
         "each row all feet rest on one shared baseline. Figures face RIGHT in a 3/4 view unless a cell says otherwise. "
         "Reading order left to right, top to bottom.")
    if portrait_first:
        s += (" Cell 1 is the only exception: a head-and-shoulders portrait in a rounded-square frame with a thin dark "
              "outline and a soft pastel-blue background with a few sparkles; Anh Minh with a calm confident smile holding "
              "a closed navy document folder against his chest. No other cell has a background or a drawn object.")
    return s

OBJECT_RULE = ("OBJECTS AND FURNITURE ARE ADDED BY CODE, SO NEVER DRAW THEM: no folder, paper, tablet, phone, notebook, "
"pen, clicker, badge held in the hand, chair, desk, table, monitor or screen (the worn lanyard badge and the watch stay). "
"Draw the empty hand(s) in the exact grip pose, and seated bodies at the right height on invisible furniture. "
"MARKER DOTS, only where a cell has a [markers] tag: small solid flat dots about 1.5% of the cell width drawn on top of "
"the figure. MAGENTA #FF00FF = grip point of the main held object (two hands: midway between them); GREEN #00FF00 = "
"grip point of a second object in the other hand; CYAN #00FFFF = middle of the hips where they touch a seat. Never use "
"these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; add text, letters, numbers or watermark; draw grid lines or "
"cell borders; add scenery, floor or walls; add other characters (the PM, HR, Sales or the team are offscreen); crop "
"limbs; repeat an identical pose; change face, hair, outfit colors or proportions between cells.")

# ---------------------------------------------------------------- sheet A – master (co the)
A = [
 ("Row 1 - Portrait + idle (closed folder held at his side in the right hand)", [
  ("portrait", "[portrait cell, see LAYOUT]"),
  ("idle_01", "idle 1/4: upright relaxed stance"),
  ("idle_02", "idle 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03", "idle 3/4: head turned very slightly, attentive"),
  ("idle_04", "idle 4/4: slight exhale, calm face"),
  ("idle_back_01", "seen from BEHIND (back view), standing"),
  ("greet_01", "small welcoming nod with a warm smile, free hand slightly raised"),
  ("greet_02", "open palm forward, welcoming gesture")]),
 ("Row 2 - Walk cycle 8 frames, calm confident pace, folder in the right hand, left arm swings", [
  ("walk_01", "contact: right foot forward, heel touching"), ("walk_02", "down: weight on right leg, knee bent"),
  ("walk_03", "passing: left leg passing the right"), ("walk_04", "up: rising on right toes"),
  ("walk_05", "contact: left foot forward, heel touching"), ("walk_06", "down: weight on left leg, knee bent"),
  ("walk_07", "passing: right leg passing the left"), ("walk_08", "up: rising on left toes")]),
 ("Row 3 - Leaving and composing himself", [
  ("walk_back_01", "walking away seen from BEHIND, step 1, folder in the right hand"),
  ("walk_back_02", "walking away from behind, step 2"),
  ("walk_back_03", "walking away from behind, step 3"),
  ("walk_back_04", "walking away from behind, step 4"),
  ("turn_01", "turning away to leave, glancing back over the shoulder with an encouraging nod"),
  ("turn_02", "seen from behind, small wave over the shoulder, hands free"),
  ("adjust_01", "hands free, straightening the blazer lapels, composed"),
  ("adjust_02", "hands free, buttoning the blazer")]),
 ("Row 4 - Invisible meeting chair (same seat height in every seated cell)", [
  ("sit_01", "standing in front of the chair, about to sit, unbuttoning the blazer"),
  ("sit_02", "lowering onto the chair"),
  ("sit_03", "seated upright, hands resting on the thighs"),
  ("sit_04", "seated leaning back, arms crossed, evaluating"),
  ("sit_05", "seated leaning forward, elbows on the knees, fingers laced"),
  ("sit_06", "seated, legs crossed, relaxed, hand on the knee"),
  ("sit_think_01", "seated, hand on the chin, thinking"),
  ("sit_07", "standing up from the chair, hands on the knees")]),
 ("Row 5 - Positive reactions", [
  ("good_01", "approving smile, small nod, two golden sparkles"),
  ("good_02", "proud smile, arms crossed, chin up"),
  ("good_03", "warm smile, open hand forward, praising"),
  ("encourage_01", "small encouraging fist at chest height, 'the next stage will be harder'"),
  ("applaud_01", "applauding, hands apart"), ("applaud_02", "applauding, hands together, sparkles"),
  ("impressed_01", "eyebrows raised, pleasantly impressed"),
  ("satisfied_01", "satisfied closed-eye smile, hands behind the back")]),
 ("Row 6 - Serious and critical reactions", [
  ("serious_01", "stern straight face, hands behind the back"),
  ("frown_01", "frowning, arms crossed tightly"),
  ("doubt_01", "skeptical raised eyebrow, hand on the chin, small question mark"),
  ("warn_01", "index finger raised in warning, serious"),
  ("concern_01", "concerned, one palm raised forward, 'watch these risks'"),
  ("sigh_01", "sighing, eyes closed, small grey puff"),
  ("disappoint_01", "slow head shake, eyes closed, lips pressed"),
  ("critique_01", "one hand turning palm up, mild critique")]),
 ("Row 7 - Thinking and manager stances", [
  ("think_01", "hand on the chin, looking up"), ("think_02", "eyes closed, finger tapping the chin"),
  ("watch_01", "raising the left wrist and checking the watch"),
  ("crossarms_01", "arms crossed, neutral, waiting for an answer"),
  ("behind_01", "hands clasped behind the back, calm evaluating look"),
  ("point_01", "open hand forward, 'the decision is yours'"),
  ("weigh_01", "both palms up like a scale, weighing two options"),
  ("weigh_02", "one palm higher than the other, pointing out the trade-off")]),
]

# ---------------------------------------------------------------- sheet B – cam nam + cu chi
B = [
 ("Row 1 - Documents (project handover, reviewing operating documents)", [
  ("doc_carry_01", "folder tucked under the left arm"),
  ("doc_give_01", "extending the folder forward with both hands, handing it over"),
  ("doc_give_02", "folder handed over, hands returning, encouraging smile"),
  ("doc_receive_01", "receiving a folder with both hands"),
  ("doc_read_01", "reading an open folder held in both hands"),
  ("doc_read_02", "reading the open folder, thoughtful frown"),
  ("doc_flip_01", "flipping a page in the open folder"),
  ("doc_close_01", "closing the folder, small nod")]),
 ("Row 2 - Tablet with the budget and numbers", [
  ("tab_hold_01", "holding the tablet at chest height with both hands"),
  ("tab_read_01", "reading the tablet, calm"),
  ("tab_read_02", "reading the tablet, eyebrows raised at a number"),
  ("tab_present_01", "turning the tablet screen to the right, toward the PM"),
  ("tab_present_02", "tablet turned, pointing at the screen with the free hand"),
  ("tab_present_03", "tablet turned, explaining with a small nod"),
  ("tab_swipe_01", "swiping on the tablet screen, which faces the viewer"),
  ("tab_tuck_01", "tablet tucked under the left arm")]),
 ("Row 3 - Phone (messages and a call from the board)", [
  ("phone_type_01", "typing a message with the thumb, discreet"),
  ("phone_type_02", "typing, glancing up over the phone"),
  ("phone_read_01", "reading the phone, neutral"),
  ("phone_read_02", "reading the phone, frowning at bad news"),
  ("phone_call_01", "phone at the right ear, listening"),
  ("phone_call_02", "phone at the ear, nodding, free hand open"),
  ("phone_glance_01", "lowering the phone and looking up"),
  ("phone_pocket_01", "putting the phone into the blazer pocket")]),
 ("Row 4 - Presenting project B at a screen on the RIGHT (invisible), clicker in the right hand", [
  ("present_01", "pointing toward the screen with the clicker"),
  ("present_02", "clicking, explaining a slide"),
  ("present_03", "turning back from the screen toward the viewer"),
  ("count_01", "one finger up, 'project B: demo in two weeks'"),
  ("count_02", "two fingers up, 'project A keeps its release date'"),
  ("two_projects_01", "hands apart at two heights: two projects, one team"),
  ("assign_01", "open hand forward, 'now it is more than one deadline'"),
  ("wait_01", "clicker lowered, waiting for the PM's plan")]),
 ("Row 5 - Handshake, badge, encouragement (the other person is offscreen on the right)", [
  ("shake_01", "reaching out the right hand for a handshake"),
  ("shake_02", "firm handshake, warm smile"),
  ("badge_give_01", "holding out a royal-blue staff badge on a lanyard"),
  ("badge_give_02", "badge handed over, proud nod"),
  ("pat_01", "patting an offscreen shoulder, encouraging"),
  ("invite_sit_01", "gesturing toward an offscreen chair, 'please sit'"),
  ("reassure_01", "hand on the chest, sincere and regretful"),
  ("bow_01", "formal slight bow, respectful")]),
 ("Row 6 - Explaining principles", [
  ("emph_01", "both hands forward, emphasizing, firm face"),
  ("emph_02", "chopping gesture with one hand, decisive"),
  ("list_01", "counting three points on the fingers: results, ability, potential"),
  ("list_02", "last point counted, nodding"),
  ("calm_01", "palms down, calming the discussion"),
  ("shrug_01", "small shrug, palms up, 'that is the trade-off'"),
  ("finger_01", "one finger up, 'what matters is…'"),
  ("open_01", "both hands open toward the team, asking a question")]),
 ("Row 7 - Talking and listening (dialogue loops, hands free)", [
  ("talk_01", "talking, right hand open at chest height, calm"),
  ("talk_02", "talking, both hands slightly open, explaining"),
  ("talk_03", "talking, index finger lightly raised, making a point"),
  ("talk_04", "talking, hand returning down, small smile"),
  ("listen_01", "listening, arms loosely crossed, attentive"),
  ("listen_02", "listening, head tilted, one hand on the chin"),
  ("nod_01", "nodding, eyes half closed, approving"), ("nod_02", "chin back up after the nod")]),
]

# ---------------------------------------------------------------- sheet C – canh theo kich ban (noi that ben PHAI)
C = [
 ("Row 1 - Seated at an invisible round meeting table on the RIGHT (same seat height)", [
  ("meet_table_talk_01", "talking with an open hand"),
  ("meet_table_talk_02", "leaning in, explaining"),
  ("meet_table_listen_01", "listening, forearms on the table"),
  ("meet_table_note_01", "writing notes with a pen while listening"),
  ("meet_table_ask_01", "asking the team an open question, both palms up"),
  ("meet_table_doubt_01", "skeptical raised eyebrow, hand on the chin"),
  ("meet_table_frown_01", "arms crossed on the table, frowning"),
  ("meet_table_agree_01", "nodding with a satisfied smile")]),
 ("Row 2 - One-on-one room: seated on an invisible chair, no table", [
  ("oneone_talk_01", "talking calmly"),
  ("oneone_talk_02", "leaning forward, sincere"),
  ("oneone_listen_01", "listening, hand on the chin"),
  ("oneone_listen_02", "listening, slight nod, hands on the knees"),
  ("oneone_show_01", "showing the budget on a tablet turned to the right"),
  ("oneone_show_02", "pointing at a number on the tablet"),
  ("oneone_agree_01", "conditional agreement: nodding with one finger raised"),
  ("oneone_warn_01", "serious warning, hands clasped, 'short-term risk is very high'")]),
 ("Row 3 - His own office: seated at an invisible desk with a monitor on the RIGHT (same seat height)", [
  ("desk_type_01", "typing, focused"),
  ("desk_read_01", "reading the monitor, hand on the mouse"),
  ("desk_phone_01", "phone at the ear, a call from the board, serious"),
  ("desk_turn_01", "swiveled on the chair to face the viewer, one arm on the armrest"),
  ("desk_invite_01", "swiveled toward the viewer, gesturing to the visitor's chair, 'come in, sit'"),
  ("desk_offer_01", "leaning forward with an open hand, presenting a big new project"),
  ("desk_offer_02", "eyebrow raised with a small challenging smile, 'doing it well would count a lot'"),
  ("desk_stand_01", "pushing the chair back, standing up")]),
 ("Row 4 - Final Review: seated at an invisible long panel table on the RIGHT, blazer buttoned (same seat height)", [
  ("panel_open_01", "hands folded on the table, speaking, opening the review"),
  ("panel_open_02", "one open hand, 'you have ten minutes'"),
  ("panel_listen_01", "listening attentively, slight nod"),
  ("panel_note_01", "writing notes with a pen"),
  ("panel_confer_01", "turning toward the viewer to confer quietly with HR offscreen"),
  ("panel_disappoint_01", "leaning back, disappointed, lips pressed"),
  ("panel_critique_01", "mild critique, palm up, 'turn it into an action plan'"),
  ("panel_approve_01", "approving nod and small smile")]),
 ("Row 5 - End of the review and pass endings (blazer buttoned)", [
  ("review_thank_01", "seated at the panel table, thanking with a nod, 'please wait for the result'"),
  ("review_stand_01", "standing up from the panel table"),
  ("pass_announce_01", "standing, announcing good news with a smile"),
  ("pass_announce_02", "standing, arms slightly open, 'congratulations'"),
  ("pass_shake_01", "reaching out for a congratulating handshake"),
  ("pass_shake_02", "firm congratulating handshake, big smile"),
  ("excellent_announce_01", "standing, sweeping open arm, 'a bigger scope for you'"),
  ("excellent_applaud_01", "applauding warmly, sparkles")]),
 ("Row 6 - Extension and fail endings (standing, blazer buttoned)", [
  ("extend_talk_01", "calm serious explanation"),
  ("extend_talk_02", "counting the missing competencies on the fingers"),
  ("extend_encourage_01", "encouraging open hand, 'focus on what is missing'"),
  ("fail_talk_01", "regretful, hand on the chest"),
  ("fail_talk_02", "looking down, choosing words carefully"),
  ("fail_sigh_01", "sighing, eyes closed, small grey puff"),
  ("fail_reassure_01", "sympathetic hand toward an offscreen shoulder"),
  ("fail_goodbye_01", "formal slight bow, respectful goodbye")]),
 ("Row 7 - Cells 49-52 standing (Sales over-commitment); cells 53-56 seated at the invisible desk on the RIGHT, same "
  "seat height as row 3 (reacting to the PM's answer about the big project)", [
  ("overcommit_listen_01", "arms crossed, listening to Sales offscreen with a frown"),
  ("overcommit_doubt_01", "skeptical look, 'how will you handle this commitment?'"),
  ("overcommit_displeased_01", "displeased, pinching the bridge of the nose"),
  ("overcommit_approve_01", "approving nod, one finger raised"),
  ("desk_listen_01", "leaning back, hand on the chin, listening to the PM's conditions"),
  ("desk_pleased_01", "pleased smile with a small nod, slightly worried eyebrows"),
  ("desk_frown_01", "leaning back, arms crossed, disappointed frown"),
  ("desk_agree_01", "leaning forward, nodding, agreeing to add people and budget")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral", "neutral, composed"), ("face_welcome", "warm welcoming smile"),
            ("face_explain", "calm, explaining, mouth slightly open"), ("face_serious", "serious, straight mouth")]),
 ("Row 2", [("face_stern", "stern, eyebrows lowered"), ("face_skeptical", "one eyebrow raised, skeptical"),
            ("face_concerned", "concerned, eyebrows tilted"), ("face_warning", "warning, index finger raised into the frame")]),
 ("Row 3", [("face_thinking", "thinking, eyes looking up"), ("face_challenge", "small challenging smile, eyebrow raised"),
            ("face_disappointed", "disappointed, eyes lowered"), ("face_sigh", "sighing, eyes closed, small grey puff")]),
 ("Row 4", [("face_approving", "approving, gentle smile"), ("face_satisfied", "satisfied closed-eye smile"),
            ("face_proud", "proud smile, chin slightly up"), ("face_congrats", "big congratulating smile")]),
 ("Row 5", [("face_encouraging", "encouraging, bright eyes"), ("face_regretful", "regretful, soft sad eyes"),
            ("face_sympathetic", "sympathetic, soft sad smile"), ("face_formal", "formal, blazer buttoned, neutral")]),
]

SHEETS = [
 {"id": "A", "key": "master", "cols": 8, "rows": 7, "attach": "photo+pm", "grid": A, "portrait_first": True,
  "task": "framed portrait, idle and welcome, walk cycle, walking away and turning, sitting on a chair, reactions and "
          "manager stances",
  "title": "Master: chân dung, đứng, chào, đi, rời đi (quay lưng), ngồi ghế, cảm xúc, tư thế quản lý"},
 {"id": "B", "key": "hands_gestures", "cols": 8, "rows": 7, "attach": "master", "grid": B,
  "task": "handing over documents, budget tablet, phone, presenting on a screen, handshake and badge, explaining "
          "principles, talking and listening",
  "title": "Tài liệu, tablet ngân sách, điện thoại, trình chiếu dự án B, bắt tay/thẻ, giảng giải, nói/nghe"},
 {"id": "C", "key": "scenes_review", "cols": 8, "rows": 7, "attach": "master", "grid": C,
  "task": "meeting table, one-on-one room, his own office desk, chairing the final review, announcing the four "
          "endings, Sales over-commitment and big-project reactions",
  "title": "Bàn họp, 1-1, phòng riêng (S12), Final Review, 4 kết thúc, S10/S12"},
 {"id": "D", "key": "portraits", "cols": 4, "rows": 5, "attach": "master", "grid": D, "portrait": True,
  "task": "20 framed facial-expression portraits for a dialogue box", "title": "20 chân dung hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua bo PM)
def P(id, at="grip", z="front"): return {"prop": id, "at": at, "z": z}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
MCHAIR, OCHAIR = F("meeting_chair"), F("office_chair")
MTABLE, DESK = F("meeting_table", z="front"), F("desk_monitor", z="front")
FOLDER, SCREEN = P("folder_closed"), F("presentation_screen", "beside")   # beside = ben phai (pm_compose)
RULES = [  # (regex, bindings) – khop dau tien
 (r"^portrait$|^face_", []),
 (r"^idle_|^walk_|^walk_back_|^turn_01$", [FOLDER]),
 (r"^sit_01$", [F("meeting_chair", "beside")]),
 (r"^sit_", [MCHAIR]),
 (r"doc_carry", [P("folder_closed", z="back")]),
 (r"doc_give_01|doc_receive", [FOLDER]),
 (r"doc_read|doc_flip|doc_close", [P("folder_open")]),
 (r"tab_present", [P("tablet_screen_34")]),
 (r"tab_swipe", [P("tablet_screen_front")]),
 (r"tab_tuck", [P("tablet_edge", z="back")]),
 (r"^tab_", [P("tablet_back")]),
 (r"^phone_", [P("phone_back")]),
 (r"^present_|^count_|two_projects|assign_01|wait_01", [P("clicker"), SCREEN]),
 (r"badge_give_01", [P("badge_blue")]),
 (r"meet_table_note|panel_note", [MCHAIR, MTABLE, P("pen"), P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_listen", [MCHAIR, MTABLE, P("notebook_open", "surface:meeting_table")]),
 (r"^meet_table_|^panel_|review_thank", [MCHAIR, MTABLE]),
 (r"review_stand", [F("meeting_table", "beside")]),
 (r"oneone_show", [MCHAIR, P("tablet_screen_34")]),
 (r"^oneone_", [MCHAIR]),
 (r"desk_phone", [OCHAIR, DESK, P("phone_back")]),
 (r"desk_turn|desk_invite", [OCHAIR]),
 (r"^desk_", [OCHAIR, DESK]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green"}
WORD = {"folder": "folder", "tablet": "tablet", "phone": "phone", "pen": "pen", "clicker": "clicker", "badge": "badge",
        "notebook": "notebook"}
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
            f"LAYOUT: square 1:1, fully transparent background outside the frames (no white, no checkerboard). Exactly {cols} columns x {rows} rows = "
            f"{cols*rows} cells. Every cell is a head-and-shoulders portrait inside a rounded-square frame with a thin "
            "dark outline and a soft pastel-blue background, identical frame size and crop, exactly like cell 1 of the "
            "master sheet. Face the viewer, turned slightly right, hands empty unless an expression says otherwise. "
            "Frames never touch.",
            "EXPRESSIONS:\n" + rows_text(s, tags=False), NEG])
    return "\n\n".join([
        head + f"sprite sheet of {WHO}. Sheet content: {s['task']}.", attach, IDENTITY, CHARACTER, STYLE,
        LAYOUT(cols, rows, s.get("portrait_first", False)), OBJECT_RULE, "CELLS:\n" + rows_text(s), NEG])

FPS = {"idle": (6, True), "walk": (10, True), "walk_back": (8, True), "greet": (6, False), "turn": (6, False),
       "adjust": (5, False), "sit": (8, False), "good": (6, False), "applaud": (8, True), "think": (4, True),
       "weigh": (4, True), "doc_give": (6, False), "doc_read": (3, True), "tab_read": (3, True),
       "tab_present": (6, False), "phone_type": (8, True), "phone_read": (3, True), "phone_call": (4, True),
       "present": (6, False), "count": (4, False), "shake": (6, False), "badge_give": (6, False), "emph": (6, False),
       "list": (4, False), "talk": (6, True), "listen": (3, True), "nod": (6, False),
       "meet_table_talk": (6, True), "oneone_talk": (6, True), "oneone_listen": (3, True), "oneone_show": (6, False),
       "desk_offer": (5, False), "panel_open": (5, True), "pass_announce": (6, False), "pass_shake": (6, False),
       "extend_talk": (6, True), "fail_talk": (5, True)}

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

# ---------------------------------------------------------------- bam kich ban (docs/KICH_BAN_ROLECRAFT_PM60.md)
# (canh, nhip, nguoi noi / thoai, chuoi animation va chan dung)
SCENES = [
 ("L1 Intro nhận việc", "Mở cảnh", "Anh Minh: “Dự án xong 40%, PM cũ nghỉ, tài liệu thiếu. Khách muốn demo sau 7 ngày.”", "walk → greet → doc_give · face_explain"),
 ("L1 Intro nhận việc", "", "Anh Minh: “Em có team 3 người và 100 điểm ngân sách. Quyết định là của em.”", "tab_present → point_01 · face_challenge"),
 ("L1 Intro nhận việc", "", "PM: “Em hiểu rồi ạ. Để em gặp team trước.”", "nod → encourage_01 · face_encouraging"),
 ("L1 S01 Tiếp quản", "Mở cảnh", "(MANAGER có mặt, không thoại; Huy, Lan nói)", "listen → turn_01 → walk_back (rời cảnh)"),
 ("L1 Tổng kết", "Tốt", "Anh Minh: “Em đã bắt đầu kiểm soát được dự án. Giai đoạn tới sẽ khó hơn.”", "good_03 → encourage_01 · face_approving"),
 ("L1 Tổng kết", "Trung bình", "Anh Minh: “Dự án vẫn chạy, nhưng vài quyết định đang tạo ra rủi ro. Theo dõi kỹ nhé.”", "talk → concern_01 · face_concerned"),
 ("L1 Tổng kết", "Rủi ro", "Anh Minh: “Tiến độ trước mắt ổn, nhưng nền tảng chưa vững. Vấn đề sẽ quay lại.”", "serious_01 → warn_01 · face_serious"),
 ("L2 Intro", "Mở cảnh", "Anh Minh: “Công ty có thêm dự án B. Từ giờ em không chỉ quản lý một deadline.”", "two_projects_01 → assign_01 · face_explain"),
 ("L2 S05 Hai dự án", "Mở cảnh", "Anh Minh: “Dự án B cần demo sau hai tuần, dự án A vẫn giữ mốc release.”", "present → count · face_explain → wait_01"),
 ("L2 S05 Hai dự án", "A / B", "(PM, Huy / Nam nói)", "A: weigh_02 · face_thinking · B: frown_01 · face_concerned"),
 ("L2 S05 Hai dự án", "C", "Anh Minh: “Vậy B sẽ không có demo đầy đủ sau hai tuần.”", "doubt_01 → nod · face_skeptical"),
 ("L2 S07 Giữ Huy", "Mở cảnh", "(Huy nói với PM)", "oneone_listen · face_serious"),
 ("L2 S07 Giữ Huy", "A", "PM đề xuất ngân sách retention", "oneone_show → oneone_agree_01 · face_thinking"),
 ("L2 S07 Giữ Huy", "B", "Anh Minh: “Rủi ro ngắn hạn rất cao. Dự án phải chạy được khi chưa có người mới.”", "oneone_warn_01 · face_warning"),
 ("L2 S07 Giữ Huy", "C → C1 / C2", "PM đề xuất lộ trình Technical Lead", "oneone_listen → C1: oneone_agree_01 · face_approving / C2: sigh_01 · face_concerned"),
 ("L2 S08 Complain", "Mở cảnh", "(MANAGER có mặt, không thoại; Anh Hiệp, Lan nói)", "meet_table_listen · face_serious"),
 ("L2 S08 Complain", "A / B / C", "(PM, Anh Hiệp, Lan nói)", "A: meet_table_frown_01 · face_stern · B: meet_table_doubt_01 · C: meet_table_agree_01 · face_approving"),
 ("L2 Tổng kết", "Tốt", "Anh Minh: “Em đã biết quản lý đánh đổi thay vì chỉ phản ứng với từng yêu cầu.”", "good_02 → applaud · face_proud"),
 ("L2 Tổng kết", "Trung bình", "Anh Minh: “Dự án vẫn chạy, nhưng đang dựa nhiều vào nỗ lực cá nhân.”", "talk → concern_01 · face_concerned"),
 ("L2 Tổng kết", "Rủi ro", "Anh Minh: “Tiến độ tăng, nhưng team và chất lượng đang phải trả giá.”", "warn_01 → sigh_01 · face_stern"),
 ("L3 S10 Sales hứa 10 ngày", "Mở cảnh", "(MANAGER có mặt; Linh: “Chị chốt với khách rồi…”)", "phone_read_02 → overcommit_listen_01 → overcommit_doubt_01 · face_skeptical"),
 ("L3 S10 Sales hứa 10 ngày", "A / B / C", "(PM nói)", "A: nod · face_neutral · B: overcommit_displeased_01 · face_stern · C: overcommit_approve_01 · face_approving"),
 ("L3 S12 Dự án lớn", "Mở cảnh", "Dẫn truyện: Anh Minh gọi PM lên phòng", "desk_phone_01 → desk_turn_01 → desk_invite_01"),
 ("L3 S12 Dự án lớn", "", "Anh Minh: “Ban giám đốc muốn team nhận thêm một dự án lớn. Làm tốt thì rất có lợi cho em.”", "desk_offer · face_challenge"),
 ("L3 S12 Dự án lớn", "A / B / C", "Em nhận ngay / Em xin từ chối / Em nhận, nếu có thêm một người…", "A: desk_pleased_01 · face_satisfied · B: desk_frown_01 · face_disappointed · C: desk_listen_01 → desk_agree_01 · face_approving"),
 ("L4 Intro", "Mở cảnh", "Anh Minh: “Em còn 15 ngày trước buổi đánh giá cuối kỳ.”", "watch_01 → talk · face_serious"),
 ("L4 Intro", "", "Anh Minh: “Hãy để các quyết định 15 ngày cuối thành bằng chứng cho năng lực của em.”", "finger_01 → encourage_01 · face_encouraging"),
 ("L4 S13 Hệ thống vận hành", "Mở cảnh", "Anh Minh: “Nếu Huy nghỉ hoặc Lan chuyển dự án, team có tự vận hành được không?”", "meet_table_ask_01 · face_concerned"),
 ("L4 S13 Hệ thống vận hành", "A / B / C", "(PM, Huy, Lan, Nam nói)", "A: meet_table_frown_01 · B: meet_table_note_01 → meet_table_agree_01 · C: meet_table_agree_01 · face_satisfied"),
 ("L4 S13 Hệ thống vận hành", "Kết cảnh", "xem lại tài liệu vận hành", "doc_read → doc_flip_01 → doc_close_01 · face_thinking"),
 ("L4 S14 Phát triển team", "Mở cảnh", "Anh Minh: “Đánh giá từng người theo kết quả, năng lực và tiềm năng phát triển.”", "oneone_talk → list · face_explain"),
 ("L4 S14 Phát triển team", "A / B / C", "(PM, Lan, Nam, Huy nói)", "A: oneone_warn_01 · face_concerned · B: oneone_agree_01 · C: oneone_agree_01 · face_approving"),
 ("L4 S14 Phát triển team", "Kết cảnh", "PM nộp bản đánh giá", "doc_receive_01 → doc_read · face_thinking"),
 ("L4 S15 Mở rộng hợp tác", "Mở cảnh + nhánh", "(MANAGER có mặt, không thoại)", "meet_table_listen · A: meet_table_frown_01 · face_concerned · B: meet_table_agree_01 · C: meet_table_agree_01 · face_satisfied"),
 ("L4 S16 Final Review", "Mở cảnh", "Anh Minh: “PM tốt không phải người không gặp vấn đề, mà là người biết chịu trách nhiệm.”", "walk → adjust_02 → sit → panel_open_01 · face_formal"),
 ("L4 S16 Final Review", "", "Anh Minh: “Em có 10 phút cho kết quả, quyết định quan trọng và kế hoạch 90 ngày.”", "panel_open_02 · face_formal"),
 ("L4 S16 Final Review", "A", "(Chị Hà: báo cáo chưa nói gì về sự cố…)", "panel_disappoint_01 · face_disappointed"),
 ("L4 S16 Final Review", "B", "Anh Minh: “Minh bạch là tốt, nhưng em cần biến nó thành kế hoạch hành động.”", "panel_critique_01 · face_serious"),
 ("L4 S16 Final Review", "C", "Anh Minh: “Đây là cách một PM chịu trách nhiệm.”", "panel_approve_01 · face_approving"),
 ("L4 S16 Final Review", "Phản biện", "Chị Hà hỏi 4 câu · Dẫn truyện: Chị Hà và Anh Minh trao đổi…", "panel_listen_01 / panel_note_01 → panel_confer_01 → review_thank_01 → review_stand_01 · face_formal"),
 ("Kết thúc", "Pass xuất sắc", "Anh Minh: “Em không chỉ qua thử việc mà còn giúp team vận hành tốt hơn…”", "excellent_announce_01 → excellent_applaud_01 → pass_shake · face_proud"),
 ("Kết thúc", "Pass", "Anh Minh: “Chúc mừng em đã trở thành PM chính thức…”", "pass_announce → pass_shake → badge_give (khớp hàng đổi thẻ của PM) · face_congrats"),
 ("Kết thúc", "Gia hạn", "Anh Minh: “Em có tiềm năng, nhưng kết quả chưa đủ ổn định…”", "extend_talk → extend_encourage_01 · face_serious"),
 ("Kết thúc", "Không đạt", "Anh Minh: “Công ty chưa thể giao em vai trò PM chính thức ở thời điểm này.”", "fail_talk → fail_sigh_01 → fail_reassure_01 → fail_goodbye_01 · face_regretful"),
]
NOTE = ("Anh Minh không có mặt ở S02, S03, S04, S06, S09, S11 (kịch bản mục 2) nên không có sprite cho các cảnh đó. "
        "Vào/ra cảnh: `walk` (lật để đi sang trái), rời phòng bằng `turn_01` → `walk_back`.")

def anim_refs(text):
    refs = []
    for part in text.replace("·", "→").replace("/", "→").replace("(", " ").replace(")", " ").split("→"):
        for tok in part.split():
            if re.fullmatch(r"[a-z][a-z0-9_]+", tok): refs.append(tok)
    return refs

# ---------------------------------------------------------------- SOL one-shot (toi uu token)
SOL = """Work autonomously. Do not ask questions. Keep chat output short.

GOAL: sprite sheets A, B, C, D for the game character "Anh Minh – department head / PM lead".

ATTACHMENTS
1. The photo of the real person (who agreed to this): face source.
2. PM_A_master.png – another character's master sheet: grid, size and style reference only.
3. rolecraft_minh_sprite_prompts.zip – prompts/MINH_*.txt, minh_sprite_manifest.json, tools/.
Props, furniture and icons already exist in the PM set: never generate them.

TOKEN BUDGET RULES (follow strictly)
- Always ask the image tool for a TRANSPARENT background (PNG with alpha). If a sheet still comes back on plain white, do NOT regenerate it: remove the white with tools/make_transparent.py (step below).
- One image call per sheet, using the prompt file text EXACTLY. Do not rewrite, shorten or "improve" prompts.
- Regenerate a whole sheet ONLY for a HARD FAIL: wrong grid (not the stated columns x rows), figures overlapping or cut off, a face that does not resemble the photo, drawn objects/furniture in many cells, visible text, or a checkerboard pattern / scenery painted as the background. Maximum 1 retry per sheet; keep the better of the two.
- On a retry, append this line to the prompt and nothing else: "GRID CHECK: exactly the stated columns and rows, one figure per cell, nothing crosses a cell edge."
- Everything else is a SOFT issue (a pose slightly off, a missing or extra dot, small color drift): do not regenerate, just list it.
- Never regenerate a sheet that passed. Never regenerate A after B has started.
- Do not describe images or repeat prompts in chat. After each sheet print one line: `<sheet> | attempts | PASS / FAIL: reason`.

STEPS
1. Unzip; read the manifest (file names) and prompts.
2. Sheet A: MINH_A_master.txt with Image 1 = the photo, Image 2 = PM_A_master.png.
3. Sheets B, C, D: their prompt files with Image 1 = approved MINH_A_master.png, Image 2 = the photo.
4. Save to sheets/ with the manifest file names. Make every saved sheet transparent (no image call needed):
   python3 tools/make_transparent.py sheets/*.png
   Then run once:
   python3 tools/extract_anchors.py --manifest minh_sprite_manifest.json --sheets sheets --out build
5. Read build/report.json. Only for a ROW where 3 or more cells report "missing ... marker", make ONE edit call on that sheet with the ROW FIX prompt below (max 2 row fixes in total for the whole job), then run the script once more. Leave all other warnings as they are.
6. DELIVER: show the final sheets; one file rolecraft_minh_sprites.zip with sheets/, build/, minh_sprite_manifest.json, tools/pm_compose.js; a table: sheet, attempts, result, remaining warnings.

ROW FIX PROMPT (Image 1 = MINH_A_master.png, Image 2 = the sheet to fix):
"Edit Image 2: redraw ONLY row {N}; keep every other row pixel-identical. Same character as Image 1. Draw no objects or furniture: empty hands in the grip pose. Add the marker dots exactly as tagged: {paste the Row N line from the prompt file}. Dots are small solid flat circles: MAGENTA #FF00FF, GREEN #00FF00, CYAN #00FFFF."

If you run out of room, stop after the last finished step and write: "Resume from step X."
"""

# ---------------------------------------------------------------- README
def cell_table(s):
    L = ["| # | Tên | Mô tả |", "|---:|---|---|"]
    for c in cells(s):
        tag = "" if s.get("portrait") or c["name"] == "portrait" else marker_tag(c["name"])
        L.append(f"| {c['index']} | `minh/{c['name']}` | {c['desc']}{tag} |")
    return L

KNOWN = set()
def mapping_md():
    L = ["Tên là **nhóm animation** `minh/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `minh/<ô>_01`; `face_*` là chân dung "
         "hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng ghi "
         "“(… nói)” là phản ứng của Anh Minh khi người khác nói.", "",
         "| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anim in SCENES:
        a = re.sub(r"\b([a-z][a-z0-9_]{2,})\b", lambda m: f"`{m.group(1)}`" if m.group(1) in KNOWN else m.group(1), anim)
        L.append(f"| {sc} | {beat} | {line} | {a} |")
    L += ["", NOTE]
    return "\n".join(L)

def readme(man):
    n_cells = sum(len(s["cells"]) for s in man["sheets"])
    L = ["# RoleCraft PM60 – Bộ prompt sprite Anh Minh v4 (Trưởng phòng / PM Lead)", "",
         "Sinh bởi `rolecraft_minh_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.", "",
         f"**{len(man['sheets'])} sheet / {n_cells} ô / {len(man['animations'])} animation.** Đồ vật (P), nội thất (O), "
         "icon (F) dùng lại của bộ PM: folder, tablet, điện thoại, bút, sổ, clicker, thẻ xanh, ghế, bàn họp, bàn làm "
         "việc, màn chiếu đều đã có.", "",
         "## Thay đổi so với bản cũ", "",
         "- **Quay PHẢI** như PM, nội thất bên phải: dùng thẳng ghế, bàn, màn chiếu của bộ PM. Khi Minh đứng đối diện PM, "
         "game lật cả cụm: `pc.draw(ctx, key, x, y, s, { flip: true })`. (Bản cũ quay trái và bind `beside_left` mà "
         "`pm_compose.js` không hỗ trợ → đồ bị ghép sai phía.)",
         "- **Bám kịch bản thống nhất** `docs/KICH_BAN_ROLECRAFT_PM60.md`: mapping cũ trích thoại bản chi tiết cũ (“Chào "
         "mừng em đến với team…”, tin nhắn riêng ở S08…) nay đã đổi theo đúng từng câu của Anh Minh.",
         "- Thêm: đi quay lưng rời phòng, quay người, chỉnh blazer, ngồi vắt chân; **phòng riêng của Anh Minh** cho S12 "
         "(“Anh Minh gọi PM lên phòng”: nghe điện thoại ban giám đốc, mời ngồi, đưa ra dự án lớn, phản ứng A/B/C); ghi chú "
         "ở bàn họp. B và C tăng từ 8×6 lên 8×7.",
         "- Prompt ngắn, mỗi ý một lần; quy tắc tiết kiệm token cho agent trong `SOL_ONE_SHOT_PROMPT.txt`.", "",
         "## 1. Thứ tự sinh và ảnh đính kèm", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    att = {"photo+pm": "ảnh thật + `PM_A_master.png`", "master": "`MINH_A` đã duyệt + ảnh thật"}
    for s in SHEETS:
        L.append(f"| {s['id']} ({s['cols']}×{s['rows']}) | `prompts/MINH_{s['id']}_{s['key']}.txt` | {att[s['attach']]} | {s['title']} |")
    L += ["", "**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip "
          "thư mục `rolecraft_minh_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Prompt đã giới hạn: mỗi "
          "sheet 1 lần sinh, chỉ sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền "
          "vẽ ô caro giả; nền trắng thì chỉ chạy `tools/make_transparent.py`, không sinh lại); lỗi nhỏ ghi lại chứ không sinh lại; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.", "",
          "**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm B, C, D.", "",
          "## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)", "",
          "> ✅ Đúng lưới (A, B, C: 8×7; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, **nền trong suốt** (không trắng, không ô caro vẽ giả), cùng cỡ trong cả sheet.",
          ">",
          "> ✅ Nhận ra người thật; sơ mi trắng, blazer xám than, thẻ xanh royal; ô 1 sheet A là chân dung khung xanh nhạt.",
          ">",
          "> ✅ Không vẽ đồ vật/nội thất (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.",
          ">",
          "> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.", "",
          "## 3. Dùng tool", "",
          "```bash",
          "cd docs/MINH/rolecraft_minh_sprite_prompts",
          "python3 tools/extract_anchors.py --manifest minh_sprite_manifest.json --sheets sheets --out build",
          "```", "",
          "Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`minh/*`), "
          "rồi `PMCompose.create(anchors, manifest, base)`.", "",
          "## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)", "",
          "| Nhóm tư thế | Đồ vật | Nội thất |", "|---|---|---|",
          "| idle, walk, walk_back, turn_01 | folder_closed (cầm tay phải) | |",
          "| doc_carry / doc_give, doc_receive / doc_read, doc_flip, doc_close | folder_closed (kẹp nách) / folder_closed / folder_open | |",
          "| tab_* | tablet_back; tablet_screen_34 (tab_present, oneone_show); tablet_screen_front (tab_swipe); tablet_edge (tab_tuck) | |",
          "| phone_*, desk_phone_01 | phone_back | |",
          "| present, count, two_projects, assign, wait | clicker | presentation_screen (bên phải) |",
          "| badge_give_01 | badge_blue | |",
          "| sit_* | | meeting_chair |",
          "| meet_table_*, panel_*, review_thank | notebook_open trên bàn (listen, note), pen (note) | meeting_chair + meeting_table |",
          "| oneone_* | tablet_screen_34 (show) | meeting_chair |",
          "| desk_* | | office_chair + desk_monitor (turn/invite: chỉ ghế) |", "",
          "## 5. Mapping kịch bản → sprite", "", mapping_md(), "",
          "## 6. Chi tiết từng sheet", ""]
    for s in SHEETS:
        L += [f"### Sheet {s['id']} – {s['title']}", ""] + cell_table(s) + [""]
    return "\n".join(L)

# ---------------------------------------------------------------- main
def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    for f in os.listdir(f"{OUT}/prompts"):
        if f.startswith("MINH_") and f.endswith(".txt"): os.remove(f"{OUT}/prompts/{f}")
    man = {"version": 4, "character": {"id": "MINH", "role": "MANAGER", "name": "Anh Minh – Trưởng phòng/PM Lead"},
           "shared": {"note": "prop/*, furn/*, icon/* dùng lại sheet P, O, F của bộ PM (docs/PM)"},
           "facing": "right",
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/MINH_{s['id']}_{s['key']}.txt", "w", encoding="utf-8").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
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
            fps, loop = FPS.get(k, (6, False) if len(fr) > 1 else (1, False))
            man["animations"][f"minh/{k}"] = {"frames": [f"minh/{f}" for f in fr], "fps": fps, "loop": loop}
    KNOWN.update(k.split("/")[1] for k in man["animations"]); KNOWN.update(seen)
    for *_, anim in SCENES:                                       # moi tham chieu trong mapping phai ton tai
        for r in anim_refs(anim):
            if "_" in r or r in KNOWN:
                assert r in KNOWN, f"mapping tro toi animation khong co: {r}"
    pm = json.load(open(os.path.join(HERE, "..", "..", "PM", "rolecraft_pm_sprite_prompts", "pm_sprite_manifest.json"),
                        encoding="utf-8"))
    have = {c["key"] for s in pm["sheets"] for c in s["cells"]}
    for s in man["sheets"]:
        for c in s["cells"]:
            for b in c.get("bind", []):
                k = f"prop/{b['prop']}" if "prop" in b else f"furn/{b['furniture']}"
                assert k in have, f"{c['key']}: khong co {k} trong bo PM"
    json.dump(man, open(f"{OUT}/minh_sprite_manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(f"{OUT}/SOL_ONE_SHOT_PROMPT.txt", "w", encoding="utf-8").write(SOL)
    open(f"{OUT}/mapping_section.md", "w", encoding="utf-8").write(mapping_md() + "\n")
    md = readme(man)
    for p in (f"{OUT}/README_MINH_SPRITE_PROMPTS.md", os.path.join(OUT, "..", "README_MINH_SPRITE_PROMPTS.md")):
        open(p, "w", encoding="utf-8").write(md + "\n")
    n = sum(len(s["cells"]) for s in man["sheets"])
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} dong mapping")

if __name__ == "__main__":
    main()
