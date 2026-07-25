import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js'],
        coverage: {
            provider: 'v8',
            reportsDirectory: 'coverage',
            reporter: ['text', 'json', 'html'],
            include: [
                'src/utils/filtros.js',
                'src/utils/ordenamiento.js',
                'src/utils/http.js'
            ],
            exclude: [
                'node_modules/**',
                'dist/**',
                'coverage/**',
                'public/vendor/**',
                '**/*.config.js',
                '**/*.min.js'
            ]
        }
    }
});
