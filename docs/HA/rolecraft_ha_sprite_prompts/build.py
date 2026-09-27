# -*- coding: utf-8 -*-
# Bo prompt sprite CHI HA v4 (HR – phong nhan su, danh gia thu viec cung Anh Minh), cung khuon voi bo NAM / LINH v4.
# MOI O bam mot cau thoai hoac mot dien bien cua Chi Ha trong docs/KICH_BAN_ROLECRAFT_PM60.md (xem SCENES):
# L4 S16 Final Review (ngoi ban danh gia, phan bien 4 cau hoi) va 4 man ket thuc (hop dong / gia han / thu tuc).
# Ve tay khong + cham neo; do vat / noi that / icon DUNG LAI sheet P, O, F cua PM. Chi Ha quay PHAI nhu PM; game lat
# ca cum (flip) khi ngoi doi dien PM. Nhan dien tu ANH THAT. Nen trong suot.
#     python build.py   -> prompts/HA_*.txt, ha_sprite_manifest.json, SOL_ONE_SHOT_PROMPT.txt,
#                          mapping_section.md, README_HA_SPRITE_PROMPTS.md (ca ban o docs/HA/)
import copy, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT", HERE)

# ---------------------------------------------------------------- van ban chung (ngan, khong lap y)
WHO = ("Chi Ha, the HR business partner who evaluates the PM's probation together with the manager: professional, "
       "warm but neutral, asks probing questions")

ATTACH_A = ("ATTACHED IMAGES: Image 1 is a photo of a real person who agreed to become this character: the ONLY source "
"for the face. Image 2 is the master sheet of ANOTHER character (the young PM): use it ONLY for the grid layout, sprite "
"size, outline and shading; never copy the PM's face or clothes.")
ATTACH_MASTER = ("ATTACHED IMAGES: Image 1 is the approved master sheet of this character (Chi Ha, Sheet A): match it "
"exactly (face, hair, outfit, colors, proportions, outline, shading, sprite size). Image 2 is the photo of the real "
"person: use it only to keep the face recognizable.")

IDENTITY = ("IDENTITY: keep the person in the photo clearly recognizable: face shape, eyes and eyebrows, nose and mouth, "
"hairstyle, hair length, color and parting, skin tone, and features such as glasses, moles or earrings (glasses, if any, "
"in every cell). Stylize into the art style; do not trace the photo. Ignore the photo's background, pose, expression "
"and clothing.")

CHARACTER = ("CHARACTER (identical in every cell unless a row says otherwise): Chi Ha, early-to-mid thirties, older than "
"the PM, professional and composed. Cream collared blouse; dusty-rose tailored blazer buttoned with one button; navy "
"tailored trousers; dark-brown low block-heel shoes; small pearl stud earrings; slim gold wristwatch on the left wrist; "
"royal-blue lanyard with a plain royal-blue ID badge card at the chest (blank, no text). About 2.4 heads tall, the same "
"height as the PM, calm attentive eyes.")

STYLE = ("ART STYLE: cute chibi game sprite, soft high-resolution pixel art: big head, expressive glossy eyes, small nose "
"and mouth, short limbs, clean dark-brown outline (not pure black), soft cel shading, warm natural colors, top-left light. "
"Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, grey puff, "
"exclamation or question mark) only where a cell asks for them, kept inside the cell.")

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
              "outline and a soft pastel-blue background with a few sparkles; Chi Ha with a calm professional smile "
              "holding a closed navy folder against the chest. No other cell has a background or a drawn object.")
    return t

OBJECT_RULE = ("OBJECTS AND FURNITURE ARE ADDED BY CODE, SO NEVER DRAW THEM: no folder, page, papers, pen, notebook, chair "
"or table (the worn lanyard badge, earrings and watch stay). Draw the empty hand(s) in the exact grip pose, and seated "
"bodies at the right height on an invisible chair. MARKER DOTS, only where a cell has a [markers] tag: small solid flat "
"dots about 1.5% of the cell width drawn on top of the figure. MAGENTA #FF00FF = grip point of the main held object (two "
"hands: midway between them); GREEN #00FF00 = grip point of a second object in the other hand; CYAN #00FFFF = middle of "
"the hips where they touch the seat. Never use these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; add text, letters, numbers or watermark; draw grid lines or "
"cell borders; add scenery, floor or walls; add other characters (the PM and Anh Minh are offscreen); crop limbs; repeat "
"an identical pose; change face, hair, outfit colors or proportions between cells.")

