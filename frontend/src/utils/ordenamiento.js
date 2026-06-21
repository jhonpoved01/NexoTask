const ORDENADORES = {
    fecha: (a, b) =>
        new Date(b.fechaAsignacion || 0) - new Date(a.fechaAsignacion || 0),

    nombre: (a, b) =>
        String(a.usuarioNombre || '')
            .localeCompare(String(b.usuarioNombre || ''), 'es'),

    estado: (a, b) =>
        String(a.estado || '')
            .localeCompare(String(b.estado || ''), 'es')
};

export function ordenarTareas(tareas, criterio = 'fecha') {
    const ordenar = ORDENADORES[criterio] || ORDENADORES.fecha;

    return [...tareas].sort(ordenar);
}
