# -*- coding: utf-8 -*-
# Sinh mapping_section.md, SOL_ONE_SHOT_PROMPT.txt va ../README_<X>_SPRITE_PROMPTS.md tu build.py + manifest.
#     python3 build.py && python3 readme.py
import glob, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build as B

man = json.load(open(glob.glob(os.path.join(HERE, '*_sprite_manifest.json'))[0]))
PREFIX = man['sheets'][0]['file'].split('_')[0]            # HUY, LAN, HA, NAM
kind = PREFIX.lower()
NAME = man['character']['name']
FOLDER = os.path.basename(HERE)
U = 'docs/KICH_BAN_ROLECRAFT_PM60.md'
chain = getattr(B, 'SCRIPT_ANIM', {})

def anim_list(xs):
    out = []
    for x in xs:
        out.append(' → '.join(f'`{c}`' for c in chain[x]) if x in chain else f'`{x}`')
    return ', '.join(out)

# ---------------------------------------------------------------- mapping_section.md
M = [f'Tên trong bảng là **nhóm animation** (`{kind}/<nhóm>`) hoặc một ô cụ thể (`{kind}/<ô>_01`). `face_*` là chân dung hộp thoại (sheet D). '
     f'Mũi tên `→` là chuỗi phát nối tiếp. Kịch bản gốc: `{U}`; thoại trong game: `THOAI_MAU.json`.\n',
     '| Cảnh | Nhịp | Thoại / diễn biến | Animation · chân dung |', '|---|---|---|---|']
for scen, beat, line, anims in B.SCENES:
    M.append(f'| `{scen}` | {beat} | {line} | {anim_list(anims)} |')
open(os.path.join(HERE, 'mapping_section.md'), 'w').write('\n'.join(M) + '\n')

# ---------------------------------------------------------------- SOL_ONE_SHOT_PROMPT.txt
first = B.SHEETS[0]
rest = [s for s in B.SHEETS if s is not first]
sol = f'''Work autonomously until everything is done. Do not ask me questions.

ATTACHMENTS
1. The photo: a real person (who agreed to this) to be turned into the game character "{NAME}".
2. PM_A_master.png: the approved master sheet of the game's main character (the young PM). Style and scale reference ONLY.
3. {FOLDER}.zip: prompts/{PREFIX}_*.txt (one image prompt per sheet), {os.path.basename(glob.glob(os.path.join(HERE, '*_sprite_manifest.json'))[0])} (grid, attachments, sprite names, prop/furniture bindings), tools/extract_anchors.py (cutting + anchor extraction) and tools/pm_compose.js.

IMPORTANT: handheld objects and furniture are SEPARATE sprites and already exist (the PM set's props, furniture and icon sheets are reused). Character sheets must show empty hands in grip poses with small marker dots (MAGENTA = main grip, GREEN = second grip, CYAN = seat point), exactly as each prompt describes.

STEPS
1. Unzip and read every prompt file and the manifest.
2. Sheet {first['id']}: call the image generation tool with the exact text of {PREFIX}_{first['id']}_{first['key']}.txt, attaching the photo as Image 1 and PM_A_master.png as Image 2. Check: {first['cols']}x{first['rows']} cells; cell 1 is a framed portrait; the face, hair and glasses (if any) are recognizable; the outfit matches the OUTFIT paragraph; the art style, outline and sprite size match PM_A_master.png; no handheld object drawn outside the portrait; marker dots present where the [markers] tags ask; no text. If a check fails, regenerate (max 3 attempts) and keep the best.
3. Sheets {", ".join(s["id"] for s in rest)}: exact prompt text, attach the photo as Image 1 and the approved {PREFIX} Sheet {first['id']} as Image 2. Same checks, plus the character matches Sheet {first['id']}. Max 3 attempts each.
4. Save the approved images into sheets/ using the file names in the manifest ({", ".join(s["file"] for s in man["sheets"])}). Run:
   python3 tools/extract_anchors.py --manifest {os.path.basename(glob.glob(os.path.join(HERE, '*_sprite_manifest.json'))[0])} --sheets sheets --out build
   Read build/report.json. For every sprite with a missing marker, regenerate only that row of its sheet (max 2 attempts per sheet), then run the script again.
5. DELIVER
   - Show all final sheets in the chat.
   - One file rolecraft_{kind}_sprites.zip containing sheets/, build/ (sprites/, anim/, anchors.json, animations.json, report.json), the manifest and tools/pm_compose.js.
   - A short table: sheet, attempts, checks passed, remaining warnings from report.json.

If you cannot finish in one reply, stop after the last completed step and state exactly which step to resume from.
'''
open(os.path.join(HERE, 'SOL_ONE_SHOT_PROMPT.txt'), 'w').write(sol)

