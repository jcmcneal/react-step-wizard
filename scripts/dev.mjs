import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { parseArgs } from 'node:util';
import { build, preview } from 'vite';

const { values } = parseArgs({ options: {
    host: { type: 'string', default: '127.0.0.1' }, port: { type: 'string', default: '4173' },
    strictPort: { type: 'boolean', default: true },
} });
function buildLibrary() {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
        child.once('error', reject);
        child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Library build exited ${code}`)));
    });
}
async function rebuild(library) {
    if (library) await buildLibrary();
    await build({ configFile: 'app/vite.config.ts' });
}
// A watch/rebuild preview keeps the example usable on hosts where Vite's native dev
// dependency resolver stalls. It exercises the same packed entry points as production.
await rebuild(true);
const server = await preview({ configFile: 'app/vite.config.ts', preview: {
    host: values.host, port: Number(values.port), strictPort: values.strictPort,
} });
server.printUrls();
console.log('Watching src/ and app/. Refresh the browser after a completed rebuild.');
let timer, building = false, pending = false, pendingLibrary = false;
async function flush() {
    if (building) return;
    building = true;
    while (pending) {
        const library = pendingLibrary;
        pending = pendingLibrary = false;
        try { await rebuild(library); console.log('Example rebuilt; refresh the browser.'); }
        catch (error) { console.error(error); }
    }
    building = false;
}
function schedule(library) {
    pending = true;
    pendingLibrary ||= library;
    clearTimeout(timer);
    timer = setTimeout(() => { void flush(); }, 150);
}
const watchers = [watch('src', { recursive: true }, () => schedule(true)),
    watch('app', { recursive: true }, (_event, filename) => {
        if (filename && filename !== 'dist' && !filename.startsWith('dist/')) schedule(false);
    })];
function stop() {
    clearTimeout(timer);
    watchers.forEach(watcher => watcher.close());
    server.httpServer.close();
}
process.once('SIGINT', stop); process.once('SIGTERM', stop);
