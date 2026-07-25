import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';

const databasePath = fileURLToPath(
    new URL('../mock/db.json', import.meta.url)
);

async function hashMockDatabase() {
    const contents = await readFile(databasePath);
    return createHash('sha256').update(contents).digest('hex');
}

describe('rutas iniciales', () => {
    it.each([
        ['/api/users', 'usuarios'],
        ['/api/tasks', 'tareas']
    ])('GET %s devuelve un listado temporal de %s', async (path) => {
        const response = await request(app)
            .get(path)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.data).toEqual([]);
        expect(response.body.meta).toEqual({ total: 0 });
        expect(response.body.message).toContain('persistencia');
    });

    it.each([
        ['/api/users', 'usuarios'],
        ['/api/tasks', 'tareas']
    ])('POST %s confirma la ruta sin crear %s', async (path) => {
        const hashBefore = await hashMockDatabase();
        const response = await request(app)
            .post(path)
            .send({ ignored: 'Este cuerpo no se persiste' })
            .expect('Content-Type', /json/)
            .expect(201);
        const hashAfter = await hashMockDatabase();

        expect(response.body).toEqual({
            data: null,
            message: expect.stringContaining('persistencia')
        });
        expect(hashAfter).toBe(hashBefore);
    });
});
