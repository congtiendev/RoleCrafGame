// Man tinh huong (gameplay) – Level 1: the Level -> mo dau o sanh (Anh Minh) -> S01..S04: PM di vao (hoac ngoi san),
// thoai, hoi, chon A/B/C, dien nhanh, bang ket qua cong/tru chi so tren HUD -> tong ket Level 1 voi Anh Minh.
// Luu phien sau moi lua chon: mo lai trang thi choi tiep tu tinh huong chua xong.
// PM ve bang sprite (stage.js); Anh Minh, Huy, Lan... chua co sprite day du -> the nhan vat tam (UI).
import { $, esc } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { session, saveSession } from './session.js';
import { METRICS, METRIC, METRIC_GROUPS, newRun, applyChoice, enterScenario, isGood } from './rules.js';
import { LEVEL1, CAST } from './level1.js';
import { summarize } from './summary.js';
import { Actor, drawStage, drawIcon } from './stage.js';
import { drawFace } from './portrait.js';
import { hudTour } from './hudTour.js';
import { openStaffCard, closeStaffCard } from './staffCard.js';

const CPS = 45;                                          // ky tu / giay khi chu hien dan
const BG = name => ({ pc: `bg/${name}_pc.webp`, mobile: `bg/${name}_mobile.webp` });
// Vi tri dung (ti le be ngang): PM ben trai, NPC ben phai theo so nguoi trong canh; man doc hep hon nen dan sat mep
const POS = {
  wide: { pm: 0.3, npc: { 1: [0.66], 2: [0.62, 0.78], 3: [0.56, 0.7, 0.84] } },
  tall: { pm: 0.24, npc: { 1: [0.7], 2: [0.62, 0.85], 3: [0.5, 0.68, 0.86] } },
};
const SYS = { name: 'Thông báo', tint: 'var(--color-brand-blue)' };        // dong 'SYS' – thong bao he thong trong thoai
const MOOD = { good: 'gm-green', mid: 'gm-yellow', bad: 'gm-red' };   // mau nhan xep loai tong ket (the phang .gm-tag)
// Huy hieu xep loai (ui/badges): vong nguyet que vang / bac / dong, so level o giua long trong suot
const TIER_BADGE = { good: 'gold', mid: 'silver', bad: 'bronze' };
const tierBadge = (mood, cls, numCls) => `
  <span class="relative grid shrink-0 place-items-center ${cls}">
    <img src="ui/badges/badge_laurel_${TIER_BADGE[mood]}.webp" alt="" class="absolute inset-0 size-full object-contain" draggable="false">
    <span class="relative -mt-[12%] font-pixel leading-none ${numCls}">${LEVEL1.no}</span>
  </span>`;
const TAP_HINT = `<span class="pointer-coarse:hidden">NHẤN ENTER ĐỂ TIẾP TỤC</span><span class="hidden pointer-coarse:inline">CHẠM ĐỂ TIẾP TỤC</span>`;
// cung dieu kien voi variant hud-col (components.css)
const HUD_COL = matchMedia('(orientation: portrait), (width < 48rem)');
// cung dieu kien voi variant rs-sm (components.css): bang ket qua ban gon
const RS_SM = matchMedia('((orientation: portrait) and (width < 40rem)), (height <= 560px)');
// Thanh chi so mini (.hud-meter): moi chi so tinh tren thang 100 (quy bat dau 100, du hon thi day thanh).
// Mau theo muc co loi: rui ro (bad) cao = do.
const meter = (m, v) => {
  const p = Math.max(0, Math.min(1, v / 100)), good = m.bad ? 1 - p : p;
  return { width: `${p * 100}%`, tone: good >= 0.6 ? 'green' : good >= 0.35 ? 'yellow' : 'red' };
};

// Chi so HUD: moi chi so mot badge rieng, xep theo nhom. man ngang = hang tren cung;
// man doc / hep (variant hud-col, components.css) = 2 cot doc hai ben
const hudStat = m => `
  <li class="hud-stat px-hud flex flex-wrap items-center gap-x-1.5 gap-y-1 px-1.5 py-1 [@media(max-height:560px)]:gap-x-1 [@media(max-height:560px)]:px-1 [@media(max-height:560px)]:py-0.5 hud-col:w-[58px] hud-col:flex-col hud-col:flex-nowrap hud-col:gap-y-0.5 hud-col:px-0.5 hud-col:py-1" title="${m.label}" data-stat="${m.key}">
    <canvas data-ic class="shrink-0" aria-hidden="true"></canvas>
    <span class="sr-only">${m.label}</span>
    <span data-v class="min-w-[3ch] text-[1.2rem] leading-none font-bold tabular-nums transition-colors duration-300 hud-col:min-w-0 hud-col:text-[0.95rem] [@media(max-height:560px)]:text-base"></span>
    <span class="text-xs font-semibold text-white/65 max-xl:hidden">${m.short}</span>
    <span class="hud-meter basis-full hud-col:mt-0.5 hud-col:basis-auto" aria-hidden="true"><i data-fill></i></span>
  </li>`;
