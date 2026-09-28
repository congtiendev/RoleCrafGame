// Trang game (index.html): game chiem ca trang, hash (#name, #play) de mo thang mot man khi phat trien.
// ?player=Ten: gia lap ten da cap tu API (nhu web chu truyen prop player) -> man #name in san ten tren the, khong nhap.
// #admin: man trinh chieu (QR + danh sach nguoi choi realtime); moi nguoi choi bao trang thai len /live
// (luc dev: may chu mock chay cung npm run dev; ban build: can may chu that o /live cung domain).
import './styles/index.css';
import './assets/fonts/vt323.css';
import { StrictMode, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { GameApp } from './GameApp.tsx';

const playerName = new URLSearchParams(location.search).get('player');

// Doi hash tren tab dang mo (vd go them #admin roi Enter: trinh duyet khong tai lai trang) -> chuyen man ngay.
// GameApp tu doi hash (#name, #play) bang history.replaceState: khong phat hashchange nen khong gan lai game.
const onHash = (f: () => void) => { addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); };
function Root() {
  const admin = useSyncExternalStore(onHash, () => location.hash === '#admin');
  return <GameApp key={admin ? 'admin' : 'game'} hash start={admin ? '' : location.hash.slice(1)} presenter={admin} liveUrl="/live"
    player={playerName ? { name: playerName } : undefined} />;
}

createRoot(document.getElementById('app')!).render(<StrictMode><Root /></StrictMode>);
