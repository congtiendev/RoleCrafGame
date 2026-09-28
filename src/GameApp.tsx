// Ung dung game (React): bo dieu huong man Start -> nhap ten -> choi (cac level noi tiep).
// Dung chung cho trang game index.html (main.tsx) va ban nhung vao web khac (src/embed: <RoleCraftGame />).
//
// Props (deu tuy chon):
//   player          { name } – web chu da biet ten nguoi choi: bo qua the nhap ten
//   storageKey      khoa localStorage luu tien do (mac dinh 'rolecraft.pm60.session')
//   loadProgress    () => state | Promise<state> – nap tien do tu server truoc khi vao game
//   saveProgress    (state) => void – moi lan game luu (sau moi lua chon, dau / cuoi level)
//   onChoice        (e) => void – { level, scenario, no, choice, label, outcome, changes, metrics, flags, day }
//   onLevelComplete (e) => void – { level, levelId, tier, summary, metrics }
//   onFinish        (report) => void – ket qua 60 ngay: result, changes, competencies, decisions..., text (ban chu)
//   onExit          () => void – co thi man nhap ten co nut Thoat
//   hash / start    trang rieng: dong bo #ten man tren URL, man mo dau
import { useEffect, useRef, useState } from 'react';
import { session, saveSession, resetSession, useStorage, connectStorage, checkName } from './game/session.ts';
import { StartScreen } from './screens/StartScreen.tsx';
import { NameScreen } from './screens/NameScreen.tsx';
import { LoadingScreen } from './screens/LoadingScreen.tsx';
import { PlayScreen } from './screens/play/PlayScreen.tsx';
import { preload } from './lib/images.ts';
import type { GameAppProps, PlayHooks } from './types.ts';

// Anh nap truoc trong man tai: man Start, the nhap ten (nen + PM dung cho), atlas PM man choi. Nen theo huong man hinh luc mo.
const BOOT_IMAGES = () => {
  const o = innerHeight > innerWidth ? 'mobile' : 'pc';
  return [`bg/banner_${o}.webp`, `bg/qr_join_${o}.webp`, 'ui/brand/rolecraft_logo_horizontal.webp',
    'ui/buttons/start_button_bat_dau.webp', 'sheets/start_pm_idle.webp', 'sheets/game_pm.webp'];
};

// Luong: tai -> card (Chi Ha trao the: ten tu API in san / chua co thi bat buoc nhap) -> start -> name (gioi thieu game) -> play.
// Nguoi choi dang co van do (session.game) mo lai game: bo qua card, vao thang start (nut Tiep tuc o man gioi thieu).
type Screen = 'card' | 'start' | 'name' | 'play';

export function GameApp(props: GameAppProps) {
  const { hash = false, start, storageKey, player, loadProgress, saveProgress, onExit } = props;
  const hooks = useRef(props); hooks.current = props;             // callback moi nhat, khong dung lai game khi doi
  const [screen, setScreen] = useState<Screen | null>(null);      // null = man tai (nap tien do + anh)
  const [boot, setBoot] = useState<{ p: number; next: Screen | null }>({ p: 0, next: null });   // p 0..1; next: man mo khi xong

  useEffect(() => {
    let live = true;
    if (storageKey) useStorage(storageKey);
    const imgs = BOOT_IMAGES(), total = imgs.length + 1;          // +1 = nap tien do
    let done = 0;
    const tick = () => { const p = ++done / total; if (live) setBoot(b => ({ ...b, p })); };   // ++ ngoai updater (StrictMode goi updater 2 lan)
    const data = connectStorage({ load: loadProgress, save: saveProgress && (s => hooks.current.saveProgress?.(s)) })
      .catch(() => { /* nap loi: choi tu ban localStorage */ })
      .then(tick);
    Promise.all([data, preload(imgs, tick)]).then(() => {
      if (!live) return;
      const preset = player?.name && checkName(player.name).name;
      if (preset && preset !== session.playerName) { session.playerName = preset; saveSession(); }
      const want: Screen = start === 'name' || start === 'play' ? start : start === 'level1' ? 'play' : 'start';
      // chua co ten -> nhan the (nhap ten) truoc het; nguoi choi moi (chua co van do) cung nhan the truoc man Start
      setBoot({ p: 1, next: !session.playerName || (want === 'start' && !session.game) ? 'card' : want });
    });
    return () => { live = false; };
  }, [storageKey]);                                               // eslint-disable-line react-hooks/exhaustive-deps

  const go = (name: Screen) => {
    if (!session.playerName) name = 'card';                        // chua co ten thi ve man nhan the (nhap ten)
    setScreen(name);
    if (hash) history.replaceState(null, '', location.pathname + location.search + (name === 'start' || name === 'card' ? '' : '#' + name));
  };
  const menuHooks = useRef<PlayHooks | null>(null);
  // Xoa du lieu choi: phien rong; ten tu API (tai khoan) van giu, ten tu nhap thi phai nhap lai -> ve man nhan the
  const reset = () => {
    resetSession();
    const preset = player?.name && checkName(player.name).name;
    if (preset) { session.playerName = preset; saveSession(); }
    go('card');
  };
  menuHooks.current = { ...props, onMenu: () => go('start'), onReset: reset };

  if (!screen) {
    const next = boot.next;
    return <LoadingScreen progress={boot.p} onDone={next ? () => setScreen(next) : null} />;
  }
  if (screen === 'start') return (
    <StartScreen onStart={() => go('name')} />
  );
  if (screen === 'card') return <NameScreen key="card" card locked={!!player?.name} onExit={onExit} onCard={() => go('start')} />;
  if (screen === 'name') return (
    <NameScreen key="name" onExit={onExit}
      onContinue={session.game && session.playerName ? () => go('play') : null}
      onEnter={() => { session.game = null; saveSession(); go('play'); }} />   // Bat dau = van moi, bo ban luu cu
  );
  return <PlayScreen hooks={menuHooks} />;
}
