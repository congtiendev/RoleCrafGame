// Icon Heroicons (shared/icons.js) dang component: <Icon name="play" className="size-6" stroke={2.25} />
// SVG goc nhung san (?raw) -> tach viewBox + noi dung mot lan, ve thanh <svg> that (khong boc span).
import { SVG } from '../../shared/icons.js';

const PARTS = {};
function parts(name) {
  if (!PARTS[name]) {
    const raw = SVG[name];
    if (!raw) throw new Error(`Chưa khai báo icon "${name}" trong shared/icons.js`);
    PARTS[name] = { viewBox: raw.match(/viewBox="([^"]+)"/)[1], inner: raw.replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '') };
  }
  return PARTS[name];
}

export function Icon({ name, className = 'size-5', stroke = 2 }) {
  const { viewBox, inner } = parts(name);
  return (
    <svg className={`shrink-0 ${className}`} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={stroke}
      aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: inner }} />
  );
}
