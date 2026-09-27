# -*- coding: utf-8 -*-
# Bo prompt sprite LAN v4 (QA_BA – BA/QA), day du nhu bo PM (A, B, C, D, E) nhung MOI O bam mot cau thoai hoac mot
# canh Lan co mat trong docs/KICH_BAN_ROLECRAFT_PM60.md (xem SCENES). Cung co che v3: ve tay khong + cham neo,
# do vat / noi that / icon DUNG LAI sheet P, O, F cua PM (moi mon Lan cam deu co san).
# Lan quay PHAI nhu PM de dung chung ghe, ban, bang trang cua bo PM; game lat ca cum (flip) khi Lan dung doi dien PM.
# Nhan dien tu ANH THAT (chua co sheet Lan nao duoc duyet).
#     python build.py   -> prompts/LAN_*.txt, lan_sprite_manifest.json, SOL_ONE_SHOT_PROMPT.txt,
#                          mapping_section.md, README_LAN_SPRITE_PROMPTS.md (ca ban o docs/LAN/)
import copy, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT", HERE)

# ---------------------------------------------------------------- van ban chung (ngan, khong lap y)
WHO = ("Lan, the team's BA/QA analyst: careful and process-minded, guards requirements and quality, and raises risks "
       "politely but firmly")

ATTACH_A = ("ATTACHED IMAGES: Image 1 is a photo of a real person who agreed to become this character: the ONLY source "
"for the face. Image 2 is the master sheet of ANOTHER character (the young PM): use it ONLY for the grid layout, sprite "
"size, outline and shading; never copy the PM's face or clothes.")
ATTACH_MASTER = ("ATTACHED IMAGES: Image 1 is the approved master sheet of this character (Lan, Sheet A): match it exactly "
"(face, hair, outfit, colors, proportions, outline, shading, sprite size). Image 2 is the photo of the real person: use "
"it only to keep the face recognizable.")

IDENTITY = ("IDENTITY: keep the person in the photo clearly recognizable: face shape, eyes and eyebrows, nose and mouth, "
"hairstyle, hair length, color and parting, skin tone, and features such as glasses, moles or earrings (glasses, if any, "
"in every cell). Stylize into the art style; do not trace the photo. Ignore the photo's background, pose, expression "
"and clothing.")

CHARACTER = ("CHARACTER (identical in every cell unless a row says otherwise): Lan, mid-twenties, a little younger than "
"the PM, tidy and neat. Soft mint-green collared shirt with the sleeves neatly folded to the forearm, tucked in; light "
"oatmeal-beige knit cardigan worn open; navy straight-leg trousers; clean white low sneakers; thin tan strap watch on the "
"left wrist; royal-blue lanyard with a plain royal-blue ID badge card at the chest (blank, no text). About 2.4 heads "
"tall, the same height as the PM or slightly shorter, slimmer build, attentive and a little cautious look.")

STYLE = ("ART STYLE: cute chibi game sprite, soft high-resolution pixel art: big head, expressive glossy eyes, small nose "
"and mouth, short limbs, clean dark-brown outline (not pure black), soft cel shading, warm natural colors, top-left light. "
"Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, grey puff, "
"exclamation or question mark, Zzz) only where a cell asks for them, kept inside the cell.")

def LAYOUT(s):
    cols, rows = s["cols"], s["rows"]
    shape = "landscape 3:2 image" if s.get("aspect") == "3:2" else "square 1:1 image"
    t = (f"LAYOUT (most important): {shape}, fully TRANSPARENT background (PNG with alpha channel): no white, no color, no checkerboard pattern painted in. Exactly {cols} columns x {rows} rows = "
         f"{cols*rows} equal invisible cells, ONE full-body figure per cell (head to shoes, never cut), centred in its cell, "
         "same size in every cell, clear empty gap between neighbours; no arm, icon or shadow crosses a cell edge. In each "
         "row all feet rest on one shared baseline. Figures face RIGHT in a 3/4 view unless a cell says otherwise. Reading "
         "order left to right, top to bottom.")
    if s.get("portrait_first"):
        t += (" Cell 1 is the only exception: a head-and-shoulders portrait in a rounded-square frame with a thin dark "
              "outline and a soft pastel-blue background with a few sparkles; Lan with a gentle attentive smile holding a "
              "printed checklist sheet (grey check boxes, no readable text) against the chest. No other cell has a "
              "background or a drawn object.")
    return t

OBJECT_RULE = ("OBJECTS AND FURNITURE ARE ADDED BY CODE, SO NEVER DRAW THEM: no checklist, page, folder, papers, laptop, "
"tablet, phone, notebook, pen, marker, sticky notes, mug, chair, sofa, desk, table, monitor, lamp or whiteboard (the worn "
"lanyard badge and the watch stay). Draw the empty hand(s) in the exact grip pose, and seated or lying bodies at the "
"right height on invisible furniture. MARKER DOTS, only where a cell has a [markers] tag: small solid flat dots about "
"1.5% of the cell width drawn on top of the figure. MAGENTA #FF00FF = grip point of the main held object (two hands: "
"midway between them); GREEN #00FF00 = grip point of a second object in the other hand; CYAN #00FFFF = middle of the "
"hips where they touch a seat. Never use these three colors anywhere else.")

NEG = ("DO NOT: make it photorealistic or paste the photo; add text, letters, numbers or watermark; draw grid lines or "
"cell borders; add scenery, floor or walls; add other characters (the PM, the client, Huy or Nam are offscreen); crop "
"limbs; repeat an identical pose; change face, hair, outfit colors or proportions between cells.")

