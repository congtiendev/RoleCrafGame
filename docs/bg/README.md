# RoleCraft PM60 — Innocom 2D backgrounds

22 ảnh nền WebP lossless (chuyển từ PNG gốc, giống hệt từng điểm ảnh), gồm 11 địa điểm × 2 bố cục độc lập. Bản PC **1672 × 941** (~16:9); bản mobile **941 × 1672** (~9:16), đúng độ phân giải ảnh gốc — không phóng lên 4K (bộ trước phóng 4K nhưng không thêm chi tiết, file nặng ~5 MB/ảnh; bộ này ~1,5 MB/ảnh). Tên file có hậu tố `_pc` và `_mobile`. Không có nhân vật hoặc UI vẽ sẵn: dùng sprite PM/NPC và các lớp HUD/hội thoại riêng trong game engine.

> Bộ thay thế ngày 2026-09-26 (ảnh ChatGPT 1–23, đổi tên theo bảng dưới). Ảnh số 22 (lobby mobile, đáy ảnh bị vỡ màu/trong suốt) không dùng. Bộ 4K cũ và ảnh gốc đã xoá.

## Các địa điểm

| Mã nền | File PC / mobile | Vai trò trong game |
|---|---|---|
| `lobby` | `lobby_pc.webp` / `lobby_mobile.webp` | Mở đầu + tổng kết Level 1, hành lang chuyển cảnh, vào khu làm việc |
| `team_floor` | `team_floor_pc.webp` / `team_floor_mobile.webp` | Khu làm việc chung của team |
| `senior_desk` | `senior_desk_pc.webp` / `senior_desk_mobile.webp` | Góc Huy, đối thoại 1–1 |
| `internal_meeting` | `internal_meeting_pc.webp` / `internal_meeting_mobile.webp` | Họp team, kế hoạch deadline, quy trình |
| `client_meeting` | `client_meeting_pc.webp` / `client_meeting_mobile.webp` | Họp với khách hàng, scope/change request |
| `incident_ops` | `incident_ops_pc.webp` / `incident_ops_mobile.webp` | Xử lý sự cố production, lỗi deploy/test |
| `final_review` | `final_review_pc.webp` / `final_review_mobile.webp` | Hội đồng đánh giá ngày 60 |
| `team_huddle` | `team_huddle_pc.webp` / `team_huddle_mobile.webp` | *(mới, chưa gán)* Bàn họp nhanh ở khu mở, cạnh pantry |
| `lounge` | `lounge_pc.webp` / `lounge_mobile.webp` | *(mới, chưa gán)* Góc nghỉ / pantry: sofa, tủ lạnh, cây nước |
| `manager_office` | `manager_office_pc.webp` / `manager_office_mobile.webp` | Phòng Anh Minh: bàn quản lý, kệ cúp, bàn tròn 1-1 — mở đầu + tổng kết Level 2, L3 S12 |
| `dev_corner` | `dev_corner_pc.webp` / `dev_corner_mobile.webp` | Khu bàn dev cạnh vách kính, bảng kế hoạch — cảnh đêm `pm_overloaded` đầu Level 2, bàn PM ở L3 S10 |

Ảnh gốc → tên file (số trong tên "Ảnh ChatGPT … -N.png"):

| Cảnh | PC | Mobile |
|---|---:|---:|
| lobby | 21 | 23 |
| team_floor | 3 | 4 |
| senior_desk | 6 | 5 |
| internal_meeting | 7 | 8 |
| client_meeting | 12 | 11 |
| incident_ops | 13 | 14 |
| final_review | 19 | 20 |
| team_huddle | 1 | 2 |
| lounge | 9 | 10 |
| manager_office | 16 | 17 |
| dev_corner | 18 | 15 |

## Nền màn hệ thống (redesign v4)

6 ảnh WebP lossless (giống hệt từng điểm ảnh PNG gốc), PC **1920 × 1080**, mobile **1080 × 1920**. Khác nền cảnh ở trên: nền `banner` và `start` đã vẽ sẵn 8 nhân vật; logo, nút, chữ, QR, thanh tải là lớp riêng (`public/ui/brand`, `ui/buttons`, `ui/loading`, `ui/qr`, `ui/participants`, `ui/frames`). Runner màn tải: `public/characters/team/main_character_runner.webp`. PNG gốc: `tools/ui-source/redesign_v4/`; tài liệu + toạ độ tích hợp: `docs/redesign_v4/`.

| Mã nền | Dùng ở |
|---|---|
| `loading` | Màn tải khi mở game (`src/screens/LoadingScreen.tsx`): runner chạy theo `integration/loading_route_points.json` |
| `banner` | Màn Start (`src/screens/StartScreen.tsx`) — khung rộng hơn `start`, thấy đủ biển Innocom |
| `qr_join` | Các màn ở sảnh (khung chung `src/screens/lobby.tsx`): kết nối điện thoại bằng QR (`QrScreen.tsx`), nhận thẻ + đoạn mở đầu (`NameScreen.tsx`) |

