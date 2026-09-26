// Logo Innocom chinh thuc (https://innocom.co/image/innocms/2023_01_Logo1-02-4-2.png – ban goc mau trang).
// Da bo bong do + cat sat chu, nen trong suot: innocom-logo.png (xanh brand-blue #2c63b0) cho nen sang,
// innocom-logo-white.png cho nen toi. Anh 486x107 -> hien toi da ~50px cao van net tren man hinh 2x.
import blue from './innocom-logo.png';
import white from './innocom-logo-white.png';

// height: class chieu cao (rong tu tinh theo ti le); tone: 'light' tren nen sang (khung card) / 'dark' tren nen toi
export const innocomLogo = ({ height = 'h-8', tone = 'dark' } = {}) =>
  `<img src="${tone === 'light' ? blue : white}" alt="Innocom" class="${height} w-auto select-none" draggable="false">`;
