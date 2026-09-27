// "Dao dien" man choi: chay kich ban (cac level noi tiep) bang async/await va dieu khien san khau canvas (PM, NPC).
// Khong ve giao dien: doi `state` (dang useSyncExternalStore) de cac component React ve lai, roi cho component bao lai
// (answer / advance). Trang thai phien ke thua qua cac level; luu phien sau moi lua chon va dau / cuoi moi level.
// Kich ban: docs/KICH_BAN_ROLECRAFT_PM60.md; noi dung level: level1..4.js; luat cong/tru: rules.js.
import { session, saveSession } from '../session.js';
import { METRIC, newRun, beginLevel, applyChoice, enterScenario, dueNotes, fmt } from '../rules.js';
import { LEVEL1, CAST } from '../level1.js';
import { LEVEL2 } from '../level2.js';
import { LEVEL3 } from '../level3.js';
import { LEVEL4 } from '../level4.js';
import { campaignReport, reportText } from '../campaign.js';
import { summarize } from '../summary.js';
import { Actor, drawStage, drawActor } from '../stage.js';
import ATLAS from '../atlas.js';
import { npcAtlas, npcImg, npcReady } from '../npc.js';
import { asset, portal } from '../../shared/ui.js';

export const LEVELS = [LEVEL1, LEVEL2, LEVEL3, LEVEL4];                  // choi lan luot; level sau ke thua trang thai level truoc
export const BG = name => ({ pc: asset(`bg/${name}_pc.webp`), mobile: asset(`bg/${name}_mobile.webp`) });
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
const LATER_TITLE = 'Hậu quả từ quyết định trước';                          // dong SYS bao hau qua tri hoan vua kich hoat
const MISSING = 'Thiếu nhân sự chủ chốt';
// PM kiet suc (co `tired` cua level, vd pm_overloaded tu Level 2): dong tac thuong -> ban met (HUONG_DAN_KICH_BAN.md muc 7)
const TIRED = { idle: 'tired_idle', talk: 'tired_talk', walk: 'tired_walk' };
// Diem luu dau level (tu level 2): ban sao trang thai truoc lua chon dau tien, de "Choi lai Level N"
const snapshot = r => { const { checkpoints, ...rest } = r; return JSON.parse(JSON.stringify(rest)); };

// hooks: { onMenu, onChoice, onLevelComplete, onFinish } – su kien ra web chu (goi API...), xem GameApp.jsx
export class Director {
  constructor(hooks) {
    this.hooks = hooks;
    this.name = session.playerName || 'Bạn';
    this.pm = new Actor(-0.15);
    this.view = { foot: 0, ch: 0, night: 0, emo: null, reach: 0, home: false };   // home = PM dang dung o cho tro chuyen
    this.npcs = {};                                   // id -> { slot, el?, cv?, atlas?, actor? }
    this.refs = {};                                   // phan tu DOM component gan vao (lv, hud, dlgPanel, result, focus, npcs, pmHit, stage)
    this.alive = true; this.timers = []; this.waiter = null; this.typing = null;
    this.pmBaseX = null; this.lastNow = 0; this.tall = false; this.baseAlias = null;
    this.fxId = 0;
    // Phien dang do: level dang choi + trang thai. Ban luu cu (chi Level 1: summaryDone) -> levelsDone
    this.level = LEVELS.find(l => l.id === session.game?.level) || null;
    this.run = this.level ? session.game.run : null;
    this.level ||= LEVELS[0];
    if (this.run) {
      this.run.outcomes ||= {};
      this.run.levelsDone ||= this.run.summaryDone ? [LEVEL1.id] : [];
      delete this.run.summaryDone;
    }
    // trang thai giao dien (bat bien: moi lan doi tao doi tuong moi)
    this.state = {
      bg: null, fade: false, busy: false,
      hud: { lv: '', day: 1, metrics: null }, fx: [],
      cast: [], castShown: false,
      dialog: null, choice: null, result: null, pages: null, card: null, tour: false, staff: null,
    };
    this.subs = new Set();
  }

  // ---------- store cho React ----------
  subscribe = f => { this.subs.add(f); return () => this.subs.delete(f); };
  getState = () => this.state;
  set(patch) { this.state = { ...this.state, ...patch }; this.subs.forEach(f => f()); }

