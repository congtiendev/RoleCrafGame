// Man tinh huong (gameplay) – choi noi tiep cac level (LEVELS), trang thai phien ke thua tu level truoc:
// the Level -> (canh chuyen theo co) -> mo dau voi Anh Minh -> 4 tinh huong: PM di vao (hoac ngoi san), thoai, hoi,
// chon A/B/C, dien nhanh, bang ket qua cong/tru chi so tren HUD, canh ket -> tong ket level voi Anh Minh -> level ke.
// Luu phien sau moi lua chon va dau moi level: mo lai trang thi choi tiep tu tinh huong chua xong.
// PM ve bang sprite (stage.js); Anh Minh, Huy, Lan... chua co sprite day du -> the nhan vat tam (UI).
import { $, esc, asset, portal, modalOpen, activeEl, evTarget } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { session, saveSession } from './session.js';
import { METRICS, METRIC, METRIC_GROUPS, newRun, beginLevel, applyChoice, enterScenario, dueNotes, isGood, fmt, fmtNum, fmtDelta } from './rules.js';
import { LEVEL1, CAST } from './level1.js';
import { LEVEL2 } from './level2.js';
import { LEVEL3 } from './level3.js';
import { LEVEL4 } from './level4.js';
import { campaignReport, reportText } from './campaign.js';
import { summarize } from './summary.js';
import { Actor, drawStage, drawActor, drawIcon } from './stage.js';
import ATLAS from './atlas.js';
import { npcAtlas, npcImg, npcReady, drawNpcFace } from './npc.js';
import { drawFace } from './portrait.js';
import { hudTour } from './hudTour.js';
import { openStaffCard, closeStaffCard } from './staffCard.js';

const LEVELS = [LEVEL1, LEVEL2, LEVEL3, LEVEL4];                         // choi lan luot; level sau ke thua trang thai level truoc
const CPS = 45;                                          // ky tu / giay khi chu hien dan
const BG = name => ({ pc: asset(`bg/${name}_pc.webp`), mobile: asset(`bg/${name}_mobile.webp`) });
// Vi tri dung: PM + NPC dung thanh mot cum giua man nhu dang tro chuyen. Khoang cach tinh theo chieu cao nhan vat
// (view.ch): PM <-> NPC dau = TALK (noi rong neu dong tac PM trong canh co dao cu vuon sang phai – bang trang, ban hop:
// tam vuon + PROP_GAP), NPC <-> NPC = SIDE; ca cum rong qua 84% be ngang (man doc, 3 NPC) thi nen lai cho vua.
const TALK = 1.1, SIDE = 0.72, PROP_GAP = 0.45;
// tam vuon sang phai cua PM o dong tac p, don vi chieu cao dung (atlas: khung fw, goc chan ox)
const pmReach = p => { const a = ATLAS.anims[p]; return a ? (a.fw - a.ox) / ATLAS.stand : 0; };
// cac dong tac PM trong mot canh (mo canh + bien the + moi nhanh / ket qua re nhanh; canh dem an NPC nen bo dong tac dem)
const branchPoses = c => [...c.lines.map(l => l.pm), ...(c.after && !c.after.night ? [c.after.pm, c.after.then] : []),
  ...(c.outcomes || []).flatMap(branchPoses)];
const scenePoses = s => [s.enter, ...s.open.map(l => l.pm), ...Object.values(s.variants || {}).flat().map(l => l.pm),
  ...s.choices.flatMap(branchPoses)];
const SYS = { name: 'Thông báo', tint: 'var(--color-brand-blue)' };        // dong 'SYS' – thong bao he thong trong thoai
const LATER_TITLE = 'Hậu quả từ quyết định trước';                          // dong SYS bao hau qua tri hoan vua kich hoat
// PM kiet suc (co `tired` cua level, vd pm_overloaded tu Level 2): dong tac thuong -> ban met (HUONG_DAN_KICH_BAN.md muc 7)
const TIRED = { idle: 'tired_idle', talk: 'tired_talk', walk: 'tired_walk' };
const MOOD = { good: 'gm-green', mid: 'gm-yellow', bad: 'gm-red' };   // mau nhan xep loai tong ket (the phang .gm-tag)
// Huy hieu xep loai (ui/badges): vong nguyet que vang / bac / dong, so level o giua long trong suot
const TIER_BADGE = { good: 'gold', mid: 'silver', bad: 'bronze' };
const tierBadge = (no, mood, cls, numCls) => `
  <span class="relative grid shrink-0 place-items-center ${cls}">
    <img src="${asset(`ui/badges/badge_laurel_${TIER_BADGE[mood]}.webp`)}" alt="" class="absolute inset-0 size-full object-contain" draggable="false">
    <span class="relative -mt-[12%] font-pixel leading-none ${numCls}">${no}</span>
  </span>`;
const TAP_HINT = `<span class="pointer-coarse:hidden">NHẤN ENTER ĐỂ TIẾP TỤC</span><span class="hidden pointer-coarse:inline">CHẠM ĐỂ TIẾP TỤC</span>`;
// cung dieu kien voi variant hud-col (components.css)
const HUD_COL = matchMedia('(orientation: portrait), (width < 48rem)');
// cung dieu kien voi variant rs-sm (components.css): bang ket qua ban gon (them #result[data-fit]: fitResult)
const RS_SM = matchMedia('((orientation: portrait) and (width < 40rem)), (height <= 560px)');
// Thanh chi so mini (.hud-meter): moi chi so tinh tren thang 100 (quy bat dau 100, du hon thi day thanh).
// Mau theo muc co loi: rui ro (bad) cao = do. So hien kem don vi thuc te (fmt: 100tr, 40%).
const meter = (m, v) => {
  const p = Math.max(0, Math.min(1, v / 100)), good = m.bad ? 1 - p : p;
  return { width: `${p * 100}%`, tone: good >= 0.6 ? 'green' : good >= 0.35 ? 'yellow' : 'red' };
};

// Chi so HUD: moi chi so mot badge rieng, xep theo nhom; co chu co gian theo be ngang man hinh (clamp theo vw). man ngang = hang tren cung;
// man doc / hep (variant hud-col, components.css) = 2 cot doc hai ben. Man ngang: khoang cach giua 2 nhom = giua cac o (gap-x-3)
const hudStat = m => `
  <li class="hud-stat px-hud flex flex-wrap items-center gap-x-1.5 gap-y-1 px-1.5 py-1 [@media(max-height:560px)]:gap-x-1 [@media(max-height:560px)]:px-1 [@media(max-height:560px)]:py-0.5 hud-col:min-w-[58px] hud-col:flex-col hud-col:flex-nowrap hud-col:gap-y-0.5 hud-col:px-0.5 hud-col:py-1" title="${m.label}" data-stat="${m.key}">
    <canvas data-ic class="shrink-0" aria-hidden="true"></canvas>
    <span class="sr-only">${m.label}</span>
    <span data-v class="min-w-[3ch] text-[length:clamp(0.85rem,1.05vw,1.2rem)] leading-none font-bold tabular-nums transition-colors duration-300 hud-col:min-w-0 ${m.unit === '%' ? 'hud-col:text-[length:clamp(0.8rem,3.4vw,0.95rem)]' : 'hud-col:text-[length:clamp(0.68rem,2.9vw,0.8rem)]'}"></span>
    ${m.unit === '%' ? '' : `<span class="text-[length:clamp(0.6rem,0.7vw,0.75rem)] leading-none font-bold text-white/60 hud-col:text-[0.6rem]">${m.unit}</span>`}
    <span class="text-[length:clamp(0.6rem,0.7vw,0.75rem)] font-semibold text-white/65 max-xl:hidden">${m.short}</span>
    <span class="hud-meter basis-full hud-col:mt-0.5 hud-col:basis-auto" aria-hidden="true"><i data-fill></i></span>
  </li>`;
const hudGroup = (g, i) => `
  <ul data-group="${g.id}" aria-label="Chỉ số ${g.label.toLowerCase()}" class="flex items-center gap-x-3 [@media(max-height:560px)]:gap-x-2
      hud-col:absolute hud-col:top-full hud-col:mt-3 hud-col:flex-col hud-col:items-stretch hud-col:gap-y-3 ${i ? 'hud-col:right-3' : 'hud-col:left-3'}">
    <li aria-hidden="true" class="px-hud hidden px-1.5 pt-1 pb-1.5 text-[0.62rem] leading-none font-bold tracking-wider whitespace-nowrap text-white/80 uppercase hud-col:block">${g.label}</li>
    ${METRICS.filter(m => m.group === g.id).map(hudStat).join('')}
  </ul>`;

