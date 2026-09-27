# Nhúng game RoleCraft PM60 vào web khác

Game được đóng gói thành một module ES có hai cách dùng:

- `<RoleCraftGame />`: component React (React 17 trở lên).
- `mountRoleCraft(element, options)`: hàm thuần, dùng cho web không dùng React.

Game chạy trong **Shadow DOM**, nên CSS và id của game không đụng tới web chủ, và ngược lại.

Khi mở, game **phủ toàn màn hình** (`position: fixed`). Bố cục game tính theo kích thước màn hình và được tối ưu cho điện thoại, nên không hiển thị trong một khung nhỏ trên trang. Web chủ mở game bằng một nút riêng, còn người chơi đóng game bằng nút **Thoát** ở màn bắt đầu.

## Build

```bash
npm run build:embed
```

Lệnh này tạo ra:

| File | Nội dung |
|---|---|
| `dist/embed/rolecraft-game.js` | Module ES, khoảng 420 KB (gzip khoảng 145 KB). Đã gồm CSS và font; không gồm React. |
| `dist/embed/assets/` | Ảnh game nạp lúc chạy (`bg/`, `ui/`, `characters/`, `sheets/`), khoảng 43 MB. |

Chép cả hai vào web chủ. Thư mục `assets/` phải được phục vụ như file tĩnh; đường dẫn của nó là giá trị `assetBase`.

## React

```jsx
import { useState } from 'react';
import { RoleCraftGame } from './vendor/rolecraft/rolecraft-game.js';

export function TrainingPage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Chơi PM 60 ngày</button>
      {open && (
        <RoleCraftGame
          assetBase="/vendor/rolecraft/assets/"
          storageKey={`rolecraft.${userId}`}
          onExit={() => setOpen(false)}
        />
      )}
    </>
  );
}
```

Khi component được gắn vào, game mở ra. Khi gỡ component, game đóng và dọn toàn bộ listener, vòng vẽ và style của nó.

## Không dùng React

```js
import { mountRoleCraft } from './vendor/rolecraft/rolecraft-game.js';

const close = mountRoleCraft(document.getElementById('game'), {
  assetBase: '/vendor/rolecraft/assets/',
  onExit: () => close(),
});
```

## Tuỳ chọn

| Prop / option | Mặc định | Ý nghĩa |
|---|---|---|
| `assetBase` | `''` (cạnh trang) | URL thư mục chứa `bg/ ui/ characters/ sheets/`. Có thể là đường dẫn tuyệt đối hoặc URL CDN. |
| `storageKey` | `rolecraft.pm60.session` | Khoá `localStorage` lưu tiến độ. Đặt theo người dùng nếu nhiều người dùng chung trình duyệt. |
| `onExit` | không có | Khi có, màn bắt đầu hiện nút **Thoát** và gọi hàm này khi người chơi bấm. |
| `zIndex` | `2147483000` | Lớp phủ của game. |
| `lockScroll` | `true` | Khoá cuộn trang chủ khi đang chơi và trả lại như cũ khi đóng. |
| `className`, `style` | | Chỉ có ở React: gắn cho thẻ `div` giữ chỗ. Bản thân game luôn phủ toàn màn hình. |

## Lưu ý khi tích hợp

- **Viewport trên điện thoại.** Trang chủ cần `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Thiếu `viewport-fit=cover` thì iPhone không báo vùng an toàn (tai thỏ, thanh home), và game sẽ chừa lề mặc định.
- **Cỡ chữ gốc.** Cỡ chữ trong game tính theo `rem`, tức theo `font-size` của thẻ `<html>` trang chủ. Shadow DOM không cô lập được giá trị này. Nếu trang chủ đặt `html { font-size: 62.5% }`, chữ trong game sẽ nhỏ lại tương ứng.
- **Font và `@property`.** Hai loại luật này chỉ có tác dụng ở cấp document, nên module tự thêm một thẻ `<style id="rolecraft-global">` vào `<head>` (font VT323 và các biến `--tw-*`). Các luật này không ảnh hưởng tới giao diện trang chủ.
- **Mỗi trang một game.** Mở game lần thứ hai sẽ tự đóng game đang mở.
- **Trình duyệt.** Tailwind 4 yêu cầu Safari 16.4 trở lên, Chrome 111 trở lên và Firefox 128 trở lên. iPhone chạy iOS cũ hơn 16.4 sẽ hiển thị sai kiểu.
- **Ảnh dùng CDN.** Nếu `assetBase` trỏ sang domain khác thì domain đó phải cho phép tải ảnh vào `<img>` và canvas (game không đọc điểm ảnh nên không cần CORS).

## Chạy ví dụ

```bash
npm run demo:embed      # build:embed rồi mở web chủ mẫu: /examples/react-host/
```

`examples/react-host/` là một trang React có CSS riêng (font serif, nút viền đen), dùng để kiểm tra rằng CSS hai bên không ảnh hưởng nhau.

## Cấu trúc mã

| File | Vai trò |
|---|---|
| `src/game/app.js` | `mountGame(root, opts)`: bộ điều hướng màn hình (Start → nhập tên → chơi). Dùng chung cho `game.html` và bản nhúng. |
| `src/shared/ui.js` | `setHost({ root, portal, assetBase })`: gốc DOM (document hoặc ShadowRoot), nơi gắn lớp nổi, `asset(path)` để tính đường dẫn ảnh. |
| `src/embed/mount.js` | Tạo ShadowRoot, gắn CSS (đổi `:root` thành `:host`, đổi ảnh `rc-asset:` theo `assetBase`), khoá cuộn, dọn dẹp khi đóng. |
| `src/embed/react.js` | Component React bọc `mountRoleCraft`. |
| `vite.embed.config.js` | Build dạng thư viện; React để ngoài; ảnh trong CSS không nhúng base64. |
| `scripts/copy-embed-assets.mjs` | Chép đúng những ảnh game nạp lúc chạy vào `dist/embed/assets/`. |
