import { execFile } from 'node:child_process';
import { createReadStream, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const ROOT = import.meta.dirname;
// IIFE (de mo thang file duoc) khong gop nhieu trang trong mot lan build -> build tung trang:
// PAGE=index (mac dinh) -> index.html + assets/app.*, PAGE=scenario-test -> scenario-test.html + assets/scenario-test.*, PAGE=game -> game.html + assets/game.*
const PAGE = process.env.PAGE || 'index';
const NAME = PAGE === 'index' ? 'app' : PAGE;

export default defineConfig({
  root: 'src',
  base: './',
  server: { open: true },
  build: {
    // Build ra thang goc repo: index.html + assets/ nam canh sheets/, mo bang Live Server
    // hoac mo thang file deu duoc. Ten file co dinh de khong sinh rac moi lan build.
    outDir: ROOT,
    emptyOutDir: false,
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(ROOT, 'src', PAGE + '.html'),
      output: {
        format: 'iife',
        entryFileNames: `assets/${NAME}.js`,
        // CSS gop mot file theo trang; tai nguyen khac (font...) giu ten rieng de khong de len nhau
        assetFileNames: a => (a.names?.[0] || a.name || '').endsWith('.css') ? `assets/${NAME}[extname]` : 'assets/[name][extname]',
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      // Anh nap luc chay bang duong dan 'sheets/...', 'characters/...', 'bg/...', 'ui/...': luc dev root la src/ nen phai tu phuc vu
      name: 'serve-sheets',
      configureServer(server) {
        for (const dir of ['sheets', 'characters', 'bg', 'ui']) {
          server.middlewares.use('/' + dir, (req, res, next) => {
            const f = resolve(ROOT, dir, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, ''));
            if (!f.startsWith(resolve(ROOT, dir)) || !existsSync(f)) return next();
            res.setHeader('Content-Type', f.endsWith('.webp') ? 'image/webp' : 'image/png');
            createReadStream(f).pipe(res);
          });
        }
      },
    },
    {
      // Luc dev: sua kich ban / thoai / manifest / anh sheet -> tu chay build_preview.py.
      // No ghi src/shared/data.js, Vite thay file doi va tu tai lai trang.
      name: 'rebuild-data',
      apply: 'serve',
      configureServer(server) {
        const inputs = ['pm_sprite_manifest.json', 'HUONG_DAN_KICH_BAN.md', 'THOAI_MAU.json'].map(f => resolve(ROOT, f));
        const sheets = resolve(ROOT, 'sheets');
        // anh do chinh build_preview.py ghi ra: bo qua, khong thi script tu kich hoat lai minh (vong lap)
        const outputs = ['start_pm_idle.webp', 'game_pm.webp'].map(f => resolve(sheets, f));
        const log = server.config.logger;
        let timer;
        server.watcher.add([...inputs, sheets]);
        server.watcher.on('change', f => {
          if ((!inputs.includes(f) && !f.startsWith(sheets)) || outputs.includes(f)) return;
          clearTimeout(timer);                  // luu nhieu file mot luc chi chay mot lan
          timer = setTimeout(() => execFile('python3', ['build_preview.py'], { cwd: ROOT }, (err, out, errOut) => {
            if (err) return log.error('[build_preview] ' + (errOut || err.message));
            log.info('[build_preview] ' + out.trim(), { timestamp: true });
            // du lieu khong doi (vd chi sua anh .webp) thi data.js giu nguyen -> tu tai lai de thay anh moi
            if (f.startsWith(sheets)) server.ws.send({ type: 'full-reload' });
          }), 200);
        });
      },
    },
    {
      // file:// chan <script type="module"> va tai nguyen co crossorigin -> doi ve script thuong
      name: 'classic-script',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler: html => html
          .replace(/<script type="module" crossorigin/g, '<script defer')
          .replace(/ crossorigin/g, ''),
      },
    },
  ],
});
