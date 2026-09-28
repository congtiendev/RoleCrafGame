# Game RoleCraft PM60 bằng React và cách nhúng vào web khác

Toàn bộ giao diện game được viết bằng React (JSX): màn bắt đầu, nhập tên, màn chơi, HUD, hội thoại, lựa chọn, bảng kết quả, tổng kết, báo cáo, thẻ chuyển cảnh, hướng dẫn chỉ số và thẻ nhân viên. Logic game và phần vẽ nhân vật trên canvas vẫn là JavaScript thuần, có test đi kèm (`npm test`).

Có hai cách dùng:

- **Trang riêng** `index.html`: game chiếm cả trang (`src/main.tsx`). Chạy bằng `npm run dev`, build ra `dist/app/` bằng `npm run build`.
- **Nhúng vào web khác**: component `<RoleCraftGame />` hoặc hàm `mountRoleCraft()`. Game chạy trong Shadow DOM, nên CSS và id của game không đụng tới web chủ, và ngược lại. Khi mở, game phủ toàn màn hình.

## Build bản nhúng

```bash
npm run build:embed
```

| File | Nội dung |
|---|---|
| `dist/embed/types/` | Khai báo TypeScript (`index.d.ts`): kiểu props (`RoleCraftGameProps`, `MountOptions`) và dữ liệu sự kiện (`ChoiceEvent`, `LevelCompleteEvent`, `FinishReport`). |
| `dist/embed/rolecraft-game.js` | Module ES, khoảng 445 KB (gzip khoảng 150 KB). Đã gồm CSS và font; không gồm React (web chủ cung cấp `react` và `react-dom` bản 18 trở lên). |
| `dist/embed/assets/` | Ảnh game nạp lúc chạy (`bg/`, `ui/`, `characters/`, `sheets/`), khoảng 43 MB. Web chủ phục vụ thư mục này và truyền đường dẫn qua `assetBase`. |

## Dùng trong React, có gọi API

```jsx
import { useState } from 'react';
import { RoleCraftGame } from './vendor/rolecraft/rolecraft-game.js';

export function TrainingPage({ user }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Chơi PM 60 ngày</button>
      {open && (
        <RoleCraftGame
          assetBase="/vendor/rolecraft/assets/"
          storageKey={`rolecraft.${user.id}`}
          player={{ name: user.fullName }}
          loadProgress={() => api.get(`/rolecraft/${user.id}/progress`).then(r => r.data)}
          saveProgress={state => api.put(`/rolecraft/${user.id}/progress`, state)}
          onChoice={e => api.post('/rolecraft/events', { userId: user.id, ...e })}
          onLevelComplete={e => api.post('/rolecraft/levels', { userId: user.id, ...e })}
          onFinish={report => api.post('/rolecraft/results', { userId: user.id, ...report })}
          onExit={() => setOpen(false)}
        />
      )}
    </>
  );
}
```

Game không tự gọi API. Nó chỉ báo sự kiện ra ngoài và nhận dữ liệu vào qua props. Web chủ gọi backend bằng công cụ và token đăng nhập của chính nó.

## Props

| Prop | Ý nghĩa |
|---|---|
| `assetBase` | URL thư mục chứa `bg/ ui/ characters/ sheets/`. Có thể là đường dẫn tuyệt đối hoặc URL CDN. Mặc định là thư mục cạnh trang. |
| `player` | `{ name }`. Khi có, game bỏ qua thẻ nhập tên và vào thẳng đoạn mở đầu. |
| `storageKey` | Khoá `localStorage` lưu tiến độ. Mặc định `rolecraft.pm60.session`. Nên đặt theo người dùng. |
| `loadProgress()` | Trả về tiến độ, hoặc Promise trả về tiến độ. Game gọi hàm này trước khi vào menu; nếu có dữ liệu thì dùng thay cho bản trong `localStorage`. |
| `saveProgress(state)` | Game gọi mỗi lần lưu: sau từng lựa chọn, khi đầu level và cuối level. Game vẫn giữ một bản trong `localStorage` để mở lại nhanh. |
| `onChoice(e)` | Sau mỗi lựa chọn. `e` gồm `level`, `levelId`, `scenario`, `no`, `title`, `day`, `choice`, `label`, `outcome`, `changes`, `metrics`, `flags`. |
| `onLevelComplete(e)` | Khi xong một level. `e` gồm `level`, `levelId`, `tier`, `summary` (xếp loại, quyết định tốt nhất, năng lực, rủi ro), `metrics`. |
| `onFinish(report)` | Khi hết 60 ngày. `report` gồm `result`, `changes`, `competencies`, `decisions`, `best`, `worst`, `links`, `learning` và `text` (báo cáo dạng chữ). |
| `onExit()` | Khi có, màn nhập tên (ngay sau màn bắt đầu) và bảng tạm dừng (nút ⏸ góc phải khi đang chơi, hoặc phím Esc) hiện nút **Thoát**, gọi hàm này khi người chơi bấm. |
| `zIndex`, `lockScroll` | Lớp phủ của game (mặc định `2147483000`) và việc khoá cuộn trang chủ khi đang chơi (mặc định bật). |

