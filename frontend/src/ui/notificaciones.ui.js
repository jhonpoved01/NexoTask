function mostrarNotificacion(mensaje, tipo = 'info') {
    const contenedor = document.getElementById('mensajeSistema');

    if (!contenedor) {
        return;
    }

    contenedor.textContent = mensaje;
    contenedor.className = '';
    contenedor.classList.add('notificacion', tipo);

    setTimeout(() => {
        contenedor.textContent = '';
        contenedor.className = '';
    }, 4000);
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
