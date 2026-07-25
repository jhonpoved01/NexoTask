import 'dotenv/config';

const ALLOWED_ENVIRONMENTS = new Set(['development', 'test', 'production']);

function readNonEmpty(name, fallback) {
    const value = process.env[name] ?? fallback;

    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`${name} no puede estar vacío`);
    }

    return value.trim();
}

function readEnvironment() {
    const nodeEnv = readNonEmpty('NODE_ENV', 'development');

    if (!ALLOWED_ENVIRONMENTS.has(nodeEnv)) {
        throw new Error('NODE_ENV debe ser development, test o production');
    }

    return nodeEnv;
}

function readPort() {
    const rawPort = readNonEmpty('PORT', '3001');

    if (!/^\d+$/.test(rawPort)) {
        throw new Error('PORT debe ser un número entero');
    }

    const port = Number(rawPort);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('PORT debe estar entre 1 y 65535');
    }

    return port;
}

function readCorsOrigins(nodeEnv) {
    const rawOrigins = process.env.CORS_ORIGINS
        ?? 'http://localhost:5173,http://127.0.0.1:5173';
    const origins = rawOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (nodeEnv === 'production' && origins.length === 0) {
        throw new Error('CORS_ORIGINS no puede estar vacío en producción');
    }

    return Object.freeze(origins);
}

const nodeEnv = readEnvironment();

export const env = Object.freeze({
    nodeEnv,
    host: readNonEmpty('HOST', '127.0.0.1'),
    port: readPort(),
    corsOrigins: readCorsOrigins(nodeEnv),
    jsonLimit: readNonEmpty('JSON_LIMIT', '100kb')
});
