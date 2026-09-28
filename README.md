# RoleCraft PM

Game React "PM 60 ngày thử việc": Start → nhập tên nhân vật → 4 level nối tiếp (S01–S16, tổng kết từng level)
→ kết quả thử việc (Pass xuất sắc / Pass / Gia hạn / Không đạt) → báo cáo cuối. Chạy như một trang riêng hoặc nhúng
vào web khác bằng `<RoleCraftGame />` / `mountRoleCraft()`.

```
index.html              trang game (entry Vite) → src/main.tsx
dev/                    hai trang công cụ, không thuộc module phát hành:
  preview.html            XEM NHÂN VẬT (Hành động / Ô tĩnh / Sheet gốc) → src/dev/preview/
  scenario-test.html      TEST KỊCH BẢN (không phải gameplay): mở cảnh → câu hỏi → A/B/C → cảnh tiếp
public/                 ảnh nạp lúc chạy, phục vụ nguyên trạng ở gốc site
  bg/                     11 cảnh nền + 5 nền màn hệ thống v4 (loading, start, qr_join, banner, participants) × PC/mobile (WebP)
  ui/                     khung, nút, badge, thanh, con trỏ (cắt từ tools/ui-source/); brand/, loading/, qr/... của redesign v4
  characters/<ID>/        atlas NPC cho game (game.webp) + sheet cho trang xem nhân vật
  characters/team/        8 nhân vật chibi + runner màn tải (redesign v4)
  sheets/                 sheet PM (.webp), atlas game game_pm.webp, start_pm_idle.webp
src/
  index.ts              entry thư viện: RoleCraftGame, mountRoleCraft, GameApp
  main.tsx              entry trang game
  GameApp.tsx           điều hướng màn Start → nhập tên → chơi, nạp/lưu tiến độ, props nối API
  content/              NỘI DUNG GAME (sửa/thêm ở đây, engine không đổi):
    levels.ts             TẤT CẢ level trong một mảng dữ liệu (thứ tự = thứ tự chơi), mô tả định dạng ở đầu file
    cast.ts               dàn nhân vật; metrics.ts = 7 chỉ số + tài nguyên đầu game;
    competencies.ts       6 năng lực + gợi ý học tập; campaign.ts = hard fail, critical, 4 kết thúc
                          (chỉ dữ liệu, không có hàm: chuyển thẳng sang JSON / DB / API được)
  game/                 ENGINE logic thuần, có test: levels (xử lý chung mọi level), conditions (điều kiện + mẫu câu
                        dạng dữ liệu), rules (cộng/trừ, cờ, hậu quả trì hoãn), summary (tổng kết level),
                        campaign (xét kết quả 60 ngày, báo cáo), format (hiển thị số liệu), session (lưu phiên)
  canvas/               vẽ canvas: stage (PM, đồ vật), npc, portrait, pmSprite
  generated/            do tools/ sinh — KHÔNG sửa tay: data.ts, atlas.ts, npcAtlas.ts, characters.ts
  screens/              StartScreen, NameScreen; play/ = màn chơi: PlayScreen, Hud, Dialog, Choice, Result, Cards,
                        HudTour, StaffCard, director.ts (chạy kịch bản + điều khiển sân khấu),
                        pages/ (tổng kết level, báo cáo cuối và các mảnh dùng chung)
  components/           Icon, Logo, TierBadge, canvas sprite (PmIdle, Face, SheetIcon)
  hooks/                useRaf, useViewport, useMedia, useKey
  lib/                  dùng chung game + trang công cụ: ui (DOM, assetBase), icons, sprites, images, cell, state, Notice
  embed/                mount.ts (ShadowRoot, CSS riêng), RoleCraftGame.tsx
  assets/               font VT323, logo Innocom
  styles/               index.css / embed.css = entry; theme.css (token màu), base.css, tools.css (trang công cụ),
                        game/ = CSS từng phần của game (frames, scene, hud, result, summary, cursors, art…)
  dev/                  mã hai trang công cụ (preview/, scenario-test/)
tests/                  node:test — luật chơi, nội dung level đối chiếu tài liệu, campaign, atlas
tools/                  pipeline sprite (Python, cần Pillow; import_characters/slice_ui cần thêm numpy + scipy)
  build_preview.py        dò khung từng ô, đọc kịch bản + thoại → src/generated/data.ts; sinh public/sheets/start_pm_idle.webp,
                          public/sheets/game_pm.webp + src/generated/atlas.ts (thêm động tác cho game: GAME_ANIMS / GAME_PROPS)
  import_characters.py    nhập bộ sprite NPC (điền PACKS) → public/characters/ + src/generated/characters.ts + npcAtlas.ts
  slice_ui.py             cắt tools/ui-source/*.png → public/ui/ + docs/ui/ui.json
  sheets/                 8 sheet PM gốc (.png)
  ui-source/              3 sheet UI gốc
  prompts/<NHÂN VẬT>/     bộ prompt sprite từng nhân vật (PM, MINH, CLIENT, LINH, HA, HUY, LAN, NAM);
                          prompts/PM/pm_sprite_manifest.json = tên ô, animation (fps, loop), điểm neo đạo cụ
docs/
  KICH_BAN_ROLECRAFT_PM60.md  kịch bản thống nhất: tình huống, hiệu ứng cộng/trừ, cờ, kết thúc, API
  HUONG_DAN_KICH_BAN.md       hành động từng tình huống / nhánh (build_preview.py đọc)
  THOAI_MAU.json              thoại từng cảnh + khoá '… | Câu hỏi' (câu hỏi và tên lựa chọn A/B/C)
  CHI_MUC_ATLAS.csv           chỉ mục 312 ô
  NHUNG_GAME_REACT.md         cách nhúng game vào web khác
  bg/, ui/                    mô tả bộ ảnh nền (scenes.json) và bộ UI (ui.json)
examples/react-host/    web chủ mẫu dùng bản nhúng
scripts/                chép ảnh runtime vào dist/embed/assets/ sau build:embed
```

