import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';

describe('GET /api/health', () => {
    it('informa que la API está disponible sin exponer datos sensibles', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toMatchObject({
            data: {
                service: 'nexotask-api',
                status: 'ok'
            },
            message: 'La API está disponible'
        });
        expect(Number.isNaN(Date.parse(response.body.data.timestamp))).toBe(false);
        expect(response.body.data.uptime).toBeTypeOf('number');
        expect(response.body.data.uptime).toBeGreaterThanOrEqual(0);

        const serializedResponse = JSON.stringify(response.body).toLowerCase();
        expect(serializedResponse).not.toContain('password');
        expect(serializedResponse).not.toContain('secret');
        expect(serializedResponse).not.toContain('database');
        expect(serializedResponse).not.toContain('stack');
    });
});
