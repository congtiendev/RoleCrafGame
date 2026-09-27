// Trang game.html: game chiem ca trang, hash (#name, #play) de mo thang mot man khi phat trien.
import '../styles/index.css';
import '../fonts/vt323.css';
import { $ } from '../shared/ui.js';
import { mountGame } from './app.js';

mountGame($('app'), { hash: true, start: location.hash.slice(1) });
