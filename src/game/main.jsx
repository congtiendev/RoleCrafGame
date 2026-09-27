// Trang game.html: game chiem ca trang, hash (#name, #play) de mo thang mot man khi phat trien.
import '../styles/index.css';
import '../fonts/vt323.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GameApp } from './GameApp.jsx';

createRoot(document.getElementById('app')).render(
  <StrictMode><GameApp hash start={location.hash.slice(1)} /></StrictMode>,
);
