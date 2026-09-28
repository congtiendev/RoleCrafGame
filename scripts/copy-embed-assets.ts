// Chep anh game can luc chay vao dist/embed/assets/ (sau build:embed). Chi chep file game thuc su nap:
// nen bg/*_{pc,mobile}.webp, runner man tai, ui/ (CSS dung khung, nut, con tro; JS dung badge), atlas NPC characters/<id>/game.webp,
// sheets: atlas PM, PM dung cho, chan dung (D), icon/emote (F).
import { cpSync, mkdirSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const PUB = resolve(import.meta.dirname, '../public'), OUT = resolve(import.meta.dirname, '../dist/embed/assets');
const files = [
  ...readdirSync(resolve(PUB, 'bg')).filter(f => /_(pc|mobile)\.webp$/.test(f)).map(f => `bg/${f}`),
  ...readdirSync(resolve(PUB, 'ui'), { recursive: true, encoding: 'utf8' }).map(f => `ui/${f.replaceAll('\\', '/')}`)
    .filter(f => /\.(webp|png)$/.test(f)),
  ...readdirSync(resolve(PUB, 'characters')).filter(d => existsSync(resolve(PUB, 'characters', d, 'game.webp'))).map(d => `characters/${d}/game.webp`),
  'characters/team/main_character_runner.webp',                 // runner man tai
  ...readdirSync(resolve(PUB, 'sounds')).filter(f => f.endsWith('.mp3')).map(f => `sounds/${f}`),   // am thanh (lib/sound.ts)
  'sheets/game_pm.webp', 'sheets/start_pm_idle.webp', 'sheets/PM_D_portraits.webp', 'sheets/PM_F_icons.webp',
];
let bytes = 0;
for (const f of files) {
  const src = resolve(PUB, f), dst = resolve(OUT, f);
  mkdirSync(dirname(dst), { recursive: true });
  cpSync(src, dst); bytes += statSync(src).size;
}
console.log(`${files.length} anh -> dist/embed/assets/ (${(bytes / 1048576).toFixed(1)} MB)`);
