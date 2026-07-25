let temporizadorEstado = null;
let temporizadorError = null;

function mostrarNotificacion(mensaje, tipo = 'info') {
    const esError = tipo === 'error';
    const contenedor = document.getElementById(
        esError ? 'mensajeErrorSistema' : 'mensajeSistema'
    );

    if (!contenedor) {
        return;
    }

    const temporizadorActual = esError ? temporizadorError : temporizadorEstado;
    window.clearTimeout(temporizadorActual);

    contenedor.textContent = mensaje;
    contenedor.className = `notificacion ${tipo}`;

    const temporizador = window.setTimeout(() => {
        contenedor.textContent = '';
        contenedor.className = '';
    }, esError ? 8000 : 5000);

    if (esError) {
        temporizadorError = temporizador;
    } else {
        temporizadorEstado = temporizador;
    }
}

export function notificarExito(mensaje) {
    mostrarNotificacion(mensaje, 'exito');
}

export function notificarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}

export function notificarInfo(mensaje) {
    mostrarNotificacion(mensaje, 'info');
}
