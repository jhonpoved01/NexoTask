
import { renderizarTareas, resetearVistaTareas } from './tareasTabla.ui.js';
import { recargarOpcionesFiltro, resetearControlesTareas } from './filtros.ui.js';
import { notificarExito, notificarError, notificarInfo } from './notificaciones.ui.js';
import {
    obtenerTareasDisponibles,
    actualizarTareaDisponible,
    eliminarTareaDisponible,
    crearTareaDisponible
} from '../services/tareasDisponibles.service.js';
import {
    obtenerTodasLasTareasAsignadas,
    obtenerTareasAsignadasPorUsuario,
    crearTareaAsignada,
    eliminarTareasAsignadasPorUsuario,
    actualizarTareaAsignada
    
} from '../services/tareasAsignadas.service.js';
import {
    obtenerUsuarios
} from '../services/usuarios.service.js';

let usuarioActual = null;
let dropdownsEdicionConfigurados = false;

// ============================================
// MOSTRAR DATOS USUARIO
// ============================================

/**
 * Mostrar datos del usuario
 * 
 * @param {Object} usuario
 */
export function mostrarDatosUsuario(usuario) {

    /*
        Guardar usuario actual
    */
    usuarioActual = usuario;

    /*
        Mostrar datos
    */
    document.getElementById(
        'nombreUsuario'
    ).textContent = usuario.name;

    document.getElementById(
        'correoUsuario'
    ).textContent = usuario.email;

    /*
        Mostrar secciones
    */
    document.getElementById(
        'seccionDatosUsuario'
    ).classList.remove('hidden');

    document.getElementById(
        'seccionFormularioTareas'
    ).classList.remove('hidden');

    document.getElementById(
        'botonBorrarTareas'
    ).classList.remove('hidden');

    document.getElementById(
        'botonMostrarFiltros'
    )?.classList.remove('hidden');

    document.getElementById(
        'botonExportarTareas'
    )?.classList.remove('hidden');

    /*
        Cargar tareas disponibles
    */
    cargarTareasDisponibles();

    /*
        Cargar tareas del usuario
    */
    cargarTareasUsuario(
        usuario.id
    );

}


// ============================================
// CARGAR TAREAS DISPONIBLES
// ============================================
let tareaEnEdicion = null;

export async function abrirPanelAgregar() {
    tareaEnEdicion = null;
    document.getElementById('tituloTareaSeleccionada').textContent = 'Agregar tarea';
    document.getElementById('panelInputTitulo').value = '';
    document.getElementById('panelInputDescripcion').value = '';
    document.getElementById('panelTarea').classList.remove('hidden');

}

export async function abrirPanelEditar(id, titulo) {
    tareaEnEdicion = id;
    document.getElementById('tituloTareaSeleccionada').textContent = 'Editar tarea';
    document.getElementById('panelInputTitulo').value = titulo;
    document.getElementById('panelInputDescripcion').value = '';
    document.getElementById('panelTarea').classList.remove('hidden');
}

export async function cerrarPanel(informarCancelacion = true) {
    tareaEnEdicion = null;
    document.getElementById('panelTarea').classList.add('hidden');
    document.getElementById('panelInputTitulo').value = '';
    document.getElementById('panelInputDescripcion').value = '';

    if (informarCancelacion) {
        notificarInfo('Registro de tarea cancelado.');
    }
}