# ---------------------------------------------------------------- sheet A – master (co the, man ket thuc dung)
A = [
 ("Row 1 - Portrait + idle (closed navy folder held against the chest)", [
  ("portrait", "[portrait cell, see LAYOUT]"),
  ("idle_01", "idle 1/4: upright, composed"),
  ("idle_02", "idle 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03", "idle 3/4: glancing down at the folder"),
  ("idle_04", "idle 4/4: slight exhale, calm face"),
  ("idle_back_01", "seen from BEHIND (back view), standing"),
  ("greet_01", "polite nod with a professional smile"),
  ("greet_02", "small respectful bow of the head")]),
 ("Row 2 - Walk cycle 8 frames, calm measured pace, folder held against the chest", [
  ("walk_01", "contact: right foot forward, heel touching"), ("walk_02", "down: weight on right leg, knee bent"),
  ("walk_03", "passing: left leg passing the right"), ("walk_04", "up: rising on right toes"),
  ("walk_05", "contact: left foot forward, heel touching"), ("walk_06", "down: weight on left leg, knee bent"),
  ("walk_07", "passing: right leg passing the left"), ("walk_08", "up: rising on left toes")]),
 ("Row 3 - Leaving, and the chair at the invisible long review table on the RIGHT (same seat height in the seated "
  "cells)", [
  ("walk_back_01", "walking away seen from BEHIND, step 1, folder in the arm"),
  ("walk_back_02", "walking away from behind, step 2"),
  ("walk_back_03", "walking away from behind, step 3"),
  ("walk_back_04", "walking away from behind, step 4"),
  ("turn_01", "turning away to leave, kind nod over the shoulder"),
  ("sit_01", "standing in front of the chair, about to sit"),
  ("sit_02", "lowering onto the chair, smoothing the blazer"),
  ("sit_03", "standing up from the chair")]),
 ("Row 4 - Endings: pass with excellence and pass (standing)", [
  ("congrats_01", "applauding warmly, sparkles"),
  ("congrats_02", "hands clasped in front, big congratulating smile"),
  ("contract_give_01", "holding out a closed folder with the official contract with both hands"),
  ("contract_give_02", "folder handed over, hands returning, warm nod"),
  ("roadmap_show_01", "holding an open folder toward the right, showing the management development path"),
  ("shake_01", "reaching out the right hand for a handshake"),
  ("shake_02", "handshake, warm smile"),
  ("pleased_01", "pleased smile, small nod, sparkles")]),
 ("Row 5 - Endings: extended probation and not passing (standing)", [
  ("goals_give_01", "holding out a single page of goals and criteria with both hands"),
  ("goals_explain_01", "pointing at one line on the page, explaining calmly"),
  ("encourage_01", "encouraging nod, one hand forward, 'focus on what is missing'"),
  ("sympathetic_01", "hand on the chest, sympathetic soft sad smile"),
  ("procedure_give_01", "holding out a small stack of papers for the procedures, gentle"),
  ("comfort_01", "gentle hand reaching toward an offscreen shoulder on the right"),
  ("sigh_01", "quiet sigh, eyes closed, small grey puff"),
  ("bow_01", "respectful slight bow, goodbye")]),
 ("Row 6 - Standing talk and listening (dialogue loops, hands free)", [
  ("talk_01", "talking, right hand open at chest height"),
  ("talk_02", "talking, both hands slightly open"),
  ("talk_03", "talking, index finger lightly raised"),
  ("talk_04", "talking, hand returning down, small smile"),
  ("listen_01", "listening, hands folded in front"),
  ("listen_02", "listening, head tilted"),
  ("nod_01", "nodding"), ("nod_02", "chin back up after the nod")]),
]