Chưa có màn dùng nên không đưa vào `public/`, chỉ giữ PNG gốc trong `tools/ui-source/redesign_v4/screens/`: `start` (cùng bố cục 8 nhân vật nhưng zoom sát, cắt biển Innocom — đã thay bằng `banner`) và `participants` (vòng tập hợp 8 vị trí, cho màn danh sách người chơi nếu có chế độ nhiều người). Tương tự 8 nhân vật rời `assets/characters/character_01..08.png`. Khi cần: chuyển sang WebP lossless, đặt vào `public/bg/<mã>_{pc,mobile}.webp`.

## Gán tình huống theo kịch bản thống nhất

| Level | Tình huống | Nền đề xuất | Điểm tương tác / chuyển động |
|---|---|---|---|
| 1 | S01 — Team mới, deadline cũ | `team_floor` | PM đi từ cửa trái đến khu bàn team; Huy và Lan xuất hiện ở các bàn phía sau |
| 1 | S02 — Quyền tự quyết Senior | `senior_desk` | PM tiến từ trái tới bàn Huy bên phải |
| 1 | S03 — Khách hàng thêm tính năng | `client_meeting` | PM bước vào từ cửa kính; Anh Hiệp ở phía bàn họp, Lan/Huy xuất hiện lần lượt |
| 1 | S04 — Quỹ công cụ | `team_floor` | PM đi qua bàn team; hiệu ứng chọn công cụ đặt thành lớp overlay |
| 2 | Mở đầu, tổng kết Level 2 | `manager_office` | Anh Minh giao thêm dự án B; cờ `pm_overloaded`: cảnh đêm ở `dev_corner` trước đó |
| 2 | S05 — Hai dự án cùng deadline | `internal_meeting` | PM vào phòng; Anh Minh trước màn hình họp, team quanh bàn |
| 2 | S06 — Deadline hay chất lượng | `internal_meeting` | Hiển thị phương án release trên màn hình/overlay, không ghi chết lên nền |
| 2 | S07 — Giữ nhân sự chủ chốt | `senior_desk` | Góc đối thoại PM–Huy, NPC đứng cạnh bàn |
| 2 | S08 — Khách hàng complain | `client_meeting` | Anh Hiệp xuất hiện phía bàn, PM tiến tới đối thoại |
| 3 | S09 — Production incident | `incident_ops` | PM chạy từ cửa trái tới cụm monitor; cảnh báo đỏ là phần nền, chỉ số là UI riêng |
| 3 | S10 — Sales hứa quá khả năng | `dev_corner` | Linh ghé bàn PM; nhánh B PM gọi điện cho Anh Hiệp |
| 3 | S11 — Junior gây lỗi | `incident_ops` | PM tới workstation của Nam, sau đó chuyển animation 1–1/checklist |
| 3 | S12 — Cơ hội dự án lớn | `manager_office` | Anh Minh gọi PM lên phòng |
| 3 | Tổng kết Level 3 | `team_floor` | Không có nhận xét của Anh Minh; bảng tổng kết liệt kê hậu quả đã quay lại |
| 4 | S13 — Hệ thống vận hành | `internal_meeting` | Team tụ họp; quy trình/checklist là UI overlay trên màn hình |
| 4 | S14 — Phát triển thành viên | `senior_desk` hoặc `team_floor` | Dùng góc 1–1 rồi chuyển khu làm việc cho ownership của team |
| 4 | S15 — Mở rộng hợp tác | `client_meeting` | PM trao đổi với Anh Hiệp, roadmap hiển thị bằng lớp UI |
| 4 | S16 — Final Review, kết quả thử việc | `final_review` | PM vào từ trái, dừng trước bàn hội đồng, trình bày trên màn hình |

## Gợi ý tích hợp 2D

- Dùng nền làm **back layer** toàn màn hình theo tỉ lệ tương ứng, không dùng một ảnh PC để crop tự động sang mobile.
- Vùng chân nhân vật tham khảo: PC `y ≈ 0.80–0.84H`, mobile `y ≈ 0.80–0.84H`. Hành lang đi ngang nên giới hạn khoảng PC `x = 0.06–0.94W`, mobile `x = 0.12–0.88W`; hiệu chỉnh collision thực tế theo scene.
- Kích thước nhân vật tham khảo: cao khoảng `0.20–0.27H` trên PC và `0.14–0.20H` trên mobile. Đặt bóng đổ nhỏ dưới chân, không để chân sprite vượt vào vùng hộp thoại.
- HUD cố định ở phía trên; hộp thoại, tên nhân vật, ba lựa chọn, popup chỉ số và nút Tiếp tục là các **UI layer** trong game. Với mobile, dành nhiều khoảng trống dưới cùng cho hộp thoại và nút thao tác.
- Những màn hình trong nền (phòng họp, incident) chỉ mang tính bối cảnh; nội dung tiến độ, biểu đồ, roadmap và hậu quả nên render động theo node/cờ trong kịch bản.
- Nếu muốn các NPC đi xuyên phía sau bàn hoặc cây, cần tách thêm **foreground occlusion layer**; bộ này chỉ cung cấp background phẳng và không có collision mask.

Ảnh nền được tạo bằng công cụ tạo ảnh tích hợp; bộ file này là bản gốc cho game (WebP lossless, PNG gốc đã xoá sau khi kiểm tra trùng từng điểm ảnh). Kịch bản tham chiếu: `KICH_BAN_ROLECRAFT_PM60(2).md`.
