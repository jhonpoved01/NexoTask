// ============================================
// IMPORTACIONES
// ============================================
import {
    buscarUsuario,
} from './services/usuarios.service.js';

// ============================================
import {
    mostrarDatosUsuario,
    cargarTareasDisponibles,
    cargarTareasUsuario,
    registrarTarea,
    borrarTodasLasTareas,
    configurarEdicionTareaAsignada,
    cerrarPanel,
    abrirPanelEditar,
    abrirPanelAgregar

} from './ui/tareas.ui.js';

// ============================================
import {

    mostrarError,
    limpiarError,
    validarCampoVacio

} from './ui/formularios.ui.js';

// ============================================

import {
    crearTareaDisponible,
} from './services/tareasDisponibles.service.js';

import {
    obtenerTodasLasTareasAsignadas
} from './services/tareasAsignadas.service.js';

// ============================================
import { 
    notificarExito, notificarError 
} from './ui/notificaciones.ui.js';

import {
    configurarControlesTareas,
    obtenerControlesTareas
} from './ui/filtros.ui.js';

import {
    aplicarVistaTareas,
    obtenerTareasVisibles,
    renderizarVistaFiltrada
} from './ui/tareasTabla.ui.js';

import {
    exportarJson
} from './utils/exportador.js';


// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Esperar a que el DOM cargue
 */
document.addEventListener(

    'DOMContentLoaded',

    function () {

        console.log(
            '✅ DOM completamente cargado'
        );

        console.log(
            '📝 Sistema de asignación de tareas iniciado');

        /*
            Configurar eventos
        */
        configurarEventos();
        configurarDropdown();
        configurarControlesTareas({
            onChange: manejarAplicacionFiltros,
            onCancel: manejarCancelacionFiltros,
            onExport: manejarExportacionTareas
        });

    }

);


// ============================================
// CONFIGURAR EVENTOS
// ============================================

/**
 * Configurar todos los eventos
 */
function configurarEventos() {

    /*
        Buscar usuario
    */
    document
        .getElementById(
            'formularioBusquedaUsuario'
        )
        .addEventListener(
            'submit',
            manejarBusquedaUsuario
        );

    /*
        Registrar tarea
    */
    document
        .getElementById(
            'formularioTareas'
        )
        .addEventListener(
            'submit',
            async function (evento) {

                evento.preventDefault();

                console.log(
                    '🚀 FORMULARIO DETECTADO');


                await manejarRegistroTarea(evento);

            }
        );

    /*
        Borrar tareas
    */
    document
        .getElementById(
            'botonBorrarTareas'
        )
        .addEventListener(
            'click',
            async function () {

                await borrarTodasLasTareas();

            }
        );

    /*
        Edición de tarea asignada
    */
    configurarEdicionTareaAsignada();
}


// ============================================
// BUSCAR USUARIO
// ============================================

/**
 * Manejar búsqueda usuario
 * 
 * @param {Event} evento
 */
async function manejarBusquedaUsuario(evento) {

    /*
        Evitar recarga
    */
    evento.preventDefault();

    /*
        Obtener documento
    */
    const documentoUsuario =
        document.getElementById(
            'documentoUsuario'
        ).value.trim();

    /*
        Obtener elemento error
    */
    const elementoError =
        document.getElementById(
            'errorDocumentoUsuario'
        );

    /*
        Validar campo
    */
    if (
        !validarCampoVacio(
            documentoUsuario
        )
    ) {

        mostrarError(
            elementoError,
            'El documento es obligatorio'
        );

        return;

    }

    /*
        Limpiar error
    */
    limpiarError(
        elementoError
    );

    /*
        Buscar usuario
    */
    const usuario =
        await buscarUsuario(
            documentoUsuario
        );

    /*
        Verificar usuario
    */
    if (!usuario) {

        mostrarError(
            elementoError,
            'Usuario no encontrado'
        );

        // Agregar notificación de error
        notificarError('No se encontró ningún usuario con ese documento.');

        return;

    }

    /*
        Mostrar usuario
    */
    mostrarDatosUsuario(
        usuario
    );
    // Agregar notificación de éxito
    notificarExito(`Usuario "${usuario.name}" cargado correctamente.`);
}


