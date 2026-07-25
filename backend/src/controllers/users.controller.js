import { sendList, sendSuccess } from '../utils/response.js';

export function listUsers(_request, response) {
    return sendList(response, {
        message: 'La ruta para listar usuarios está disponible; la persistencia se implementará en una fase posterior'
    });
}

export function createUser(_request, response) {
    return sendSuccess(response, {
        status: 201,
        message: 'La ruta para crear usuarios está disponible; la persistencia se implementará en una fase posterior'
    });
}
