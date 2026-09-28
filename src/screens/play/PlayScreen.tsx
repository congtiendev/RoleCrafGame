// Man tinh huong (gameplay): nen + san khau canvas (PM) + NPC, HUD, hop thoai, lua chon, bang ket qua, tong ket / bao cao,
// the chuyen canh. Kich ban chay trong Director (director.ts); man nay chi ve theo state cua no va bao lai thao tac.
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { CAST } from '../../content/cast.ts';
import { npcAtlas } from '../../canvas/npc.ts';
import { modalOpen, activeEl } from '../../lib/ui.ts';
import { Icon } from '../../components/Icon.tsx';
import { useKey, useRaf, useViewport } from '../../hooks/index.ts';
import { BG, Director } from './director.ts';
import { Hud } from './Hud.tsx';
import { Dialog } from './Dialog.tsx';
import { Choice } from './Choice.tsx';
import { Result } from './Result.tsx';
import { Pages } from './pages/Pages.tsx';
import { Card } from './Cards.tsx';
import { HudTour } from './HudTour.tsx';
import { StaffCard } from './StaffCard.tsx';
import { PauseMenu } from './PauseMenu.tsx';
import type { CSSProperties, MouseEvent, RefObject } from 'react';
import type { PlayHooks } from '../../types.ts';
import type { RefKey } from './playTypes.ts';
import type { Choice as ChoiceData } from '../../content/schema.ts';
import type { CardAct } from './playTypes.ts';

// hooks: { onMenu, onChoice, onLevelComplete, onFinish, onExit }
export function PlayScreen({ hooks }: { hooks: RefObject<PlayHooks | null> }) {
  const [d, setD] = useState<Director | null>(null);
  const [gen, setGen] = useState(0);                              // tang = tao director moi (choi lai man nay)
  // Director tao trong effect (StrictMode chay effect 2 lan o dev: ban dau bi dung, ban sau choi)
  useEffect(() => {
    const dir = new Director({
      onMenu: () => hooks.current?.onMenu?.(),
      onChoice: e => hooks.current?.onChoice?.(e),
      onLevelComplete: e => hooks.current?.onLevelComplete?.(e),
      onFinish: e => hooks.current?.onFinish?.(e),
      // chi co khi web chu truyen onExit (ban nhung): bang tam dung moi co nut Thoat
      onExit: hooks.current?.onExit && (() => hooks.current?.onExit?.()),
    });
    setD(dir);
    return () => dir.stop();
  }, [hooks, gen]);
  // key: moi director mot cay component moi (the, hop thoai, HUD ve lai tu dau)
  // Xoa du lieu choi: dung director (khong ghi lai phien cu) roi goi thang callback moi nhat cua GameApp (ve man nhan the)
  const onReset = () => { d?.stop(); hooks.current?.onReset?.(); };
  return d ? <Play key={gen} d={d} onReset={onReset} onReplay={() => { d.replayLevel(); setD(null); setGen(g => g + 1); }} /> : null;
}

