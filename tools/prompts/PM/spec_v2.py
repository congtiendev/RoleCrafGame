# -*- coding: utf-8 -*-
# Nguon duy nhat v2: nhan vat chuyen tu ANH THAT, sheet dong goi 8x7 theo mau (o 1 = chan dung co khung).
from old_spec import SHEETS as OLD

def row(sheet_key, idx):
    s = next(x for x in OLD if x["key"] == sheet_key)
    return s["grid"][idx]

ATTACH_MASTER = ("ATTACHED IMAGES: Image 1 is a photo of a real person (identity source). Image 2 is the approved "
"master sprite sheet of this same character (Sheet A). Match Image 2 exactly: same chibi proportions, face, hair, outfit, "
"colors, outline and shading style, and the same sprite size.")
ATTACH_PHOTO = ("ATTACHED IMAGE: a photo of a real person. This is the identity source for the character.")

IDENTITY = ("IDENTITY: Convert the person in the photo into a game character. Keep them clearly recognizable: face shape, "
"eye shape and eyebrows, nose and mouth character, hairstyle, hair length, hair color and parting, skin tone, and any "
"distinctive features such as glasses, freckles, moles, beard or earrings (if the person wears glasses, keep the same "
"glasses in every cell). Stylize the features into the art style below; do not trace or paste the photo. Ignore the "
"photo's background, lighting, pose, expression and clothing.")

OUTFIT = ("OUTFIT (replaces the clothing in the photo, identical in every cell unless a row says otherwise): a young "
"project manager on probation. Light sky-blue long-sleeve button-up shirt, sleeves rolled to the forearms, top button "
"open, no tie, tucked in; dark navy trousers; brown leather belt; dark brown shoes. An orange lanyard around the neck "
"with a plain orange ID badge card at the chest (blank, no text). Signature prop: a tablet in a teal-green protective "
"case, carried in most poses the way a hero always carries the same item.")

STYLE = ("ART STYLE: cute chibi game sprite in a soft high-resolution pixel-art style. Big head, about 2.3 to 2.5 heads "
"tall in total; large glossy expressive eyes with highlights; small nose and mouth; soft rounded body and short limbs; "
"clean dark-brown pixel outline (not pure black); soft cel shading with gentle gradients in the hair; warm natural colors; "
"consistent top-left light. Every full-body figure stands on a small soft grey oval shadow. Small cute effect icons "
"(sparkles, hearts, stars, sweat drops, swirl, Zzz, exclamation mark) are drawn next to a figure only where a cell asks "
"for them.")

VARIANT = {
"formal": "charcoal-navy blazer worn over the same shirt, everything else unchanged",
"tired": "same outfit after many overtime nights: hair messier, faint dark circles, shirt untucked on one side, sleeves pushed up unevenly, lanyard twisted and badge crooked, slouched posture",
}

def LAYOUT(cols, rows, portrait_first):
    s = (f"LAYOUT: one sprite sheet, square 1:1, pure solid white background (#FFFFFF). Exactly {cols} columns x {rows} rows "
         f"= {cols*rows} cells, packed like a professional game asset sheet: each figure fills most of its cell but never "
         "touches or overlaps a neighbour. Same sprite size in every cell; within each row all feet rest on one shared "
         "baseline. Figures face right in a 3/4 view unless a cell says otherwise. Reading order: left to right, top to bottom. ")
    if portrait_first:
        s += ("Cell 1 (top-left) is special: a head-and-shoulders portrait inside a rounded-square frame with a thin dark "
              "outline and a soft pastel-yellow background with a few sparkles, the character smiling and holding the "
              "tablet near the face. Cell 1 is the ONLY cell with a background; every other cell is a full-body figure on "
              "pure white.")
    return s

NEG = ("DO NOT: make it photorealistic or paste the photo; include any text, letters, numbers, labels or watermark; draw "
"grid lines or cell borders (except the frame of the portrait cell); add scenery, floor or walls; add extra characters; "
"crop limbs; repeat an identical pose; change the face, hair, outfit colors or proportions between cells; use pure white "
"for clothing edges that touch the background.")

