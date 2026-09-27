# -*- coding: utf-8 -*-
# Bo prompt sprite HUY v4 (SENIOR_DEV) – day du nhu bo PM: 5 sheet nhan vat (A, B, C, E + D chan dung da co) + sheet P
# do vat rieng cua Huy. Cung co che v3: ve tay khong + cham neo, ghep do vat/noi that bang pm_compose.js.
# Huy quay PHAI nhu PM de dung chung ghe, ban, bang trang cua bo PM; game lat ca cum (flip) khi Huy dung doi dien PM.
# Nhan dien lay tu sheet Huy da duyet (HUY_B, HUY_D cu), KHONG dung anh nguoi that.
# Noi dung o va mapping bam docs/KICH_BAN_ROLECRAFT_PM60.md.
#     python build.py   -> prompts/HUY_*.txt, huy_sprite_manifest.json, SOL_ONE_SHOT_PROMPT.txt,
#                          mapping_section.md, README_HUY_SPRITE_PROMPTS.md (ca ban o docs/HUY/)
import copy, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT", HERE)

# ---------------------------------------------------------------- van ban chung (ngan, khong lap y)
WHO = ("Huy, the team's senior backend developer: the fastest and most knowledgeable on the team, confident, "
       "a little stubborn, carries most of the critical work")

ATTACH_A = ("ATTACHED IMAGES: Image 1 (old Huy gesture sheet) and Image 2 (Huy portrait sheet) show THIS character: copy "
"his face, hair, outfit, colors and chibi proportions exactly; ignore their layout and any objects drawn in them. Image 3 "
"is the master sheet of ANOTHER character (the young PM): use it ONLY for the grid layout, sprite size, outline and "
"shading; never copy the PM's face or clothes.")
ATTACH_MASTER = ("ATTACHED IMAGES: Image 1 is the approved master sheet of this character (Huy, Sheet A): match it exactly "
"(face, hair, outfit, colors, proportions, outline, shading, sprite size). Image 2 is his portrait sheet: use it for the "
"face.")
ATTACH_PROPS = ("ATTACHED IMAGE: the approved master sheet of the character. Use it ONLY for art style and scale; do not "
"draw the character.")

CHARACTER = ("CHARACTER (identical in every cell unless a row says otherwise): Huy, about 30, a few years older than the "
"PM. Short thick black hair, slightly messy, falling over the forehead; big dark-brown eyes with a self-assured look; "
"navy-blue short-sleeve polo shirt with a thin red trim on the collar and sleeve cuffs and a small white round logo on "
"the left chest (no text), tucked in; black-charcoal trousers; dark-brown leather shoes. No lanyard, no glasses, no "
"watch. Black over-ear headphones appear ONLY in cells that mention headphones. About 2.5 heads tall, slightly taller "
"and broader than the PM.")

STYLE = ("ART STYLE: cute chibi game sprite, soft high-resolution pixel art: big head, expressive glossy eyes, small nose "
"and mouth, short limbs, clean dark-brown outline (not pure black), soft cel shading, warm natural colors, top-left light. "
"Every full-body figure stands on a small soft grey oval shadow. Small effect icons (sparkles, sweat drop, grey puff, "
"swirl, exclamation or question mark, Zzz) only where a cell asks for them, kept inside the cell.")

def LAYOUT(cols, rows, portrait_first):
    s = (f"LAYOUT (most important): square 1:1 image, fully TRANSPARENT background (PNG with alpha channel): no white, no color, no checkerboard pattern painted in. Exactly {cols} columns x {rows} "
         f"rows = {cols*rows} equal invisible cells, ONE full-body figure per cell (head to shoes, never cut), centred in its "
         "cell, same size in every cell, clear empty gap between neighbours; no arm, icon or shadow crosses a cell edge. In "
         "each row all feet rest on one shared baseline. Figures face RIGHT in a 3/4 view unless a cell says otherwise. "
         "Reading order left to right, top to bottom.")
    if portrait_first:
        s += (" Cell 1 is the only exception: a head-and-shoulders portrait in a rounded-square frame with a thin dark "
              "outline and a soft pastel-blue background with a few sparkles; Huy with a confident half-smile holding a "
              "closed navy laptop with a small white round logo (no text) against his chest. No other cell has a background "
              "or a drawn object.")
    return s

OBJECT_RULE = ("OBJECTS AND FURNITURE ARE ADDED BY CODE, SO NEVER DRAW THEM: no laptop, phone, folder, paper, card, "
"notebook, pen, marker, mug, can, binder, box, chair, sofa, desk, table, monitor, lamp or whiteboard. Draw the empty "
"hand(s) in the exact grip pose, and seated or lying bodies at the right height on invisible furniture. "
"MARKER DOTS, only where a cell has a [markers] tag: small solid flat dots about 1.5% of the cell width drawn on top of "
"the figure. MAGENTA #FF00FF = grip point of the main held object (two hands: midway between them); GREEN #00FF00 = "
"grip point of a second object in the other hand; CYAN #00FFFF = middle of the hips where they touch a seat. Never use "
"these three colors anywhere else.")

NEG = ("DO NOT: add text, letters, numbers or watermark; draw grid lines or cell borders; add scenery, floor or walls; "
"add other characters (the other person in a handshake, meeting, 1-1 or mentoring moment is offscreen); crop limbs; "
"repeat an identical pose; change face, hair, outfit colors or proportions between cells.")

# ---------------------------------------------------------------- sheet A – master (co the)
A = [
 ("Row 1 - Portrait + idle (closed laptop tucked under the left arm)", [
  ("portrait", "[portrait cell, see LAYOUT]"),
  ("idle_01", "idle 1/4: relaxed confident stance"),
  ("idle_02", "idle 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03", "idle 3/4: rolling the neck a little"),
  ("idle_04", "idle 4/4: slight exhale, calm self-assured face"),
  ("idle_back_01", "seen from BEHIND (back view), standing"),
  ("greet_01", "free hand raised briefly in a casual hello, half-smile"),
  ("greet_02", "two-finger salute from the brow, 'hey'")]),
 ("Row 2 - Walk cycle 8 frames, quick confident pace, closed laptop under the left arm, right arm swings", [
  ("walk_01", "contact: right foot forward, heel touching"), ("walk_02", "down: weight on right leg, knee bent"),
  ("walk_03", "passing: left leg passing the right"), ("walk_04", "up: rising on right toes"),
  ("walk_05", "contact: left foot forward, heel touching"), ("walk_06", "down: weight on left leg, knee bent"),
  ("walk_07", "passing: right leg passing the left"), ("walk_08", "up: rising on left toes")]),
 ("Row 3 - Run cycle 8 frames, hurrying to a production incident, leaning forward, closed laptop clutched to the chest, "
  "urgent face", [
  ("run_01", "contact right foot"), ("run_02", "push-off from right foot"), ("run_03", "airborne, legs apart"),
  ("run_04", "landing on left foot"), ("run_05", "contact left foot"), ("run_06", "push-off from left foot"),
  ("run_07", "airborne, legs apart, mirrored"), ("run_08", "landing on right foot")]),
 ("Row 4 - Jump + startle", [
  ("jump_01", "anticipation: crouching, arms back"), ("jump_02", "take-off: arms swinging up"),
  ("jump_03", "rising, knees tucked"), ("jump_04", "peak: both arms up, big open-mouth grin"),
  ("jump_05", "falling, arms coming down"), ("jump_06", "landing: knees bent, arms out for balance"),
  ("startle_01", "small startled hop, eyes wide, closed laptop lifted to the chest, exclamation mark"),
  ("startle_02", "landing from the startle, hand on the chest, sweat drop")]),
 ("Row 5 - Office chair (invisible; same seat height in every seated cell)", [
  ("sit_01", "standing in front of the chair, about to sit"),
  ("sit_02", "dropping casually onto the chair"),
  ("sit_03", "seated upright, hands on the knees"),
  ("sit_04", "seated, leaning far back, hands behind the head, relaxed"),
  ("sit_05", "standing up from the chair, hands on the knees pushing up"),
  ("sit_annoyed_01", "seated, turned toward the viewer, arms crossed, eyes rolling slightly, annoyed"),
  ("sit_smirk_01", "seated, turned toward the viewer, confident smirk, thumbs up"),
  ("sit_nod_01", "seated, turned toward the viewer, calm nod with an open palm, 'that's reasonable'")]),
 ("Row 6 - Office sofa after overtime nights (invisible two-seat sofa; same height in every cell)", [
  ("slump_01", "sitting on the sofa, exhausted, head tilted back"),
  ("slump_02", "sliding sideways down onto the sofa"),
  ("lie_01", "lying on the back, forearm over the eyes, closed laptop resting on the stomach"),
  ("lie_02", "curled up asleep, head on a folded arm, small Zzz"),
  ("lie_03", "lying face down, one arm dangling, drained"),
  ("getup_01", "sitting up groggy on the sofa, rubbing one eye"),
  ("getup_02", "sitting on the sofa edge, stretching both arms"),
  ("getup_03", "standing up from the sofa, refreshed and determined")]),
 ("Row 7 - Full-body reactions", [
  ("good_01", "satisfied smirk, small nod, two golden sparkles"),
  ("good_02", "small fist pump at the chest, sparkles"),
  ("impressed_01", "eyebrows raised, impressed 'oh', small exclamation mark"),
  ("bad_01", "wincing, one blue sweat drop"),
  ("bad_02", "leaning back, grimacing, small dark swirl"),
  ("bad_03", "awkward teeth-clenched grimace, sweat drop"),
  ("sigh_01", "sighing, shoulders dropped, small grey puff"),
  ("sigh_02", "looking down, deflated, hand on the back of the neck")]),
]

