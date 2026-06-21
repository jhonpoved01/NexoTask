import { eliminarTareaAsignada } from '../services/tareasAsignadas.service.js';
import { notificarExito, notificarError } from './notificaciones.ui.js';
import { filtrarTareas } from '../utils/filtros.js';
import { ordenarTareas } from '../utils/ordenamiento.js';

let tareasBase = [];
let tareasVisibles = [];
let callbackRecarga = null;
let vistaActual = {
    filtros: {},
    orden: 'fecha'
};

function obtenerClaseEstado(estado = '') {
    const estadoNormalizado = String(estado).trim().toLowerCase();

    if (estadoNormalizado === 'pendiente') {
        return 'badge-pendiente';
    }

    if (estadoNormalizado === 'en progreso') {
        return 'badge-en-progreso';
    }

    if (estadoNormalizado === 'completada') {
        return 'badge-completada';
    }

    return 'badge-neutro';
}

function hayFiltrosActivos(filtros = {}) {
    return Object.values(filtros).some(valor => valor !== '' && valor !== 'Todas');
}

function actualizarResumenTareas(tareas = []) {
    const resumen = tareas.reduce(
        (acumulador, tarea) => {
            const estado = String(tarea.estado || '').trim().toLowerCase();

            acumulador.total += 1;

            if (estado === 'pendiente') {
                acumulador.pendientes += 1;
            } else if (estado === 'en progreso') {
                acumulador.enProgreso += 1;
            } else if (estado === 'completada') {
                acumulador.completadas += 1;
            }

            return acumulador;
        },
        {
            total: 0,
            pendientes: 0,
            enProgreso: 0,
            completadas: 0
        }
    );

    const contadorTotal = document.getElementById('contadorTotalTareas');
    const contadorPendientes = document.getElementById('contadorPendientes');
    const contadorEnProgreso = document.getElementById('contadorEnProgreso');
    const contadorCompletadas = document.getElementById('contadorCompletadas');

    if (contadorTotal) contadorTotal.textContent = resumen.total;
    if (contadorPendientes) contadorPendientes.textContent = resumen.pendientes;
    if (contadorEnProgreso) contadorEnProgreso.textContent = resumen.enProgreso;
    if (contadorCompletadas) contadorCompletadas.textContent = resumen.completadas;
}

// ============================================
// RENDERIZAR TAREAS
// ============================================

/**
 * Mostrar tareas en tabla
 * 
 * @param {Array} tareas
 * @param {Function} onTareaEliminada
 */
export function renderizarTareas(tareas, onTareaEliminada) {

    tareasBase = Array.isArray(tareas) ? tareas : [];
    callbackRecarga = onTareaEliminada;
    aplicarVistaTareas(vistaActual);

}

export function renderizarVistaFiltrada(tareasGlobales, vista, onRecarga) {

    tareasBase = Array.isArray(tareasGlobales) ? tareasGlobales : [];
    callbackRecarga = onRecarga || callbackRecarga;
    aplicarVistaTareas(vista);

}

