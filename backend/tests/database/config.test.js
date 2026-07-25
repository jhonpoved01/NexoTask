import { describe, expect, it } from 'vitest';
import { loadDatabaseConfig } from '../../src/config/database.config.js';

const validSource = Object.freeze({
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_NAME: 'nexotask_test',
    DB_USER: 'nexotask_app',
    DB_PASSWORD: 'test-only-secret',
    DB_CONNECTION_LIMIT: '10'
});

describe('configuración MySQL', () => {
    it('normaliza una configuración válida', () => {
        expect(loadDatabaseConfig(validSource)).toEqual({
            host: 'localhost',
            port: 3306,
            database: 'nexotask_test',
            user: 'nexotask_app',
            password: 'test-only-secret',
            connectionLimit: 10
        });
    });

    it.each([
        [{ DB_PORT: '0' }, 'DB_PORT'],
        [{ DB_PORT: '3306.5' }, 'DB_PORT'],
        [{ DB_CONNECTION_LIMIT: '51' }, 'DB_CONNECTION_LIMIT'],
        [{ DB_CONNECTION_LIMIT: 'many' }, 'DB_CONNECTION_LIMIT'],
        [{ DB_NAME: 'nexotask; DROP' }, 'DB_NAME'],
        [{ DB_USER: 'root' }, 'DB_USER'],
        [{ DB_PASSWORD: '' }, 'DB_PASSWORD']
    ])('rechaza configuración inválida %o', (override, expectedField) => {
        expect(() => loadDatabaseConfig({
            ...validSource,
            ...override
        })).toThrow(expectedField);
    });

    it('no incluye la contraseña en los errores', () => {
        const secret = 'valor-que-no-debe-aparecer';

        expect(() => loadDatabaseConfig({
            ...validSource,
            DB_PASSWORD: secret,
            DB_PORT: 'invalid'
        })).toThrowError(expect.not.objectContaining({
            message: expect.stringContaining(secret)
        }));
    });
});