# ---------------------------------------------------------------- sheet B – cam nam + cu chi hoi thoai
B = [
 ("Row 1 - Laptop status briefing", [
  ("lap_carry_01", "closed laptop tucked under the left arm, about to report"),
  ("lap_hold_01", "open laptop balanced on the left forearm, looking at the screen"),
  ("lap_type_01", "typing fast with the right hand on the balanced laptop"),
  ("lap_type_02", "typing, glancing up over the laptop"),
  ("lap_show_01", "turning the open laptop so its screen faces right, toward someone, 'here is where we are'"),
  ("lap_show_02", "laptop screen turned right, pointing at the screen with the free hand"),
  ("lap_show_03", "laptop screen turned right, explaining with a small nod"),
  ("lap_close_01", "closing the laptop with one hand, done")]),
 ("Row 2 - Talking and listening (hands free)", [
  ("talk_01", "talking, right hand open at chest height, matter-of-fact"),
  ("talk_02", "talking, both hands shaping a box in the air"),
  ("talk_03", "talking with a small shrug"),
  ("talk_04", "talking, hand returning down, confident smile"),
  ("listen_01", "listening, hands in the trouser pockets"),
  ("listen_02", "listening, head tilted, hand rubbing the chin"),
  ("nod_01", "nodding down, eyes half closed"), ("nod_02", "chin back up after the nod, slight smile")]),
 ("Row 3 - Explaining a technical change, defending, agreeing", [
  ("explain_01", "both hands shaping a box, describing a module"),
  ("explain_02", "one hand drawing an arrow in the air, showing the flow"),
  ("explain_03", "palms up, small shrug, 'the old way was too slow'"),
  ("explain_04", "waving it off casually, 'it's a small change, no review needed'"),
  ("defend_01", "both palms up at chest height, defensive"),
  ("askme_01", "thumb pointing at his own chest, easy smile, 'just ask me'"),
  ("agree_01", "open palm, conceding nod, 'fair enough'"),
  ("agree_02", "thumbs up, relaxed smile, 'deal'")]),
 ("Row 4 - Estimates and risk", [
  ("est_count_01", "holding up one finger, option one"), ("est_count_02", "holding up two fingers"),
  ("est_count_03", "all five fingers spread, 'five more days'"),
  ("est_weigh_01", "both palms up like a scale, weighing two options"),
  ("est_weigh_02", "one palm higher than the other, recommending one"),
  ("est_stop_01", "palm raised forward, firm, 'we can't commit to that yet'"),
  ("warn_01", "index finger raised, eyebrows lowered, warning about a risk"),
  ("headshake_01", "shaking the head no, eyes closed")]),
 ("Row 5 - Phone (the job-offer message)", [
  ("phone_read_01", "reading the phone, neutral"),
  ("phone_read_02", "reading the phone, thoughtful, weighing a job offer"),
  ("phone_hold_01", "phone held at chest level, looking aside, torn"),
  ("phone_type_01", "typing a reply with the thumb"),
  ("phone_call_01", "phone at the right ear, listening, frowning"),
  ("phone_call_02", "phone at the ear, calm, free hand gesturing"),
  ("phone_lower_01", "lowering the phone, sighing"),
  ("phone_pocket_01", "sliding the phone into the trouser pocket")]),
 ("Row 6 - Senior stances and attitude (hands free)", [
  ("pocket_01", "both hands in the pockets, confident"),
  ("lean_01", "weight on one leg, one hand in a pocket, relaxed"),
  ("crossarms_01", "arms crossed, neutral, waiting"),
  ("crossarms_02", "arms crossed, small confident smile"),
  ("annoyed_01", "arms crossed, eyes rolling slightly, annoyed"),
  ("frown_01", "frowning, jaw set, hands on the hips"),
  ("doubt_01", "one eyebrow raised, skeptical, small question mark"),
  ("point_01", "open hand pointing forward, 'your call'")]),
 ("Row 7 - Thinking, stress, coffee", [
  ("think_01", "hand on the chin, looking up"), ("think_02", "eyes closed, finger tapping the temple"),
  ("scratch_01", "scratching the back of the head, awkward"),
  ("facepalm_01", "facepalm, eyes closed"),
  ("stress_01", "rubbing the temples with both hands"),
  ("overload_01", "both hands on the head, overloaded, sweat drops"),
  ("coffee_01", "holding a coffee mug with both hands, steam rising"),
  ("coffee_02", "sipping from the mug, eyes closed")]),
]

