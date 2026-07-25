import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { loadDatabaseConfig } from '../../src/config/database.config.js';

const SEED_FILE = fileURLToPath(
    new URL('../../../database/seed.sql', import.meta.url)
);

let connection;

try {
    if ((process.env.NODE_ENV ?? 'development') === 'production') {
        throw new Error('La semilla está bloqueada en producción');
    }

    const config = loadDatabaseConfig();
    const sql = await readFile(SEED_FILE, 'utf8');

    connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        supportBigNumbers: true,
        bigNumberStrings: true,
        timezone: 'Z',
        charset: 'utf8mb4',
        multipleStatements: true
    });

    await connection.query(sql);
    console.log('Semilla ficticia aplicada correctamente');
} catch (error) {
    console.error(
        error.message === 'La semilla está bloqueada en producción'
            ? error.message
            : 'No fue posible aplicar la semilla ficticia'
    );
    process.exitCode = 1;
} finally {
    if (connection) {
        await connection.end().catch(() => {
            process.exitCode = 1;
        });
    }
}