export async function cargarTareasDisponibles() {
    try {
        const tareas = await obtenerTareasDisponibles();

        const lista = document.getElementById('listaTareasDisponibles');
        lista.innerHTML = '';

        const selector = document.getElementById('selectorTareas');
        selector.innerHTML = '<option value="">-- Selecciona una tarea --</option>';

        tareas.forEach(tarea => {
            const opcion = document.createElement('option');
            opcion.value = tarea.id;
            opcion.textContent = tarea.titulo;
            selector.appendChild(opcion);

            const fila = document.createElement('div');
            fila.classList.add('dropdown-item');

            const titulo = document.createElement('span');
            titulo.classList.add('dropdown-item-titulo');
            titulo.textContent = tarea.titulo;

            const acciones = document.createElement('span');
            acciones.classList.add('dropdown-item-acciones');

            const botonEditar = document.createElement('span');
            botonEditar.classList.add('accion-editar');
            botonEditar.dataset.id = tarea.id;
            botonEditar.dataset.titulo = tarea.titulo;
            botonEditar.textContent = 'Editar ✏️';

            const botonEliminar = document.createElement('span');
            botonEliminar.classList.add('accion-eliminar');
            botonEliminar.dataset.id = tarea.id;
            botonEliminar.textContent = 'Eliminar 🗑️';

            acciones.appendChild(botonEditar);
            acciones.appendChild(botonEliminar);
            fila.appendChild(titulo);
            fila.appendChild(acciones);

            // Seleccionar tarea al hacer clic en el título
            titulo.addEventListener('click', function () {
                document.getElementById('selectorTareas').value = tarea.id;
                document.getElementById('dropdownTexto').textContent = tarea.titulo;
                document.getElementById('listaTareasDisponibles').classList.remove('abierto');
            });

            botonEditar.addEventListener('click', function (e) {
                e.stopPropagation();
                abrirPanelEditar(this.dataset.id, this.dataset.titulo);
            });

            // Eliminar (sin confirmar)
            botonEliminar.addEventListener('click', async function (e) {
                e.stopPropagation();
                try {
                    const id = this.dataset.id;
                    const respuesta = await eliminarTareaDisponible(id);

                    if (!respuesta.ok) {
                        throw new Error('Error al eliminar tarea disponible');
                    }

                    if (document.getElementById('selectorTareas').value === id) {
                        document.getElementById('selectorTareas').value = '';
                        document.getElementById('dropdownTexto').textContent = '-- Selecciona una tarea --';
                    }

                    await cargarTareasDisponibles();
                    notificarExito('Tarea disponible eliminada correctamente.');
                } catch (error) {
                    console.error('Error al eliminar tarea disponible:', error);
                    notificarError('No se pudo eliminar la tarea disponible.');
                }
            });

            lista.appendChild(fila);
        });

        
        document.getElementById('panelBotonListo').onclick = async function () {
            const titulo = document.getElementById('panelInputTitulo').value.trim();
            const descripcion = document.getElementById('panelInputDescripcion').value.trim();

            if (!titulo) {
                document.getElementById('panelInputTitulo').focus();
                return;
            }

            try {
                if (tareaEnEdicion) {
                    // Modo EDITAR
                    await actualizarTareaDisponible(Number(tareaEnEdicion), { titulo, descripcion });
                    if (document.getElementById('selectorTareas').value === tareaEnEdicion) {
                        document.getElementById('dropdownTexto').textContent = titulo;
                    }
                    notificarExito('Tarea disponible actualizada correctamente.');
                } else {
                    // Modo AGREGAR
                    const respuesta = await crearTareaDisponible({ titulo, descripcion });

                    if (!respuesta.ok) {
                        throw new Error('Error al registrar tarea disponible');
                    }

                    notificarExito('Tarea disponible registrada correctamente.');
                }

                cerrarPanel(false);
                await cargarTareasDisponibles();
            } catch (error) {
                console.error('Error al registrar tarea disponible:', error);
                notificarError('No se pudo registrar la tarea disponible.');
            }
        };
        
        
        // Conectar botón Cancelar
        document.getElementById('panelBotonCancelar').onclick = () => cerrarPanel(true);

       } catch (error) {
           console.error('Error al cargar tareas:', error);
           notificarError('No se pudieron cargar las tareas disponibles.');
    }
}

// ============================================
// CARGAR TAREAS ASIGNADAS
// ============================================

/**
 * Cargar todas las tareas asignadas
 */
export async function cargarTareasAsignadas() {

    try {

        /*
            Petición
        */
        /*
            Convertir respuesta
        */
        const tareas =
            await obtenerTodasLasTareasAsignadas();

        console.log(
            'Tareas encontradas:',
            tareas
        );

        /*
            Renderizar tabla
        */
        renderizarTareas(
            tareas,
            cargarTareasAsignadas
        );

        resetearVistaTareas();
        resetearControlesTareas();
        await recargarOpcionesFiltro();

    } catch (error) {

        console.error(
            'Error:',
            error
        );
        notificarError('No se pudieron cargar las tareas asignadas.');

    }

}

export async function cargarTareasUsuario(usuarioId = usuarioActual?.id) {

    if (!usuarioId) {
        return;
    }

    try {

        const tareas =
            await obtenerTareasAsignadasPorUsuario(usuarioId);

        renderizarTareas(
            tareas,
            () => cargarTareasUsuario(usuarioId)
        );

        resetearVistaTareas();
        resetearControlesTareas();
        await recargarOpcionesFiltro();

    } catch (error) {

        console.error(
            'Error:',
            error
        );
        notificarError('No se pudieron cargar las tareas asignadas del usuario.');

    }

}

// ============================================
// REGISTRAR TAREA
// ============================================

/**
 * Asignar tarea
 * 
 * @param {Object} datosTarea
 */
