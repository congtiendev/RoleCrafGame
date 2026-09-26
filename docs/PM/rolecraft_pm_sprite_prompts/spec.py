# -*- coding: utf-8 -*-
# v3: do cam tay va noi that TACH ROI, ghep lai bang JS. Nhan vat ve tay khong + cham danh dau diem neo.
import copy, re
import spec_v2 as V2
from spec_v2 import ATTACH_MASTER, ATTACH_PHOTO, IDENTITY, STYLE, NEG, ICON_STYLE, LAYOUT, VARIANT

OUTFIT = V2.OUTFIT.replace(
 "Signature prop: a tablet in a teal-green protective case, carried in most poses the way a hero always carries the same item.",
 "Signature prop: a tablet in a teal-green case. It is added later by code, so do NOT draw it (except in the framed portrait cell).")

OBJECT_RULE = ("OBJECT RULE (overrides every cell description): all handheld objects and all furniture are separate sprites "
"that will be placed by code. Wherever a cell mentions a tablet, phone, folder, paper, contract, notebook, pen, mug, marker, "
"clicker, laptop, checklist, card, badge held in the hand, cardboard box, chair, sofa, desk, table, whiteboard, lamp or mugs, "
"do NOT draw that object. Instead draw the empty hand(s) in the exact grip pose as if holding it, and the body sitting or "
"lying at the correct height as if on the invisible furniture. Keep the worn lanyard badge and any worn headset as part of "
"the character. MARKER DOTS: small solid round dots about 1.5% of the cell width, flat color, no outline, no shading, "
"drawn on top of the character. MAGENTA #FF00FF = grip point of the main held object (for a two-handed hold, midway "
"between the hands). GREEN #00FF00 = grip point of a second object held in the other hand. CYAN #00FFFF = seat contact "
"point (middle of the hips where they touch the seat) for sitting or lying poses. Draw only the dots listed in each "
"cell's [markers] tag; cells without a tag have no dots. Never use these three colors anywhere else.")

ROW_TITLE_FIX = {
 "Row 5 - Crouch + sit on a simple grey office swivel chair (same chair in every sit cell)":
   "Row 5 - Crouch + sit (the office chair is invisible: sit on nothing at chair height, same seat height in every sit cell)",
 "Row 6 - Slump / lie on a small grey two-seat office sofa (same sofa in every cell)":
   "Row 6 - Slump / lie (the two-seat sofa is invisible: the body rests on nothing at sofa height, same height in every cell)",
 "Row 1 - Day desk: simple light-wood desk with a monitor on the right side of the character (same desk in every cell)":
   "Row 1 - Day desk (desk, monitor and chair are invisible; the desk would be on the right; seated at desk height, same seat height in every cell)",
 "Row 2 - Night overtime: same desk plus a lit desk lamp and two coffee mugs; warm lamp light only on the character, background stays pure white":
   "Row 2 - Night overtime (desk, lamp, mugs and chair are invisible; warm lamp light from the right on the character only; background stays pure white)",
 "Row 3 - One-on-one: seated on a chair, no table": "Row 3 - One-on-one: seated on an invisible chair, no table",
 "Row 4 - Seated at a small round meeting table on the right of the character (same table in every cell)":
   "Row 4 - Seated at an invisible round meeting table on the right (chair and table invisible, same seat height in every cell)",
 "Row 5 - Whiteboard: small mobile whiteboard on wheels to the right of the character, simple boxes-and-arrows doodle, no text (same board in every cell)":
   "Row 5 - Whiteboard (the whiteboard is invisible and stands on the right; the arm reaches toward it)",
}