  later(ms, f) { this.timers.push(setTimeout(f, ms)); }
  sleep(ms) { return new Promise(r => this.later(ms, r)); }
  stop() { this.alive = false; this.timers.forEach(clearTimeout); this.waiter = null; }

  // ---------- cho nguoi choi ----------
  // ms = tu qua sau ms (the Ngay). Hen gio chi dong dung luot cho cua no: nguoi choi da bam qua som thi hen gio
  // khong duoc "bam ho" dong thoai dang cho sau do.
  wait(kind, ms) {
    return new Promise(res => {
      const w = { kind, res: v => { if (this.waiter === w) this.waiter = null; res(v); } };
      this.waiter = w;
      if (ms) this.later(ms, () => this.waiter === w && w.res());
    });
  }
  // component tra loi cho luot dang cho (vd 'choice' -> lua chon, 'card' -> nut the ket thuc)
  answer(kind, value) { if (this.waiter?.kind === kind) this.waiter.res(value); }
  // cham / Enter: dang go chu -> hien het; da het -> sang cau / qua the
  advance() {
    if (this.typing?.busy()) { this.typing.finish(); return; }
    if (this.waiter && ['line', 'tap'].includes(this.waiter.kind)) this.waiter.res();
  }

  // ---------- bo cuc: chan nhan vat ngay tren hop thoai ----------
  // San khau luon dung tren san: chan ngay tren mep hop thoai; bang ket qua doi cho (ngang: bam phai, doc: len tren)
  stageFoot() {
    const { dlgPanel, hud } = this.refs;
    if (!dlgPanel || !hud) return 0.8 * innerHeight;
    const top = dlgPanel.getBoundingClientRect().top, hb = hud.getBoundingClientRect().bottom;
    return Math.max(hb + 80, Math.min(0.84 * innerHeight, top - 6));   // khong de nhan vat chui len HUD
  }
  spanUnits() {
    const n = Object.keys(this.npcs).length;
    return n ? Math.max(TALK, this.view.reach + PROP_GAP) + SIDE * (n - 1) : 0;
  }
  // vi tri (ti le be ngang) cua PM va tung NPC theo so nguoi trong canh; chua co NPC thi PM dung giua
  stagePos() {
    const W = innerWidth, n = Object.keys(this.npcs).length, ch = this.view.ch;
    const talk = Math.max(TALK, this.view.reach + PROP_GAP) * ch, side = SIDE * ch;
    // chua le 2 ben ~ nua than nhan vat (0.45 ch) de nguoi dung sat mep khong bi cat
    const span = n ? talk + side * (n - 1) : 0, k = Math.min(1, Math.min(W * 0.84, W - 0.9 * ch) / (span || 1));
    const left = (W - span * k) / 2;
    return { pm: left / W, npc: Array.from({ length: n }, (_, i) => (left + (talk + side * i) * k) / W) };
  }
  placeStage() {
    const W = innerWidth, H = innerHeight, hb = this.refs.hud?.getBoundingClientRect().bottom || 0, v = this.view;
    v.ch = Math.max(60, Math.min((this.tall ? 0.2 : H <= 560 ? 0.34 : 0.27) * H, (v.foot - hb) * 0.8));
    // cum nhan vat khong vua be ngang (man doc, nhieu NPC + dao cu): nen khoang cach toi 85% roi thu nho nhan vat
    const units = this.spanUnits();
    if (units) v.ch = Math.max(60, Math.min(v.ch, W * 0.84 / (units * 0.85)));
    const S = this.stagePos(), gap = S.npc.length > 1 ? (S.npc[1] - S.npc[0]) * W : W;   // khoang cach 2 the canh nhau
    Object.values(this.npcs).forEach(n => this.placeNpc(n, S.npc[n.slot], gap));
    if (v.home && !this.pm.walk && this.pmBaseX == null) this.pm.x = S.pm;   // doi kich thuoc man: PM giu dung cho
  }
  placeNpc(n, x, gap) {
    if (!n.el) return;
    const v = this.view;
    if (n.actor) {
      // vung bam ~ than nguoi (0.55 x 1 chieu cao dung); canvas = khung lon nhat cua cac dong tac, goc chan giua day nut
      const bw = v.ch * 0.55, bh = v.ch, cw = 2 * n.atlas.half * v.ch, chh = n.atlas.tall * v.ch;
      Object.assign(n.el.style, { left: `${x * innerWidth - bw / 2}px`, top: `${v.foot - bh}px`, width: `${bw}px`, height: `${bh}px` });
      Object.assign(n.cv.style, { left: `${(bw - cw) / 2}px`, top: `${bh - chh}px`, width: `${cw}px`, height: `${chh}px` });
      n.w = cw; n.h = chh;
      return;
    }
    // the ti le 237x314 (the .gm-plate); canh dong nguoi thi hep lai, chua khe
    const w = Math.min(Math.max(58, v.ch * 0.5), gap - 12), h = w * 314 / 237;
    Object.assign(n.el.style, { left: `${x * innerWidth - w / 2}px`, top: `${v.foot - h}px`, width: `${w}px`, height: `${h}px` });
    const sv = n.el.querySelector('svg'); if (sv) sv.style.width = sv.style.height = `${w * 0.5}px`;
    const nm = n.el.querySelector('[data-nm]'); if (nm) nm.style.fontSize = `${Math.max(12, w * 0.17)}px`;
  }
  layout() {
    this.tall = innerHeight > innerWidth;
    const { lv, hud } = this.refs;
    if (lv && hud) lv.style.setProperty('--hudb', `${hud.getBoundingClientRect().bottom}px`);   // mep duoi HUD cho #result
    this.view.foot = this.stageFoot();                          // doi kich thuoc man hinh: dat thang, khong noi suy
    this.placeStage();
  }
  // component NPC gan / go phan tu (ref callback)
  bindNpc(id, el) {
    const n = this.npcs[id]; if (!n) return;
    n.el = el; n.cv = el?.querySelector('canvas') || null;
    if (el) this.layout();
  }
  async pmHome(ms = 1700) { await this.pm.walkTo(this.stagePos().pm, ms); this.view.home = true; }
  pmOff(x = -0.15) { this.view.home = false; this.pm.x = x; }

