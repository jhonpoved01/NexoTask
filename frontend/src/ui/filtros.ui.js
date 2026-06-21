import { obtenerUsuarios } from '../services/usuarios.service.js';
import { obtenerTodasLasTareasAsignadas } from '../services/tareasAsignadas.service.js';
import { notificarError, notificarInfo } from './notificaciones.ui.js';

export function configurarControlesTareas({ onChange, onCancel, onExport }) {
    const botonMostrarFiltros = document.getElementById('botonMostrarFiltros');
    const seccionControles = document.getElementById('seccionControlesTareas');
    const botonAplicar = document.getElementById('botonAplicarFiltro');
    const botonCancelar = document.getElementById('botonCancelarFiltro');
    const botonExportar = document.getElementById('botonExportarTareas');

    if (botonMostrarFiltros && seccionControles) {
        botonMostrarFiltros.addEventListener('click', () => {
            seccionControles.classList.toggle('hidden');
        });
    }

    recargarOpcionesFiltro();

    if (botonAplicar) {
        botonAplicar.addEventListener('click', async () => {
            await onChange(obtenerControlesTareas());
        });
    }

    if (botonCancelar) {
        botonCancelar.addEventListener('click', async () => {
            restablecerFiltros();
            seccionControles?.classList.add('hidden');
            if (typeof onCancel === 'function') {
                await onCancel(obtenerControlesTareas());
            } else {
                await onChange(obtenerControlesTareas());
            }
            notificarInfo('Filtros restablecidos.');
        });
    }

    if (botonExportar) {
        botonExportar.addEventListener('click', () => {
            onExport(obtenerControlesTareas());
        });
    }
}

export function obtenerControlesTareas() {
    return {
        filtros: {
            usuarioId: document.getElementById('filtroUsuario')?.value || '',
            estado: document.getElementById('filtroEstado')?.value || 'Todas',
            tareaId: document.getElementById('filtroTarea')?.value || ''
        },
        orden: document.getElementById('ordenTareas')?.value || 'fecha'
    };
}

export async function recargarOpcionesFiltro() {
    await Promise.all([
        cargarUsuariosFiltro(),
        cargarTareasFiltro()
    ]);
}

async function cargarUsuariosFiltro() {
    const selector = document.getElementById('filtroUsuario');

    if (!selector) {
        return;
    }

    try {
        const valorActual = selector.value;
        const usuarios = await obtenerUsuarios();

        selector.innerHTML = '<option value="">Todos los usuarios</option>';

        usuarios.forEach((usuario) => {
            const opcion = document.createElement('option');
            opcion.value = usuario.id;
            opcion.textContent = `${usuario.name} (${usuario.id})`;
            selector.appendChild(opcion);
        });

        selector.value = existeOpcion(selector, valorActual) ? valorActual : '';
    } catch (error) {
        console.error('Error al cargar usuarios para filtros:', error);
        notificarError('No se pudieron cargar usuarios.');
    }
}

async function cargarTareasFiltro() {
    const selector = document.getElementById('filtroTarea');

    if (!selector) {
        return;
    }

    try {
        const valorActual = selector.value;
        const tareas = await obtenerTodasLasTareasAsignadas();
        const tareasUnicas = new Map();

        tareas.forEach((tarea) => {
            const id = String(tarea.tareaId ?? '').trim();

            if (id && !tareasUnicas.has(id)) {
                tareasUnicas.set(id, tarea.titulo);
            }
        });

        selector.innerHTML = '<option value="">Todas las tareas</option>';

        tareasUnicas.forEach((titulo, id) => {
            const opcion = document.createElement('option');
            opcion.value = id;
            opcion.textContent = titulo;
            selector.appendChild(opcion);
        });

        selector.value = existeOpcion(selector, valorActual) ? valorActual : '';
    } catch (error) {
        console.error('Error al cargar tareas para filtros:', error);
        notificarError('No se pudieron cargar tareas.');
    }
}

function existeOpcion(selector, valor) {
    return Array.from(selector.options).some((opcion) => opcion.value === valor);
}

export function resetearControlesTareas() {
    restablecerFiltros();
}

function restablecerFiltros() {
    const filtroUsuario = document.getElementById('filtroUsuario');
    const filtroEstado = document.getElementById('filtroEstado');
    const filtroTarea = document.getElementById('filtroTarea');
    const ordenTareas = document.getElementById('ordenTareas');

    if (filtroUsuario) {
        filtroUsuario.value = '';
    }

    if (filtroEstado) {
        filtroEstado.value = 'Todas';
    }

    if (filtroTarea) {
        filtroTarea.value = '';
    }

    if (ordenTareas) {
        ordenTareas.value = 'fecha';
    }
}