// ============================================
// REGISTRAR TAREA
// ============================================

/**
 * Manejar registro tarea
 * 
 * @param {Event} evento
 */
async function manejarRegistroTarea(evento) {

    /*
        Evitar recarga
    */
    evento.preventDefault();

    /*
        Obtener valores
    */
    const idTarea =
        document.getElementById(
            'selectorTareas'
        ).value;

    const estado =
        document.getElementById(
            'estadoTarea'
        ).value;

    /*
        Elementos error
    */
    const errorTarea =
        document.getElementById(
            'errorSelectorTareas'
        );

    const errorEstado =
        document.getElementById(
            'errorEstadoTarea'
        );

    /*
        Variable validación
    */
    let formularioValido = true;

    /*
        Validar tarea
    */
    if (
        !validarCampoVacio(
            idTarea
        )
    ) {

        mostrarError(
            errorTarea,
            'Selecciona una tarea'
        );

        formularioValido = false;

    } else {

        limpiarError(
            errorTarea
        );

    }

    /*
        Validar estado
    */
    if (
        !validarCampoVacio(
            estado
        )
    ) {

        mostrarError(
            errorEstado,
            'Selecciona un estado'
        );

        formularioValido = false;

    } else {

        limpiarError(
            errorEstado
        );

    }

    /*
        Verificar validación
    */
    if (!formularioValido) {

        return;

    }

    /*
        Registrar tarea
    */
    const tareaAsignada = await registrarTarea({

        idTarea,
        estado

    });

    if (!tareaAsignada) {
        notificarError(
            'No se pudo asignar la tarea.'
        );

        return;
    }

    /*
        Reiniciar formulario
    */
    document
        .getElementById(
            'formularioTareas'
        )
        .reset();

    /*
        Mensaje
    */
    console.log(
        '✅ Tarea asignada correctamente'
    );

    notificarExito(
        'Tarea asignada correctamente.'
    );

    return false;

}

function manejarExportacionTareas() {
    aplicarVistaTareas(
        obtenerControlesTareas()
    );

    const tareasVisibles = obtenerTareasVisibles();

    if (tareasVisibles.length === 0) {
        notificarError(
            'No hay tareas para exportar.'
        );

        return;
    }

    exportarJson(
        'tareas-visibles.json',
        tareasVisibles
    );

    notificarExito(
        'Tareas visibles exportadas correctamente.'
    );
}

async function manejarAplicacionFiltros(vista) {
    try {
        const tareasGlobales = await obtenerTodasLasTareasAsignadas();

        renderizarVistaFiltrada(
            tareasGlobales,
            vista,
            () => manejarAplicacionFiltros(vista)
        );
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        notificarError('No se pudieron aplicar los filtros.');
    }
}

async function manejarCancelacionFiltros() {
    await cargarTareasUsuario();
}

// DROPDOWN PERSONALIZADO
async function configurarDropdown() {
    const cabecera = document.getElementById('dropdownCabecera');
    const lista    = document.getElementById('listaTareasDisponibles');

    if (!cabecera || !lista) {
        return;
    }

    cabecera.addEventListener('click', function (e) {
        e.stopPropagation();
        lista.classList.toggle('abierto');
    });

    document.addEventListener('click', function () {
        lista.classList.remove('abierto');
    });

    lista.addEventListener('click', function (e) {
        e.stopPropagation();
    });
}
// BOTON AGREGAR TAREAS

const boton = document.getElementById('panelBotonAgregarTarea');
if (boton) {
    boton.addEventListener('click', () => {
        abrirPanelAgregar();
    });
}
