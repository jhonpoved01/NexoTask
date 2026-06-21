import { API_URL } from '../config/api.config.js';

export async function obtenerTodasLasTareasAsignadas() {

    const respuesta =
        await fetch(
            `${API_URL}/tareasAsignadas`
        );

    if (!respuesta.ok) {

        throw new Error(
            'Error al cargar tareas asignadas'
        );

    }

    const tareas =
        await respuesta.json();

    return tareas;

}

export async function obtenerTareasAsignadasPorUsuario(usuarioId) {

    const respuesta =
        await fetch(
            `${API_URL}/tareasAsignadas?usuarioId=${encodeURIComponent(String(usuarioId))}`
        );

    if (!respuesta.ok) {

        throw new Error(
            'Error al cargar tareas asignadas'
        );

    }

    const tareas =
        await respuesta.json();

    return tareas;

}

export async function crearTareaAsignada(tareaAsignada) {

    const respuesta =
        await fetch(

            `${API_URL}/tareasAsignadas`,

            {

                method: 'POST',

                headers: {

                    'Content-Type':
                        'application/json'

                },

                body: JSON.stringify(
                    tareaAsignada
                )

            }

        );

    return respuesta;

}

export async function eliminarTareaAsignada(idTarea) {

    const respuesta = await fetch(
        `${API_URL}/tareasAsignadas/${idTarea}`,
        {
            method: 'DELETE'
        }
    );

    if (!respuesta.ok) {

        throw new Error(
            'Error al eliminar tarea'
        );

    }

    return respuesta;

}

export async function eliminarTareasAsignadasPorUsuario(usuarioId) {

    const tareas =
        await obtenerTareasAsignadasPorUsuario(
            usuarioId
        );

    for (const tarea of tareas) {

        await eliminarTareaAsignada(
            tarea.id
        );

    }

}
// ============================================
// ACTUALIZAR TAREA ASIGNADA
// Ely
// ============================================

/**
 * Actualizar parcialmente una tarea asignada (por ejemplo, el estado)
 * * @param {string|number} idTarea 
 * @param {Object} datosActualizados 
 * @returns {Promise<Response>}
 */
export async function actualizarTareaAsignada(idTarea, datosActualizados) {
    const respuesta = await fetch(
        `${API_URL}/tareasAsignadas/${idTarea}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        }
    );

    if (!respuesta.ok) {
        throw new Error('Error al actualizar la tarea asignada');
    }

    return respuesta;
}