# ---------------- props (P) va noi that (O)
# ratio = canh dai nhat cua vat / chieu cao idle_01 cua nhan vat (script dung de chuan hoa ti le)
PROPS = [
 ("Row 1 - Tablet, phone, laptop", [
  ("tablet_back","teal-green cased tablet seen from the back, upright, as held against the chest",0.32),
  ("tablet_screen_front","the tablet upright with the screen facing the viewer; the screen is a flat solid GREEN #00FF00 area",0.32),
  ("tablet_screen_34","the tablet turned so the screen faces right at a 3/4 angle; visible screen part is flat solid GREEN #00FF00",0.32),
  ("tablet_edge","the tablet seen almost edge-on, thin, as tucked under an arm",0.32),
  ("tablet_flat","the tablet lying flat, screen up, seen from a low angle; screen flat solid GREEN #00FF00",0.32),
  ("phone_back","smartphone seen from the back, upright",0.14),
  ("phone_screen","smartphone with the screen facing the viewer; screen flat solid GREEN #00FF00",0.14),
  ("laptop_closed","closed silver laptop, seen 3/4",0.36)]),
 ("Row 2 - Paper", [
  ("folder_closed","closed navy document folder with papers peeking out",0.32),("folder_open","open navy folder with printed pages, seen at a reading angle",0.34),
  ("contract_sheet","single printed contract page with grey lines (no readable text)",0.28),("paper_stack","small untidy stack of papers held together",0.30),
  ("papers_scattered","a few papers scattered flat on the floor, seen from the side at a low angle",0.45),("notebook_open","small open spiral notebook",0.26),
  ("pen","ballpoint pen",0.12),("checklist_sheet","printed checklist sheet with grey check boxes (no readable text)",0.26)]),
 ("Row 3 - Office items", [
  ("task_card","small index card with grey lines",0.14),("mug_steam","cream coffee mug with steam",0.12),("mug_plain","cream coffee mug without steam",0.11),
  ("marker","black whiteboard marker, uncapped",0.12),("clicker","small black presentation clicker",0.08),
  ("laptop_open_34","open silver laptop seen 3/4 from behind-left, as balanced on a forearm (lid back visible, keyboard partly visible)",0.40),
  ("laptop_open_front","open silver laptop with the screen facing the viewer; screen flat solid GREEN #00FF00",0.40),
  ("cardboard_box","open cardboard box holding a small potted plant, a mug and a notebook",0.45)]),
 ("Row 4 - Badges and desk decor", [
  ("badge_orange","orange ID badge card on an orange lanyard, loose in the hand, blank card",0.14),
  ("badge_blue","royal-blue ID badge card on a royal-blue lanyard, loose in the hand, blank card",0.14),
  ("mugs_pair","two cream coffee mugs side by side, one tipped slightly",0.20),("lamp_on","small desk lamp, switched on, warm glow drawn only on the lamp",0.30),
  ("lamp_off","the same desk lamp switched off",0.30),("plant_small","small potted desk plant",0.20),
  ("sticky_notes","small pad of yellow sticky notes",0.10),("notebook_closed","closed spiral notebook",0.22)]),
]
PROP_RULE = ("MARKERS on every item: one small solid MAGENTA #FF00FF dot at the grip point (where the center of a hand holds "
"it) or, for items that stand or lie on a surface, at the bottom-center contact point. Screens are flat solid GREEN #00FF00 "
"with no reflections. Never use these colors elsewhere.")