export async function registrarTarea(datosTarea) {

    try {

        /*
            =====================================
            1. OBTENER TAREAS DISPONIBLES
            =====================================
        */
        /*
            Convertir respuesta JSON
        */
        const tareasDisponibles =
            await obtenerTareasDisponibles();

        /*
            =====================================
            2. BUSCAR LA TAREA SELECCIONADA
            =====================================
        */
        const tareaSeleccionada =
            tareasDisponibles.find(

                tarea =>

                    tarea.id ===
                    datosTarea.idTarea

            );

        if (!tareaSeleccionada) {

            throw new Error(
                'La tarea seleccionada no existe'
            );

        }


        /*
            =====================================
            3. CREAR REGISTRO DE ASIGNACIÓN
            =====================================

            NO estamos creando una tarea nueva.

            Solo estamos relacionando:
            - usuario
            - tarea existente
            - estado
        */
        const tareaAsignada = {

            usuarioId:
                usuarioActual.id,

            usuarioNombre:
                usuarioActual.name,

            tareaId:
                tareaSeleccionada.id,

            titulo:
                tareaSeleccionada.titulo,

            descripcion:
                tareaSeleccionada.descripcion,

            estado:
                datosTarea.estado,

            fechaAsignacion:
                new Date().toISOString()

        };

        console.log(
            'Enviando asignación:',
            tareaAsignada
        );

        /*
            =====================================
            4. GUARDAR ASIGNACIÓN
            =====================================
        */
        const respuesta =
            await crearTareaAsignada(
                tareaAsignada
            );

        /*
            Validar respuesta
        */
        if (!respuesta.ok) {

            throw new Error(
                'Error al asignar tarea'
            );

        }

        /*
            =====================================
            5. RECARGAR TABLA
            =====================================
        */
        await cargarTareasUsuario(
            usuarioActual.id
        );

        return true;

    } catch (error) {

        console.error(
            'Error al registrar tarea:',
            error
        );

        return false;

    }

}


// ============================================
// EDICIÓN DE TAREA ASIGNADA
// ============================================

/**
 * Configurar eventos del formulario de edición de tarea asignada
 */
export function configurarEdicionTareaAsignada() {

    document
        .getElementById('formularioEditarTarea')
        .addEventListener('submit', manejarGuardarEdicionTareaAsignada);

    document
        .getElementById('botonCancelarEdicion')
        .addEventListener('click', cancelarEdicionTareaAsignada);

    if (dropdownsEdicionConfigurados) {
        return;
    }

    configurarDropdownEdicionTareaAsignada();
    configurarDropdownEdicionUsuarioAsignado();
    dropdownsEdicionConfigurados = true;

}

/**
 * Configurar comportamiento visual base de un dropdown de edición
 *
 * @param {string} cabeceraId
 * @param {string} listaId
 * @param {Function} cerrarDropdown
 * @param {Function} cargarOpciones
 */
async function configurarDropdownVisual(cabeceraId, listaId, cerrarDropdown, cargarOpciones) {

    const cabecera = document.getElementById(cabeceraId);
    const lista = document.getElementById(listaId);

    if (!cabecera || !lista) {
        return;
    }

    cabecera.addEventListener('click', function (evento) {
        evento.stopPropagation();
        lista.classList.toggle('abierto');
    });

    lista.addEventListener('click', function (evento) {
        evento.stopPropagation();
    });

    document.addEventListener('click', cerrarDropdown);

    await cargarOpciones();

}

/**
 * Configurar dropdown de tareas disponibles en edición
 */
export async function configurarDropdownEdicionTareaAsignada() {

    await configurarDropdownVisual(
        'dropdownEditarTareaCabecera',
        'listaEditarTareasDisponibles',
        cerrarDropdownEdicionTarea,
        cargarDropdownTareasEdicion
    );

}

/**
 * Cargar tareas disponibles en el dropdown de edición
 */
export async function cargarDropdownTareasEdicion() {

    try {
        const tareas = await obtenerTareasDisponibles();
        const lista = document.getElementById('listaEditarTareasDisponibles');

        if (!lista) {
            return;
        }

        lista.innerHTML = '';

        tareas.forEach(tarea => {
            const item = document.createElement('div');
            item.classList.add('dropdown-item');

            const titulo = document.createElement('span');
            titulo.classList.add('dropdown-item-titulo');
            titulo.textContent = tarea.titulo;

            item.appendChild(titulo);

            item.addEventListener('click', function () {
                seleccionarTareaParaEdicion(tarea);
            });

            lista.appendChild(item);
        });
    } catch (error) {
        console.error('Error al cargar tareas para edición:', error);
        notificarError('No se pudieron cargar las tareas para edición.');
    }

}

/**
 * Sincronizar tarea seleccionada con el formulario de edición
 *
 * @param {Object} tarea
 */