# ---------------------------------------------------------------- sheet A – master (co the)
A = [
 ("Row 1 - Portrait + idle (checklist sheet held against the chest with the left arm)", [
  ("portrait", "[portrait cell, see LAYOUT]"),
  ("idle_01", "idle 1/4: upright tidy stance"),
  ("idle_02", "idle 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03", "idle 3/4: glancing down at the checklist for a moment"),
  ("idle_04", "idle 4/4: slight exhale, calm attentive face"),
  ("idle_back_01", "seen from BEHIND (back view), standing"),
  ("greet_01", "small polite bow of the head, friendly smile, meeting the new PM"),
  ("greet_02", "small friendly wave at shoulder height")]),
 ("Row 2 - Walk cycle 8 frames, light careful pace, checklist held against the chest, right arm swings", [
  ("walk_01", "contact: right foot forward, heel touching"), ("walk_02", "down: weight on right leg, knee bent"),
  ("walk_03", "passing: left leg passing the right"), ("walk_04", "up: rising on right toes"),
  ("walk_05", "contact: left foot forward, heel touching"), ("walk_06", "down: weight on left leg, knee bent"),
  ("walk_07", "passing: right leg passing the left"), ("walk_08", "up: rising on left toes")]),
 ("Row 3 - Run cycle 8 frames, hurrying to a production incident, leaning forward, checklist clutched to the chest, "
  "worried face", [
  ("run_01", "contact right foot"), ("run_02", "push-off from right foot"), ("run_03", "airborne, legs apart"),
  ("run_04", "landing on left foot"), ("run_05", "contact left foot"), ("run_06", "push-off from left foot"),
  ("run_07", "airborne, legs apart, mirrored"), ("run_08", "landing on right foot")]),
 ("Row 4 - Office chair (invisible; same seat height in the seated cells), gathering scattered documents, startle", [
  ("sit_01", "standing in front of the chair, about to sit"),
  ("sit_02", "lowering onto the chair"),
  ("sit_03", "seated upright, hands on the knees"),
  ("sit_04", "standing up from the chair, hands on the knees"),
  ("crouch_01", "bending down toward scattered pages on the floor"),
  ("crouch_02", "crouching, gathering pages into a pile"),
  ("crouch_03", "rising back up holding the gathered pages"),
  ("startle_01", "small startled hop, eyes wide, checklist lifted, exclamation mark")]),
 ("Row 5 - Office sofa after long regression nights (invisible two-seat sofa; same height in the sofa cells), "
  "next morning", [
  ("slump_01", "sitting on the sofa, exhausted, head tilted back"),
  ("slump_02", "sliding sideways down onto the sofa"),
  ("lie_01", "curled up asleep on the sofa, head on a folded arm, small Zzz"),
  ("getup_01", "sitting up groggy on the sofa, rubbing one eye"),
  ("getup_02", "standing up from the sofa, tidying the cardigan"),
  ("stretch_01", "standing, stretching both arms overhead"),
  ("stretch_02", "standing, rolling the shoulders, relieved"),
  ("breath_01", "deep calming breath, eyes closed, hand on the chest")]),
 ("Row 6 - Positive reactions", [
  ("good_01", "relieved small smile, soft nod, two golden sparkles"),
  ("good_02", "thumbs up with the right hand, 'test passed', sparkles"),
  ("happy_01", "eyes shining, both hands clasped at the chest, delighted"),
  ("hop_01", "small hop of joy: crouching slightly, fists in front"),
  ("hop_02", "small hop of joy: in the air, both fists up, big smile, sparkles"),
  ("hop_03", "landing from the hop, hands clasped, beaming"),
  ("applaud_01", "applauding softly, pleased"),
  ("relieved_01", "relieved exhale, hand on the chest, small smile")]),
 ("Row 7 - Worry and discomfort", [
  ("worry_01", "worried eyebrows, hand at the chin"),
  ("worry_02", "anxious, both hands clasped at the chest, one sweat drop"),
  ("doubt_01", "head tilted, doubtful, small question mark"),
  ("sigh_01", "sighing, shoulders dropped, small grey puff"),
  ("disappoint_01", "disappointed, eyes lowered, lips pressed"),
  ("bad_01", "wincing, one blue sweat drop"),
  ("frown_01", "frowning slightly, arms crossed over the chest"),
  ("uneasy_01", "uneasy, glancing aside, hands clasped low, uncomfortable")]),
]

# ---------------------------------------------------------------- sheet B – cam nam + cu chi
B = [
 ("Row 1 - Checklist sheet and pen (checklist in the left hand, pen in the right)", [
  ("check_hold_01", "holding the checklist in both hands at chest height, reading"),
  ("check_tick_01", "ticking an item with the pen"),
  ("check_tick_02", "ticking the next item, small satisfied nod"),
  ("check_flag_01", "circling an item, frowning slightly, a gap found"),
  ("check_tap_01", "tapping the pen against the checklist, thinking"),
  ("check_show_01", "turning the checklist to the right to show it"),
  ("check_give_01", "handing the checklist forward with both hands"),
  ("check_hug_01", "hugging the checklist to the chest, small proud smile")]),
 ("Row 2 - Documents: comparing what was agreed with what was built", [
  ("doc_read_01", "reading an open folder held in both hands"),
  ("doc_read_02", "reading the open folder, flipping a page"),
  ("doc_compare_01", "holding two pages side by side, one in each hand, comparing"),
  ("doc_compare_02", "still holding the two pages, eyebrows raised, a mismatch"),
  ("doc_raise_01", "raising one page and pointing at a line on it, 'this sentence reads two ways'"),
  ("doc_stack_01", "carrying an untidy stack of papers in both arms"),
  ("doc_give_01", "extending a closed folder forward with both hands"),
  ("doc_give_02", "folder handed over, hands returning, polite smile")]),
 ("Row 3 - Talking and listening (dialogue loops, hands free)", [
  ("talk_01", "talking, right hand open at chest height, polite"),
  ("talk_02", "talking, both hands slightly open, explaining step by step"),
  ("talk_03", "talking, index finger lightly raised, 'but...'"),
  ("talk_04", "talking, hand returning down, small reassuring smile"),
  ("listen_01", "listening, hands loosely clasped in front"),
  ("listen_02", "listening, head tilted, one hand at the chin"),
  ("nod_01", "nodding, eyes half closed"), ("nod_02", "chin back up after the nod")]),
 ("Row 4 - Objections and quality gates (hands free)", [
  ("object_01", "raising one hand at shoulder height, hesitant but determined to object"),
  ("firm_01", "firm but polite, small head shake, eyes closed"),
  ("caution_01", "index finger raised beside the face, 'wait, it is not defined yet'"),
  ("two_ways_01", "both palms up side by side, weighing two interpretations"),
  ("two_ways_02", "tilting the head toward the higher palm, puzzled"),
  ("gate_stop_01", "palm pushed forward, firm, 'no-go'"),
  ("gate_stop_02", "forearms crossed in an X in front of the chest, 'not yet'"),
  ("gate_go_01", "OK sign with the right hand, confident small smile, 'go'")]),
 ("Row 5 - Phone", [
  ("phone_read_01", "reading the phone, neutral"),
  ("phone_read_02", "reading the phone, worried frown"),
  ("phone_type_01", "typing a careful message with both thumbs"),
  ("phone_show_01", "turning the phone screen toward the right to show a chat thread"),
  ("phone_call_01", "phone at the ear, listening, nodding"),
  ("alert_01", "reading an alert on the phone, shocked, exclamation mark"),
  ("alert_02", "phone lowered, determined face"),
  ("phone_pocket_01", "putting the phone into the cardigan pocket")]),
 ("Row 6 - Proposing the testing tool with a tablet", [
  ("tab_hold_01", "holding the tablet at chest height with both hands"),
  ("tab_present_01", "turning the tablet screen to the right, proposing"),
  ("tab_present_02", "tablet turned, pointing at the screen with the free hand"),
  ("tab_swipe_01", "swiping on the tablet screen, which faces the viewer"),
  ("propose_01", "open palm forward, earnest proposal"),
  ("propose_02", "hands pressed together in front, 'please consider it'"),
  ("count_01", "one finger up, first option"),
  ("count_02", "three fingers up, three options")]),
 ("Row 7 - Thinking, stances, coffee", [
  ("think_01", "hand at the chin, looking up"), ("think_02", "eyes closed, finger tapping the lips"),
  ("inspect_01", "leaning forward, eyes narrowed, inspecting closely"),
  ("crossarms_01", "arms crossed, calm, waiting for an answer"),
  ("front_hands_01", "hands politely folded in front, standing straight, ready"),
  ("point_01", "open hand gesturing forward, 'your decision'"),
  ("coffee_01", "holding a coffee mug with both hands"),
  ("coffee_02", "sipping the coffee, eyes closed")]),
]

