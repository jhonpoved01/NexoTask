import { getPool } from './pool.js';

export async function checkDatabaseConnection(pool = getPool()) {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(
            'SELECT 1 AS connection_check'
        );

        return String(rows[0]?.connection_check) === '1';
    } finally {
        connection.release();
    }
}
