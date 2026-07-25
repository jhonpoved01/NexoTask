import {
    obtenerTareasDisponibles,
    actualizarTareaDisponible,
    eliminarTareaDisponible,
    crearTareaDisponible
} from '../services/tareasDisponibles.service.js';
import { obtenerMensajeError } from '../utils/http.js';
import { mostrarError, limpiarError } from './formularios.ui.js';
import { solicitarConfirmacion } from './confirmaciones.ui.js';
import { notificarExito, notificarError, notificarInfo } from './notificaciones.ui.js';

const estado = {
    tareas: [],
    cargado: false,
    solicitud: 0,
    idEnEdicion: null,
    activador: null
};

export function configurarCatalogo() {
    document.getElementById('botonCrearTareaCatalogo').addEventListener('click', evento => {
        abrirPanelCrear(evento.currentTarget);
    });
    document.getElementById('panelBotonListo').addEventListener('click', guardarTarea);
    document.getElementById('panelBotonCancelar').addEventListener('click', cancelarPanel);
    document.getElementById('buscarTareaCatalogo').addEventListener('input', renderizarCatalogo);
    document.getElementById('panelTarea').addEventListener('keydown', evento => {
        if (evento.key === 'Escape') {
            evento.preventDefault();
            cancelarPanel();
        }
    });
}

export async function activarCatalogo() {
    if (!estado.cargado) {
        await cargarCatalogo();
    }
}

async function cargarCatalogo() {
    const vista = document.getElementById('vistaCatalogo');
    const solicitudActual = ++estado.solicitud;
    vista.setAttribute('aria-busy', 'true');

    try {
        const tareas = await obtenerTareasDisponibles();
        if (solicitudActual !== estado.solicitud) return;
        estado.tareas = tareas;
        estado.cargado = true;
        renderizarCatalogo();
    } catch (error) {
        console.error('Error al cargar catálogo:', error);
        notificarError(obtenerMensajeError(error, 'No se pudo cargar el catálogo.'));
    } finally {
        if (solicitudActual === estado.solicitud) {
            vista.removeAttribute('aria-busy');
        }
    }
}

function renderizarCatalogo() {
    const lista = document.getElementById('listaTareasDisponibles');
    const estadoVacio = document.getElementById('estadoVacioCatalogo');
    const tituloVacio = document.getElementById('tituloEstadoVacioCatalogo');
    const textoVacio = document.getElementById('textoEstadoVacioCatalogo');
    const cantidad = document.getElementById('cantidadTareasCatalogo');
    const consulta = document.getElementById('buscarTareaCatalogo').value.trim().toLowerCase();
    const visibles = estado.tareas.filter(tarea =>
        String(tarea.titulo ?? '').toLowerCase().includes(consulta)
    );

    lista.replaceChildren();
    cantidad.textContent = `${visibles.length} ${
        visibles.length === 1 ? 'tarea disponible' : 'tareas disponibles'
    }`;
    estadoVacio.classList.toggle('hidden', visibles.length !== 0);
    tituloVacio.textContent = estado.tareas.length === 0
        ? 'No hay tareas disponibles'
        : 'No hay coincidencias';
    textoVacio.textContent = estado.tareas.length === 0
        ? 'Crea la primera tarea para poder asignarla posteriormente.'
        : 'Prueba con otro texto de búsqueda.';

    const fragmento = document.createDocumentFragment();
    visibles.forEach(tarea => fragmento.appendChild(crearElementoCatalogo(tarea)));
    lista.appendChild(fragmento);
}

function crearElementoCatalogo(tarea) {
    const articulo = document.createElement('article');
    articulo.className = 'elemento-catalogo';

    const contenido = document.createElement('div');
    const titulo = document.createElement('h3');
    titulo.textContent = String(tarea.titulo ?? '');
    const descripcion = document.createElement('p');
    descripcion.textContent = String(tarea.descripcion ?? '');
    contenido.append(titulo, descripcion);

    const acciones = document.createElement('div');
    acciones.className = 'acciones-catalogo';

    const botonEditar = document.createElement('button');
    botonEditar.type = 'button';
    botonEditar.className = 'boton-secundario';
    botonEditar.textContent = 'Editar';
    botonEditar.setAttribute('aria-label', `Editar tarea disponible ${tarea.titulo}`);
    botonEditar.addEventListener('click', () => abrirPanelEditar(tarea, botonEditar));

    const masAcciones = document.createElement('details');
    masAcciones.className = 'menu-acciones-elemento';
    const resumen = document.createElement('summary');
    resumen.textContent = 'Más acciones';
    resumen.setAttribute('aria-label', `Más acciones para ${tarea.titulo}`);

    const botonEliminar = document.createElement('button');
    botonEliminar.type = 'button';
    botonEliminar.className = 'boton-eliminar';
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.setAttribute('aria-label', `Eliminar tarea disponible ${tarea.titulo}`);
    botonEliminar.addEventListener('click', () => eliminarTarea(tarea, botonEliminar));

    masAcciones.append(resumen, botonEliminar);
    acciones.append(botonEditar, masAcciones);
    articulo.append(contenido, acciones);
    return articulo;
}

