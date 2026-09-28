# ROLECRAFT — Full UI Redesign v4

> **Trong project:** ảnh đã chuyển sang WebP lossless (giống hệt từng điểm ảnh) — nền màn ở `public/bg/<màn>_{pc,mobile}.webp`, asset ở `public/ui/{brand,buttons,loading,qr,participants,frames,icons}/`, runner màn tải ở `public/characters/team/main_character_runner.webp` (nền `start`, `participants` và 8 nhân vật rời chưa có màn dùng nên chỉ giữ PNG gốc). PNG gốc: `tools/ui-source/redesign_v4/`. Không dùng bản `innocom_logo_official.png` (game đã có logo chính thức ở `src/assets/brand/`) và `main_character.png` (trùng `character_05`).

> **Logo:** cả 3 file logo gốc bị cắt ngang ở đáy khi xuất (bản ngang mất đáy khiên, còn sót vạch vàng của dòng phụ cũ). Game dùng bản ngang qua `src/components/GameTitle.tsx`: dải tiêu đề "Project Manager · 60 ngày thử việc" dính liền đáy logo, rộng bằng logo, đè lên mép cắt. Bản stacked trong `public/ui/brand/` đã tô lại vạch sót + đóng viền đáy (chưa dùng).

Bộ UI game được thiết kế lại theo phong cách 2D chibi hơi pixel, bảng màu xanh cobalt/cyan phối vàng. Tất cả màn hình có hai bản PC 16:9 và Mobile 9:16.

## Màn hình

- **Start:** ghép sẵn đủ 8 nhân vật; nhân vật chính áo xanh nhạt, kính nâu, dây đeo cam, cầm tablet xanh.
- **Banner:** đủ 8 nhân vật trong bố cục chuyển động; nhân vật chính ở giữa.
- **Loading:** chỉ có đường chạy, waypoint và cổng đích; runner, nhãn và progress bar là lớp riêng.
- **QR Join:** nền trống để chèn QR card và nội dung bằng JavaScript.
- **Participants:** có vòng tập hợp 8 vị trí; không ghép avatar, tên hoặc danh sách người chơi.

## Branding

- Logo Innocom trong cảnh dùng trực tiếp file chính thức, không redraw bằng AI.
- File nguồn: `assets/branding/innocom_logo_official.png`.
- Logo game chỉ dùng chữ **ROLECRAFT**, không có `PM60`.

## Asset tách rời

- `assets/branding/`: logo ROLECRAFT và logo Innocom chính thức.
- `assets/buttons/`: nút Start và button rỗng.
- `assets/loading/`: nhãn Loading, track rỗng và lớp fill.
- `assets/qr/`: QR frame và nền trắng cho mã QR thật.
- `assets/participants/`: slot người chơi rỗng.
- `assets/frames/`: modal, card và alert rỗng.
- `assets/characters/`: 8 nhân vật, nhân vật chính đứng và runner chạy nền trong suốt.

## Tích hợp

- Tọa độ runner: `integration/loading_route_points.json`.
- Vị trí UI responsive: `integration/layout_presets.json`.
- Ví dụ JS: `integration/RUNNER_JS_GUIDE.md`.

Không chỉnh sửa trực tiếp ảnh nền để thêm chữ, QR, progress hoặc danh sách người chơi; đặt các lớp này bằng HTML/CSS/Canvas để responsive tốt hơn.

