import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';

function isMalformedJson(error) {
    return error instanceof SyntaxError
        && error.status === 400
        && error.type === 'entity.parse.failed';
}

export function errorHandler(error, _request, response, _next) {
    if (isMalformedJson(error)) {
        return sendError(response, {
            status: 400,
            code: 'INVALID_JSON',
            message: 'El cuerpo de la solicitud contiene JSON no válido'
        });
    }

    if (error instanceof AppError && error.expose) {
        return sendError(response, {
            status: error.status,
            code: error.code,
            message: error.message,
            details: error.details
        });
    }

    console.error('Error inesperado en la API:', error);

    return sendError(response, {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ocurrió un error interno en el servidor'
    });
}
