import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';

export default ts.config(
    { ignores: ['dist/**', 'app/dist/**', 'coverage/**', 'test-results/**', 'playwright-report/**'] },
    js.configs.recommended, ...ts.configs.recommended,
    { languageOptions: { globals: { ...globals.browser, ...globals.node } }, rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    } },
    { files: ['**/*.tsx', 'src/controller.ts'], plugins: { 'react-hooks': hooks }, rules: {
        'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'error',
    } },
);
