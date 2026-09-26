# -*- coding: utf-8 -*-
# Bo prompt sprite NAM (SALE – Sales Executive, uu tien co hoi va cam ket voi khach hang), cung co che v3 voi bo PM
# (docs/PM), MINH, LAN, HA, HUY: nhan vat ve tay khong + cham neo, do vat / noi that / icon DUNG LAI sheet P, O, F cua
# PM. Nam chi xuat hien o L3 S10 (hua tinh nang AI trong 10 ngay) va L4 S15 (mo rong hop tac, bao gia) -> 3 sheet
# A, B, D nhu bo HA. Noi dung o bam theo docs/KICH_BAN_ROLECRAFT_PM60.md (L3 S10, L4 S15) va THOAI_MAU.json.
#     python3 build.py        # sinh prompts/NAM_*.txt + nam_sprite_manifest.json + README_NAM_SPRITE_PROMPTS.md
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

OUTFIT = ("OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): an energetic "
"sales executive around thirty, a few years older than the PM, sharp and client-ready. Light sky-blue dress shirt, no "
"tie, top button open; slim navy blazer worn open; tan chinos; polished brown loafers; a shiny silver wristwatch on the "
"left wrist; a small silver pin on the blazer lapel. A royal-blue lanyard around the neck with a plain royal-blue ID "
"badge card at the chest (blank, no text) — the official staff badge. Signature prop: a smartphone (always talking to "
"clients). It is added later by code, so do NOT draw it (except in the framed portrait cell).")

STYLE = ("ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style, exactly matching the reference "
"sheet. Big head, about 2.4 to 2.6 heads tall in total (a little taller than the young PM); expressive bright eyes with "
"highlights, a big confident salesman smile is the default; lively, animated body language; small nose and mouth; clean "
"dark-brown pixel outline (not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; "
"consistent top-left light. Every full-body figure stands on a small soft grey oval shadow. Small effect icons "
"(sparkles, sweat drop, small grey puff, exclamation mark, question mark) are drawn next to a figure only where a cell "
"asks for them.")

def LAYOUT(cols, rows, portrait_first):
    s = (f"LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly {cols} columns x {rows} rows "
         f"= {cols*rows} cells, packed like a professional game asset sheet: each figure fills most of its cell but never "
         "touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared "
         "baseline. Figures face LEFT in a 3/4 view (the character usually stands opposite the PM, who faces right) unless "
         "a cell says otherwise. Reading order: left to right, top to bottom. ")
    if portrait_first:
        s += ("Cell 1 (top-left) is special: a head-and-shoulders portrait inside a rounded-square frame with a thin dark "
              "outline and a soft pastel-blue background with a few sparkles, the character with a big confident grin, "
              "holding a smartphone up beside the face. Cell 1 is the ONLY cell with a background; every other cell is a "
              "full-body figure on pure white.")
    return s

OBJECT_RULE = ("OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites "
"that will be placed by code. Wherever a cell mentions a phone, tablet, quote, contract, page, folder, business card, "
"notebook, pen, mug, chair, desk or table, do NOT draw that object. Instead draw the empty hand(s) in the exact grip pose "
"as if holding it, and the body sitting or leaning at the correct height as if on the invisible furniture. Keep the worn "
"lanyard badge, the lapel pin and the wristwatch as part of the character. MARKER DOTS: small solid round dots about 1.5% "
"of the cell width, flat color, no outline, no shading, drawn on top of the character. MAGENTA #FF00FF = grip point of "
"the main held object (for a two-handed hold, midway between the hands). GREEN #00FF00 = grip point of a second object "
"held in the other hand. CYAN #00FFFF = seat contact point (middle of the hips where they touch the seat) for sitting "
"poses. Draw only the dots listed in each cell's [markers] tag; cells without a tag have no dots. Never use these three "
"colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw "
"grid lines or cell borders (except the frame of the portrait cells); add scenery, floor or walls; add extra characters "
"(the client, the PM and the other person in a handshake are offscreen); crop limbs; repeat an identical pose; change "
"the face, hair, outfit colors or proportions between cells; use pure white for clothing edges that touch the "
"background.")

