// Ung dung game (React): bo dieu huong man Start -> nhap ten -> choi (cac level noi tiep).
// Dung chung cho trang game.html (main.jsx) va ban nhung vao web khac (src/embed: <RoleCraftGame />).
//
// Props (deu tuy chon):
//   player          { name } – web chu da biet ten nguoi choi: bo qua the nhap ten
//   storageKey      khoa localStorage luu tien do (mac dinh 'rolecraft.pm60.session')
//   loadProgress    () => state | Promise<state> – nap tien do tu server truoc khi vao game
//   saveProgress    (state) => void – moi lan game luu (sau moi lua chon, dau / cuoi level)
//   onChoice        (e) => void – { level, scenario, no, choice, label, outcome, changes, metrics, flags, day }
//   onLevelComplete (e) => void – { level, levelId, tier, summary, metrics }
//   onFinish        (report) => void – ket qua 60 ngay: result, changes, competencies, decisions..., text (ban chu)
//   onExit          () => void – co thi man Start co nut Thoat
//   hash / start    trang rieng: dong bo #ten man tren URL, man mo dau
import { useEffect, useRef, useState } from 'react';
import { session, saveSession, useStorage, connectStorage, checkName } from './session.js';
import { StartScreen } from './screens/StartScreen.jsx';
import { NameScreen } from './screens/NameScreen.jsx';
import { PlayScreen } from './play/PlayScreen.jsx';

export function GameApp(props) {
  const { hash = false, start, storageKey, player, loadProgress, saveProgress, onExit } = props;
  const hooks = useRef(props); hooks.current = props;             // callback moi nhat, khong dung lai game khi doi
  const [screen, setScreen] = useState(null);                     // null = dang nap tien do

  useEffect(() => {
    let live = true;
    if (storageKey) useStorage(storageKey);
    connectStorage({ load: loadProgress, save: saveProgress && (s => hooks.current.saveProgress?.(s)) })
      .catch(() => { /* nap loi: choi tu ban localStorage */ })
      .then(() => {
        if (!live) return;
        const preset = player?.name && checkName(player.name).name;
        if (preset && preset !== session.playerName) { session.playerName = preset; saveSession(); }
        setScreen(['name', 'play', 'level1'].includes(start) ? (start === 'level1' ? 'play' : start) : 'start');
      });
    return () => { live = false; };
  }, [storageKey]);                                               // eslint-disable-line react-hooks/exhaustive-deps

  const go = name => {
    if (name === 'play' && !session.playerName) name = 'name';     // chua co ten thi ve man nhap ten
    setScreen(name);
    if (hash) history.replaceState(null, '', name === 'start' ? location.pathname : '#' + name);
  };
  const menuHooks = useRef(null);
  menuHooks.current = { ...props, onMenu: () => go('start') };

  if (!screen) return <section className="grid h-dvh w-full place-items-center bg-black font-pixel text-2xl tracking-widest text-white/70">ĐANG TẢI…</section>;
  if (screen === 'start') return (
    <StartScreen onStart={() => go('name')} onExit={onExit}
      onContinue={session.game && session.playerName ? () => go('play') : null} />
  );
  if (screen === 'name') return (
    <NameScreen presetName={player?.name && session.playerName} onBack={() => go('start')}
      onEnter={() => { session.game = null; saveSession(); go('play'); }} />   // Bat dau = van moi, bo ban luu cu
  );
  return <PlayScreen hooks={menuHooks} />;
}
