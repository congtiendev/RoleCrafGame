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
//   qrUrl           link man ket noi dien thoai (mac dinh trang hien tai), false = bo man nay
//   presenter       man trinh chieu cho admin (PresenterScreen) thay cho game
//   liveUrl         may chu realtime: co -> game bao trang thai nguoi choi len man trinh chieu
//   hash / start    trang rieng: dong bo #ten man tren URL, man mo dau
import { useEffect, useRef, useState } from 'react';
import { session, saveSession, resetSession, useStorage, connectStorage, checkName } from './game/session.ts';
import { StartScreen } from './screens/StartScreen.tsx';
import { NameScreen } from './screens/NameScreen.tsx';
import { QrScreen } from './screens/QrScreen.tsx';
import { PresenterScreen } from './screens/PresenterScreen.tsx';
import { livePlayer } from './live/client.ts';
import type { LivePlayerHandle } from './live/client.ts';
import type { PlayerState } from './live/protocol.ts';
import { levelById } from './game/levels.ts';
import { campaignResult } from './game/campaign.ts';
import { LoadingScreen } from './screens/LoadingScreen.tsx';
import { PlayScreen } from './screens/play/PlayScreen.tsx';
import { preload } from './lib/images.ts';
import { initSound, play, stopLoops } from './lib/sound.ts';
import { evTarget } from './lib/ui.ts';
import type { GameAppProps, PlayHooks } from './types.ts';

// Anh nap truoc trong man tai: man Start, the nhap ten (nen + PM dung cho), atlas PM man choi. Nen theo huong man hinh luc mo.
const BOOT_IMAGES = () => {
  const o = innerHeight > innerWidth ? 'mobile' : 'pc';
  return [`bg/banner_${o}.webp`, `bg/qr_join_${o}.webp`, 'ui/brand/rolecraft_logo_horizontal.webp',
    'ui/buttons/start_button_bat_dau.webp', 'sheets/start_pm_idle.webp', 'sheets/game_pm.webp'];
};

// Luong: tai -> [qr] -> card (Chi Ha trao the: ten tu API in san / chua co thi bat buoc nhap) -> start -> name (gioi thieu game) -> play.
// qr = ket noi dien thoai lam tay cam (QrScreen), chi tren may tinh (chuot + hover); dien thoai mo link QR khong thay man nay.
// Nguoi choi dang co van do (session.game) mo lai game: bo qua qr + card, vao thang start (nut Tiep tuc o man gioi thieu).
type Screen = 'qr' | 'card' | 'start' | 'name' | 'play';
const desktop = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

// Trang thai gui len man trinh chieu theo ban luu: dang choi level nao, ngay may; da co ket qua (xong 60 ngay / bi cho nghi)
function liveState(): Partial<PlayerState> {
  const g = session.game, run = g?.run;
  if (!run) return { where: 'play', level: 1, day: 1, result: null };
  const r = run.result ? campaignResult(run) : null;
  return { where: 'play', level: levelById(g.level)?.no ?? 1, day: run.forcedExit?.day ?? run.day, result: r && { code: r.code, label: r.label, mood: r.mood } };
}

// presenter -> man trinh chieu; khong -> game (doi qua lai = doi component, React gan lai tu dau)
export function GameApp(props: GameAppProps) {
  return props.presenter
    ? <PresenterScreen liveUrl={props.liveUrl} qrUrl={props.qrUrl} onExit={props.onExit} />
    : <PlayerApp {...props} />;
}

