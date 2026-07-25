import js from '@eslint/js';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'coverage/**',
            'public/vendor/**',
            '**/*.min.js'
        ]
    },
    js.configs.recommended,
    sonarjs.configs.recommended,
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser
        },
        rules: {
            eqeqeq: ['error', 'always'],
            'no-console': ['warn', { allow: ['error', 'warn'] }],
            'no-debugger': 'error',
            'no-eval': 'error',
            'no-implicit-globals': 'error',
            'no-unreachable': 'error',
            'no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                caughtErrors: 'none'
            }],
            'sonarjs/cognitive-complexity': ['warn', 15],
            'sonarjs/no-duplicate-string': ['warn', { threshold: 4 }],
            'sonarjs/no-identical-functions': 'warn'
        }
    },
    {
        files: [
            'eslint.config.js',
            'vite.config.js',
            'vitest.config.js',
            'tests/**/*.test.js'
        ],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2024
            }
        },
        rules: {
            'no-console': 'off'
        }
    }
];