export function seleccionarTareaParaEdicion(tarea) {

    document.getElementById('editarAsignadaTareaId').value = tarea.id;
    document.getElementById('editarAsignadaTitulo').value = tarea.titulo;
    document.getElementById('editarAsignadaDescripcion').value = tarea.descripcion;
    document.getElementById('dropdownEditarTareaTexto').textContent = tarea.titulo;

    cerrarDropdownEdicionTarea();

}

/**
 * Cerrar dropdown de tareas disponibles en edición
 */
function cerrarDropdownEdicionTarea() {

    const lista = document.getElementById('listaEditarTareasDisponibles');

    if (lista) {
        lista.classList.remove('abierto');
    }

}

/**
 * Configurar dropdown de usuarios disponibles en edición
 */
export async function configurarDropdownEdicionUsuarioAsignado() {

    await configurarDropdownVisual(
        'dropdownEditarUsuarioCabecera',
        'listaEditarUsuariosDisponibles',
        cerrarDropdownEdicionUsuario,
        cargarDropdownUsuariosEdicion
    );

}

/**
 * Cargar usuarios en el dropdown de edición
 */
export async function cargarDropdownUsuariosEdicion() {

    try {
        const usuarios = await obtenerUsuarios();
        const lista = document.getElementById('listaEditarUsuariosDisponibles');

        if (!lista) {
            return;
        }

        lista.innerHTML = '';

        usuarios.forEach(usuario => {
            const item = document.createElement('div');
            item.classList.add('dropdown-item');

            const nombre = document.createElement('span');
            nombre.classList.add('dropdown-item-titulo');
            nombre.textContent = usuario.name;

            item.appendChild(nombre);

            item.addEventListener('click', function () {
                seleccionarUsuarioParaEdicion(usuario);
            });

            lista.appendChild(item);
        });
    } catch (error) {
        console.error('Error al cargar usuarios para edición:', error);
        notificarError('No se pudieron cargar los usuarios para edición.');
    }

}

/**
 * Sincronizar usuario seleccionado con el formulario de edición
 *
 * @param {Object} usuario
 */
export function seleccionarUsuarioParaEdicion(usuario) {

    document.getElementById('editarAsignadaUsuarioId').value = usuario.id;
    document.getElementById('editarAsignadaUsuario').value = usuario.name;
    document.getElementById('dropdownEditarUsuarioTexto').textContent = usuario.name;

    cerrarDropdownEdicionUsuario();

}

/**
 * Cerrar dropdown de usuarios disponibles en edición
 */
function cerrarDropdownEdicionUsuario() {

    const lista = document.getElementById('listaEditarUsuariosDisponibles');

    if (lista) {
        lista.classList.remove('abierto');
    }

}

/**
 * Guardar cambios de la tarea asignada editada
 * 
 * @param {Event} evento
 */
export async function manejarGuardarEdicionTareaAsignada(evento) {

    evento.preventDefault();

    const id = document.getElementById('editarAsignadaId').value;

    // Enviamos únicamente los campos modificados.
    // json-server mantendrá intactos el usuarioId y fechaAsignacion.
    const datosActualizados = {
        tareaId: document.getElementById('editarAsignadaTareaId').value,
        titulo: document.getElementById('editarAsignadaTitulo').value.trim(),
        descripcion: document.getElementById('editarAsignadaDescripcion').value.trim(),
        estado: document.getElementById('editarAsignadaEstado').value,
        usuarioId: document.getElementById('editarAsignadaUsuarioId').value,
        usuarioNombre: document.getElementById('editarAsignadaUsuario').value.trim()
    };

    try {
        await actualizarTareaAsignada(id, datosActualizados);

        document.getElementById('seccionEditarTareaAsignada').classList.add('hidden');

        await cargarTareasUsuario();

        notificarExito('Tarea actualizada correctamente.');
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        notificarError('No se pudo actualizar la tarea.');
    }

}

/**
 * Cancelar edición de tarea asignada
 */
export function cancelarEdicionTareaAsignada() {

    document.getElementById('formularioEditarTarea').reset();
    document.getElementById('seccionEditarTareaAsignada').classList.add('hidden');
    notificarInfo('Edición cancelada.');

}


// ============================================
// BORRAR TODAS LAS TAREAS
// ============================================

/**
 * Eliminar todas las tareas
 */
export async function borrarTodasLasTareas() {

    try {

        /*
            Obtener tareas
        */
        await eliminarTareasAsignadasPorUsuario(
            usuarioActual.id
        );

        /*
            Recargar tabla
        */
        await cargarTareasUsuario(
            usuarioActual.id
        );
        notificarExito('Tareas borradas.');

    } catch (error) {

        console.error(
            'Error:',
            error
        );
        notificarError('No se pudieron borrar las tareas.');

    }

}
