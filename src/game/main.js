import '../styles/index.css';
import '../fonts/vt323.css';
import { $ } from '../shared/ui.js';
import { mountStart } from './StartScreen.js';
import { session, saveSession } from './session.js';
import { mountName } from './NameScreen.js';
import { mountLevel } from './LevelScreen.js';

// Bo dieu huong man: moi man tra ve { update(now), destroy() }; doi man thi go man cu.
// Hash (#name) de mo thang mot man khi phat trien.
const app = $('app');
let screen = null;
function show(name, mount) {
  screen?.destroy?.();
  screen = mount();
  history.replaceState(null, '', name === 'start' ? location.pathname : '#' + name);
}

const go = {
  // Tiep tuc: con ban luu (session.game) va da co ten
  start: () => show('start', () => mountStart(app, { onStart: go.name, onContinue: session.game && session.playerName ? go.play : null })),
  name: () => show('name', () => mountName(app, {
    onBack: go.start,
    onEnter: () => { session.game = null; saveSession(); go.play(); },   // Bat dau = van moi, bo ban luu cu
  })),
  // Man choi: cac level noi tiep (Level 1 -> Level 2...), choi tiep phien dang do. Chua co ten (mo thang #play) thi ve man nhap ten
  play: () => (session.playerName ? show('play', () => mountLevel(app, { onMenu: go.start })) : go.name()),
};
go.level1 = go.play;                                       // hash cu #level1
(go[location.hash.slice(1)] || go.start)();

function tick(now) { requestAnimationFrame(tick); screen?.update?.(now); }
requestAnimationFrame(tick);