const hudGroup = (g, i) => `
  <ul data-group="${g.id}" aria-label="Chỉ số ${g.label.toLowerCase()}" class="flex items-center gap-x-3 [@media(max-height:560px)]:gap-x-2
      hud-col:absolute hud-col:top-full hud-col:mt-3 hud-col:flex-col hud-col:gap-y-3 ${i ? 'hud-col:right-3' : 'hud-col:left-3'}">
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
    <header id="hud" class="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 max-md:p-2">
      <div class="flex shrink-0 items-center gap-3 max-sm:gap-2">
        <button id="menuBtn" class="px-btn px-btn-blue px-btn-sq max-sm:size-10" title="Về menu" aria-label="Về menu">${icon('arrowLeft', 'size-6 max-sm:size-5', { stroke: 2.5 })}</button>
        <button id="tourBtn" class="px-btn px-btn-blue px-btn-sq max-sm:size-10" title="Hướng dẫn chỉ số" aria-label="Hướng dẫn chỉ số">${icon('questionMarkCircle', 'size-6 max-sm:size-5', { stroke: 2.25 })}</button>
        <!-- ten level + ngay tren mot dong, khong xuong dong -->
        <div class="px-hud flex items-baseline gap-2.5 px-2.5 py-1.5 whitespace-nowrap max-sm:gap-2 max-sm:px-2">
          <p class="font-pixel text-[1.45rem] leading-none tracking-wider text-px-hi max-sm:text-[1.1rem]">LV${LEVEL1.no} · ${LEVEL1.title}</p>
          <p id="hudDay" class="text-sm leading-none font-bold tracking-wider text-white/85 max-sm:text-xs"></p>
        </div>
      </div>
      <div id="hudStats" class="flex gap-6 hud-col:contents [@media(max-height:560px)]:gap-3">${METRIC_GROUPS.map(hudGroup).join('')}</div>
    </header>

    <!-- hop thoai -->
    <div id="dlg" class="invisible absolute inset-x-0 bottom-0 z-10 flex justify-center p-4 max-sm:p-2.5 [@media(max-height:560px)]:p-2" aria-live="polite">
      <div class="px-panel relative grid min-h-[9.5rem] w-[min(1000px,100%)] grid-cols-[auto_1fr] items-start gap-5 px-6 py-5 max-sm:min-h-[10rem] max-sm:gap-3 max-sm:px-4 max-sm:py-4 [@media(max-height:560px)]:min-h-0 [@media(max-height:560px)]:py-3">
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
            <img src="ui/cursors/link@2x.png" alt="" class="relative size-full animate-tap" draggable="false">
          </span>
        </button>
      </div>
    </div>

    <!-- lua chon -->
    <div id="choice" hidden class="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 max-sm:p-2.5 [@media(max-height:560px)]:p-2">
      <div class="px-panel w-[min(1000px,100%)] animate-rise px-6 py-5 max-sm:px-4 max-sm:py-4 [@media(max-height:560px)]:py-3">
        <p id="chTag" class="text-sm leading-none font-bold tracking-widest text-brand-red"></p>
        <h2 id="chQ" class="mt-1.5 text-[1.3rem] leading-snug font-bold max-sm:text-[1.1rem]"></h2>
        <div id="chList" class="mt-5 grid grid-cols-3 gap-5 max-md:grid-cols-1 max-md:gap-3.5 [@media(max-height:560px)]:mt-3 [@media(max-height:560px)]:grid-cols-3 [@media(max-height:560px)]:gap-3"></div>
      </div>
    </div>

    <!-- ket qua lua chon -->
    <!-- Bang ket qua KHONG che nhan vat (nhan vat luon dung tren san): ngang = the doc bam phai (PM dung ben trai),
         doc = the ngang ngay duoi hang HUD tren cung, cao toi da ~52% man (PM o nua duoi). --hudb: layout() -->
    <div id="result" hidden class="absolute z-20 flex overflow-y-auto p-4 max-sm:p-2.5 [@media(max-height:560px)]:p-2
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
          <ul id="rsList" class="flex flex-col gap-2 rs-sm:grid rs-sm:grid-cols-2 rs-sm:gap-1.5" aria-label="Thay đổi chỉ số"></ul>
          <button id="rsNext" class="px-btn px-btn-primary px-btn-hint mt-auto rs-sm:py-2 rs-sm:text-base">Tiếp tục${icon('arrowRight', 'size-6', { stroke: 2.25 })}</button>
        </div>
      </div>
    </div>

    <!-- tong ket level -->
    <div id="sum" hidden class="absolute inset-0 z-20 flex overflow-y-auto bg-px-ink/55 p-4 max-sm:p-2.5">
      <div id="sumBody" class="px-panel m-auto w-[min(920px,100%)] animate-rise px-7 py-6 max-sm:px-4 max-sm:py-5"></div>
    </div>

    <!-- the chuyen canh: Level / Ngay -->
    <div id="card" hidden data-tap class="absolute inset-0 z-30 flex overflow-y-auto bg-px-ink/85 p-5">
      <div id="cardBody" class="m-auto flex max-w-[640px] flex-col items-center text-center"></div>
    </div>
    <div id="fade" class="pointer-events-none absolute inset-0 z-40 bg-black opacity-0 transition-opacity duration-500"></div>
  </section>`;

