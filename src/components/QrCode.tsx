// Ma QR that (goi uqr, ma hoa trong trinh duyet, khong goi dich vu ngoai) trong khung o HUD (.gm-plate = art track_sm:
// nen navy, vien xanh sang); long trang cach vien mot ranh navy, ma nam giua kem le trang (quiet zone) de may quet de doc.
// Tia quet chay len xuong tren ma (.qr-scan-trail + .qr-scan-line, effects.css).
import { useMemo } from 'react';
import { encode } from 'uqr';

// Moi o den = mot doan duong ngang trong mot <path> (nhe hon hang tram <rect>); crispEdges: canh o sac o moi co
function QrSvg({ text, className = '' }: { text: string; className?: string }) {
  const { size, d } = useMemo(() => {
    const qr = encode(text, { ecc: 'M', border: 0 });
    const d = qr.data.flatMap((row, y) => row.map((on, x) => (on ? `M${x} ${y}h1v1h-1z` : ''))).join('');
    return { size: qr.size, d };
  }, [text]);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} shapeRendering="crispEdges" role="img" aria-label={`Mã QR: ${text}`}>
      <path d={d} fill="#0b1d4d" />
    </svg>
  );
}

// className: co khung (vd w-[248px]); khung vuong theo chieu ngang
export function QrFrame({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`gm-plate aspect-square [--f:10px] ${className}`}>
      <div data-in="" className="inset-[5px] place-items-center rounded-[4px] bg-white p-[9%]">
        <QrSvg text={text} className="size-full" />
        <span className="qr-scan-trail" aria-hidden="true" />
        <span className="qr-scan-line" aria-hidden="true" />
      </div>
    </div>
  );
}