# ---------------------------------------------------------------- sheet C – canh lam viec (noi that ben PHAI nhu bo PM)
C = [
 ("Row 1 - Own desk by day (desk, monitor and office chair invisible; the desk is on the RIGHT; same seat height)", [
  ("desk_type_01", "seated typing fast, focused"),
  ("desk_type_02", "typing, glancing at the monitor"),
  ("desk_focus_01", "black over-ear headphones ON the ears, typing intensely"),
  ("desk_bug_01", "frowning at the monitor, hand on the chin"),
  ("desk_fixed_01", "small fist pump at the monitor, sparkles"),
  ("desk_turn_01", "swiveled on the chair to face the viewer, one arm on the backrest, talking over the shoulder"),
  ("desk_wave_01", "swiveled toward the viewer, waving it off casually, 'it's small'"),
  ("desk_stand_01", "pushing the chair back, starting to stand")]),
 ("Row 2 - Overtime at the desk at night (desk, lamp and chair invisible; warm lamp light from the right on the "
  "character only; background stays transparent)", [
  ("night_type_01", "typing late at night, tired eyes"),
  ("night_type_02", "typing, head drooping slightly"),
  ("night_rub_01", "rubbing the eyes with one hand"),
  ("night_yawn_01", "big yawn"),
  ("night_drink_01", "drinking from a can, eyes on the monitor"),
  ("night_sleep_01", "asleep with the head on folded arms on the desk, small Zzz"),
  ("night_sleep_02", "asleep, slightly different breathing pose"),
  ("night_wake_01", "jolting awake, eyes wide")]),
 ("Row 3 - Seated at an invisible round meeting table on the RIGHT (same seat height)", [
  ("meet_table_talk_01", "talking with an open hand"),
  ("meet_table_talk_02", "leaning in, explaining a technical point"),
  ("meet_table_listen_01", "listening, forearms resting on the table"),
  ("meet_table_frown_01", "arms crossed, frowning"),
  ("meet_table_lap_01", "typing on a laptop standing on the table"),
  ("meet_table_show_01", "turning the laptop on the table toward the other side"),
  ("meet_table_warn_01", "index finger raised, warning about a risk"),
  ("meet_table_agree_01", "nodding, satisfied")]),
 ("Row 4 - One-on-one on an invisible chair, no table (autonomy talk, job-offer talk)", [
  ("oneone_talk_01", "talking calmly, open hand"),
  ("oneone_offer_01", "looking down, rubbing the hands together, telling about a new job offer"),
  ("oneone_tired_01", "elbows on the knees, weary, 'all the critical work lands on me'"),
  ("oneone_frustrated_01", "one hand gesturing, frustrated, eyebrows lowered"),
  ("oneone_listen_01", "listening carefully to a proposal"),
  ("oneone_think_01", "hand on the chin, seriously considering"),
  ("oneone_agree_01", "small smile and nod, 'I'll stay and try it'"),
  ("oneone_decline_01", "respectful slight head shake, apologetic, 'I'm taking the offer'")]),
 ("Row 5 - Whiteboard on the RIGHT (invisible; the arm reaches toward it)", [
  ("wb_draw_01", "drawing a box with a marker, arm raised"),
  ("wb_draw_02", "drawing a connecting arrow, arm lower"),
  ("wb_circle_01", "circling a bottleneck, serious"),
  ("wb_point_01", "tapping the diagram with the marker, 'this part'"),
  ("wb_explain_01", "half turned to the viewer, marker in hand, explaining two options"),
  ("wb_explain_02", "half turned to the viewer, explaining with an open palm"),
  ("wb_review_01", "one step back from the board, arms crossed, reviewing"),
  ("wb_cap_01", "capping the marker, satisfied smile")]),
 ("Row 6 - Mentoring and runbook", [
  ("mentor_point_01", "leaning forward, pointing down-right as if at a junior's screen, patient"),
  ("mentor_explain_01", "standing, bent slightly toward a seated colleague on the right, explaining calmly"),
  ("mentor_pat_01", "encouraging pat toward an offscreen shoulder on the right"),
  ("mentor_thumb_01", "thumbs up to someone offscreen, 'good job'"),
  ("runbook_write_01", "writing in an open binder held in the left hand, pen in the right"),
  ("runbook_tick_01", "ticking a checklist sheet with a pen"),
  ("delegate_01", "handing a task card forward, 'your turn'"),
  ("delegate_02", "confident nod after handing over the task")]),
 ("Row 7 - Handover and leaving the desk", [
  ("handover_01", "holding out a closed folder of architecture notes with both hands"),
  ("handover_02", "folder released, hands returning, serious nod"),
  ("handover_lap_01", "holding out the closed laptop with both hands, returning it"),
  ("pack_01", "holding his mug, about to put it into a box, wistful"),
  ("pack_02", "lifting a packed cardboard box with both hands"),
  ("shake_01", "reaching out the right hand for a handshake"),
  ("shake_02", "firm handshake, grin"),
  ("farewell_bow_01", "hand on the chest, grateful slight bow, 'thanks for everything'")]),
]

# ---------------------------------------------------------------- sheet E – su co, truong thanh, ket thuc, met moi
E = [
 ("Row 1 - Production incident", [
  ("alert_01", "reading an alert on the phone, shocked, exclamation mark"),
  ("alert_02", "phone lowered, jaw set, switching into crisis mode"),
  ("headset_01", "black over-ear headphones ON, speaking, one hand on the ear cup"),
  ("headset_02", "headphones ON, typing on a laptop balanced on the left forearm while talking"),
  ("command_01", "pointing right, giving urgent instructions"),
  ("command_02", "both arms directing calmly, in control"),
  ("incident_monitor_01", "arms crossed, tense, watching a monitor on the RIGHT"),
  ("rollback_call_01", "decisive chopping hand gesture, 'roll back first'")]),
 ("Row 2 - Rollback on a laptop balanced on the left forearm, then relief", [
  ("rollback_type_01", "typing fast, intense focus, sweat drop"),
  ("rollback_type_02", "typing fast, eyes narrowed"),
  ("rollback_enter_01", "pressing enter decisively"),
  ("rollback_done_01", "small victory fist, laptop now held in the other hand"),
  ("flag_01", "index finger flicking an imaginary switch, 'feature flag off'"),
  ("incident_fixed_01", "big relieved exhale, wiping the forehead"),
  ("relief_01", "shoulders dropped, hand on the chest, relieved"),
  ("stretch_01", "stretching both arms overhead")]),
 ("Row 3 - Growing into a technical lead", [
  ("lead_01", "arms crossed, calm smile, a technical lead"),
  ("lead_02", "leading a stand-up, both arms slightly open toward the team"),
  ("lead_03", "pointing to assign a task, supportive smile"),
  ("lead_04", "listening to the team, hand on the chin, nodding"),
  ("determined_01", "fist in the palm, determined"),
  ("confident_01", "hands on the hips, chin up, confident smile"),
  ("proud_01", "proud nod, hands in the pockets"),
  ("stretch_02", "twisting the torso to stretch, relaxed")]),
 ("Row 4 - Leaving the company with a cardboard box (walks to the RIGHT)", [
  ("farewell_01", "holding a box of personal items with both hands, looking at it"),
  ("leave_01", "walking with the box, contact right foot"), ("leave_02", "walking with the box, passing"),
  ("leave_03", "walking with the box, contact left foot"), ("leave_04", "walking with the box, passing"),
  ("leave_back_01", "glancing back over the shoulder with a sad smile, box in the arms"),
  ("farewell_wave_01", "box under one arm, small wave goodbye"),
  ("bye_01", "hands free, two-finger salute goodbye, soft smile")]),
 ("Row 5 - Reacting to the PM's final result", [
  ("cheer_01", "cheering, one fist raised, sparkles"), ("cheer_02", "both fists raised, big grin"),
  ("congrats_01", "offering a fist bump"), ("congrats_02", "high-five hand raised"),
  ("clap_01", "applauding, hands apart"), ("clap_02", "applauding, hands together"),
  ("sad_01", "sad, looking down, hand on the back of the neck"),
  ("pat_01", "sympathetic pat toward an offscreen shoulder")]),
 ("Row 6 - OUTFIT FOR THIS ROW: same outfit after two weeks of overtime: hair messier, faint dark circles, polo half "
  "untucked, collar crooked, slouched. Tired idle + tired talk", [
  ("tired_idle_01", "slouched idle 1/4, closed laptop hanging from one hand"),
  ("tired_idle_02", "slouched idle 2/4"), ("tired_idle_03", "slouched idle 3/4, eyes half closed"),
  ("tired_idle_04", "slouched idle 4/4"),
  ("tired_talk_01", "talking wearily, low hand gesture"), ("tired_talk_02", "talking, forced smile"),
  ("tired_talk_03", "talking, rubbing the neck"), ("tired_talk_04", "talking, sighing")]),
 ("Row 7 - Tired outfit as row 6. Tired walk cycle, dragging feet, closed laptop hanging from one hand", [
  ("tired_walk_01", "contact right"), ("tired_walk_02", "down"), ("tired_walk_03", "passing"),
  ("tired_walk_04", "up"), ("tired_walk_05", "contact left"), ("tired_walk_06", "down"),
  ("tired_walk_07", "passing"), ("tired_walk_08", "up")]),
]

