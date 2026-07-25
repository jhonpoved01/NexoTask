import { describe, expect, it, vi } from 'vitest';
import { checkDatabaseConnection } from '../../src/database/connection.js';

describe('comprobación MySQL', () => {
    it('acepta el resultado string de mysql2 y libera la conexión', async () => {
        const connection = {
            query: vi.fn().mockResolvedValue([[
                { connection_check: '1' }
            ]]),
            release: vi.fn()
        };
        const pool = {
            getConnection: vi.fn().mockResolvedValue(connection)
        };

        await expect(checkDatabaseConnection(pool)).resolves.toBe(true);
        expect(connection.query).toHaveBeenCalledWith(
            'SELECT 1 AS connection_check'
        );
        expect(connection.release).toHaveBeenCalledOnce();
    });
});
