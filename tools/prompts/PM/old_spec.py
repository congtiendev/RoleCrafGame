# -*- coding: utf-8 -*-
# Nguon duy nhat: tu day sinh ra README prompt, prompt ghep san theo gioi tinh, va manifest ten sprite.

STYLE = ("Art style: cute chibi proportions (about 2.7 heads tall), high-resolution pixel-art illustration look "
"with crisp clean dark-brown outlines (not pure black), soft cel shading, warm friendly palette, consistent "
"top-left lighting. Mobile game sprite quality, clearly readable at small size on a phone screen. Every "
"full-body figure has a small soft grey oval shadow under the feet.")

CHAR = {
"male": ("Character (keep 100% identical in every cell): a young Vietnamese project manager on probation, male, "
"about 26 years old, friendly with a slightly nervous new-hire energy. Short neat black hair with a soft side part "
"and one small stray tuft on top. Warm light-tan skin, dark brown eyes, clean-shaven. Outfit: light sky-blue "
"long-sleeve button-up shirt, sleeves rolled to the forearms, top button open, no tie; dark navy slim chinos; brown "
"leather belt; dark brown casual shoes with white soles. An orange lanyard around the neck with a plain orange ID "
"badge card at the chest (blank card, no text). Signature prop: a tablet in a teal-green protective case, "
"carried in most poses."),
"female": ("Character (keep 100% identical in every cell): a young Vietnamese project manager on probation, female, "
"about 26 years old, friendly with a slightly nervous new-hire energy. Straight black shoulder-length bob with a "
"small teal hair clip on her left side. Warm light-tan skin, dark brown eyes. Outfit: light sky-blue long-sleeve "
"blouse, sleeves rolled to the forearms, tucked into dark navy high-waisted straight trousers; brown leather belt; "
"dark brown low block-heel loafers. An orange lanyard around the neck with a plain orange ID badge card at the chest "
"(blank card, no text). Signature prop: a tablet in a teal-green protective case, carried in most poses."),
}

VARIANT = {
"formal": "Outfit variant for this whole sheet: the same character now wears a charcoal-navy blazer over the same shirt; everything else unchanged.",
"tired": "State variant for this whole sheet: the same character after many overtime nights: hair messier, faint dark circles under the eyes, shirt untucked on one side, sleeves pushed up unevenly, lanyard twisted and badge crooked, slouched posture; everything else unchanged.",
}

def LAYOUT(cols, rows, face_right=True):
    return (f"Sprite sheet on a pure solid white background (#FFFFFF). Square 1:1 image. Arrange exactly {cols} columns x "
    f"{rows} rows = {cols*rows} evenly spaced cells, one pose per cell, each figure centered in its cell with wide empty "
    "white gaps between figures (figures must never touch or overlap). Same character at the same size and scale in "
    "every cell; within each row all feet stand on the same invisible horizontal baseline. "
    + ("All figures face to the right in a 3/4 view unless a cell says otherwise. " if face_right else "")
    + "Reading order is left to right, top to bottom.")

NEG = ("Do NOT include: any text, letters, numbers, labels or watermark; grid lines, cell borders or frames; background "
"scenery, floor, walls or gradients; extra characters; cropped limbs; two cells with the identical pose; any change of "
"face, hair, outfit colors or proportions between cells; pure-white clothing parts touching the background.")

ICON_STYLE = ("Art style: bold casual mobile-game icons, thick dark-brown outline, glossy saturated colors, soft highlight "
"top-left, no character, each icon a clean standalone object.")