Các callback đổi lúc nào cũng được, game không bị khởi động lại. Game chỉ gắn lại từ đầu khi `assetBase`, `storageKey` hoặc `player.name` thay đổi.

## Không dùng React ở web chủ

```js
import { mountRoleCraft } from './vendor/rolecraft/rolecraft-game.js';   // trang vẫn phải nạp react + react-dom

const game = mountRoleCraft(document.getElementById('game'), {
  assetBase: '/vendor/rolecraft/assets/',
  onExit: () => game.destroy(),
});
```

`mountRoleCraft` trả về `{ update(props), destroy() }`.

## Lưu ý khi tích hợp

- **Viewport trên điện thoại.** Trang chủ cần `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Thiếu `viewport-fit=cover` thì iPhone không báo vùng an toàn (tai thỏ, thanh home).
- **Cỡ chữ gốc.** Cỡ chữ trong game tính theo `rem`, tức theo `font-size` của `<html>` trang chủ. Shadow DOM không cô lập được giá trị này.
- **Font và `@property`.** Hai loại luật này chỉ có tác dụng ở cấp document, nên module tự thêm `<style id="rolecraft-global">` vào `<head>`. Các luật này không ảnh hưởng giao diện trang chủ.
- **Mỗi trang một game.** Mở game lần thứ hai sẽ tự đóng game đang mở.
- **Trình duyệt.** Tailwind 4 yêu cầu Safari 16.4 trở lên, Chrome 111 trở lên và Firefox 128 trở lên.

## Chạy ví dụ

```bash
npm run demo:embed      # build:embed rồi mở web chủ mẫu: /examples/react-host/
```

`examples/react-host/` là một trang React có CSS riêng, dùng "backend" giả lập bằng `sessionStorage`. Các callback API được ghi thành nhật ký ngay trên trang.

## Cấu trúc mã

| Thư mục / file | Vai trò |
|---|---|
| `src/index.ts` | Entry của thư viện: `RoleCraftGame`, `mountRoleCraft`, `GameApp`. |
| `src/GameApp.tsx` | Ứng dụng: điều hướng giữa các màn, nạp và lưu tiến độ, props nối API. |
| `src/screens/` | `StartScreen.tsx`, `NameScreen.tsx`. |
| `src/screens/play/director.ts` | "Đạo diễn" màn chơi: chạy kịch bản bằng async/await (nói, hỏi, chờ bấm) và điều khiển sân khấu canvas (vị trí PM và NPC, đi lại, cảnh đêm). Đổi state để React vẽ lại, rồi chờ component báo thao tác của người chơi. |
| `src/screens/play/*.tsx` | `PlayScreen` (ráp các phần), `Hud`, `Dialog`, `Choice`, `Result`, `Cards` (thẻ chuyển cảnh), `HudTour`, `StaffCard`; `pages/` = tổng kết level, báo cáo cuối. |
| `src/components/` | `Icon`, `Logo`, `TierBadge`, các canvas sprite (`PmIdle`, `Face`, `SheetIcon`). |
| `src/hooks/` | Hook dùng chung (`useRaf`, `useViewport`, `useMedia`, `useKey`). |
| `src/content/` | Nội dung game, chỉ là dữ liệu (không có hàm): `levels.ts` (mọi level trong một mảng), `cast`, `metrics`, `competencies`, `campaign`. |
| `src/game/` | Engine logic có test: `levels` (xử lý chung mọi level), `conditions` (điều kiện dạng dữ liệu), `rules`, `summary`, `campaign`, `format`, `session`. |
| `src/canvas/` | Vẽ canvas: `stage`, `npc`, `portrait`, `pmSprite`. |
| `src/generated/` | File do `tools/` sinh (atlas, dữ liệu sprite) — không sửa tay. |
| `src/lib/` | Tiện ích dùng chung với hai trang công cụ: DOM/asset (`ui.ts`), icon, sprite. |
| `src/embed/` | `mount.ts` (ShadowRoot, CSS, root React riêng), `RoleCraftGame.tsx`. |
| `public/` | Ảnh nạp lúc chạy (`bg/ ui/ characters/ sheets/`); `build:embed` chép phần game dùng sang `dist/embed/assets/`. |
| `vite.embed.config.ts` | Build dạng thư viện; React để ngoài; ảnh trong CSS không nhúng base64. |