# ---------------------------------------------------------------- sheet C – ban danh gia S16 (8x3, anh ngang)
T = "seated at the invisible long review table on the RIGHT, same seat height"
C = [
 (f"Row 1 - Opening the review and listening to the report ({T})", [
  ("panel_intro_01", "hand on the chest, introducing herself, 'I'm from HR'"),
  ("panel_intro_02", "open palm toward the other side, 'we'll evaluate your probation together'"),
  ("panel_listen_01", "listening attentively, hands folded on the table"),
  ("panel_listen_02", "listening, slight nod"),
  ("panel_note_01", "writing notes with a pen"),
  ("panel_note_02", "writing, looking up to listen"),
  ("panel_read_01", "reading the report in an open folder held in both hands"),
  ("panel_flip_01", "flipping a page of the report")]),
 (f"Row 2 - Reacting to the report ({T})", [
  ("panel_frown_01", "slight frown, lips pressed, the report hides the incident"),
  ("panel_point_01", "tapping a page in the open folder on the table, 'nothing about the incident or the team's load'"),
  ("panel_consider_01", "neutral, considering, hand at the chin"),
  ("panel_impressed_01", "eyebrows up, pleasantly impressed"),
  ("panel_pleased_01", "pleased smile, small nod"),
  ("panel_warn_01", "tapping a line in the open folder with a concerned look, burnout warning"),
  ("panel_probe_01", "leaning in, probing, 'please explain this gap'"),
  ("panel_evidence_01", "satisfied nod, ticking a box on the form with a pen")]),
 (f"Row 3 - Four questions, then conferring with Anh Minh ({T})", [
  ("panel_ask_01", "index finger raised, asking, 'which decision had the biggest impact?'"),
  ("panel_ask_02", "open palm up, asking, 'what would you change?'"),
  ("panel_ask_03", "fingers laced on the table, probing, 'can the team run without you?'"),
  ("panel_ask_04", "three fingers up, 'your three priorities for the next 90 days?'"),
  ("panel_think_01", "weighing the answer, eyes narrowed slightly"),
  ("panel_tick_01", "ticking the evaluation form with a pen"),
  ("panel_confer_01", "turning toward the viewer to confer with the manager beside her"),
  ("panel_confer_02", "hand beside the mouth, speaking quietly to the manager")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral", "neutral, composed poker face"), ("face_polite_smile", "polite professional smile"),
            ("face_warm", "warm friendly smile"), ("face_pleased", "pleased, satisfied smile")]),
 ("Row 2", [("face_laugh", "soft laugh, eyes closed"), ("face_serious", "serious, straight mouth"),
            ("face_probing", "probing, eyes slightly narrowed, leaning in"), ("face_questioning", "questioning, index finger raised into the frame")]),
 ("Row 3", [("face_skeptical", "one eyebrow raised, skeptical"), ("face_thinking", "thinking, eyes looking up"),
            ("face_impressed", "impressed, eyebrows up, small 'oh'"), ("face_concerned", "concerned, eyebrows tilted")]),
 ("Row 4", [("face_frown", "slight frown, displeased"), ("face_sigh", "quiet sigh, eyes closed, small grey puff"),
            ("face_regretful", "regretful, eyes lowered"), ("face_sympathetic", "sympathetic, soft sad smile")]),
 ("Row 5", [("face_encouraging", "encouraging, bright eyes, slight smile"), ("face_congrats", "congratulating, big smile, sparkles"),
            ("face_formal", "formal, blazer buttoned, neutral"), ("face_listening", "attentive, listening, slight nod")]),
]

