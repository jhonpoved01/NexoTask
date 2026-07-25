import mysql from 'mysql2/promise';
import { loadDatabaseConfig } from '../config/database.config.js';

export function createPoolOptions(config) {
    return {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: config.connectionLimit,
        queueLimit: 0,
        supportBigNumbers: true,
        bigNumberStrings: true,
        timezone: 'Z',
        charset: 'utf8mb4'
    };
}

export function createPoolManager({
    poolFactory = mysql.createPool,
    configLoader = loadDatabaseConfig
} = {}) {
    let pool;
    let closePromise;

    return {
        getPool() {
            if (!pool) {
                pool = poolFactory(createPoolOptions(configLoader()));
            }

            return pool;
        },

        async closePool() {
            if (!pool) {
                return;
            }

            if (!closePromise) {
                closePromise = pool.end().finally(() => {
                    pool = undefined;
                    closePromise = undefined;
                });
            }

            await closePromise;
        }
    };
}

const sharedPoolManager = createPoolManager();

export const getPool = () => sharedPoolManager.getPool();
export const closePool = () => sharedPoolManager.closePool();
