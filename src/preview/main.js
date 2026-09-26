import '../styles/index.css';
import { DATA } from '../shared/sprites.js';
import { loadSheets } from '../shared/images.js';
import { state } from '../shared/state.js';
import { setCharacter } from './cast.js';
import { filterItems } from './catalog.js';
import { $ } from '../shared/ui.js';
import { mountNotice, notice } from '../shared/Notice.js';
import { mountHeader, syncHeader, setCount } from './Header.js';
import { renderGrid, resetGrid, updateGrid, redrawGrid } from './Grid.js';
import { mountTip, renderSheets } from './SheetView.js';
import { mountDetail, openDetail, updateDetail } from './DetailDialog.js';

const main = $('main');

function render() {
  resetGrid(); syncHeader();
  if (state.tab === 'sheets') { setCount(`${DATA.sheets.length} sheet`); return renderSheets(main); }
  const isAnim = state.tab === 'anims', list = filterItems(isAnim, state.sheet, state.q);
  setCount(`${list.length} ${isAnim ? 'hành động' : 'ô'}`);
  renderGrid(main, list, isAnim, openDetail);
}

// Anh sheet nap xong / doi vien o: ve lai tab dang mo
function redraw() {
  if (state.tab === 'sheets') return renderSheets(main);
  redrawGrid();
}

// ================= vong ve chung =================
// Loi JS hien thang len trang — khong thi vong ve chet im, san khau trong ma khong biet vi sao
addEventListener('error', e => notice('Lỗi: ' + e.message + (e.lineno ? ' (dòng ' + e.lineno + ')' : '')));
let tickErr = '';
function tick(now) {
  requestAnimationFrame(tick);      // xin khung ke truoc, loi o duoi khong lam dung vong ve
  try {
    if (!state.paused) updateGrid(now);
    updateDetail(now);
  } catch (e) {
    if (String(e) !== tickErr) { tickErr = String(e); notice('Lỗi: ' + (e.stack || e)); }
  }
}

const TABS = ['anims', 'cells', 'sheets'];
state.tab = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'anims';
mountNotice($('notice'));
const missing = miss => notice('Không nạp được: ' + miss.join(', '));
function character(id) {
  setCharacter(id);
  state.sheet = 'all';
  loadSheets(redraw, missing);
  render();
}
mountHeader($('hdr'), { render, redraw, character });
mountTip($('tip'));
mountDetail($('dlg'));
loadSheets(redraw, missing);
render();
requestAnimationFrame(tick);
