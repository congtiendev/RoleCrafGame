# -*- coding: utf-8 -*-
# Bo prompt sprite CHI HA (HR – dai dien nhan su trong hoi dong Final Review), cung co che v3 voi bo PM (docs/PM),
# MINH (docs/MINH), LAN (docs/LAN): nhan vat ve tay khong + cham neo, do vat / noi that / icon DUNG LAI sheet P, O, F
# cua PM. Chi Ha khong co trong docs goc: THOAI_MAU.json them vao thay "Hoi dong danh gia" (REVIEW_PANEL, docs/KICH_BAN_ROLECRAFT_PM60.md – L4 S16
# muc 9) o S16 Final Review, phan phan bien va 4 man ket thuc -> noi dung o bam theo cac thoai do (xem SCENES).
#     python3 build.py        # sinh prompts/HA_*.txt + ha_sprite_manifest.json + README_HA_SPRITE_PROMPTS.md
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
"HR business partner in their early-to-mid thirties, older than the PM, professional, warm but neutral. Cream "
"collared blouse; dusty-rose tailored blazer, buttoned with one button; navy tailored trousers; dark-brown low block-heel "
"shoes; small pearl stud earrings; a slim gold wristwatch on the left wrist. A royal-blue lanyard around the neck with a "
"plain royal-blue ID badge card at the chest (blank, no text) — the official staff badge. Signature prop: a closed navy "
"folder holding the evaluation forms. It is added later by code, so do NOT draw it (except in the framed portrait cell).")

STYLE = ("ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style, exactly matching the reference "
"sheet. Big head, about 2.4 to 2.5 heads tall in total (a little taller than the young PM, shorter than the department "
"head); expressive eyes with highlights, calm and observant, a composed professional look; small nose and mouth; clean "
"dark-brown pixel outline (not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; "
"consistent top-left light. Every full-body figure stands on a small soft grey oval shadow. Small effect icons "
"(sparkles, sweat drop, small grey puff, exclamation mark, question mark) are drawn next to a figure only where a cell "
"asks for them.")

def LAYOUT(cols, rows, portrait_first):
    s = (f"LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly {cols} columns x {rows} rows "
         f"= {cols*rows} cells, packed like a professional game asset sheet: each figure fills most of its cell but never "
         "touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared "
         "baseline. Figures face LEFT in a 3/4 view (the character sits or stands opposite the PM, who faces right) unless "
         "a cell says otherwise. Reading order: left to right, top to bottom. ")
    if portrait_first:
        s += ("Cell 1 (top-left) is special: a head-and-shoulders portrait inside a rounded-square frame with a thin dark "
              "outline and a soft pastel-blue background with a few sparkles, the character with a calm professional "
              "smile, holding the closed navy folder against the chest. Cell 1 is the ONLY cell with a background; every "
              "other cell is a full-body figure on pure white.")
    return s

OBJECT_RULE = ("OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites "
"that will be placed by code. Wherever a cell mentions a folder, form, page, contract, tablet, phone, notebook, pen, mug, "
"badge held in the hand, chair, desk or table, do NOT draw that object. Instead draw the empty hand(s) in the exact grip "
"pose as if holding it, and the body sitting at the correct height as if on the invisible furniture. Keep the worn "
"lanyard badge, the earrings and the wristwatch as part of the character. MARKER DOTS: small solid round dots about 1.5% "
"of the cell width, flat color, no outline, no shading, drawn on top of the character. MAGENTA #FF00FF = grip point of "
"the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = grip point of a second object "
"held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they touch the seat) for sitting "
"poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no dots. Never use these three "
"colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw "
"grid lines or cell borders (except the frame of the portrait cells); add scenery, floor or walls; add extra characters "
"(the department head beside the character, the PM and the other person in a handshake are offscreen); crop limbs; "
"repeat an identical pose; change the face, hair, outfit colors or proportions between cells; use pure white for "
"clothing edges that touch the background.")

