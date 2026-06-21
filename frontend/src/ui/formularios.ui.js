// ============================================
// VALIDACIONES
// ============================================

/**
 * Verifica que un campo no esté vacío.
 *
 * trim() elimina espacios al inicio
 * y final del texto.
 *
 * @param {string} valor
 * @returns {boolean}
 */
export function validarCampoVacio(valor) {

    return valor.trim().length > 0;

}

// ============================================
// MANEJO DE ERRORES
// ============================================

/**
 * Muestra un mensaje de error
 * debajo de un campo.
 *
 * @param {HTMLElement} elementoError
 * @param {string} mensaje
 */
export function mostrarError(elementoError, mensaje) {

    elementoError.textContent = mensaje;

}

/**
 * Limpia el mensaje de error.
 *
 * @param {HTMLElement} elementoError
 */
export function limpiarError(elementoError) {

    elementoError.textContent = '';

}

// ============================================
// MENSAJES DEL SISTEMA
// ============================================

/**
 * Muestra mensajes dinámicos
 * en la interfaz.
 *
 * Ejemplos:
 * - éxito
 * - error
 * - información
 *
 * @param {string} mensaje
 * @param {string} tipo
 */
export function mostrarMensajeSistema(
    mensaje,
    tipo = 'info'
) {

    /*
        Contenedor donde aparecerán
        los mensajes.
    */
    const contenedorMensaje =
        document.getElementById('mensajeSistema');

    /*
        Insertamos texto.
    */
    contenedorMensaje.textContent =
        mensaje;

    /*
        Reiniciamos clases CSS.
    */
    contenedorMensaje.className = '';

    /*
        Agregamos clase dependiendo
        del tipo de mensaje.
    */
    contenedorMensaje.classList.add(tipo);

    /*
        Eliminamos el mensaje después
        de 3 segundos.
    */
    setTimeout(() => {

        contenedorMensaje.textContent = '';

        contenedorMensaje.className = '';

    }, 3000);

}
// ============================================
// FUNCIONES DE FECHA
// ============================================

/**
 * Convierte una fecha al formato
 * español legible.
 *
 * @param {string} fecha
 * @returns {string}
 */
export function formatearFecha(fecha) {

    return new Date(fecha)
        .toLocaleDateString(
            'es-ES',
            {

                year: 'numeric',

                month: 'long',

                day: 'numeric'

            }
        );

}