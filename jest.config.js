const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    rootDir: '.',
    testEnvironment: 'jsdom',
    transform: {
        '^.+.[tj]sx?$': ['ts-jest', {}],
    },
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy',
        ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    },
};