# ---------------------------------------------------------------- sheet A – master
A = [
 ("Row 1 - Portrait + idle", [
  ("portrait","[portrait cell, see LAYOUT] big confident grin, phone held up beside the face, a few sparkles"),
  ("idle_01","idle loop 1/4: upbeat stance, phone held loosely in the right hand"),
  ("idle_02","idle loop 2/4: small bounce on the toes, energetic"),
  ("idle_03","idle loop 3/4: quick glance at the phone screen"),
  ("idle_back_01","standing seen from behind (back view), phone in the right hand"),
  ("idle_04","idle loop 4/4: settling back, bright smile"),
  ("greet_01","big friendly wave, 'hey!'"),
  ("greet_02","finger guns with a wink")]),
 ("Row 2 - Walk cycle 8 frames, brisk bouncy pace, phone in the right hand, left arm swings", [
  ("walk_01","walk contact: left foot forward heel touching"),("walk_02","walk down: weight on left leg, knee bent"),
  ("walk_03","walk passing: right leg passing the left"),("walk_04","walk up: rising on left toes"),
  ("walk_05","walk contact: right foot forward heel touching"),("walk_06","walk down: weight on right leg, knee bent"),
  ("walk_07","walk passing: left leg passing the right"),("walk_08","walk up: rising on right toes")]),
 ("Row 3 - Talking + listening (dialogue loops, hands free)", [
  ("talk_01","talking, right hand open at chest height, enthusiastic"),
  ("talk_02","talking, both hands spread wide, selling the idea"),
  ("talk_03","talking, index finger pointing up, 'here's the thing'"),
  ("talk_04","talking, hand returning down, charming smile"),
  ("listen_01","listening, hands on the hips, eager to jump in"),
  ("listen_02","listening, head tilted, hand on the chin, calculating"),
  ("nod_01","nodding quickly, big smile"),("nod_02","nodding, chin lifted back up")]),
 ("Row 4 - Sit on an invisible office chair (same seat height in every sit cell)", [
  ("sit_01","standing next to the chair, about to sit"),
  ("sit_02","dropping onto the chair"),("sit_03","seated, leaning back, one arm over the backrest, relaxed"),
  ("sit_04","seated, leaning forward eagerly, hands on the knees"),
  ("sit_05","seated, one foot tapping, impatient"),
  ("sit_06","seated, writing in a notebook on the lap with a pen"),("sit_07","seated, typing on a phone held in both hands"),
  ("sit_08","springing up from the chair")]),
 ("Row 5 - Positive reactions with small effect icons", [
  ("good_01","big grin, thumbs up, sparkles"),("good_02","fist pump, 'yes!', sparkles"),
  ("good_03","confident wink with a thumbs up"),("good_04","laughing, head back, hand on the stomach"),
  ("applaud_01","applauding, hands apart"),("applaud_02","applauding, hands together"),
  ("excited_01","both arms up, excited, sparkles, 'great opportunity!'"),
  ("relieved_01","relieved exhale, hand on the chest, smile")]),
 ("Row 6 - Sheepish, pressured and negative reactions", [
  ("sheepish_01","sheepish grin, rubbing the back of the neck, one sweat drop"),
  ("sheepish_02","awkward laugh, hand waving in front, 'haha... about that'"),
  ("caught_01","eyes wide, shoulders up, caught off guard, exclamation mark"),
  ("sweat_01","nervous smile, two sweat drops, tugging the collar"),
  ("frown_01","frowning, arms crossed, 'the client already agreed'"),
  ("offended_01","offended, hand on the chest, eyebrows up, 'you told the client WHAT?'"),
  ("disappoint_01","disappointed, shoulders dropped, small grey puff"),
  ("impatient_01","impatient, tapping the wristwatch")]),
 ("Row 7 - Thinking + sales stances", [
  ("think_01","thinking, hand on the chin, looking up"),("think_02","thinking, eyes closed, finger tapping the temple"),
  ("pocket_01","one hand in the trouser pocket, confident stance"),
  ("crossarms_01","arms crossed, neutral, waiting for the answer"),
  ("hips_01","hands on the hips, upbeat, ready to close"),
  ("lean_01","leaning in with a conspiratorial smile, hand beside the mouth"),
  ("persuade_01","both hands pressed together in front, 'can't we try?'"),
  ("point_01","pointing forward with an open hand, 'your call'")]),
]

