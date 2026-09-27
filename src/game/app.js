// Khoi dong game vao mot phan tu: bo dieu huong man Start -> nhap ten -> choi (cac level noi tiep).
// Dung chung cho trang game.html (main.js) va ban nhung vao web khac (src/embed: React / mountRoleCraft).
import { mountStart } from './StartScreen.js';
import { session, saveSession, useStorage } from './session.js';
import { mountName } from './NameScreen.js';
import { mountLevel } from './LevelScreen.js';

// root: phan tu chua man; opts: { hash (dong bo #ten man tren URL – chi trang rieng), start (ten man mo dau),
//   storageKey (khoa localStorage luu tien do), onExit (co thi man Start co nut Thoat) }
// Tra ve destroy(): go man hien tai, dung vong ve.
export function mountGame(root, { hash = false, start, storageKey, onExit } = {}) {
  if (storageKey) useStorage(storageKey);
  let screen = null, raf = 0, alive = true;
  // moi man tra ve { update(now), destroy() }; doi man thi go man cu
  function show(name, mount) {
    screen?.destroy?.();
    screen = mount();
    if (hash) history.replaceState(null, '', name === 'start' ? location.pathname : '#' + name);
  }
  const go = {
    // Tiep tuc: con ban luu (session.game) va da co ten
    start: () => show('start', () => mountStart(root, { onStart: go.name, onContinue: session.game && session.playerName ? go.play : null, onExit })),
    name: () => show('name', () => mountName(root, {
      onBack: go.start,
      onEnter: () => { session.game = null; saveSession(); go.play(); },   // Bat dau = van moi, bo ban luu cu
    })),
    // Man choi: cac level noi tiep, choi tiep phien dang do. Chua co ten thi ve man nhap ten
    play: () => (session.playerName ? show('play', () => mountLevel(root, { onMenu: go.start })) : go.name()),
  };
  go.level1 = go.play;                                       // hash cu #level1
  (go[start] || go.start)();

  const tick = now => { if (!alive) return; raf = requestAnimationFrame(tick); screen?.update?.(now); };
  raf = requestAnimationFrame(tick);
  return function destroy() {
    alive = false; cancelAnimationFrame(raf);
    screen?.destroy?.(); screen = null;
    root.innerHTML = '';
  };
}
