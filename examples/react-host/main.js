// Vi du web chu dung React: nut "Chơi game" mo <RoleCraftGame> (phu toan man hinh), nut Thoat trong game dong lai.
// Chay: npm run demo:embed  -> mo /examples/react-host/
import { createElement as h, useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RoleCraftGame } from '../../dist/embed/rolecraft-game.js';

function App() {
  const [open, setOpen] = useState(false), [exits, setExits] = useState(0);
  return h('div', { className: 'card' },
    h('h1', null, 'Cổng đào tạo nội bộ'),
    h('p', null, 'Trang chủ giả lập có CSS riêng (serif, nút viền đen). Game mở dạng lớp phủ, CSS hai bên không ảnh hưởng nhau.'),
    h('button', { id: 'playBtn', onClick: () => setOpen(true) }, 'Chơi game PM 60 ngày'),
    h('p', { id: 'app-state' }, `Đã thoát game ${exits} lần`),
    open && h(RoleCraftGame, {
      assetBase: '/dist/embed/assets/',
      storageKey: 'demo.rolecraft',
      onExit: () => { setOpen(false); setExits(n => n + 1); },
    }),
  );
}
createRoot(document.getElementById('root')).render(h(StrictMode, null, h(App)));
