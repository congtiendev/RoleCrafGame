// Man tinh huong (gameplay): nen + san khau canvas (PM) + NPC, HUD, hop thoai, lua chon, bang ket qua, tong ket / bao cao,
// the chuyen canh. Kich ban chay trong Director (director.js); man nay chi ve theo state cua no va bao lai thao tac.
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { CAST } from '../level1.js';
import { npcAtlas } from '../npc.js';
import { modalOpen, activeEl } from '../../shared/ui.js';
import { Icon } from '../components/Icon.jsx';
import { useKey, useRaf, useViewport } from '../components/hooks.js';
import { BG, Director } from './director.js';
import { Hud } from './Hud.jsx';
import { Dialog } from './Dialog.jsx';
import { Choice } from './Choice.jsx';
import { Result } from './Result.jsx';
import { Pages } from './Pages.jsx';
import { Card } from './Cards.jsx';
import { HudTour } from './HudTour.jsx';
import { StaffCard } from './StaffCard.jsx';

// hooks: { onMenu, onChoice, onLevelComplete, onFinish }
export function PlayScreen({ hooks }) {
  const [d, setD] = useState(null);
  // Director tao trong effect (StrictMode chay effect 2 lan o dev: ban dau bi dung, ban sau choi)
  useEffect(() => {
    const dir = new Director({
      onMenu: () => hooks.current.onMenu?.(),
      onChoice: e => hooks.current.onChoice?.(e),
      onLevelComplete: e => hooks.current.onLevelComplete?.(e),
      onFinish: e => hooks.current.onFinish?.(e),
    });
    setD(dir);
    return () => dir.stop();
  }, [hooks]);
  return d ? <Play d={d} /> : null;
}

function Play({ d }) {
  const st = useSyncExternalStore(d.subscribe, d.getState);
  const vp = useViewport();
  // phan tu DOM director can do / dat truc tiep (ref callback on dinh: gan mot lan)
  const r = useMemo(() => Object.fromEntries(['lv', 'hud', 'dlgPanel', 'result', 'focus', 'npcs', 'pmHit', 'stage']
    .map(k => [k, el => { d.refs[k] = el; }])), [d]);

  useEffect(() => { d.layout(); d.play(); }, [d]);
  useEffect(() => { d.layout(); }, [d, vp]);
  useRaf(now => d.frame(now));

  // Chuot/cham: cham bat ky dau tren hop thoai (hoac nut goc) sang cau; the chuyen canh cham dau cung duoc
  const onClick = e => {
    if (e.target.closest('button')) return;
    if (e.target.closest('#card') || (e.target.closest('#dlg [data-tap]') && st.dialog)) d.advance();
  };
  useKey((e, t) => {
    if (modalOpen() || st.tour) return;                            // hop thoai modal / tour dang mo: phim thuoc ve no
    if ((e.key === 'Enter' || e.key === ' ') && !t.closest?.('button')) { e.preventDefault(); d.advance(); }
    if (!st.choice) return;
    const list = [...(d.refs.lv?.querySelectorAll('#chList button') || [])];
    if (/^[abc123]$/i.test(e.key)) list['abc123'.indexOf(e.key.toLowerCase()) % 3]?.click();
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const i = list.indexOf(activeEl()), step = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : list.length - 1;
      list[(i < 0 ? 0 : i + step) % list.length]?.focus();
    }
  });
  const closeStaff = useCallback(() => d.set({ staff: null }), [d]);
  const bg = st.bg && BG(st.bg);

  return (
    <section ref={r.lv} id="lv" aria-busy={st.busy ? 'true' : 'false'} onClick={onClick}
      className="relative h-dvh w-full overflow-hidden bg-black select-none">
      {bg && (
        <picture>
          <source media="(orientation: portrait)" srcSet={bg.mobile} />
          <img src={bg.pc} alt="" className="absolute inset-0 size-full object-cover" draggable="false" />
        </picture>
      )}
      <div className="absolute inset-0 bg-linear-to-b from-px-ink/55 via-transparent via-40% to-px-ink/45" />
      {/* lop toi mo khi bang ket qua mo: vung sang tron quanh PM (director.frame() dat --fx/--fy/--rx/--ry) */}
      <div ref={r.focus} className="stage-focus pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 in-data-[focus]:opacity-100" />
      <canvas ref={r.stage} className="pointer-events-none absolute inset-0 size-full" aria-hidden="true" />
      <div ref={r.npcs} id="npcs" className="pointer-events-none absolute inset-0 transition-[filter] duration-500 in-data-[focus]:brightness-[.35]">
        {st.cast.map(id => <Npc key={id} id={id} d={d} shown={st.castShown} />)}
      </div>
      {/* vung bam tren PM (ve bang canvas): bam -> the nhan vien cua nguoi choi; director.frame() dat theo vi tri PM */}
      <button ref={r.pmHit} type="button" className="absolute rounded-xl outline-none focus-visible:outline-[3px] focus-visible:outline-[#5ec8ff]"
        aria-label="Xem thẻ nhân viên của bạn" title="Thẻ nhân viên của bạn" onClick={e => d.openStaff('PM', e.currentTarget)} />

      <Hud hud={st.hud} fx={st.fx} hudRef={r.hud} onMenu={() => d.hooks.onMenu()} onTour={() => d.tour()} />
      <Dialog line={st.dialog} name={d.name} director={d} panelRef={r.dlgPanel} onNext={() => d.advance()} />
      {st.choice && <Choice s={st.choice} onPick={c => d.answer('choice', c)} />}
      {st.result && <Result data={st.result} boxRef={r.result} onNext={() => d.answer('result')} />}
      {st.pages && <Pages pages={st.pages} onNext={() => d.answer('page')} />}
      {st.card && <Card card={st.card} onAct={a => d.answer('act', a)} />}
      {st.tour && <HudTour root={d.refs.lv} onDone={() => d.answer('tour')} />}
      {st.staff && <StaffCard staff={st.staff} onClose={closeStaff}
        pm={{ name: d.name, team: d.teamFact(), day: d.run?.day ?? 1 }} />}
      <div className={`pointer-events-none absolute inset-0 z-40 bg-black transition-opacity duration-500 ${st.fade ? '' : 'opacity-0'}`} />
    </section>
  );
}

// NPC: co sprite -> nut vung bam quanh than + canvas rieng ve nhan vat (tran ra ngoai nut); chua co -> the nhan vat tam.
// Vi tri / kich thuoc dat thang vao DOM moi khung hinh (director.placeNpc); data-talk / data-sel do director.talking().
function Npc({ id, d, shown }) {
  const c = CAST[id], atlas = npcAtlas(id);
  const bind = useCallback(el => d.bindNpc(id, el), [d, id]);
  return (
    <button ref={bind} type="button" className={`${atlas ? 'npc-sprite' : 'gm-plate'} px-standee pointer-events-auto ${shown ? '' : 'opacity-0'}`}
      style={{ '--tint': c.tint }} title={`${c.name} – ${c.role}`} aria-label={`Xem thẻ ${c.client ? 'khách hàng' : 'nhân viên'}: ${c.name}`}
      onClick={e => d.openStaff(id, e.currentTarget)}>
      {atlas ? <canvas aria-hidden="true" /> : (
        <span data-in="">
          <span data-av="" className="grid w-full flex-1 place-items-center" style={{ background: c.tint }}>
            <Icon name="user" className="text-white/90" stroke={2} />
          </span>
          <span data-nm="" className="w-full truncate pt-1 text-center leading-none font-extrabold text-white">{c.name.split(' ').at(-1).toUpperCase()}</span>
        </span>
      )}
    </button>
  );
}

