# RoleCraft PM

Bộ sprite nhân vật PM (8 sheet) cùng trang xem thử hành động và kịch bản.

```
game.html               trang GAME: Start → nhập tên nhân vật + mở đầu (#name) → màn chơi (#play): Level 1 (S01–S04 → tổng kết)
                        → Level 2 kế thừa trạng thái (S05–S08 → tổng kết) → Level 3 (S09–S12 → tổng kết)
                        → Level 4 (S13–S16 + phản biện) → kết quả thử việc (Pass xuất sắc / Pass / Gia hạn / Không đạt)
                        → báo cáo cuối 3 trang (chỉ số ngày 1→60, 6 năng lực, hành trình) → tải báo cáo / chơi lại
index.html              trang XEM NHÂN VẬT (Hành động / Ô tĩnh / Sheet gốc) — đã build, không sửa tay
scenario-test.html      trang TEST KỊCH BẢN (không phải gameplay): mở cảnh → câu hỏi → chọn A/B/C → cảnh tiếp — đã build
assets/                 JS/CSS đã build (app.* / scenario-test.* / game.*)
src/                    mã nguồn (Vite + Tailwind CSS 4), chia theo trang
  game.html             khung trang game → game/main.js
  game/                 trang GAME: main (điều hướng màn), StartScreen, NameScreen, session (tên + lưu phiên), pmSprite,
                        LevelScreen (màn tình huống: chơi nối tiếp các level, HUD, thoại, lựa chọn A/B/C, kết quả,
                        cảnh kết, lưu điểm đầu level để chơi lại), level1 / level2 / level3 (nội dung từng level: CAST ở level1;
                        level2 thêm thoại theo cờ, biến thể mở cảnh, kết quả rẽ nhánh C1/C2, cảnh chuyển theo cờ;
                        level3 thêm NPC vắng mặt theo cờ, phản ứng NPC, tổng kết không nhận xét;
                        level4 thêm câu thay thế khi Huy đã nghỉ, điều kiện theo chỉ số, phản biện theo hành trình, kết thúc),
                        campaign (kết quả 60 ngày theo mục 9: critical, hard fail, báo cáo cuối + bản .txt),
                        rules (chỉ số, tài nguyên, cờ, năng lực, hậu quả trì hoãn, kế thừa trạng thái giữa level),
                        summary (xếp loại + báo cáo tổng kết level),
                        stage (vẽ PM + đồ vật), hudTour (hướng dẫn chỉ số lần đầu),
                        atlas.js (do build_preview.py sinh — không sửa tay)
  index.html            khung trang xem nhân vật → preview/main.js
  scenario-test.html    khung trang test kịch bản → scenario-test/main.js
  preview/              trang XEM NHÂN VẬT: main, Header, Grid, SheetView, DetailDialog,
                        catalog (lọc), cast + characters (đổi nhân vật), detailPlayer, sheetCanvas
  scenario-test/        trang TEST KỊCH BẢN (không phải gameplay): main, PlayHeader, PlayView,
                        scriptPlayer (mở cảnh → hỏi → nhánh), flow (cảnh tiếp theo), stage + dialogBox (vẽ sân khấu)
  shared/               dùng chung hai trang: sprites, images, state, cell (vẽ một ô), ui, Notice
  shared/data.js        dữ liệu do build_preview.py sinh — không sửa tay
  styles/               theme.css (token màu sáng/tối) + components.css (.btn, .stage…)
build_preview.py        dò khung từng ô, đọc kịch bản + thoại, ghi ra src/shared/data.js;
                        sinh sheets/start_pm_idle.webp (4 khung idle đã xoá chấm neo) cho màn Start
                        sinh sheets/game_pm.webp + src/game/atlas.js (các animation PM + đồ vật dùng trong game, đã xoá chấm neo;
                        thêm động tác mới cho game thì thêm tên vào GAME_ANIMS / GAME_PROPS)
import_characters.py    nhập bộ sprite chính thức của nhân vật khác (điền PACKS) -> characters/<ID>.webp (bộ nhiều sheet như Huy:
                        characters/<ID>/*.webp) + src/preview/characters.js;
                        có từ 2 nhân vật trở lên thì trang xem hiện ô "Nhân vật"
bg/                     7 cảnh nền × PC/mobile, WebP lossless 4K (xem bg/README.md, bg/scenes.json)
sheets/                 8 sheet gốc (.png) + bản .webp nhẹ hơn (trang ưu tiên .webp)
pm_sprite_manifest.json tên ô, animation (fps, loop), điểm neo đạo cụ
CHI_MUC_ATLAS.csv       chỉ mục 312 ô
HUONG_DAN_KICH_BAN.md   kịch bản 4 level: hành động từng tình huống / nhánh
THOAI_MAU.json          thoại từng cảnh + khoá '… | Câu hỏi' (câu hỏi và tên lựa chọn A/B/C)
docs/KICH_BAN_ROLECRAFT_PM60.md  kịch bản thống nhất: tình huống, hiệu ứng cộng/trừ, cờ, kết thúc, API
docs/<NHÂN VẬT>/        bộ prompt sprite từng nhân vật (PM, MINH, CLIENT, LINH, HA, HUY, LAN, NAM)
```

