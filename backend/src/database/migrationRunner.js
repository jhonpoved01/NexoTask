import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    ensureMigrationTable,
    findAppliedMigrations,
    recordMigration
} from './migrationRepository.js';
import { getPool } from './pool.js';

export const MIGRATIONS_DIRECTORY = fileURLToPath(
    new URL('../../../database/migrations/', import.meta.url)
);

export function calculateChecksum(contents) {
    return createHash('sha256').update(contents).digest('hex');
}

export function resolveMigrationFile(fileName, directory = MIGRATIONS_DIRECTORY) {
    const baseDirectory = resolve(directory);
    const filePath = resolve(baseDirectory, fileName);
    const relativePath = relative(baseDirectory, filePath);

    if (
        relativePath === ''
        || relativePath.startsWith('..')
        || relativePath.includes('/')
        || relativePath.includes('\\')
    ) {
        throw new Error('El archivo de migración debe pertenecer al directorio autorizado');
    }

    return filePath;
}

export async function loadMigrations(directory = MIGRATIONS_DIRECTORY) {
    const entries = await readdir(directory, { withFileTypes: true });
    const fileNames = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right));

    return Promise.all(fileNames.map(async (version) => {
        const filePath = resolveMigrationFile(version, directory);
        const sql = await readFile(filePath, 'utf8');

        return Object.freeze({
            version,
            checksum: calculateChecksum(sql),
            sql
        });
    }));
}

export function classifyMigrations(migrations, appliedMigrations) {
    const appliedByVersion = new Map(
        appliedMigrations.map((migration) => [
            migration.version,
            migration.checksum
        ])
    );
    const applied = [];
    const pending = [];
    const inconsistent = [];

    for (const migration of migrations) {
        const storedChecksum = appliedByVersion.get(migration.version);

        if (storedChecksum === undefined) {
            pending.push(migration);
        } else if (storedChecksum === migration.checksum) {
            applied.push(migration);
        } else {
            inconsistent.push(migration);
        }
    }

    return { applied, pending, inconsistent };
}

const defaultRepository = {
    ensureMigrationTable,
    findAppliedMigrations,
    recordMigration
};

export async function migrateDatabase({
    pool = getPool(),
    migrations,
    repository = defaultRepository
} = {}) {
    const availableMigrations = migrations ?? await loadMigrations();
    const connection = await pool.getConnection();

    try {
        await repository.ensureMigrationTable(connection);
        const storedMigrations = await repository.findAppliedMigrations(connection);
        const status = classifyMigrations(
            availableMigrations,
            storedMigrations
        );

        if (status.inconsistent.length > 0) {
            throw new Error(
                `Checksum inconsistente: ${status.inconsistent[0].version}`
            );
        }

        for (const migration of status.pending) {
            await connection.query(migration.sql);
            await repository.recordMigration(connection, migration);
        }

        return {
            applied: status.pending.map((migration) => migration.version),
            skipped: status.applied.map((migration) => migration.version)
        };
    } finally {
        connection.release();
    }
}

export async function getMigrationStatus({
    pool = getPool(),
    migrations,
    repository = defaultRepository
} = {}) {
    const availableMigrations = migrations ?? await loadMigrations();
    const connection = await pool.getConnection();

    try {
        const storedMigrations = await repository.findAppliedMigrations(
            connection,
            { allowMissingTable: true }
        );

        return classifyMigrations(availableMigrations, storedMigrations);
    } finally {
        connection.release();
    }
}
