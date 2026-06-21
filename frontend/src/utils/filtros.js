export function filtrarTareas(tareas, filtros = {}) {
    const estado = normalizar(filtros.estado);
    const usuarioId = String(filtros.usuarioId ?? '').trim();
    const tareaId = String(filtros.tareaId ?? '').trim();

    return tareas.filter((tarea) => {
        const coincideEstado =
            !estado ||
            estado === 'todas' ||
            normalizar(tarea.estado) === estado;

        const coincideUsuario =
            !usuarioId ||
            String(tarea.usuarioId ?? '') === usuarioId;

        const coincideTarea =
            !tareaId ||
            String(tarea.tareaId ?? '') === tareaId;

        return coincideUsuario && coincideEstado && coincideTarea;
    });
}

function normalizar(valor) {
    return String(valor ?? '')
        .trim()
        .toLowerCase();
}