const template = () => `
  <section id="lv" class="relative h-dvh w-full overflow-hidden bg-black select-none">
    <picture>
      <source id="bgMobile" media="(orientation: portrait)">
      <img id="bgImg" alt="" class="absolute inset-0 size-full object-cover" draggable="false">
    </picture>
    <div class="absolute inset-0 bg-linear-to-b from-px-ink/55 via-transparent via-40% to-px-ink/45"></div>
    <!-- lop toi mo khi bang ket qua mo: vung sang tron quanh PM (update() dat --fx/--fy/--fr), nen + NPC chim xuong -->
    <div id="focus" class="stage-focus pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 in-data-[focus]:opacity-100"></div>
    <canvas id="stage" class="pointer-events-none absolute inset-0 size-full" aria-hidden="true"></canvas>
    <div id="npcs" class="pointer-events-none absolute inset-0 transition-[filter] duration-500 in-data-[focus]:brightness-[.35]"></div>
    <!-- vung bam tren PM (ve bang canvas): bam -> the nhan vien cua nguoi choi; update() dat theo vi tri PM moi khung -->
    <button type="button" id="pmHit" class="absolute rounded-xl outline-none focus-visible:outline-[3px] focus-visible:outline-[#5ec8ff]" aria-label="Xem thẻ nhân viên của bạn" title="Thẻ nhân viên của bạn"></button>

    <!-- HUD: level + ngay, 7 chi so -->
    <header id="hud" class="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 pt-safe-3 px-safe-3 max-md:p-2 max-md:pt-safe-2 max-md:px-safe-2">
      <div class="flex shrink-0 items-center gap-3 max-sm:gap-2">
        <button id="menuBtn" class="px-btn px-btn-blue px-btn-sq max-sm:size-10" title="Về menu" aria-label="Về menu">${icon('arrowLeft', 'size-6 max-sm:size-5', { stroke: 2.5 })}</button>
        <button id="tourBtn" class="px-btn px-btn-blue px-btn-sq max-sm:size-10" title="Hướng dẫn chỉ số" aria-label="Hướng dẫn chỉ số">${icon('questionMarkCircle', 'size-6 max-sm:size-5', { stroke: 2.25 })}</button>
        <!-- ten level + ngay tren mot dong, khong xuong dong; PC (hud-row): dat duoi nut menu (ngoai khung header, khong day
             san khau xuong) de hang chi so ngang du cho so tien day du -->
        <div class="px-hud hud-row:absolute hud-row:top-full hud-row:left-3 flex items-baseline gap-2.5 px-2.5 py-1.5 whitespace-nowrap max-sm:gap-2 max-sm:px-2">
          <p class="font-pixel text-[length:clamp(1.1rem,1.5vw,1.45rem)] leading-none tracking-wider text-px-hi" id="hudLv"></p>
          <p id="hudDay" class="text-[length:clamp(0.7rem,0.9vw,0.875rem)] leading-none font-bold tracking-wider text-white/85"></p>
        </div>
      </div>
      <div id="hudStats" class="flex gap-x-3 hud-col:contents [@media(max-height:560px)]:gap-x-2">${METRIC_GROUPS.map(hudGroup).join('')}</div>
    </header>

    <!-- hop thoai -->
    <div id="dlg" class="invisible absolute inset-x-0 bottom-0 z-10 flex justify-center p-4 pb-safe-4 px-safe-4 max-sm:p-2.5 max-sm:pb-safe-2.5 max-sm:px-safe-2.5 [@media(max-height:560px)]:p-2 [@media(max-height:560px)]:pb-safe-2 [@media(max-height:560px)]:px-safe-2" aria-live="polite">
      <div data-tap class="px-panel relative grid min-h-[9.5rem] w-[min(1000px,100%)] grid-cols-[auto_1fr] items-start gap-5 px-6 py-5 max-sm:min-h-[10rem] max-sm:gap-3 max-sm:px-4 max-sm:py-4 [@media(max-height:560px)]:min-h-0 [@media(max-height:560px)]:py-3">
        <!-- chan dung: khong khung, chi bo goc -->
        <div id="dlgFace" class="grid size-[96px] shrink-0 place-items-center overflow-hidden rounded-2xl max-sm:size-[68px] max-sm:rounded-xl [@media(max-height:560px)]:size-[64px] [@media(max-height:560px)]:rounded-xl">
          <canvas id="dlgCv" class="block" aria-hidden="true"></canvas>
          <span id="dlgBadge" class="hidden size-full place-items-center text-[2.8rem] leading-none font-extrabold text-white max-sm:text-[2rem]"></span>
        </div>
        <div class="min-w-0 pr-10 max-sm:pr-11">       <!-- chua cho nut ban tay #dlgNext o goc duoi-phai -->
          <p id="dlgName" class="flex flex-wrap items-baseline gap-x-2 text-[1.1rem] leading-tight font-extrabold text-brand-red max-sm:text-base"></p>
          <p id="dlgText" class="mt-2 text-[1.15rem] leading-relaxed font-medium max-sm:text-base"></p>
        </div>
        <!-- diem bam duy nhat de sang cau: hinh con tro (ui/cursors/link) o goc duoi-phai chi vao card, go nhip;
             vong song (.tap-ripple) toa ra tai diem ngon tay go = dau ngon tro (34%, 16% anh) lui vao 5px theo nhip animate-tap -->
        <button type="button" id="dlgNext" class="group absolute right-0 bottom-0 grid size-16 place-items-center outline-none max-sm:size-14" title="Tiếp tục" aria-label="Tiếp tục hội thoại">
          <span class="relative size-10 max-sm:size-9">
            <span class="tap-ripple"></span><span class="tap-ripple [animation-delay:.6s]"></span>
            <img src="${asset('ui/cursors/link@2x.png')}" alt="" class="relative size-full animate-tap" draggable="false">
          </span>
        </button>
      </div>
    </div>

    <!-- lua chon -->
    <div id="choice" hidden class="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 pb-safe-4 px-safe-4 max-sm:p-2.5 max-sm:pb-safe-2.5 max-sm:px-safe-2.5 [@media(max-height:560px)]:p-2 [@media(max-height:560px)]:pb-safe-2 [@media(max-height:560px)]:px-safe-2">
      <div class="px-panel w-[min(1000px,100%)] animate-rise px-6 py-5 max-sm:px-4 max-sm:py-4 [@media(max-height:560px)]:py-3">
        <p id="chTag" class="text-sm leading-none font-bold tracking-widest text-brand-red"></p>
        <h2 id="chQ" class="mt-1.5 text-[1.3rem] leading-snug font-bold max-sm:text-[1.1rem]"></h2>
        <div id="chList" class="mt-5 grid grid-cols-3 gap-5 max-md:grid-cols-1 max-md:gap-3.5 [@media(max-height:560px)]:mt-3 [@media(max-height:560px)]:grid-cols-3 [@media(max-height:560px)]:gap-3"></div>
      </div>
    </div>

    <!-- ket qua lua chon -->
    <!-- Bang ket qua KHONG che nhan vat (nhan vat luon dung tren san): ngang = the doc bam phai (PM dung ben trai),
         doc = the ngang ngay duoi hang HUD tren cung, cao toi da ~52% man (PM o nua duoi). --hudb: layout() -->
    <div id="result" hidden class="absolute z-20 flex overflow-y-auto p-4 pb-safe-4 px-safe-4 max-sm:p-2.5 max-sm:pb-safe-2.5 max-sm:px-safe-2.5 [@media(max-height:560px)]:p-2 [@media(max-height:560px)]:pb-safe-2 [@media(max-height:560px)]:px-safe-2
         landscape:top-(--hudb) landscape:right-0 landscape:bottom-0 landscape:w-[min(580px,54vw)] [@media(max-height:560px)]:landscape:w-[min(640px,64vw)] landscape:transition-[left] landscape:duration-500
         portrait:inset-x-0 portrait:top-(--hudb) portrait:max-h-[58%] portrait:justify-center">
      <div class="px-panel grid w-[min(1000px,100%)] animate-rise landscape:my-auto landscape:w-full landscape:!grid-cols-1 portrait:!grid-cols-1 grid-cols-[1fr_minmax(290px,340px)] gap-x-7 gap-y-4 px-7 py-6 max-md:grid-cols-1 rs-sm:gap-y-2.5 rs-sm:px-4 rs-sm:py-3.5">
        <div class="min-w-0">
          <div class="flex items-center gap-3.5 rs-sm:gap-2.5">
            <span id="rsLetter" class="gm-tag gm-red grid size-12 shrink-0 place-items-center pb-0.5 text-[1.6rem] leading-none font-extrabold rs-sm:size-9 rs-sm:text-[1.2rem]"></span>
            <div class="min-w-0">
              <p id="rsTag" class="text-xs leading-none font-bold tracking-[0.18em] text-brand-red uppercase"></p>
              <h2 id="rsTitle" class="mt-1 text-[1.3rem] leading-snug font-extrabold text-px-panel rs-sm:mt-0.5 rs-sm:text-base rs-sm:leading-tight"></h2>
            </div>
          </div>
          <div id="rsTally" class="mt-3 flex flex-wrap gap-2 rs-sm:mt-2 rs-sm:gap-1.5"></div>
          <p id="rsText" class="mt-3 leading-relaxed portrait:hidden [@media(max-height:560px)]:hidden text-px-panel/85 max-sm:text-[0.95rem] [@media(max-height:560px)]:mt-2 [@media(max-height:560px)]:text-sm"></p>
          <p id="rsLater" hidden class="gm-yellow mt-3.5 flex items-center gap-3 rounded-lg border-2 border-(--ink) bg-[#fff1c7] px-3 py-2 text-sm leading-snug font-semibold text-[#4a2703] shadow-[inset_0_-3px_0_#f5cf6a] rs-sm:mt-2 rs-sm:gap-2 rs-sm:px-2 rs-sm:py-1 rs-sm:text-xs">
            <span class="gm-tag gm-yellow grid size-8 shrink-0 place-items-center rs-sm:size-6">${icon('clock', 'size-5 rs-sm:size-4', { stroke: 2.5 })}</span>
            <span><b class="font-extrabold uppercase">Hậu quả trì hoãn</b><span class="rs-sm:hidden"><br>Quyết định này có thể quay lại ảnh hưởng ở giai đoạn sau.</span><span class="hidden rs-sm:inline"> · có thể quay lại ở giai đoạn sau</span></span>
          </p>
        </div>
        <div class="flex min-w-0 flex-col gap-3 rs-sm:gap-2">
          <p class="text-xs leading-none font-bold tracking-[0.18em] text-px-panel/55 uppercase rs-sm:hidden">Chỉ số thay đổi</p>
          <!-- man thap (dien thoai xoay ngang): the chi so xep 2 cot de nut Tiep tuc van trong man hinh -->
          <ul id="rsList" class="flex flex-col gap-2 rs-sm:grid rs-sm:grid-flow-dense rs-sm:grid-cols-2 rs-sm:gap-1.5" aria-label="Thay đổi chỉ số"></ul>
          <button id="rsNext" class="px-btn px-btn-primary px-btn-hint mt-auto rs-sm:py-2 rs-sm:text-base">Tiếp tục${icon('arrowRight', 'size-6', { stroke: 2.25 })}</button>
        </div>
      </div>
    </div>

    <!-- tong ket level -->
    <div id="sum" hidden class="absolute inset-0 z-20 flex bg-px-ink/55 p-safe-4 max-sm:p-safe-2.5">
      <!-- khung modal (chi phan noi dung cuon ben trong) + nut dung rieng ben duoi, khong nen -->
      <div id="sumWrap" class="m-auto flex max-h-full w-[min(920px,100%)] animate-rise flex-col items-center">
        <div id="sumBody" class="px-panel flex min-h-0 w-full flex-col px-7 pt-6 pb-4 max-sm:px-4 max-sm:pt-5 max-sm:pb-3"></div>
        <div id="sumFoot" class="sm-foot"></div>
      </div>
    </div>

    <!-- the chuyen canh: Level / Ngay -->
    <div id="card" hidden data-tap class="absolute inset-0 z-30 flex overflow-y-auto bg-px-ink/85 p-safe-5">
      <div id="cardBody" class="m-auto flex max-w-[640px] flex-col items-center text-center"></div>
    </div>
    <div id="fade" class="pointer-events-none absolute inset-0 z-40 bg-black opacity-0 transition-opacity duration-500"></div>
  </section>`;

