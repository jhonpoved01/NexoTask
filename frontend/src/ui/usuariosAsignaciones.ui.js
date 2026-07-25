import { buscarUsuario, obtenerUsuarios } from '../services/usuarios.service.js';
import { obtenerTareasDisponibles } from '../services/tareasDisponibles.service.js';
import {
    obtenerTareasAsignadasPorUsuario,
    crearTareaAsignada,
    eliminarTareaAsignada,
    eliminarTareasAsignadasPorUsuario,
    actualizarTareaAsignada
} from '../services/tareasAsignadas.service.js';
import { exportarJson } from '../utils/exportador.js';
import { obtenerMensajeError } from '../utils/http.js';
import { crearControladorTabla } from './tareasTabla.ui.js';
import { crearControladorFiltros, poblarFiltroTareas } from './filtros.ui.js';
import { mostrarError, limpiarError } from './formularios.ui.js';
import { solicitarConfirmacion } from './confirmaciones.ui.js';
import { notificarExito, notificarError, notificarInfo } from './notificaciones.ui.js';

const estado = {
    usuario: null,
    tareas: [],
    tareasDisponibles: [],
    usuarios: [],
    solicitud: 0,
    activadorAsignacion: null,
    activadorEdicion: null,
    asignacionEnEdicion: null
};

let tabla;
let filtros;

export function configurarUsuariosAsignaciones() {
    tabla = crearControladorTabla({
        tablaId: 'usuarioTablaTareas',
        cuerpoId: 'usuarioCuerpoTabla',
        mensajeId: 'usuarioMensajeSinTareas',
        cantidadId: 'usuarioCantidadResultados',
        contadores: {
            total: 'usuarioContadorTotal',
            pendientes: 'usuarioContadorPendientes',
            enProgreso: 'usuarioContadorEnProgreso',
            completadas: 'usuarioContadorCompletadas'
        },
        mostrarAcciones: true,
        onEditar: abrirEdicion,
        onEliminar: eliminarAsignacion,
        mensajeVacio: 'Este usuario aún no tiene tareas asignadas.'
    });

    filtros = crearControladorFiltros({
        ids: {
            estado: 'usuarioFiltroEstado',
            tarea: 'usuarioFiltroTarea',
            orden: 'usuarioOrden',
            aplicar: 'botonAplicarFiltrosUsuario',
            limpiar: 'botonLimpiarFiltrosUsuario'
        },
        onAplicar: vista => tabla.aplicarVista(vista),
        botonMostrarId: 'botonMostrarFiltrosUsuario',
        panelId: 'filtrosUsuario',
        botonCerrarId: 'botonCerrarFiltrosUsuario'
    });

    document.getElementById('formularioBusquedaUsuario').addEventListener('submit', buscar);
    document.getElementById('botonCambiarUsuario').addEventListener('click', cambiarUsuario);
    document.getElementById('botonAbrirAsignacion').addEventListener('click', abrirAsignacion);
    document.getElementById('formularioTareas').addEventListener('submit', guardarAsignacion);
    document.getElementById('botonCancelarAsignacion').addEventListener('click', () => {
        document.getElementById('dialogoAsignarTarea').close('cancelar');
    });
    document.getElementById('dialogoAsignarTarea').addEventListener('close', cerrarAsignacion);
    document.getElementById('formularioEditarTarea').addEventListener('submit', guardarEdicion);
    document.getElementById('botonCancelarEdicion').addEventListener('click', () => {
        document.getElementById('dialogoEditarAsignacion').close('cancelar');
    });
    document.getElementById('dialogoEditarAsignacion').addEventListener('close', cerrarEdicion);
    document.getElementById('editarAsignadaTareaId').addEventListener('change', sincronizarTarea);
    document.getElementById('botonExportarUsuario').addEventListener('click', exportarResultados);
    document.getElementById('botonBorrarTareas').addEventListener('click', eliminarTodas);
}