## Thêm level / nội dung

1. Thêm một phần tử vào mảng trong `src/content/levels.ts` (`{ id, no, phase, title, days, day, intro, scenarios, summary }`;
   định dạng mô tả ở đầu file, các level có sẵn làm mẫu). Không viết hàm: điều kiện (`when`) và câu thay thế (`answer`)
   là dữ liệu theo `src/game/conditions.ts`, vd `when: { any: [{ var: 'risk', gte: 50 }, { flag: 'team_ot_14_days' }] }`.
2. `npm test`: `tests/levels.test.ts` kiểm tra dữ liệu thuần, điều kiện đúng định dạng, id không trùng, tình huống nối
   nhau tới tổng kết; thêm test đối chiếu kịch bản nếu cần (`tests/levelN.test.ts`).

Nhân vật mới: `src/content/cast.ts` (+ sprite qua `tools/import_characters.py`). Chỉ số, năng lực, điều kiện kết thúc:
các file tương ứng trong `src/content/`. Không cần sửa `src/game/`, `src/screens/`.

## Chạy và build

Mã nguồn viết bằng TypeScript (strict, `tsconfig.json`). Vite build trực tiếp; Node 24 chạy thẳng `tests/*.test.ts`
(bỏ kiểu, không biên dịch), nên chỉ dùng cú pháp xoá được: không `enum` / `namespace`, import kèm đuôi `.ts`/`.tsx`,
import kiểu dùng `import type`. Kiểu nội dung game ở `src/content/schema.ts`: viết sai định dạng level là `tsc` báo lỗi.

```bash
npm install
npm run dev          # server dev: / = game, /dev/preview.html, /dev/scenario-test.html
npm run typecheck    # kiểm tra kiểu TypeScript (strict) toàn bộ src/ + tests/
npm run build        # typecheck rồi build dist/app/ (game + hai trang công cụ); xem lại bằng npm run preview
npm run build:embed  # dist/embed/: module nhúng rolecraft-game.js + types/ (.d.ts) + assets/
npm run demo:embed   # build:embed rồi mở web chủ mẫu examples/react-host/
```

Sửa manifest, kịch bản hoặc thoại xong thì sinh lại dữ liệu (lúc `npm run dev` đang chạy, việc này tự chạy khi lưu file):

```bash
python3 tools/build_preview.py
```

Unit test (node:test có sẵn trong Node) — chạy sau khi sửa luật cộng/trừ, nội dung level hoặc kịch bản:

```bash
npm test           # tests/: rules (chỉ số, cờ, hậu quả trì hoãn), session (tên), actor (PM di chuyển/animation),
                   # summary (xếp loại tổng kết, chạy đủ 81 đường đi Level 1),
                   # level1…level4 (đối chiếu docs/KICH_BAN_ROLECRAFT_PM60.md – kể cả ma trận hậu quả trì hoãn mục 8 –
                   #         + docs/THOAI_MAU.json + atlas/ảnh nền; phần đọc tài liệu dùng chung: tests/helpers/scenarioDoc.ts),
                   # campaign (chơi nối Level 1 → 2 → 3: hậu quả trì hoãn, C1/C2, xếp loại, đủ 81 × 81 đường đi L1→L2
                   #           và 4 × 81 × 81 đường đi L1→L2→L3),
                   # ending (kết quả campaign mục 9: thứ tự xét, hard fail, báo cáo, 20.000 đường đi đủ 4 level)
```

## Lưu ý khi cắt sprite

- **Không chia lưới đều.** Công thức trong `docs/HUONG_DAN_KICH_BAN.md` chia ảnh thành các ô đều nhau,
  nhưng sprite trên sheet không nằm đều nên bị chém đôi. Ví dụ hàng 1 của sheet P nằm ở y 288–427,
  trong khi lưới đều cắt ngang tại y=314. `tools/build_preview.py` dò khe trong suốt giữa các sprite để lấy
  khung thật.
- **Neo nhân vật ở chân**, không căn giữa khung: tay giơ đồ vật ra sẽ làm khung rộng lệch một phía,
  căn giữa thì cả người trượt ngang tới 16px giữa hai khung.
- **Cỡ vẽ không đồng đều giữa các ô.** Dáng đứng chuẩn (idle, walk) cao 171px, nhưng `shake` và
  `phone_read` cao 183–184px. Các animation cao hơn chuẩn được thu nhỏ theo hệ số `k`.
- **Có điểm đánh dấu vẽ sẵn trong ảnh**: chấm magenta/cyan là điểm cầm và điểm ngồi, vùng xanh lá là
  màn hình (xem `markers` trong manifest). Đưa vào game thì phải xoá hoặc thay các điểm này.

## Nhúng vào web khác (React)

Giao diện game viết bằng React (`src/GameApp.tsx`). `npm run build:embed` tạo `dist/embed/`: component `<RoleCraftGame />`
(Shadow DOM, phủ toàn màn hình, props nối API) và hàm `mountRoleCraft()`. Cách dùng xem [docs/NHUNG_GAME_REACT.md](docs/NHUNG_GAME_REACT.md).