  // Cac level tu dau toi level dang choi (co `tired` / `absent` cua level truoc van con hieu luc)
  levelsSoFar() { return LEVELS.slice(0, LEVELS.indexOf(this.level) + 1); }
  // NPC vang mat tu level co `absent` khi co co (vd Huy nghi viec: Level 3 tro di khong con trong canh)
  isAbsent = id => !!this.run && this.levelsSoFar().some(l => l.absent?.[id] && this.run.flags[l.absent[id]]);
  // Thanh vien team theo lich su phien choi (Huy nghi o S07, thue Freelancer o S05, them nguoi o S12)
  teamFact() {
    const f = this.run?.flags || {};
    return [
      f.key_developer_left ? (this.isAbsent('HUY') ? 'Huy (đã nghỉ)' : 'Huy (đang bàn giao)') : 'Huy (Backend)', 'Nam (Frontend)', 'Lan (BA/QA)',
      ...(f.freelancer_hired ? ['Freelancer (dự án B)'] : []),
      ...(f.large_project_resourced ? ['1 nhân sự mới (dự án lớn)'] : []),
    ].join(' · ');
  }

  // ---------- NPC ----------
  // NPC co sprite: nut = vung bam quanh than, canvas rieng ve nhan vat. Sprite ve huong phai -> lat de nhin sang PM.
  // poses = cac dong tac PM se dung trong canh (tinh khoang cach cho dao cu). keep = giu NPC dang dung, them nguoi moi
  setCast(ids, poses = [], keep = false) {
    ids = ids.filter(id => !this.isAbsent(id));
    if (!keep) { this.npcs = {}; this.set({ staff: null }); }
    this.view.reach = Math.max(0, ...poses.map(pmReach));
    ids.forEach((id, slot) => {
      if (this.npcs[id]) { this.npcs[id].slot = slot; return; }
      const atlas = npcAtlas(id), n = { slot };
      if (atlas) { n.atlas = atlas; n.actor = Object.assign(new Actor(0, atlas), { flip: true }); npcImg(id); }
      this.npcs[id] = n;
    });
    this.set({ cast: Object.keys(this.npcs), castShown: false });
    this.layout();
    requestAnimationFrame(() => requestAnimationFrame(() => this.alive && this.set({ castShown: true })));
  }
  hideCast() { this.set({ castShown: false }); }
  // Nguoi dang noi: the tam nhac len + quang cyan. NPC sprite: dang noi -> talk (hoac dong tac rieng: act),
  // PM noi -> nghe, con lai dung yen; react = dong tac rieng cua NPC khong noi ({ NAM: 'apologize' })
  talking(id, act, react = {}) {
    Object.entries(this.npcs).forEach(([k, n]) => {
      n.el?.toggleAttribute('data-talk', k === id); n.el?.toggleAttribute('data-sel', k === id);
      n.actor?.play(react[k] || (k === id ? act || 'talk' : id === 'PM' ? 'listen' : 'idle'));
    });
  }