export function activarUsuariosAsignaciones() {
    // El DOM y los controladores conservan el contexto durante la sesión.
}

async function buscar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const campo = document.getElementById('documentoUsuario');
    const errorCampo = document.getElementById('errorDocumentoUsuario');
    const boton = document.getElementById('botonBuscarUsuario');
    const documento = campo.value.trim();

    if (!documento) {
        mostrarError(errorCampo, 'Escribe el documento del usuario.', campo);
        campo.focus();
        return;
    }

    limpiarError(errorCampo, campo);
    formulario.setAttribute('aria-busy', 'true');
    boton.disabled = true;
    boton.textContent = 'Buscando…';

    try {
        const usuario = await buscarUsuario(documento);
        if (!usuario) {
            mostrarError(
                errorCampo,
                `No se encontró un usuario con el documento «${documento}».`,
                campo
            );
            campo.focus();
            return;
        }

        estado.usuario = usuario;
        mostrarUsuarioActivo();
        filtros.establecerValores();
        await cargarAsignacionesUsuario();
        notificarExito(`Usuario «${usuario.name}» cargado correctamente.`);
        document.getElementById('tituloUsuarioActivo').focus();
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        notificarError(obtenerMensajeError(error, 'No se pudo buscar el usuario.'));
        campo.focus();
    } finally {
        formulario.removeAttribute('aria-busy');
        boton.disabled = false;
        boton.textContent = 'Buscar usuario';
    }
}

function mostrarUsuarioActivo() {
    document.getElementById('nombreUsuario').textContent = String(estado.usuario.name ?? '');
    document.getElementById('documentoUsuarioActivo').textContent = String(estado.usuario.id ?? '');
    document.getElementById('correoUsuario').textContent = String(estado.usuario.email ?? '');
    document.getElementById('estadoUsuarioSinSeleccionar').classList.add('hidden');
    document.getElementById('estadoUsuarioSeleccionado').classList.remove('hidden');
}

function cambiarUsuario() {
    estado.solicitud += 1;
    estado.usuario = null;
    estado.tareas = [];
    document.getElementById('estadoUsuarioSeleccionado').classList.add('hidden');
    document.getElementById('estadoUsuarioSinSeleccionar').classList.remove('hidden');
    const campo = document.getElementById('documentoUsuario');
    campo.value = '';
    limpiarError(document.getElementById('errorDocumentoUsuario'), campo);
    campo.focus();
}

async function cargarAsignacionesUsuario() {
    if (!estado.usuario) return;
    const vista = document.getElementById('estadoUsuarioSeleccionado');
    const usuarioId = String(estado.usuario.id ?? '');
    const solicitudActual = ++estado.solicitud;
    vista.setAttribute('aria-busy', 'true');

    try {
        const tareas = await obtenerTareasAsignadasPorUsuario(usuarioId);
        if (
            solicitudActual !== estado.solicitud ||
            String(estado.usuario?.id ?? '') !== usuarioId
        ) return;

        estado.tareas = tareas;
        poblarFiltroTareas('usuarioFiltroTarea', tareas);
        tabla.establecerDatos(tareas, filtros.obtenerValores());
    } catch (error) {
        console.error('Error al cargar asignaciones del usuario:', error);
        notificarError(obtenerMensajeError(error, 'No se pudieron cargar las asignaciones.'));
    } finally {
        if (solicitudActual === estado.solicitud) {
            vista.removeAttribute('aria-busy');
        }
    }
}

