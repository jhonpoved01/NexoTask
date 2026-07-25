import { obtenerUsuarios } from '../services/usuarios.service.js';
import { obtenerTodasLasTareasAsignadas } from '../services/tareasAsignadas.service.js';
import { exportarJson } from '../utils/exportador.js';
import { obtenerMensajeError } from '../utils/http.js';
import { crearControladorTabla } from './tareasTabla.ui.js';
import {
    crearControladorFiltros,
    poblarFiltroUsuarios,
    poblarFiltroTareas
} from './filtros.ui.js';
import { notificarExito, notificarError } from './notificaciones.ui.js';

const estado = {
    solicitud: 0
};

let tabla;
let filtros;

export function configurarVistaGeneral() {
    tabla = crearControladorTabla({
        tablaId: 'generalTablaTareas',
        cuerpoId: 'generalCuerpoTabla',
        mensajeId: 'generalMensajeSinTareas',
        cantidadId: 'generalCantidadResultados',
        contadores: {
            total: 'generalContadorTotal',
            pendientes: 'generalContadorPendientes',
            enProgreso: 'generalContadorEnProgreso',
            completadas: 'generalContadorCompletadas'
        },
        mensajeVacio: 'No hay asignaciones registradas.'
    });

    filtros = crearControladorFiltros({
        ids: {
            usuario: 'generalFiltroUsuario',
            estado: 'generalFiltroEstado',
            tarea: 'generalFiltroTarea',
            orden: 'generalOrden',
            aplicar: 'botonAplicarFiltrosGeneral',
            limpiar: 'botonLimpiarFiltrosGeneral'
        },
        incluirUsuario: true,
        onAplicar: vista => tabla.aplicarVista(vista)
    });

    document.getElementById('botonExportarGeneral').addEventListener('click', exportarResultados);
}

export async function activarVistaGeneral() {
    const vista = document.getElementById('vistaGeneral');
    const solicitudActual = ++estado.solicitud;
    vista.setAttribute('aria-busy', 'true');

    try {
        const [tareas, usuarios] = await Promise.all([
            obtenerTodasLasTareasAsignadas(),
            obtenerUsuarios()
        ]);
        if (solicitudActual !== estado.solicitud) return;

        poblarFiltroUsuarios('generalFiltroUsuario', usuarios);
        poblarFiltroTareas('generalFiltroTarea', tareas);
        tabla.establecerDatos(tareas, filtros.obtenerValores());
    } catch (error) {
        console.error('Error al cargar vista general:', error);
        notificarError(obtenerMensajeError(error, 'No se pudo cargar la vista general.'));
    } finally {
        if (solicitudActual === estado.solicitud) {
            vista.removeAttribute('aria-busy');
        }
    }
}

function exportarResultados() {
    const visibles = tabla.obtenerVisibles();
    if (visibles.length === 0) {
        notificarError('No hay resultados globales visibles para exportar.');
        return;
    }

    exportarJson('asignaciones-globales-visibles.json', visibles);
    notificarExito(`${visibles.length} ${visibles.length === 1 ? 'resultado exportado' : 'resultados exportados'}.`);
}
