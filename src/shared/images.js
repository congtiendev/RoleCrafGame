import { DATA } from './sprites.js';

export const IMG = {};
export const ready = id => IMG[id] && IMG[id].complete && IMG[id].naturalWidth > 0;

// Nap cac sheet cua DATA.sheets chua nap (doi nhan vat thi goi lai; only = chi nap cac sheet id nay). onLoad: moi sheet nap xong; onMissing(danhSachFile): sheet khong nap duoc ca .webp lan .png
export function loadSheets(onLoad, onMissing, only) {
  const miss = [];
  DATA.sheets.forEach(s => {
    if (IMG[s.id] || (only && !only.includes(s.id))) return;
    const im = new Image();
    im.onload = onLoad;
    im.onerror = () => {
      if (!im.src.endsWith('.png')) { im.src = s.file.replace(/\.webp$/, '.png'); return; }   // chua co .webp thi lui ve PNG
      miss.push(s.file); onMissing(miss);
    };
    im.src = s.v ? `${s.file}?v=${s.v}` : s.file;         // v: ma phien ban (import_characters.py) -> doi anh la bo cache
    IMG[s.id] = im;
  });
}