  // ---------- HUD ----------
  renderHud() { this.set({ hud: { lv: `LV${this.level.no} · ${this.level.title}`, day: this.run.day, metrics: { ...this.run.metrics } } }); }
  // Chi so doi: moi chi so nhay mau + so chay dan + the +/- (HudStat), lan luot cach nhau 350ms
  animateHud(changes) {
    if (!changes.length) return;
    const t = performance.now();
    this.set({
      hud: { ...this.state.hud, metrics: { ...this.run.metrics } },
      fx: [...this.state.fx.filter(f => t - f.at < 4000), ...changes.map((c, i) => ({ ...c, id: ++this.fxId, at: t + i * 350 }))],
    });
  }

  // ---------- nen, chuyen canh ----------
  // doi nen: nap anh dung huong man hinh truoc (toi da 4 giay) roi moi doi
  setBg(name) {
    const url = BG(name)[innerHeight > innerWidth ? 'mobile' : 'pc'];
    return new Promise(r => {
      const im = new Image(), done = () => { this.set({ bg: name }); r(); };
      im.onload = im.onerror = done; this.later(4000, done); im.src = url;
    });
  }
  preload(lv) {
    [lv.prelude?.bg, lv.intro?.bg, ...lv.scenarios.map(s => s.bg), (lv.summary || lv.ending).bg].filter(Boolean)
      .forEach(b => { new Image().src = BG(b)[innerHeight > innerWidth ? 'mobile' : 'pc']; });
  }
  // chuyen canh: toi -> doi canh -> sang; suot luc do aria-busy (con tro dong ho cat)
  async fade(on) {
    this.set({ fade: on, busy: true });
    await this.sleep(500);
    if (!on) this.set({ busy: false });
  }

  // ---------- hop thoai ----------
  // Dong thoai theo lich su phien choi: nhan vat vang mat -> cau `alt` (cau cua chinh nguoi do thanh thong bao thieu
  // nhan su); textFor(run, bao cao) -> cau tra loi theo hanh trinh that (null = giu cau mau)
  prepLine(l) {
    const gone = Object.keys(l.alt || {}).find(this.isAbsent) || (CAST[l.who] && this.isAbsent(l.who) ? l.who : null);
    if (gone) {
      const text = l.alt?.[gone] || `${CAST[gone].name} đã nghỉ việc, không còn tham gia trao đổi này.`;
      return l.who === gone ? { ...l, who: 'SYS', title: MISSING, text, npc: null, npcFace: null } : { ...l, text };
    }
    const t = l.textFor?.(this.run, campaignReport(this.run, this.levelsSoFar()));
    return t ? { ...l, text: t } : l;
  }
  async say(line) {
    line = this.prepLine(line);
    if (!this.pm.walk) this.pm.play(line.pm || (line.who === 'PM' ? 'talk' : 'idle'));   // dang di: giu dong tac di
    this.set({ dialog: { ...line, key: (this.state.dialog?.key || 0) + 1 } });
    this.talking(line.who, line.npc, line.react);
    await this.wait('line');
  }
  hideDialog() { this.set({ dialog: null }); this.typing = null; this.talking(null); }
  async sayLines(lines) { for (const l of lines) { if (!this.alive) return; await this.say(l); } }
  // Hau qua tri hoan vua kich hoat: dong thong bao he thong (HUD dang cong/tru cung luc)
  async sayLater(notes, pose) {
    for (const text of notes) { if (!this.alive) return; await this.say({ who: 'SYS', title: LATER_TITLE, text, pm: pose }); }
  }
  // Dong thoai hien theo co / dieu kien: ifFlag = chi khi co co, unlessFlag = an khi co co, when(run) = dieu kien
  shown(lines) {
    const r = this.run;
    return lines.filter(l => (!l.ifFlag || r.flags[l.ifFlag]) && !(l.unlessFlag && r.flags[l.unlessFlag]) && (!l.when || l.when(r)));
  }

