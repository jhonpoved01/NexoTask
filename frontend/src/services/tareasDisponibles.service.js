import { API_URL } from '../config/api.config.js';

export async function obtenerTareasDisponibles() {

    const respuesta = await fetch(`${API_URL}/tareasDisponibles`);

    if (!respuesta.ok) {

        throw new Error(
            'Error al cargar tareas disponibles'
        );

    }

    const tareas    = await respuesta.json();

    return tareas;

}

export async function crearTareaDisponible(tarea) {

    const respuesta = await fetch(`${API_URL}/tareasDisponibles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tarea)
    });

    return respuesta;

}

export async function actualizarTareaDisponible(id, datos) {

    const respuesta = await fetch(`${API_URL}/tareasDisponibles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    return respuesta;

}

export async function eliminarTareaDisponible(id) {

    const respuesta = await fetch(`${API_URL}/tareasDisponibles/${id}`, {
        method: 'DELETE'
    });

    return respuesta;

}