Sửa manifest, kịch bản hoặc thoại xong thì chạy lại:

```bash
python3 build_preview.py
```

Sửa giao diện trong `src/` rồi build lại (chạy lại `build_preview.py` xong cũng phải build):

```bash
npm install
npm run build      # ghi index.html, scenario-test.html, game.html + assets/ ở gốc
npm run watch      # tự build lại mỗi lần lưu — dùng kèm Live Server
npm run dev        # hoặc xem qua server dev của Vite
```

Unit test (node:test có sẵn trong Node, không cần cài thêm) — chạy sau khi sửa luật cộng/trừ, nội dung level hoặc kịch bản:

```bash
npm test           # tests/: rules (chỉ số, cờ, hậu quả trì hoãn), session (tên), actor (PM di chuyển/animation),
                   # summary (xếp loại tổng kết, chạy đủ 81 đường đi Level 1),
                   # level1…level4 (đối chiếu docs/KICH_BAN_ROLECRAFT_PM60.md – kể cả ma trận hậu quả trì hoãn mục 8 –
                   #         + THOAI_MAU.json + atlas/ảnh nền; phần đọc tài liệu dùng chung: tests/helpers/scenarioDoc.js),
                   # campaign (chơi nối Level 1 → 2 → 3: hậu quả trì hoãn, C1/C2, xếp loại, đủ 81 × 81 đường đi L1→L2
                   #           và 4 × 81 × 81 đường đi L1→L2→L3),
                   # ending (kết quả campaign mục 9: thứ tự xét, hard fail, báo cáo, 20.000 đường đi đủ 4 level)
```

## Lưu ý khi cắt sprite

- **Không chia lưới đều.** Công thức trong `HUONG_DAN_KICH_BAN.md` chia ảnh thành các ô đều nhau,
  nhưng sprite trên sheet không nằm đều nên bị chém đôi. Ví dụ hàng 1 của sheet P nằm ở y 288–427,
  trong khi lưới đều cắt ngang tại y=314. `build_preview.py` dò khe trong suốt giữa các sprite để lấy
  khung thật.
- **Neo nhân vật ở chân**, không căn giữa khung: tay giơ đồ vật ra sẽ làm khung rộng lệch một phía,
  căn giữa thì cả người trượt ngang tới 16px giữa hai khung.
- **Cỡ vẽ không đồng đều giữa các ô.** Dáng đứng chuẩn (idle, walk) cao 171px, nhưng `shake` và
  `phone_read` cao 183–184px. Các animation cao hơn chuẩn được thu nhỏ theo hệ số `k`.
- **Có điểm đánh dấu vẽ sẵn trong ảnh**: chấm magenta/cyan là điểm cầm và điểm ngồi, vùng xanh lá là
  màn hình (xem `markers` trong manifest). Đưa vào game thì phải xoá hoặc thay các điểm này.
