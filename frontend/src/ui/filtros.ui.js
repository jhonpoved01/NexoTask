export function crearControladorFiltros({
    ids,
    incluirUsuario = false,
    onAplicar,
    botonMostrarId = null,
    panelId = null,
    botonCerrarId = null
}) {
    const valoresIniciales = {
        usuarioId: '',
        estado: 'Todas',
        tareaId: '',
        orden: 'fecha'
    };

    document.getElementById(ids.aplicar).addEventListener('click', () => {
        onAplicar(obtenerValores());
    });

    document.getElementById(ids.limpiar).addEventListener('click', () => {
        establecerValores(valoresIniciales);
        onAplicar(obtenerValores());
    });

    if (botonMostrarId && panelId) {
        const botonMostrar = document.getElementById(botonMostrarId);
        const panel = document.getElementById(panelId);

        botonMostrar.addEventListener('click', () => {
            const mostrar = panel.classList.contains('hidden');
            establecerPanelVisible(mostrar);
            if (mostrar) panel.querySelector('select')?.focus();
        });

        document.getElementById(botonCerrarId)?.addEventListener('click', () => {
            establecerPanelVisible(false);
            botonMostrar.focus();
        });

        function establecerPanelVisible(visible) {
            panel.classList.toggle('hidden', !visible);
            botonMostrar.setAttribute('aria-expanded', String(visible));
            botonMostrar.textContent = visible ? 'Ocultar filtros' : 'Mostrar filtros';
        }
    }

    function obtenerValores() {
        return {
            filtros: {
                usuarioId: incluirUsuario
                    ? document.getElementById(ids.usuario).value
                    : '',
                estado: document.getElementById(ids.estado).value,
                tareaId: document.getElementById(ids.tarea).value
            },
            orden: document.getElementById(ids.orden).value
        };
    }

    function establecerValores(valores = valoresIniciales) {
        if (incluirUsuario && ids.usuario) {
            asignarSiExiste(ids.usuario, valores.usuarioId ?? '');
        }
        asignarSiExiste(ids.estado, valores.estado ?? 'Todas');
        asignarSiExiste(ids.tarea, valores.tareaId ?? '');
        asignarSiExiste(ids.orden, valores.orden ?? 'fecha');
    }

    return {
        obtenerValores,
        establecerValores
    };
}

export function poblarFiltroUsuarios(selectorId, usuarios) {
    const selector = document.getElementById(selectorId);
    const valorActual = selector.value;
    selector.replaceChildren(crearOpcion('', 'Todos los usuarios'));

    usuarios.forEach(usuario => {
        selector.appendChild(
            crearOpcion(String(usuario.id ?? ''), `${usuario.name} (${usuario.id})`)
        );
    });

    restaurarValor(selector, valorActual);
}

export function poblarFiltroTareas(selectorId, tareas) {
    const selector = document.getElementById(selectorId);
    const valorActual = selector.value;
    const unicas = new Map();

    tareas.forEach(tarea => {
        const id = String(tarea.tareaId ?? tarea.id ?? '').trim();
        const titulo = String(tarea.titulo ?? '').trim();
        if (id && !unicas.has(id)) unicas.set(id, titulo);
    });

    selector.replaceChildren(crearOpcion('', 'Todas las tareas'));
    unicas.forEach((titulo, id) => selector.appendChild(crearOpcion(id, titulo)));
    restaurarValor(selector, valorActual);
}

function crearOpcion(valor, texto) {
    const opcion = document.createElement('option');
    opcion.value = valor;
    opcion.textContent = texto;
    return opcion;
}

function restaurarValor(selector, valor) {
    selector.value = Array.from(selector.options).some(opcion => opcion.value === valor)
        ? valor
        : '';
}

function asignarSiExiste(id, valor) {
    const control = document.getElementById(id);
    if (!control) return;

    control.value = Array.from(control.options).some(opcion => opcion.value === valor)
        ? valor
        : control.options[0]?.value ?? '';
}
