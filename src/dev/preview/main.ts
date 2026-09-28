import '../../styles/index.css';
import { DATA } from '../../lib/sprites.ts';
import { loadSheets } from '../../lib/images.ts';
import { state } from '../../lib/state.ts';
import { setCharacter } from './cast.ts';
import { filterItems } from './catalog.ts';
import { $, setHost } from '../../lib/ui.ts';
import { mountNotice, notice } from '../../lib/Notice.ts';
import { mountHeader, syncHeader, setCount } from './Header.ts';
import { renderGrid, resetGrid, updateGrid, redrawGrid } from './Grid.ts';
import { mountTip, renderSheets } from './SheetView.ts';
import { mountDetail, openDetail, updateDetail } from './DetailDialog.ts';

// Trang nam trong dev/: anh runtime (sheets/, characters/, bg/) o goc site -> assetBase '../'
setHost({ assetBase: '../' });

const main = $('main');

function render() {
  resetGrid(); syncHeader();
  if (state.tab === 'sheets') { setCount(`${DATA.sheets.length} sheet`); return renderSheets(main); }
  const isAnim = state.tab === 'anims', list = filterItems(isAnim, state.sheet, state.q);
  setCount(`${list.length} ${isAnim ? 'hành động' : 'ô'}`);
  renderGrid(main, list, openDetail);
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
function tick(now: number) {
  requestAnimationFrame(tick);      // xin khung ke truoc, loi o duoi khong lam dung vong ve
  try {
    if (!state.paused) updateGrid(now);
    updateDetail(now);
  } catch (e) {
    if (String(e) !== tickErr) { tickErr = String(e); notice('Lỗi: ' + ((e as Error).stack || e)); }
  }
}

const TABS = ['anims', 'cells', 'sheets'];
state.tab = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'anims';
mountNotice($('notice'));
const missing = (miss: string[]) => notice('Không nạp được: ' + miss.join(', '));
function character(id: string) {
  setCharacter(id);
  state.sheet = 'all';
  loadSheets(redraw, missing);
  render();
}
mountHeader($('hdr'), { render, redraw, character });
mountTip($('tip'));
mountDetail($<HTMLDialogElement>('dlg'));
loadSheets(redraw, missing);
render();
requestAnimationFrame(tick);
