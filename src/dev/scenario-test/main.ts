import '../../styles/index.css';
import { loadSheets } from '../../lib/images.ts';
import { $, setHost } from '../../lib/ui.ts';
import { mountNotice, notice } from '../../lib/Notice.ts';
import { mountPlayHeader } from './PlayHeader.ts';
import { mountPlay, updatePlay, redrawPlay } from './PlayView.ts';

// Trang nam trong dev/: anh runtime (sheets/, characters/, bg/) o goc site -> assetBase '../'
setHost({ assetBase: '../' });

// Loi JS hien thang len trang — khong thi vong ve chet im, san khau trong ma khong biet vi sao
addEventListener('error', e => notice('Lỗi: ' + e.message + (e.lineno ? ' (dòng ' + e.lineno + ')' : '')));
let tickErr = '';
function tick(now: number) {
  requestAnimationFrame(tick);      // xin khung ke truoc, loi o duoi khong lam dung vong ve
  try { updatePlay(now); } catch (e) {
    if (String(e) !== tickErr) { tickErr = String(e); notice('Lỗi: ' + ((e as Error).stack || e)); }
  }
}

mountNotice($('notice'));
mountPlayHeader($('hdr'));
loadSheets(redrawPlay, miss => notice('Không nạp được: ' + miss.join(', ')));
mountPlay($('main'));
requestAnimationFrame(tick);