# ---------------------------------------------------------------- sheet D – chan dung (DA CO, giu nguyen thu tu)
D = [
 ("Row 1", [("face_neutral", "neutral, self-assured"), ("face_smirk", "confident half-smile"),
            ("face_grin", "big friendly grin"), ("face_laugh", "laughing, eyes closed")]),
 ("Row 2", [("face_focused", "focused, eyes narrowed, headphones on"), ("face_serious", "serious, straight mouth"),
            ("face_frown", "frowning, jaw set"), ("face_annoyed", "annoyed, eyes rolling slightly")]),
 ("Row 3", [("face_defensive", "defensive, eyebrows up, palm raised into the frame"),
            ("face_skeptical", "one eyebrow raised, skeptical"), ("face_thinking", "thinking, eyes looking up"),
            ("face_surprised", "surprised, eyebrows up, mouth open")]),
 ("Row 4", [("face_worried", "worried, eyebrows tilted, sweat drop"), ("face_tired", "tired, faint dark circles"),
            ("face_exhausted", "exhausted, half-closed eyes, small grey puff"), ("face_sigh", "sighing, eyes closed")]),
 ("Row 5", [("face_relieved", "relieved, soft smile"), ("face_determined", "determined, sharp eyes"),
            ("face_grateful", "grateful, warm small smile"), ("face_apologetic", "apologetic, sad smile, looking aside")]),
]

# ---------------------------------------------------------------- sheet P – do vat rieng cua Huy
P_ITEMS = [
 ("Row 1 - Huy's navy laptop (navy lid with a small white round logo, no text)", [
  ("huy_laptop_closed", "closed laptop seen 3/4, as tucked under an arm"),
  ("huy_laptop_open_34", "open laptop seen 3/4 from behind-left, as balanced on a forearm (lid back visible, "
                         "keyboard partly visible)"),
  ("huy_laptop_screen_34", "open laptop turned so the screen faces right at a 3/4 angle; visible screen is flat "
                           "solid GREEN #00FF00"),
  ("huy_laptop_open_front", "open laptop with the screen facing the viewer; screen flat solid GREEN #00FF00")]),
 ("Row 2 - Huy's other items", [
  ("energy_can", "plain dark-blue energy drink can, no text"),
  ("runbook_binder", "open navy ring binder with colored tab dividers and grey lines (no readable text)"),
  ("huy_box", "open cardboard box holding a small cactus, black headphones, a rolled cable and a mug"),
  ("huy_headphones", "black over-ear headphones lying on a desk")]),
]
RATIO = {"huy_laptop_closed": 0.36, "huy_laptop_open_34": 0.4, "huy_laptop_screen_34": 0.4,
         "huy_laptop_open_front": 0.4, "energy_can": 0.09, "runbook_binder": 0.3, "huy_box": 0.45,
         "huy_headphones": 0.16}

SHEETS = [
 {"id": "A", "key": "master", "cols": 8, "rows": 7, "attach": "old_huy+pm", "grid": A, "portrait_first": True,
  "task": "framed portrait, idle, back view, walk and run cycles, jump, startle, office chair, sofa after overtime, reactions",
  "title": "Master: chân dung, đứng, đi, chạy, nhảy, ngồi ghế, sofa OT, cảm xúc"},
 {"id": "B", "key": "hands_gestures", "cols": 8, "rows": 7, "attach": "master", "grid": B,
  "task": "laptop briefing, talking and listening, explaining a change, estimates, phone, stances, thinking and coffee",
  "title": "Laptop, nói/nghe, giải thích – phòng thủ – đồng ý, estimate, điện thoại (offer), thái độ, suy nghĩ"},
 {"id": "C", "key": "work_scenes", "cols": 8, "rows": 7, "attach": "master", "grid": C,
  "task": "own desk by day, overtime at night, meeting table, one-on-one, whiteboard, mentoring, handover",
  "title": "Bàn code ngày/đêm, bàn họp, 1-1, bảng trắng, mentoring/runbook, bàn giao"},
 {"id": "E", "key": "crisis_growth_endings", "cols": 8, "rows": 7, "attach": "master", "grid": E,
  "task": "production incident and rollback, growing into a technical lead, leaving with a box, reacting to the "
          "final result, and an exhausted variant",
  "title": "Sự cố + rollback, Technical Lead, nghỉ việc ôm thùng, kết thúc, biến thể kiệt sức"},
 {"id": "D", "key": "portraits", "cols": 4, "rows": 5, "attach": "master", "grid": D, "portrait": True, "keep": True,
  "task": "20 framed facial-expression portraits for a dialogue box", "title": "20 chân dung hộp thoại (ĐÃ CÓ – giữ)"},
 {"id": "P", "key": "props", "kind": "prop", "cols": 4, "rows": 2, "attach": "master_only", "grid": P_ITEMS,
  "task": "Huy's own handheld and desk items", "title": "Đồ vật riêng của Huy (laptop navy, lon nước, runbook, thùng đồ)"},
]

# ---------------------------------------------------------------- gan ket o -> do vat / noi that
def P(id, at="grip", z="front"): return {"prop": id, "at": at, "z": z}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
CHAIR, MCHAIR, SOFA = F("office_chair"), F("meeting_chair"), F("sofa")
DESK, MTABLE = F("desk_monitor", z="front"), F("meeting_table", z="front")
WB = F("whiteboard", "beside")                     # pm_compose: noi that khong co diem ngoi -> dat ben phai
LAPC_BACK, LAPC, LAP34, LAPS = (P("huy_laptop_closed", z="back"), P("huy_laptop_closed"),
                                P("huy_laptop_open_34"), P("huy_laptop_screen_34"))