# ---------------------------------------------------------------- sheet B – cam nam, S10, S15, ket thuc
B = [
 ("Row 1 - Phone with clients (the signature prop)", [
  ("phone_call_01","phone at the ear, big smile, talking to a client"),
  ("phone_call_02","phone at the ear, laughing, free hand gesturing"),
  ("phone_call_03","phone at the ear, nodding, 'yes, yes, of course!'"),
  ("phone_hangup_01","lowering the phone from the ear, triumphant grin"),
  ("phone_read_01","reading a message on the phone"),
  ("phone_type_01","typing quickly with both thumbs"),
  ("phone_show_01","turning the phone screen toward the viewer, 'look, the client said yes'"),
  ("phone_pocket_01","sliding the phone into the blazer pocket")]),
 ("Row 2 - Dropping by the PM's desk with the 10-day promise; the desk is on the LEFT (desk invisible)", [
  ("dropby_01","arriving and leaning on the desk with one hand, grinning"),
  ("dropby_02","leaning on the desk, tapping it with the fingers, excited"),
  ("announce_01","both arms wide, 'I closed the deal!'"),
  ("announce_02","both hands up with ten fingers spread, 'ten days!'"),
  ("announce_03","double thumbs up, confident, sparkles"),
  ("promise_01","hand on the chest, 'I already promised the client'"),
  ("easy_01","waving a hand casually, 'it's just a small AI feature'"),
  ("pushback_01","leaning back from the desk, surprised by the pushback, question mark")]),
 ("Row 3 - Reacting to the PM's decision", [
  ("accept_01","relieved nod, 'OK, MVP in ten days then'"),
  ("accept_02","thumbs up, reassured smile"),
  ("persuade_02","palms pressing down gently, 'the client is very happy right now'"),
  ("persuade_03","leaning in, both hands open, bargaining"),
  ("blamed_01","stunned, hand on the chest, being blamed in front of the client"),
  ("blamed_02","frowning, jaw tight, arms crossed, upset"),
  ("apologize_01","small apologetic bow, hands pressed together"),
  ("reluctant_01","reluctant sigh, shrug, 'fine, fine'")]),
 ("Row 4 - Quote and contract papers (standing)", [
  ("quote_hold_01","holding a quote page in both hands, reading it"),
  ("quote_show_01","turning the quote page toward the viewer"),
  ("quote_split_01","holding two quote pages side by side, one per hand, 'phase 1 and phase 2'"),
  ("quote_give_01","extending a closed folder with the proposal forward"),
  ("quote_give_02","folder handed over, hands returning, big smile"),
  ("tab_present_01","turning a tablet toward the viewer, showing the pricing"),
  ("tab_present_02","tablet turned, pointing at a number on the screen"),
  ("card_give_01","offering a business card with both hands, small bow")]),
 ("Row 5 - Client meeting, seated at an invisible round meeting table on the LEFT (same seat height in every cell)", [
  ("meet_table_talk_01","seated, talking enthusiastically with an open hand"),
  ("meet_table_talk_02","seated, leaning in, selling the expansion"),
  ("meet_table_listen_01","seated, listening, hands folded on the table, eager"),
  ("meet_table_note_01","seated, writing notes with a pen"),
  ("meet_table_show_01","seated, turning a tablet toward the client"),
  ("meet_table_tap_01","seated, fingers drumming on the table, impatient"),
  ("meet_table_agree_01","seated, nodding with a big smile"),
  ("meet_table_thumb_01","seated, thumbs up across the table")]),
 ("Row 6 - Pitching and closing (standing)", [
  ("pitch_01","pitching, one arm sweeping outward, 'imagine the possibilities'"),
  ("pitch_02","pitching, counting benefits on the fingers"),
  ("pitch_03","pointing up, 'a big opportunity!'"),
  ("shake_01","reaching out the right hand for a handshake"),
  ("shake_02","vigorous two-handed handshake, big grin"),
  ("bow_01","small polite bow to the client"),
  ("watch_01","checking the wristwatch, 'this week, the budget closes this month'"),
  ("hurry_01","gesturing 'come on, let's move' with a beckoning hand")]),
 ("Row 7 - Coffee and endings (standing)", [
  ("coffee_01","holding a coffee mug, relaxed"),("coffee_02","sipping the coffee, eyes closed"),
  ("cheer_01","cheering, one fist raised, sparkles"),("cheer_02","both arms up, big grin"),
  ("congrats_01","offering a fist bump"),("congrats_02","clapping someone on the shoulder offscreen"),
  ("sad_01","sad, looking down, hands in the pockets"),
  ("wave_01","cheerful goodbye wave")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral","neutral, friendly"),("face_grin","big confident grin"),("face_wink","wink with a smile"),("face_excited","excited, sparkling eyes")]),
 ("Row 2", [("face_laugh","laughing, eyes closed"),("face_charming","charming salesman smile"),("face_eager","eager, leaning into the frame"),("face_persuading","persuading, eyebrows raised, hands pressed together")]),
 ("Row 3", [("face_thinking","thinking, eyes looking up"),("face_calculating","calculating, one eye narrowed"),("face_surprised","surprised, eyebrows up, mouth open"),("face_sheepish","sheepish grin, sweat drop")]),
 ("Row 4", [("face_nervous","nervous smile, two sweat drops"),("face_frown","frowning, displeased"),("face_offended","offended, eyebrows up, lips pressed"),("face_disappointed","disappointed, small grey puff")]),
 ("Row 5", [("face_relieved","relieved, soft smile"),("face_impatient","impatient, eyes to the side"),("face_apologetic","apologetic, awkward smile"),("face_proud","proud, chin up")]),
]

SHEETS = [
 {"id":"A","key":"master","cols":8,"rows":7,"attach":"photo+pm","grid":A,"portrait_first":True,
  "task":"framed portrait, idle, back view, walk cycle, talking and listening, sitting on a chair, and reactions",
  "title":"Master: chân dung, đứng, đi, nói/nghe, ngồi, cảm xúc (hào hứng, lúng túng)"},
 {"id":"B","key":"sales_scenes","cols":8,"rows":7,"attach":"master","grid":B,
  "task":"phone calls with clients, dropping by the PM's desk with a promise, reacting to the PM's decision, quotes and contracts, a client meeting, pitching and closing, and endings",
  "title":"Điện thoại, hứa 10 ngày (S10), báo giá + họp mở rộng (S15), kết thúc"},
 {"id":"D","key":"portraits","cols":4,"rows":5,"attach":"master","grid":D,"portrait":True,
  "task":"20 framed facial-expression portraits for a dialogue box","title":"20 chân dung cảm xúc cho hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua sheet P, O cua PM)
def P(id, at="grip", z="front", rot=0): return {"prop": id, "at": at, "z": z, "rot": rot}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
CHAIR, MCHAIR, MTABLE = F("office_chair"), F("meeting_chair"), F("meeting_table", z="front")
PHONE = P("phone_back")
RULES = [  # (regex, bindings) – khop dau tien
 (r"portrait$|^face_", []),
 (r"^idle_0|idle_back|^walk_", [PHONE]),
 (r"sit_06", [CHAIR, P("notebook_open"), P("pen", "grip2")]),
 (r"sit_07", [CHAIR, PHONE]),
 (r"sit_01", [F("office_chair", "beside_left")]),
 (r"^sit_", [CHAIR]),
 (r"phone_show", [P("phone_screen")]),
 (r"^phone_", [PHONE]),
 (r"dropby_", [F("desk_monitor", "lean_left", z="front")]),
 (r"quote_split", [P("contract_sheet"), P("contract_sheet", "grip2")]),
 (r"quote_hold|quote_show", [P("contract_sheet")]),
 (r"quote_give", [P("folder_closed")]),
 (r"tab_present", [P("tablet_screen_34")]),
 (r"card_give", [P("task_card")]),
 (r"coffee_", [P("mug_steam")]),
 (r"meet_table_note", [MCHAIR, MTABLE, P("pen"), P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_show", [MCHAIR, MTABLE, P("tablet_screen_34")]),
 (r"meet_table_", [MCHAIR, MTABLE]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green", "seat": "cyan"}
WORD = {"phone": "phone", "contract": "page", "folder": "folder", "tablet": "tablet", "task": "card", "notebook": "notebook",
        "pen": "pen", "mug": "mug"}
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
             f"Nam, the company's sales executive — upbeat, persuasive, always chasing the next deal, sometimes promising "
             f"the client more than the team can deliver. Sheet content: {s['task']}.",
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

FPS = {"idle": (7, True), "walk": (11, True), "talk": (7, True), "listen": (4, True), "nod": (8, True), "sit": (8, False),
       "applaud": (8, True), "phone_call": (6, True), "dropby": (6, True), "announce": (7, False), "accept": (6, False),
       "persuade": (6, False), "blamed": (6, False), "quote_give": (8, False), "tab_present": (6, False),
       "meet_table_talk": (7, True), "pitch": (7, False), "shake": (7, False), "cheer": (8, True), "congrats": (6, False),
       "coffee": (4, False), "sheepish": (6, False), "good": (6, False)}

# ---------------------------------------------------------------- bam kich ban: canh -> animation goi y (nam/<nhom>)
SCRIPT_ANIM = {}  # docs khong dat ten animation nao cho SALE
SCENES = [  # (scenario, nhip, cau thoai tom tat theo docs / THOAI_MAU, animation / chan dung)
 ("P3_S10_SALES_OVERCOMMIT", "Mở cảnh", "Nam ghé qua bàn PM: anh chốt với khách rồi, tính năng AI xong trong mười ngày!", ["nam/walk", "nam/dropby", "nam/announce", "nam/face_excited"]),
 ("P3_S10_SALES_OVERCOMMIT", "PM phản ứng", "Mười ngày? Team còn chưa được hỏi!", ["nam/pushback_01", "nam/promise_01", "nam/easy_01", "nam/face_sheepish"]),
 ("P3_S10_SALES_OVERCOMMIT", "Nhánh A", "PM nhận deadline, cả team chạy nước rút.", ["nam/accept_02", "nam/good_02", "nam/face_grin"]),
 ("P3_S10_SALES_OVERCOMMIT", "Nhánh B", "PM nói với khách rằng Sales đã hứa sai.", ["nam/blamed", "nam/offended_01", "nam/face_offended"]),
 ("P3_S10_SALES_OVERCOMMIT", "Nhánh C", "MVP 10 ngày, phase 2 có estimate.", ["nam/reluctant_01", "nam/accept_01", "nam/face_relieved"]),
 ("P4_S15_CLIENT_EXPANSION", "Mở cảnh", "Cơ hội tốt để mở rộng hợp đồng… team xác nhận để anh hoàn thiện báo giá.", ["nam/meet_table_talk", "nam/meet_table_tap_01", "nam/face_eager"]),
 ("P4_S15_CLIENT_EXPANSION", "Nhánh A", "Anh sẽ tiến hành báo giá và thủ tục mở rộng ngay.", ["nam/excited_01", "nam/quote_give", "nam/shake", "nam/face_grin"]),
 ("P4_S15_CLIENT_EXPANSION", "Nhánh B", "Chậm hơn, nhưng anh có cơ sở rõ hơn để xây dựng báo giá.", ["nam/think_01", "nam/quote_hold_01", "nam/face_calculating"]),
 ("P4_S15_CLIENT_EXPANSION", "Nhánh C", "Anh tách báo giá và kế hoạch thanh toán theo từng phase.", ["nam/quote_split_01", "nam/tab_present", "nam/face_proud"]),
 ("END", "Kết thúc", "Chúc mừng / chia tay PM (không có thoại trong docs – dùng cho màn kết).", ["nam/cheer", "nam/congrats", "nam/sad_01", "nam/wave_01"]),
]

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

def readme(man):
    L = ["# Bộ prompt sprite NAM (SALE – Sales Executive)", "",
         "Sinh bởi `build.py` – sửa ở `build.py` rồi chạy lại, không sửa tay file này.", "",
         "Cùng cơ chế v3 với bộ PM (`docs/PM`), MINH, LAN, HA, HUY: nhân vật vẽ tay không + chấm neo "
         "(magenta = cầm chính, green = tay kia, cyan = điểm ngồi); đồ vật, nội thất, icon **dùng lại sheet P, O, F của PM**.", "",
         "## Thứ tự tạo ảnh", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    for s in SHEETS:
        att = "ảnh thật + `PM_A_master.png` (chỉ lấy style)" if s["attach"] == "photo+pm" else "ảnh thật + `NAM_A_master.png`"
        L.append(f"| {s['id']} ({s['cols']}x{s['rows']}) | `prompts/NAM_{s['id']}_{s['key']}.txt` | {att} | {s['title']} |")
    L += ["", "Tạo sheet A trước và duyệt, sau đó B, D đính kèm A làm chuẩn. Không có sheet C: Nam chỉ xuất hiện ở "
          "L3 S10 và L4 S15, nên các cảnh gộp vào sheet B (như bộ HA).", "",
          "## Tạo hình nhân vật (theo docs)", "",
          "- Vai trò: Sales Executive – “ưu tiên cơ hội và cam kết với khách hàng” (docs/KICH_BAN_ROLECRAFT_PM60.md, mục 2), "
          "“thúc đẩy cơ hội mở rộng hợp đồng” (L4 S15).",
          "- Xưng “anh” với PM → lớn tuổi hơn PM một chút; hào hứng, thuyết phục, hay hứa trước với khách rồi mới hỏi team.",
          "- Đạo cụ đặc trưng: điện thoại (`prop/phone_back`, `prop/phone_screen`); báo giá dùng `prop/contract_sheet`, "
          "danh thiếp dùng `prop/task_card`.",
          "- Ô `dropby_*` tựa vào bàn PM: nội thất gắn điểm `lean_left` (mới, chưa có ở bộ khác) – code cần đặt "
          "`furn/desk_monitor` ngay dưới bàn tay tì lên bàn.", "",
          "## Cảnh → animation gợi ý (bám thoại của Nam)", "",
          "| Scenario | Nhịp | Thoại (tóm tắt) | Animation / chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anims in SCENES:
        L.append(f"| `{sc}` | {beat} | {line} | {', '.join(f'`{a}`' for a in anims)} |")
    L += ["", f"Tổng: {sum(len(s['cells']) for s in man['sheets'])} ô, {len(man['animations'])} animation.", ""]
    return "\n".join(L)

def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    man = {"version": 3, "character": {"id": "SALE", "role": "SALE", "name": "Nam – Sales Executive"},
           "shared": {"note": "Đồ vật, nội thất, icon dùng lại sheet P, O, F của bộ PM (docs/PM): prop/*, furn/*, icon/*"},
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}, "script_animations": SCRIPT_ANIM,
           "scenes": [{"scenario": sc, "beat": b, "line": l, "use": a} for sc, b, l, a in SCENES]}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/NAM_{s['id']}_{s['key']}.txt", "w").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"nam/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        man["sheets"].append({"id": s["id"], "key": s["key"], "kind": "nam", "file": f"NAM_{s['id']}_{s['key']}.png",
                              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl})
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (8, False) if len(fr) > 1 else (1, False))
            man["animations"][f"nam/{k}"] = {"frames": [f"nam/{f}" for f in fr], "fps": fps, "loop": loop}
    # moi tham chieu trong SCENES phai ton tai (animation, o don hoac chan dung)
    known = set(man["animations"]) | {f"nam/{n}" for n in seen}
    for ref in [x for *_, a in SCENES for x in a]:
        assert ref in known, f"tham chieu khong ton tai: {ref}"
    json.dump(man, open(f"{OUT}/nam_sprite_manifest.json", "w"), ensure_ascii=False, indent=1)
    open(f"{OUT}/README_NAM_SPRITE_PROMPTS.md", "w").write(readme(man))
    n = sum(len(cells(s)) for s in SHEETS)
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} canh -> prompts/ + nam_sprite_manifest.json + README")

if __name__ == "__main__":
    main()
