import { sendList, sendSuccess } from '../utils/response.js';

export function listTasks(_request, response) {
    return sendList(response, {
        message: 'La ruta para listar tareas está disponible; la persistencia se implementará en una fase posterior'
    });
}

export function createTask(_request, response) {
    return sendSuccess(response, {
        status: 201,
        message: 'La ruta para crear tareas está disponible; la persistencia se implementará en una fase posterior'
    });
}