FURN = [
 ("Row 1 - Seating and tables", [
  ("office_chair","grey office swivel chair seen from the side-left 3/4, so a character facing right sits on it",0.75),
  ("meeting_chair","simple grey meeting chair, same orientation",0.72),
  ("sofa","small grey two-seat office sofa, same orientation",1.40),
  ("desk_monitor","light-wood office desk with a monitor, keyboard and mouse, seen so a seated character on its left faces it; monitor screen flat solid GREEN #00FF00",1.30)]),
 ("Row 2 - Meeting and boards", [
  ("meeting_table","small round light-wood meeting table, seen so a seated character on its left faces it",0.95),
  ("whiteboard","mobile whiteboard on wheels with a simple boxes-and-arrows doodle (no text), seen from the left 3/4",1.30),
  ("presentation_screen","presentation screen on a stand; the screen area is flat solid GREEN #00FF00",1.60),
  ("kanban_normal","wall kanban board with a few colorful sticky notes in columns (no text)",1.10)]),
 ("Row 3 - Scene states", [
  ("kanban_overloaded","the same kanban board overloaded with many red sticky notes",1.10),
  ("checklist_poster","wall poster showing a checklist with green ticks (no readable text)",0.60),
  ("monitor_alert","computer monitor showing a red alert dashboard with warning icons (no text)",0.50),
  ("plant_tall","tall potted office plant",1.10)]),
]
FURN_RULE = ("MARKERS: CYAN #00FFFF dot at the seat point (top-center of the seat cushion) of chairs and the sofa, and for the "
"desk and meeting table at the point where the seated person's hips would be; MAGENTA #FF00FF dot at the placement point "
"on the top surface of the desk and table, and at the bottom-center floor/wall contact point of every other item. Screens "
"are flat solid GREEN #00FF00. Never use these colors elsewhere.")

# ---------------- gan ket tung o nhan vat -> do vat / noi that
def P(id, at="grip", z="front", rot=0): return {"prop": id, "at": at, "z": z, "rot": rot}
def F(id, at="seat", z="back"): return {"furniture": id, "at": at, "z": z}
CHAIR, DESK, MCHAIR, MTABLE, SOFA, WB = F("office_chair"), F("desk_monitor", z="front"), F("meeting_chair"), F("meeting_table", z="front"), F("sofa"), F("whiteboard","beside_right")

