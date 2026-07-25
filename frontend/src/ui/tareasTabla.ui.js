import { filtrarTareas } from '../utils/filtros.js';
import { ordenarTareas } from '../utils/ordenamiento.js';

export function crearControladorTabla({
    tablaId,
    cuerpoId,
    mensajeId,
    cantidadId,
    contadores,
    mostrarAcciones = false,
    onEditar = null,
    onEliminar = null,
    mensajeVacio = 'No hay asignaciones registradas.'
}) {
    let tareasBase = [];
    let tareasVisibles = [];
    let vista = {
        filtros: {},
        orden: 'fecha'
    };

    function establecerDatos(tareas, opciones = vista) {
        tareasBase = Array.isArray(tareas) ? [...tareas] : [];
        aplicarVista(opciones);
    }

    function aplicarVista(opciones = {}) {
        vista = {
            filtros: { ...(opciones.filtros || {}) },
            orden: opciones.orden || 'fecha'
        };

        tareasVisibles = ordenarTareas(
            filtrarTareas(tareasBase, vista.filtros),
            vista.orden
        );

        renderizar();
    }

    function renderizar() {
        const tabla = document.getElementById(tablaId);
        const cuerpo = document.getElementById(cuerpoId);
        const mensaje = document.getElementById(mensajeId);
        const cantidad = document.getElementById(cantidadId);
        cuerpo.replaceChildren();

        actualizarResumen(tareasVisibles, contadores);
        cantidad.textContent = `${tareasVisibles.length} ${
            tareasVisibles.length === 1 ? 'resultado visible' : 'resultados visibles'
        }`;

        if (tareasVisibles.length === 0) {
            tabla.classList.add('hidden');
            mensaje.textContent = hayFiltrosActivos(vista.filtros)
                ? 'No se encontraron asignaciones con los filtros seleccionados.'
                : mensajeVacio;
            mensaje.classList.remove('hidden');
            return;
        }

        tabla.classList.remove('hidden');
        mensaje.classList.add('hidden');

        const fragmento = document.createDocumentFragment();
        tareasVisibles.forEach(tarea => fragmento.appendChild(crearFila(tarea)));
        cuerpo.appendChild(fragmento);
    }

    function crearFila(tarea) {
        const fila = document.createElement('tr');
        fila.appendChild(crearCeldaTexto(tarea.titulo));
        fila.appendChild(crearCeldaTexto(tarea.descripcion));

        const celdaEstado = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `badge-estado ${obtenerClaseEstado(tarea.estado)}`;
        badge.textContent = String(tarea.estado ?? '');
        celdaEstado.appendChild(badge);
        fila.appendChild(celdaEstado);

        const fecha = new Date(tarea.fechaAsignacion);
        fila.appendChild(crearCeldaTexto(
            Number.isNaN(fecha.getTime()) ? 'Fecha no disponible' : fecha.toLocaleDateString('es-CO')
        ));
        fila.appendChild(crearCeldaTexto(tarea.usuarioNombre));

        if (mostrarAcciones) {
            fila.appendChild(crearCeldaAcciones(tarea));
        }

        return fila;
    }

    function crearCeldaAcciones(tarea) {
        const celda = document.createElement('td');
        celda.className = 'acciones-tabla';
        const titulo = String(tarea.titulo ?? 'sin título');

        const botonEditar = document.createElement('button');
        botonEditar.type = 'button';
        botonEditar.className = 'boton-editar-asignada';
        botonEditar.textContent = 'Editar';
        botonEditar.setAttribute('aria-label', `Editar asignación ${titulo}`);
        botonEditar.addEventListener('click', () => onEditar?.(tarea, botonEditar));

        const botonEliminar = document.createElement('button');
        botonEliminar.type = 'button';
        botonEliminar.className = 'boton-eliminar';
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.setAttribute('aria-label', `Eliminar asignación ${titulo}`);
        botonEliminar.addEventListener('click', () => onEliminar?.(tarea, botonEliminar));

        celda.append(botonEditar, botonEliminar);
        return celda;
    }

    return {
        establecerDatos,
        aplicarVista,
        obtenerVisibles: () => [...tareasVisibles],
        obtenerVista: () => ({
            filtros: { ...vista.filtros },
            orden: vista.orden
        })
    };
}

function actualizarResumen(tareas, ids) {
    const resumen = tareas.reduce((acumulador, tarea) => {
        const estado = String(tarea.estado ?? '').trim().toLowerCase();
        acumulador.total += 1;
        if (estado === 'pendiente') acumulador.pendientes += 1;
        if (estado === 'en progreso') acumulador.enProgreso += 1;
        if (estado === 'completada') acumulador.completadas += 1;
        return acumulador;
    }, { total: 0, pendientes: 0, enProgreso: 0, completadas: 0 });

    const valores = {
        [ids.total]: resumen.total,
        [ids.pendientes]: resumen.pendientes,
        [ids.enProgreso]: resumen.enProgreso,
        [ids.completadas]: resumen.completadas
    };

    Object.entries(valores).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = String(valor);
    });
}

function crearCeldaTexto(valor) {
    const celda = document.createElement('td');
    celda.textContent = String(valor ?? '');
    return celda;
}

function obtenerClaseEstado(estado = '') {
    const clases = {
        pendiente: 'badge-pendiente',
        'en progreso': 'badge-en-progreso',
        completada: 'badge-completada'
    };
    return clases[String(estado).trim().toLowerCase()] || 'badge-neutro';
}

function hayFiltrosActivos(filtros = {}) {
    return Object.values(filtros).some(valor => valor !== '' && valor !== 'Todas');
}