ICON_STYLE = ("ART STYLE: cute soft pixel-art game icons matching a chibi sprite set: clean dark-brown pixel outline, "
"glossy saturated colors, soft highlight top-left, no characters, each icon a clean standalone object.")

# ---------- sheets (8x7 = 56, portraits 4x5, icons 6x4)
A_ROW1 = ("Row 1 - Portrait + idle", [
  ("portrait","[portrait cell, see LAYOUT] smiling, tablet near the face, a few sparkles"),
  ("idle_01","idle loop 1/4: relaxed stance, tablet held at chest with both hands"),
  ("idle_02","idle loop 2/4: slight inhale, shoulders a tiny bit higher"),
  ("idle_03","idle loop 3/4: head tilted very slightly, calm face"),
  ("idle_back_01","standing seen from behind (back view), tablet in left hand"),
  ("idle_04","idle loop 4/4: slight exhale, glancing down at the tablet"),
  ("greet_01","friendly smile with eyes closed, small wave hello"),
  ("greet_02","cheerful open-mouth smile, raising the tablet slightly in greeting")])
A_ROW4 = ("Row 4 - Jump + startle", row("jump_sit_lie",0)[1])
A_ROW5 = ("Row 5 - Crouch + sit on a simple grey office swivel chair (same chair in every sit cell)", row("jump_sit_lie",1)[1])
A_ROW6 = ("Row 6 - Slump / lie on a small grey two-seat office sofa (same sofa in every cell)", row("jump_sit_lie",2)[1])
A_ROW7 = ("Row 7 - Full-body emotions with small effect icons", [
  ("good_01","nodding with a smile, two small golden sparkles"),("good_02","small happy fist at the chest, sparkles"),
  ("good_03","content smile, eyes closed, a small pink heart"),("bad_01","wincing, one blue sweat drop"),
  ("bad_02","leaning back, grimacing, small dark swirl"),("bad_03","awkward teeth-clenched grimace, sweat drop"),
  ("sigh_01","worried sigh, rubbing the back of the neck, small grey puff"),("sigh_02","looking down, deflated sigh")])

