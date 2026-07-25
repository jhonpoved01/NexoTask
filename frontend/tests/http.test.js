import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    ErrorHttp,
    asegurarLista,
    normalizarId,
    solicitarJson
} from '../src/utils/http.js';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function crearRespuesta(estado, cuerpo = '') {
    return {
        ok: estado >= 200 && estado < 300,
        status: estado,
        text: vi.fn().mockResolvedValue(cuerpo)
    };
}

describe('normalizarId', () => {
    it.each([
        [123, '123'],
        ['456', '456'],
        ['TAREA-A7', 'TAREA-A7'],
        ['  USR-9  ', 'USR-9']
    ])('normaliza %j como %s', (entrada, esperado) => {
        expect(normalizarId(entrada)).toBe(esperado);
    });

    it.each(['', '   ', null, undefined])('rechaza el valor vacío %j', entrada => {
        expect(() => normalizarId(entrada)).toThrowError(ErrorHttp);

        try {
            normalizarId(entrada);
        } catch (error) {
            expect(error).toMatchObject({ tipo: 'datos', estado: null });
        }
    });
});

describe('asegurarLista', () => {
    it('devuelve el mismo arreglo válido', () => {
        const lista = [{ id: '1' }];
        expect(asegurarLista(lista, 'recursos')).toBe(lista);
    });

    it('admite un arreglo vacío', () => {
        expect(asegurarLista([], 'recursos')).toEqual([]);
    });

    it.each([{ valor: true }, null, 'lista'])('rechaza una respuesta inesperada', valor => {
        expect(() => asegurarLista(valor, 'recursos')).toThrowError(ErrorHttp);

        try {
            asegurarLista(valor, 'recursos');
        } catch (error) {
            expect(error).toMatchObject({
                tipo: 'respuesta',
                estado: null
            });
        }
    });
});

describe('solicitarJson', () => {
    it('devuelve los datos de una respuesta 200 con JSON válido', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            crearRespuesta(200, '{"id":"T-1","titulo":"Prueba"}')
        );
        vi.stubGlobal('fetch', fetchMock);

        await expect(solicitarJson('/tareas/T-1')).resolves.toEqual({
            id: 'T-1',
            titulo: 'Prueba'
        });
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it('devuelve null para una respuesta 204', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(crearRespuesta(204)));
        await expect(solicitarJson('/tareas/T-1')).resolves.toBeNull();
    });

    it('devuelve null para una respuesta exitosa vacía', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(crearRespuesta(200, '   ')));
        await expect(solicitarJson('/tareas')).resolves.toBeNull();
    });

    it('diferencia un error de conexión y conserva el detalle técnico', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('conexión rechazada')));

        await expect(solicitarJson('/tareas')).rejects.toMatchObject({
            tipo: 'conexion',
            estado: null,
            detalle: 'conexión rechazada'
        });
    });

    it('clasifica un 404 y conserva estado y cuerpo de respuesta', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(crearRespuesta(404, 'No existe')));

        await expect(solicitarJson('/tareas/inexistente')).rejects.toMatchObject({
            tipo: 'no-encontrado',
            estado: 404,
            detalle: 'No existe'
        });
    });

    it.each([400, 422])('clasifica un %i como datos inválidos', async estado => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
            crearRespuesta(estado, 'Datos inválidos')
        ));

        await expect(solicitarJson('/tareas')).rejects.toMatchObject({
            tipo: 'datos',
            estado,
            detalle: 'Datos inválidos'
        });
    });

    it('clasifica un error 500 como error del servidor', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
            crearRespuesta(500, 'Fallo interno')
        ));

        await expect(solicitarJson('/tareas')).rejects.toMatchObject({
            tipo: 'servidor',
            estado: 500,
            detalle: 'Fallo interno'
        });
    });

    it('clasifica una respuesta no JSON como respuesta inesperada', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
            crearRespuesta(200, '<html>respuesta inesperada</html>')
        ));

        await expect(solicitarJson('/tareas')).rejects.toMatchObject({
            tipo: 'respuesta',
            estado: 200
        });
    });

    it('envía a fetch las opciones sin modificarlas', async () => {
        const fetchMock = vi.fn().mockResolvedValue(crearRespuesta(200, '{}'));
        const opciones = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"titulo":"Tarea"}'
        };
        vi.stubGlobal('fetch', fetchMock);

        await solicitarJson('/tareas', opciones);
        expect(fetchMock).toHaveBeenCalledWith('/tareas', opciones);
    });
});
