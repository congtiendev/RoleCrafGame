// Build goi nhung (npm run build:embed): dist/embed/rolecraft-game.js (ESM, React de ngoai – web chu cung cap)
// + dist/embed/assets/ (anh luc chay: bg, ui, characters, sheets – web chu phuc vu thu muc nay va truyen assetBase).
// CSS nam trong JS (chuoi, gan vao ShadowRoot). Anh trong CSS (khung, nut, con tro – url("../../ui/..")) khong nhung base64
// (lib mode cua Vite luon nhung, ~0.9 MB) ma doi thanh "rc-asset:ui/.." – mount.js thay bang assetBase luc chay.
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const ROOT = import.meta.dirname;

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      // chay sau Tailwind (gop @import), truoc vite:css (se nhung anh): url co scheme la tai nguyen ngoai, Vite bo qua
      name: 'css-asset-base',
      enforce: 'pre',
      transform(code, id) {
        if (!/\.css($|\?)/.test(id)) return;
        return code.replace(/url\((["']?)(?:\.\.\/)+ui\//g, 'url($1rc-asset:ui/');
      },
    },
  ],
  publicDir: false,
  build: {
    outDir: resolve(ROOT, 'dist/embed'),
    emptyOutDir: true,
    lib: { entry: resolve(ROOT, 'src/embed/index.js'), formats: ['es'], fileName: () => 'rolecraft-game.js' },
    rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] },
    sourcemap: true,
  },
});
