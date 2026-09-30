import { defineConfig } from 'vite';
export default defineConfig({ root: 'app', base: './',
    build: { outDir: 'dist', emptyOutDir: true, rolldownOptions: {
        onwarn(warning, warn) { if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning); },
    } },
});