SHEETS = [
{"id":"A","key":"master","task":"framed portrait, idle, back view, walk and run cycles, jump, crouch, sitting, lying on a sofa, and emotion reactions","title":"Master: chân dung, đứng, đi, chạy, nhảy, ngồi, nằm, cảm xúc","cols":8,"rows":7,
 "attach":"photo","portrait_first":True,
 "purpose":"Sheet gốc, bố cục giống ảnh mẫu. Sinh đầu tiên từ ảnh thật; bản được duyệt thành ảnh tham chiếu cho sheet B–E.",
 "grid":[A_ROW1, ("Row 2 - "+row("locomotion",1)[0], row("locomotion",1)[1]),
         ("Row 3 - "+row("locomotion",2)[0], row("locomotion",2)[1]), A_ROW4, A_ROW5, A_ROW6, A_ROW7]},
{"id":"B","key":"hands_gestures","task":"holding and using a tablet, documents, phone, coffee, handshake, and talking, counting, nodding, stop, cheering, apologizing, scolding, thinking and coaching gestures","title":"Cầm nắm + cử chỉ tay chân","cols":8,"rows":7,"attach":"master",
 "purpose":"Tablet, tài liệu, điện thoại, cà phê, bắt tay; nói, đếm phương án, gật/lắc, chặn, cổ vũ, xin lỗi, khiển trách, suy nghĩ, stress, động viên.",
 "grid":[("Row 1 - Tablet", row("holding",0)[1]), ("Row 2 - Documents", row("holding",1)[1]),
         ("Row 3 - Phone, coffee, handshake", row("holding",2)[1]), ("Row 4 - Talking", row("gestures",0)[1]),
         ("Row 5 - Assertive / supportive", row("gestures",1)[1]), ("Row 6 - Apology / defensive / stern", row("gestures",2)[1]),
         ("Row 7 - Thinking / stress / confidence / coaching", row("gestures",3)[1])]},
{"id":"C","key":"work_scenes","task":"working at a desk by day and overtime at night, one-on-one talks, meeting-table talks, whiteboard review, production incident handling, rollback on a laptop, and delegating","title":"Bàn làm việc, OT, 1-1, bàn họp, bảng trắng, sự cố","cols":8,"rows":7,"attach":"master",
 "purpose":"Các cảnh làm việc theo kịch bản: làm ngày/đêm, họp 1-1, họp bàn tròn với khách, review bảng trắng, incident, rollback, giao việc.",
 "grid":[("Row 1 - "+row("desk_meeting",0)[0], row("desk_meeting",0)[1]),
         ("Row 2 - "+row("desk_meeting",1)[0], row("desk_meeting",1)[1]),
         ("Row 3 - "+row("desk_meeting",2)[0], row("desk_meeting",2)[1]),
         ("Row 4 - Seated at a small round meeting table on the right of the character (same table in every cell)", [
            ("meet_table_talk_01","seated at the table, talking with an open hand"),("meet_table_talk_02","seated, explaining, leaning in"),
            ("meet_table_listen_01","seated, listening, notebook on the table"),("meet_table_listen_02","seated, writing notes while listening"),
            ("meet_table_present_01","seated, turning the tablet toward the other side of the table"),
            ("meet_table_present_02","seated, pointing at the tablet on the table"),
            ("meet_table_worry_01","seated, hands clasped on the table, worried"),("meet_table_agree_01","seated, nodding with a relieved smile")]),
         ("Row 5 - "+row("board_incident",0)[0], row("board_incident",0)[1]),
         ("Row 6 - "+row("board_incident",1)[0], row("board_incident",1)[1]),
         ("Row 7 - "+row("board_incident",2)[0], row("board_incident",2)[1])]},
{"id":"D","key":"portraits","task":"20 framed facial-expression portraits for a dialogue box","title":"20 chân dung cảm xúc cho hộp thoại","cols":4,"rows":5,"attach":"master","portrait":True,
 "purpose":"Avatar hộp thoại, đổi theo field emotion. Cùng khung bo góc nền vàng pastel như ô 1 của sheet A.",
 "grid":next(x for x in OLD if x["key"]=="portraits")["grid"]},
{"id":"E","key":"review_endings_tired","task":"final probation review in a blazer, pass and fail endings, and an exhausted variant","title":"Final Review (blazer), kết thúc campaign, biến thể kiệt sức","cols":8,"rows":7,"attach":"master",
 "purpose":"Level 4 Final Review, 4 kết thúc, và bộ tired dùng khi có cờ pm_overloaded / team_ot_14_days.",
 "grid":[("Row 1 - OUTFIT FOR THIS ROW: "+VARIANT["formal"]+". Formal walk cycle", row("formal_review",0)[1]),
         ("Row 2 - OUTFIT FOR THIS ROW: blazer as row 1. Presenting (screen offscreen right)", row("formal_review",1)[1]),
         ("Row 3 - OUTFIT FOR THIS ROW: blazer as row 1. Q&A and waiting", row("formal_review",2)[1]),
         ("Row 4 - Normal outfit, no blazer. Pass: badge swap then celebration", row("reactions_endings",1)[1]),
         ("Row 5 - Normal outfit, no blazer, NO badge in this row. Fail", row("reactions_endings",2)[1]),
         ("Row 6 - OUTFIT FOR THIS ROW: "+VARIANT["tired"]+". Tired idle + tired talk", row("tired",0)[1]),
         ("Row 7 - Tired outfit as row 6. Tired walk cycle, dragging feet", row("tired",1)[1])]},
{"id":"F","key":"icons","task":"emote icons and HUD stat icons","title":"Icon emote và icon chỉ số","cols":6,"rows":4,"attach":None,"icons":True,
 "purpose":"Emote nổi trên đầu + icon 7 thanh chỉ số HUD. Không cần đính kèm ảnh.",
 "grid":next(x for x in OLD if x["key"]=="icons")["grid"]},
]
