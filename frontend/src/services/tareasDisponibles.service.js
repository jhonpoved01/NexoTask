import { API_URL } from '../config/api.config.js';
import { asegurarLista, normalizarId, solicitarJson } from '../utils/http.js';

export async function obtenerTareasDisponibles() {
    const tareas = await solicitarJson(`${API_URL}/tareasDisponibles`);

    return asegurarLista(tareas, 'las tareas disponibles');
}

export async function crearTareaDisponible(tarea) {
    return solicitarJson(`${API_URL}/tareasDisponibles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tarea)
    });
}

export async function actualizarTareaDisponible(id, datos) {
    const idNormalizado = normalizarId(id, 'El ID de la tarea');

    return solicitarJson(`${API_URL}/tareasDisponibles/${encodeURIComponent(idNormalizado)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
}

export async function eliminarTareaDisponible(id) {
    const idNormalizado = normalizarId(id, 'El ID de la tarea');

    return solicitarJson(`${API_URL}/tareasDisponibles/${encodeURIComponent(idNormalizado)}`, {
        method: 'DELETE'
    });
}