# ---------------------------------------------------------------- sheet C – canh lam viec (noi that ben PHAI)
C = [
 ("Row 1 - Own desk, manual testing (desk, monitor and office chair invisible; the desk is on the RIGHT; same seat height)", [
  ("desk_type_01", "seated, typing test steps"), ("desk_type_02", "typing, glancing at the monitor"),
  ("desk_bug_01", "leaning toward the monitor, eyes wide, small exclamation mark, a bug"),
  ("desk_log_01", "typing a bug report, focused"),
  ("desk_frown_01", "frowning at the monitor, hand at the chin"),
  ("desk_pass_01", "small fist pump, sparkles, all tests pass"),
  ("desk_turn_01", "swiveled on the chair to face the viewer, talking over the shoulder"),
  ("desk_stand_01", "pushing the chair back, starting to stand")]),
 ("Row 2 - Regression late at night at the desk (desk, lamp and chair invisible; warm lamp light from the right on the "
  "character only; background stays transparent)", [
  ("night_type_01", "typing late at night, tired eyes"),
  ("night_type_02", "typing, head drooping slightly"),
  ("night_rub_01", "rubbing the eyes with one hand"),
  ("night_yawn_01", "yawning, hand over the mouth"),
  ("night_coffee_01", "holding a mug, eyes on the monitor"),
  ("night_sleep_01", "asleep with the head on folded arms on the desk, small Zzz"),
  ("night_sleep_02", "asleep, slightly different breathing pose"),
  ("night_wake_01", "jolting awake, eyes wide")]),
 ("Row 3 - Seated at an invisible round meeting table on the RIGHT (same seat height)", [
  ("meet_table_talk_01", "talking with an open hand"),
  ("meet_table_talk_02", "explaining calmly, both hands on the table"),
  ("meet_table_note_01", "taking minutes with a pen in a notebook on the table"),
  ("meet_table_note_02", "writing, looking up to listen"),
  ("meet_table_show_01", "pointing at a line in an open folder lying on the table"),
  ("meet_table_listen_01", "listening, hands folded on the table"),
  ("meet_table_worry_01", "worried glance aside, one sweat drop"),
  ("meet_table_agree_01", "nodding with a relieved smile")]),
 ("Row 4 - One-on-one on an invisible chair, no table (team assessment)", [
  ("oneone_talk_01", "talking calmly, open hand"),
  ("oneone_talk_02", "hand on the chest, sincere"),
  ("oneone_listen_01", "listening, hands on the knees"),
  ("oneone_sigh_01", "looking down, small sigh"),
  ("oneone_hope_01", "leaning forward slightly, hopeful eyes"),
  ("oneone_relieved_01", "relieved smile, shoulders relaxed"),
  ("oneone_nod_01", "grateful nod"),
  ("oneone_own_01", "hand on the chest, firm small nod, accepting responsibility")]),
 ("Row 5 - Whiteboard on the RIGHT (invisible; the arm reaches toward it)", [
  ("wb_write_01", "writing with a marker, arm raised"),
  ("wb_write_02", "underlining a key point"),
  ("wb_sticky_01", "sticking a sticky note onto the board"),
  ("wb_sticky_02", "pressing the sticky note flat with the fingertips"),
  ("wb_point_01", "pointing at the board with the marker"),
  ("wb_explain_01", "half turned to the viewer, marker in hand, explaining"),
  ("wb_explain_02", "half turned to the viewer, explaining with an open palm"),
  ("wb_review_01", "one step back from the board, hand at the chin, reviewing")]),
 ("Row 6 - Release go / no-go (standing)", [
  ("release_check_01", "reviewing the release checklist with a pen, serious"),
  ("release_check_02", "ticking the last item, careful"),
  ("release_nogo_01", "checklist in the left hand, right palm raised firmly, 'we can't release yet'"),
  ("release_nogo_02", "serious slow head shake, checklist lowered"),
  ("release_go_01", "nodding, pointing forward with an open hand, 'go'"),
  ("release_go_02", "thumbs up, bright smile, sparkles"),
  ("release_report_01", "handing over a stack of test report pages with both hands"),
  ("release_watch_01", "standing, arms crossed, tense, watching a monitor on the RIGHT")]),
 ("Row 7 - Incident and lost test data (standing)", [
  ("incident_lap_01", "typing fast on an open laptop balanced on the left forearm, sweat drop"),
  ("incident_lap_02", "reading the laptop, grim"),
  ("incident_calc_01", "counting on the fingers, grim, estimating the recovery time"),
  ("support_01", "gentle hand reaching to an offscreen shoulder on the right, supportive"),
  ("support_02", "palms down, calm reassuring smile, 'we'll fix it together'"),
  ("checklist_write_01", "writing a new deploy checklist with a pen"),
  ("checklist_write_02", "adding one more line, focused"),
  ("checklist_show_01", "holding up the finished checklist with both hands, proud")]),
]

