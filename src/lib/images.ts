import { DATA } from './sprites.ts';
import { asset } from './ui.ts';

export const IMG: Record<string, HTMLImageElement> = {};
export const ready = (id: string) => !!IMG[id] && IMG[id].complete && IMG[id].naturalWidth > 0;

// Nap cac sheet cua DATA.sheets chua nap (doi nhan vat thi goi lai; only = chi nap cac sheet id nay). onLoad: moi sheet nap xong; onMissing(danhSachFile): sheet khong nap duoc
export function loadSheets(onLoad: () => void, onMissing: (files: string[]) => void, only?: string[]) {
  const miss: string[] = [];
  DATA.sheets.forEach(s => {
    if (IMG[s.id] || (only && !only.includes(s.id))) return;
    const im = new Image();
    im.onload = onLoad;
    im.onerror = () => { miss.push(s.file); onMissing(miss); };
    im.src = asset(s.v ? `${s.file}?v=${s.v}` : s.file);         // v: ma phien ban (import_characters.py) -> doi anh la bo cache
    IMG[s.id] = im;
  });
}

// Nap truoc anh (duong dan cho asset()) de man sau hien ngay; onEach(soAnhDaXong) sau moi anh (loi cung tinh la xong)
export function preload(paths: string[], onEach: (done: number) => void = () => {}) {
  let n = 0;
  return Promise.all(paths.map(p => new Promise<void>(r => {
    const im = new Image();
    im.onload = im.onerror = () => { onEach(++n); r(); };
    im.src = asset(p);
  })));
}