async function abrirAsignacion(evento) {
    const dialogo = document.getElementById('dialogoAsignarTarea');
    const selector = document.getElementById('selectorTareas');
    estado.activadorAsignacion = evento.currentTarget;
    dialogo.setAttribute('aria-busy', 'true');

    try {
        estado.tareasDisponibles = await obtenerTareasDisponibles();
        selector.replaceChildren(crearOpcion('', 'Selecciona una tarea'));
        estado.tareasDisponibles.forEach(tarea => {
            selector.appendChild(crearOpcion(String(tarea.id ?? ''), String(tarea.titulo ?? '')));
        });
        limpiarError(document.getElementById('errorSelectorTareas'), selector);
        document.getElementById('estadoTarea').value = 'Pendiente';
        dialogo.returnValue = 'cancelar';
        dialogo.showModal();
        selector.focus();
    } catch (error) {
        console.error('Error al preparar asignación:', error);
        notificarError(obtenerMensajeError(error, 'No se pudo abrir el formulario de asignación.'));
        estado.activadorAsignacion?.focus();
    } finally {
        dialogo.removeAttribute('aria-busy');
    }
}

async function guardarAsignacion(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const selector = document.getElementById('selectorTareas');
    const estadoCampo = document.getElementById('estadoTarea');
    const boton = document.getElementById('botonAsignarTarea');
    let primerInvalido = null;

    if (!selector.value) {
        mostrarError(
            document.getElementById('errorSelectorTareas'),
            'Selecciona una tarea disponible.',
            selector
        );
        primerInvalido = selector;
    } else {
        limpiarError(document.getElementById('errorSelectorTareas'), selector);
    }

    if (!estadoCampo.value) {
        mostrarError(
            document.getElementById('errorEstadoTarea'),
            'Selecciona un estado.',
            estadoCampo
        );
        primerInvalido ||= estadoCampo;
    } else {
        limpiarError(document.getElementById('errorEstadoTarea'), estadoCampo);
    }

    if (primerInvalido) {
        primerInvalido.focus();
        return;
    }

    const tarea = estado.tareasDisponibles.find(
        item => String(item.id ?? '') === selector.value
    );
    if (!tarea || !estado.usuario) {
        notificarError('La tarea o el usuario activo ya no están disponibles.');
        return;
    }

    formulario.setAttribute('aria-busy', 'true');
    boton.disabled = true;
    boton.textContent = 'Asignando…';
    try {
        await crearTareaAsignada({
            usuarioId: estado.usuario.id,
            usuarioNombre: estado.usuario.name,
            tareaId: tarea.id,
            titulo: tarea.titulo,
            descripcion: tarea.descripcion,
            estado: estadoCampo.value,
            fechaAsignacion: new Date().toISOString()
        });
        await cargarAsignacionesUsuario();
        document.getElementById('dialogoAsignarTarea').close('guardado');
        notificarExito(`Se asignó la tarea «${tarea.titulo}».`);
    } catch (error) {
        console.error('Error al asignar tarea:', error);
        notificarError(obtenerMensajeError(error, 'No se pudo asignar la tarea.'));
    } finally {
        formulario.removeAttribute('aria-busy');
        boton.disabled = false;
        boton.textContent = 'Asignar tarea';
    }
}

function cerrarAsignacion() {
    const dialogo = document.getElementById('dialogoAsignarTarea');
    if (dialogo.returnValue !== 'guardado') {
        notificarInfo('Asignación cancelada.');
    }
    if (estado.activadorAsignacion?.isConnected) estado.activadorAsignacion.focus();
    estado.activadorAsignacion = null;
}

async function abrirEdicion(tarea, activador) {
    const dialogo = document.getElementById('dialogoEditarAsignacion');
    estado.activadorEdicion = activador;
    estado.asignacionEnEdicion = tarea;
    dialogo.setAttribute('aria-busy', 'true');

    try {
        [estado.tareasDisponibles, estado.usuarios] = await Promise.all([
            obtenerTareasDisponibles(),
            obtenerUsuarios()
        ]);
        poblarSelectoresEdicion(tarea);
        limpiarErroresEdicion();
        dialogo.returnValue = 'cancelar';
        dialogo.showModal();
        document.getElementById('editarAsignadaTitulo').focus();
    } catch (error) {
        console.error('Error al preparar edición:', error);
        notificarError(obtenerMensajeError(error, 'No se pudo abrir la edición.'));
        estado.activadorEdicion?.focus();
    } finally {
        dialogo.removeAttribute('aria-busy');
    }
}