RULES = [  # (regex, [bindings]) - khop dau tien
 (r"portrait$", []),
 (r"idle_0[1-4]$|greet_02|run_|tab_hold|tab_read|headset_02|startle_01", [P("tablet_back")]),
 (r"idle_back_01", [P("tablet_edge")]),
 (r"^walk_|formal_walk_", [P("tablet_edge", z="back")]),
 (r"tired_idle_|tired_walk_", [P("tablet_edge", rot=10)]),
 (r"crouch_01", [P("papers_scattered", "ground_front", "back")]),
 (r"crouch_02", [P("paper_stack"), P("papers_scattered", "ground_front", "back")]),
 (r"crouch_03", [P("paper_stack")]),
 (r"sit_01", [F("office_chair", "beside_right")]),
 (r"sit_03", [CHAIR, P("tablet_flat")]),
 (r"sit_0[245]", [CHAIR]),
 (r"lie_01", [SOFA, P("tablet_flat")]),
 (r"slump_|lie_0[23]|getup_", [SOFA]),
 (r"oneone_show_", [MCHAIR, P("tablet_screen_34")]),
 (r"tab_present_", [P("tablet_screen_34")]),
 (r"tab_swipe", [P("tablet_screen_front")]),
 (r"tab_tuck", [P("tablet_edge", z="back")]),
 (r"doc_carry|doc_give_01|doc_receive", [P("folder_closed")]),
 (r"doc_raise", [P("contract_sheet")]),
 (r"doc_flip", [P("folder_open")]),
 (r"phone_call_01", [P("phone_back"), P("notebook_open", "grip2")]),
 (r"phone_call_02|phone_read_|alert_0", [P("phone_back")]),
 (r"coffee_", [P("mug_steam")]),
 (r"shake_02", [P("tablet_back", "grip2")]),
 (r"nod_01", [P("notebook_open")]),
 (r"crossarms", [P("folder_closed", z="back")]),
 (r"desk_note", [CHAIR, DESK, P("notebook_open")]),
 (r"desk_stand_02", [F("desk_monitor", "beside_right"), P("tablet_back")]),
 (r"desk_", [CHAIR, DESK]),
 (r"night_", [CHAIR, DESK, P("lamp_on", "surface:desk_monitor", "front"), P("mugs_pair", "surface:desk_monitor", "front")]),
 (r"meet_note_", [MCHAIR, P("notebook_open")]),
 (r"oneone_listen_01", [MCHAIR, P("notebook_open")]),
 (r"oneone_", [MCHAIR]),
 (r"meet_table_listen_01", [MCHAIR, MTABLE, P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_listen_02", [MCHAIR, MTABLE, P("pen"), P("notebook_open", "surface:meeting_table")]),
 (r"meet_table_present_01", [MCHAIR, MTABLE, P("tablet_screen_34")]),
 (r"meet_table_present_02", [MCHAIR, MTABLE, P("tablet_flat", "surface:meeting_table")]),
 (r"meet_table_", [MCHAIR, MTABLE]),
 (r"wb_write|wb_point_02|wb_explain_01|wb_cap", [WB, P("marker")]),
 (r"wb_", [WB]),
 (r"rollback_0[123]", [P("laptop_open_34")]),
 (r"rollback_04", [P("laptop_closed", "grip2")]),
 (r"delegate_01", [P("task_card")]),
 (r"checklist_", [P("checklist_sheet")]),
 (r"present_0|nervous_", [P("clicker"), F("presentation_screen", "beside_right")]),
 (r"badge_01", [P("badge_orange")]),
 (r"badge_02", [P("badge_blue")]),
 (r"fail_0[23]|leave_", [P("cardboard_box")]),
 (r"resolve_01", [P("cardboard_box", "ground_front", "back")]),
]
def bindings(name):
    for rx, b in RULES:
        if re.search(rx, name): return copy.deepcopy(b)
    return []

LABEL = {"grip": "magenta", "grip2": "green", "seat": "cyan"}
def marker_tag(name):
    b = bindings(name)
    ms = []
    for x in b:
        at = x["at"]
        if at in LABEL and (at != "seat" or not any(m.startswith("cyan") for m in ms)):
            what = x.get("prop") or x.get("furniture")
            word = {"cardboard":"box","task":"card","paper":"papers"}.get(what.split("_")[0], what.split("_")[0])
            ms.append(f"{LABEL[at]} = {word}" if at != "seat" else "cyan = seat")
    return ("  [markers: " + "; ".join(ms) + "]") if ms else ""

# ---------------- dung sheet v3
SHEETS = []
for s in V2.SHEETS:
    s = copy.deepcopy(s)
    if s["key"] not in ("portraits", "icons"):
        g = []
        for title, row in s["grid"]:
            title = ROW_TITLE_FIX.get(title, title)
            g.append((title, [(n, d + ("" if n == "portrait" else marker_tag(n))) for n, d in row]))
        s["grid"] = g
        s["objects_rule"] = True
    SHEETS.append(s)

SHEETS.insert(5, {"id":"P","key":"props","title":"Đồ vật cầm tay (tách rời)","cols":8,"rows":4,"attach":"master_only","objects":"props",
 "task":"separate handheld and desk items that the character uses","purpose":"Vật cầm tay và đồ để bàn, mỗi món một ô, có điểm cầm (magenta) và vùng màn hình (green).",
 "grid":[(t, [(n, d) for n, d, r in row]) for t, row in PROPS]})
SHEETS.insert(6, {"id":"O","key":"furniture","title":"Nội thất và đồ trong cảnh (tách rời)","cols":4,"rows":3,"attach":"master_only","objects":"furniture",
 "task":"separate office furniture and scene items the character sits on or stands next to","purpose":"Ghế, sofa, bàn, bàn họp, bảng trắng, màn chiếu, bảng kanban… có điểm ngồi (cyan), điểm đặt (magenta), vùng màn hình (green).",
 "grid":[(t, [(n, d) for n, d, r in row]) for t, row in FURN]})

RATIO = {n: r for _, row in PROPS + FURN for n, d, r in row}
FURN_Z = {"office_chair":"back","meeting_chair":"back","sofa":"back","desk_monitor":"front","meeting_table":"front",
          "whiteboard":"back","presentation_screen":"back"}