  // ---------- the chuyen canh / lua chon / ket qua / tong ket ----------
  async card(kind, data, ms) {
    this.set({ card: { kind, ...data } });
    const v = await this.wait(kind === 'end' || kind === 'final' ? 'act' : 'tap', ms);
    this.set({ card: null });
    return v;
  }
  async ask(s) {
    this.hideDialog();
    this.set({ choice: s });
    const c = await this.wait('choice');
    this.set({ choice: null });
    return c;
  }
  async showResult(s, c, changes, o) {
    this.set({ result: { s, c, changes, o } });
    await this.wait('result');
    this.set({ result: null });
  }
  // modal nhieu trang: kind 'summary' (tong ket level, 2 trang) | 'report' (bao cao cuoi, 3 trang)
  async pages(kind, data, count) {
    for (let page = 0; page < count && this.alive; page++) {
      this.set({ pages: { kind, data, page } });
      await this.wait('page');
    }
    this.set({ pages: null });
  }
  tour() {
    this.set({ tour: true });
    return this.wait('tour').then(() => this.set({ tour: false }));
  }
  openStaff(id, anchor) {
    const same = this.state.staff?.anchor === anchor;
    this.set({ staff: same ? null : { id, anchor } });
  }

  // Chuyen dan sang canh dem (phu toi + den ban quanh PM); hideCast = ca team da ve
  async toNight(hideCast) {
    if (hideCast) this.hideCast();
    const t0 = performance.now();
    await new Promise(r => {
      const f = now => { this.view.night = Math.min(1, (now - t0) / 900); this.view.night < 1 && this.alive ? requestAnimationFrame(f) : r(); };
      requestAnimationFrame(f);
    });
  }
  // Dan canh sau lua chon: dong tac PM, do vat, canh dem
  async stageAfter(a) {
    if (!a) return;
    if (a.night) await this.toNight(true);
    this.pm.play(a.pm, a.then);                                  // dong tac mot lan (vd jump) xong thi noi ngay sang then
    if (a.then) { await this.sleep(1600); this.pm.play(a.then); }  // dong tac lap (vd go may dem): doi roi chuyen
    if (a.emo) this.view.emo = a.emo;
    await this.sleep(900);
  }
  // Canh ket sau bang ket qua (lua chon hoac tinh huong): { lines, pm, night, hideCast }
  async playOutro(o) {
    if (o.hideCast) this.hideCast();
    if (o.night) await this.toNight(false);
    if (o.pm) { this.pm.play(o.pm); await this.sleep(700); }
    await this.sayLines(o.lines);
    this.hideDialog();
  }

