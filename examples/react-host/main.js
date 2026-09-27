// Vi du web chu dung React: nut "Chơi game" mo <RoleCraftGame> (phu toan man hinh), nut Thoat trong game dong lai.
// Cac callback API: o day chi ghi vao nhat ky tren trang; web that thay bang fetch/axios toi backend.
// Chay: npm run demo:embed  -> mo /examples/react-host/
import { createElement as h, useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RoleCraftGame } from '../../dist/embed/rolecraft-game.js';

const USER = { id: 'u-042', name: 'Nguyễn Khánh An' };
// "backend" gia lap: tien do luu theo nguoi dung (web that: GET/PUT /api/rolecraft/:userId)
const api = {
  load: async () => JSON.parse(sessionStorage.getItem(`srv.${USER.id}`) || 'null'),
  save: async state => sessionStorage.setItem(`srv.${USER.id}`, JSON.stringify(state)),
};

function App() {
  const [open, setOpen] = useState(false), [log, setLog] = useState([]);
  const note = (type, text) => setLog(l => [`${new Date().toLocaleTimeString('vi')} · ${type}: ${text}`, ...l].slice(0, 12));
  return h('div', { className: 'card' },
    h('h1', null, 'Cổng đào tạo nội bộ'),
    h('p', null, `Xin chào ${USER.name}. Trang chủ giả lập có CSS riêng; game mở dạng lớp phủ, tiến độ lưu theo người dùng.`),
    h('button', { id: 'playBtn', onClick: () => setOpen(true) }, 'Chơi game PM 60 ngày'),
    h('ol', { id: 'api-log' }, log.map((l, i) => h('li', { key: i }, l))),
    open && h(RoleCraftGame, {
      assetBase: '/dist/embed/assets/',
      storageKey: `rolecraft.${USER.id}`,
      player: { name: USER.name },
      loadProgress: api.load,
      saveProgress: state => { api.save(state); note('saveProgress', `level ${state.game?.level || '-'}`); },
      onChoice: e => note('onChoice', `${e.no} → ${e.choice} (${e.label})`),
      onLevelComplete: e => note('onLevelComplete', `Level ${e.level}${e.tier ? ' · ' + e.tier.label : ''}`),
      onFinish: r => note('onFinish', `${r.result.label} · ${r.result.title}`),
      onExit: () => { setOpen(false); note('onExit', 'đóng game'); },
    }),
  );
}
createRoot(document.getElementById('root')).render(h(StrictMode, null, h(App)));