SHEETS = [
 {"id": "A", "key": "master", "cols": 8, "rows": 6, "attach": "photo+pm", "grid": A, "portrait_first": True,
  "task": "framed portrait, idle, walk cycle, walking away, sitting at a review table, the four probation endings "
          "(standing), talking and listening",
  "title": "Master: chân dung, đứng, đi, rời đi, ngồi bàn đánh giá, 4 màn kết thúc (đứng), nói/nghe"},
 {"id": "C", "key": "review", "cols": 8, "rows": 3, "aspect": "3:2", "attach": "master", "grid": C,
  "task": "seated at the final review table: opening, reacting to the report, asking four questions, conferring",
  "title": "Ngồi bàn Final Review S16: mở đầu, phản ứng báo cáo, 4 câu hỏi phản biện, trao đổi với Anh Minh"},
 {"id": "D", "key": "portraits", "cols": 4, "rows": 5, "attach": "master", "grid": D, "portrait": True,
  "task": "20 framed facial-expression portraits for a dialogue box", "title": "20 chân dung hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua bo PM)
def P(id, at="grip", z="front"): return {"prop": id, "at": at, "z": z}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
MCHAIR, MTABLE = F("meeting_chair"), F("meeting_table", z="front")
TABLE = [MCHAIR, MTABLE]
FOLDER = P("folder_closed")
RULES = [  # (regex, bindings) – khop dau tien
 (r"^portrait$|^face_", []),
 (r"^idle_|^walk_|^walk_back_|^turn_01$|contract_give_01", [FOLDER]),
 (r"roadmap_show", [P("folder_open")]),
 (r"goals_", [P("contract_sheet")]),
 (r"procedure_give", [P("paper_stack")]),
 (r"^sit_01$", [F("meeting_chair", "beside")]),
 (r"panel_note", TABLE + [P("pen"), P("notebook_open", "surface:meeting_table")]),
 (r"panel_tick|panel_evidence", TABLE + [P("pen"), P("checklist_sheet", "surface:meeting_table")]),
 (r"panel_read|panel_flip", TABLE + [P("folder_open")]),
 (r"panel_point|panel_warn", TABLE + [P("folder_open", "surface:meeting_table")]),
 (r"^sit_|^panel_", TABLE),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green"}
WORD = {"folder": "folder", "contract": "page", "paper": "papers", "pen": "pen", "notebook": "notebook",
        "checklist": "form"}
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

FPS = {"idle": (6, True), "walk": (9, True), "walk_back": (8, True), "greet": (6, False), "sit": (8, False),
       "congrats": (6, True), "contract_give": (6, False), "shake": (6, False), "talk": (6, True), "listen": (3, True),
       "nod": (6, False), "panel_intro": (5, False), "panel_listen": (3, True), "panel_note": (5, True),
       "panel_confer": (4, True)}

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

# ---------------------------------------------------------------- bam kich ban: MOI O phai co mat o day
# (canh, nhip, thoai / dien bien theo docs/KICH_BAN_ROLECRAFT_PM60.md, chuoi animation va chan dung)
SCENES = [
 ("L4 S16 Final Review", "Trước cảnh", "Chị Hà vào phòng đánh giá cùng Anh Minh", "walk → greet_01 → sit_01 → sit_02 · face_formal"),
 ("L4 S16 Final Review", "Mở cảnh", "Dẫn truyện: Anh Minh và Chị Hà bên nhân sự ngồi ở bàn đánh giá.", "panel_listen · face_neutral"),
 ("L4 S16 Final Review", "", "Chị Hà (HR): “Chị bên nhân sự, sẽ cùng anh Minh đánh giá kết quả thử việc của em.”", "panel_intro · face_polite_smile"),
 ("L4 S16 Final Review", "", "Anh Minh: “…Em có 10 phút cho kết quả, quyết định quan trọng và kế hoạch 90 ngày.”", "panel_read_01 → panel_flip_01 · face_listening"),
 ("L4 S16 Final Review", "Hậu quả trước review", "team_ot_14_days + tinh thần dưới 40: báo cáo gắn cảnh báo burnout", "panel_warn_01 · face_concerned"),
 ("L4 S16 Final Review", "Hậu quả trước review", "process_gap_unresolved: hội đồng yêu cầu giải trình", "panel_probe_01 · face_probing"),
 ("L4 S16 Final Review", "Hậu quả trước review", "process_standardized / team_ownership / development_plan_created / ownership_delegated: bằng chứng tích cực", "panel_evidence_01 · face_pleased"),
 ("L4 S16 Final Review", "Câu hỏi", "PM: “Em xin bắt đầu ạ.”", "panel_note · face_serious"),
 ("L4 S16 Final Review", "A", "Chị Hà (HR): “Báo cáo chưa nói gì về sự cố production và tải của team.”", "panel_frown_01 → panel_point_01 · face_skeptical → face_frown"),
 ("L4 S16 Final Review", "B", "PM nhận trách nhiệm; Anh Minh: “Minh bạch là tốt, nhưng em cần biến nó thành kế hoạch hành động.”", "panel_consider_01 · face_thinking"),
 ("L4 S16 Final Review", "C", "PM báo cáo bốn phần; Anh Minh: “Đây là cách một PM chịu trách nhiệm.”", "panel_impressed_01 → panel_pleased_01 · face_impressed"),
 ("L4 S16 Phản biện", "Câu 1", "Chị Hà (HR): “Quyết định nào trong 60 ngày tạo ra ảnh hưởng lớn nhất, và vì sao?”", "panel_ask_01 · face_questioning"),
 ("L4 S16 Phản biện", "Câu 2", "Chị Hà (HR): “Nếu được làm lại một quyết định, em sẽ thay đổi điều gì?”", "panel_ask_02 · face_probing"),
 ("L4 S16 Phản biện", "Câu 3", "Chị Hà (HR): “Team hiện tại có vận hành được mà không cần em không?”", "panel_ask_03 · face_skeptical"),
 ("L4 S16 Phản biện", "Câu 4", "Chị Hà (HR): “Ba ưu tiên của em trong 90 ngày tới là gì?”", "panel_ask_04 · face_questioning"),
 ("L4 S16 Phản biện", "PM trả lời", "sau mỗi câu trả lời", "panel_think_01 → panel_tick_01 · face_thinking"),
 ("L4 S16 Phản biện", "Kết cảnh", "Dẫn truyện: Chị Hà và Anh Minh trao đổi với nhau...", "panel_confer · face_formal → sit_03"),
 ("Kết thúc", "Pass xuất sắc", "Chị Hà (HR): “Phòng nhân sự sẽ gửi em hợp đồng chính thức và lộ trình phát triển quản lý.”", "congrats → contract_give → roadmap_show_01 · face_congrats"),
 ("Kết thúc", "Pass", "Chị Hà (HR): “Phòng nhân sự sẽ gửi em hợp đồng chính thức trong tuần này.”", "congrats_02 → contract_give → shake → pleased_01 · face_warm"),
 ("Kết thúc", "PM cảm ơn (Pass)", "PM: “Em cảm ơn ạ!!” / “Phù... em cảm ơn anh ạ.”", "nod → greet_02 · face_laugh"),
 ("Kết thúc", "Gia hạn", "Chị Hà (HR): “Chị sẽ gửi em mục tiêu và tiêu chí đánh giá cho giai đoạn gia hạn.”", "goals_give_01 → goals_explain_01 → encourage_01 · face_encouraging"),
 ("Kết thúc", "Không đạt", "Chị Hà (HR): “Chị sẽ hỗ trợ em các thủ tục kết thúc thử việc.”", "sympathetic_01 → procedure_give_01 → comfort_01 → sigh_01 · face_sympathetic → face_regretful"),
 ("Kết thúc", "Chào tạm biệt", "Dẫn truyện (Không đạt): Ôm thùng đồ ra cửa... / các kết thúc khác", "bow_01 → turn_01 → idle_back_01 → walk_back · face_sigh"),
 ("Hội thoại", "Chị Hà đứng nói / nghe", "Mặc định khi đứng ở màn kết thúc", "idle · talk · listen · face_formal"),
]
NOTE = ("Chị Hà chỉ có ở L4 S16 Final Review và các màn kết thúc (kịch bản mục 2), nên không có cảnh làm việc, họp team "
        "hay gặp khách. Mọi ô trong các sheet đều xuất hiện trong bảng trên (`build.py` kiểm tra).")

def anim_refs(text):
    refs = []
    for part in text.replace("·", "→").replace("/", "→").replace("(", " ").replace(")", " ").split("→"):
        for tok in part.split():
            if re.fullmatch(r"[a-z][a-z0-9_]+", tok): refs.append(tok)
    return refs

# ---------------------------------------------------------------- SOL one-shot (toi uu token)
SOL = """Work autonomously. Do not ask questions. Keep chat output short.

GOAL: sprite sheets A, C, D for the game character "Chi Ha – HR business partner".

ATTACHMENTS
1. The photo of the real person (who agreed to this): face source.
2. PM_A_master.png – another character's master sheet: grid, size and style reference only.
3. rolecraft_ha_sprite_prompts.zip – prompts/HA_*.txt, ha_sprite_manifest.json, tools/.
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
2. Sheet A: HA_A_master.txt with Image 1 = the photo, Image 2 = PM_A_master.png.
3. Sheets C, D: their prompt files with Image 1 = approved HA_A_master.png, Image 2 = the photo.
4. Save to sheets/ with the manifest file names. Make every saved sheet transparent (no image call needed):
   python3 tools/make_transparent.py sheets/*.png
   Then run once:
   python3 tools/extract_anchors.py --manifest ha_sprite_manifest.json --sheets sheets --out build
5. Read build/report.json. Only for a ROW where 3 or more cells report "missing ... marker", make ONE edit call on that sheet with the ROW FIX prompt below (max 2 row fixes in total for the whole job), then run the script once more. Leave all other warnings as they are.
6. DELIVER: show the final sheets; one file rolecraft_ha_sprites.zip with sheets/, build/, ha_sprite_manifest.json, tools/pm_compose.js; a table: sheet, attempts, result, remaining warnings.

ROW FIX PROMPT (Image 1 = HA_A_master.png, Image 2 = the sheet to fix):
"Edit Image 2: redraw ONLY row {N}; keep every other row pixel-identical. Same character as Image 1. Draw no objects or furniture: empty hands in the grip pose. Add the marker dots exactly as tagged: {paste the Row N line from the prompt file}. Dots are small solid flat circles: MAGENTA #FF00FF, GREEN #00FF00, CYAN #00FFFF."

If you run out of room, stop after the last finished step and write: "Resume from step X."
"""

# ---------------------------------------------------------------- README
def cell_table(s):
    L = ["| # | Tên | Mô tả |", "|---:|---|---|"]
    for c in cells(s):
        tag = "" if s.get("portrait") or c["name"] == "portrait" else marker_tag(c["name"])
        L.append(f"| {c['index']} | `ha/{c['name']}` | {c['desc']}{tag} |")
    return L

KNOWN = set()
def mapping_md():
    L = ["Tên là **nhóm animation** `ha/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `ha/<ô>_01`; `face_*` là chân dung "
         "hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng không ghi "
         "“Chị Hà (HR):” là phản ứng của Chị Hà khi người khác nói hoặc theo kết quả.", "",
         "| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anim in SCENES:
        a = re.sub(r"\b([a-z][a-z0-9_]{2,})\b", lambda m: f"`{m.group(1)}`" if m.group(1) in KNOWN else m.group(1), anim)
        L.append(f"| {sc} | {beat} | {line} | {a} |")
    L += ["", NOTE]
    return "\n".join(L)

def readme(man):
    n_cells = sum(len(s["cells"]) for s in man["sheets"])
    L = ["# RoleCraft PM60 – Bộ prompt sprite Chị Hà v4 (HR)", "",
         "Sinh bởi `rolecraft_ha_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.", "",
         f"**{len(man['sheets'])} sheet / {n_cells} ô / {len(man['animations'])} animation.** Mỗi ô gắn với một câu thoại "
         "hoặc diễn biến của Chị Hà trong kịch bản (mục 5). Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM.", "",
         "## Thiết kế", "",
         "- **Tạo hình:** chuyên viên nhân sự khoảng 30–35 tuổi, áo blouse kem, blazer hồng đất cài một cúc, quần navy, "
         "giày gót thấp nâu, bông tai ngọc trai, đồng hồ vàng, thẻ xanh royal. Vật đặc trưng: folder navy đựng phiếu đánh giá.",
         "- **Theo kịch bản:** S16 ngồi bàn đánh giá cạnh Anh Minh (mở đầu, đọc báo cáo, phản ứng theo nhánh A/B/C và hậu "
         "quả trước review, 4 câu hỏi phản biện, trao đổi với Anh Minh); 4 màn kết thúc đứng (trao hợp đồng + lộ trình, "
         "trao hợp đồng, trao mục tiêu gia hạn, hỗ trợ thủ tục kết thúc).",
         "- **Quay PHẢI** như PM; khi ngồi đối diện PM thì game lật cả cụm (`flip: true`).",
         "- **Sheet:** A (8×6), C (8×3, ảnh ngang 3:2 – không độn ô), D (4×5). Nền trong suốt; quy tắc tiết kiệm token "
         "trong `SOL_ONE_SHOT_PROMPT.txt`.",
         "- **Thay bản cũ:** bản cũ quay trái + bind `beside_left` (không ghép được); chân dung `face_tired` (không có cảnh "
         "nào) đổi thành `face_listening`.", "",
         "## 1. Thứ tự sinh và ảnh đính kèm", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    att = {"photo+pm": "ảnh thật + `PM_A_master.png`", "master": "`HA_A` đã duyệt + ảnh thật"}
    for s in SHEETS:
        L.append(f"| {s['id']} ({s['cols']}×{s['rows']}) | `prompts/HA_{s['id']}_{s['key']}.txt` | {att[s['attach']]} | {s['title']} |")
    L += ["", "**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip "
          "thư mục `rolecraft_ha_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Mỗi sheet 1 lần sinh, chỉ "
          "sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả); nền "
          "trắng thì chỉ chạy `tools/make_transparent.py`; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.", "",
          "**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm C, D.", "",
          "## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)", "",
          "> ✅ Đúng lưới (A: 8×6 vuông; C: 8×3 ảnh ngang; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, "
          "**nền trong suốt** (không trắng, không ô caro vẽ giả).",
          ">",
          "> ✅ Nhận ra người thật; blazer hồng đất, blouse kem, thẻ xanh royal; ô 1 sheet A là chân dung khung xanh nhạt.",
          ">",
          "> ✅ Không vẽ folder, giấy, bút, ghế, bàn (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.",
          ">",
          "> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.", "",
          "## 3. Dùng tool", "",
          "```bash",
          "cd docs/HA/rolecraft_ha_sprite_prompts",
          "python3 tools/make_transparent.py sheets/*.png",
          "python3 tools/extract_anchors.py --manifest ha_sprite_manifest.json --sheets sheets --out build",
          "```", "",
          "Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`ha/*`), "
          "rồi `PMCompose.create(anchors, manifest, base)`.", "",
          "## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)", "",
          "| Nhóm tư thế | Đồ vật | Nội thất |", "|---|---|---|",
          "| idle, walk, walk_back, turn_01, contract_give_01 | folder_closed | |",
          "| roadmap_show_01 / goals_* / procedure_give_01 | folder_open / contract_sheet / paper_stack | |",
          "| sit_01 | | meeting_chair (bên phải) |",
          "| sit_02, sit_03, panel_* | | meeting_chair + meeting_table |",
          "| panel_note / panel_tick, panel_evidence | pen + notebook_open / checklist_sheet trên bàn | meeting_chair + meeting_table |",
          "| panel_read, panel_flip / panel_point, panel_warn | folder_open trên tay / trên bàn | meeting_chair + meeting_table |", "",
          "## 5. Mapping kịch bản → sprite", "", mapping_md(), "",
          "## 6. Chi tiết từng sheet", ""]
    for s in SHEETS:
        L += [f"### Sheet {s['id']} – {s['title']}", ""] + cell_table(s) + [""]
    return "\n".join(L)

# ---------------------------------------------------------------- main
def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    for f in os.listdir(f"{OUT}/prompts"):
        if f.startswith("HA_") and f.endswith(".txt"): os.remove(f"{OUT}/prompts/{f}")
    man = {"version": 4, "character": {"id": "HA", "role": "HR", "name": "Chị Hà – Nhân sự (HR)"},
           "shared": {"note": "prop/*, furn/*, icon/* dùng lại sheet P, O, F của bộ PM (docs/PM)"},
           "facing": "right",
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/HA_{s['id']}_{s['key']}.txt", "w", encoding="utf-8").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"ha/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        sh = {"id": s["id"], "key": s["key"], "kind": "ha", "file": f"HA_{s['id']}_{s['key']}.png",
              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl}
        if s.get("aspect"): sh["aspect"] = s["aspect"]
        man["sheets"].append(sh)
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (6, False) if len(fr) > 1 else (1, False))
            man["animations"][f"ha/{k}"] = {"frames": [f"ha/{f}" for f in fr], "fps": fps, "loop": loop}
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
    json.dump(man, open(f"{OUT}/ha_sprite_manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(f"{OUT}/SOL_ONE_SHOT_PROMPT.txt", "w", encoding="utf-8").write(SOL)
    open(f"{OUT}/mapping_section.md", "w", encoding="utf-8").write(mapping_md() + "\n")
    md = readme(man)
    for p in (f"{OUT}/README_HA_SPRITE_PROMPTS.md", os.path.join(OUT, "..", "README_HA_SPRITE_PROMPTS.md")):
        open(p, "w", encoding="utf-8").write(md + "\n")
    n = sum(len(s["cells"]) for s in man["sheets"])
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} dong mapping, 0 o thua")

if __name__ == "__main__":
    main()
