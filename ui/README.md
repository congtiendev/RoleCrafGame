# RoleCraft PM60 — UI assets

179 asset WebP lossless có alpha, cắt từ 3 sheet gốc trong `source/` bằng `slice_ui.py` (ở gốc repo). Sheet gốc đã có nền trong suốt nên ảnh cắt giữ nguyên từng điểm ảnh, kể cả glow bán trong suốt; chỉ đổi alpha 254 → 255 và xoá RGB dưới vùng alpha 0. Mỗi ảnh được cắt sát, chừa 2 px trong suốt.

Tên, kích thước và vị trí trên sheet gốc của từng asset nằm trong `ui.json` (`src`, `w`, `h`, `rect`). Trong game, nạp ảnh bằng đường dẫn tương đối `ui/...`, giống `bg/` và `sheets/`; dev server Vite cũng đã phục vụ thư mục này.

## Thư mục

| Thư mục | Số lượng | Tên file | Nguồn |
|---|---|---|---|
| `cards/` | 12 | `card_<dáng>_<trạng thái>` | `card.png` |
| `buttons/` | 25 | `btn_<màu>_<trạng thái>` (nút chữ dài) | `button.png` |
| `buttons/round/` | 20 | `round_<màu>_<trạng thái>` (nút tròn trơn) | `button.png` |
| `buttons/square/` | 13 | `square_<màu>_<trạng thái>` (nút vuông trơn) | `button.png` |
| `icons/circle/` | 30 | `circle_<màu>_<icon>` | `button.png` |
| `icons/square/` | 30 | `square_<màu>_<icon>` | `button.png` |
| `badges/` | 24 | `badge_<dáng>_<hạng>` | `progress_badget.png` |
| `progress/` | 25 | thanh nền, thanh fill, segment, vòng, cung | `progress_badget.png` |

## Quy ước tên

- **Trạng thái nút:** `normal`, `selected` (viền phát sáng, dùng cho focus/đang chọn), `pressed` (tối hơn), `hover` (tối hơn `normal` một chút), `disabled` (xám).
- **Màu nút:** `blue`, `navy` (chỉ có ở nút dài, dùng cho nút phụ), `green`, `yellow`, `red`. Nút vuông trơn chỉ có `square_yellow_normal`, vì 3 nút vàng trên sheet giống hệt nhau.
- **Icon:** `close`, `check`, `back`, `next`, `play`, `pause`, `refresh`, `home`, `settings`, `info`. Trên sheet, `icons/square/square_*_check` được vẽ sẵn viền phát sáng (trạng thái `selected`).
- **Card:** các dáng là `landscape_sm`, `landscape`, `landscape_md`, `portrait`, `square`, `panel_wide` (khung lớn, hợp làm hộp thoại). Sheet không đủ mọi tổ hợp, nên xem danh sách file để biết dáng nào có trạng thái nào.
- **Badge:** các dáng là `laurel`, `shield`, `hexagon`, `rosette`, `wing_ring`, `wing_crest`; các hạng là `bronze`, `silver`, `gold`, `blue`. Lòng badge để trong suốt để đặt icon hoặc số vào giữa.
- **Progress:**
  - `track_lg`, `track_md`, `track_sm`: thanh nền tối. `track_segmented`: thanh nền 12 ô, lòng ô trong suốt.
  - `fill_<màu>_<lg|md|sm>`: thanh fill có đầu bo.
  - `segment_<màu>`: một khối ô, lặp lại để lấp `track_segmented`.
  - `ring_frame`: vòng khung, dùng cho avatar hoặc đồng hồ.
  - `arc_<màu>`: cung gauge, gồm 4 mảnh gộp làm một.

## Con trỏ chuột (`cursors/`)

Con trỏ trong `cursors/` không cắt từ sheet. Chúng lấy từ một họ hình của [Kenney Cursor Pack](https://kenney.nl/assets/cursor-pack) (giấy phép CC0, cho phép chỉnh sửa; bản gốc trong `cursors/LICENSE_kenney.txt`), vẽ lại từ SVG theo màu Innocom:

- tất cả dùng chung một mũi tên gốc và cùng nét viền navy `#081033`;
- thân màu xanh bóng, chuyển từ `#6ebeff` sang `#146eeb` theo đường chéo;
- các ký hiệu trạng thái (dấu hỏi, đồng hồ cát, biển cấm) màu đỏ;
- quầng trắng mỏng bên ngoài để nổi trên cả nền tối lẫn nền sáng.

Mỗi con trỏ có bản 32 px (`<tên>.png`) và bản 64 px cho màn retina (`<tên>@2x.png`). Con trỏ để định dạng PNG, không đổi sang WebP, vì một số trình duyệt không nhận WebP làm con trỏ.

| File | Hình gốc (Kenney) | Dùng khi | Điểm nóng (trên bản 32 px) |
|---|---|---|---|
| `arrow` | `pointer_a` | Mặc định | 10, 6 |
| `link` | `hand_small_point` | Hover chỗ bấm được: nút, link, standee nhân vật, vùng `[data-tap]` | 11, 5 |
| `press` | `hand_small_closed` | Đang nhấn giữ nút | 16, 16 |
| `text` | `bracket_a_vertical` | Ô nhập chữ | 16, 16 |
| `help` | `cursor_help` | Phần tử có tooltip nhưng không bấm được (ô chỉ số HUD) | 5, 2 |
| `busy` | `cursor_busy` | Lúc chuyển cảnh (`#lv[aria-busy]`) | 4, 2 |
| `disabled` | `cursor_disabled` | Phần tử bị khoá | 3, 2 |
| `point_e` | `hand_small_point_e` | Không phải con trỏ chuột. Đây là hình bàn tay chỉ sang phải, đặt cạnh nút `.px-btn-hint` để dẫn người chơi | — |

Các quy tắc CSS nằm cuối `src/styles/components.css` và chỉ có hiệu lực khi `<body>` có class `px-cursors`. Hiện chỉ trang game (`src/game.html`) bật class này. Hình `link@2x` còn được dùng làm bàn tay gõ ở góc hộp thoại (`#dlgNext`).

## Lưu ý khi dùng

- Glow của trạng thái `selected` đã có sẵn trong ảnh, nên kích thước ảnh lớn hơn bản `normal` vài px. Khi đổi trạng thái, căn giữa ảnh theo tâm để nút không bị xê dịch.
- Nên kéo giãn card và thanh bằng CSS `border-image` (9-slice) thay vì scale cả ảnh, để góc cam và viền không bị méo.
- Nếu đổi sheet gốc thì chạy lại lệnh sau. Script cần numpy và scipy, là những gói hệ thống chưa có sẵn:

  ```
  python3 -m venv /tmp/uivenv && /tmp/uivenv/bin/pip install numpy scipy pillow
  /tmp/uivenv/bin/python slice_ui.py
  ```

  Nếu sheet mới có số phần tử khác, script sẽ báo lỗi và dừng lại. Khi đó sửa `LAYOUT` trong script cho khớp.