function Play({ d, onReplay, onReset }: { d: Director; onReplay: () => void; onReset: () => void }) {
  const st = useSyncExternalStore(d.subscribe, d.getState);
  const vp = useViewport();
  // phan tu DOM director can do / dat truc tiep (ref callback on dinh: gan mot lan)
  const r = useMemo(() => Object.fromEntries((['lv', 'hud', 'dlgPanel', 'result', 'focus', 'npcs', 'pmHit', 'stage'] as RefKey[])
    .map(k => [k, (el: HTMLElement | null) => { (d.refs as Record<RefKey, HTMLElement | null>)[k] = el; }])) as Record<RefKey, (el: HTMLElement | null) => void>, [d]);

  useEffect(() => { d.layout(); d.play(); }, [d]);
  useEffect(() => { d.layout(); }, [d, vp]);
  useRaf(() => d.frame());

  // Chuot/cham: cham bat ky dau tren hop thoai (hoac nut goc) sang cau; the chuyen canh cham dau cung duoc
  const onClick = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('button')) return;
    if (t.closest('#card') || (t.closest('#dlg [data-tap]') && st.dialog)) d.advance();
  };
  // Tam dung khi an tab / chuyen app (dien thoai): hen gio, nhan vat, chu chay dung lai cho toi khi bam Tiep tuc
  useEffect(() => {
    const onHide = () => { if (document.hidden) d.pause(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [d]);
  useKey((e, t) => {
    if (modalOpen() || st.tour) return;                            // hop thoai modal / tour dang mo: phim thuoc ve no
    // Esc: dong the nhan vien truoc, roi moi tam dung. preventDefault: bang tuy chon mo ngay trong luot phim nay -> khong chan
    // thi hanh vi mac dinh cua Esc (yeu cau dong) dong luon <dialog> vua mo
    if (e.key === 'Escape') { if (!st.staff) { e.preventDefault(); d.pause(); } return; }
    if ((e.key === 'Enter' || e.key === ' ') && !t.closest?.('button')) { e.preventDefault(); d.advance(); }
    if (!st.choice) return;
    const list = [...(d.refs.lv?.querySelectorAll<HTMLButtonElement>('#chList button') || [])];
    if (/^[abc123]$/i.test(e.key)) list['abc123'.indexOf(e.key.toLowerCase()) % 3]?.click();
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const i = list.indexOf(activeEl() as HTMLButtonElement), step = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : list.length - 1;
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

      <Hud hud={st.hud} fx={st.fx} hudRef={r.hud} onPause={() => d.pause()} onTour={() => d.tour()} />
      <Dialog line={st.dialog} name={d.name} director={d} panelRef={r.dlgPanel} onNext={() => d.advance()} />
      {st.choice && <Choice s={st.choice} onPick={(c: ChoiceData) => d.answer('choice', c)} />}
      {st.result && <Result data={st.result} boxRef={r.result} onNext={() => d.answer('result')} />}
      {st.pages && <Pages pages={st.pages} onNext={() => d.answer('page')} />}
      {st.card && <Card card={st.card} onAct={(a: CardAct) => d.answer('act', a)} />}
      {st.tour && <HudTour root={d.refs.lv ?? null} onDone={() => d.answer('tour')} />}
      {st.staff && <StaffCard staff={st.staff} onClose={closeStaff}
        pm={{ name: d.name, team: d.teamFact(), day: d.run?.day ?? 1 }} />}
      <div className={`pointer-events-none absolute inset-0 z-40 bg-black transition-opacity duration-500 ${st.fade ? '' : 'opacity-0'}`} />
      {st.paused && <PauseMenu level={d.level} day={st.hud.day} canReplay={d.canReplayLevel()}
        onResume={() => d.resume()} onReplay={onReplay} onHome={() => d.hooks.onMenu()} onExit={d.hooks.onExit}
        onReset={onReset} />}
    </section>
  );
}

// NPC: co sprite -> nut vung bam quanh than + canvas rieng ve nhan vat (tran ra ngoai nut); chua co -> the nhan vat tam.
// Vi tri / kich thuoc dat thang vao DOM moi khung hinh (director.placeNpc); data-talk / data-sel do director.talking().
function Npc({ id, d, shown }: { id: string; d: Director; shown: boolean }) {
  const c = CAST[id], atlas = npcAtlas(id);
  const bind = useCallback((el: HTMLElement | null) => d.bindNpc(id, el), [d, id]);
  return (
    <button ref={bind} type="button" className={`${atlas ? 'npc-sprite' : 'gm-plate'} px-standee pointer-events-auto ${shown ? '' : 'opacity-0'}`}
      style={{ '--tint': c.tint } as CSSProperties} title={`${c.name} – ${c.role}`} aria-label={`Xem thẻ ${c.client ? 'khách hàng' : 'nhân viên'}: ${c.name}`}
      onClick={e => d.openStaff(id, e.currentTarget)}>
      {atlas ? <canvas aria-hidden="true" /> : (
        <span data-in="">
          <span data-av="" className="grid w-full flex-1 place-items-center" style={{ background: c.tint }}>
            <Icon name="user" className="text-white/90" stroke={2} />
          </span>
          <span data-nm="" className="w-full truncate pt-1 text-center leading-none font-extrabold text-white">{c.name.split(' ').at(-1)!.toUpperCase()}</span>
        </span>
      )}
    </button>
  );
}

