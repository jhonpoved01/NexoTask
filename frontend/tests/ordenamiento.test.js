import { describe, expect, it } from 'vitest';
import { ordenarTareas } from '../src/utils/ordenamiento.js';

describe('ordenarTareas', () => {
    it('ordena por fecha desde la más reciente', () => {
        const tareas = [
            { id: '1', fechaAsignacion: '2025-01-01T00:00:00.000Z' },
            { id: '2', fechaAsignacion: '2026-06-10T00:00:00.000Z' },
            { id: '3', fechaAsignacion: '2025-11-15T00:00:00.000Z' }
        ];

        expect(ordenarTareas(tareas, 'fecha').map(tarea => tarea.id)).toEqual(['2', '3', '1']);
    });

    it('ordena por nombre usando reglas de español', () => {
        const tareas = [
            { id: '1', usuarioNombre: 'Zoe' },
            { id: '2', usuarioNombre: 'Ana' },
            { id: '3', usuarioNombre: 'Carlos' }
        ];

        expect(ordenarTareas(tareas, 'nombre').map(tarea => tarea.id)).toEqual(['2', '3', '1']);
    });

    it('ordena por estado', () => {
        const tareas = [
            { id: '1', estado: 'Pendiente' },
            { id: '2', estado: 'Completada' },
            { id: '3', estado: 'En progreso' }
        ];

        expect(ordenarTareas(tareas, 'estado').map(tarea => tarea.id)).toEqual(['2', '3', '1']);
    });

    it('mantiene al final una fecha faltante frente a fechas válidas', () => {
        const tareas = [
            { id: 'sin-fecha' },
            { id: 'con-fecha', fechaAsignacion: '2026-01-01T00:00:00.000Z' }
        ];

        expect(ordenarTareas(tareas, 'fecha').map(tarea => tarea.id)).toEqual([
            'con-fecha',
            'sin-fecha'
        ]);
    });

    it('admite un arreglo vacío', () => {
        expect(ordenarTareas([], 'fecha')).toEqual([]);
    });

    it('admite un único elemento', () => {
        expect(ordenarTareas([{ id: 'única' }], 'nombre')).toEqual([{ id: 'única' }]);
    });

    it('no modifica el arreglo original', () => {
        const tareas = [
            { id: '1', usuarioNombre: 'Zoe' },
            { id: '2', usuarioNombre: 'Ana' }
        ];
        const copia = structuredClone(tareas);
        const resultado = ordenarTareas(tareas, 'nombre');

        expect(tareas).toEqual(copia);
        expect(resultado).not.toBe(tareas);
    });

    it('produce un resultado consistente ante fechas equivalentes', () => {
        const tareas = [
            { id: 'primera', fechaAsignacion: '2026-01-01T00:00:00.000Z' },
            { id: 'segunda', fechaAsignacion: '2026-01-01T00:00:00.000Z' }
        ];

        expect(ordenarTareas(tareas, 'fecha').map(tarea => tarea.id)).toEqual([
            'primera',
            'segunda'
        ]);
    });

    it('utiliza fecha como criterio por defecto para un criterio desconocido', () => {
        const tareas = [
            { id: 'anterior', fechaAsignacion: '2025-01-01T00:00:00.000Z' },
            { id: 'reciente', fechaAsignacion: '2026-01-01T00:00:00.000Z' }
        ];

        expect(ordenarTareas(tareas, 'desconocido').map(tarea => tarea.id)).toEqual([
            'reciente',
            'anterior'
        ]);
    });
});
