import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({
    path: fileURLToPath(new URL('../../.env', import.meta.url)),
    quiet: true
});

function readRequired(source, name) {
    const value = source[name];

    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`${name} debe estar definida y no puede estar vacía`);
    }

    return value.trim();
}

function readInteger(source, name, minimum, maximum) {
    const rawValue = readRequired(source, name);

    if (!/^\d+$/.test(rawValue)) {
        throw new Error(`${name} debe ser un número entero`);
    }

    const value = Number(rawValue);

    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new Error(`${name} debe estar entre ${minimum} y ${maximum}`);
    }

    return value;
}

export function loadDatabaseConfig(source = process.env) {
    const database = readRequired(source, 'DB_NAME');
    const user = readRequired(source, 'DB_USER');

    if (!/^[A-Za-z0-9_]+$/.test(database)) {
        throw new Error('DB_NAME solo puede contener letras, números y guion bajo');
    }

    if (user.toLowerCase() === 'root') {
        throw new Error('DB_USER debe ser un usuario técnico distinto de root');
    }

    return Object.freeze({
        host: readRequired(source, 'DB_HOST'),
        port: readInteger(source, 'DB_PORT', 1, 65535),
        database,
        user,
        password: readRequired(source, 'DB_PASSWORD'),
        connectionLimit: readInteger(
            source,
            'DB_CONNECTION_LIMIT',
            1,
            50
        )
    });
}
