// Dai bao loi / thieu anh ngay duoi header
let el;

export function mountNotice(root) {
  el = root;
  el.className = 'hidden border-b border-line px-4 py-2.5 text-once';
}

export function notice(msg) {
  el.classList.remove('hidden'); el.textContent = msg;
}