BOX, PHONE = P("huy_box"), P("phone_back")
RULES = [  # (regex, bindings) – khop dau tien; id prop/furn khong co tien to huy_ la cua bo PM
 (r"^portrait$|^face_", []),
 (r"^idle_|^walk_|lap_carry", [LAPC_BACK]),
 (r"^run_|startle_01|^tired_idle|^tired_walk", [LAPC]),
 (r"^sit_01$", [F("office_chair", "beside")]),
 (r"^sit_", [CHAIR]),
 (r"^lie_01$", [SOFA, LAPC]),
 (r"^slump_|^lie_|^getup_", [SOFA]),
 (r"lap_show", [LAPS]),
 (r"^lap_|headset_02|^rollback_(type|enter)", [LAP34]),
 (r"rollback_done", [P("huy_laptop_open_34", "grip2")]),
 (r"^phone_|^alert_", [PHONE]),
 (r"^coffee_", [P("mug_steam")]),
 (r"desk_turn|desk_wave", [CHAIR]),
 (r"^desk_", [CHAIR, DESK]),
 (r"night_drink", [CHAIR, DESK, P("energy_can")]),
 (r"^night_", [CHAIR, DESK, P("lamp_on", "surface:desk_monitor")]),
 (r"meet_table_lap", [MCHAIR, MTABLE, P("huy_laptop_open_34", "surface:meeting_table")]),
 (r"meet_table_show", [MCHAIR, MTABLE, P("huy_laptop_screen_34", "surface:meeting_table")]),
 (r"^meet_table_", [MCHAIR, MTABLE]),
 (r"^oneone_", [MCHAIR]),
 (r"wb_review|wb_explain_02", [WB]),
 (r"^wb_", [P("marker"), WB]),
 (r"runbook_write", [P("runbook_binder", "grip2"), P("pen")]),
 (r"runbook_tick", [P("checklist_sheet", "grip2"), P("pen")]),
 (r"delegate_01", [P("task_card")]),
 (r"handover_01", [P("folder_closed")]),
 (r"handover_lap", [LAPC]),
 (r"pack_01", [P("mug_plain")]),
 (r"pack_02|^farewell_01|^leave_|farewell_wave", [BOX]),
 (r"incident_monitor", [F("monitor_alert", "beside")]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green"}
WORD = {"huy": "laptop", "phone": "phone", "mug": "mug", "energy": "can", "marker": "marker", "runbook": "binder",
        "pen": "pen", "checklist": "checklist", "task": "card", "folder": "folder"}
def marker_tag(name):
    ms = []
    for x in bindings(name):
        if x["at"] == "seat" and "cyan = seat" not in ms: ms.append("cyan = seat")
        elif x["at"] in LABEL:
            w = "box" if x["prop"] == "huy_box" else WORD.get(x["prop"].split("_")[0], x["prop"])
            ms.append(f"{LABEL[x['at']]} = {w}")
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
    if s.get("kind") == "prop":
        return "\n\n".join([
            f"TASK: create a {cols}x{rows} sheet of separate items for a chibi pixel-art office game: {s['task']}.",
            ATTACH_PROPS,
            "ART STYLE: exactly the style of the attached sheet: clean dark-brown pixel outline, soft cel shading, warm "
            "natural colors, top-left light, 3/4 view as seen by a character facing right.",
            f"LAYOUT: square 1:1, fully TRANSPARENT background (PNG with alpha channel): no white, no color, no checkerboard pattern painted in. Exactly {cols} columns x {rows} rows = {cols*rows} "
            "cells, one item per cell, centred, never touching another item, no shadows. Each item at its real size "
            "relative to the chibi character (the laptop is about as wide as his torso).",
            "MARKERS: one small solid MAGENTA #FF00FF dot at the grip point (where the centre of a hand holds it) or, for "
            "items that stand on a surface, at the bottom-centre contact point. Screens are flat solid GREEN #00FF00. "
            "Never use these colors elsewhere.",
            "CELLS:\n" + rows_text(s, tags=False),
            "DO NOT: draw any character or hands; add text, letters, numbers or watermark; draw grid lines, borders, "
            "floors or backgrounds."])
    head = f"TASK: create a {cols}x{rows} chibi pixel-art game "
    if s.get("portrait"):
        return "\n\n".join([
            head + f"portrait sheet of {WHO}. Sheet content: {s['task']}.", ATTACH_MASTER, CHARACTER, STYLE,
            f"LAYOUT: square 1:1, fully transparent background outside the frames (no white, no checkerboard). Exactly {cols} columns x {rows} rows = "
            f"{cols*rows} cells. Every cell is a head-and-shoulders portrait inside a rounded-square frame with a thin "
            "dark outline and a soft pastel-blue background, identical frame size and crop, exactly like cell 1 of the "
            "master sheet. Face the viewer, turned slightly left, hands empty unless an expression says otherwise. "
            "Frames never touch.",
            "EXPRESSIONS:\n" + rows_text(s, tags=False), NEG])
    return "\n\n".join([
        head + f"sprite sheet of {WHO}. Sheet content: {s['task']}.",
        ATTACH_A if s["attach"] == "old_huy+pm" else ATTACH_MASTER, CHARACTER, STYLE,
        LAYOUT(cols, rows, s.get("portrait_first", False)), OBJECT_RULE, "CELLS:\n" + rows_text(s), NEG])

FPS = {"idle": (6, True), "walk": (10, True), "run": (14, True), "jump": (12, False), "startle": (8, False),
       "sit": (8, False), "slump": (4, False), "lie": (3, False), "getup": (6, False), "good": (6, False),
       "bad": (6, False), "sigh": (4, False), "greet": (6, False),
       "lap_type": (10, True), "lap_show": (6, False), "talk": (6, True), "listen": (3, True), "nod": (6, False),
       "explain": (6, False), "agree": (6, False), "est_count": (4, False), "est_weigh": (4, True),
       "phone_read": (3, True), "phone_call": (4, True), "crossarms": (3, False), "think": (4, True),
       "coffee": (3, False), "desk_type": (10, True), "night_type": (6, True), "night_sleep": (2, True),
       "meet_table_talk": (6, True), "wb_draw": (6, True), "handover": (6, False), "shake": (6, False),
       "alert": (6, False), "command": (6, False), "rollback_type": (10, True), "lead": (6, False),
       "leave": (8, True), "cheer": (8, True), "congrats": (6, False), "clap": (8, True),
       "tired_idle": (4, True), "tired_talk": (5, True), "tired_walk": (7, True)}

def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

# ---------------------------------------------------------------- bam kich ban: canh -> animation (huy/<nhom> hoac o)
# (canh, nhip, nguoi noi / thoai theo docs/KICH_BAN_ROLECRAFT_PM60.md, chuoi animation va chan dung)
SCENES = [
 ("L1 S01 Tiếp quản", "Mở cảnh", "Huy: “Cứ chạy tiếp thì một tuần nữa demo được.”", "walk → lap_carry → lap_show → talk · face_smirk"),
 ("L1 S01 Tiếp quản", "Lan nói", "Lan: tài liệu chưa phản ánh hết…", "listen · face_neutral"),
 ("L1 S01 Tiếp quản", "A", "Huy: “Mất một ngày, nhưng cả team thống nhất được hiện trạng.”", "nod → agree_01 · face_serious"),
 ("L1 S01 Tiếp quản", "B", "(Lan nói)", "good_01 · face_smirk"),
 ("L1 S01 Tiếp quản", "C", "Huy: “Có gì cần làm rõ thì báo anh.”", "askme_01 · face_grin"),
 ("L1 S02 Senior tự quyết", "Mở cảnh", "Hệ thống: Huy đổi requirement chưa báo BA/QA · Huy: “Thay đổi nhỏ thôi, không cần review đâu.”", "desk_type → desk_turn_01 → desk_wave_01 · face_smirk"),
 ("L1 S02 Senior tự quyết", "A", "Huy: “Việc gì cũng chờ duyệt thì tiến độ sẽ chậm.”", "sit_annoyed_01 · face_annoyed"),
 ("L1 S02 Senior tự quyết", "B", "Huy: “Vậy anh sẽ chủ động xử lý cho kịp tiến độ.”", "sit_smirk_01 · face_grin"),
 ("L1 S02 Senior tự quyết", "C", "Huy: “Hợp lý. Việc ảnh hưởng requirement anh sẽ đưa ra review.”", "sit_nod_01 · face_relieved"),
 ("L1 S03 Thay đổi phạm vi", "Mở cảnh", "Anh Hiệp muốn thêm hai chức năng", "meet_table_listen → meet_table_frown_01 · face_skeptical"),
 ("L1 S03 Thay đổi phạm vi", "A", "Huy: “Team phải điều chỉnh lại kế hoạch ngay.”", "meet_table_frown_01 → meet_table_talk · face_worried"),
 ("L1 S03 Thay đổi phạm vi", "B / C", "(Anh Hiệp nói)", "B: meet_table_listen · C: meet_table_lap_01 (estimate) · face_focused"),
 ("L1 S04 Quỹ công cụ", "Mở cảnh + nhánh", "(Huy không thoại)", "listen_02 · A: good_01 · B: sigh_01 · C: doubt_01 (licence dùng chung thành điểm nghẽn)"),
 ("L2 S05 Hai dự án", "Mở cảnh", "Huy: “Anh mà chuyển sang B thì backend của A thiếu người review.”", "meet_table_warn_01 · face_frown"),
 ("L2 S05 Hai dự án", "A", "Huy: “Được, nhưng team vẫn mất thời gian onboarding và review.”", "meet_table_agree_01 → meet_table_talk · face_serious"),
 ("L2 S05 Hai dự án", "B / C", "(Nam / Anh Minh nói)", "B: meet_table_frown_01 · face_tired (bật cờ team_ot_14_days) · C: meet_table_agree_01"),
 ("L2 S06 Deadline/chất lượng", "Mở cảnh", "Huy: “Muốn release đúng ngày thì phải bỏ vòng regression cuối.”", "meet_table_talk · face_serious"),
 ("L2 S06 Deadline/chất lượng", "A", "Huy: “Lỗi ở luồng cũ mà lọt lên production thì tốn hơn nhiều.”", "meet_table_warn_01 · face_worried"),
 ("L2 S06 Deadline/chất lượng", "B", "(Anh Hiệp nói)", "meet_table_agree_01"),
 ("L2 S06 Deadline/chất lượng", "C", "Huy: “Anh sẽ dùng feature flag để kiểm soát phạm vi mở.”", "meet_table_lap_01 (ngồi) hoặc flag_01 (đứng) · face_determined"),
 ("L2 S07 Giữ Huy", "Trước cảnh", "Huy đọc offer", "phone_read_02 → phone_hold_01 → phone_pocket_01"),
 ("L2 S07 Giữ Huy", "Mở cảnh", "Huy: “Anh vừa nhận offer mới…” · “Việc critical dồn hết vào anh…”", "oneone_offer_01 → oneone_tired_01 · face_worried → face_tired"),
 ("L2 S07 Giữ Huy", "Cờ", "team_ot_14_days / senior_restricted / senior_has_guardrails", "oneone_frustrated_01 · face_exhausted / oneone_frustrated_01 · face_frown / oneone_think_01 · face_thinking"),
 ("L2 S07 Giữ Huy", "A", "Huy: “Nếu khối lượng việc cũng được kiểm soát, anh sẽ ở lại.”", "oneone_think_01 → oneone_agree_01 · face_relieved"),
 ("L2 S07 Giữ Huy", "B", "(PM, Anh Minh nói) → key_developer_left", "oneone_listen_01 · face_apologetic → chuỗi nghỉ việc"),
 ("L2 S07 Giữ Huy", "C", "Huy: “Anh quan tâm, nhưng team không được tiếp tục sống bằng OT.”", "oneone_listen_01 → oneone_talk · face_serious"),
 ("L2 S07 Giữ Huy", "C1", "Huy: “Anh ở lại và thử lộ trình này.”", "oneone_agree_01 → shake · face_grateful"),
 ("L2 S07 Giữ Huy", "C2", "Huy: “Anh trân trọng đề xuất, nhưng anh quyết định nhận offer mới.”", "oneone_decline_01 · face_apologetic → chuỗi nghỉ việc"),
 ("L2 S07 Giữ Huy", "Chuỗi nghỉ việc", "key_developer_left", "handover → handover_lap_01 → pack_01 → pack_02 → farewell_bow_01 → farewell_01 → leave → leave_back_01 → farewell_wave_01"),
 ("L2 S08 Complain", "Mở cảnh", "(Anh Hiệp, Lan nói)", "meet_table_listen · face_serious"),
 ("L2 S08 Complain", "Biến thể 1", "Huy: “Team đổi cách xử lý để kịp demo nhưng chưa ghi nhận thành requirement.”", "meet_table_talk → sigh_01 · face_apologetic"),
 ("L2 S08 Complain", "A / B / C", "(PM, Anh Hiệp, Lan nói)", "A: meet_table_frown_01 · B: meet_table_frown_01 · C: meet_table_agree_01"),
 ("L3 S09 Incident", "Mở cảnh", "Hệ thống: 14:00 production lỗi", "alert → startle → run → desk_focus_01 · face_surprised"),
 ("L3 S09 Incident", "A", "Cả team dừng việc", "headset_01 → desk_type · face_focused"),
 ("L3 S09 Incident", "B", "Giao một dev (Huy)", "desk_bug_01 → stress_01 · face_tired"),
 ("L3 S09 Incident", "C", "Rollback trước, lập nhóm incident", "rollback_call_01 → rollback_type → rollback_enter_01 → rollback_done_01 → incident_fixed_01 · face_determined → face_relieved"),
 ("L3 S09 Incident", "Sau mọi nhánh", "PM báo khách", "incident_monitor_01 → relief_01 → stretch_01"),
 ("L3 S10 Sales hứa 10 ngày", "Mở cảnh", "(Linh, PM nói)", "doubt_01 · face_skeptical"),
 ("L3 S10 Sales hứa 10 ngày", "A / B / C", "(PM nói)", "A: overload_01 · face_exhausted · B: facepalm_01 · C: est_count → agree_02 · face_relieved"),
 ("L3 S11 Junior gây lỗi", "Mở cảnh", "(Nam, Lan nói)", "sigh_01 · face_serious"),
 ("L3 S11 Junior gây lỗi", "A / B / C", "(PM nói)", "A: crossarms_01 · face_frown · B: sigh_02 · C: mentor_point_01 → mentor_explain_01 → runbook_tick_01 → mentor_pat_01 · face_determined"),
 ("L3 S12 Dự án lớn", "Mở cảnh + nhánh", "(Anh Minh, PM nói)", "crossarms_01 · face_worried · A: overload_01 · B: talk_03 · C: good_01"),
 ("L4 S13 Hệ thống vận hành", "Mở cảnh", "Anh Minh: “Nếu Huy nghỉ…”", "scratch_01 · face_serious"),
 ("L4 S13 Hệ thống vận hành", "A", "Huy: “Output tăng trước mắt, nhưng điểm nghẽn cũ sẽ quay lại.”", "warn_01 · face_skeptical"),
 ("L4 S13 Hệ thống vận hành", "B / C", "(Lan / Nam nói)", "B: runbook_write_01 → runbook_tick_01 · C: delegate_01 → mentor_thumb_01 · face_grin"),
 ("L4 S14 Phát triển team", "Mở cảnh", "Huy: “Anh muốn lên Technical Lead, không muốn ôm mọi vấn đề khó nữa.”", "oneone_talk · face_determined"),
 ("L4 S14 Phát triển team", "A / B", "(Lan / Nam nói)", "A: frown_01 · face_frown · B: nod"),
 ("L4 S14 Phát triển team", "C", "Huy: “Anh đồng ý nếu phạm vi quyết định được ghi rõ.”", "agree_01 → lead_01 · face_grateful"),
 ("L4 S15 Mở rộng hợp tác", "Cờ large_project_without_resources", "Huy: “Team đang chia nguồn lực cho dự án lớn vừa nhận…”", "meet_table_warn_01 · face_worried"),
 ("L4 S15 Mở rộng hợp tác", "A", "Huy: “Mình đang cam kết khi chưa biết hết phạm vi tích hợp.”", "meet_table_warn_01 · face_worried"),
 ("L4 S15 Mở rộng hợp tác", "B / C", "(Anh Hiệp / Linh nói)", "meet_table_agree_01"),
 ("Kết thúc", "Pass xuất sắc / Pass", "Huy chúc mừng PM", "cheer → congrats_02 / clap → congrats_01 · face_laugh"),
 ("Kết thúc", "Gia hạn / Không đạt", "Huy an ủi PM", "pat_01 / sad_01 → pat_01 → bye_01 · face_apologetic"),
 ("Chuyển ngày", "Bình thường", "", "walk → coffee"),
 ("Chuyển ngày", "team_ot_14_days", "Từ L2 S06: thay idle / talk / walk bằng tired_idle / tired_talk / tired_walk", "night_type → night_drink_01 → night_sleep → night_wake_01 hoặc slump → lie → getup"),
 ("Chuyển ngày", "Incident đã khắc phục", "", "desk_fixed_01 → desk_stand_01 → stretch_02"),
 ("Popup chỉ số", "Tăng / giảm", "", "good / bad"),
]
ABSENT = ("Nếu `key_developer_left` (Huy nghỉ ở L2 S07): Huy không xuất hiện từ L3 (thoại thay bằng thông báo thiếu "
          "nhân sự chủ chốt, mục 2 kịch bản), bỏ các dòng L3–L4 và kết thúc ở bảng trên.")

def anim_refs(text):
    refs = []
    for part in text.replace("·", "→").replace("/", "→").replace("(", " ").replace(")", " ").split("→"):
        for tok in part.split():
            if re.fullmatch(r"[a-z][a-z0-9_]+", tok) and tok not in ("hoặc", "or"):
                refs.append(tok)
    return refs

# ---------------------------------------------------------------- SOL one-shot (toi uu token)
SOL = """Work autonomously. Do not ask questions. Keep chat output short.

GOAL: sprite sheets for the game character "Huy – Senior Developer" (sheets A, B, C, E, P). Sheet D (portraits) is already approved: do NOT generate it.

ATTACHMENTS
1. HUY_B_old.png – old approved Huy sheet (identity: face, hair, navy polo). Layout is wrong, ignore layout.
2. HUY_D_portraits.png – approved portrait sheet (identity; final sheet D).
3. PM_A_master.png – another character's master sheet: grid, size and style reference only.
4. rolecraft_huy_sprite_prompts.zip – prompts/HUY_*.txt, huy_sprite_manifest.json, tools/.

TOKEN BUDGET RULES (follow strictly)
- Always ask the image tool for a TRANSPARENT background (PNG with alpha). If a sheet still comes back on plain white, do NOT regenerate it: remove the white with tools/make_transparent.py (step below).
- One image call per sheet, using the prompt file text EXACTLY. Do not rewrite, shorten or "improve" prompts.
- Regenerate a whole sheet ONLY for a HARD FAIL: wrong grid (not the stated columns x rows), figures overlapping or cut off, a clearly different character, a drawn object/furniture in many cells, visible text, or a checkerboard pattern / scenery painted as the background. Maximum 1 retry per sheet; keep the better of the two.
- On a retry, append this line to the prompt and nothing else: "GRID CHECK: exactly 8 columns and 7 rows (sheet P: 4 columns and 2 rows), one figure or item per cell, nothing crosses a cell edge."
- Everything else is a SOFT issue (a pose slightly off, a missing or extra dot, small color drift): do not regenerate, just list it.
- Never regenerate a sheet that passed. Never regenerate A after B has started.
- Do not describe images or repeat prompts in chat. After each sheet print one line: `<sheet> | attempts | PASS / FAIL: reason`.

STEPS
1. Unzip; read the manifest (file names) and prompts.
2. Sheet A: HUY_A_master.txt with Image 1 = HUY_B_old.png, Image 2 = HUY_D_portraits.png, Image 3 = PM_A_master.png.
3. Sheets B, C, E: their prompt files with Image 1 = approved HUY_A_master.png, Image 2 = HUY_D_portraits.png.
4. Sheet P: HUY_P_props.txt with only HUY_A_master.png attached.
5. Save to sheets/ with the manifest file names (copy HUY_D_portraits.png there too). Make every saved sheet transparent (no image call needed):
   python3 tools/make_transparent.py sheets/*.png
   Then run once:
   python3 tools/extract_anchors.py --manifest huy_sprite_manifest.json --sheets sheets --out build
6. Read build/report.json. Only for a ROW where 3 or more cells report "missing ... marker", make ONE edit call on that sheet with the ROW FIX prompt below (max 2 row fixes in total for the whole job), then run the script once more. Leave all other warnings as they are.
7. DELIVER: show the final sheets; one file rolecraft_huy_sprites.zip with sheets/, build/, huy_sprite_manifest.json, tools/pm_compose.js; a table: sheet, attempts, result, remaining warnings.

ROW FIX PROMPT (Image 1 = HUY_A_master.png, Image 2 = the sheet to fix):
"Edit Image 2: redraw ONLY row {N}; keep every other row pixel-identical. Same character as Image 1. Draw no objects or furniture: empty hands in the grip pose. Add the marker dots exactly as tagged: {paste the Row N line from the prompt file}. Dots are small solid flat circles: MAGENTA #FF00FF, GREEN #00FF00, CYAN #00FFFF."

If you run out of room, stop after the last finished step and write: "Resume from step X."
"""

# ---------------------------------------------------------------- README
def cell_table(s):
    L = ["| # | Tên | Mô tả |", "|---:|---|---|"]
    ns = "prop" if s.get("kind") == "prop" else "huy"
    for c in cells(s):
        tag = "" if s.get("portrait") or s.get("kind") == "prop" or c["name"] == "portrait" else marker_tag(c["name"])
        L.append(f"| {c['index']} | `{ns}/{c['name']}` | {c['desc']}{tag} |")
    return L

def mapping_md():
    L = ["Tên là **nhóm animation** `huy/<nhóm>` (bỏ hậu tố `_01`…) hoặc một ô `huy/<ô>_01`; `face_*` là chân dung "
         "hộp thoại (sheet D). `→` là chuỗi phát nối tiếp. Thoại theo `docs/KICH_BAN_ROLECRAFT_PM60.md`; dòng ghi "
         "“(… nói)” là phản ứng của Huy khi người khác nói.", "",
         "| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |", "|---|---|---|---|"]
    for sc, beat, line, anim in SCENES:
        a = re.sub(r"\b([a-z][a-z0-9_]{2,})\b", lambda m: f"`{m.group(1)}`" if m.group(1) in KNOWN else m.group(1), anim)
        L.append(f"| {sc} | {beat} | {line} | {a} |")
    L += ["", ABSENT]
    return "\n".join(L)

def readme(man):
    n_cells = sum(len(s["cells"]) for s in man["sheets"])
    L = ["# RoleCraft PM60 – Bộ prompt sprite Huy v4 (Senior Developer)", "",
         "Sinh bởi `rolecraft_huy_sprite_prompts/build.py` – sửa ở đó rồi chạy `python build.py`, không sửa tay file này.", "",
         "Làm lại cho đủ như bộ PM: thêm chạy, nhảy, giật mình, ngồi/đứng dậy, sofa sau OT, làm đêm, bảng trắng, sự cố + "
         "rollback, Technical Lead, chuỗi nghỉ việc ôm thùng, phản ứng kết thúc, bộ kiệt sức (`team_ot_14_days`). "
         f"**{len(man['sheets'])} sheet / {n_cells} ô / {len(man['animations'])} animation.**", "",
         "## Thay đổi so với bản cũ", "",
         "- **Huy quay PHẢI** như PM, nội thất ở bên phải: dùng thẳng ghế, bàn, bảng trắng, sofa của bộ PM. Khi Huy đứng "
         "đối diện PM, game lật cả cụm: `pc.draw(ctx, key, x, y, s, { flip: true })`. (Bản cũ đặt bàn/bảng bên trái, "
         "`pm_compose.js` không hỗ trợ → đồ bị ghép sai phía.)",
         "- Tạo hình theo sheet Huy **đã duyệt** (polo navy viền đỏ, logo tròn trắng, quần đen) – không dùng ảnh người thật, "
         "bỏ hoodie/thẻ đeo của `build.py` cũ.",
         "- Nền **trong suốt** (PNG alpha). Công cụ vẫn trả nền trắng thì không sinh lại: `python3 tools/make_transparent.py sheets/*.png`.",
         "- Thêm sheet **E** (sự cố, Technical Lead, nghỉ việc, kết thúc, kiệt sức) và **P** (laptop navy của Huy, lon nước, "
         "runbook, thùng đồ). Sheet **D giữ nguyên**, không sinh lại.",
         "- Prompt ngắn, mỗi ý một lần; quy tắc tiết kiệm token cho agent trong `SOL_ONE_SHOT_PROMPT.txt`.", "",
         "## 1. Thứ tự sinh và ảnh đính kèm", "",
         "| Sheet | File prompt | Đính kèm | Nội dung |", "|---|---|---|---|"]
    att = {"old_huy+pm": "`HUY_B` cũ + `HUY_D` + `PM_A_master.png`", "master": "`HUY_A` mới + `HUY_D`",
           "master_only": "`HUY_A` mới"}
    for s in SHEETS:
        f = "— (giữ ảnh đang có)" if s.get("keep") else f"`prompts/HUY_{s['id']}_{s['key']}.txt`"
        L.append(f"| {s['id']} ({s['cols']}×{s['rows']}) | {f} | {'—' if s.get('keep') else att[s['attach']]} | {s['title']} |")
    L += ["", "**Cách nhanh, ít token nhất:** chat mới với GPT-5.6 Sol, đính kèm `HUY_B_old.png` (đổi tên từ "
          "`HUY_B_hands_gestures.png` cũ trong `HUY_Sprite_Assets_Clean.zip`), `HUY_D_portraits.png`, "
          "`sheets/PM_A_master.png` và zip thư mục `rolecraft_huy_sprite_prompts`, dán `SOL_ONE_SHOT_PROMPT.txt`, gửi "
          "một lần. Prompt đã giới hạn: mỗi sheet 1 lần sinh, chỉ sinh lại 1 lần khi lỗi cứng (sai lưới, dính/cụt hình, "
          "khác người, có chữ, nền vẽ ô caro giả; nền trắng thì chỉ chạy `tools/make_transparent.py`, không sinh lại); lỗi nhỏ ghi lại chứ không sinh lại; sửa chấm neo theo **hàng**, tối "
          "đa 2 lần cho cả bộ.", "",
          "**Sinh thủ công:** mỗi sheet dán nguyên văn file prompt, đính kèm như bảng trên. Duyệt A xong mới làm B, C, E, P.", "",
          "## 2. Điểm kiểm tra (chỉ các lỗi cứng mới sinh lại)", "",
          "> ✅ Đúng lưới 8×7 (P: 4×2), mỗi ô một hình toàn thân, không dính ô bên, **nền trong suốt** (không trắng, không ô caro vẽ giả), cùng cỡ trong cả sheet.",
          ">",
          "> ✅ Cùng người với sheet D; polo navy viền đỏ; ô 1 sheet A là chân dung khung xanh nhạt.",
          ">",
          "> ✅ Không vẽ đồ vật/nội thất (trừ ô chân dung); chấm neo có ở phần lớn ô có `[markers]`.",
          ">",
          "> ✅ Sau script: `build/report.json` – chỉ hàng có ≥3 ô thiếu chấm mới sửa hàng; còn lại chỉnh `dx`/`dy` trong bind.", "",
          "## 3. Dùng tool", "",
          "```bash",
          "cd docs/HUY/rolecraft_huy_sprite_prompts",
          "python3 tools/extract_anchors.py --manifest huy_sprite_manifest.json --sheets sheets --out build",
          "```", "",
          "Ghép đồ vật: nạp `anchors.json` của bộ PM (`prop/*`, `furn/*` dùng chung) gộp với `anchors.json` của bộ này "
          "(`huy/*`, `prop/huy_*`, `prop/energy_can`, `prop/runbook_binder`), rồi `PMCompose.create(anchors, manifest, base)`. "
          "Nhập vào trang xem nhân vật: thay các PNG trong `HUY_Sprite_Assets_Clean.zip` (giữ tên file, thêm "
          "`HUY_E_crisis_growth_endings.png`, `HUY_P_props.png`, manifest mới) rồi chạy `python3 import_characters.py`.", "",
          "## 4. Gắn kết ô → đồ vật / nội thất", "",
          "Quy tắc `RULES` trong `build.py`, ghi vào `cells[].bind`. Id không có tiền tố `huy_` là của bộ PM.", "",
          "| Nhóm tư thế | Đồ vật | Nội thất |", "|---|---|---|",
          "| idle, walk, lap_carry | huy_laptop_closed (kẹp nách, sau tay) | |",
          "| run, startle_01, tired_idle, tired_walk, handover_lap | huy_laptop_closed (trước ngực / cầm tay) | |",
          "| lap_hold, lap_type, lap_close, headset_02, rollback_type/enter | huy_laptop_open_34 (trên cẳng tay) | |",
          "| lap_show | huy_laptop_screen_34 (màn hình quay phải, vẽ UI) | |",
          "| sit_*, desk_turn/wave | | office_chair |",
          "| slump, lie, getup | huy_laptop_closed ở lie_01 | sofa |",
          "| desk_* / night_* | energy_can (night_drink), lamp_on trên bàn (night) | office_chair + desk_monitor |",
          "| meet_table_* | laptop trên mặt bàn (lap/show) | meeting_chair + meeting_table |",
          "| oneone_* | | meeting_chair |",
          "| wb_* | marker | whiteboard (bên phải) |",
          "| phone_*, alert_* | phone_back | |",
          "| coffee / pack_01 | mug_steam / mug_plain | |",
          "| runbook_write / runbook_tick | runbook_binder / checklist_sheet (tay trái) + pen | |",
          "| delegate_01, handover_01 | task_card, folder_closed | |",
          "| pack_02, farewell_01, leave, leave_back, farewell_wave | huy_box | |",
          "| incident_monitor_01 | | monitor_alert (bên phải) |", "",
          "## 5. Mapping kịch bản → sprite", "", mapping_md(), "",
          "## 6. Chi tiết từng sheet", ""]
    for s in SHEETS:
        L += [f"### Sheet {s['id']} – {s['title']}", ""]
        if s.get("keep"):
            L += ["Ảnh `HUY_D_portraits.png` đã duyệt, **không sinh lại**. Prompt giữ ở `prompts/HUY_D_portraits.txt` để dùng khi cần.", ""]
        L += cell_table(s) + [""]
    return "\n".join(L)

# ---------------------------------------------------------------- main
KNOWN = set()
def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    for f in os.listdir(f"{OUT}/prompts"):
        if f.startswith("HUY_") and f.endswith(".txt"): os.remove(f"{OUT}/prompts/{f}")
    man = {"version": 4, "character": {"id": "SENIOR_DEV", "role": "SENIOR_DEV", "name": "Huy – Senior Developer"},
           "shared": {"note": "prop/*, furn/*, icon/* không có tiền tố huy_ dùng lại sheet P, O, F của bộ PM (docs/PM)"},
           "facing": "right",
           "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF", "screen": "#00FF00"},
           "sheets": [], "animations": {}, "objects": {}}
    seen = set()
    for s in SHEETS:
        open(f"{OUT}/prompts/HUY_{s['id']}_{s['key']}.txt", "w", encoding="utf-8").write(prompt(s) + "\n")
        kind = s.get("kind", "huy")
        cl = []
        for c in cells(s):
            assert c["name"] not in seen, f"trung ten o: {c['name']}"
            seen.add(c["name"])
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"{kind}/{c['name']}"
            b = [] if kind == "prop" else bindings(c["name"])
            if b: e["bind"] = b
            cl.append(e)
            if kind == "prop": man["objects"][e["key"]] = {"ratio": RATIO[c["name"]], "z": "front"}
        sh = {"id": s["id"], "key": s["key"], "kind": kind, "file": f"HUY_{s['id']}_{s['key']}.png",
              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl}
        if s.get("keep"): sh["keep"] = True
        man["sheets"].append(sh)
        if s.get("portrait") or kind == "prop": continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (6, False) if len(fr) > 1 else (1, False))
            man["animations"][f"huy/{k}"] = {"frames": [f"huy/{f}" for f in fr], "fps": fps, "loop": loop}
    KNOWN.update(k.split("/")[1] for k in man["animations"]); KNOWN.update(seen)
    for *_, anim in SCENES:                                       # moi tham chieu trong mapping phai ton tai
        for r in anim_refs(anim):
            if "_" in r or r in KNOWN:
                assert r in KNOWN or r in ("team_ot_14_days",), f"mapping tro toi animation khong co: {r}"
    # moi prop/furn trong bind phai co trong bo PM hoac sheet P cua Huy
    pm = json.load(open(os.path.join(HERE, "..", "..", "PM", "rolecraft_pm_sprite_prompts", "pm_sprite_manifest.json"),
                        encoding="utf-8"))
    have = {c["key"] for s in pm["sheets"] for c in s["cells"]} | set(man["objects"])
    for s in man["sheets"]:
        for c in s["cells"]:
            for b in c.get("bind", []):
                k = f"prop/{b['prop']}" if "prop" in b else f"furn/{b['furniture']}"
                assert k in have, f"{c['key']}: khong co {k}"
    json.dump(man, open(f"{OUT}/huy_sprite_manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(f"{OUT}/SOL_ONE_SHOT_PROMPT.txt", "w", encoding="utf-8").write(SOL)
    open(f"{OUT}/mapping_section.md", "w", encoding="utf-8").write(mapping_md() + "\n")
    md = readme(man)
    for p in (f"{OUT}/README_HUY_SPRITE_PROMPTS.md", os.path.join(OUT, "..", "README_HUY_SPRITE_PROMPTS.md")):
        open(p, "w", encoding="utf-8").write(md + "\n")
    n = sum(len(s["cells"]) for s in man["sheets"])
    print(f"{len(SHEETS)} sheet, {n} o, {len(man['animations'])} animation, {len(SCENES)} dong mapping")

if __name__ == "__main__":
    main()
