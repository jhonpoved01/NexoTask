import { API_URL } from '../config/api.config.js';
import { asegurarLista, solicitarJson } from '../utils/http.js';

export async function obtenerUsuarios() {
    const usuarios = await solicitarJson(`${API_URL}/usuarios`);

    return asegurarLista(usuarios, 'los usuarios');
}

export async function buscarUsuario(documentoUsuario) {
    const usuarios = await obtenerUsuarios();
    const documentoNormalizado = String(documentoUsuario ?? '').trim();

    return usuarios.find(
        usuario => String(usuario.id ?? '').trim() === documentoNormalizado
    ) || null;
}
