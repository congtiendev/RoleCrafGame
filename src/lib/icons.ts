// Bo icon chung cua ca project: Heroicons outline 24px (MIT, https://heroicons.com/outline, goi npm "heroicons").
// SVG nhung thang vao bundle luc build (?raw) -> chay offline, ca file://. Net ve = currentColor -> theo mau chu.
// Them icon: import file tu 'heroicons/24/outline/<ten>.svg?raw' roi dua vao SVG.
import arrowDown from 'heroicons/24/outline/arrow-down.svg?raw';
import arrowLeft from 'heroicons/24/outline/arrow-left.svg?raw';
import arrowPath from 'heroicons/24/outline/arrow-path.svg?raw';
import arrowRight from 'heroicons/24/outline/arrow-right.svg?raw';
import arrowUp from 'heroicons/24/outline/arrow-up.svg?raw';
import chatBubbleLeft from 'heroicons/24/outline/chat-bubble-left.svg?raw';
import clock from 'heroicons/24/outline/clock.svg?raw';
import arrowTrendingDown from 'heroicons/24/outline/arrow-trending-down.svg?raw';
import arrowTrendingUp from 'heroicons/24/outline/arrow-trending-up.svg?raw';
import bellAlert from 'heroicons/24/outline/bell-alert.svg?raw';
import bookOpen from 'heroicons/24/outline/book-open.svg?raw';
import chevronDown from 'heroicons/24/outline/chevron-down.svg?raw';
import chevronLeft from 'heroicons/24/outline/chevron-left.svg?raw';
import chevronRight from 'heroicons/24/outline/chevron-right.svg?raw';
import lightBulb from 'heroicons/24/outline/light-bulb.svg?raw';
import pause from 'heroicons/24/outline/pause.svg?raw';
import play from 'heroicons/24/outline/play.svg?raw';
import playPause from 'heroicons/24/outline/play-pause.svg?raw';
import questionMarkCircle from 'heroicons/24/outline/question-mark-circle.svg?raw';
import sparkles from 'heroicons/24/outline/sparkles.svg?raw';
import user from 'heroicons/24/outline/user.svg?raw';
import xMark from 'heroicons/24/outline/x-mark.svg?raw';
import trophy from 'heroicons/24/outline/trophy.svg?raw';
import academicCap from 'heroicons/24/outline/academic-cap.svg?raw';
import exclamationTriangle from 'heroicons/24/outline/exclamation-triangle.svg?raw';
import checkCircle from 'heroicons/24/outline/check-circle.svg?raw';
import home from 'heroicons/24/outline/home.svg?raw';
import arrowRightStartOnRectangle from 'heroicons/24/outline/arrow-right-start-on-rectangle.svg?raw';
import documentText from 'heroicons/24/outline/document-text.svg?raw';
import arrowDownTray from 'heroicons/24/outline/arrow-down-tray.svg?raw';
import pencilSquare from 'heroicons/24/outline/pencil-square.svg?raw';
import lockClosed from 'heroicons/24/outline/lock-closed.svg?raw';
import trash from 'heroicons/24/outline/trash.svg?raw';
import speakerWave from 'heroicons/24/outline/speaker-wave.svg?raw';
import speakerXMark from 'heroicons/24/outline/speaker-x-mark.svg?raw';
import camera from 'heroicons/24/outline/camera.svg?raw';
import check from 'heroicons/24/outline/check.svg?raw';
import computerDesktop from 'heroicons/24/outline/computer-desktop.svg?raw';
import devicePhoneMobile from 'heroicons/24/outline/device-phone-mobile.svg?raw';
import documentDuplicate from 'heroicons/24/outline/document-duplicate.svg?raw';
import link from 'heroicons/24/outline/link.svg?raw';
import qrCode from 'heroicons/24/outline/qr-code.svg?raw';

export const SVG = { arrowDown, arrowLeft, arrowPath, arrowRight, arrowTrendingDown, arrowTrendingUp, arrowUp, bellAlert, bookOpen, chatBubbleLeft, chevronDown, clock, chevronLeft, chevronRight,
  lightBulb, pause, play, playPause, questionMarkCircle, sparkles, user, xMark, trophy, academicCap, exclamationTriangle, checkCircle,
  home, arrowRightStartOnRectangle, documentText, arrowDownTray, pencilSquare, lockClosed, trash, speakerWave, speakerXMark,
  camera, check, computerDesktop, devicePhoneMobile, documentDuplicate, link, qrCode };

// icon('play', 'size-6') -> chuoi <svg>. cls = class Tailwind (co, mau); stroke = do day net (Heroicons mac dinh 1.5,
// UI pixel chu to nen dung 2 cho ro). Icon trang tri -> aria-hidden; nut chi co icon thi dat aria-label cho nut.
export type IconName = keyof typeof SVG;
export function icon(name: IconName, cls = 'size-5', { stroke = 2 } = {}) {
  const svg = SVG[name];
  if (!svg) throw new Error(`Chưa khai báo icon "${name}" trong lib/icons.ts`);
  return svg.replace('<svg ', `<svg class="shrink-0 ${cls}" focusable="false" `)
    .replace('stroke-width="1.5"', `stroke-width="${stroke}"`)
    .replace(/\s*data-slot="icon"/, '');
}
