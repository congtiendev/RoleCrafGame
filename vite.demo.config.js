// Web chu vi du cho goi nhung (examples/react-host): phuc vu tu goc repo de nap dist/embed (build:embed truoc).
import { defineConfig } from 'vite';
export default defineConfig({ root: import.meta.dirname, server: { open: '/examples/react-host/' } });
