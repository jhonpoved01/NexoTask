import express from 'express';
import request from 'supertest';
import {
    afterEach,
    describe,
    expect,
    it,
    vi
} from 'vitest';
import { app } from '../src/app.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import { AppError } from '../src/utils/AppError.js';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('manejo de errores', () => {
    it('devuelve el contrato común para una ruta inexistente', async () => {
        const response = await request(app)
            .get('/api/no-existe')
            .expect(404);

        expect(response.body.error).toMatchObject({
            code: 'ROUTE_NOT_FOUND',
            message: expect.any(String),
            details: [{
                method: 'GET',
                path: '/api/no-existe'
            }]
        });
    });

    it('no refleja parámetros de consulta en el error de ruta inexistente', async () => {
        const response = await request(app)
            .get('/api/no-existe?token=informacion-sensible')
            .expect(404);
        const serializedResponse = JSON.stringify(response.body);

        expect(response.body.error).toMatchObject({
            code: 'ROUTE_NOT_FOUND',
            details: [{
                method: 'GET',
                path: '/api/no-existe'
            }]
        });
        expect(response.body.error.details[0].path).not.toContain('?');
        expect(serializedResponse).not.toContain('token');
        expect(serializedResponse).not.toContain('informacion-sensible');
    });

    it('rechaza JSON mal formado', async () => {
        const response = await request(app)
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send('{"name":')
            .expect(400);

        expect(response.body.error.code).toBe('INVALID_JSON');
    });

    it('permite un origen configurado', async () => {
        const response = await request(app)
            .get('/api/health')
            .set('Origin', 'http://localhost:5173')
            .expect(200);

        expect(response.headers['access-control-allow-origin'])
            .toBe('http://localhost:5173');
    });

    it('rechaza un origen no permitido', async () => {
        const response = await request(app)
            .get('/api/health')
            .set('Origin', 'https://example.invalid')
            .expect(403);

        expect(response.body.error).toEqual({
            code: 'CORS_ORIGIN_DENIED',
            message: 'El origen de la solicitud no está permitido',
            details: []
        });
    });

    it('oculta por defecto los detalles de un AppError con estado 500', async () => {
        const isolatedApp = express();
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        isolatedApp.get('/internal-app-error', () => {
            throw new AppError({
                code: 'INTERNAL_DATABASE_FAILURE',
                message: 'Conexión interna fallida',
                status: 500,
                details: [{
                    internalPath: '/ruta/interna/secreta.js'
                }]
            });
        });
        isolatedApp.use(errorHandler);

        const response = await request(isolatedApp)
            .get('/internal-app-error')
            .expect(500);
        const serializedResponse = JSON.stringify(response.body);

        expect(response.body).toEqual({
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Ocurrió un error interno en el servidor',
                details: []
            }
        });
        expect(serializedResponse).not.toContain('INTERNAL_DATABASE_FAILURE');
        expect(serializedResponse).not.toContain('Conexión interna fallida');
        expect(serializedResponse).not.toContain('internalPath');
        expect(serializedResponse).not.toContain('/ruta/interna');
        expect(serializedResponse).not.toContain('stack');
        expect(consoleError).toHaveBeenCalledOnce();
    });

    it('oculta el stack y las rutas internas en errores inesperados', async () => {
        const isolatedApp = express();
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        isolatedApp.get('/failure', () => {
            throw new Error('/ruta/interna/secreta.js');
        });
        isolatedApp.use(errorHandler);

        const response = await request(isolatedApp)
            .get('/failure')
            .expect(500);
        const serializedResponse = JSON.stringify(response.body);

        expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(serializedResponse).not.toContain('stack');
        expect(serializedResponse).not.toContain('/ruta/interna');
        expect(consoleError).toHaveBeenCalledOnce();
    });
});
