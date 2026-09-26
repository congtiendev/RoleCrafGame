import '../styles/index.css';
import { loadSheets } from '../shared/images.js';
import { $ } from '../shared/ui.js';
import { mountNotice, notice } from '../shared/Notice.js';
import { mountPlayHeader } from './PlayHeader.js';
import { mountPlay, updatePlay, redrawPlay } from './PlayView.js';

// Loi JS hien thang len trang — khong thi vong ve chet im, san khau trong ma khong biet vi sao
addEventListener('error', e => notice('Lỗi: ' + e.message + (e.lineno ? ' (dòng ' + e.lineno + ')' : '')));
let tickErr = '';
function tick(now) {
  requestAnimationFrame(tick);      // xin khung ke truoc, loi o duoi khong lam dung vong ve
  try { updatePlay(now); } catch (e) {
    if (String(e) !== tickErr) { tickErr = String(e); notice('Lỗi: ' + (e.stack || e)); }
  }
}

mountNotice($('notice'));
mountPlayHeader($('hdr'));
loadSheets(redrawPlay, miss => notice('Không nạp được: ' + miss.join(', ')));
mountPlay($('main'));
requestAnimationFrame(tick);
