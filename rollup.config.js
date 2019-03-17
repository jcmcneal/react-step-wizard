// "dev": "rollup --config rollup.config.js --watch",
// "build": "rollup --config rollup.config.js --environment NODE_ENV:production",
import path from 'path';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import { eslint } from 'rollup-plugin-eslint';
import { uglify } from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

import app from './package.json';

const isProd = process.env.NODE_ENV === 'production';

export default {
    input: 'src/index.js',
    output: {
        file: `./dist/${path.basename(app.main)}`,
        format: 'umd',
        name: 'ReactStepWizard',
        exports: 'named',
        globals: {
            'prop-types': 'PropTypes',
            react: 'React',
        },
    },
    external: [
        'prop-types',
        'react',
    ],
    context: 'this',
    plugins: [
        isProd && eslint({
            throwOnError: true,
            throwOnWarning: true,
            exclude: ['node_modules/**', '**/**/*.less', '**/**/*.css'],
        }),
        babel({
            exclude: 'node_modules/**',
        }),
        postcss({
            modules: {
                generateScopedName: 'rsw_[hash:base64:2]',
            },
        }),
        isProd && uglify(),
        filesize(),
    ],
};
