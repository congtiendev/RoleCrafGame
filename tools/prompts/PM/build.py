# -*- coding: utf-8 -*-
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from spec import *
OUT = os.environ.get("OUT", ".")

def cells(s):
    out, n = [], 0
    for r, (title, row) in enumerate(s["grid"]):
        for c, (name, desc) in enumerate(row):
            n += 1
            out.append({"index": n, "row": r + 1, "col": c + 1, "name": name, "desc": desc})
    return out

def content(s):
    lines, n = [], 0
    for r, (title, row) in enumerate(s["grid"]):
        parts = []
        for name, desc in row:
            n += 1
            parts.append(f"({n}) {desc}")
        head = title if title.startswith("Row") else (f"Row {r+1}" + (f" - {title}" if title else ""))
        lines.append(f"{head}: " + "; ".join(parts) + ".")
    return "\n".join(lines)

def prompt(s):
    cols, rows = s["cols"], s["rows"]
    if s.get("icons"):
        lay = (f"LAYOUT: icon sheet, square 1:1, pure solid white background (#FFFFFF). Exactly {cols} columns x {rows} rows "
               f"= {cols*rows} cells, one icon per cell, centered, all icons the same visual size, no icon touching another. "
               "Reading order left to right, top to bottom.")
        neg = ("DO NOT include any text or letters except the literal symbols described (!, ?, Zzz); no watermark, grid "
               "lines, borders, characters or background.")
        return "\n\n".join([ICON_STYLE, lay, "CELLS:\n" + content(s), neg])
    if s.get("objects"):
        kind = "handheld items" if s["objects"] == "props" else "furniture and scene items"
        head = (f"TASK: create a {cols}x{rows} sheet of separate {kind} for a chibi pixel-art office game. Sheet content: {s['task']}.\n\n"
                "ATTACHED IMAGE: the approved master sprite sheet of the game character. Use it ONLY as the style and scale "
                "reference; do not draw the character.")
        style = ("ART STYLE: exactly the same soft high-resolution pixel-art style as the attached sheet: clean dark-brown "
                 "pixel outline, soft cel shading, warm natural colors, top-left light. Everything is seen in the same 3/4 "
                 "view as a character facing right.")
        lay = (f"LAYOUT: square 1:1, pure solid white background (#FFFFFF). Exactly {cols} columns x {rows} rows = {cols*rows} "
               "cells, one item per cell, centered, never touching another item. Draw every item at its correct real size "
               "relative to the chibi character in the attached sheet (for example the tablet is about as wide as the "
               "character's torso, a chair seat is at the character's knee height). No shadows under items.")
        neg = ("DO NOT: draw any character or hands; add text, letters, numbers or watermark; draw grid lines, borders, floors "
               "or backgrounds.")
        rule = PROP_RULE if s["objects"] == "props" else FURN_RULE
        return "\n\n".join([head, style, lay, rule, "CELLS:\n" + content(s), neg])
    kind = "portrait sheet (head-and-shoulders, framed)" if s.get("portrait") else "sprite sheet"
    task = (f"TASK: create a {cols}x{rows} chibi pixel-art game {kind} of the person in the attached photo, "
            f"dressed as a young project manager on probation. Sheet content: {s['task']}.")
    parts = [task, ATTACH_PHOTO if s["attach"] == "photo" else ATTACH_MASTER, IDENTITY, OUTFIT, STYLE]
    if s.get("portrait"):
        parts.append(f"LAYOUT: portrait sheet, square 1:1, pure white background outside the frames. Exactly {cols} columns x "
            f"{rows} rows = {cols*rows} cells. Every cell is a head-and-shoulders portrait of the same character inside a "
            "rounded-square frame with a thin dark outline and a soft pastel-yellow background, identical frame size and "
            "crop in every cell, exactly like the portrait in cell 1 of the master sheet. Character faces the viewer, "
            "turned slightly right, hands empty. Frames never touch. Reading order left to right, top to bottom.")
        parts.append("EXPRESSIONS:\n" + content(s))
    else:
        parts.append(LAYOUT(cols, rows, s.get("portrait_first", False)))
        if s.get("objects_rule"): parts.append(OBJECT_RULE)
        parts.append("CELLS:\n" + content(s))
    parts.append(NEG)
    return "\n\n".join(parts)

FPS = {"idle":(6,True),"walk":(10,True),"run":(14,True),"jump":(12,False),"startle":(10,False),"crouch":(8,False),
       "sit":(8,False),"slump":(6,False),"lie":(2,True),"getup":(8,False),"tired_idle":(5,True),"tired_talk":(6,True),
       "tired_walk":(8,True),"formal_walk":(10,True),"talk":(6,True),"nod":(6,True),"night_type":(6,True),
       "night_sleep":(2,True),"desk_type":(8,True),"rollback":(12,True),"wb_write":(8,True),"leave":(8,True),
       "celebrate":(8,False),"command":(6,True),"headset":(6,True),"greet":(6,False)}
def groups(s):
    g = {}
    for c in cells(s):
        m = re.match(r"(.+)_(\d\d)$", c["name"])
        g.setdefault(m.group(1) if m else c["name"], []).append(c["name"])
    return g

def main():
    os.makedirs(f"{OUT}/prompts", exist_ok=True)
    man = {"version": 3, "markers": {"grip": "#FF00FF", "grip2": "#00FF00", "seat": "#00FFFF", "screen": "#00FF00"},
           "sheets": [], "animations": {}, "objects": {}}
    for s in SHEETS:
        open(f"{OUT}/prompts/PM_{s['id']}_{s['key']}.txt", "w").write(prompt(s) + "\n")
        kind = "prop" if s.get("objects") == "props" else "furn" if s.get("objects") == "furniture" else \
               "icon" if s.get("icons") else "pm"
        cl = []
        for c in cells(s):
            e = {k: c[k] for k in ("index", "row", "col", "name")}
            e["key"] = f"{kind}/{c['name']}"
            if kind == "pm":
                b = bindings(c["name"])
                if b: e["bind"] = b
            cl.append(e)
        man["sheets"].append({"id": s["id"], "key": s["key"], "kind": kind, "file": f"PM_{s['id']}_{s['key']}.png",
                              "attach": s["attach"], "cols": s["cols"], "rows": s["rows"], "cells": cl})
        if kind in ("prop", "furn"):
            for c in cells(s):
                man["objects"][f"{kind}/{c['name']}"] = {"ratio": RATIO[c["name"]],
                    "z": FURN_Z.get(c["name"], "back") if kind == "furn" else "front"}
        if kind != "pm" or s["key"] == "portraits": continue
        for k, fr in groups(s).items():
            if k == "portrait": continue
            fps, loop = FPS.get(k, (8, False) if len(fr) > 1 else (1, False))
            man["animations"][f"pm/{k}"] = {"frames": [f"pm/{f}" for f in fr], "fps": fps, "loop": loop}
    json.dump(man, open(f"{OUT}/pm_sprite_manifest.json", "w"), ensure_ascii=False, indent=1)
    print(len(man["animations"]), "animations,", len(man["objects"]), "objects")

if __name__ == "__main__":
    main()