function poblarSelectoresEdicion(tarea) {
    document.getElementById('editarAsignadaId').value = String(tarea.id ?? '');
    const selectorTarea = document.getElementById('editarAsignadaTareaId');
    selectorTarea.replaceChildren();
    estado.tareasDisponibles.forEach(item => {
        selectorTarea.appendChild(crearOpcion(String(item.id ?? ''), String(item.titulo ?? '')));
    });
    asegurarOpcion(selectorTarea, tarea.tareaId, `${tarea.titulo} (ya no disponible)`);
    selectorTarea.value = String(tarea.tareaId ?? '');

    document.getElementById('editarAsignadaTitulo').value = String(tarea.titulo ?? '');
    document.getElementById('editarAsignadaDescripcion').value = String(tarea.descripcion ?? '');
    document.getElementById('editarAsignadaEstado').value = String(tarea.estado ?? 'Pendiente');

    const selectorUsuario = document.getElementById('editarAsignadaUsuarioId');
    selectorUsuario.replaceChildren();
    estado.usuarios.forEach(usuario => {
        selectorUsuario.appendChild(crearOpcion(String(usuario.id ?? ''), String(usuario.name ?? '')));
    });
    asegurarOpcion(selectorUsuario, tarea.usuarioId, `${tarea.usuarioNombre} (usuario actual)`);
    selectorUsuario.value = String(tarea.usuarioId ?? '');
}

function sincronizarTarea(evento) {
    const tarea = estado.tareasDisponibles.find(
        item => String(item.id ?? '') === evento.currentTarget.value
    );
    if (!tarea) return;
    document.getElementById('editarAsignadaTitulo').value = String(tarea.titulo ?? '');
    document.getElementById('editarAsignadaDescripcion').value = String(tarea.descripcion ?? '');
}

async function guardarEdicion(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const tituloCampo = document.getElementById('editarAsignadaTitulo');
    const descripcionCampo = document.getElementById('editarAsignadaDescripcion');
    const titulo = tituloCampo.value.trim();
    const descripcion = descripcionCampo.value.trim();
    const boton = document.getElementById('botonGuardarEdicion');
    let primerInvalido = null;

    if (!titulo) {
        mostrarError(document.getElementById('errorEditarTitulo'), 'Escribe un título.', tituloCampo);
        primerInvalido = tituloCampo;
    } else {
        limpiarError(document.getElementById('errorEditarTitulo'), tituloCampo);
    }
    if (!descripcion) {
        mostrarError(
            document.getElementById('errorEditarDescripcion'),
            'Escribe una descripción.',
            descripcionCampo
        );
        primerInvalido ||= descripcionCampo;
    } else {
        limpiarError(document.getElementById('errorEditarDescripcion'), descripcionCampo);
    }
    if (primerInvalido) {
        primerInvalido.focus();
        return;
    }

    const usuarioId = document.getElementById('editarAsignadaUsuarioId').value;
    const usuario = estado.usuarios.find(item => String(item.id ?? '') === usuarioId);
    const nombreUsuario = usuario?.name ?? (
        String(estado.asignacionEnEdicion?.usuarioId ?? '') === usuarioId
            ? estado.asignacionEnEdicion?.usuarioNombre
            : ''
    );

    formulario.setAttribute('aria-busy', 'true');
    boton.disabled = true;
    try {
        await actualizarTareaAsignada(document.getElementById('editarAsignadaId').value, {
            tareaId: document.getElementById('editarAsignadaTareaId').value,
            titulo,
            descripcion,
            estado: document.getElementById('editarAsignadaEstado').value,
            usuarioId,
            usuarioNombre: nombreUsuario
        });
        await cargarAsignacionesUsuario();
        document.getElementById('dialogoEditarAsignacion').close('guardado');
        notificarExito(`Se actualizó la asignación «${titulo}».`);
    } catch (error) {
        console.error('Error al actualizar asignación:', error);
        notificarError(obtenerMensajeError(error, 'No se pudo actualizar la asignación.'));
    } finally {
        formulario.removeAttribute('aria-busy');
        boton.disabled = false;
    }
}

