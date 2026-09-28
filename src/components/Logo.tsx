// Logo Innocom chinh thuc (brand/): xanh brand-blue cho nen sang (tone 'light'), trang cho nen toi.
// Anh 486x107 -> hien toi da ~50px cao van net tren man hinh 2x.
import blue from '../assets/brand/innocom-logo.png';
import white from '../assets/brand/innocom-logo-white.png';

export const Logo = ({ height = 'h-8', tone = 'dark' }: { height?: string; tone?: 'light' | 'dark' }) => (
  <img src={tone === 'light' ? blue : white} alt="Innocom" className={`${height} w-auto select-none`} draggable="false" />
);
