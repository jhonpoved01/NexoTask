let dialogoActivo = false;

export function solicitarConfirmacion({
    titulo,
    mensaje,
    textoConfirmar = 'Eliminar',
    activador = document.activeElement
}) {
    const dialogo = document.getElementById('dialogoConfirmacion');
    const tituloElemento = document.getElementById('tituloDialogoConfirmacion');
    const mensajeElemento = document.getElementById('mensajeDialogoConfirmacion');
    const botonCancelar = document.getElementById('botonCancelarConfirmacion');
    const botonConfirmar = document.getElementById('botonConfirmarAccion');

    if (!dialogo || !tituloElemento || !mensajeElemento || !botonCancelar || !botonConfirmar) {
        return Promise.resolve(false);
    }

    if (dialogoActivo) {
        return Promise.resolve(false);
    }

    dialogoActivo = true;
    tituloElemento.textContent = titulo;
    mensajeElemento.textContent = mensaje;
    botonConfirmar.textContent = textoConfirmar;

    return new Promise((resolver) => {
        const finalizar = () => {
            dialogoActivo = false;
            dialogo.removeEventListener('close', finalizar);
            const confirmado = dialogo.returnValue === 'confirmar';

            if (activador instanceof HTMLElement && activador.isConnected) {
                activador.focus();
            }

            resolver(confirmado);
        };

        dialogo.addEventListener('close', finalizar);
        dialogo.returnValue = 'cancelar';
        dialogo.showModal();
        requestAnimationFrame(() => botonCancelar.focus());
    });
}