function PlayerApp(props: GameAppProps) {
  const { hash = false, start, storageKey, player, loadProgress, saveProgress, onExit, qrUrl, liveUrl } = props;
  const hooks = useRef(props); hooks.current = props;             // callback moi nhat, khong dung lai game khi doi
  const [screen, setScreen] = useState<Screen | null>(null);      // null = man tai (nap tien do + anh)
  const [boot, setBoot] = useState<{ p: number; next: Screen | null }>({ p: 0, next: null });   // p 0..1; next: man mo khi xong
  const [met, setMet] = useState(false);                          // da qua man QR (Chi Ha da chao)
  const toCard = (): Screen => (qrUrl !== false && desktop() ? 'qr' : 'card');   // man nhan the, co man QR dung truoc

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
      if (start === 'qr') { setBoot({ p: 1, next: 'qr' }); return; }   // trang rieng #qr: xem man QR tren moi thiet bi
      const want: Screen = start === 'name' || start === 'play' ? start : start === 'level1' ? 'play' : 'start';
      // chua co ten -> nhan the (nhap ten) truoc het; nguoi choi moi (chua co van do) cung nhan the truoc man Start
      setBoot({ p: 1, next: !session.playerName || (want === 'start' && !session.game) ? toCard() : want });
    });
    return () => { live = false; };
  }, [storageKey]);                                               // eslint-disable-line react-hooks/exhaustive-deps

  // Am thanh: nap luc mo game; moi nut bam (con bat duoc) keu "pop". Nghe o pha capture tren window: ban nhung (ShadowRoot)
  // lay phan tu that qua composedPath (evTarget)
  useEffect(() => {
    initSound();
    const pop = (e: MouseEvent) => { if (evTarget(e).closest?.('button:not(:disabled)')) play('pop'); };
    addEventListener('click', pop, true);
    return () => { removeEventListener('click', pop, true); stopLoops(); };
  }, []);

  // Man trinh chieu: bao len khi da co ten va qua man nhan the (o sanh / dang choi); o sanh -> 'lobby', man choi -> level, ngay
  const live = useRef<LivePlayerHandle | null>(null);
  useEffect(() => {
    if (!liveUrl || !screen || screen === 'qr' || screen === 'card' || !session.playerName) return;
    live.current ??= livePlayer({ url: liveUrl, name: session.playerName });
    live.current.update(screen === 'play' ? liveState() : { where: 'lobby' });
  }, [screen, liveUrl]);
  useEffect(() => () => { live.current?.close(); live.current = null; }, [liveUrl]);   // go game: may chu tu bao "Da roi"
  const exit = onExit && (() => { live.current?.leave(); live.current = null; onExit(); });

  const go = (name: Screen) => {
    if (!session.playerName && name !== 'qr') name = 'card';       // chua co ten thi ve man nhan the (nhap ten)
    stopLoops();                                                   // doi man: tat go phim / buoc chan dang keu
    setScreen(name);
    if (hash) history.replaceState(null, '', location.pathname + location.search + (name === 'start' || name === 'card' || name === 'qr' ? '' : '#' + name));
  };
  const menuHooks = useRef<PlayHooks | null>(null);
  // Xoa du lieu choi: phien rong; ten tu API (tai khoan) van giu, ten tu nhap thi phai nhap lai -> ve man nhan the
  const reset = () => {
    resetSession();
    const preset = player?.name && checkName(player.name).name;
    if (preset) { session.playerName = preset; saveSession(); }
    go(toCard());
  };
  // su kien man choi: bao web chu nhu cu + cap nhat man trinh chieu (ngay moi sau moi lua chon, ket qua khi xong)
  menuHooks.current = {
    ...props, onExit: exit, onMenu: () => go('start'), onReset: reset,
    onChoice: e => { live.current?.update({ where: 'play', level: e.level, day: e.day, result: null }); props.onChoice?.(e); },
    onLevelComplete: e => { live.current?.update(liveState()); props.onLevelComplete?.(e); },
    onFinish: r => { live.current?.update(liveState()); props.onFinish?.(r); },
  };

  if (!screen) {
    const next = boot.next;
    return <LoadingScreen progress={boot.p} onDone={next ? () => setScreen(next) : null} />;
  }
  if (screen === 'start') return (
    <StartScreen onStart={() => go('name')} />
  );
  if (screen === 'qr') return <QrScreen url={qrUrl || undefined} onExit={exit} onNext={() => { setMet(true); go('card'); }} />;
  if (screen === 'card') return <NameScreen key="card" card locked={!!player?.name} met={met} onExit={exit} onCard={() => go('start')} />;
  if (screen === 'name') return (
    <NameScreen key="name" onExit={exit}
      onContinue={session.game && session.playerName ? () => go('play') : null}
      onEnter={() => { session.game = null; saveSession(); go('play'); }} />   // Bat dau = van moi, bo ban luu cu
  );
  return <PlayScreen hooks={menuHooks} />;
}
