import { API_URL } from '../config/api.config.js';
import { asegurarLista, normalizarId, solicitarJson } from '../utils/http.js';

export async function obtenerTodasLasTareasAsignadas() {
    const tareas = await solicitarJson(`${API_URL}/tareasAsignadas`);

    return asegurarLista(tareas, 'las tareas asignadas');
}

export async function obtenerTareasAsignadasPorUsuario(usuarioId) {
    const idNormalizado = normalizarId(usuarioId, 'El ID del usuario');
    const tareas = await solicitarJson(
        `${API_URL}/tareasAsignadas?usuarioId=${encodeURIComponent(idNormalizado)}`
    );

    return asegurarLista(tareas, 'las tareas asignadas');
}

export async function crearTareaAsignada(tareaAsignada) {
    return solicitarJson(`${API_URL}/tareasAsignadas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tareaAsignada)
    });
}

export async function eliminarTareaAsignada(idTarea) {
    const idNormalizado = normalizarId(idTarea, 'El ID de la asignación');

    return solicitarJson(
        `${API_URL}/tareasAsignadas/${encodeURIComponent(idNormalizado)}`,
        { method: 'DELETE' }
    );
}

export async function eliminarTareasAsignadasPorUsuario(usuarioId) {
    const tareas = await obtenerTareasAsignadasPorUsuario(usuarioId);

    for (const tarea of tareas) {
        await eliminarTareaAsignada(tarea.id);
    }
}

export async function actualizarTareaAsignada(idTarea, datosActualizados) {
    const idNormalizado = normalizarId(idTarea, 'El ID de la asignación');

    return solicitarJson(
        `${API_URL}/tareasAsignadas/${encodeURIComponent(idNormalizado)}`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        }
    );
}