# ---------------------------------------------------------------- README cap thu muc nhan vat
inner = B.readme(man)                         # README do build.py sinh (thu tu tao anh, tao hinh nhan vat, ...)
keep = []
for part in re.split(r'^(?=## )', inner, flags=re.M)[1:]:
    title = part.split('\n', 1)[0]
    if title.startswith(('## Thứ tự tạo ảnh', '## Tạo hình nhân vật')):
        keep.append(re.sub(r'^## ', '### ', part, flags=re.M).strip())
n = sum(len(B.cells(s)) for s in B.SHEETS)
L = [f'''# RoleCraft PM60 – Bộ prompt sprite {NAME.upper() if False else NAME}

Cùng cơ chế v3 với bộ PM (`docs/PM`) và các bộ MINH, CLIENT, LINH: nhân vật chuyển từ **ảnh thật**, vẽ **tay không** kèm **chấm neo** (magenta = điểm cầm chính, green = điểm cầm thứ hai, cyan = điểm ngồi); đồ vật và nội thất là sprite riêng, ghép bằng `pm_compose.js`. **{len(B.SHEETS)} sheet nhân vật / {n} ô**; đồ vật (P), nội thất (O), icon (F) **dùng lại sheet của PM**. Kịch bản gốc: `{U}`.

**Các file**

| File | Dùng để |
|---|---|
| `{FOLDER}/SOL_ONE_SHOT_PROMPT.txt` | Prompt gửi **một lần** cho GPT-5.6 Sol (đính kèm ảnh thật, `PM_A_master.png`, file zip thư mục này) |
| `{FOLDER}/prompts/{PREFIX}_*.txt` | Prompt từng sheet, nếu muốn sinh thủ công |
| `{FOLDER}/{os.path.basename(glob.glob(os.path.join(HERE, "*_sprite_manifest.json"))[0])}` | Lưới, ảnh đính kèm, tên sprite `{kind}/*`, **bind** từng ô → `prop/*`, `furn/*` của bộ PM |
| `{FOLDER}/mapping_section.md` | Đối chiếu kịch bản → sprite (bản gốc của mục 5) |
| `{FOLDER}/tools/` | `extract_anchors.py` (bản nhận mọi nhân vật), `pm_compose.js` |
| `{FOLDER}/build.py`, `readme.py` | Nguồn sinh prompt/manifest/README: `python3 build.py && python3 readme.py` |

---

## 1. Thứ tự sinh, ảnh đính kèm, tạo hình

''']
L.append('\n\n'.join(keep) if keep else '')
L.append(f'''
---

## 2. Điểm kiểm tra

> ✅ **Sheet {first['id']}:** nhận ra người thật; nét vẽ, viền, bóng và cỡ người khớp sheet A của PM; ô 1 là chân dung có khung; các ô khác **không có đồ vật**, tay ở tư thế cầm; chấm màu đúng các ô có `[markers]`.
>
> ✅ **Các sheet còn lại:** khớp sheet {first['id']}; không vẽ ghế, bàn, màn hình, đồ cầm tay; tư thế ngồi cùng độ cao trong một hàng; nhân vật khác nằm ngoài khung.
>
> ✅ **Sau khi chạy script:** mở `build/report.json`; mỗi dòng `missing grip/seat marker` là một ô cần sinh lại.

---

## 3. Dùng tool

```bash
python3 tools/extract_anchors.py --manifest {os.path.basename(glob.glob(os.path.join(HERE, "*_sprite_manifest.json"))[0])} --sheets sheets --out build
```

Kết quả `build/sprites/{kind}/*.png`, `anim/*.png`, `anchors.json`, `animations.json`, `report.json`. Ghép với đồ vật: nạp `anchors.json` của cả bộ PM (có `prop/*`, `furn/*`) và bộ này, rồi `PMCompose.create(anchors, manifest, base)`.

---

## 4. Chấm neo theo ô

Ô có `[markers]` trong prompt được gắn đồ vật/nội thất trong manifest (`cells[].bind`); danh sách đầy đủ ở mục 6.

---

## 5. Mapping kịch bản → sprite
''')
L.append(open(os.path.join(HERE, 'mapping_section.md')).read().strip())
L.append('\n---\n\n## 6. Chi tiết từng sheet\n')
for s in B.SHEETS:
    L.append(f"### Sheet {s['id']} – {s.get('title', s['key'])}\n\nFile `{PREFIX}_{s['id']}_{s['key']}.png`, lưới {s['cols']}×{s['rows']}, prompt `prompts/{PREFIX}_{s['id']}_{s['key']}.txt`.\n")
    L.append('| # | Tên | Mô tả |\n|---|---|---|')
    for c in B.cells(s):
        tag = '' if s.get('portrait') or c['name'] == 'portrait' else B.marker_tag(c['name']).strip()
        L.append(f"| {c['index']} | `{kind}/{c['name']}` | {c['desc']}{' ' + tag if tag else ''} |")
    L.append('')
out = os.path.join(HERE, '..', f'README_{PREFIX}_SPRITE_PROMPTS.md')
open(out, 'w').write('\n'.join(L) + '\n')
print(os.path.normpath(out))