# ---------------------------------------------------------------- sheet A – master
A = [
 ("Row 1 - Portrait + idle", [
  ("portrait","[portrait cell, see LAYOUT] calm professional smile, navy folder against the chest, a few sparkles"),
  ("idle_01","idle loop 1/4: upright poised stance, folder held against the chest with the left arm"),
  ("idle_02","idle loop 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03","idle loop 3/4: glancing at the wristwatch on the left wrist for a moment"),
  ("idle_back_01","standing seen from behind (back view), folder in the left hand"),
  ("idle_04","idle loop 4/4: slight exhale, calm observant face"),
  ("greet_01","polite nod with a warm professional smile, free hand at the waist"),
  ("greet_02","hand lightly on the chest, introducing oneself: 'I'm from HR'")]),
 ("Row 2 - Walk cycle 8 frames, calm measured pace, folder held against the chest with the left arm, right arm swings", [
  ("walk_01","walk contact: left foot forward heel touching"),("walk_02","walk down: weight on left leg, knee bent"),
  ("walk_03","walk passing: right leg passing the left"),("walk_04","walk up: rising on left toes"),
  ("walk_05","walk contact: right foot forward heel touching"),("walk_06","walk down: weight on right leg, knee bent"),
  ("walk_07","walk passing: left leg passing the right"),("walk_08","walk up: rising on right toes")]),
 ("Row 3 - Talking + listening (dialogue loops, hands free)", [
  ("talk_01","talking, right hand open at chest height, measured"),
  ("talk_02","talking, both hands slightly open, explaining a procedure"),
  ("talk_03","talking, index finger lightly raised, asking a pointed question"),
  ("talk_04","talking, hand returning down, small polite smile"),
  ("listen_01","listening, hands loosely clasped in front, neutral and attentive"),
  ("listen_02","listening, head tilted, one hand at the chin, evaluating"),
  ("nod_01","nodding, eyes half closed, noting it"),("nod_02","nodding, chin lifted back up")]),
 ("Row 4 - Sit on an invisible office chair (same seat height in every sit cell)", [
  ("sit_01","standing next to the chair, about to sit, smoothing the blazer"),
  ("sit_02","lowering onto the chair"),("sit_03","seated upright, hands resting on the lap"),
  ("sit_04","seated, legs crossed, hands folded on the knee, evaluating"),
  ("sit_05","seated, leaning slightly forward, listening closely"),
  ("sit_06","seated, writing in a notebook on the lap with a pen"),("sit_07","seated, reading a phone held in the right hand"),
  ("sit_08","standing up from the chair, buttoning the blazer")]),
 ("Row 5 - Positive reactions with small effect icons", [
  ("good_01","approving small smile, soft nod, two golden sparkles"),
  ("good_02","impressed, eyebrows raised, small 'oh' mouth, exclamation mark"),
  ("good_03","warm smile, hands clasped in front"),("good_04","soft laugh, hand near the mouth"),
  ("applaud_01","applauding politely, hands apart"),("applaud_02","applauding politely, hands together"),
  ("pleased_01","pleased, chin slightly up, satisfied look"),
  ("relieved_01","relieved exhale, hand on the chest, small smile")]),
 ("Row 6 - Neutral, serious and critical reactions (professional, never angry)", [
  ("neutral_01","neutral poker face, hands clasped in front"),
  ("serious_01","serious, lips pressed, direct gaze"),
  ("doubt_01","skeptical raised eyebrow, small question mark"),
  ("frown_01","slight frown, 'the report left something out'"),
  ("concern_01","concerned, eyebrows tilted, hand at the collar"),
  ("sigh_01","quiet sigh, eyes closed, small grey puff"),
  ("regret_01","regretful, eyes lowered, hand on the chest"),
  ("headshake_01","slow small head shake, calm")]),
 ("Row 7 - Thinking + HR stances", [
  ("think_01","thinking, hand at the chin, looking up"),("think_02","thinking, eyes closed, finger tapping the chin"),
  ("watch_01","raising the left wrist and checking the watch, 'you have ten minutes'"),
  ("crossarms_01","arms loosely crossed, neutral, waiting for an answer"),
  ("front_hands_01","hands folded in front, standing straight, formal"),
  ("behind_01","hands clasped behind the back, calm observing look"),
  ("invite_01","open palm toward the viewer, 'please begin'"),
  ("point_01","open hand gesturing forward, 'the floor is yours'")]),
]

