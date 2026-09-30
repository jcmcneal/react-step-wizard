import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const fixture = await mkdtemp(path.join(tmpdir(), 'rsw-next-'));
const version = process.env.NEXT_VERSION ?? '16.3.8';
const legacy = version.startsWith('13.');
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
let server;
try {
    const packed = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', fixture], { cwd: root, encoding: 'utf8' }))[0];
    await writeFile(path.join(fixture, 'package.json'), JSON.stringify({ private: true, scripts: { build: 'next build' } }));
    execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', '/tmp/rsw-npm-cache',
        path.join(fixture, packed.filename), `next@${version}`, `react@${legacy ? '18.3.1' : '19.3.0'}`, `react-dom@${legacy ? '18.3.1' : '19.3.0'}`,
        `@types/react@${legacy ? '18' : '19'}`, `@types/react-dom@${legacy ? '18' : '19'}`, 'typescript@5.9.3', '@types/node@22'], { cwd: fixture, env, stdio: 'inherit' });
    await mkdir(path.join(fixture, 'app/interactive'), { recursive: true });
    await writeFile(path.join(fixture, 'app/layout.tsx'), `import 'react-step-wizard/styles.css';
export default function Layout({children}: {children: React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }`);
    // Importing directly from a server component verifies the package's client directive.
    await writeFile(path.join(fixture, 'app/page.tsx'), `import Wizard, {Step} from 'react-step-wizard';
export default function Page() { return <Wizard><Step>Next SSR first</Step><Step>Next SSR hidden</Step></Wizard>; }`);
    await writeFile(path.join(fixture, 'app/interactive/page.tsx'), `'use client';
import Wizard, {Step, useStepWizard} from 'react-step-wizard';
function Controls() { const w = useStepWizard(); return <><output>{w.currentStepName}</output><button onClick={() => w.goToNamedStep('contact')}>Contact</button></>; }
export default function Page() { return <Wizard isHashEnabled footer={<Controls />}><Step stepName="account" hashKey="account">Account body</Step><Step stepName="contact" hashKey="contact">Contact body</Step></Wizard>; }`);
    // Bound build workers for repeatable CI and Macs with large core counts.
    await writeFile(path.join(fixture, 'next.config.js'), 'module.exports = { experimental: { cpus: 2 } };');
    execFileSync(process.execPath, [path.join(fixture, 'node_modules/next/dist/bin/next'), 'build', ...(!legacy ? ['--webpack'] : [])], { cwd: fixture, env, stdio: 'inherit' });
    const allocator = createServer();
    await new Promise(resolve => allocator.listen(0, '127.0.0.1', resolve));
    const port = allocator.address().port;
    await new Promise(resolve => allocator.close(resolve));
    let logs = '';
    server = spawn(process.execPath, [path.join(fixture, 'node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: fixture, env });
    server.stdout.on('data', data => { logs += data; }); server.stderr.on('data', data => { logs += data; });
    const url = `http://127.0.0.1:${port}`;
    let html;
    for (let attempt = 0; attempt < 150; attempt++) {
        try { const response = await fetch(url); if (response.ok) { html = await response.text(); break; } } catch { /* starting */ }
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    assert(html, `Next did not start: ${logs}`);
    assert.match(html, /Next SSR first/); assert.match(html, /hidden=""/);
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${url}/interactive`);
        await page.getByRole('button', { name: 'Contact', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('output')?.textContent === 'contact');
        assert.equal(await page.locator('output').textContent(), 'contact');
        await page.goBack();
        await page.waitForFunction(() => document.querySelector('output')?.textContent === 'account');
        await page.goForward();
        await page.waitForFunction(() => document.querySelector('output')?.textContent === 'contact');
        assert.equal(errors.length, 0, errors.join('\n'));
    } finally { await browser.close(); }
    const packageInfo = JSON.parse(await readFile(path.join(fixture, 'node_modules/next/package.json'), 'utf8'));
    console.log(`Next ${packageInfo.version}: packed package production build, server-component boundary, SSR, hydration and named navigation passed`);
} finally {
    if (server) { server.kill('SIGTERM'); await new Promise(resolve => server.once('exit', resolve)); }
    await rm(fixture, { recursive: true, force: true });
}