function cerrarEdicion() {
    const dialogo = document.getElementById('dialogoEditarAsignacion');
    if (dialogo.returnValue !== 'guardado') notificarInfo('Edición cancelada.');
    if (estado.activadorEdicion?.isConnected) {
        estado.activadorEdicion.focus();
    } else {
        document.getElementById('tituloAsignacionesUsuario').focus();
    }
    estado.activadorEdicion = null;
    estado.asignacionEnEdicion = null;
}

async function eliminarAsignacion(tarea, activador) {
    const titulo = String(tarea.titulo ?? 'sin título');
    const usuario = String(tarea.usuarioNombre ?? estado.usuario?.name ?? 'usuario sin nombre');
    const confirmado = await solicitarConfirmacion({
        titulo: 'Eliminar asignación',
        mensaje: `¿Eliminar la asignación «${titulo}» de «${usuario}»?`,
        activador
    });
    if (!confirmado) return;

    activador.disabled = true;
    try {
        await eliminarTareaAsignada(tarea.id);
        await cargarAsignacionesUsuario();
        notificarExito(`Se eliminó la asignación «${titulo}».`);
        document.getElementById('tituloAsignacionesUsuario').focus();
    } catch (error) {
        console.error('Error al eliminar asignación:', error);
        notificarError(obtenerMensajeError(error, 'No se pudo eliminar la asignación.'));
        activador.disabled = false;
    }
}

async function eliminarTodas(evento) {
    if (!estado.usuario) return;
    const activador = evento.currentTarget;
    const nombre = String(estado.usuario.name ?? 'usuario sin nombre');
    const confirmado = await solicitarConfirmacion({
        titulo: 'Eliminar todas las asignaciones',
        mensaje: `¿Eliminar todas las asignaciones de «${nombre}»?`,
        textoConfirmar: 'Eliminar todas',
        activador
    });
    if (!confirmado) return;

    activador.disabled = true;
    try {
        await eliminarTareasAsignadasPorUsuario(estado.usuario.id);
        await cargarAsignacionesUsuario();
        notificarExito(`Se eliminaron todas las asignaciones de «${nombre}».`);
    } catch (error) {
        console.error('Error al eliminar asignaciones:', error);
        notificarError(obtenerMensajeError(error, 'No se pudieron eliminar las asignaciones.'));
    } finally {
        activador.disabled = false;
    }
}

function exportarResultados() {
    const visibles = tabla.obtenerVisibles();
    if (visibles.length === 0) {
        notificarError('No hay resultados visibles para exportar.');
        return;
    }
    exportarJson('asignaciones-usuario-visibles.json', visibles);
    notificarExito(`${visibles.length} ${visibles.length === 1 ? 'resultado exportado' : 'resultados exportados'}.`);
}

function limpiarErroresEdicion() {
    limpiarError(
        document.getElementById('errorEditarTitulo'),
        document.getElementById('editarAsignadaTitulo')
    );
    limpiarError(
        document.getElementById('errorEditarDescripcion'),
        document.getElementById('editarAsignadaDescripcion')
    );
}

function crearOpcion(valor, texto) {
    const opcion = document.createElement('option');
    opcion.value = valor;
    opcion.textContent = texto;
    return opcion;
}

function asegurarOpcion(selector, valor, texto) {
    const id = String(valor ?? '');
    if (!Array.from(selector.options).some(opcion => opcion.value === id)) {
        selector.appendChild(crearOpcion(id, String(texto ?? 'Opción actual')));
    }
}
