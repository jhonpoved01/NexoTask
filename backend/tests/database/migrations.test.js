import { describe, expect, it, vi } from 'vitest';
import {
    calculateChecksum,
    getMigrationStatus,
    loadMigrations,
    migrateDatabase,
    resolveMigrationFile
} from '../../src/database/migrationRunner.js';

function createDatabaseDouble() {
    const connection = {
        query: vi.fn().mockResolvedValue([[]]),
        release: vi.fn()
    };
    const pool = {
        getConnection: vi.fn().mockResolvedValue(connection)
    };

    return { connection, pool };
}

function createRepository(applied = []) {
    return {
        ensureMigrationTable: vi.fn().mockResolvedValue(undefined),
        findAppliedMigrations: vi.fn().mockResolvedValue(applied),
        recordMigration: vi.fn().mockResolvedValue(undefined)
    };
}

const migration = Object.freeze({
    version: '001_example.sql',
    checksum: calculateChecksum('CREATE TABLE example (id INT);'),
    sql: 'CREATE TABLE example (id INT);'
});

describe('migraciones', () => {
    it('carga las migraciones en orden y calcula SHA-256', async () => {
        const migrations = await loadMigrations();

        expect(migrations.map(({ version }) => version)).toEqual([
            '001_create_users.sql',
            '002_create_tasks.sql',
            '003_create_task_assignments.sql'
        ]);
        expect(migrations.every(({ checksum }) => (
            /^[a-f0-9]{64}$/.test(checksum)
        ))).toBe(true);
    });

    it('salta una migración aplicada con el mismo checksum', async () => {
        const { connection, pool } = createDatabaseDouble();
        const repository = createRepository([{
            version: migration.version,
            checksum: migration.checksum
        }]);

        const result = await migrateDatabase({
            pool,
            migrations: [migration],
            repository
        });

        expect(result).toEqual({
            applied: [],
            skipped: [migration.version]
        });
        expect(connection.query).not.toHaveBeenCalled();
        expect(repository.recordMigration).not.toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalledOnce();
    });

    it('falla si cambió el checksum de una migración aplicada', async () => {
        const { connection, pool } = createDatabaseDouble();
        const repository = createRepository([{
            version: migration.version,
            checksum: calculateChecksum('contenido modificado')
        }]);

        await expect(migrateDatabase({
            pool,
            migrations: [migration],
            repository
        })).rejects.toThrow(`Checksum inconsistente: ${migration.version}`);

        expect(connection.query).not.toHaveBeenCalled();
        expect(repository.recordMigration).not.toHaveBeenCalled();
    });

    it('no registra una migración cuya sentencia falla', async () => {
        const { connection, pool } = createDatabaseDouble();
        const repository = createRepository();
        connection.query.mockRejectedValueOnce(new Error('SQL failure'));

        await expect(migrateDatabase({
            pool,
            migrations: [migration],
            repository
        })).rejects.toThrow('SQL failure');

        expect(repository.recordMigration).not.toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalledOnce();
    });

    it('rechaza rutas fuera del directorio de migraciones', () => {
        expect(() => resolveMigrationFile('../outside.sql'))
            .toThrow('directorio autorizado');
        expect(() => resolveMigrationFile('/tmp/outside.sql'))
            .toThrow('directorio autorizado');
    });

    it('consulta el estado sin crear tablas ni aplicar migraciones', async () => {
        const { connection, pool } = createDatabaseDouble();
        const repository = createRepository();

        const status = await getMigrationStatus({
            pool,
            migrations: [migration],
            repository
        });

        expect(status.pending).toEqual([migration]);
        expect(repository.ensureMigrationTable).not.toHaveBeenCalled();
        expect(repository.recordMigration).not.toHaveBeenCalled();
        expect(connection.query).not.toHaveBeenCalled();
        expect(repository.findAppliedMigrations).toHaveBeenCalledWith(
            connection,
            { allowMissingTable: true }
        );
    });
});
