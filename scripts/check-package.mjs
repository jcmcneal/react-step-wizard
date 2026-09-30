import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = process.cwd();
for (const entry of ['dist/index.js', 'dist/index.cjs']) {
    assert.match(await readFile(path.join(root, entry), 'utf8'), /^['"]use client['"];\s*/);
}
const fixture = await mkdtemp(path.join(tmpdir(), 'rsw-package-'));
const run = (program, args) => execFileSync(program, args, { cwd: fixture, stdio: 'inherit' });
try {
    const packed = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', fixture], { cwd: root, encoding: 'utf8' }))[0];
    const paths = packed.files.map(file => file.path);
    for (const expected of ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'dist/index.d.cts', 'dist/types.d.ts', 'dist/types.d.cts', 'dist/styles.css', 'MIGRATION.md', 'LICENSE']) {
        assert(paths.includes(expected), `Missing ${expected} in tarball`);
    }
    assert(paths.every(file => !/^(src|app|node_modules|\.github)\//.test(file)), 'Unexpected development files in package');
    const installed = JSON.parse(await readFile(path.join(root, 'node_modules/react/package.json'), 'utf8')).version;
    const dom = JSON.parse(await readFile(path.join(root, 'node_modules/react-dom/package.json'), 'utf8')).version;
    const types = JSON.parse(await readFile(path.join(root, 'node_modules/@types/react/package.json'), 'utf8')).version;
    const domTypes = JSON.parse(await readFile(path.join(root, 'node_modules/@types/react-dom/package.json'), 'utf8')).version;
    await writeFile(path.join(fixture, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', '/tmp/rsw-npm-cache',
        path.join(fixture, packed.filename), `react@${installed}`, `react-dom@${dom}`, `@types/react@${types}`, `@types/react-dom@${domTypes}`]);
    const smoke = `import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import Wizard, { StepWizard, Step, useStepWizard } from 'react-step-wizard';
assert.equal(Wizard, StepWizard);
assert.equal(typeof useStepWizard, 'function');
assert.match(renderToString(createElement(Wizard, null, createElement(Step, null, 'package rendered'))), /package rendered/);
console.log('Packed ESM import and SSR: passed');`;
    await writeFile(path.join(fixture, 'smoke.mjs'), smoke);
    await writeFile(path.join(fixture, 'smoke.cjs'), `const assert = require('node:assert/strict');
const {createElement} = require('react'); const {renderToString} = require('react-dom/server');
const {default: Wizard, StepWizard, Step} = require('react-step-wizard');
assert.equal(Wizard, StepWizard);
assert.match(renderToString(createElement(Wizard, null, createElement(Step, null, 'CJS rendered'))), /CJS rendered/);
console.log('Packed CJS require and SSR: passed');`);
    run(process.execPath, ['smoke.mjs']); run(process.execPath, ['smoke.cjs']);
    const consumer = `import { createElement, createRef } from 'react';
import Wizard, { Step, useStepWizard, type StepWizardHandle, type StepWizardChildProps, type StepWizardTransitionProps } from 'react-step-wizard';
const ref = createRef<StepWizardHandle>();
const transitions: StepWizardTransitionProps = { intro: 'intro' };
createElement(Wizard, { ref, transitions, children: [null, false, createElement(Step, {stepName: 'A'})], instance: wizard => { void wizard.goToStep('A'); }, nav: wizard => wizard.currentStepName });
function Nested() { const wizard = useStepWizard(); return createElement('button', {onClick: wizard.nextStep}, wizard.currentStep); }
const legacy = (props: StepWizardChildProps<{message: string}>) => props.message + props.currentStep;
void Nested; void legacy;
// @ts-expect-error invalid navigation target
ref.current?.goToStep(true);
// @ts-expect-error an instance is a handle, not component props
createElement(Wizard, {instance: (wizard: {initialStep: number}) => wizard.initialStep});
`;
    for (const extension of ['mts', 'cts']) await writeFile(path.join(fixture, `consumer.${extension}`), consumer);
    for (const resolution of ['NodeNext', 'Bundler']) {
        await writeFile(path.join(fixture, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2020', module: resolution === 'NodeNext' ? 'NodeNext' : 'ESNext', moduleResolution: resolution, strict: true, noEmit: true, skipLibCheck: false, esModuleInterop: true }, include: ['consumer.*ts'] }));
        run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--project', 'tsconfig.json']);
        console.log(`Packed declarations, React ${installed}, ${resolution}: passed`);
    }
    await writeFile(path.join(fixture, 'index.html'), '<div id="root"></div><script type="module" src="/main.tsx"></script>');
    await writeFile(path.join(fixture, 'main.tsx'), `import {createElement} from 'react'; import {createRoot} from 'react-dom/client';
import Wizard, {Step} from 'react-step-wizard'; import 'react-step-wizard/styles.css';
createRoot(document.getElementById('root')!).render(createElement(Wizard, null, createElement(Step, null, 'Vite packed import')));`);
    run(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'build']);
    console.log(`Tarball ${packed.filename}: ${packed.entryCount} files, ${packed.size} bytes; Vite 8 packed consumer: passed`);
} finally {
    await rm(fixture, { recursive: true, force: true });
}
