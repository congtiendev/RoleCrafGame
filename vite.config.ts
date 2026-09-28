import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createLiveServer } from './dev/mock-live-server.ts';

const ROOT = import.meta.dirname;

// Trang game (index.html) + hai trang cong cu (dev/). Anh luc chay nam trong public/ (bg, ui, characters, sheets).
// Build: dist/app/. Ban nhung vao web khac: vite.embed.config.ts.
export default defineConfig({
  base: './',
  server: { open: true },
  build: {
    outDir: 'dist/app',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(ROOT, 'index.html'),
        preview: resolve(ROOT, 'dev/preview.html'),
        'scenario-test': resolve(ROOT, 'dev/scenario-test.html'),
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      // Che do trinh chieu luc dev: mock may chu realtime (dev/mock-live-server.ts) gan vao chinh dev server, WebSocket /live
      // cung cong -> npm run dev la du (may chu that do BE lam: docs/BE_REALTIME_TRINH_CHIEU.md)
      name: 'mock-live',
      apply: 'serve',
      configureServer(server) {
        const live = createLiveServer({ server: server.httpServer, log: m => server.config.logger.info(`[live] ${m}`, { timestamp: true }) });
        server.httpServer?.once('close', () => { void live.close(); });
      },
    },
    {
      // Luc dev: sua kich ban / thoai / manifest / sheet PNG goc -> tu chay tools/build_preview.py.
      // No ghi src/generated/data.ts + atlas.ts, Vite thay file doi va tu tai lai trang.
      name: 'rebuild-data',
      apply: 'serve',
      configureServer(server) {
        const inputs = ['tools/prompts/PM/pm_sprite_manifest.json', 'docs/HUONG_DAN_KICH_BAN.md', 'docs/THOAI_MAU.json'].map(f => resolve(ROOT, f));
        const sheets = resolve(ROOT, 'tools/sheets');
        const log = server.config.logger;
        let timer: ReturnType<typeof setTimeout> | undefined;
        server.watcher.add([...inputs, sheets]);
        server.watcher.on('change', f => {
          if (!inputs.includes(f) && !f.startsWith(sheets)) return;
          clearTimeout(timer);                  // luu nhieu file mot luc chi chay mot lan
          timer = setTimeout(() => execFile('python3', ['tools/build_preview.py'], { cwd: ROOT }, (err, out, errOut) => {
            if (err) return log.error('[build_preview] ' + (errOut || err.message));
            log.info('[build_preview] ' + out.trim(), { timestamp: true });
            // du lieu khong doi (chi sua anh) thi data.ts giu nguyen -> tu tai lai de thay anh moi trong public/sheets
            if (f.startsWith(sheets)) server.ws.send({ type: 'full-reload' });
          }), 200);
        });
      },
    },
  ],
});
