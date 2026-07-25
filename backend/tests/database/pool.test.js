import { describe, expect, it, vi } from 'vitest';
import {
    createPoolManager,
    createPoolOptions
} from '../../src/database/pool.js';

const databaseConfig = Object.freeze({
    host: 'db.internal',
    port: 3306,
    database: 'nexotask_test',
    user: 'nexotask_app',
    password: 'test-only-secret',
    connectionLimit: 7
});

describe('pool MySQL', () => {
    it('crea opciones seguras y conserva BIGINT como string', () => {
        const options = createPoolOptions(databaseConfig);

        expect(options).toMatchObject({
            host: 'db.internal',
            port: 3306,
            database: 'nexotask_test',
            user: 'nexotask_app',
            password: 'test-only-secret',
            waitForConnections: true,
            connectionLimit: 7,
            queueLimit: 0,
            supportBigNumbers: true,
            bigNumberStrings: true,
            timezone: 'Z',
            charset: 'utf8mb4'
        });
        expect(options).not.toHaveProperty('multipleStatements');
        expect(options).not.toHaveProperty('debug');
    });

    it('comparte un único pool y lo cierra de forma idempotente', async () => {
        const pool = {
            end: vi.fn().mockResolvedValue(undefined)
        };
        const poolFactory = vi.fn(() => pool);
        const manager = createPoolManager({
            poolFactory,
            configLoader: () => databaseConfig
        });

        expect(manager.getPool()).toBe(pool);
        expect(manager.getPool()).toBe(pool);
        expect(poolFactory).toHaveBeenCalledOnce();

        await Promise.all([
            manager.closePool(),
            manager.closePool()
        ]);
        await manager.closePool();

        expect(pool.end).toHaveBeenCalledOnce();
    });
});