# Moi sheet: id, ten, muc dich, cot, hang, variant, rows=[(tieu de hang, [(ten, mo ta)])]
SHEETS = [
{"id":"00","key":"reference","title":"Reference turnaround + prop","cols":4,"rows":2,"variant":None,"face_right":False,
 "purpose":"Sheet tham chiếu nhận diện. Sinh đầu tiên, chọn bản tốt nhất rồi đính kèm làm ảnh tham chiếu cho mọi sheet sau.",
 "grid":[
  ("Views",[("ref_front","full body, front view, neutral friendly expression, holding the tablet at chest with both hands"),
            ("ref_34","full body, 3/4 view facing right, neutral"),
            ("ref_side","full body, strict side profile facing right, neutral"),
            ("ref_back","full body, back view")]),
  ("Props (no character in these cells)",[
            ("prop_tablet","the teal-green cased tablet alone, shown front (dark screen) and back side by side"),
            ("prop_badges","the orange lanyard with blank orange badge next to a royal-blue lanyard with blank blue badge"),
            ("prop_office","a smartphone, a navy document folder with papers, and a cream-colored coffee mug with steam, grouped"),
            ("prop_tools","a black whiteboard marker, a small presentation clicker, and a closed silver laptop, grouped")]),
 ]},
{"id":"01","key":"locomotion","title":"Đứng, đi, chạy","cols":8,"rows":3,"variant":None,
 "purpose":"Đứng chờ lựa chọn, đi vào cảnh / chuyển ngày, chạy khi có sự cố hoặc trễ họp.",
 "grid":[
  ("Idle",[("idle_01","idle breathing loop 1/4: relaxed stance, tablet held at chest with both hands"),
           ("idle_02","idle loop 2/4: slight inhale, shoulders a tiny bit higher"),
           ("idle_03","idle loop 3/4: head tilted very slightly, calm face"),
           ("idle_04","idle loop 4/4: slight exhale, shoulders a tiny bit lower"),
           ("idle_05","glances down at the tablet screen"),
           ("idle_06","looks back up from the tablet, attentive"),
           ("idle_back_01","standing seen from behind, tablet in left hand"),
           ("idle_back_02","seen from behind, head slightly turned to the right")]),
  ("Walk cycle 8 frames, tablet tucked under left arm, right arm swings",[
           ("walk_01","walk contact: right foot forward heel touching"),("walk_02","walk down: weight on right leg, knee bent"),
           ("walk_03","walk passing: left leg passing the right"),("walk_04","walk up: rising on right toes"),
           ("walk_05","walk contact: left foot forward heel touching"),("walk_06","walk down: weight on left leg, knee bent"),
           ("walk_07","walk passing: right leg passing the left"),("walk_08","walk up: rising on left toes")]),
  ("Run cycle 8 frames, hurried office run, leaning forward, tablet clutched to chest, urgent face",[
           ("run_01","run contact right foot"),("run_02","run push-off from right foot"),("run_03","run airborne, legs apart"),
           ("run_04","run landing on left foot"),("run_05","run contact left foot"),("run_06","run push-off from left foot"),
           ("run_07","run airborne, legs apart, mirrored"),("run_08","run landing on right foot")]),
 ]},
{"id":"02","key":"jump_sit_lie","title":"Nhảy, cúi, ngồi, nằm","cols":8,"rows":3,"variant":None,
 "purpose":"Nhảy ăn mừng, giật mình khi có incident, nhặt tài liệu rơi, ngồi ghế, gục/nằm vì OT.",
 "grid":[
  ("Jump + startle",[("jump_01","jump anticipation: crouching, arms back"),("jump_02","jump take-off: arms swinging up"),
           ("jump_03","jump rising, knees tucked"),("jump_04","jump peak: both arms up, joyful open-mouth smile"),
           ("jump_05","jump falling, arms coming down"),("jump_06","jump landing: knees bent, arms out for balance"),
           ("startle_01","small startled hop off the ground, eyes wide, tablet lifted"),
           ("startle_02","landing from the startle, hand on chest, sweat drop")]),
  ("Crouch + sit on a simple grey office swivel chair (same chair in every sit cell)",[
           ("crouch_01","bending down to pick up dropped papers"),("crouch_02","crouching, gathering papers from the floor"),
           ("crouch_03","rising back up holding the gathered papers"),
           ("sit_01","standing next to the office chair, about to sit"),("sit_02","lowering onto the chair"),
           ("sit_03","seated upright on the chair, tablet on lap"),("sit_04","seated relaxed, leaning back"),
           ("sit_05","standing up from the chair, hands on knees pushing up")]),
  ("Lie on a small grey two-seat office sofa (same sofa in every cell)",[
           ("slump_01","sitting on the sofa, exhausted, head tilted back"),("slump_02","sliding sideways down onto the sofa"),
           ("lie_01","lying on the back on the sofa, forearm over the eyes, tablet on stomach"),
           ("lie_02","curled up asleep on the sofa, a folded jacket as a pillow, peaceful"),
           ("lie_03","lying face down on the sofa, one arm dangling, drained"),
           ("getup_01","sitting up groggy on the sofa, rubbing one eye"),
           ("getup_02","sitting on the sofa edge, stretching arms"),
           ("getup_03","standing up from the sofa, refreshed and determined")]),
 ]},
{"id":"03","key":"holding","title":"Cầm nắm đồ vật","cols":8,"rows":3,"variant":None,
 "purpose":"Tablet (prop đặc trưng), tài liệu/hợp đồng, điện thoại, cốc cà phê, bắt tay.",
 "grid":[
  ("Tablet",[("tab_hold_01","holding the tablet with both hands at chest, looking at the viewer"),
           ("tab_read_01","looking down reading the tablet, thumb scrolling"),
           ("tab_read_02","reading the tablet, eyebrows slightly raised"),
           ("tab_present_01","turning the tablet screen outward to the right to show someone, confident"),
           ("tab_present_02","tablet held outward, other index finger pointing at the screen"),
           ("tab_present_03","tablet held outward, other hand open palm explaining"),
           ("tab_swipe_01","swiping on the tablet screen with the index finger"),
           ("tab_tuck_01","tablet tucked under the left arm, right hand relaxed")]),
  ("Documents",[("doc_carry_01","carrying a navy document folder against the chest"),
           ("doc_give_01","extending the folder forward with both hands, handing it over"),
           ("doc_give_02","arms still extended after releasing the folder, polite smile"),
           ("doc_receive_01","receiving a folder with both hands, slight bow"),
           ("doc_raise_01","holding a printed contract raised in one hand, firm expression"),
           ("doc_raise_02","pointing at a line on the raised contract with the other hand"),
           ("doc_flip_01","reading an open document, turning a page"),
           ("doc_flip_02","reading an open document, page turned, focused")]),
  ("Phone, coffee, handshake",[("phone_call_01","phone at right ear, left hand writing in a small notebook"),
           ("phone_call_02","phone at ear, speaking seriously, free hand gesturing"),
           ("phone_read_01","looking at the phone screen, neutral"),
           ("phone_read_02","looking at the phone screen, shocked, eyebrows raised"),
           ("coffee_01","holding a coffee mug with both hands, steam rising"),
           ("coffee_02","sipping from the mug, eyes closed"),
           ("shake_01","extending the right hand for a handshake, friendly smile, slight bow"),
           ("shake_02","mid handshake pose, hand further out, tablet in the other hand")]),
 ]},
{"id":"04","key":"gestures","title":"Cử chỉ tay chân, ngôn ngữ cơ thể","cols":8,"rows":4,"variant":None,
 "purpose":"Nói, đếm phương án, gật/lắc, chặn, ủng hộ, xin lỗi, phòng thủ, khiển trách, suy nghĩ, stress, động viên.",
 "grid":[
  ("Talking",[("talk_01","talking, right palm open upward"),("talk_02","talking, hand moving mid-gesture"),
           ("count_01","holding up one finger, explaining option one"),("count_02","holding up two fingers"),
           ("count_03","holding up three fingers"),("nod_01","nodding down while listening, notebook in hand"),
           ("nod_02","head back up after nodding, slight smile"),("headshake_01","politely shaking head no, eyes closed")]),
  ("Assertive / supportive",[("stop_01","firm stop gesture, right palm raised forward, serious"),
           ("stop_02","both palms raised, calm but firm"),("thumbs_01","thumbs up, big smile"),
           ("rally_01","one fist raised energetically, motivating the team"),("rally_02","both fists pumped, determined"),
           ("goahead_01","casual forward wave, 'go ahead' gesture"),("goahead_02","relaxed shrug with palms up, 'it's fine'"),
           ("clap_01","clapping hands, pleased")]),
  ("Apology / defensive / stern",[("bow_01","slight polite apologetic bow, right hand on chest"),
           ("bow_02","deeper apologetic bow, both hands clasped in front"),
           ("crossarms_01","arms crossed holding a folder, defensive"),("scold_01","pointing a finger forward, stern frown"),
           ("scold_02","hands on hips, disappointed and stern"),("facepalm_01","facepalm, eyes closed"),
           ("scratch_01","scratching the back of the head, awkward embarrassed smile"),("shrug_01","shrugging, uncertain")]),
  ("Thinking / stress / confidence / coaching",[("think_01","hand on chin, looking up, thinking"),
           ("think_02","arms folded, index finger tapping the chin"),("stress_01","rubbing temples with both hands, stressed"),
           ("stress_02","both hands on the head, overwhelmed"),("confident_01","hands on hips, chin up, confident smile"),
           ("stretch_01","stretching both arms overhead"),("stretch_02","twisting the torso to stretch, relieved"),
           ("coach_01","right arm reaching out sideways at shoulder height as if resting the hand on a shorter colleague's shoulder, warm encouraging smile")]),
 ]},
{"id":"05","key":"desk_meeting","title":"Bàn làm việc, OT đêm, họp 1-1","cols":8,"rows":3,"variant":None,
 "purpose":"Làm việc ngày, làm đêm (ôm việc / OT), ngồi họp ghi chép, nói chuyện 1-1.",
 "grid":[
  ("Day desk: simple light-wood desk with a monitor on the right side of the character (same desk in every cell)",[
           ("desk_type_01","seated at the desk typing, focused"),("desk_type_02","typing, slightly different hand position"),
           ("desk_read_01","reading the monitor, hand on the mouse"),("desk_note_01","writing in a notebook at the desk"),
           ("desk_stand_01","pushing the chair back, starting to stand"),("desk_stand_02","standing beside the desk holding the tablet"),
           ("meet_note_01","seated on a meeting chair without desk, taking notes, listening"),
           ("meet_note_02","seated on a meeting chair, looking up from the notes")]),
  ("Night overtime: same desk plus a lit desk lamp and two coffee mugs; warm lamp light only on the character, background stays pure white",[
           ("night_type_01","typing late at night, tired eyes"),("night_type_02","typing, head drooping slightly"),
           ("night_rub_01","rubbing eyes with one hand"),("night_yawn_01","big yawn"),
           ("night_sleep_01","asleep with the head on folded arms on the desk"),("night_sleep_02","asleep, slightly different breathing pose"),
           ("night_wake_01","jolting awake, eyes wide"),("night_wake_02","looking at the monitor again, tired but determined")]),
  ("One-on-one: seated on a chair, no table",[("oneone_talk_01","seated, leaning forward, talking sincerely with open hands"),
           ("oneone_talk_02","seated, leaning forward, one hand explaining"),
           ("oneone_listen_01","seated, listening attentively, notebook on knee"),("oneone_listen_02","seated, nodding while listening"),
           ("oneone_show_01","seated, showing the tablet screen forward"),("oneone_show_02","seated, pointing at the tablet"),
           ("oneone_worry_01","seated, hands clasped, worried"),("oneone_worry_02","seated, looking down, sighing")]),
 ]},
{"id":"06","key":"board_incident","title":"Bảng trắng, xử lý sự cố, giao việc","cols":8,"rows":3,"variant":None,
 "purpose":"Review dự án / chuẩn hoá quy trình, Production Incident + rollback, giao việc & checklist.",
 "grid":[
  ("Whiteboard: small mobile whiteboard on wheels to the right of the character, simple boxes-and-arrows doodle, no text (same board in every cell)",[
           ("wb_write_01","writing on the whiteboard with a marker, arm raised"),("wb_write_02","writing, arm lower"),
           ("wb_write_03","drawing an arrow between boxes"),("wb_point_01","pointing at a box on the diagram"),
           ("wb_point_02","tapping the diagram with the marker"),("wb_explain_01","turned 3/4 toward the viewer explaining, marker in hand"),
           ("wb_explain_02","explaining with an open palm"),("wb_cap_01","capping the marker, satisfied smile")]),
  ("Incident",[("alert_01","phone buzzing in hand, startled, sweat drop"),("alert_02","staring at the phone in alarm"),
           ("command_01","pointing left while giving urgent instructions"),("command_02","pointing right, urgent"),
           ("command_03","both arms directing calmly, in control"),
           ("headset_01","wearing a small headset, speaking, one hand on the earpiece"),
           ("headset_02","headset on, typing on the tablet while talking"),
           ("relief_01","exhaling in relief, shoulders dropped, hand on chest")]),
  ("Rollback + delegate",[("rollback_01","typing fast on an open laptop balanced on the left forearm, intense focus"),
           ("rollback_02","typing fast, eyes narrowed"),("rollback_03","pressing enter decisively"),
           ("rollback_04","small victory fist, laptop in the other hand"),
           ("delegate_01","handing a task card to someone offscreen right, pointing with the other hand"),
           ("delegate_02","confident nod after assigning the task"),
           ("checklist_01","holding out a printed checklist sheet toward someone"),
           ("checklist_02","tapping the checklist with a finger, encouraging")]),
 ]},
{"id":"07","key":"portraits","title":"Chân dung cảm xúc (hộp thoại)","cols":4,"rows":5,"variant":None,"face_right":False,"portrait":True,
 "purpose":"Avatar trong hộp thoại, đổi theo field emotion. Chi tiết hơn sprite toàn thân.",
 "grid":[
  ("",[("face_neutral","neutral, calm"),("face_confident","confident smile"),("face_serious","serious, focused"),("face_worried","worried, eyebrows up")]),
  ("",[("face_surprised","surprised, mouth open"),("face_happy","happy, bright smile"),("face_apologetic","apologetic, awkward smile, eyebrows tilted"),("face_stressed","stressed, gritted teeth, sweat drop")]),
  ("",[("face_stern","stern, frowning"),("face_sad","sad, looking down"),("face_proud","proud, chin up"),("face_thinking","thinking, eyes up, hand on chin")]),
  ("",[("face_relieved","relieved, eyes closed, soft smile"),("face_determined","determined, fist near chin"),("face_exhausted","exhausted, dark circles, messy hair"),("face_embarrassed","embarrassed, blushing, scratching cheek")]),
  ("",[("face_formal_neutral","wearing the charcoal-navy blazer, composed"),("face_formal_confident","wearing the blazer, confident smile"),
       ("face_pm_happy","orange badge replaced by a royal-blue lanyard and blue badge, happy"),("face_pm_proud","royal-blue lanyard and badge, proud smile")]),
 ]},
{"id":"08","key":"reactions_endings","title":"Phản ứng chỉ số và kết thúc campaign","cols":8,"rows":3,"variant":None,
 "purpose":"Popup chỉ số tăng/giảm, Gia hạn, Pass (đổi thẻ), Pass xuất sắc, Không đạt.",
 "grid":[
  ("Small reactions",[("good_01","small positive reaction: nod with a smile"),("good_02","small happy fist at chest"),
           ("good_03","content smile, eyes closed"),("bad_01","wincing"),("bad_02","leaning back, grimacing"),
           ("bad_03","awkward teeth-clenched grimace"),("sigh_01","worried sigh, rubbing the back of the neck"),
           ("sigh_02","looking down, deflated sigh")]),
  ("Pass: badge swap then celebration",[("badge_01","looking at the orange badge in hand, nervous"),
           ("badge_02","holding a new royal-blue badge, amazed"),("badge_03","putting on the royal-blue lanyard, smiling"),
           ("celebrate_01","royal-blue badge on, both arms raised in celebration"),("celebrate_02","royal-blue badge on, jumping with joy"),
           ("celebrate_03","royal-blue badge on, double fist pump"),("relieved_01","royal-blue badge on, relieved exhale, hand on chest"),
           ("relieved_02","royal-blue badge on, soft grateful smile")]),
  ("Fail: no badge in this row",[("fail_01","head down, dejected, no badge"),
           ("fail_02","holding a cardboard box of belongings (small plant, mug, notebook)"),
           ("fail_03","carrying the box, looking down"),("leave_01","walking away with the box, step 1"),
           ("leave_02","walking away with the box, step 2"),("leave_03","walking away with the box, step 3"),
           ("leave_back_01","glancing back over the shoulder with a sad smile"),
           ("resolve_01","box set down, looking up with quiet determination")]),
 ]},
{"id":"09","key":"formal_review","title":"Final Review 60 ngày (mặc blazer)","cols":8,"rows":3,"variant":"formal",
 "purpose":"Bước vào phòng đánh giá, trình bày, phản biện, chờ kết quả.",
 "grid":[
  ("Formal walk cycle",[("formal_walk_01","walk contact right foot, tablet under left arm"),("formal_walk_02","walk down"),
           ("formal_walk_03","walk passing"),("formal_walk_04","walk up"),("formal_walk_05","walk contact left foot"),
           ("formal_walk_06","walk down"),("formal_walk_07","walk passing"),("formal_walk_08","walk up")]),
  ("Presenting (screen is offscreen to the right)",[("present_01","standing with a clicker in the right hand, speaking"),
           ("present_02","pressing the clicker"),("present_03","pointing to the right toward the screen"),
           ("present_04","turned toward the audience, open palm"),("nervous_01","nervous, fiddling with the clicker"),
           ("nervous_02","nervous, glancing to the side"),("adjust_01","straightening the blazer, deep breath"),
           ("adjust_02","fixing the collar")]),
  ("Q&A and waiting",[("answer_01","answering a question with a thoughtful hand gesture"),
           ("answer_02","answering, counting points on fingers"),("reflect_01","hands clasped in front, looking down, reflecting"),
           ("reflect_02","hands clasped, looking up honestly"),("bowthank_01","polite thank-you bow, start"),
           ("bowthank_02","polite thank-you bow, lowest point"),("wait_01","standing still, hands clasped, anxious"),
           ("wait_02","standing still, deep breath, eyes closed")]),
 ]},
{"id":"10","key":"tired","title":"Biến thể kiệt sức","cols":8,"rows":2,"variant":"tired",
 "purpose":"Bật khi có cờ pm_overloaded / team_ot_14_days.",
 "grid":[
  ("Tired idle + tired talk",[("tired_idle_01","slouched idle loop 1/4, tablet hanging from one hand"),("tired_idle_02","slouched idle 2/4"),
           ("tired_idle_03","slouched idle 3/4, eyes half-closed"),("tired_idle_04","slouched idle 4/4"),
           ("tired_talk_01","talking wearily, low hand gesture"),("tired_talk_02","talking, forced smile"),
           ("tired_talk_03","talking, rubbing the neck"),("tired_talk_04","talking, sighing")]),
  ("Tired walk cycle, dragging feet",[("tired_walk_01","tired walk contact right"),("tired_walk_02","tired walk down"),
           ("tired_walk_03","tired walk passing"),("tired_walk_04","tired walk up"),("tired_walk_05","tired walk contact left"),
           ("tired_walk_06","tired walk down"),("tired_walk_07","tired walk passing"),("tired_walk_08","tired walk up")]),
 ]},
{"id":"11","key":"icons","title":"Icon emote và icon chỉ số","cols":6,"rows":4,"variant":None,"icons":True,
 "purpose":"Emote nổi trên đầu nhân vật + icon cho 7 thanh chỉ số HUD. Không có nhân vật.",
 "grid":[
  ("Emotes",[("emo_exclaim","red exclamation mark bubble"),("emo_question","yellow question mark bubble"),("emo_sweat","blue sweat drop"),
             ("emo_idea","glowing light bulb"),("emo_anger","red anger vein symbol"),("emo_zzz","blue Zzz sleep letters")]),
  ("Emotes 2",[("emo_sparkle","golden sparkles cluster"),("emo_heart","pink heart"),("emo_storm","small dark storm cloud with rain"),
             ("emo_coffee","coffee cup with steam"),("emo_check","green check mark badge"),("emo_cross","red cross badge")]),
  ("Stat icons",[("stat_budget","gold coin stack"),("stat_progress","rising bar chart with arrow"),("stat_quality","blue shield with check"),
             ("stat_morale","three small smiling heads together"),("stat_client","handshake"),("stat_management","gold star medal")]),
  ("Stat icons 2",[("stat_risk","orange warning triangle"),("ico_deadline","hourglass"),("ico_up","green up arrow"),
             ("ico_down","red down arrow"),("ico_calendar","calendar page"),("ico_checklist","clipboard with checklist")]),
 ]},
]
