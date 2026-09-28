// Web chu vi du cho goi nhung (examples/react-host): phuc vu tu goc repo de nap dist/embed (build:embed truoc).
import { defineConfig } from 'vite';
// publicDir: false -> anh chi lay tu dist/embed/assets nhu web chu that
export default defineConfig({ root: import.meta.dirname, publicDir: false, server: { open: '/examples/react-host/' } });
