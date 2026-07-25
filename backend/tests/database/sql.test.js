import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const databaseDirectory = new URL('../../../database/', import.meta.url);
const migrationNames = [
    'migrations/001_create_users.sql',
    'migrations/002_create_tasks.sql',
    'migrations/003_create_task_assignments.sql'
];

let migrations;
let seed;

beforeAll(async () => {
    migrations = await Promise.all(migrationNames.map(async (name) => (
        readFile(fileURLToPath(new URL(name, databaseDirectory)), 'utf8')
    )));
    seed = await readFile(
        fileURLToPath(new URL('seed.sql', databaseDirectory)),
        'utf8'
    );
});

describe('SQL del modelo relacional', () => {
    it('define las tres tablas con claves primarias', () => {
        expect(migrations[0]).toMatch(/CREATE TABLE users/i);
        expect(migrations[1]).toMatch(/CREATE TABLE tasks/i);
        expect(migrations[2]).toMatch(/CREATE TABLE task_assignments/i);

        for (const sql of migrations) {
            expect(sql).toMatch(/PRIMARY KEY \(id\)/i);
        }
    });

    it('define claves foráneas y unicidad de asignación', () => {
        expect(migrations[1]).toMatch(
            /FOREIGN KEY \(created_by\) REFERENCES users \(id\)/i
        );
        expect(migrations[2]).toMatch(
            /UNIQUE \(task_id, user_id\)/i
        );
        expect(migrations[2]).toMatch(
            /FOREIGN KEY \(task_id\) REFERENCES tasks \(id\)/i
        );
        expect(migrations[2]).toMatch(
            /FOREIGN KEY \(user_id\) REFERENCES users \(id\)/i
        );
    });

    it('no contiene sentencias DROP destructivas', () => {
        const allSql = [...migrations, seed].join('\n');

        expect(allSql).not.toMatch(/DROP\s+DATABASE/i);
        expect(allSql).not.toMatch(/DROP\s+TABLE/i);
    });

    it('mantiene el progreso solo en task_assignments', () => {
        expect(migrations[1]).not.toMatch(/\bstatus\b/i);
        expect(migrations[2]).toMatch(/\bstatus\b/i);
        expect(migrations[2]).not.toMatch(/\bname\b/i);
        expect(migrations[2]).not.toMatch(/\btitle\b/i);
        expect(migrations[2]).not.toMatch(/\bdescription\b/i);
    });

    it('usa semillas ficticias sin contraseñas', () => {
        const emails = seed.match(
            /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
        ) ?? [];

        expect(emails.length).toBeGreaterThan(0);
        expect(emails.every((email) => email.endsWith('example.com')))
            .toBe(true);
        expect(seed).toMatch(/password_hash[\s\S]*NULL/i);
        expect(seed).not.toMatch(/\$2[aby]\$/);
        expect(seed).not.toMatch(/change_me|test-only-secret/i);
    });
});
