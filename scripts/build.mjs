import { build } from 'vite';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await build({ configFile: false, build: {
    emptyOutDir: false, minify: false, sourcemap: true, target: 'es2020',
    lib: { entry: 'src/index.tsx', formats: ['es', 'cjs'], fileName: format => format === 'es' ? 'index.js' : 'index.cjs' },
    rolldownOptions: { external: ['react', 'react/jsx-runtime'], output: { exports: 'named', banner: "'use client';" },
        onwarn(warning, warn) { if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning); },
    },
} });
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.build.json'], { stdio: 'inherit' });
for (const file of await readdir('dist')) {
    if (!file.endsWith('.d.ts')) continue;
    const text = (await readFile(`dist/${file}`, 'utf8')).replaceAll('./types.js', './types.cjs');
    await writeFile(`dist/${file.replace('.d.ts', '.d.cts')}`, text);
}
await cp('src/styles.css', 'dist/styles.css');
