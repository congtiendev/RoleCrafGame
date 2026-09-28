// Trang game (index.html): game chiem ca trang, hash (#name, #play) de mo thang mot man khi phat trien.
// ?player=Ten: gia lap ten da cap tu API (nhu web chu truyen prop player) -> man #name in san ten tren the, khong nhap.
// #admin: man trinh chieu (QR + danh sach nguoi choi realtime); moi nguoi choi bao trang thai len /live
// (luc dev: may chu mock chay cung npm run dev; ban build: can may chu that o /live cung domain).
import './styles/index.css';
import './assets/fonts/vt323.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GameApp } from './GameApp.tsx';

const playerName = new URLSearchParams(location.search).get('player');

createRoot(document.getElementById('app')!).render(
  <StrictMode><GameApp hash start={location.hash.slice(1)} presenter={location.hash === '#admin'} liveUrl="/live" player={playerName ? { name: playerName } : undefined} /></StrictMode>,
);