export function mountLevel(root, { onMenu }) {
  root.innerHTML = template();
  const name = session.playerName || 'Bạn';
  const pm = new Actor(-0.15);
  const view = { foot: 0, ch: 0, night: 0, emo: null };
  const cv = $('stage');
  let run = session.game?.level === LEVEL1.id ? session.game.run : null;
  let pmBaseX = null, lastNow = 0, alive = true, waiter = null, typing = null, tall = false, npcs = {}, timers = [];
  const later = (ms, f) => timers.push(setTimeout(f, ms));
  const sleep = ms => new Promise(r => later(ms, r));

  // Nap truoc cac nen cua level (anh 4K, nang) theo huong man hinh
  const bgs = [LEVEL1.intro.bg, ...LEVEL1.scenarios.map(s => s.bg)];
  const orient = () => (innerHeight > innerWidth ? 'mobile' : 'pc');
  bgs.forEach(b => { new Image().src = BG(b)[orient()]; });

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
    const P = POS[tall ? 'tall' : 'wide'], slots = P.npc[Object.keys(npcs).length] || [];   // chua co NPC: khong dat gi
    const gap = slots.length > 1 ? (slots[1] - slots[0]) * W : W;          // khoang cach 2 the canh nhau
    Object.values(npcs).forEach(n => placeNpc(n, slots[n.slot], gap));
  }
  function layout() {
    tall = innerHeight > innerWidth;
    $('lv').style.setProperty('--hudb', `${$('hud').getBoundingClientRect().bottom}px`);   // mep duoi HUD cho #result
    view.foot = stageFoot();                                        // doi kich thuoc man hinh: dat thang, khong noi suy
    placeStage();
  }

  // ---------- HUD ----------
  const statEl = k => $('hudStats').querySelector(`[data-stat="${k}"]`);
  function drawHudIcons() {
    const size = HUD_COL.matches ? 24 : innerHeight <= 560 ? 22 : 28;
    METRICS.forEach(m => drawIcon(statEl(m.key).querySelector('canvas'), m.icon, size));
  }
  function setMeter(m, v) {
    const { width, tone } = meter(m, v), fill = statEl(m.key).querySelector('[data-fill]');
    fill.style.width = width; fill.dataset.tone = tone;
  }
  function renderHud() {
    METRICS.forEach(m => { statEl(m.key).querySelector('[data-v]').textContent = run.metrics[m.key]; setMeter(m, run.metrics[m.key]); });
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
      pop.innerHTML = `${icon(d > 0 ? 'arrowUp' : 'arrowDown', 'size-3.5', { stroke: 3 })}${d > 0 ? '+' : ''}${d}`;
      li.append(pop);
      // so dem + thanh chi so tang/giam tung khung hinh (ease-out), mau thanh doi dung luc vuot nguong
      const step = now => {
        const p = Math.min(1, (now - t0) / 900), e = 1 - (1 - p) ** 3, v = c.from + (c.to - c.from) * e;
        el.textContent = Math.round(v);
        setMeter(METRIC[c.key], v);
        if (p < 1 && alive) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      later(2600, () => { pop.remove(); delete li.dataset.fx; el.classList.remove('text-[#9cf07f]', 'text-[#ff8a7a]'); });
    }));
  }

  // ---------- NPC: the nhan vat tam ----------
  function setCast(ids) {
    closeStaffCard(); $('npcs').innerHTML = ''; npcs = {};
    ids.forEach((id, slot) => {
      const c = CAST[id], el = document.createElement('button');
      el.type = 'button'; el.className = 'gm-plate px-standee opacity-0';
      el.setAttribute('aria-label', `Xem thẻ ${c.client ? 'khách hàng' : 'nhân viên'}: ${c.name}`);
      el.onclick = () => staffCard(id, el);
      el.style.setProperty('--tint', c.tint);
      el.innerHTML = `<span data-in>
        <span data-av class="grid w-full flex-1 place-items-center" style="background:${c.tint}">
          ${icon('user', 'text-white/90', { stroke: 2 })}
        </span>
        <span data-nm class="w-full truncate pt-1 text-center leading-none font-extrabold text-white">${esc(c.name.split(' ').at(-1).toUpperCase())}</span>
      </span>`;
      el.title = `${c.name} – ${c.role}`;
      $('npcs').append(el);
      npcs[id] = { el, slot };
    });
    layout();
    requestAnimationFrame(() => Object.values(npcs).forEach(n => n.el.classList.remove('opacity-0')));
  }
  function placeNpc(n, x, gap) {
    // the ti le 237x314 (the .gm-plate); canh dong nguoi thi hep lai, chua khe
    const w = Math.min(Math.max(58, view.ch * 0.5), gap - 12), h = w * 314 / 237;
    Object.assign(n.el.style, { left: `${x * innerWidth - w / 2}px`, top: `${view.foot - h}px`, width: `${w}px`, height: `${h}px` });
    const sv = n.el.querySelector('svg'); sv.style.width = sv.style.height = `${w * 0.5}px`;
    n.el.querySelector('[data-nm]').style.fontSize = `${Math.max(12, w * 0.17)}px`;
  }
  // The nhan vien (tooltip tren dau nhan vat): NPC theo CAST, PM = nguoi choi (chan dung sheet D)
  function staffCard(id, anchor) {
    if (id === 'PM') return openStaffCard({ name, role: 'Project Manager (thử việc)', face: 'face_neutral',
      desc: 'Tiếp quản dự án và ra quyết định trong 60 ngày thử việc.', facts: [
      ['Quản lý', 'Anh Minh – Trưởng phòng/PM Lead'],
      ['Team', 'Huy (Backend) · Linh (Frontend) · Lan (BA/QA)'],
      ['Thử việc', `Ngày ${run.day} / 60`],
    ] }, anchor);
    const c = CAST[id];
    openStaffCard({ name: c.name, role: c.role, desc: c.desc, tint: c.tint, client: c.client,
      facts: [['Đơn vị', c.client ? 'Khách hàng của dự án' : 'Innocom · Team dự án']] }, anchor);
  }
  const talking = id => Object.entries(npcs).forEach(([k, n]) => { n.el.toggleAttribute('data-talk', k === id); n.el.toggleAttribute('data-sel', k === id); });

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
  const waitInput = ms => new Promise(res => {
    waiter = () => { waiter = null; res(); };
    if (ms) later(ms, () => waiter && waiter());
  });
  function advance() {
    if (typing && !typing.done) { finishTyping(); return; }
    waiter?.();
  }
  // Chuot/cham: hoi thoai chi sang cau qua nut goc #dlgNext; the chuyen canh toan man (#card, "cham de tiep tuc") thi cham dau cung duoc
  const onClick = e => { if (e.target.closest('#card') && !e.target.closest('button')) advance(); };
  const onKey = e => {
    if (document.querySelector('dialog:modal')) return;   // hop thoai modal dang mo: phim thuoc ve dialog
    if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('button')) { e.preventDefault(); advance(); }
    if (!$('choice').hidden && /^[abc123]$/i.test(e.key)) {
      const i = 'abc123'.indexOf(e.key.toLowerCase()) % 3; $('chList').children[i]?.click();
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !$('choice').hidden) {
      e.preventDefault();
      const list = [...$('chList').children], i = list.indexOf(document.activeElement);
      const d = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : list.length - 1;
      list[(i < 0 ? 0 : i + d) % list.length].focus();
    }
  };

  // ---------- hop thoai ----------
  // who: 'PM' (chan dung sheet D) | id NPC (huy hieu chu cai) | 'SYS' (huy hieu chuong) | 'NARR' (dan truyen, chu nghieng)
  function showLine(line) {
    const isPm = line.who === 'PM', isSys = line.who === 'SYS', npc = CAST[line.who] || (isSys ? SYS : null);
    $('dlg').classList.remove('invisible');
    $('dlgFace').hidden = !isPm && !npc;
    $('dlgCv').hidden = !isPm; $('dlgBadge').classList.toggle('hidden', isPm); $('dlgBadge').classList.toggle('grid', !isPm);
    if (isPm) drawFace($('dlgCv'), line.face || 'face_neutral', innerWidth < 640 || innerHeight <= 560 ? 68 : 96);
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
    talking(line.who);
  }
  function finishTyping() {
    typing.done = true; $('dlgText').textContent = typing.text;
  }
  async function say(line) {
    pm.play(line.pm || (line.who === 'PM' ? 'talk' : 'idle'));
    showLine(line);
    await waitInput();
  }
  const hideDialog = () => { $('dlg').classList.add('invisible'); typing = null; talking(null); };

  // ---------- the chuyen canh ----------
  async function card(html, ms) {
    $('cardBody').innerHTML = html; $('card').hidden = false;
    await waitInput(ms);
    $('card').hidden = true;
  }
  const levelCard = () => card(`
    <span class="art-btn art-red mb-5 px-4 pt-1.5 pb-2 font-pixel text-[1.6rem] leading-none tracking-[0.3em] [--bw:16px] [--bw2:18px]">LEVEL ${LEVEL1.no}</span>
    <h1 class="px-title text-[clamp(3.6rem,10vw,6.5rem)]">${LEVEL1.title}</h1>
    <p class="mt-8 text-[1.3rem] leading-none font-bold tracking-widest text-white">${LEVEL1.days}</p>
    <p class="mt-4 text-[1.1rem] leading-relaxed font-medium text-white/85">${LEVEL1.goal}</p>
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
      return `<li class="px-hud rs-row animate-rise" style="animation-delay:${120 + i * 90}ms" data-icon="${m.icon}" data-tone="${tone}">
        <span class="rs-plate"><canvas aria-hidden="true"></canvas></span>
        <div class="min-w-0 flex-1">
          <span class="block truncate text-[0.92rem] leading-tight font-bold text-white rs-sm:text-xs"><span class="rs-sm:hidden">${m.label}</span><span class="hidden rs-sm:inline">${m.short}</span></span>
          <div class="mt-1.5 flex items-center gap-2 rs-sm:mt-1 rs-sm:gap-1">
            <span class="gm-track rs-bar flex-1" aria-hidden="true"><i class="gm-fill gm-blue" data-base></i><i class="gm-fill" data-delta data-stripes></i></span>
            <span class="shrink-0 text-xs font-semibold text-white/60 tabular-nums rs-sm:hidden">${ch.from} → <b class="text-white">${ch.to}</b></span>
          </div>
        </div>
        <span class="gm-tag rs-delta ${{ good: 'gm-green', bad: 'gm-red', same: 'gm-blue' }[tone]}">${d ? icon(d > 0 ? 'arrowUp' : 'arrowDown', 'size-3.5', { stroke: 3 }) : ''}${Math.abs(d)}</span>
      </li>`;
    }).join('');
    ul.querySelectorAll('li').forEach((li, i) => {
      drawIcon(li.querySelector('canvas'), li.dataset.icon, RS_SM.matches ? 20 : 30);
      const ch = changes[i], { min, max } = METRIC[ch.key], lo = Math.min(ch.from, ch.to);
      const pct = v => `${Math.max(0, Math.min(100, (v - min) * 100 / (max - min)))}%`;
      const base = li.querySelector('[data-base]'), delta = li.querySelector('[data-delta]');
      base.style.width = pct(lo);
      Object.assign(delta.style, { left: pct(lo), width: '0%' });
      later(420 + i * 90, () => { delta.style.width = `calc(${pct(Math.max(ch.from, ch.to))} - ${pct(lo)})`; });
    });
  }

  // Bang ket qua: chu cai lua chon + tieu de, chip dem chi so tot/xau, canh bao tri hoan, the tung chi so
  // (thanh: nen = gia tri giu nguyen, doan mau = phan tang/giam; chay dan toi gia tri moi). Rui ro: tang la xau.
  function showResult(s, c, changes) {
    const good = changes.filter(isGood).length, bad = changes.length - good;
    $('rsLetter').textContent = c.id;
    $('rsTag').textContent = `Kết quả · ${s.no}`;
    $('rsTitle').textContent = c.label;
    $('rsText').textContent = c.result;
    $('rsLater').hidden = !c.delayed?.length;
    const chip = (n, ic, text, cls) => n ? `<span class="gm-tag ${cls} inline-flex items-center gap-1.5 px-2 pt-1 pb-1.5 text-xs leading-none font-bold">${icon(ic, 'size-4', { stroke: 2.5 })}${n} ${text}</span>` : '';
    $('rsTally').innerHTML = chip(good, 'arrowTrendingUp', 'cải thiện', 'gm-green')
      + chip(bad, 'arrowTrendingDown', 'xấu đi', 'gm-red')
      || '<span class="text-sm font-semibold text-px-panel/60">Không có chỉ số nào thay đổi.</span>';
    fillMetricRows($('rsList'), changes);
    $('result').hidden = false;
    $('rsNext').focus({ preventScroll: true });
    return new Promise(res => { $('rsNext').onclick = () => { $('result').hidden = true; res(); }; });
  }

  // Dan canh sau lua chon: dong tac PM, do vat, canh dem
  async function stageBranch(c, part) {
    if (part !== 'after' || !c.after) return;
    const a = c.after;
    if (a.night) {
      Object.values(npcs).forEach(n => n.el.classList.add('opacity-0'));   // ca team da ve
      const t0 = performance.now();
      await new Promise(r => { const f = now => { view.night = Math.min(1, (now - t0) / 900); view.night < 1 && alive ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); });
    }
    pm.play(a.pm);
    if (a.then) { await sleep(1600); pm.play(a.then); }
    if (a.emo) view.emo = a.emo;
    await sleep(900);
  }

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
  async function playIntro() {
    const it = LEVEL1.intro;
    await setBg(it.bg); setCast(it.cast);
    pm.x = -0.15; await fade(false);
    if (!session.hudTourDone) { await tour(); session.hudTourDone = true; saveSession(); }
    await pm.walkTo(POS[tall ? 'tall' : 'wide'].pm, 1700);
    for (const l of it.lines) { if (!alive) return; await say(l); }
    hideDialog();
    await pm.walkTo(1.15, 1900);                          // PM di tiep vao khu lam viec
  }
  async function playScenario(s) {
    await fade(true);
    Object.assign(view, { night: 0, emo: null });
    await setBg(s.bg); setCast(s.cast);
    const from = run.day;
    // hop ban: PM ngoi san (s.enter), khong di vao
    if (s.enter) { pm.x = POS[tall ? 'tall' : 'wide'].pm; pm.play(s.enter); } else { pm.x = -0.15; pm.play('idle'); }
    const due = enterScenario(run, s); renderHud();
    await fade(false);
    await dayCard(s, from);
    if (due.length) animateHud(due);
    if (!s.enter) await pm.walkTo(POS[tall ? 'tall' : 'wide'].pm, 1700);
    for (const l of s.open) { if (!alive) return; await say(l); }
    const c = await ask(s);
    const changes = applyChoice(run, s, c);
    session.game = { level: LEVEL1.id, run }; saveSession();
    await stageBranch(c, 'lines');
    for (const l of c.lines) { if (!alive) return; await say(l); }
    hideDialog();
    await stageBranch(c, 'after');
    animateHud(changes);
    await showResult(s, c, changes);
  }
  // Tong ket Level 1: sanh, Anh Minh; bang bao cao -> nhan xet theo xep loai
  async function playSummary() {
    const sm = LEVEL1.summary, r = summarize(run, LEVEL1, 'P1');
    await fade(true);
    Object.assign(view, { night: 0, emo: null });
    await setBg(sm.bg); setCast(sm.cast); pm.x = -0.15; pm.play('idle');
    await fade(false);
    await pm.walkTo(POS[tall ? 'tall' : 'wide'].pm, 1700);
    await showSummary(r);
    for (const l of sm.comments[r.tier.mood]) { if (!alive) return; await say(l); }
    hideDialog();
    run.summaryDone = true; session.game = { level: LEVEL1.id, run }; saveSession();
  }
  // Tong ket level – thiet ke "it chu": 1 ket luan + 1 cau ly do, o chi so chi hien cai da doi (xep theo muc doi),
  // 3 the noi bat (icon + so lon + 1 dong), quyet dinh = dong thoi gian cham mau (nhan chi hien khi re/cham).
  // Cac khoi hien dan theo nhip (animate-rise + delay) de mat nguoi choi di dung thu tu.
  function showSummary(r) {
    const at = ms => `style="animation-delay:${ms}ms"`;
    const moved = r.changes.map(c => ({ ...c, m: METRIC[c.key], d: c.to - c.from })).filter(c => c.d);
    moved.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    const still = r.changes.filter(c => c.to === c.from).map(c => METRIC[c.key].short);
    const ups = moved.filter(isGood), downs = moved.filter(c => !isGood(c));
    // 1 cau ly do tu so lieu: tien bo nhat + dang lo nhat
    const why = [ups[0] && `<b class="text-[#0f8a4f]">${ups[0].m.label} ${ups[0].d > 0 ? '+' : ''}${ups[0].d}</b>`,
      downs[0] && `<b class="text-[#c0261f]">${downs[0].m.label} ${downs[0].d > 0 ? '+' : ''}${downs[0].d}</b>`].filter(Boolean);
    const tile = (c, i) => `
      <li class="px-hud sm-tile animate-rise" ${at(250 + i * 70)} data-icon="${c.m.icon}" title="${c.m.label}: ${c.from} → ${c.to}">
        <canvas aria-hidden="true"></canvas>
        <span class="min-w-0 flex-1"><span class="block truncate text-xs font-semibold text-white/70">${c.m.short}</span>
          <span class="block text-lg leading-none font-extrabold tabular-nums">${c.to}</span></span>
        <span class="gm-tag ${isGood(c) ? 'gm-green' : 'gm-red'} shrink-0 px-1.5 pt-0.5 pb-1 text-sm leading-none font-extrabold tabular-nums">${c.d > 0 ? '+' : ''}${c.d}</span>
      </li>`;
    const dz = r.dangers.length;
    const card = (ic, tone, label, big, sub, i) => `
      <div class="gm-tile sm-card animate-rise ${tone}" ${at(700 + i * 110)}>
        <span class="sm-ic">${icon(ic, 'size-6', { stroke: 2 })}</span>
        <p class="text-[0.7rem] font-bold tracking-[0.14em] text-px-panel/55 uppercase">${label}</p>
        <p class="mt-0.5 text-[1.6rem] leading-none font-black">${big}</p>
        <p class="mt-1.5 line-clamp-2 text-[0.82rem] leading-snug font-semibold text-px-panel/75">${sub}</p>
      </div>`;
    const tone = d => (d.avg >= 2 ? 'gm-green' : d.avg >= 1 ? 'gm-yellow' : 'gm-red');
    $('sumBody').innerHTML = `
      <div class="flex items-center gap-4">
        ${tierBadge(r.tier.mood, 'size-[84px] max-sm:size-[64px]', 'text-[2.4rem] text-px-panel max-sm:text-[1.9rem]')}
        <div class="min-w-0">
          <p class="font-pixel text-[1.25rem] leading-none tracking-[0.2em] text-px-panel/55 max-sm:text-[1.05rem]">TỔNG KẾT LV${LEVEL1.no} · ${LEVEL1.days.toUpperCase()}</p>
          <p class="gm-tag ${MOOD[r.tier.mood]} mt-2 inline-block px-3 pt-1.5 pb-2 text-xl leading-none font-extrabold uppercase max-sm:text-base">${esc(r.tier.label)}</p>
          ${why.length ? `<p class="mt-2 text-[0.95rem] leading-snug font-semibold text-px-panel/80">${why.join(' <span class="text-px-panel/35">·</span> ')}</p>` : ''}
        </div>
      </div>

      <p class="sm-h animate-rise" ${at(200)}>Chỉ số thay đổi</p>
      <ul id="sumTiles" class="grid grid-cols-4 gap-2.5 max-md:grid-cols-3 max-sm:grid-cols-2" aria-label="Chỉ số thay đổi trong level">${moved.map(tile).join('')}</ul>
      ${still.length ? `<p class="mt-2 text-sm font-semibold text-px-panel/50 animate-rise" ${at(250 + moved.length * 70)}>Giữ nguyên: ${still.join(' · ')}</p>` : ''}

      <div class="mt-5 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        ${card('trophy', 'sm-blue', 'Quyết định tốt nhất', r.best ? `${r.best.no} · ${r.best.choice}` : '—', r.best ? esc(r.best.label) : 'Chưa có quyết định', 0)}
        ${card('academicCap', 'sm-green', 'Năng lực nổi bật', r.topCompetency ? `${r.topCompetency.score}<span class="text-base text-px-panel/45">/100</span>` : '—', r.topCompetency ? esc(r.topCompetency.label) : '', 1)}
        ${card(dz ? 'exclamationTriangle' : 'checkCircle', dz ? 'sm-warn' : 'sm-green', 'Rủi ro tích lũy', dz, dz ? esc(r.dangers[0].text) + (dz > 1 ? ` <b>+${dz - 1}</b>` : '') : 'Chưa có quyết định nào để lại rủi ro.', 2)}
      </div>

      <p class="sm-h animate-rise" ${at(1050)}>Hành trình quyết định</p>
      <ol class="sm-line animate-rise" ${at(1100)} aria-label="Các quyết định">
        ${r.decisions.map(d => `<li class="sm-node group" tabindex="0">
          <span class="gm-tag ${tone(d)} grid size-9 place-items-center pb-0.5 text-base leading-none font-extrabold">${d.choice}</span>
          <span class="mt-1 text-xs font-bold text-px-panel/60">${d.no}</span>
          <span class="sm-tip px-bubble" role="tooltip"><b>${d.no} · ${esc(d.title)}</b><br>${esc(d.label)}</span>
        </li>`).join('')}
      </ol>
      <button id="sumNext" class="px-btn px-btn-primary animate-rise mt-6 w-auto px-8 max-sm:w-full" ${at(1250)}>Tiếp tục${icon('arrowRight', 'size-6', { stroke: 2.25 })}</button>`;
    $('sumTiles').querySelectorAll('li').forEach(li => drawIcon(li.querySelector('canvas'), li.dataset.icon, 26));
    $('sum').hidden = false;
    $('sumNext').focus({ preventScroll: true });
    return new Promise(res => { $('sumNext').onclick = () => { $('sum').hidden = true; res(); }; });
  }
  // Level 2 chua dung -> the ket thuc tam: choi lai Level 1 hoac ve menu
  async function endCard() {
    const r = summarize(run, LEVEL1, 'P1');
    $('cardBody').innerHTML = `
      <p class="font-pixel text-[1.5rem] leading-none tracking-[0.25em] text-px-hi">HẾT PHẦN ĐÃ DỰNG</p>
      <h1 class="px-title mt-5 text-[clamp(2.8rem,8vw,4.8rem)]">LEVEL ${LEVEL1.no} HOÀN THÀNH</h1>
      ${tierBadge(r.tier.mood, 'mt-6 size-[132px]', 'text-[3.6rem] text-white')}
      <p class="gm-tag ${MOOD[r.tier.mood]} mt-3 inline-block px-3 pt-1.5 pb-2 text-lg leading-none font-extrabold whitespace-nowrap uppercase max-sm:px-2 max-sm:text-sm">${esc(r.tier.label)}</p>
      <p class="mt-5 text-[1.1rem] leading-relaxed font-medium text-white/90">Level 2 · Hòa nhập sẽ được xây ở bước tiếp theo.</p>
      <div class="mt-8 flex w-full flex-wrap justify-center gap-6 max-sm:flex-col">
        <button id="againBtn" class="px-btn px-btn-primary w-auto px-7">${icon('arrowPath', 'size-6', { stroke: 2.25 })}Chơi lại Level ${LEVEL1.no}</button>
        <button id="homeBtn" class="px-btn px-btn-blue w-auto px-7">Về menu</button>
      </div>`;
    $('card').hidden = false;
    $('againBtn').focus({ preventScroll: true });
    $('homeBtn').onclick = () => onMenu();
    await new Promise(r => { $('againBtn').onclick = r; });
    $('card').hidden = true;
  }

  // Choi tiep tu cho dang do: chua chon gi -> tu dau (the Level + mo dau); da chon mot phan -> tinh huong chua xong ke tiep
  async function playLevel() {
    if (!LEVEL1.scenarios.some(s => run?.choices[s.id])) {
      run = newRun(); renderHud();
      await levelCard();
      $('fade').classList.remove('opacity-0');                          // man den cho toi khi nen nap xong
      await playIntro();
    } else renderHud();
    for (const s of LEVEL1.scenarios) {
      if (!alive) return;
      if (!run.choices[s.id]) await playScenario(s);
    }
    if (!run.summaryDone) await playSummary();
    else { await setBg(LEVEL1.summary.bg); setCast(LEVEL1.summary.cast); }
  }
  async function play() {
    await playLevel();
    while (alive) {
      await endCard();
      run = null; session.game = null; saveSession(); pm.x = -0.15;
      await playLevel();
    }
  }

  // ---------- gan su kien ----------
  $('lv').addEventListener('click', onClick);
  $('dlgNext').onclick = () => advance();            // dang go chu -> hien het; da het -> sang cau
  $('pmHit').onclick = () => staffCard('PM', $('pmHit'));
  $('menuBtn').onclick = () => onMenu();
  $('tourBtn').onclick = () => tour();
  const onResize = () => { layout(); drawHudIcons(); };
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
      const focus = !$('result').hidden;
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