export function mountLevel(root, { onMenu }) {
  root.innerHTML = template();
  const name = session.playerName || 'Bạn';
  const pm = new Actor(-0.15);
  const view = { foot: 0, ch: 0, night: 0, emo: null, reach: 0, home: false };   // home = PM dang dung o cho tro chuyen
  const cv = $('stage');
  // Phien dang do: level dang choi + trang thai. Ban luu cu (chi Level 1: summaryDone) -> levelsDone
  let level = LEVELS.find(l => l.id === session.game?.level) || null;
  let run = level ? session.game.run : null;
  level ||= LEVELS[0];
  if (run) {
    run.outcomes ||= {};
    run.levelsDone ||= run.summaryDone ? [LEVEL1.id] : [];
    delete run.summaryDone;
  }
  let baseAlias = null;                                   // bo dong tac PM cua level (met: TIRED); canh co the chong them (s.alias)
  let pmBaseX = null, lastNow = 0, alive = true, waiter = null, typing = null, tall = false, npcs = {}, timers = [];
  const later = (ms, f) => timers.push(setTimeout(f, ms));
  const sleep = ms => new Promise(r => later(ms, r));

  // Nap truoc cac nen cua level (anh lon) theo huong man hinh
  const orient = () => (innerHeight > innerWidth ? 'mobile' : 'pc');
  const preload = lv => [lv.prelude?.bg, lv.intro?.bg, ...lv.scenarios.map(s => s.bg), (lv.summary || lv.ending).bg].filter(Boolean)
    .forEach(b => { new Image().src = BG(b)[orient()]; });

  // ---------- bo cuc: chan nhan vat ngay tren hop thoai ----------
  // San khau (PM + NPC) luon dung tren san: chan ngay tren mep hop thoai (vi tri co dinh, khong doi theo bang khac).
  // Bang ket qua khong che nhan vat vi no doi cho (ngang: bam phai, doc: len tren), xem #result.
  function stageFoot() {
    const top = $('dlg').firstElementChild.getBoundingClientRect().top, hud = $('hud').getBoundingClientRect().bottom;
    return Math.max(hud + 80, Math.min(0.84 * innerHeight, top - 6));   // khong de nhan vat chui len HUD
  }
  // dat co nhan vat + NPC theo view.foot hien tai
  function placeStage() {
    const W = innerWidth, H = innerHeight, hud = $('hud').getBoundingClientRect().bottom;
    view.ch = Math.max(60, Math.min((tall ? 0.2 : H <= 560 ? 0.34 : 0.27) * H, (view.foot - hud) * 0.8));
    // cum nhan vat khong vua be ngang (man doc, nhieu NPC + dao cu): nen khoang cach toi 85% roi thu nho nhan vat
    const units = spanUnits();
    if (units) view.ch = Math.max(60, Math.min(view.ch, W * 0.84 / (units * 0.85)));
    const S = stagePos(), gap = S.npc.length > 1 ? (S.npc[1] - S.npc[0]) * W : W;   // khoang cach 2 the canh nhau
    Object.values(npcs).forEach(n => placeNpc(n, S.npc[n.slot], gap));
    if (view.home && !pm.walk && pmBaseX == null) pm.x = S.pm;       // doi kich thuoc man: PM giu dung cho trong cum
  }
  // vi tri (ti le be ngang) cua PM va tung NPC theo so nguoi trong canh; chua co NPC thi PM dung giua
  // be ngang ca cum (tam PM -> tam NPC cuoi) theo don vi chieu cao nhan vat
  function spanUnits() {
    const n = Object.keys(npcs).length;
    return n ? Math.max(TALK, view.reach + PROP_GAP) + SIDE * (n - 1) : 0;
  }
  function stagePos() {
    const W = innerWidth, n = Object.keys(npcs).length, ch = view.ch;
    const talk = Math.max(TALK, view.reach + PROP_GAP) * ch, side = SIDE * ch;
    // chua le 2 ben ~ nua than nhan vat (0.45 ch) de nguoi dung sat mep khong bi cat
    const span = n ? talk + side * (n - 1) : 0, k = Math.min(1, Math.min(W * 0.84, W - 0.9 * ch) / (span || 1));
    const left = (W - span * k) / 2;
    return { pm: left / W, npc: Array.from({ length: n }, (_, i) => (left + (talk + side * i) * k) / W) };
  }
  // PM di vao cho dung trong cum / roi san khau
  async function pmHome(ms = 1700) { await pm.walkTo(stagePos().pm, ms); view.home = true; }
  function pmOff(x = -0.15) { view.home = false; pm.x = x; }
  function layout() {
    tall = innerHeight > innerWidth;
    $('lv').style.setProperty('--hudb', `${$('hud').getBoundingClientRect().bottom}px`);   // mep duoi HUD cho #result
    view.foot = stageFoot();                                        // doi kich thuoc man hinh: dat thang, khong noi suy
    placeStage();
  }

  // ---------- HUD ----------
  const statEl = k => $('hudStats').querySelector(`[data-stat="${k}"]`);
  function drawHudIcons() {
    // co theo be ngang man hinh nhu chu HUD (clamp ~1.9vw, 20–28px); man thap toi da 22px
    const size = HUD_COL.matches ? 24 : Math.min(innerHeight <= 560 ? 22 : 28, Math.max(20, Math.round(innerWidth * 0.019)));
    METRICS.forEach(m => drawIcon(statEl(m.key).querySelector('canvas'), m.icon, size));
  }
  function setMeter(m, v) {
    const { width, tone } = meter(m, v), fill = statEl(m.key).querySelector('[data-fill]');
    fill.style.width = width; fill.dataset.tone = tone;
  }
  function renderHud() {
    METRICS.forEach(m => { statEl(m.key).querySelector('[data-v]').textContent = fmtNum(m.key, run.metrics[m.key]); setMeter(m, run.metrics[m.key]); });
    $('hudDay').textContent = `NGÀY ${run.day}/60`;
  }
  // Chi so doi: o chi so nhay mau xanh/do + icon nay len, so chay dan, the +/- noi canh o (xem .hud-stat trong components.css).
  // Lan luot tung chi so cach nhau 350ms de mat nguoi choi theo kip.
  function animateHud(changes) {
    changes.forEach((c, n) => later(n * 350, () => {
      const li = statEl(c.key), el = li.querySelector('[data-v]'), t0 = performance.now(), good = isGood(c), d = c.to - c.from;
      li.dataset.fx = good ? 'good' : 'bad'; li.dataset.side = METRIC[c.key].group;
      el.classList.add(good ? 'text-[#9cf07f]' : 'text-[#ff8a7a]');
      const pop = document.createElement('span');
      pop.className = `hud-delta gm-tag ${good ? 'gm-green' : 'gm-red'}`;
      pop.innerHTML = `${icon(d > 0 ? 'arrowUp' : 'arrowDown', 'size-3.5', { stroke: 3 })}${fmtDelta(c.key, d)}`;
      li.append(pop);
      // so dem + thanh chi so tang/giam tung khung hinh (ease-out), mau thanh doi dung luc vuot nguong
      const step = now => {
        const p = Math.min(1, (now - t0) / 900), e = 1 - (1 - p) ** 3, v = c.from + (c.to - c.from) * e;
        el.textContent = fmtNum(c.key, v);
        setMeter(METRIC[c.key], v);
        if (p < 1 && alive) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      later(2600, () => { pop.remove(); delete li.dataset.fx; el.classList.remove('text-[#9cf07f]', 'text-[#ff8a7a]'); });
    }));
  }

  // ---------- NPC: sprite (npcAtlas.js) hoac the nhan vat tam ----------
  // NPC co sprite: nut = vung bam quanh than, canvas rieng ve nhan vat (tran ra ngoai nut) – nam trong #npcs nen van
  // chim toi khi mo bang ket qua, mo dan khi ca team ve. Sprite ve huong phai -> lat de nhin sang PM ben trai.
  // poses = cac dong tac PM se dung trong canh (tinh khoang cach cho dao cu, xem stagePos).
  // keep = giu NPC dang dung (vd Anh Minh buoc vao giua canh), chi them nguoi moi va xep lai cho dung
  function setCast(ids, poses = [], keep = false) {
    ids = ids.filter(id => !isAbsent(id));
    if (!keep) { closeStaffCard(); $('npcs').innerHTML = ''; npcs = {}; }
    view.reach = Math.max(0, ...poses.map(pmReach));
    ids.forEach((id, slot) => {
      if (npcs[id]) { npcs[id].slot = slot; return; }
      const c = CAST[id], el = document.createElement('button'), atlas = npcAtlas(id);
      el.type = 'button'; el.className = `${atlas ? 'npc-sprite' : 'gm-plate'} px-standee opacity-0`;
      el.setAttribute('aria-label', `Xem thẻ ${c.client ? 'khách hàng' : 'nhân viên'}: ${c.name}`);
      el.onclick = () => staffCard(id, el);
      el.style.setProperty('--tint', c.tint);
      el.innerHTML = atlas ? '<canvas aria-hidden="true"></canvas>' : `<span data-in>
        <span data-av class="grid w-full flex-1 place-items-center" style="background:${c.tint}">
          ${icon('user', 'text-white/90', { stroke: 2 })}
        </span>
        <span data-nm class="w-full truncate pt-1 text-center leading-none font-extrabold text-white">${esc(c.name.split(' ').at(-1).toUpperCase())}</span>
      </span>`;
      el.title = `${c.name} – ${c.role}`;
      $('npcs').append(el);
      npcs[id] = { el, slot };
      if (atlas) {
        npcs[id].atlas = atlas; npcs[id].cv = el.querySelector('canvas');
        npcs[id].actor = Object.assign(new Actor(0, atlas), { flip: true });
        npcImg(id);
      }
    });
    layout();
    requestAnimationFrame(() => Object.values(npcs).forEach(n => n.el.classList.remove('opacity-0')));
  }
  function placeNpc(n, x, gap) {
    if (n.actor) {
      // vung bam ~ than nguoi (0.55 x 1 chieu cao dung); canvas = khung lon nhat cua cac dong tac, goc chan giua day nut
      const bw = view.ch * 0.55, bh = view.ch, cw = 2 * n.atlas.half * view.ch, chh = n.atlas.tall * view.ch;
      Object.assign(n.el.style, { left: `${x * innerWidth - bw / 2}px`, top: `${view.foot - bh}px`, width: `${bw}px`, height: `${bh}px` });
      Object.assign(n.cv.style, { left: `${(bw - cw) / 2}px`, top: `${bh - chh}px`, width: `${cw}px`, height: `${chh}px` });
      n.w = cw; n.h = chh;
      return;
    }
    // the ti le 237x314 (the .gm-plate); canh dong nguoi thi hep lai, chua khe
    const w = Math.min(Math.max(58, view.ch * 0.5), gap - 12), h = w * 314 / 237;
    Object.assign(n.el.style, { left: `${x * innerWidth - w / 2}px`, top: `${view.foot - h}px`, width: `${w}px`, height: `${h}px` });
    const sv = n.el.querySelector('svg'); sv.style.width = sv.style.height = `${w * 0.5}px`;
    n.el.querySelector('[data-nm]').style.fontSize = `${Math.max(12, w * 0.17)}px`;
  }
  // Cac level tu dau toi level dang choi (co `tired` / `absent` cua level truoc van con hieu luc)
  const levelsSoFar = () => LEVELS.slice(0, LEVELS.indexOf(level) + 1);
  // NPC vang mat tu level co `absent` khi co co (vd Huy nghi viec: Level 3 tro di khong con trong canh)
  const isAbsent = id => !!run && levelsSoFar().some(l => l.absent?.[id] && run.flags[l.absent[id]]);
  // Thanh vien team theo lich su phien choi (Huy nghi o S07, thue Freelancer o S05, them nguoi o S12)
  const teamFact = () => [
    run?.flags.key_developer_left ? (isAbsent('HUY') ? 'Huy (đã nghỉ)' : 'Huy (đang bàn giao)') : 'Huy (Backend)', 'Nam (Frontend)', 'Lan (BA/QA)',
    ...(run?.flags.freelancer_hired ? ['Freelancer (dự án B)'] : []),
    ...(run?.flags.large_project_resourced ? ['1 nhân sự mới (dự án lớn)'] : []),
  ].join(' · ');
  // The nhan vien (tooltip tren dau nhan vat): NPC theo CAST, PM = nguoi choi (chan dung sheet D)
  function staffCard(id, anchor) {
    if (id === 'PM') return openStaffCard({ name, role: 'Project Manager (thử việc)', face: 'face_neutral',
      desc: 'Tiếp quản dự án và ra quyết định trong 60 ngày thử việc.', facts: [
      ['Quản lý', 'Anh Minh – Trưởng phòng/PM Lead'],
      ['Team', teamFact()],
      ['Thử việc', `Ngày ${run?.day ?? 1} / 60`],
    ] }, anchor);
    const c = CAST[id], avatar = npcAtlas(id) && ((cv, size) => drawNpcFace(cv, id, 'face_neutral', size));
    openStaffCard({ name: c.name, role: c.role, desc: c.desc, tint: c.tint, client: c.client, avatar,
      facts: [['Đơn vị', c.client ? 'Khách hàng của dự án' : 'Innocom · Team dự án']] }, anchor);
  }
  // Nguoi dang noi: the tam nhac len + quang cyan. NPC sprite: dang noi -> talk (hoac dong tac rieng cua dong thoai: act),
  // PM noi -> nghe, con lai dung yen
  // react = dong tac rieng cua NPC khong noi o dong thoai nay ({ NAM: 'apologize' })
  const talking = (id, act, react = {}) => Object.entries(npcs).forEach(([k, n]) => {
    n.el.toggleAttribute('data-talk', k === id); n.el.toggleAttribute('data-sel', k === id);
    n.actor?.play(react[k] || (k === id ? act || 'talk' : id === 'PM' ? 'listen' : 'idle'));
  });
  // Ve NPC sprite moi khung hinh (canvas rieng tung NPC, kich thuoc dat trong placeNpc)
  function drawNpcs(now) {
    const dpr = devicePixelRatio || 1;
    for (const [id, n] of Object.entries(npcs)) {
      if (!n.actor || !n.w || !npcReady(id)) continue;
      const W = Math.round(n.w * dpr), H = Math.round(n.h * dpr);
      if (n.cv.width !== W || n.cv.height !== H) { n.cv.width = W; n.cv.height = H; }
      const ctx = n.cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, n.w, n.h);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      drawActor(ctx, n.actor, npcImg(id), view.ch / n.atlas.stand, n.w / 2, n.h, now);
    }
  }

  // ---------- nen, chuyen canh ----------
  function setBg(name) {
    const b = BG(name); $('bgMobile').srcset = b.mobile; $('bgImg').src = b.pc;
    const img = $('bgImg');
    return img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; later(4000, r); });
  }
  // chuyen canh: toi -> doi canh -> sang; suot luc do #lv aria-busy (con tro dong ho cat, components.css)
  const fade = async on => {
    $('lv').ariaBusy = 'true';
    $('fade').classList.toggle('opacity-0', !on);
    await sleep(500);
    if (!on) $('lv').ariaBusy = 'false';
  };

  // ---------- cho nguoi choi: cham / Enter ----------
  // ms = tu qua sau ms (the Ngay). Hen gio chi dong dung luot cho cua no: nguoi choi da bam qua som thi hen gio
  // khong duoc "bam ho" dong thoai dang cho sau do (truoc day cau dau cua canh bi nuot mat).
  const waitInput = ms => new Promise(res => {
    const w = () => { if (waiter === w) waiter = null; res(); };
    waiter = w;
    if (ms) later(ms, () => waiter === w && w());
  });
  function advance() {
    if (typing && !typing.done) { finishTyping(); return; }
    waiter?.();
  }
  // Chuot/cham: cham bat ky dau tren hop thoai (hoac nut goc #dlgNext) sang cau – tren dien thoai nut goc qua nho de nham;
  // the chuyen canh toan man (#card, "cham de tiep tuc") cham dau cung duoc
  const onClick = e => {
    if (e.target.closest('button')) return;
    if (e.target.closest('#card') || (e.target.closest('#dlg [data-tap]') && !$('dlg').classList.contains('invisible'))) advance();
  };
  const onKey = e => {
    if (modalOpen()) return;   // hop thoai modal dang mo: phim thuoc ve dialog
    if ((e.key === 'Enter' || e.key === ' ') && !evTarget(e).closest?.('button')) { e.preventDefault(); advance(); }
    if (!$('choice').hidden && /^[abc123]$/i.test(e.key)) {
      const i = 'abc123'.indexOf(e.key.toLowerCase()) % 3; $('chList').children[i]?.click();
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !$('choice').hidden) {
      e.preventDefault();
      const list = [...$('chList').children], i = list.indexOf(activeEl());
      const d = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : list.length - 1;
      list[(i < 0 ? 0 : i + d) % list.length].focus();
    }
  };

  // ---------- hop thoai ----------
  // who: 'PM' (chan dung sheet D) | id NPC (co sprite: chan dung npcFace, chua co: huy hieu chu cai) | 'SYS' (huy hieu chuong;
  //      title = ten thay cho "Thong bao") | 'NARR' (dan truyen, chu nghieng)
  function showLine(line) {
    const isPm = line.who === 'PM', isSys = line.who === 'SYS';
    const npc = CAST[line.who] || (isSys ? { ...SYS, name: line.title || SYS.name } : null);
    const face = isPm || !!npcAtlas(line.who), size = innerWidth < 640 || innerHeight <= 560 ? 68 : 96;
    $('dlg').classList.remove('invisible');
    $('dlgFace').hidden = !isPm && !npc;
    $('dlgCv').hidden = !face; $('dlgBadge').classList.toggle('hidden', face); $('dlgBadge').classList.toggle('grid', !face);
    if (isPm) drawFace($('dlgCv'), line.face || 'face_neutral', size);
    else if (face) drawNpcFace($('dlgCv'), line.who, line.npcFace || 'face_neutral', size);
    else if (npc) {
      $('dlgBadge').innerHTML = isSys ? icon('bellAlert', 'size-3/5', { stroke: 2 }) : esc(npc.name.split(' ').at(-1)[0]);
      $('dlgBadge').style.background = npc.tint;
    }
    const role = isPm ? 'PM thử việc' : npc?.role;
    $('dlgName').innerHTML = isPm || npc
      ? `<span>${esc((isPm ? name : npc.name).toUpperCase())}</span>${role ? `<span class="text-sm font-semibold text-px-panel/55 max-sm:hidden">${esc(role)}</span>` : ''}` : '';
    $('dlgText').classList.toggle('italic', !isPm && !npc);
    $('dlgText').textContent = '';
    typing = { text: line.text, t: performance.now(), done: false };
    talking(line.who, line.npc, line.react);
  }
  function finishTyping() {
    typing.done = true; $('dlgText').textContent = typing.text;
  }
  async function say(line) {
    line = prepLine(line);
    if (!pm.walk) pm.play(line.pm || (line.who === 'PM' ? 'talk' : 'idle'));   // dang di (vd om thung ra cua): giu dong tac di
    showLine(line);
    await waitInput();
  }
  // Dong thoai theo lich su phien choi: nhan vat vang mat (absent, vd Huy da nghi) -> cau `alt` (cau cua chinh nguoi do thanh
  // thong bao thieu nhan su chu chot); textFor(run, bao cao) -> cau tra loi theo hanh trinh that (null = giu cau mau)
  const MISSING = 'Thiếu nhân sự chủ chốt';
  function prepLine(l) {
    const gone = Object.keys(l.alt || {}).find(isAbsent) || (CAST[l.who] && isAbsent(l.who) ? l.who : null);
    if (gone) {
      const text = l.alt?.[gone] || `${CAST[gone].name} đã nghỉ việc, không còn tham gia trao đổi này.`;
      return l.who === gone ? { ...l, who: 'SYS', title: MISSING, text, npc: null, npcFace: null } : { ...l, text };
    }
    const t = l.textFor?.(run, campaignReport(run, levelsSoFar()));
    return t ? { ...l, text: t } : l;
  }
  const hideDialog = () => { $('dlg').classList.add('invisible'); typing = null; talking(null); };

  // ---------- the chuyen canh ----------
  async function card(html, ms) {
    $('cardBody').innerHTML = html; $('card').hidden = false;
    await waitInput(ms);
    $('card').hidden = true;
  }
  const levelCard = () => card(`
    <span class="art-btn art-red mb-5 px-4 pt-1.5 pb-2 font-pixel text-[1.6rem] leading-none tracking-[0.3em] [--bw:16px] [--bw2:18px]">LEVEL ${level.no}</span>
    <h1 class="px-title text-[clamp(3.6rem,10vw,6.5rem)]">${level.title}</h1>
    <p class="mt-8 text-[1.3rem] leading-none font-bold tracking-widest text-white">${level.days}</p>
    ${level.lead ? `<p class="mt-4 text-[1.15rem] leading-relaxed font-bold text-px-hi italic">${level.lead}</p>` : ''}
    <p class="mt-4 text-[1.1rem] leading-relaxed font-medium text-white/85">${level.goal}</p>
    <p class="mt-8 animate-blink text-sm font-bold tracking-wider text-white/60">${TAP_HINT}</p>`);
  // The ngay: so ngay dem tu ngay truoc toi ngay moi – cac ngay khong co tinh huong luot qua nhu timeline
  function dayCard(s, from) {
    const shown = card(`
      <p class="font-pixel text-[1.5rem] leading-none tracking-[0.25em] text-px-hi">${s.no} · ${esc(s.title.toUpperCase())}</p>
      <h1 class="px-title mt-5 text-[clamp(3.6rem,10vw,6rem)]">NGÀY <span id="dayNo">${Math.min(from, s.day)}</span></h1>
      <p class="mt-7 text-[1.15rem] font-semibold text-white/90">${esc(s.place)}</p>`, 2600 + Math.min(900, (s.day - from) * 110));
    for (let d = from + 1, n = 1; d <= s.day; d++, n++) later(Math.min(900, n * 110), () => { const el = $('dayNo'); if (el) el.textContent = d; });
    return shown;
  }

  // ---------- lua chon + ket qua ----------
  function ask(s) {
    hideDialog();
    $('chTag').textContent = `${s.no} · QUYẾT ĐỊNH`;
    $('chQ').textContent = s.question;
    $('chList').innerHTML = s.choices.map(c => `
      <button class="px-choice" data-id="${c.id}">
        <span class="gm-tag gm-red grid size-9 shrink-0 place-items-center pb-0.5 text-[1.2rem] leading-none font-extrabold">${c.id}</span>
        <span class="min-w-0">
          <span class="block text-[1.05rem] leading-snug font-bold">${esc(c.label)}</span>
          <span class="mt-1 block text-sm leading-snug text-px-panel/70 [@media(max-height:700px)]:hidden">${esc(c.hint)}</span>
        </span>
      </button>`).join('');
    $('choice').hidden = false;
    const shown = performance.now();
    return new Promise(res => {
      $('chList').onclick = e => {
        const b = e.target.closest('button'); if (!b || performance.now() - shown < 400) return;
        $('choice').hidden = true; res(s.choices.find(c => c.id === b.dataset.id));
      };
    });
  }
  // The chi so (bang ket qua + tong ket): icon tren de, ten, thanh (nen = phan giu nguyen, doan soc = phan tang/giam,
  // chay dan toi gia tri moi), truoc -> sau, o +/- . Thang theo mien that cua chi so (quy -100..200). Rui ro: tang la xau.
  function fillMetricRows(ul, changes) {
    ul.innerHTML = changes.map((ch, i) => {
      const m = METRIC[ch.key], d = ch.to - ch.from, tone = !d ? 'same' : isGood(ch) ? 'good' : 'bad';
      // ban gon 2 cot: dong co so dai (tien VND) chiem ca hang de the +/- khong bi cat
      return `<li class="px-hud rs-row animate-rise ${fmtDelta(ch.key, d, false).length > 8 ? 'rs-sm:col-span-2' : ''}" style="animation-delay:${120 + i * 90}ms" data-icon="${m.icon}" data-tone="${tone}">
        <span class="rs-plate"><canvas aria-hidden="true"></canvas></span>
        <div class="min-w-0 flex-1">
          <span class="block truncate text-[0.92rem] leading-tight font-bold text-white rs-sm:text-xs"><span class="rs-sm:hidden">${m.label}</span><span class="hidden rs-sm:inline">${m.short}</span></span>
          <div class="mt-1.5 flex items-center gap-2 rs-sm:mt-1 rs-sm:gap-1">
            <span class="gm-track rs-bar flex-1" aria-hidden="true"><i class="gm-fill gm-blue" data-base></i><i class="gm-fill" data-delta data-stripes></i></span>
            <span class="shrink-0 text-xs font-semibold text-white/60 tabular-nums rs-sm:hidden">${fmtNum(ch.key, ch.from)} → <b class="text-white">${fmtNum(ch.key, ch.to)}</b></span>
          </div>
        </div>
        <span class="gm-tag rs-delta ${{ good: 'gm-green', bad: 'gm-red', same: 'gm-blue' }[tone]}">${d ? icon(d > 0 ? 'arrowUp' : 'arrowDown', 'size-3.5', { stroke: 3 }) : ''}${fmtDelta(ch.key, d, false)}</span>
      </li>`;
    }).join('');
    ul.querySelectorAll('li').forEach((li, i) => {
      const ch = changes[i], { min, max } = METRIC[ch.key], lo = Math.min(ch.from, ch.to);
      const pct = v => `${Math.max(0, Math.min(100, (v - min) * 100 / (max - min)))}%`;
      const base = li.querySelector('[data-base]'), delta = li.querySelector('[data-delta]');
      base.style.width = pct(lo);
      Object.assign(delta.style, { left: pct(lo), width: '0%' });
      later(420 + i * 90, () => { delta.style.width = `calc(${pct(Math.max(ch.from, ch.to))} - ${pct(lo)})`; });
    });
  }

  // Bang ket qua khong bao gio cuon: tran cho trong (vd laptop scale 150%, ~620px cao) thi gon dan tung muc –
  // 1 = ban gon rs-sm (chi so 2 cot), 2 = chu mo ta nho, 3 = an mo ta, 4 = an chip dem; van tran (dien thoai xoay ngang
  // ~360px) thi zoom ca bang cho vua. Luc vua mo: do khi tat animation (translateY lam sai do);
  // luc resize animation da xong, khong tat (tat/bat lai la chay lai hieu ung).
  function fitResult(opening = false) {
    const r = $('result'), panel = r.firstElementChild;
    if (r.hidden) return;
    r.toggleAttribute('data-measure', opening); r.removeAttribute('data-fit'); panel.style.zoom = '';
    for (const lv of ['1', '2', '3', '4']) {
      if (r.scrollHeight <= r.clientHeight + 1) break;
      r.dataset.fit = lv;
    }
    const cs = getComputedStyle(r), pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    if (r.scrollHeight > r.clientHeight + 1) panel.style.zoom = Math.max(0.7, (r.clientHeight - pad) / (r.scrollHeight - pad)).toFixed(3);
    r.removeAttribute('data-measure');
    const small = RS_SM.matches || r.hasAttribute('data-fit');
    r.querySelectorAll('#rsList li').forEach(li => drawIcon(li.querySelector('canvas'), li.dataset.icon, small ? 22 : 30));
  }

  // Bang ket qua: chu cai lua chon + tieu de, chip dem chi so tot/xau, canh bao tri hoan, the tung chi so
  // (thanh: nen = gia tri giu nguyen, doan mau = phan tang/giam; chay dan toi gia tri moi). Rui ro: tang la xau.
  // o = ket qua re nhanh cua lua chon (vd S07 C -> C1 thuong luong thanh cong): tieu de phu + mo ta theo ket qua do
  function showResult(s, c, changes, o = null) {
    const good = changes.filter(isGood).length, bad = changes.length - good;
    $('rsLetter').textContent = o?.id || c.id;
    $('rsTag').textContent = `Kết quả · ${s.no}${o ? ` · ${o.label}` : ''}`;
    $('rsTitle').textContent = c.label;
    $('rsText').textContent = o?.result || c.result;
    $('rsLater').hidden = !c.delayed?.length && !o?.delayed?.length;
    const chip = (n, ic, text, cls) => n ? `<span class="gm-tag ${cls} inline-flex items-center gap-1.5 px-2 pt-1 pb-1.5 text-xs leading-none font-bold">${icon(ic, 'size-4', { stroke: 2.5 })}${n} ${text}</span>` : '';
    $('rsTally').innerHTML = chip(good, 'arrowTrendingUp', 'cải thiện', 'gm-green')
      + chip(bad, 'arrowTrendingDown', 'xấu đi', 'gm-red')
      || '<span class="text-sm font-semibold text-px-panel/60">Không có chỉ số nào thay đổi.</span>';
    fillMetricRows($('rsList'), changes);
    $('result').hidden = false;
    fitResult(true);
    $('rsNext').focus({ preventScroll: true });
    return new Promise(res => { $('rsNext').onclick = () => { $('result').hidden = true; res(); }; });
  }

  // Chuyen dan sang canh dem (phu toi + den ban quanh PM); hideCast = ca team da ve
  async function toNight(hideCast) {
    if (hideCast) Object.values(npcs).forEach(n => n.el.classList.add('opacity-0'));
    const t0 = performance.now();
    await new Promise(r => { const f = now => { view.night = Math.min(1, (now - t0) / 900); view.night < 1 && alive ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); });
  }
  // Dan canh sau lua chon: dong tac PM, do vat, canh dem
  async function stageAfter(a) {
    if (!a) return;
    if (a.night) await toNight(true);
    pm.play(a.pm, a.then);                                  // dong tac mot lan (vd jump) xong thi noi ngay sang then
    if (a.then) { await sleep(1600); pm.play(a.then); }     // dong tac lap (vd go may dem): doi roi chuyen
    if (a.emo) view.emo = a.emo;
    await sleep(900);
  }
  // Canh ket sau bang ket qua (lua chon hoac tinh huong): { lines, pm, night, hideCast }
  async function playOutro(o) {
    if (o.hideCast) Object.values(npcs).forEach(n => n.el.classList.add('opacity-0'));
    if (o.night) await toNight(false);
    if (o.pm) { pm.play(o.pm); await sleep(700); }
    for (const l of o.lines) { if (!alive) return; await say(l); }
    hideDialog();
  }
  // Hau qua tri hoan vua kich hoat: dong thong bao he thong (HUD dang cong/tru cung luc)
  async function sayLater(notes, pose) {
    for (const text of notes) { if (!alive) return; await say({ who: 'SYS', title: LATER_TITLE, text, pm: pose }); }
  }
  // Dong thoai hien theo co / dieu kien (bien the thoai theo lich su phien choi): ifFlag = chi khi co co, unlessFlag = an khi
  // co co, when(run) = dieu kien chi so / nhieu co
  const shown = lines => lines.filter(l => (!l.ifFlag || run.flags[l.ifFlag]) && !(l.unlessFlag && run.flags[l.unlessFlag])
    && (!l.when || l.when(run)));

  // ---------- huong dan chi so: tro lan luot tung badge ----------
  function tour() {
    const groups = Object.fromEntries(METRIC_GROUPS.map(g => [g.id, g.label]));
    const steps = METRIC_GROUPS.flatMap(g => METRICS.filter(m => m.group === g.id)).map((m, n) => ({
      target: statEl(m.key), title: m.label, text: m.hint, group: groups[m.group],
      lead: n ? '' : 'Mỗi quyết định sẽ làm các chỉ số này tăng hoặc giảm. Cùng xem nhanh từng chỉ số:',
      side: HUD_COL.matches ? (m.group === 'project' ? 'right' : 'left') : 'below',
    }));
    return hudTour($('lv'), steps);
  }

  // ---------- kich ban ----------
  // Canh chuyen truoc mo dau level khi co co (vd pm_overloaded: ngu guc tren ban luc dem). Man dang den khi goi.
  async function playPrelude(p) {
    await setBg(p.bg); setCast([]);
    Object.assign(view, { night: p.night ? 1 : 0, emo: null });
    pm.x = stagePos().pm; view.home = true; pm.play(p.pm);
    await fade(false);
    await sleep(600);
    for (const l of p.lines) { if (!alive) return; await say(l); }
    hideDialog();
    await fade(true);
    view.night = 0;
  }
  async function playIntro() {
    const it = level.intro;
    await setBg(it.bg); setCast(it.cast, it.lines.map(l => l.pm));
    pmOff(); await fade(false);
    if (!session.hudTourDone) { await tour(); session.hudTourDone = true; saveSession(); }
    await pmHome();
    for (const l of it.lines) { if (!alive) return; await say(l); }
    hideDialog();
    view.home = false; await pm.walkTo(1.15, 1900);       // PM di tiep vao khu lam viec
  }
  async function playScenario(s) {
    await fade(true);
    Object.assign(view, { night: 0, emo: null });
    await setBg(s.bg); setCast(s.cast, scenePoses(s));
    pm.alias = s.alias ? { ...baseAlias, ...s.alias } : baseAlias;       // vd S16: bo vest
    const from = run.day;
    // hop ban: PM ngoi san (s.enter), khong di vao
    if (s.enter) { pm.x = stagePos().pm; view.home = true; pm.play(s.enter); } else { pmOff(); pm.play('idle'); }
    const notes = dueNotes(run, s.id), due = enterScenario(run, s); renderHud();
    await fade(false);
    await dayCard(s, from);
    if (!s.enter) await pmHome();
    // mo canh: bien the do hau qua tri hoan dat (run.variants), dong thoai theo co; laterAt dong dau noi truoc loi bao hau qua
    const open = shown(s.variants?.[run.variants[s.id]] || s.open), k = s.laterAt || 0;
    for (const l of open.slice(0, k)) { if (!alive) return; await say(l); }
    if (due.length) animateHud(due);
    await sayLater(notes, s.enter || open[k - 1]?.pm);
    for (const l of open.slice(k)) { if (!alive) return; await say(l); }
    const c = await ask(s);
    if (c.join) setCast([...s.cast, ...c.join], scenePoses(s), true);       // nguoi buoc vao canh truoc thoai nhanh
    const later = dueNotes(run, s.id, c.id), changes = applyChoice(run, s, c);
    const o = c.outcomes?.find(x => x.id === run.outcomes[s.id]) || null;
    session.game = { level: level.id, run }; saveSession();
    for (const l of [...c.lines, ...(o?.lines || [])]) { if (!alive) return; await say(l); }
    hideDialog();
    await stageAfter(o?.after || c.after);
    animateHud(changes);
    await sayLater(later, (o?.after || c.after)?.pm);
    hideDialog();
    await showResult(s, c, changes, o);
    for (const out of [c.outro, o?.outro, s.outro].filter(Boolean)) await playOutro(out);
    pm.alias = baseAlias;
  }
  // Tong ket level: Anh Minh; bang bao cao -> nhan xet theo xep loai
  async function playSummary() {
    const sm = level.summary, r = summarize(run, level, level.phase);
    await fade(true);
    Object.assign(view, { night: 0, emo: null });
    await setBg(sm.bg); setCast(sm.cast, Object.values(sm.comments || {}).flat().map(l => l.pm)); pmOff(); pm.play('idle');
    await fade(false);
    await pmHome();
    await showSummary(r);
    for (const l of sm.comments?.[r.tier.mood] || []) { if (!alive) return; await say(l); }   // Level 3: khong co nhan xet
    hideDialog();
    run.levelsDone.push(level.id); session.game = { level: level.id, run }; saveSession();
  }
  // O chi so (tong ket level + bao cao cuoi): du 7 chi so theo nhom, gia tri cuoi + muc tang/giam. at = tre hieu ung
  function metricTiles(changes, at) {
    // O chi so: du 7 chi so, thu tu co dinh theo nhom (Du an | Con nguoi) de luoi luon deu; khong doi thi the "—".
    // Rui ro (bad) nen do (.sm-tile[data-bad]) de nhan ra ngay chi so bat loi.
    // gia tri o chi so: tien thi man hep bo chu "VND" (the +/- ben canh van ghi) de o khong tran
    const val = c => { const m = METRIC[c.key]; return m.unit === '%' || m.of ? fmt(c.key, c.to) : `${fmtNum(c.key, c.to)}<span class="max-sm:hidden"> ${m.unit}</span>`; };
    const tile = (c, i) => {
      const m = METRIC[c.key], d = c.to - c.from, tag = !d ? 'gm-blue opacity-70' : isGood(c) ? 'gm-green' : 'gm-red';
      return `
      <li class="px-hud sm-tile animate-rise" ${at(250 + i * 60)} data-icon="${m.icon}" ${m.bad ? 'data-bad' : ''} title="${m.label}: ${fmt(c.key, c.from)} → ${fmt(c.key, c.to)}">
        <canvas aria-hidden="true"></canvas>
        <span class="min-w-8 flex-1 truncate text-[0.8rem] font-medium text-white/70">${m.short}</span>
        <span class="shrink-0 text-[0.92rem] font-semibold tabular-nums max-sm:text-[0.85rem]">${val(c)}</span>
        <span class="gm-tag ${tag} shrink-0 px-1.5 pt-0.5 pb-1 text-xs leading-none font-bold tabular-nums max-sm:px-1 max-sm:text-[0.68rem]">${d ? fmtDelta(c.key, d) : '—'}</span>
      </li>`;
    };
    let n = 0;
    const groups = METRIC_GROUPS.map(g => `
        <div class="min-w-0">
          <p class="mb-1.5 text-center text-[0.65rem] leading-none font-bold tracking-[0.16em] text-px-panel/45 uppercase">${g.label}</p>
          <ul class="flex flex-col gap-1" aria-label="Chỉ số ${g.label.toLowerCase()}">${changes.filter(c => METRIC[c.key].group === g.id).map(c => tile(c, n++)).join('')}</ul>
        </div>`).join('');
    return { html: groups, n };
  }
  // Tong ket level – thiet ke "it chu", tach 2 modal: (1) 1 ket luan (xep loai), du 7 o chi so theo nhom; (2) 3 the noi bat (icon + so lon + 1 dong), quyet dinh = dong thoi gian cham mau (nhan chi hien khi re/cham).
  // Cac khoi hien dan theo nhip (animate-rise + delay) de mat nguoi choi di dung thu tu.
  function showSummary(r) {
    const at = ms => `style="animation-delay:${ms}ms"`;
    const { html: groups, n } = metricTiles(r.changes, at);
    const dz = r.dangers.length;
    // the noi bat: khung HUD (px-hud) + icon trong badge art (ui/badges/badge_<badge>); bad = nen do nhu o Rui ro
    const card = (ic, badge, label, big, sub, i, bad = false) => `
      <div class="px-hud sm-card animate-rise" ${bad ? 'data-bad' : ''} ${at(150 + i * 110)}>
        <span class="sm-badge"><img src="${asset(`ui/badges/badge_${badge}.webp`)}" alt="" draggable="false">${icon(ic, 'size-5', { stroke: 2.25 })}</span>
        <p class="pr-12 text-[0.68rem] font-bold tracking-[0.14em] text-white/60 uppercase">${label}</p>
        <p class="mt-1 text-[1.5rem] leading-none font-extrabold">${big}</p>
        <p class="mt-1.5 line-clamp-2 text-[0.8rem] leading-snug font-medium text-white/75">${sub}</p>
      </div>`;
    const tone = d => (d.avg >= 2 ? 'art-green' : d.avg >= 1 ? 'art-yellow' : 'art-red');
    // Noi dung can giua: dau trang (huy hieu canh chu), tieu de muc, nhan nhom, nut; so trang goc tren-phai
    const step = n => `<span class="absolute top-0 right-0 font-pixel text-[1.1rem] leading-none tracking-[0.2em] text-px-panel/40 max-sm:hidden">${n}/2</span>`;
    // nut dung rieng ngoai khung modal (#sumFoot), khong nen
    const next = (label, ms) => `<button id="sumNext" class="px-btn px-btn-primary animate-rise w-auto px-8 max-sm:w-full" ${at(ms)}>${label}${icon('arrowRight', 'size-6', { stroke: 2.25 })}</button>`;
    // Modal 1: xep loai + chi so thay doi
    const page1 = `
      <div class="relative flex items-center justify-center gap-4 px-8 max-sm:gap-3 max-sm:px-0">
        ${tierBadge(level.no, r.tier.mood, 'size-[68px] max-sm:size-[52px]', 'text-[2rem] text-px-panel max-sm:text-[1.6rem]')}
        <div class="min-w-0">
          <p class="font-pixel text-[1.25rem] leading-none tracking-[0.2em] text-px-panel/55 max-sm:text-[0.95rem] max-sm:tracking-[0.04em]">TỔNG KẾT LV${level.no} · ${level.days.toUpperCase()}</p>
          <p class="gm-tag ${MOOD[r.tier.mood]} mt-2 inline-block px-3 pt-1.5 pb-2 text-xl leading-none font-extrabold whitespace-nowrap uppercase max-sm:px-2 max-sm:text-sm">${esc(r.tier.label)}</p>
        </div>
        ${step(1)}
      </div>

      <div id="sumTiles" class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 max-sm:mt-4 max-sm:grid-cols-1">${groups}</div>
`;
    // Modal 2: 3 the noi bat + hanh trinh quyet dinh
    const page2 = `
      <div class="relative flex flex-col items-center text-center">
        <div class="min-w-0 px-10 max-sm:px-0">
          <p class="font-pixel text-[1.25rem] leading-none tracking-[0.2em] text-px-panel/55 max-sm:text-[1.05rem] max-sm:tracking-[0.06em]">TỔNG KẾT LV${level.no} · ${level.days.toUpperCase()}</p>
          <p class="mt-2 text-xl leading-tight font-extrabold text-px-panel max-sm:text-lg">Đánh giá quyết định</p>
        </div>
        ${step(2)}
      </div>

      <div class="mt-5 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        ${card('trophy', 'rosette_blue', 'Quyết định tốt nhất', r.best ? `${r.best.no} · ${r.best.choice}` : '—', r.best ? esc(r.best.label) : 'Chưa có quyết định', 0)}
        ${card('academicCap', 'shield_gold', 'Năng lực nổi bật', r.topCompetency ? `${r.topCompetency.score}<span class="text-base text-white/45">/100</span>` : '—', r.topCompetency ? esc(r.topCompetency.label) : '', 1)}
        ${card(dz ? 'exclamationTriangle' : 'checkCircle', dz ? 'hexagon_bronze' : 'hexagon_silver', 'Rủi ro tích lũy', dz, dz ? esc(r.dangers[0].text) + (dz > 1 ? ` <b>+${dz - 1}</b>` : '') : 'Chưa có quyết định nào để lại rủi ro.', 2, dz > 0)}
      </div>

      <p class="sm-h animate-rise text-center" ${at(550)}>Hành trình quyết định</p>
      <ol class="sm-line animate-rise" ${at(600)} aria-label="Các quyết định">
        ${r.decisions.map(d => `<li class="sm-node group" tabindex="0">
          <span class="art-sq ${tone(d)} grid size-10 place-items-center pb-0.5 text-base leading-none font-extrabold">${d.choice}</span>
          <span class="mt-1 text-xs font-bold text-px-panel/60">${d.no}</span>
          <span class="sm-tip px-bubble" role="tooltip"><b>${d.no} · ${esc(d.title)}</b><br>${esc(d.label)}</span>
        </li>`).join('')}
      </ol>
      ${r.returned.length ? `
      <p class="sm-h animate-rise text-center" ${at(700)}>Hậu quả quay lại từ quyết định trước</p>
      <ul class="flex animate-rise flex-col gap-1.5" ${at(750)} aria-label="Hậu quả quay lại">
        ${r.returned.map(f => `<li class="flex items-start gap-2.5 rounded-lg border-2 border-(--ink) bg-[#fff1c7] px-3 py-1.5 text-[0.85rem] leading-snug font-semibold text-[#4a2703] shadow-[inset_0_-3px_0_#f5cf6a]">
          <span class="gm-tag gm-yellow shrink-0 px-1.5 pt-0.5 pb-1 text-[0.7rem] leading-none font-bold whitespace-nowrap">${esc(f.from)}</span><span>${esc(f.text)}</span>
        </li>`).join('')}
      </ul>` : ''}
`;
    // hien mot trang, cho bam nut; doi trang thi chay lai hieu ung mo panel.
    // Khung modal dung yen (cao toi da bang man hinh tru nut): chi phan noi dung cuon, nut nam ngay duoi khung
    const show = sumPage;
    return show(page1, next('Xem đánh giá', 400 + n * 60)).then(() => show(page2, next(esc(level.summary.cta || 'Tiếp tục'), 750)))
      .then(() => { $('sum').hidden = true; });
  }
  // Mot trang modal tong ket / bao cao: noi dung + nut rieng ngoai khung (#sumFoot, id sumNext); cho bam nut.
  // Doi trang thi chay lai hieu ung mo panel. Khung dung yen (cao toi da bang man hinh tru nut): chi phan noi dung cuon
  function sumPage(html, btn) {
    const b = $('sumBody'), w = $('sumWrap');
    b.innerHTML = `<div data-scroll class="-mx-2 min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain px-2">${html}</div>`;
    $('sumFoot').innerHTML = btn;
    w.classList.remove('animate-rise'); void w.offsetWidth; w.classList.add('animate-rise');
    b.querySelectorAll('#sumTiles li').forEach(li => drawIcon(li.querySelector('canvas'), li.dataset.icon, 22));
    $('sum').hidden = false; fitSum();
    $('sumNext').focus({ preventScroll: true });
    return new Promise(res => { $('sumNext').onclick = res; });
  }
  // Modal tong ket khong cuon: cao tu nhien (khung + nut) vuot man thi thu nho ca cum (zoom) cho vua, toi thieu 0.6;
  // van tran (man qua thap) moi de vung noi dung cuon (max-h-full + overflow cua [data-scroll]) lam du phong.
  function fitSum() {
    const w = $('sumWrap'), sum = $('sum');
    if (sum.hidden) return;
    w.style.zoom = ''; w.style.maxHeight = 'none';
    const cs = getComputedStyle(sum), avail = sum.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const k = Math.min(1, avail / w.offsetHeight);
    if (k < 1) w.style.zoom = Math.max(0.6, k).toFixed(3);
    if (k >= 0.6) return;
    w.style.maxHeight = '';                                      // qua thap: giu khung trong man, noi dung cuon
  }
  // Het cac level da dung -> the ket thuc tam: choi lai level vua xong (tu diem luu dau level), choi lai tu dau, ve menu.
  // Tra ve 'level' | 'all'
  async function endCard() {
    if (level.final) return finalCard();
    const r = summarize(run, level, level.phase), again = LEVELS.indexOf(level) > 0;
    $('cardBody').innerHTML = `
      <p class="font-pixel text-[1.5rem] leading-none tracking-[0.25em] text-px-hi">HẾT PHẦN ĐÃ DỰNG</p>
      <h1 class="px-title mt-5 text-[clamp(2.8rem,8vw,4.8rem)]">LEVEL ${level.no} HOÀN THÀNH</h1>
      ${tierBadge(level.no, r.tier.mood, 'mt-6 size-[132px]', 'text-[3.6rem] text-white')}
      <p class="gm-tag ${MOOD[r.tier.mood]} mt-3 inline-block px-3 pt-1.5 pb-2 text-lg leading-none font-extrabold whitespace-nowrap uppercase max-sm:px-2 max-sm:text-sm">${esc(r.tier.label)}</p>
      <p class="mt-5 text-[1.1rem] leading-relaxed font-medium text-white/90">${esc(level.nextLevel)} sẽ được xây ở bước tiếp theo.</p>
      <div class="mt-8 flex w-full flex-wrap justify-center gap-6 max-sm:flex-col">
        ${again ? `<button data-again="level" class="px-btn px-btn-primary w-auto px-7">${icon('arrowPath', 'size-6', { stroke: 2.25 })}Chơi lại Level ${level.no}</button>` : ''}
        <button data-again="all" class="px-btn ${again ? 'px-btn-blue' : 'px-btn-primary'} w-auto px-7">${icon('arrowPath', 'size-6', { stroke: 2.25 })}Chơi lại từ đầu</button>
        <button id="homeBtn" class="px-btn px-btn-blue w-auto px-7">Về menu</button>
      </div>`;
    $('card').hidden = false;
    $('cardBody').querySelector('[data-again]').focus({ preventScroll: true });
    $('homeBtn').onclick = () => onMenu();
    const pick = await new Promise(r => $('cardBody').querySelectorAll('[data-again]').forEach(b => { b.onclick = () => r(b.dataset.again); }));
    $('card').hidden = true;
    return pick;
  }

  // ---------- ket qua campaign (level cuoi) ----------
  // Cong bo ket qua (the) -> thoai ket thuc voi Anh Minh + Chi Ha (FAIL: om thung do ra cua) -> bao cao cuoi 3 trang
  async function playEnding() {
    const en = level.ending, rep = campaignReport(run, LEVELS), res = rep.result, lines = en.lines[res.code];
    await fade(true);
    Object.assign(view, { night: 0, emo: null });
    await setBg(en.bg); setCast(en.cast, lines.map(l => l.pm)); pm.alias = baseAlias; pmOff(); pm.play('idle');
    await fade(false);
    await card(`
      <p class="font-pixel text-[1.4rem] leading-none tracking-[0.25em] text-px-hi">KẾT QUẢ THỬ VIỆC · NGÀY 60</p>
      ${tierBadge(60, res.mood, 'mt-6 size-[132px]', 'text-[3.2rem] text-white')}
      <h1 class="px-title mt-4 text-[clamp(2.2rem,7vw,4.2rem)]">${esc(res.label.toUpperCase())}</h1>
      <p class="gm-tag ${MOOD[res.mood]} mt-4 inline-block px-3 pt-1.5 pb-2 text-base leading-snug font-extrabold uppercase max-sm:text-sm">${esc(res.title)}</p>
      <p class="mt-8 animate-blink text-sm font-bold tracking-wider text-white/60">${TAP_HINT}</p>`);
    await pmHome();
    for (const l of lines) {
      if (!alive) return;
      if (l.exit) {                                             // roi canh: di ra cua trai bang dong tac rieng (om thung do)
        pm.alias = { ...baseAlias, walk: l.exit }; view.home = false;
        const out = pm.walkTo(-0.3, 3400);
        await say(l); await out;
      } else await say(l);
    }
    hideDialog();
    pm.alias = baseAlias;
    run.result = res.code; run.levelsDone.push(level.id); session.game = { level: level.id, run }; saveSession();
    await showReport(rep);
  }

  // Bao cao cuoi (muc 9 – Man hinh ket qua): (1) ket qua + ly do + 7 chi so ngay 1 -> ngay 60; (2) 6 nang luc + goi y hoc tap;
  // (3) hanh trinh 16 quyet dinh, 3 tich cuc nhat / 3 hau qua lon nhat, quyet dinh cu -> hau qua ve sau
  function showReport(rep) {
    const at = ms => `style="animation-delay:${ms}ms"`, res = rep.result;
    const { html: tiles, n } = metricTiles(rep.changes, at);
    const head = (k, title) => `
      <div class="relative text-center">
        <p class="font-pixel text-[1.25rem] leading-none tracking-[0.2em] text-px-panel/55 max-sm:text-[1rem] max-sm:tracking-[0.06em]">BÁO CÁO THỬ VIỆC · ${esc(name.toUpperCase())}</p>
        <p class="mt-2 text-xl leading-tight font-extrabold text-px-panel max-sm:text-lg">${title}</p>
        <span class="absolute top-0 right-0 font-pixel text-[1.1rem] leading-none tracking-[0.2em] text-px-panel/40 max-sm:hidden">${k}/3</span>
      </div>`;
    const next = (label, ms) => `<button id="sumNext" class="px-btn px-btn-primary animate-rise w-auto px-8 max-sm:w-full" ${at(ms)}>${label}${icon('arrowRight', 'size-6', { stroke: 2.25 })}</button>`;
    // dong ghi chu: the nho (ma) + chu; mau nen / vien / chu theo loai
    const note = (tag, text, tone = 'gm-yellow', bg = '#fff1c7', sh = '#f5cf6a', ink = '#4a2703') => `
      <li class="flex items-start gap-2.5 rounded-lg border-2 border-(--ink) px-3 py-1.5 text-[0.85rem] leading-snug font-semibold" style="background:${bg};color:${ink};box-shadow:inset 0 -3px 0 ${sh}">
        ${tag ? `<span class="gm-tag ${tone} shrink-0 px-1.5 pt-0.5 pb-1 text-[0.7rem] leading-none font-bold whitespace-nowrap">${esc(tag)}</span>` : ''}<span>${esc(text)}</span>
      </li>`;
    const tone = d => (d.avg >= 2 ? 'art-green' : d.avg >= 1 ? 'art-yellow' : 'art-red');
    const page1 = `${head(1, 'Kết quả 60 ngày')}
      <div class="mt-4 flex items-center justify-center gap-4 max-sm:gap-3">
        ${tierBadge(60, res.mood, 'size-[68px] max-sm:size-[52px]', 'text-[1.7rem] text-px-panel max-sm:text-[1.3rem]')}
        <p class="gm-tag ${MOOD[res.mood]} px-3 pt-1.5 pb-2 text-lg leading-snug font-extrabold uppercase max-sm:text-sm">${esc(res.title)}</p>
      </div>
      ${res.reasons.length ? `<ul class="mt-3 flex animate-rise flex-col gap-1.5" ${at(150)} aria-label="Lý do">${res.reasons.map(t => note('', t, '', '#ffe1dc', '#f2a597', '#5a1208')).join('')}</ul>` : ''}
      <p class="sm-h text-center">Chỉ số ngày 1 → ngày 60</p>
      <div id="sumTiles" class="grid grid-cols-2 gap-x-4 gap-y-3 max-sm:grid-cols-1">${tiles}</div>`;
    const bar = (c, i) => `
      <li class="px-hud animate-rise flex items-center gap-3 px-3 py-2" ${at(150 + i * 80)}>
        <span class="w-[46%] min-w-0 text-[0.82rem] leading-tight font-semibold text-white/85">${esc(c.label)}</span>
        <span class="gm-track h-3.5 flex-1" aria-hidden="true">${c.score == null ? '' : `<i class="gm-fill ${c.score >= 67 ? 'gm-green' : c.score >= 34 ? 'gm-yellow' : 'gm-red'}" style="width:${c.score}%"></i>`}</span>
        <span class="w-12 shrink-0 text-right text-[0.95rem] font-extrabold text-white tabular-nums">${c.score ?? '—'}</span>
      </li>`;
    const page2 = `${head(2, 'Sáu năng lực quản lý')}
      <ul class="mt-4 flex flex-col gap-1.5" aria-label="Năng lực">${rep.competencies.map(bar).join('')}</ul>
      <p class="sm-h text-center">Gợi ý học tập tiếp theo</p>
      <ul class="flex animate-rise flex-col gap-1.5" ${at(700)}>${rep.learning.map(l => note(l.code, l.text, 'gm-blue', '#e4f0ff', '#b9cfee', '#0b1d4d')).join('')}</ul>`;
    const rows = LEVELS.map(lv => `
      <div class="flex items-center gap-3"><span class="w-10 shrink-0 font-pixel text-[1rem] text-px-panel/55">LV${lv.no}</span>
        <ol class="sm-line flex-1" aria-label="Quyết định Level ${lv.no}">${rep.decisions.filter(d => d.level === lv.no).map(d => `<li class="sm-node group" tabindex="0">
          <span class="art-sq ${tone(d)} grid size-9 place-items-center pb-0.5 text-[0.9rem] leading-none font-extrabold">${d.choice}</span>
          <span class="mt-0.5 text-[0.7rem] font-bold text-px-panel/60">${d.no}</span>
          <span class="sm-tip px-bubble" role="tooltip"><b>${d.no} · ${esc(d.title)}</b><br>${esc(d.label)}</span>
        </li>`).join('')}</ol></div>`).join('');
    const list = ds => ds.map(d => note(`${d.no} · ${d.choice}`, d.label, d.avg >= 2 ? 'gm-green' : d.avg >= 1 ? 'gm-yellow' : 'gm-red', '#f3f7ff', '#c9d8f0', '#0b1d4d')).join('');
    const page3 = `${head(3, 'Hành trình quyết định')}
      <div class="mt-4 flex flex-col gap-2">${rows}</div>
      <div class="mt-1 grid grid-cols-2 gap-x-4 max-sm:grid-cols-1">
        <div><p class="sm-h text-center">Ba quyết định tích cực nhất</p><ul class="flex flex-col gap-1.5">${list(rep.best)}</ul></div>
        <div><p class="sm-h text-center">Ba quyết định tạo hậu quả lớn nhất</p><ul class="flex flex-col gap-1.5">${list(rep.worst)}</ul></div>
      </div>
      ${rep.links.length ? `<p class="sm-h text-center">Quyết định cũ → hậu quả về sau</p>
      <ul class="flex flex-col gap-1.5">${rep.links.map(l => note(`${l.from} → ${l.to}`, l.text)).join('')}</ul>` : ''}`;
    return sumPage(page1, next('Xem năng lực', 400 + n * 60))
      .then(() => sumPage(page2, next('Xem hành trình', 800)))
      .then(() => sumPage(page3, next('Hoàn tất', 400)))
      .then(() => { $('sum').hidden = true; });
  }
  // Tai bao cao dang chu (.txt)
  function downloadReport() {
    const txt = reportText(campaignReport(run, LEVELS), name, fmt, k => METRIC[k].label);
    const slug = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').replace(/\s+/g, '-').toLowerCase();
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' })), download: `bao-cao-thu-viec-${slug}.txt`,
    });
    portal().append(a); a.click(); a.remove();
    later(1000, () => URL.revokeObjectURL(a.href));
  }
  // The cuoi sau 60 ngay: xem lai bao cao, tai bao cao, choi lai Level cuoi / tu dau, ve menu. Tra ve 'level' | 'all'
  async function finalCard() {
    for (;;) {
      const res = campaignReport(run, LEVELS).result;
      $('cardBody').innerHTML = `
        <p class="font-pixel text-[1.5rem] leading-none tracking-[0.25em] text-px-hi">HOÀN THÀNH 60 NGÀY THỬ VIỆC</p>
        ${tierBadge(60, res.mood, 'mt-6 size-[132px]', 'text-[3.2rem] text-white')}
        <h1 class="px-title mt-4 text-[clamp(2.2rem,7vw,4.2rem)]">${esc(res.label.toUpperCase())}</h1>
        <p class="mt-3 text-[1.1rem] leading-relaxed font-medium text-white/90">${esc(name)} · ${esc(res.title)}</p>
        <div class="mt-8 flex w-full flex-wrap justify-center gap-5 max-sm:flex-col">
          <button data-act="report" class="px-btn px-btn-primary w-auto px-7">Xem lại báo cáo</button>
          <button data-act="download" class="px-btn px-btn-blue w-auto px-7">Tải báo cáo</button>
        </div>
        <div class="mt-5 flex w-full flex-wrap justify-center gap-5 max-sm:flex-col">
          <button data-act="level" class="px-btn px-btn-blue w-auto px-7">${icon('arrowPath', 'size-6', { stroke: 2.25 })}Chơi lại Level ${level.no}</button>
          <button data-act="all" class="px-btn px-btn-blue w-auto px-7">${icon('arrowPath', 'size-6', { stroke: 2.25 })}Chơi lại từ đầu</button>
          <button data-act="menu" class="px-btn px-btn-blue w-auto px-7">Về menu</button>
        </div>`;
      $('card').hidden = false;
      $('cardBody').querySelector('[data-act]').focus({ preventScroll: true });
      const act = await new Promise(r => $('cardBody').querySelectorAll('[data-act]').forEach(b => { b.onclick = () => r(b.dataset.act); }));
      if (act === 'menu') { onMenu(); return new Promise(() => {}); }   // man bi go khi doi man: khong tra ve
      if (act === 'download') { downloadReport(); continue; }
      $('card').hidden = true;
      if (act === 'report') { await showReport(campaignReport(run, LEVELS)); continue; }
      return act;
    }
  }

  // Diem luu dau level (tu level 2): ban sao trang thai truoc lua chon dau tien, de "Choi lai Level N"
  const snapshot = r => { const { checkpoints, ...rest } = r; return JSON.parse(JSON.stringify(rest)); };
  // Bat dau level: level dau = phien moi; level sau ke thua trang thai (tai lieu muc 5 – Trang thai dau level), ghi chi so
  // dau level cho bang tong ket va luu phien de "Tiep tuc" vao dung level
  function startLevel() {
    if (level === LEVELS[0] || !run) { level = LEVELS[0]; run = newRun(); return; }
    beginLevel(run, level);
    run.checkpoints = { ...run.checkpoints, [level.id]: snapshot(run) };
    session.game = { level: level.id, run }; saveSession();
  }
  // Choi tiep tu cho dang do: chua chon gi -> tu dau level (the Level + canh chuyen + mo dau); da chon mot phan -> tinh huong
  // chua xong ke tiep
  async function playLevel() {
    const fresh = !level.scenarios.some(s => run?.choices[s.id]);
    if (fresh) startLevel();
    $('hudLv').textContent = `LV${level.no} · ${level.title}`;
    renderHud(); preload(level);
    // PM kiet suc tu level co co `tired` tro di (vd pm_overloaded -> Level 2 tro di dung bo tired_*)
    baseAlias = levelsSoFar().some(l => l.tired && run.flags[l.tired]) ? TIRED : null;
    pm.alias = baseAlias;
    if (fresh) {
      await levelCard();
      $('fade').classList.remove('opacity-0');                          // man den cho toi khi nen nap xong
      if (level.prelude && run.flags[level.prelude.ifFlag]) await playPrelude(level.prelude);
      if (level.intro) await playIntro();                             // Level 3: khong co mo dau, vao thang tinh huong
    }
    for (const s of level.scenarios) {
      if (!alive) return;
      if (!run.choices[s.id]) await playScenario(s);
    }
    const done = run.levelsDone.includes(level.id), end = level.summary || level.ending;
    if (!done) await (level.final ? playEnding() : playSummary());     // level cuoi: ket qua campaign thay tong ket level
    else { await setBg(end.bg); setCast(end.cast); }
  }
  async function play() {
    while (alive) {
      for (let i = LEVELS.indexOf(level); i < LEVELS.length && alive; i++) { level = LEVELS[i]; await playLevel(); }
      if (!alive) return;
      const again = await endCard();
      const cp = again === 'level' && run.checkpoints?.[level.id];
      if (cp) run = { ...JSON.parse(JSON.stringify(cp)), checkpoints: run.checkpoints };
      else { level = LEVELS[0]; run = null; }
      session.game = run && { level: level.id, run }; saveSession(); pmOff();
    }
  }

  // ---------- gan su kien ----------
  $('lv').addEventListener('click', onClick);
  $('dlgNext').onclick = () => advance();            // dang go chu -> hien het; da het -> sang cau
  $('pmHit').onclick = () => staffCard('PM', $('pmHit'));
  $('menuBtn').onclick = () => onMenu();
  $('tourBtn').onclick = () => tour();
  const onResize = () => { layout(); drawHudIcons(); fitResult(); fitSum(); };
  addEventListener('keydown', onKey); addEventListener('resize', onResize);
  drawHudIcons(); layout();
  play();

  return {
    update(now) {
      // san khau truot toi mep bang dang mo (ease-out theo thoi gian, ~250ms)
      const goal = stageFoot(), dt = Math.min(64, now - (lastNow || now)); lastNow = now;
      if (Math.abs(goal - view.foot) > 0.5) { view.foot += (goal - view.foot) * (1 - Math.exp(-dt / 90)); placeStage(); }
      else if (goal !== view.foot) { view.foot = goal; placeStage(); }
      if (typing && !typing.done) {
        const n = Math.floor((now - typing.t) * CPS / 1000);
        if (n >= typing.text.length) finishTyping(); else $('dlgText').textContent = typing.text.slice(0, n);
      }
      drawStage(cv, pm, view, now);
      drawNpcs(now);
      const focus = !$('result').hidden;
      // canh dem (vd team OT): NPC o lop rieng tren canvas san khau -> toi theo cung muc (bang ket qua mo thi de lop focus lo)
      const nf = view.night > 0 && !focus ? `brightness(${(1 - 0.5 * view.night).toFixed(2)}) saturate(.8)` : '';
      if ($('npcs').style.filter !== nf) $('npcs').style.filter = nf;
      if ($('lv').hasAttribute('data-focus') !== focus) {
        $('lv').toggleAttribute('data-focus', focus);
        if (focus) pmBaseX = pm.x;                                   // nho vi tri PM de tra lai khi dong bang
        else { if (pmBaseX != null) pm.x = pmBaseX; pmBaseX = null; $('result').style.left = ''; }
      }
      // Man ngang: PM (kem ban, ~1.75 chieu cao nhan vat) + bang ket qua can giua thanh mot cum; PM truot em toi cho
      if (focus && !tall && pmBaseX != null && !pm.walk) {
        const W = innerWidth, P = $('result').offsetWidth, Z = view.ch * 1.75, gap = 48;
        const left = Math.max(12, (W - (Z + gap + P)) / 2), goal = (left + Z * 0.27) / W;
        pm.x += (goal - pm.x) * (1 - Math.exp(-dt / 140));
        $('result').style.left = `${Math.min(W - P, left + Z + gap)}px`;
      }
      if (focus) {
        const f = $('focus').style;
        f.setProperty('--fx', `${pm.x * innerWidth}px`); f.setProperty('--fy', `${view.foot - view.ch * 0.45}px`);
        f.setProperty('--rx', `${view.ch * 1.9}px`); f.setProperty('--ry', `${view.ch * 1.35}px`);
      }
      // vung bam PM bam theo sprite: rong ~0.45 chieu cao nhan vat, day = chan
      const w = view.ch * 0.45;
      Object.assign($('pmHit').style, { left: `${pm.x * innerWidth - w / 2}px`, top: `${view.foot - view.ch}px`, width: `${w}px`, height: `${view.ch}px` });
    },
    destroy() {
      alive = false; timers.forEach(clearTimeout); closeStaffCard();
      removeEventListener('keydown', onKey); removeEventListener('resize', onResize);
    },
  };
}
