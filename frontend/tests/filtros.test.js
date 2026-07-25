import { describe, expect, it } from 'vitest';
import { filtrarTareas } from '../src/utils/filtros.js';

const tareas = [
    {
        id: 'a-1',
        usuarioId: 10,
        tareaId: 'T-ALFA',
        estado: 'Pendiente',
        titulo: 'Primera'
    },
    {
        id: 'a-2',
        usuarioId: '20',
        tareaId: 200,
        estado: 'En progreso',
        titulo: 'Segunda'
    },
    {
        id: 'a-3',
        usuarioId: 'USR-X',
        tareaId: 'T-BETA',
        estado: 'Completada',
        titulo: 'Tercera'
    }
];

describe('filtrarTareas', () => {
    it('devuelve todas las tareas cuando no hay filtros', () => {
        expect(filtrarTareas(tareas)).toEqual(tareas);
    });

    it('filtra por usuario', () => {
        expect(filtrarTareas(tareas, { usuarioId: '20' })).toEqual([tareas[1]]);
    });

    it('filtra por estado sin depender de mayúsculas o espacios', () => {
        expect(filtrarTareas(tareas, { estado: '  pendiente ' })).toEqual([tareas[0]]);
    });

    it('filtra por tarea', () => {
        expect(filtrarTareas(tareas, { tareaId: 'T-BETA' })).toEqual([tareas[2]]);
    });

    it('combina usuario, estado y tarea', () => {
        const resultado = filtrarTareas(tareas, {
            usuarioId: 'USR-X',
            estado: 'Completada',
            tareaId: 'T-BETA'
        });

        expect(resultado).toEqual([tareas[2]]);
    });

    it('compara un ID numérico almacenado como número con un filtro string', () => {
        expect(filtrarTareas(tareas, { usuarioId: '10' })).toEqual([tareas[0]]);
    });

    it('compara un ID numérico almacenado como string con un filtro numérico', () => {
        expect(filtrarTareas(tareas, { usuarioId: 20 })).toEqual([tareas[1]]);
    });

    it('admite IDs alfanuméricos', () => {
        expect(filtrarTareas(tareas, { usuarioId: 'USR-X' })).toEqual([tareas[2]]);
    });

    it('trata el estado Todas como ausencia de filtro', () => {
        expect(filtrarTareas(tareas, { estado: 'Todas' })).toEqual(tareas);
    });

    it('devuelve un arreglo vacío al recibir una lista vacía', () => {
        expect(filtrarTareas([], { estado: 'Pendiente' })).toEqual([]);
    });

    it('no modifica el arreglo ni sus elementos', () => {
        const copia = structuredClone(tareas);
        const resultado = filtrarTareas(tareas, { estado: 'Pendiente' });

        expect(tareas).toEqual(copia);
        expect(resultado).not.toBe(tareas);
        expect(resultado[0]).toBe(tareas[0]);
    });
});
