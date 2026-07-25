import { configurarNavegacion } from './ui/navegacion.ui.js';
import {
    configurarUsuariosAsignaciones,
    activarUsuariosAsignaciones
} from './ui/usuariosAsignaciones.ui.js';
import { configurarCatalogo, activarCatalogo } from './ui/catalogo.ui.js';
import { configurarVistaGeneral, activarVistaGeneral } from './ui/vistaGeneral.ui.js';

document.addEventListener('DOMContentLoaded', () => {
    configurarUsuariosAsignaciones();
    configurarCatalogo();
    configurarVistaGeneral();

    const activadores = {
        usuarios: activarUsuariosAsignaciones,
        catalogo: activarCatalogo,
        general: activarVistaGeneral
    };

    configurarNavegacion({
        onActivar(nombreVista) {
            activadores[nombreVista]?.();
        }
    });
});
