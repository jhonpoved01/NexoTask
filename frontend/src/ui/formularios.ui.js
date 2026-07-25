export function validarCampoVacio(valor) {
    return String(valor ?? '').trim().length > 0;
}

export function mostrarError(elementoError, mensaje, campo = null) {
    if (elementoError) {
        elementoError.textContent = mensaje;
    }

    if (campo) {
        campo.setAttribute('aria-invalid', 'true');
    }
}

export function limpiarError(elementoError, campo = null) {
    if (elementoError) {
        elementoError.textContent = '';
    }

    if (campo) {
        campo.removeAttribute('aria-invalid');
    }
}

export function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
