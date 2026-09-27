// Nhung game vao web khac: mountRoleCraft(phanTu, opts) -> { update(opts), destroy() }.
// Game (React, GameApp.jsx) chay trong ShadowRoot cua phan tu: CSS/id cua game va cua web chu khong dung nhau.
// Game phu toan man hinh (position: fixed) vi bo cuc tinh theo kich thuoc man hinh va toi uu cho dien thoai;
// trang chu mo game bang nut rieng. Moi luc chi mot game tren trang (trang thai phien, anh da nap dung chung).
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import css from '../styles/embed.css?inline';
import { setHost } from '../shared/ui.js';
import { GameApp } from '../game/GameApp.jsx';

// :root -> :host (bien theme cua game dat tren host); @font-face / @property chi co hieu luc o document -> tach ra.
// rc-asset:ui/.. = anh trong CSS (vite.embed.config.js) -> assetBase
const toShadow = (s, base) => s
  .replaceAll('rc-asset:', base)
  .replace(/:root\[([^\]]+)\]/g, ':host([$1])')
  .replace(/:root:not\(([^)]+)\)/g, ':host(:not($1))')
  .replace(/:root\b/g, ':host');
function globalRules(s) {
  const out = [];
  for (const kw of ['@font-face', '@property']) {
    let i = 0;
    while ((i = s.indexOf(kw, i)) >= 0) {
      const end = s.indexOf('}', i);
      if (end < 0) break;
      out.push(s.slice(i, end + 1)); i = end + 1;
    }
  }
  return out.join('\n');
}
// font + @property: gan mot lan vao <head> cua web chu (van dung khi mount/unmount nhieu lan)
function ensureGlobal(doc) {
  if (doc.getElementById('rolecraft-global')) return;
  const st = doc.createElement('style');
  st.id = 'rolecraft-global';
  st.textContent = globalRules(css);
  doc.head.append(st);
}
const base = b => (b ? String(b).replace(/\/?$/, '/') : '');

let current = null;

// opts: { assetBase: URL thu muc chua bg/ ui/ characters/ sheets/ (vd '/games/rolecraft/'), mac dinh canh trang;
//         zIndex (mac dinh 2147483000), lockScroll: khoa cuon trang chu khi dang choi (mac dinh true);
//         va cac prop cua GameApp: player, storageKey, loadProgress, saveProgress, onChoice, onLevelComplete, onFinish, onExit }
export function mountRoleCraft(el, { assetBase = '', zIndex = 2147483000, lockScroll = true, ...props } = {}) {
  current?.destroy();                                        // chi mot game moi luc
  const doc = el.ownerDocument;
  ensureGlobal(doc);
  const shadow = el.shadowRoot || el.attachShadow({ mode: 'open' });
  shadow.innerHTML = '';
  const style = doc.createElement('style');
  style.textContent = toShadow(css, base(assetBase));
  // khung game: phu man hinh, nen + chu + con tro nhu <body> cua game.html
  const frame = doc.createElement('div');
  frame.className = 'px-cursors fixed inset-0 touch-manipulation overflow-hidden overscroll-none bg-black font-sans text-white antialiased';
  frame.style.zIndex = zIndex;
  frame.setAttribute('role', 'application');
  frame.setAttribute('aria-label', 'RoleCraft – PM 60 ngày thử việc');
  const app = doc.createElement('main');
  frame.append(app);
  shadow.append(style, frame);

  const prev = lockScroll && { html: doc.documentElement.style.overflow, body: doc.body.style.overflow };
  if (prev) { doc.documentElement.style.overflow = 'hidden'; doc.body.style.overflow = 'hidden'; }

  setHost({ root: shadow, portal: frame, assetBase });
  const root = createRoot(app);
  const render = p => root.render(createElement(GameApp, p));
  render(props);
  const api = {
    update: p => render({ ...props, ...p }),
    destroy() {
      if (current !== api) return;
      current = null;
      if (prev) { doc.documentElement.style.overflow = prev.html; doc.body.style.overflow = prev.body; }
      // go root sau luot render hien tai (goi tu cleanup effect cua React web chu -> go dong bo se bi canh bao);
      // chi xoa ShadowRoot neu chua co game moi gan vao cho do
      queueMicrotask(() => {
        root.unmount();
        if (frame.isConnected) shadow.innerHTML = '';
        if (!current) setHost();
      });
    },
  };
  current = api;
  return api;
}