# ---------------------------------------------------------------- sheet B – cam nam, Final Review, ket thuc
B = [
 ("Row 1 - Folder, evaluation form and pen (standing)", [
  ("doc_hold_01","folder held in both hands at chest height"),
  ("doc_read_01","reading the open folder held in both hands"),
  ("doc_read_02","reading the open folder, flipping a page"),
  ("form_note_01","writing on an evaluation form with a pen"),
  ("form_note_02","underlining something on the form, thoughtful"),
  ("doc_raise_01","raising a single page to show it"),
  ("doc_give_01","extending a closed folder forward with both hands"),
  ("doc_give_02","folder handed over, hands returning, polite smile")]),
 ("Row 2 - Tablet and phone (standing)", [
  ("tab_hold_01","holding the tablet at chest height with both hands"),
  ("tab_read_01","reading the tablet, calm"),
  ("tab_present_01","turning the tablet screen toward the viewer"),
  ("tab_present_02","tablet turned, pointing at the screen with the free hand"),
  ("phone_read_01","reading a message on the phone, neutral"),
  ("phone_type_01","typing a message with the thumb"),
  ("phone_call_01","phone at the ear, listening"),
  ("phone_pocket_01","putting the phone back into the blazer pocket")]),
 ("Row 3 - Final Review panel, seated at an invisible long table on the LEFT (same seat height in every seat cell of rows 3-4)", [
  ("panel_intro_01","seated, hand on the chest, introducing oneself to the PM"),
  ("panel_intro_02","seated, open palm forward, 'please begin'"),
  ("panel_listen_01","seated, listening, hands folded on the table"),
  ("panel_listen_02","seated, listening, slight head tilt"),
  ("panel_note_01","seated, writing notes on the evaluation form with a pen"),
  ("panel_note_02","seated, pausing the pen, looking up at the speaker"),
  ("panel_frown_01","seated, pen stopped, slight frown, 'something is missing'"),
  ("panel_nod_01","seated, approving nod, small smile")]),
 ("Row 4 - Final Review panel: probing questions (seated at the same invisible table)", [
  ("panel_ask_01","seated, asking a question with an open palm"),
  ("panel_ask_02","seated, asking a follow-up, index finger raised"),
  ("panel_ask_03","seated, leaning forward, probing 'what would you change?'"),
  ("panel_ask_04","seated, three fingers raised, 'your three priorities?'"),
  ("panel_confer_01","seated, turning to the right side to confer quietly with a colleague offscreen"),
  ("panel_confer_02","seated, hand beside the mouth, whispering to the side"),
  ("panel_score_01","seated, ticking a box on the evaluation form"),
  ("panel_close_01","seated, closing the folder on the table, decision made")]),
 ("Row 5 - Endings: pass (standing)", [
  ("pass_smile_01","standing, warm smile, 'congratulations'"),
  ("pass_contract_01","holding out the official contract folder with both hands"),
  ("pass_contract_02","contract handed over, proud nod"),
  ("pass_shake_01","reaching out the right hand for a congratulating handshake"),
  ("pass_shake_02","firm handshake, big smile"),
  ("pass_roadmap_01","presenting the management development roadmap on a tablet"),
  ("pass_applaud_01","applauding warmly, sparkles"),
  ("pass_applaud_02","applauding, small thumbs up, sparkles")]),
 ("Row 6 - Endings: extension and fail (standing)", [
  ("extend_talk_01","standing, calm serious explanation"),
  ("extend_goals_01","handing over a sheet of goals and criteria"),
  ("extend_count_01","counting the evaluation criteria on the fingers"),
  ("extend_encourage_01","small encouraging fist, kind smile, 'you can do it'"),
  ("fail_talk_01","standing, regretful, hand on the chest, soft voice"),
  ("fail_doc_01","handing over the closing paperwork folder, sympathetic"),
  ("fail_pat_01","sympathetic gesture toward an offscreen shoulder"),
  ("fail_bow_01","formal slight bow, respectful goodbye")]),
 ("Row 7 - Hosting and small moments (standing)", [
  ("invite_sit_01","gesturing to an offscreen chair, 'please take a seat'"),
  ("door_01","gently gesturing toward a door on the LEFT, showing the way"),
  ("reassure_01","palms down, calm reassuring smile"),
  ("wave_01","small goodbye wave"),
  ("coffee_01","holding a coffee mug, relaxed"),("coffee_02","sipping the coffee, eyes closed"),
  ("badge_give_01","holding out a royal-blue official staff badge on a lanyard"),
  ("badge_give_02","badge handed over, proud smile")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral","neutral, composed poker face"),("face_polite_smile","polite professional smile"),("face_warm","warm friendly smile"),("face_pleased","pleased, satisfied smile")]),
 ("Row 2", [("face_laugh","soft laugh, eyes closed"),("face_serious","serious, straight mouth"),("face_probing","probing, eyes slightly narrowed, leaning in"),("face_questioning","questioning, index finger raised into the frame")]),
 ("Row 3", [("face_skeptical","one eyebrow raised, skeptical"),("face_thinking","thinking, eyes looking up"),("face_impressed","impressed, eyebrows up, small 'oh'"),("face_concerned","concerned, eyebrows tilted")]),
 ("Row 4", [("face_frown","slight frown, displeased"),("face_sigh","quiet sigh, eyes closed, small grey puff"),("face_regretful","regretful, eyes lowered"),("face_sympathetic","sympathetic, soft sad smile")]),
 ("Row 5", [("face_encouraging","encouraging, bright eyes, slight smile"),("face_congrats","congratulating, big smile, sparkles"),("face_formal","formal, blazer buttoned, neutral"),("face_tired","tired, faint dark circles")]),
]

SHEETS = [
 {"id":"A","key":"master","cols":8,"rows":7,"attach":"photo+pm","grid":A,"portrait_first":True,
  "task":"framed portrait, idle, back view, walk cycle, talking and listening, sitting on a chair, and reactions",
  "title":"Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc"},
 {"id":"B","key":"review_endings","cols":8,"rows":7,"attach":"master","grid":B,
  "task":"folder and evaluation form, tablet and phone, sitting on the final probation review panel and asking questions, and announcing the pass, extension and fail endings",
  "title":"Cầm nắm, Final Review (hội đồng + phản biện), 4 kết thúc"},
 {"id":"D","key":"portraits","cols":4,"rows":5,"attach":"master","grid":D,"portrait":True,
  "task":"20 framed facial-expression portraits for a dialogue box","title":"20 chân dung cảm xúc cho hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua sheet P, O cua PM)
def P(id, at="grip", z="front", rot=0): return {"prop": id, "at": at, "z": z, "rot": rot}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
CHAIR, MCHAIR, MTABLE = F("office_chair"), F("meeting_chair"), F("meeting_table", z="front")
FOLDER, PEN2 = P("folder_closed"), P("pen", "grip2")
RULES = [  # (regex, bindings) – khop dau tien
 (r"portrait$|^face_", []),
 (r"^idle_0|idle_back|^walk_", [FOLDER]),
 (r"sit_06", [CHAIR, P("notebook_open"), PEN2]),
 (r"sit_07", [CHAIR, P("phone_back")]),
 (r"sit_01", [F("office_chair", "beside_left")]),
 (r"^sit_", [CHAIR]),
 (r"doc_hold|doc_give|pass_contract|fail_doc", [FOLDER]),
 (r"doc_read", [P("folder_open")]),
 (r"form_note", [P("checklist_sheet"), PEN2]),
 (r"doc_raise", [P("contract_sheet")]),
 (r"extend_goals", [P("checklist_sheet")]),
 (r"tab_present|pass_roadmap", [P("tablet_screen_34")]),
 (r"tab_", [P("tablet_back")]),
 (r"^phone_", [P("phone_back")]),
 (r"badge_give", [P("badge_blue")]),
 (r"coffee_", [P("mug_steam")]),
 (r"panel_note|panel_frown|panel_score", [MCHAIR, MTABLE, P("pen"), P("checklist_sheet", "surface:meeting_table")]),
 (r"panel_close", [MCHAIR, MTABLE, P("folder_closed", "surface:meeting_table")]),
 (r"^panel_", [MCHAIR, MTABLE, P("folder_closed", "surface:meeting_table")]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green", "seat": "cyan"}
WORD = {"folder": "folder", "checklist": "form", "contract": "page", "tablet": "tablet", "phone": "phone",
        "notebook": "notebook", "pen": "pen", "badge": "badge", "mug": "mug"}
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
             f"Chi Ha, the HR representative who sits on the final probation review panel next to the department head, "
             f"asks the PM probing questions and delivers the HR side of the result (contract, extension goals or "
             f"closing paperwork). Sheet content: {s['task']}.",
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
       "applaud": (8, True), "doc_read": (4, True), "doc_give": (8, False), "form_note": (6, True),
       "tab_present": (6, False), "panel_intro": (6, False), "panel_listen": (4, True), "panel_note": (6, True),
       "panel_ask": (6, False), "panel_confer": (4, True), "pass_contract": (6, False), "pass_shake": (6, False),
       "pass_applaud": (8, True), "badge_give": (6, False), "coffee": (4, False)}

# ---------------------------------------------------------------- bam kich ban (THOAI_MAU.json): canh -> animation goi y
SCRIPT_ANIM = {}  # docs khong dat ten animation nao cho REVIEW_PANEL / HR
SCENES = [  # (khoa THOAI_MAU, nhip, cau thoai tom tat, animation / chan dung)
 ("L4 | S16 Final Review | Mở cảnh", "Dẫn truyện", "Anh Minh và Chị Hà ngồi ở bàn đánh giá.", ["ha/panel_listen", "ha/face_neutral"]),
 ("L4 | S16 Final Review | Mở cảnh", "Chị Hà", "Chị bên nhân sự, sẽ cùng anh Minh đánh giá kết quả thử việc của em.", ["ha/panel_intro", "ha/face_polite_smile"]),
 ("L4 | S16 Final Review | Mở cảnh", "PM trình bày", "(Hội đồng chờ PM trình bày.)", ["ha/panel_note", "ha/face_neutral"]),
 ("L4 | S16 Final Review | Nhánh A", "Chị Hà", "Báo cáo chưa nói gì về sự cố production và tải của team.", ["ha/panel_frown_01", "ha/face_skeptical"]),
 ("L4 | S16 Final Review | Nhánh B", "(nghe)", "Minh bạch là tốt, nhưng cần kế hoạch hành động (Anh Minh).", ["ha/panel_listen", "ha/face_concerned"]),
 ("L4 | S16 Final Review | Nhánh C", "(nghe)", "Đây là cách một PM chịu trách nhiệm (Anh Minh).", ["ha/panel_nod_01", "ha/face_pleased"]),
 ("L4 | S16 phản biện | Mở cảnh", "Câu hỏi 1", "Quyết định nào trong 60 ngày tạo ra ảnh hưởng lớn nhất, và vì sao?", ["ha/panel_ask", "ha/face_questioning"]),
 ("L4 | S16 phản biện | Mở cảnh", "Câu hỏi 2", "Nếu được làm lại một quyết định, em sẽ thay đổi điều gì?", ["ha/panel_ask_03", "ha/face_probing"]),
 ("L4 | S16 phản biện | Mở cảnh", "Câu hỏi 3", "Team hiện tại có vận hành được mà không cần em không?", ["ha/panel_ask_02", "ha/face_skeptical"]),
 ("L4 | S16 phản biện | Mở cảnh", "Câu hỏi 4", "Ba ưu tiên của em trong 90 ngày tới là gì?", ["ha/panel_ask_04", "ha/face_questioning"]),
 ("L4 | S16 phản biện | Mở cảnh", "Dẫn truyện", "Chị Hà và Anh Minh trao đổi với nhau...", ["ha/panel_confer", "ha/panel_score_01", "ha/panel_close_01"]),
 ("END | Pass xuất sắc | Trình tự dùng sheet", "Chị Hà", "Gửi hợp đồng chính thức và lộ trình phát triển quản lý.", ["ha/pass_contract", "ha/pass_roadmap_01", "ha/pass_applaud", "ha/face_congrats"]),
 ("END | Pass | Trình tự dùng sheet", "Chị Hà", "Phòng nhân sự sẽ gửi em hợp đồng chính thức trong tuần này.", ["ha/pass_smile_01", "ha/pass_contract", "ha/pass_shake", "ha/face_warm"]),
 ("END | Gia hạn thử việc | Trình tự dùng sheet", "Chị Hà", "Chị sẽ gửi em mục tiêu và tiêu chí đánh giá cho giai đoạn gia hạn.", ["ha/extend_talk_01", "ha/extend_goals_01", "ha/extend_count_01", "ha/extend_encourage_01", "ha/face_encouraging"]),
 ("END | Không đạt | Trình tự dùng sheet", "Chị Hà", "Chị sẽ hỗ trợ em các thủ tục kết thúc thử việc.", ["ha/fail_talk_01", "ha/fail_doc_01", "ha/fail_pat_01", "ha/fail_bow_01", "ha/face_sympathetic"]),
 ("END | Không đạt | Trình tự dùng sheet", "Dẫn truyện", "Ôm thùng đồ ra cửa...", ["ha/door_01", "ha/wave_01", "ha/face_regretful"]),
]

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

def readme(man):
    L = ["# Bộ prompt sprite CHỊ HÀ (HR – đại diện nhân sự trong hội đồng Final Review)", "",
         "Sinh bởi `build.py` – sửa ở `build.py` rồi chạy lại, không sửa tay file này.", "",
         "Cùng cơ chế v3 với bộ PM (`docs/PM`), MINH (`docs/MINH`), LAN (`docs/LAN`): nhân vật vẽ tay không + chấm neo "
         "(magenta = cầm chính, green = tay kia, cyan = điểm ngồi); đồ vật, nội thất, icon **dùng lại sheet P, O, F của PM**.", "",
         "## Thứ tự tạo ảnh", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    for s in SHEETS:
        att = "ảnh thật + `PM_A_master.png` (chỉ lấy style)" if s["attach"] == "photo+pm" else "ảnh thật + `HA_A_master.png`"
        L.append(f"| {s['id']} ({s['cols']}x{s['rows']}) | `prompts/HA_{s['id']}_{s['key']}.txt` | {att} | {s['title']} |")
    L += ["", "Tạo sheet A trước và duyệt, sau đó B, D đính kèm A làm chuẩn. Không có sheet C: chị Hà chỉ xuất hiện "
          "ở S16 và màn kết, nên cảnh bàn hội đồng và 4 kết thúc gộp vào sheet B.", "",
          "## Tạo hình nhân vật", "",
          "- Không có trong docs gốc: `THOAI_MAU.json` thêm chị Hà thay cho “Hội đồng đánh giá” (`REVIEW_PANEL`, "
          "docs/KICH_BAN_ROLECRAFT_PM60.md – L4 S16 và mục 9) – lời “Đại diện hội đồng” trong docs do chị Hà nói.",
          "- Xưng “chị” với PM → lớn tuổi hơn PM; chuyên nghiệp, trung lập, hỏi thẳng nhưng không gay gắt.",
          "- Đạo cụ đặc trưng: folder navy đựng phiếu đánh giá (`prop/folder_closed`); phiếu đánh giá dùng `prop/checklist_sheet`.",
          "- Ngồi cạnh anh Minh ở bàn hội đồng (anh Minh ở bên phải chị trong khung hình, ngoài ô).", "",
          "## Cảnh → animation gợi ý (bám thoại chị Hà trong THOAI_MAU.json)", "",
          "| Khoá thoại | Nhịp | Thoại (tóm tắt) | Animation / chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anims in SCENES:
        L.append(f"| `{sc}` | {beat} | {line} | {', '.join(f'`{a}`' for a in anims)} |")
    L += ["", f"Tổng: {sum(len(s['cells']) for s in man['sheets'])} ô, {len(man['animations'])} animation.", ""]
    return "\n".join(L)

def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    man = {"version": 3, "character": {"id": "HR", "role": "REVIEW_PANEL", "name": "Chị Hà – HR (Hội đồng đánh giá)"},
           "shared": {"note": "Đồ vật, nội thất, icon dùng lại sheet P, O, F của bộ PM (docs/PM): prop/*, furn/*, icon/*"},
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}, "script_animations": SCRIPT_ANIM,
           "scenes": [{"scenario": sc, "beat": b, "line": l, "use": a} for sc, b, l, a in SCENES]}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/HA_{s['id']}_{s['key']}.txt", "w").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"ha/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        man["sheets"].append({"id": s["id"], "key": s["key"], "kind": "ha", "file": f"HA_{s['id']}_{s['key']}.png",
                              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl})
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (8, False) if len(fr) > 1 else (1, False))
            man["animations"][f"ha/{k}"] = {"frames": [f"ha/{f}" for f in fr], "fps": fps, "loop": loop}
    # moi tham chieu trong SCENES phai ton tai (animation, o don hoac chan dung)
    known = set(man["animations"]) | {f"ha/{n}" for n in seen}
    for ref in [x for *_, a in SCENES for x in a]:
        assert ref in known, f"tham chieu khong ton tai: {ref}"
    json.dump(man, open(f"{OUT}/ha_sprite_manifest.json", "w"), ensure_ascii=False, indent=1)
    open(f"{OUT}/README_HA_SPRITE_PROMPTS.md", "w").write(readme(man))
    n = sum(len(cells(s)) for s in SHEETS)
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} canh -> prompts/ + ha_sprite_manifest.json + README")

if __name__ == "__main__":
    main()