# ---------------------------------------------------------------- sheet E – ownership, ap luc, bien the kiet suc (8x4)
E = [
 ("Row 1 - Owning quality and merging the process", [
  ("own_01", "hand on the chest, accepting ownership of quality"),
  ("own_02", "confident nod, hands lightly on the hips"),
  ("merge_01", "gathering loose pages into one neat stack"),
  ("merge_02", "tapping the stack edges straight on an invisible surface"),
  ("handoff_01", "handing the unified checklist forward to the team"),
  ("proud_01", "quietly proud smile, hands clasped in front"),
  ("determined_01", "both fists in front, determined"),
  ("determined_02", "folding the sleeves higher, ready to work")]),
 ("Row 2 - Deadline and overtime pressure", [
  ("weary_01", "rubbing the eyes, tired"), ("weary_02", "long yawn, hand over the mouth"),
  ("weary_03", "slumped shoulders, holding a mug, faint dark circles"),
  ("stress_01", "both hands on the head, overwhelmed, sweat drops"),
  ("stress_02", "staring at the checklist, sweat drop, too many items left"),
  ("rushed_01", "checking the wristwatch, sweat drop, out of time"),
  ("tense_01", "biting the lip, clutching the checklist to the chest, worried about the old flows"),
  ("exhausted_01", "head down, arms hanging, small grey puff")]),
 ("Row 3 - OUTFIT FOR THIS ROW: same outfit after two weeks of overtime: hair messier, faint dark circles, cardigan "
  "slipping off one shoulder, shirt half untucked, slouched. Tired idle + tired talk", [
  ("tired_idle_01", "slouched idle 1/4, checklist hanging from one hand"),
  ("tired_idle_02", "slouched idle 2/4"), ("tired_idle_03", "slouched idle 3/4, eyes half closed"),
  ("tired_idle_04", "slouched idle 4/4"),
  ("tired_talk_01", "talking wearily, low hand gesture"), ("tired_talk_02", "talking, forced smile"),
  ("tired_talk_03", "talking, rubbing the neck"), ("tired_talk_04", "talking, sighing")]),
 ("Row 4 - Tired outfit as row 3. Tired walk cycle, dragging feet, checklist hanging from one hand", [
  ("tired_walk_01", "contact right"), ("tired_walk_02", "down"), ("tired_walk_03", "passing"),
  ("tired_walk_04", "up"), ("tired_walk_05", "contact left"), ("tired_walk_06", "down"),
  ("tired_walk_07", "passing"), ("tired_walk_08", "up")]),
]

# ---------------------------------------------------------------- sheet D – chan dung hoi thoai
D = [
 ("Row 1", [("face_neutral", "neutral, attentive"), ("face_polite_smile", "polite small smile"),
            ("face_warm", "warm friendly smile"), ("face_bright", "bright happy smile, sparkles")]),
 ("Row 2", [("face_laugh", "laughing softly, eyes closed"), ("face_serious", "serious, straight mouth"),
            ("face_focused", "focused, eyes slightly narrowed"), ("face_cautious", "cautious, index finger raised into the frame")]),
 ("Row 3", [("face_worried", "worried, eyebrows tilted"), ("face_anxious", "anxious, sweat drop"),
            ("face_doubtful", "doubtful, head tilted, small question mark"), ("face_thinking", "thinking, eyes looking up")]),
 ("Row 4", [("face_surprised", "surprised, eyebrows up, mouth open"), ("face_frown", "frowning, displeased"),
            ("face_firm", "firm, determined, lips pressed"), ("face_sigh", "sighing, eyes closed, small grey puff")]),
 ("Row 5", [("face_tired", "tired, faint dark circles"), ("face_relieved", "relieved, soft smile"),
            ("face_hopeful", "hopeful, shining eyes"), ("face_sympathetic", "sympathetic, soft sad smile")]),
]