function abrirPanelCrear(activador) {
    estado.idEnEdicion = null;
    estado.activador = activador;
    document.getElementById('tituloTareaSeleccionada').textContent = 'Crear tarea';
    document.getElementById('panelBotonListo').textContent = 'Crear tarea';
    document.getElementById('panelInputTitulo').value = '';
    document.getElementById('panelInputDescripcion').value = '';
    mostrarPanel();
}

function abrirPanelEditar(tarea, activador) {
    estado.idEnEdicion = String(tarea.id ?? '');
    estado.activador = activador;
    document.getElementById('tituloTareaSeleccionada').textContent = 'Editar tarea';
    document.getElementById('panelBotonListo').textContent = 'Guardar cambios';
    document.getElementById('panelInputTitulo').value = String(tarea.titulo ?? '');
    document.getElementById('panelInputDescripcion').value = String(tarea.descripcion ?? '');
    mostrarPanel();
}

function mostrarPanel() {
    limpiarErrores();
    document.getElementById('panelTarea').classList.remove('hidden');
    document.getElementById('panelInputTitulo').focus();
}

function cancelarPanel() {
    document.getElementById('panelTarea').classList.add('hidden');
    limpiarErrores();
    estado.idEnEdicion = null;
    notificarInfo('Edición del catálogo cancelada.');
    devolverFoco();
}

async function guardarTarea() {
    const panel = document.getElementById('panelTarea');
    const tituloCampo = document.getElementById('panelInputTitulo');
    const descripcionCampo = document.getElementById('panelInputDescripcion');
    const boton = document.getElementById('panelBotonListo');
    const titulo = tituloCampo.value.trim();
    const descripcion = descripcionCampo.value.trim();
    let primerInvalido = null;

    if (!titulo) {
        mostrarError(document.getElementById('errorPanelTitulo'), 'Escribe un título.', tituloCampo);
        primerInvalido = tituloCampo;
    } else {
        limpiarError(document.getElementById('errorPanelTitulo'), tituloCampo);
    }

    if (!descripcion) {
        mostrarError(
            document.getElementById('errorPanelDescripcion'),
            'Escribe una descripción.',
            descripcionCampo
        );
        primerInvalido ||= descripcionCampo;
    } else {
        limpiarError(document.getElementById('errorPanelDescripcion'), descripcionCampo);
    }

    if (primerInvalido) {
        primerInvalido.focus();
        return;
    }

    panel.setAttribute('aria-busy', 'true');
    boton.disabled = true;
    try {
        if (estado.idEnEdicion === null) {
            await crearTareaDisponible({ titulo, descripcion });
            notificarExito(`Se creó la tarea «${titulo}».`);
        } else {
            await actualizarTareaDisponible(estado.idEnEdicion, { titulo, descripcion });
            notificarExito(`Se actualizó la tarea «${titulo}».`);
        }

        panel.classList.add('hidden');
        estado.idEnEdicion = null;
        await cargarCatalogo();
        devolverFoco();
    } catch (error) {
        console.error('Error al guardar tarea del catálogo:', error);
        notificarError(obtenerMensajeError(error, 'No se pudo guardar la tarea.'));
    } finally {
        panel.removeAttribute('aria-busy');
        boton.disabled = false;
    }
}

async function eliminarTarea(tarea, activador) {
    const titulo = String(tarea.titulo ?? 'sin título');
    const confirmado = await solicitarConfirmacion({
        titulo: 'Eliminar tarea disponible',
        mensaje: `¿Eliminar la tarea disponible «${titulo}»? Las asignaciones existentes no se eliminarán.`,
        activador
    });
    if (!confirmado) return;

    activador.disabled = true;
    try {
        await eliminarTareaDisponible(tarea.id);
        notificarExito(`Se eliminó la tarea «${titulo}».`);
        await cargarCatalogo();
        document.getElementById('tituloVistaCatalogo').focus();
    } catch (error) {
        console.error('Error al eliminar tarea del catálogo:', error);
        notificarError(obtenerMensajeError(error, 'No se pudo eliminar la tarea.'));
        activador.disabled = false;
    }
}

function limpiarErrores() {
    limpiarError(
        document.getElementById('errorPanelTitulo'),
        document.getElementById('panelInputTitulo')
    );
    limpiarError(
        document.getElementById('errorPanelDescripcion'),
        document.getElementById('panelInputDescripcion')
    );
}

function devolverFoco() {
    if (estado.activador instanceof HTMLElement && estado.activador.isConnected) {
        estado.activador.focus();
    } else {
        document.getElementById('tituloVistaCatalogo').focus();
    }
    estado.activador = null;
}
