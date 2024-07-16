// "dev": "rollup --config rollup.config.js --watch",
// "build": "rollup --config rollup.config.js --environment NODE_ENV:production",
import path from 'path';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import eslint from '@rollup/plugin-eslint';
import postcss from 'rollup-plugin-postcss';
import filesize from 'rollup-plugin-filesize';
import terser from '@rollup/plugin-terser';

import app from './package.json';

const isProd = process.env.NODE_ENV === 'production';

export default {
    input: 'src/index.tsx',
    output: [{
        format: 'cjs',
        file: `./dist/${path.basename(app.main)}`,
        name: 'ReactStepWizard',
        exports: 'named',
        sourcemap: true,
        globals: {
            react: 'React',
        },
    }, {
        format: 'umd',
        file: `./dist/${path.basename(app.browser)}`,
        name: 'ReactStepWizard',
        exports: 'named',
        sourcemap: true,
        globals: {
            react: 'React',
        },
    }, {
        format: 'es',
        file: `./dist/${path.basename(app.module)}`,
        sourcemap: true,
    }],
    external: [
        'react',
    ],
    context: 'this',
    plugins: [
        nodeResolve(),
        isProd && eslint({
            throwOnError: true,
            throwOnWarning: true,
            exclude: ['node_modules/**', '**/**/*.less', '**/**/*.css'],
        }),
        typescript(),
        postcss({
            modules: {
                generateScopedName: 'rsw_[hash:base64:2]',
            },
        }),
        isProd && terser(),
        filesize(),
    ],
};