SHEETS = [
 {"id": "A", "key": "master", "cols": 8, "rows": 7, "attach": "photo+pm", "grid": A, "portrait_first": True,
  "task": "framed portrait, idle, back view, walk and run cycles, chair, gathering documents, sofa after overtime, "
          "positive and worried reactions",
  "title": "Master: chân dung, đứng, đi, chạy, ngồi, nhặt tài liệu, sofa sau OT, cảm xúc"},
 {"id": "B", "key": "hands_gestures", "cols": 8, "rows": 7, "attach": "master", "grid": B,
  "task": "checklist and pen, comparing documents, talking and listening, objections and quality gates, phone, "
          "proposing a tool with a tablet, thinking and coffee",
  "title": "Checklist, đối chiếu tài liệu, nói/nghe, phản biện – cổng chất lượng, điện thoại, đề xuất công cụ, suy nghĩ"},
 {"id": "C", "key": "work_scenes", "cols": 8, "rows": 7, "attach": "master", "grid": C,
  "task": "manual testing at the own desk, regression at night, meeting table, one-on-one, whiteboard, release "
          "go/no-go, incident and lost test data",
  "title": "Bàn test ngày/đêm, bàn họp, 1-1, bảng trắng, go/no-go, sự cố + mất dữ liệu test"},
 {"id": "E", "key": "ownership_tired", "cols": 8, "rows": 4, "aspect": "3:2", "attach": "master", "grid": E,
  "task": "owning quality and merging the process, deadline pressure, and an exhausted variant",
  "title": "Ownership chất lượng, áp lực deadline/OT, biến thể kiệt sức"},
 {"id": "D", "key": "portraits", "cols": 4, "rows": 5, "attach": "master", "grid": D, "portrait": True,
  "task": "20 framed facial-expression portraits for a dialogue box", "title": "20 chân dung hộp thoại"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that (id cua bo PM)
def P(id, at="grip", z="front"): return {"prop": id, "at": at, "z": z}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
CHAIR, MCHAIR, SOFA = F("office_chair"), F("meeting_chair"), F("sofa")
DESK, MTABLE = F("desk_monitor", z="front"), F("meeting_table", z="front")
WB = F("whiteboard", "beside")                     # pm_compose: noi that khong co diem ngoi -> dat ben phai
CHECK, CHECK2, PEN = P("checklist_sheet"), P("checklist_sheet", "grip2"), P("pen")
RULES = [  # (regex, bindings) – khop dau tien
 (r"^portrait$|^face_", []),
 (r"^idle_|^walk_|^run_|startle_01|^tired_idle|^tired_walk|stress_02|tense_01|handoff_01|^check_(hold|show|give|hug)|checklist_show", [CHECK]),
 (r"^check_|release_check|checklist_write", [CHECK2, PEN]),
 (r"^sit_01$", [F("office_chair", "beside")]),
 (r"^sit_", [CHAIR]),
 (r"crouch_01", [P("papers_scattered", "ground_front")]),
 (r"crouch_02", [P("papers_scattered", "ground_front"), P("paper_stack")]),
 (r"crouch_03|doc_stack|merge_|release_report", [P("paper_stack")]),
 (r"^slump_|^lie_|^getup_", [SOFA]),
 (r"doc_read", [P("folder_open")]),
 (r"doc_compare", [P("contract_sheet"), P("checklist_sheet", "grip2")]),
 (r"doc_raise", [P("contract_sheet")]),
 (r"doc_give_01", [P("folder_closed")]),
 (r"phone_show", [P("phone_screen")]),
 (r"^phone_|^alert_", [P("phone_back")]),
 (r"tab_present", [P("tablet_screen_34")]),
 (r"tab_swipe", [P("tablet_screen_front")]),
 (r"^tab_", [P("tablet_back")]),
 (r"^coffee_", [P("mug_steam")]),
 (r"weary_03", [P("mug_plain")]),
 (r"desk_turn", [CHAIR]),
 (r"^desk_", [CHAIR, DESK]),
 (r"night_coffee", [CHAIR, DESK, P("mug_steam")]),
 (r"^night_", [CHAIR, DESK, P("lamp_on", "surface:desk_monitor")]),
 (r"meet_table_note", [MCHAIR, MTABLE, PEN, P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_show", [MCHAIR, MTABLE, P("folder_open", "surface:meeting_table")]),
 (r"^meet_table_", [MCHAIR, MTABLE]),
 (r"^oneone_", [MCHAIR]),
 (r"wb_sticky", [P("sticky_notes"), WB]),
 (r"wb_review|wb_explain_02", [WB]),
 (r"^wb_", [P("marker"), WB]),
 (r"release_nogo_01", [CHECK2]),
 (r"release_nogo_02", [CHECK]),
 (r"release_watch", [F("desk_monitor", "beside")]),
 (r"incident_lap", [P("laptop_open_34")]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green"}
WORD = {"checklist": "checklist", "contract": "page", "folder": "folder", "paper": "papers", "laptop": "laptop",
        "tablet": "tablet", "phone": "phone", "notebook": "notebook", "pen": "pen", "marker": "marker",
        "sticky": "sticky notes", "mug": "mug"}
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
        LAYOUT(s), OBJECT_RULE, "CELLS:\n" + rows_text(s), NEG])

FPS = {"idle": (6, True), "walk": (10, True), "run": (14, True), "greet": (6, False), "sit": (8, False),
       "crouch": (6, False), "slump": (4, False), "getup": (6, False), "stretch": (5, False), "good": (6, False),
       "hop": (10, False), "worry": (4, True), "check_tick": (6, False), "doc_read": (3, True),
       "doc_compare": (4, False), "doc_give": (6, False), "talk": (6, True), "listen": (3, True), "nod": (6, False),
       "two_ways": (4, True), "gate_stop": (6, False), "phone_read": (3, True), "alert": (6, False),
       "tab_present": (6, False), "propose": (6, False), "count": (4, False), "think": (4, True), "coffee": (3, False),
       "desk_type": (8, True), "night_type": (6, True), "night_sleep": (2, True), "meet_table_talk": (6, True),
       "meet_table_note": (6, True), "oneone_talk": (6, True), "wb_write": (6, True), "wb_sticky": (6, False),
       "wb_explain": (5, False), "release_check": (6, False), "release_nogo": (6, False), "release_go": (6, False),
       "incident_lap": (8, True), "support": (6, False), "checklist_write": (6, True), "own": (6, False),
       "merge": (6, False), "determined": (6, False), "weary": (4, False), "stress": (5, True),
       "tired_idle": (4, True), "tired_talk": (5, True), "tired_walk": (7, True)}

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

# ---------------------------------------------------------------- bam kich ban: MOI O phai co mat o day
# (canh, nhip, thoai / dien bien theo docs/KICH_BAN_ROLECRAFT_PM60.md, chuoi animation va chan dung)
SCENES = [
 ("L1 S01 Tiếp quản", "Vào cảnh", "Ngày 1 · khu vực làm việc, PM gặp team lần đầu", "walk → idle → greet · face_polite_smile"),
 ("L1 S01 Tiếp quản", "Mở cảnh", "Lan: “Nhưng tài liệu chưa phản ánh hết những gì team đang làm.”", "listen_02 (Huy nói) → doc_read → doc_compare → talk_03 · face_cautious"),
 ("L1 S01 Tiếp quản", "A", "Review một ngày → sơ đồ hệ thống, phạm vi, checklist rủi ro", "wb_write → wb_point_01 → wb_sticky → wb_review_01 → check_tick → check_give_01 · face_focused"),
 ("L1 S01 Tiếp quản", "B", "Lan: “Em vẫn lo vài giả định cũ chưa được kiểm tra.”", "worry_01 → check_flag_01 · face_worried"),
 ("L1 S01 Tiếp quản", "C", "PM tự đọc tài liệu ngoài giờ", "doc_stack_01 → doc_give · face_anxious"),
 ("L1 S03 Thay đổi phạm vi", "Mở cảnh", "Lan: “Hai chức năng này nằm ngoài phạm vi đã xác nhận.”", "meet_table_show_01 → meet_table_talk · face_cautious"),
 ("L1 S03 Thay đổi phạm vi", "A / B / C", "(PM, Anh Hiệp nói)", "A: meet_table_worry_01 · face_worried · B: meet_table_listen_01 · C: meet_table_note → meet_table_agree_01 · face_relieved"),
 ("L1 S04 Quỹ công cụ", "Mở cảnh", "Lan: “Team đang quản lý test case thủ công. Em đề xuất mua bộ công cụ.”", "tab_hold_01 → tab_swipe_01 → tab_present → propose · face_hopeful"),
 ("L1 S04 Quỹ công cụ", "Hệ thống", "Đầy đủ 15 · dùng chung 5 · miễn phí 0 điểm", "count · face_thinking → point_01 (chờ PM quyết)"),
 ("L1 S04 Quỹ công cụ", "A", "Mua đầy đủ", "happy_01 → hop · face_bright → face_laugh"),
 ("L1 S04 Quỹ công cụ", "B", "Chỉ công cụ miễn phí → làm tay", "sigh_01 → desk_type · face_sigh"),
 ("L1 S04 Quỹ công cụ", "C", "Licence dùng chung → điểm nghẽn", "doubt_01 → nod · face_doubtful"),
 ("L1 S04 Quỹ công cụ", "Sau cảnh", "Test tay / test có công cụ", "walk → idle_back_01 (về bàn) → sit → desk_type → desk_bug_01 → desk_log_01 → desk_frown_01 / desk_pass_01 → desk_turn_01 → desk_stand_01"),
 ("L2 S05 Hai dự án", "Mở cảnh + nhánh", "(QA_BA có mặt; Anh Minh, Huy, Nam nói)", "meet_table_listen_01 · A: meet_table_note · B: meet_table_worry_01 · face_worried · C: meet_table_agree_01"),
 ("L2 S05 Hai dự án", "B → team_ot_14_days", "Dẫn truyện: Hai tuần OT liên tục. Cả team kiệt sức.", "night_type → night_rub_01 → night_yawn_01 → night_coffee_01 → night_sleep → night_wake_01 · face_tired; từ đây idle/talk/walk → tired_idle / tired_talk / tired_walk"),
 ("L2 S05 Hai dự án", "B → sáng hôm sau", "", "slump → lie_01 → getup → stretch · face_tired"),
 ("L2 S05 Hai dự án", "Áp lực OT", "", "weary → stress_01 → rushed_01 → exhausted_01 · face_tired"),
 ("L2 S06 Deadline/chất lượng", "Mở cảnh", "(QA_BA có mặt) Huy: phải bỏ vòng regression cuối", "listen_01 → release_check → tense_01 · face_worried"),
 ("L2 S06 Deadline/chất lượng", "A", "Bỏ regression, release đúng hạn", "release_nogo → uneasy_01 → release_watch_01 · face_anxious"),
 ("L2 S06 Deadline/chất lượng", "B", "Delay ba ngày, chạy đủ regression", "night_type → release_report_01 → release_go · face_relieved"),
 ("L2 S06 Deadline/chất lượng", "C", "Test luồng critical, release từng phần", "check_hold_01 → check_tick → two_ways_01 → gate_go_01 · face_focused"),
 ("L2 S08 Complain", "Mở cảnh", "Lan: “Requirement có một câu hiểu được theo hai cách.”", "doc_raise_01 → two_ways · face_cautious"),
 ("L2 S08 Complain", "A", "PM: team đã làm đúng tài liệu", "firm_01 → frown_01 · face_frown"),
 ("L2 S08 Complain", "B", "Lan: “Không làm rõ requirement thì lần sau vẫn sẽ hiểu sai.”", "object_01 → firm_01 · face_firm"),
 ("L2 S08 Complain", "C", "Làm rõ kỳ vọng, chốt tiêu chí nghiệm thu", "meet_table_note → wb_write → wb_explain · face_relieved"),
 ("L3 S09 Incident", "Mở cảnh", "Hệ thống: 14:00 production lỗi (QA_BA có mặt)", "alert → startle_01 → run → incident_lap · face_surprised"),
 ("L3 S09 Incident", "critical_payment_incident", "Cờ regression_test_skipped", "stress_02 → bad_01 · face_anxious"),
 ("L3 S09 Incident", "A / B / C", "(PM nói)", "A: phone_call_01 (xác nhận lỗi với phía khách) → desk_type · B: worry_02 · C: release_watch_01 → breath_01 → relieved_01 · face_relieved"),
 ("L3 S11 Junior gây lỗi", "Mở cảnh", "Lan: “Team sẽ mất gần một ngày để khôi phục.”", "incident_calc_01 · face_sigh"),
 ("L3 S11 Junior gây lỗi", "A", "PM phê bình Nam trước team", "uneasy_01 → disappoint_01 · face_sympathetic"),
 ("L3 S11 Junior gây lỗi", "B", "PM tự xử lý, bỏ qua", "sigh_01 · face_worried"),
 ("L3 S11 Junior gây lỗi", "C", "1-1 và thêm checklist deploy", "support → checklist_write → checklist_show_01 · face_warm"),
 ("L4 S13 Hệ thống vận hành", "Mở cảnh", "Lan: “Checklist và quy trình deploy vẫn nằm rải rác, có bước chỉ nhắc trong nhóm chat.”", "phone_type_01 → phone_show_01 → phone_pocket_01 → crouch → talk_02 · face_serious"),
 ("L4 S13 Hệ thống vận hành", "deployment_checklist_added", "Lan: “Sau sự cố mất dữ liệu test, team đã có checklist deploy mới…”", "check_show_01 → check_tap_01 → caution_01 · face_serious"),
 ("L4 S13 Hệ thống vận hành", "process_gap_unresolved", "Lan: “Lỗ hổng lần trước chưa được xử lý…”", "phone_read_01 → phone_read_02 → worry_02 · face_anxious"),
 ("L4 S13 Hệ thống vận hành", "A", "(Huy: điểm nghẽn cũ sẽ quay lại)", "disappoint_01 · face_sigh"),
 ("L4 S13 Hệ thống vận hành", "B", "Lan: “Em sẽ gộp test checklist và tiêu chí nghiệm thu về một chỗ.”", "merge → check_hug_01 → own · face_bright"),
 ("L4 S13 Hệ thống vận hành", "C", "Mỗi người sở hữu một phần: Lan chất lượng", "own_01 → handoff_01 → applaud_01 · face_warm"),
 ("L4 S14 Phát triển team", "Mở cảnh", "(1-1; Anh Minh, Huy nói)", "oneone_listen_01 · face_neutral"),
 ("L4 S14 Phát triển team", "A", "Lan: “Việc QA ngăn được lỗi sẽ không có ticket nào ghi nhận.”", "oneone_talk → oneone_sigh_01 · face_sigh"),
 ("L4 S14 Phát triển team", "B", "IDP 90 ngày cho từng người", "oneone_hope_01 → oneone_relieved_01 → oneone_nod_01 · face_relieved"),
 ("L4 S14 Phát triển team", "C", "PM: “…Lan được chặn release…”", "oneone_own_01 → gate_stop → proud_01 · face_firm"),
 ("L4 S15 Mở rộng hợp tác", "Mở cảnh", "Lan: “Phạm vi mới chỉ là mong muốn, chưa có tiêu chí nghiệm thu.”", "meet_table_talk → caution_01 · face_cautious"),
 ("L4 S15 Mở rộng hợp tác", "key_developer_left", "Lan: “Hiện tại team chưa có người thay thế hoàn toàn phần kỹ thuật chủ chốt…”", "meet_table_worry_01 · face_worried"),
 ("L4 S15 Mở rộng hợp tác", "A / B / C", "(PM, Huy, Anh Hiệp, Linh nói)", "A: frown_01 · face_worried · B: nod → determined · C: good_01 → meet_table_agree_01 · face_relieved"),
 ("Chuyển ngày", "Bình thường", "", "walk → coffee → sit → desk_type"),
 ("Chuyển ngày", "Chờ quyết định / câu hỏi", "PM đang chọn A/B/C", "think → crossarms_01 → front_hands_01 → inspect_01"),
 ("Popup chỉ số", "Tăng / giảm (khi Lan có mặt)", "", "good / bad_01"),
]
NOTE = ("Lan không có trong S02, S07, S10, S12, S16 và các màn kết thúc (kịch bản mục 2) nên không có sprite cho các cảnh "
        "đó; bản cũ có `cheer`, `congrats`, `bow` cho màn kết — đã bỏ. Mọi ô trong 5 sheet đều xuất hiện trong bảng trên "
        "(`build.py` kiểm tra).")

def anim_refs(text):
    refs = []
    for part in text.replace("·", "→").replace("/", "→").replace("(", " ").replace(")", " ").replace(";", " ").split("→"):
        for tok in part.split():
            if re.fullmatch(r"[a-z][a-z0-9_]+", tok): refs.append(tok)
    return refs

# ---------------------------------------------------------------- SOL one-shot (toi uu token)
SOL = """Work autonomously. Do not ask questions. Keep chat output short.

GOAL: sprite sheets A, B, C, E, D for the game character "Lan – BA/QA".

ATTACHMENTS
1. The photo of the real person (who agreed to this): face source.
2. PM_A_master.png – another character's master sheet: grid, size and style reference only.
3. rolecraft_lan_sprite_prompts.zip – prompts/LAN_*.txt, lan_sprite_manifest.json, tools/.
Props, furniture and icons already exist in the PM set: never generate them.

TOKEN BUDGET RULES (follow strictly)
- Always ask the image tool for a TRANSPARENT background (PNG with alpha). If a sheet still comes back on plain white, do NOT regenerate it: remove the white with tools/make_transparent.py (step below).
- One image call per sheet, using the prompt file text EXACTLY. Do not rewrite, shorten or "improve" prompts. Sheet E is a landscape 3:2 image; all others are square.
- Regenerate a whole sheet ONLY for a HARD FAIL: wrong grid (not the stated columns x rows), figures overlapping or cut off, a face that does not resemble the photo, drawn objects/furniture in many cells, visible text, or a checkerboard pattern / scenery painted as the background. Maximum 1 retry per sheet; keep the better of the two.
- On a retry, append this line to the prompt and nothing else: "GRID CHECK: exactly the stated columns and rows, one figure per cell, nothing crosses a cell edge."
- Everything else is a SOFT issue (a pose slightly off, a missing or extra dot, small color drift): do not regenerate, just list it.
- Never regenerate a sheet that passed. Never regenerate A after B has started.
- Do not describe images or repeat prompts in chat. After each sheet print one line: `<sheet> | attempts | PASS / FAIL: reason`.

STEPS
1. Unzip; read the manifest (file names) and prompts.
2. Sheet A: LAN_A_master.txt with Image 1 = the photo, Image 2 = PM_A_master.png.
3. Sheets B, C, E, D: their prompt files with Image 1 = approved LAN_A_master.png, Image 2 = the photo.
4. Save to sheets/ with the manifest file names. Make every saved sheet transparent (no image call needed):
   python3 tools/make_transparent.py sheets/*.png
   Then run once:
   python3 tools/extract_anchors.py --manifest lan_sprite_manifest.json --sheets sheets --out build
5. Read build/report.json. Only for a ROW where 3 or more cells report "missing ... marker", make ONE edit call on that sheet with the ROW FIX prompt below (max 2 row fixes in total for the whole job), then run the script once more. Leave all other warnings as they are.
6. DELIVER: show the final sheets; one file rolecraft_lan_sprites.zip with sheets/, build/, lan_sprite_manifest.json, tools/pm_compose.js; a table: sheet, attempts, result, remaining warnings.

ROW FIX PROMPT (Image 1 = LAN_A_master.png, Image 2 = the sheet to fix):
"Edit Image 2: redraw ONLY row {N}; keep every other row pixel-identical. Same character as Image 1. Draw no objects or furniture: empty hands in the grip pose. Add the marker dots exactly as tagged: {paste the Row N line from the prompt file}. Dots are small solid flat circles: MAGENTA #FF00FF, GREEN #00FF00, CYAN #00FFFF."

If you run out of room, stop after the last finished step and write: "Resume from step X."
"""

# ---------------------------------------------------------------- README
def cell_table(s):
    L = ["| # | Tên | Mô tả |", "|---:|---|---|"]
    for c in cells(s):
        tag = "" if s.get("portrait") or c["name"] == "portrait" else marker_tag(c["name"])
        L.append(f"| {c['index']} | `lan/{c['name']}` | {c['desc']}{tag} |")
    return L

KNOWN = set()
def mapping_md():
    L = ["Tên là **nhóm animation** `lan/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `lan/<ô>_01`; `face_*` là chân dung "
         "hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng ghi "
         "“(… nói)” là phản ứng của Lan khi người khác nói.", "",
         "| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anim in SCENES:
        a = re.sub(r"\b([a-z][a-z0-9_]{2,})\b", lambda m: f"`{m.group(1)}`" if m.group(1) in KNOWN else m.group(1), anim)
        L.append(f"| {sc} | {beat} | {line} | {a} |")
    L += ["", NOTE]
    return "\n".join(L)

def readme(man):
    n_cells = sum(len(s["cells"]) for s in man["sheets"])
    L = ["# RoleCraft PM60 – Bộ prompt sprite Lan v4 (BA/QA)", "",
         "Sinh bởi `rolecraft_lan_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.", "",
         f"**{len(man['sheets'])} sheet / {n_cells} ô / {len(man['animations'])} animation**, đầy đủ các nhóm như bộ PM "
         "(đứng, đi, chạy, ngồi, cúi nhặt, sofa, làm đêm, sự cố, bộ kiệt sức) nhưng **mỗi ô đều gắn với một câu thoại hoặc "
         "một cảnh Lan có mặt** trong kịch bản (mục 5). Đồ vật (P), nội thất (O), icon (F) dùng lại của bộ PM.", "",
         "## Thay đổi so với bản cũ", "",
         "- **Quay PHẢI** như PM, nội thất bên phải: dùng thẳng ghế, bàn, bảng trắng, sofa của bộ PM. Khi Lan đứng đối "
         "diện PM, game lật cả cụm: `pc.draw(ctx, key, x, y, s, { flip: true })`. (Bản cũ quay trái, bind `beside_left` "
         "mà `pm_compose.js` không hỗ trợ.)",
         "- **Bám kịch bản thống nhất**: bản cũ trích thoại bản chi tiết cũ (có cảnh S02 nhắn tin, “test report từng ngày”, "
         "màn kết chúc mừng…) — nay mỗi dòng mapping là một câu hoặc một cảnh có `QA_BA` trong `KICH_BAN_ROLECRAFT_PM60.md`; "
         "ô không có cảnh nào dùng thì bỏ (`cheer`, `congrats`, `bow`, `sit_07`…).",
         "- Thêm theo kịch bản: chạy tới sự cố (S09), cúi gom tài liệu rải rác (S13), nhảy mừng khi mua công cụ (S04 A), "
         "sofa + làm regression đêm (S05 B `team_ot_14_days`, S06 B), cho xem nhóm chat (S13), gộp checklist (S13 B), "
         "nhận quyền chặn release (S14 C), bộ kiệt sức (sheet E).",
         "- Sheet **E 8×4 ảnh ngang 3:2** (không độn ô cho đủ 56). Prompt ngắn; quy tắc tiết kiệm token trong "
         "`SOL_ONE_SHOT_PROMPT.txt`.", "",
         "## 1. Thứ tự sinh và ảnh đính kèm", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    att = {"photo+pm": "ảnh thật + `PM_A_master.png`", "master": "`LAN_A` đã duyệt + ảnh thật"}
    for s in SHEETS:
        L.append(f"| {s['id']} ({s['cols']}×{s['rows']}) | `prompts/LAN_{s['id']}_{s['key']}.txt` | {att[s['attach']]} | {s['title']} |")
    L += ["", "**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm ảnh thật, `sheets/PM_A_master.png` và zip "
          "thư mục `rolecraft_lan_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi một lần. Mỗi sheet 1 lần sinh, chỉ "
          "sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, không giống ảnh thật, có chữ, nền vẽ ô caro giả; nền trắng thì chỉ chạy `tools/make_transparent.py`, không sinh lại); lỗi nhỏ "
          "ghi lại chứ không sinh lại; sửa chấm neo theo **hàng**, tối đa 2 lần cho cả bộ.", "",
          "**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm các sheet còn lại.", "",
          "## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)", "",
          "> ✅ Đúng lưới (A, B, C: 8×7 vuông; E: 8×4 ảnh ngang; D: 4×5), mỗi ô một hình toàn thân, không dính ô bên, **nền trong suốt** (không trắng, không ô caro vẽ giả).",
          ">",
          "> ✅ Nhận ra người thật; sơ mi xanh mint, cardigan be, thẻ xanh royal; ô 1 sheet A là chân dung khung xanh nhạt.",
          ">",
          "> ✅ Không vẽ đồ vật/nội thất (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.",
          ">",
          "> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.", "",
          "## 3. Dùng tool", "",
          "```bash",
          "cd docs/LAN/rolecraft_lan_sprite_prompts",
          "python3 tools/extract_anchors.py --manifest lan_sprite_manifest.json --sheets sheets --out build",
          "```", "",
          "Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*`) gộp với `anchors.json` của bộ này (`lan/*`), "
          "rồi `PMCompose.create(anchors, manifest, base)`.", "",
          "## 4. Gắn kết ô → đồ vật / nội thất (bộ PM)", "",
          "| Nhóm tư thế | Đồ vật | Nội thất |", "|---|---|---|",
          "| idle, walk, run, startle_01, tired_idle, tired_walk, check_hold/show/give/hug, checklist_show, stress_02, tense_01, handoff_01, release_nogo_02 | checklist_sheet | |",
          "| check_tick/flag/tap, release_check, checklist_write | checklist_sheet (tay trái) + pen | |",
          "| crouch | papers_scattered trên sàn, paper_stack trên tay | |",
          "| doc_stack, merge, release_report | paper_stack | |",
          "| doc_read / doc_compare / doc_raise / doc_give_01 | folder_open / contract_sheet + checklist_sheet / contract_sheet / folder_closed | |",
          "| phone_show_01 | phone_screen (vẽ nhóm chat lên vùng màn hình) | |",
          "| phone_*, alert_* | phone_back | |",
          "| tab_* | tablet_back; tablet_screen_34 (present); tablet_screen_front (swipe) | |",
          "| coffee, night_coffee / weary_03 | mug_steam / mug_plain | |",
          "| incident_lap | laptop_open_34 | |",
          "| sit_*, desk_turn | | office_chair |",
          "| desk_* / night_* | lamp_on trên bàn (night) | office_chair + desk_monitor |",
          "| slump, lie, getup | | sofa |",
          "| meet_table_* | pen + notebook_open (note), folder_open trên bàn (show) | meeting_chair + meeting_table |",
          "| oneone_* | | meeting_chair |",
          "| wb_* | marker; sticky_notes (wb_sticky) | whiteboard (bên phải) |",
          "| release_watch_01 | | desk_monitor (bên phải) |", "",
          "## 5. Mapping kịch bản → sprite", "", mapping_md(), "",
          "## 6. Chi tiết từng sheet", ""]
    for s in SHEETS:
        L += [f"### Sheet {s['id']} – {s['title']}", ""] + cell_table(s) + [""]
    return "\n".join(L)

# ---------------------------------------------------------------- main
def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    for f in os.listdir(f"{OUT}/prompts"):
        if f.startswith("LAN_") and f.endswith(".txt"): os.remove(f"{OUT}/prompts/{f}")
    man = {"version": 4, "character": {"id": "LAN", "role": "QA_BA", "name": "Lan – BA/QA"},
           "shared": {"note": "prop/*, furn/*, icon/* dùng lại sheet P, O, F của bộ PM (docs/PM)"},
           "facing": "right",
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF"},
           "sheets": [], "animations": {}}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/LAN_{s['id']}_{s['key']}.txt", "w", encoding="utf-8").write(prompt(s) + "\n")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"lan/{c['name']}"
            b = bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
        sh = {"id": s["id"], "key": s["key"], "kind": "lan", "file": f"LAN_{s['id']}_{s['key']}.png",
              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl}
        if s.get("aspect"): sh["aspect"] = s["aspect"]
        man["sheets"].append(sh)
        if s.get("portrait"): continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (6, False) if len(fr) > 1 else (1, False))
            man["animations"][f"lan/{k}"] = {"frames": [f"lan/{f}" for f in fr], "fps": fps, "loop": loop}
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
    json.dump(man, open(f"{OUT}/lan_sprite_manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(f"{OUT}/SOL_ONE_SHOT_PROMPT.txt", "w", encoding="utf-8").write(SOL)
    open(f"{OUT}/mapping_section.md", "w", encoding="utf-8").write(mapping_md() + "\n")
    md = readme(man)
    for p in (f"{OUT}/README_LAN_SPRITE_PROMPTS.md", os.path.join(OUT, "..", "README_LAN_SPRITE_PROMPTS.md")):
        open(p, "w", encoding="utf-8").write(md + "\n")
    n = sum(len(s["cells"]) for s in man["sheets"])
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} dong mapping, 0 o thua")

if __name__ == "__main__":
    main()
