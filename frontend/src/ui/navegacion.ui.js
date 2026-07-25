const VISTAS_VALIDAS = new Set(['usuarios', 'catalogo', 'general']);

export function configurarNavegacion({ onActivar }) {
    const enlaces = Array.from(document.querySelectorAll('.enlace-navegacion'));
    const vistas = Array.from(document.querySelectorAll('.vista-principal'));

    function obtenerVistaDesdeHash() {
        const valor = window.location.hash.replace('#', '');
        return VISTAS_VALIDAS.has(valor) ? valor : 'usuarios';
    }

    function activarVista(nombreVista, moverFoco = true) {
        vistas.forEach(vista => {
            const activa = vista.dataset.vista === nombreVista;
            vista.classList.toggle('hidden', !activa);
            vista.toggleAttribute('inert', !activa);
        });

        enlaces.forEach(enlace => {
            const activo = enlace.dataset.vista === nombreVista;
            enlace.classList.toggle('activo', activo);
            if (activo) {
                enlace.setAttribute('aria-current', 'page');
            } else {
                enlace.removeAttribute('aria-current');
            }
        });

        onActivar(nombreVista);

        if (moverFoco) {
            const vistaActiva = vistas.find(vista => vista.dataset.vista === nombreVista);
            vistaActiva?.querySelector('h2')?.focus();
        }
    }

    if (!VISTAS_VALIDAS.has(window.location.hash.replace('#', ''))) {
        history.replaceState(null, '', '#usuarios');
    }

    window.addEventListener('hashchange', () => {
        activarVista(obtenerVistaDesdeHash(), true);
    });

    activarVista(obtenerVistaDesdeHash(), false);
}