  // ---------- kich ban ----------
  // Canh chuyen truoc mo dau level khi co co (vd pm_overloaded: ngu guc tren ban luc dem). Man dang den khi goi.
  async playPrelude(p) {
    await this.setBg(p.bg); this.setCast([]);
    Object.assign(this.view, { night: p.night ? 1 : 0, emo: null });
    this.pm.x = this.stagePos().pm; this.view.home = true; this.pm.play(p.pm);
    await this.fade(false);
    await this.sleep(600);
    await this.sayLines(p.lines);
    this.hideDialog();
    await this.fade(true);
    this.view.night = 0;
  }
  async playIntro() {
    const it = this.level.intro;
    await this.setBg(it.bg); this.setCast(it.cast, it.lines.map(l => l.pm));
    this.pmOff(); await this.fade(false);
    if (!session.hudTourDone) { await this.tour(); session.hudTourDone = true; saveSession(); }
    await this.pmHome();
    await this.sayLines(it.lines);
    this.hideDialog();
    this.view.home = false; await this.pm.walkTo(1.15, 1900);   // PM di tiep vao khu lam viec
  }
  async playScenario(s) {
    const { pm, run, level, view } = this;
    await this.fade(true);
    Object.assign(view, { night: 0, emo: null });
    await this.setBg(s.bg); this.setCast(s.cast, scenePoses(s));
    pm.alias = s.alias ? { ...this.baseAlias, ...s.alias } : this.baseAlias;   // vd S16: bo vest
    const from = run.day;
    // hop ban: PM ngoi san (s.enter), khong di vao
    if (s.enter) { pm.x = this.stagePos().pm; view.home = true; pm.play(s.enter); } else { this.pmOff(); pm.play('idle'); }
    const notes = dueNotes(run, s.id), due = enterScenario(run, s); this.renderHud();
    await this.fade(false);
    // The ngay: dem tu ngay truoc toi ngay moi – cac ngay khong co tinh huong luot qua nhu timeline
    await this.card('day', { s, from }, 2600 + Math.min(900, (s.day - from) * 110));
    if (!s.enter) await this.pmHome();
    // mo canh: bien the do hau qua tri hoan dat (run.variants), dong thoai theo co; laterAt dong dau noi truoc loi bao hau qua
    const open = this.shown(s.variants?.[run.variants[s.id]] || s.open), k = s.laterAt || 0;
    await this.sayLines(open.slice(0, k));
    if (due.length) this.animateHud(due);
    await this.sayLater(notes, s.enter || open[k - 1]?.pm);
    await this.sayLines(open.slice(k));
    if (!this.alive) return;
    const c = await this.ask(s);
    if (c.join) this.setCast([...s.cast, ...c.join], scenePoses(s), true);   // nguoi buoc vao canh truoc thoai nhanh
    const later = dueNotes(run, s.id, c.id), changes = applyChoice(run, s, c);
    const o = c.outcomes?.find(x => x.id === run.outcomes[s.id]) || null;
    session.game = { level: level.id, run }; saveSession();
    this.hooks.onChoice?.({
      level: level.no, levelId: level.id, scenario: s.id, no: s.no, title: s.title, day: s.day,
      choice: c.id, label: c.label, outcome: o?.id || null, changes, metrics: { ...run.metrics }, flags: { ...run.flags },
    });
    await this.sayLines([...c.lines, ...(o?.lines || [])]);
    this.hideDialog();
    await this.stageAfter(o?.after || c.after);
    this.animateHud(changes);
    await this.sayLater(later, (o?.after || c.after)?.pm);
    this.hideDialog();
    await this.showResult(s, c, changes, o);
    for (const out of [c.outro, o?.outro, s.outro].filter(Boolean)) await this.playOutro(out);
    pm.alias = this.baseAlias;
  }
  // Tong ket level: Anh Minh; bang bao cao -> nhan xet theo xep loai
  async playSummary() {
    const { level, run } = this, sm = level.summary, r = summarize(run, level, level.phase);
    await this.fade(true);
    Object.assign(this.view, { night: 0, emo: null });
    await this.setBg(sm.bg); this.setCast(sm.cast, Object.values(sm.comments || {}).flat().map(l => l.pm)); this.pmOff(); this.pm.play('idle');
    await this.fade(false);
    await this.pmHome();
    await this.pages('summary', { r, level }, 2);
    await this.sayLines(sm.comments?.[r.tier.mood] || []);         // Level 3: khong co nhan xet
    this.hideDialog();
    run.levelsDone.push(level.id); session.game = { level: level.id, run }; saveSession();
    this.hooks.onLevelComplete?.({ level: level.no, levelId: level.id, tier: r.tier, summary: r, metrics: { ...run.metrics } });
  }
  // Cong bo ket qua (the) -> thoai ket thuc voi Anh Minh + Chi Ha (FAIL: om thung do ra cua) -> bao cao cuoi 3 trang
  async playEnding() {
    const { level, run, pm } = this, en = level.ending, rep = campaignReport(run, LEVELS), res = rep.result, lines = en.lines[res.code];
    await this.fade(true);
    Object.assign(this.view, { night: 0, emo: null });
    await this.setBg(en.bg); this.setCast(en.cast, lines.map(l => l.pm)); pm.alias = this.baseAlias; this.pmOff(); pm.play('idle');
    await this.fade(false);
    await this.card('ending', { res });
    await this.pmHome();
    for (const l of lines) {
      if (!this.alive) return;
      if (l.exit) {                                             // roi canh: di ra cua trai bang dong tac rieng (om thung do)
        pm.alias = { ...this.baseAlias, walk: l.exit }; this.view.home = false;
        const out = pm.walkTo(-0.3, 3400);
        await this.say(l); await out;
      } else await this.say(l);
    }
    this.hideDialog();
    pm.alias = this.baseAlias;
    run.result = res.code; run.levelsDone.push(level.id); session.game = { level: level.id, run }; saveSession();
    this.hooks.onLevelComplete?.({ level: level.no, levelId: level.id, tier: null, summary: null, metrics: { ...run.metrics } });
    this.hooks.onFinish?.({ player: this.name, ...rep, text: reportText(rep, this.name, fmt, k => METRIC[k].label) });
    await this.pages('report', { rep, name: this.name }, 3);
  }
  // Het cac level da dung -> the ket thuc tam / the cuoi 60 ngay. Tra ve 'level' | 'all'
  async endCard() {
    const { level, run } = this;
    if (level.final) return this.finalCard();
    const r = summarize(run, level, level.phase), again = LEVELS.indexOf(level) > 0;
    const act = await this.card('end', { level, r, again });
    if (act === 'menu') { this.hooks.onMenu(); return new Promise(() => {}); }   // man bi go khi doi man: khong tra ve
    return act;
  }
  // The cuoi sau 60 ngay: xem lai bao cao, tai bao cao, choi lai Level cuoi / tu dau, ve menu
  async finalCard() {
    for (;;) {
      const res = campaignReport(this.run, LEVELS).result;
      const act = await this.card('final', { level: this.level, res, name: this.name });
      if (act === 'menu') { this.hooks.onMenu(); return new Promise(() => {}); }
      if (act === 'download') { this.downloadReport(); continue; }
      if (act === 'report') { await this.pages('report', { rep: campaignReport(this.run, LEVELS), name: this.name }, 3); continue; }
      return act;
    }
  }
  // Tai bao cao dang chu (.txt)
  downloadReport() {
    const txt = reportText(campaignReport(this.run, LEVELS), this.name, fmt, k => METRIC[k].label);
    const slug = this.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').replace(/\s+/g, '-').toLowerCase();
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' })), download: `bao-cao-thu-viec-${slug}.txt`,
    });
    portal().append(a); a.click(); a.remove();
    this.later(1000, () => URL.revokeObjectURL(a.href));
  }

  // Bat dau level: level dau = phien moi; level sau ke thua trang thai, ghi chi so dau level va luu phien
  startLevel() {
    if (this.level === LEVELS[0] || !this.run) { this.level = LEVELS[0]; this.run = newRun(); return; }
    beginLevel(this.run, this.level);
    this.run.checkpoints = { ...this.run.checkpoints, [this.level.id]: snapshot(this.run) };
    session.game = { level: this.level.id, run: this.run }; saveSession();
  }
  // Choi tiep tu cho dang do: chua chon gi -> tu dau level; da chon mot phan -> tinh huong chua xong ke tiep
  async playLevel() {
    const { level } = this, fresh = !level.scenarios.some(s => this.run?.choices[s.id]);
    if (fresh) this.startLevel();
    this.renderHud(); this.preload(this.level);
    // PM kiet suc tu level co co `tired` tro di (vd pm_overloaded -> Level 2 tro di dung bo tired_*)
    this.baseAlias = this.levelsSoFar().some(l => l.tired && this.run.flags[l.tired]) ? TIRED : null;
    this.pm.alias = this.baseAlias;
    if (fresh) {
      await this.card('level', { level: this.level });
      this.set({ fade: true });                                   // man den cho toi khi nen nap xong
      if (level.prelude && this.run.flags[level.prelude.ifFlag]) await this.playPrelude(level.prelude);
      if (level.intro) await this.playIntro();                    // Level 3: khong co mo dau, vao thang tinh huong
    }
    for (const s of level.scenarios) {
      if (!this.alive) return;
      if (!this.run.choices[s.id]) await this.playScenario(s);
    }
    if (!this.alive) return;
    const done = this.run.levelsDone.includes(level.id), end = level.summary || level.ending;
    if (!done) await (level.final ? this.playEnding() : this.playSummary());   // level cuoi: ket qua campaign
    else { await this.setBg(end.bg); this.setCast(end.cast); }
  }
  async play() {
    while (this.alive) {
      for (let i = LEVELS.indexOf(this.level); i < LEVELS.length && this.alive; i++) { this.level = LEVELS[i]; await this.playLevel(); }
      if (!this.alive) return;
      const again = await this.endCard();
      const cp = again === 'level' && this.run.checkpoints?.[this.level.id];
      if (cp) this.run = { ...JSON.parse(JSON.stringify(cp)), checkpoints: this.run.checkpoints };
      else { this.level = LEVELS[0]; this.run = null; }
      session.game = this.run && { level: this.level.id, run: this.run }; saveSession(); this.pmOff();
    }
  }

  // ---------- moi khung hinh ----------
  frame(now) {
    const { refs, view, pm } = this;
    if (!refs.stage) return;
    // san khau truot toi mep bang dang mo (ease-out theo thoi gian, ~250ms)
    const goal = this.stageFoot(), dt = Math.min(64, now - (this.lastNow || now)); this.lastNow = now;
    if (Math.abs(goal - view.foot) > 0.5) { view.foot += (goal - view.foot) * (1 - Math.exp(-dt / 90)); this.placeStage(); }
    else if (goal !== view.foot) { view.foot = goal; this.placeStage(); }
    drawStage(refs.stage, pm, view, now);
    this.drawNpcs(now);
    const focus = !!this.state.result;
    // canh dem (vd team OT): NPC o lop rieng -> toi theo cung muc (bang ket qua mo thi de lop focus lo)
    const nf = view.night > 0 && !focus ? `brightness(${(1 - 0.5 * view.night).toFixed(2)}) saturate(.8)` : '';
    if (refs.npcs && refs.npcs.style.filter !== nf) refs.npcs.style.filter = nf;
    if (refs.lv && refs.lv.hasAttribute('data-focus') !== focus) {
      refs.lv.toggleAttribute('data-focus', focus);
      if (focus) this.pmBaseX = pm.x;                                   // nho vi tri PM de tra lai khi dong bang
      else { if (this.pmBaseX != null) pm.x = this.pmBaseX; this.pmBaseX = null; if (refs.result) refs.result.style.left = ''; }
    }
    // Man ngang: PM (kem ban, ~1.75 chieu cao nhan vat) + bang ket qua can giua thanh mot cum; PM truot em toi cho
    if (focus && !this.tall && this.pmBaseX != null && !pm.walk && refs.result) {
      const W = innerWidth, P = refs.result.offsetWidth, Z = view.ch * 1.75, gap = 48;
      const left = Math.max(12, (W - (Z + gap + P)) / 2), g = (left + Z * 0.27) / W;
      pm.x += (g - pm.x) * (1 - Math.exp(-dt / 140));
      refs.result.style.left = `${Math.min(W - P, left + Z + gap)}px`;
    }
    if (focus && refs.focus) {
      const f = refs.focus.style;
      f.setProperty('--fx', `${pm.x * innerWidth}px`); f.setProperty('--fy', `${view.foot - view.ch * 0.45}px`);
      f.setProperty('--rx', `${view.ch * 1.9}px`); f.setProperty('--ry', `${view.ch * 1.35}px`);
    }
    // vung bam PM bam theo sprite: rong ~0.45 chieu cao nhan vat, day = chan
    if (refs.pmHit) {
      const w = view.ch * 0.45;
      Object.assign(refs.pmHit.style, { left: `${pm.x * innerWidth - w / 2}px`, top: `${view.foot - view.ch}px`, width: `${w}px`, height: `${view.ch}px` });
    }
  }
  // Ve NPC sprite moi khung hinh (canvas rieng tung NPC, kich thuoc dat trong placeNpc)
  drawNpcs(now) {
    const dpr = devicePixelRatio || 1;
    for (const [id, n] of Object.entries(this.npcs)) {
      if (!n.actor || !n.w || !n.cv || !npcReady(id)) continue;
      const W = Math.round(n.w * dpr), H = Math.round(n.h * dpr);
      if (n.cv.width !== W || n.cv.height !== H) { n.cv.width = W; n.cv.height = H; }
      const ctx = n.cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, n.w, n.h);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      drawActor(ctx, n.actor, npcImg(id), this.view.ch / n.atlas.stand, n.w / 2, n.h, now);
    }
  }
}