export function aplicarVistaTareas(opciones = {}) {

    vistaActual = {
        filtros: opciones.filtros || {},
        orden: opciones.orden || 'fecha'
    };

    const tareas = ordenarTareas(
        filtrarTareas(
            tareasBase,
            vistaActual.filtros
        ),
        vistaActual.orden
    );

    tareasVisibles = tareas;
    actualizarResumenTareas(tareasVisibles);

    const cuerpoTabla =
        document.getElementById(
            'cuerpoTablaTareas'
        );
    const tabla =
        document.getElementById(
            'tablaTareas'
        );
    const mensaje =
        document.getElementById(
            'mensajeSinTareas'
        );

    /*
        Limpiar tabla
    */
    cuerpoTabla.innerHTML = '';

    /*
        Verificar tareas
    */
    if (tareas.length === 0) {
        tabla.classList.add(
            'hidden'
        );
        mensaje.textContent = hayFiltrosActivos(vistaActual.filtros)
            ? 'No se encontraron tareas con los filtros seleccionados.'
            : 'Este usuario aún no tiene tareas asignadas.';
        mensaje.classList.remove(
            'hidden'
        );
        return;
    }

    /*
        Mostrar tabla
    */
    tabla.classList.remove(
        'hidden'
    );
    tabla.style.display = '';
    mensaje.classList.add(
        'hidden'
    );

    /*
        Recorrer tareas
    */
    tareas.forEach(tarea => {

        /*
            Crear fila
        */
        const fila =
            document.createElement(
                'tr'
            );

        fila.innerHTML = `

        <td>
            ${tarea.titulo}
        </td>

        <td>
            ${tarea.descripcion}
        </td>

        <td>
            <span class="badge-estado ${obtenerClaseEstado(tarea.estado)}">
                ${tarea.estado}
            </span>
        </td>

        <td>
            ${new Date(
            tarea.fechaAsignacion
        ).toLocaleDateString()}
        </td>

        <td>
            ${tarea.usuarioNombre}
        </td>   
        <td> 
            <button 
                class="boton-editar-asignada"
                data-id="${tarea.id}"
                data-titulo="${tarea.titulo}"
                data-estado="${tarea.estado}"
            >
                Editar
            </button>

            <button
                class="boton-eliminar"
                data-id="${tarea.id}"
            >

                Eliminar

            </button>

        </td>
    `;

        /*
            Agregar fila
        */
        cuerpoTabla.appendChild(
            fila
        );

    });
/*
        Eventos eliminar
    */
    document
        .querySelectorAll(
            '.boton-eliminar'
        )
        .forEach(boton => {

            boton.addEventListener(
                'click',
                async (evento) => {

                    const id =
                        evento.target.getAttribute(
                            'data-id'
                        );
                    
                    const confirmar = confirm('¿Seguro que deseas eliminar esta tarea asignada?');
                    if (!confirmar) return;

                    try {
                        // 1. Ejecutar el borrado en el servidor
                        await eliminarTareaAsignada(id);
                        
                        // 2. RF03 - Mostrar el aviso flotante de éxito
                        notificarExito('Tarea asignada eliminada exitosamente.');

                        // 3. RECARGA VISUAL: Ejecutar el callback para actualizar la tabla en pantalla
                        if (typeof callbackRecarga === 'function') {
                            await callbackRecarga();
                        }

                    } catch (error) {
                        console.error('Error al eliminar tarea asignada:', error);   
                        
                        // RF03 - Mostrar aviso de error si el servidor falla
                        notificarError('No se pudo eliminar la tarea asignada.');
                    }
                
                }
            );

        }); // <- Este es el cierre del forEach de eliminar

    /*
        Eventos editar tarea asignada
        esto es del boton editar de tareas asignadas
        Ely
    
  
    /*
    Ely
       
    Eventos editar tarea asignada (Abrir sección de formulario)
    */
    document
        .querySelectorAll(
            '.boton-editar-asignada'
        )
        .forEach(boton => {

            boton.addEventListener(
                'click',
                (evento) => {
                    // Encontrar el objeto de la tarea correspondiente buscando en el array recibido
                    const id = evento.target.getAttribute('data-id');
                    const tareaSeleccionada = tareas.find(t => t.id == id);

                    if (!tareaSeleccionada) return;

                    // 1. Rellenar los campos de la sección de edición con los datos actuales
                    document.getElementById('editarAsignadaId').value = tareaSeleccionada.id;
                    document.getElementById('editarAsignadaTareaId').value = tareaSeleccionada.tareaId;
                    document.getElementById('editarAsignadaTitulo').value = tareaSeleccionada.titulo;
                    document.getElementById('editarAsignadaDescripcion').value = tareaSeleccionada.descripcion;
                    document.getElementById('editarAsignadaEstado').value = tareaSeleccionada.estado;
                    document.getElementById('editarAsignadaUsuarioId').value = tareaSeleccionada.usuarioId;
                    document.getElementById('editarAsignadaUsuario').value = tareaSeleccionada.usuarioNombre;
                    document.getElementById('dropdownEditarTareaTexto').textContent = tareaSeleccionada.titulo;
                    document.getElementById('dropdownEditarUsuarioTexto').textContent = tareaSeleccionada.usuarioNombre;

                    // 2. Mostrar la sección removiendo la clase 'hidden'
                    const seccionEdicion = document.getElementById('seccionEditarTareaAsignada');
                    seccionEdicion.classList.remove('hidden');

                    // 3. Hacer un scroll suave hacia el formulario para que el usuario note que se abrió
                    seccionEdicion.scrollIntoView({ behavior: 'smooth' });
                }
            );

        });
} // <- Este es el cierre final de la función aplicarVistaTareas "boton editar (tarea asignada)Ely"

export function obtenerTareasVisibles() {
    return [...tareasVisibles];
}

export function obtenerTareasBase() {
    return [...tareasBase];
}

export function resetearVistaTareas() {
    vistaActual = {
        filtros: {
            usuarioId: '',
            estado: 'Todas',
            tareaId: ''
        },
        orden: 'fecha'
    };

    aplicarVistaTareas(vistaActual);
}
