import { AppError } from '../utils/AppError.js';

export function notFound(request, _response, next) {
    next(new AppError({
        code: 'ROUTE_NOT_FOUND',
        message: 'La ruta solicitada no existe',
        status: 404,
        details: [{
            method: request.method,
            path: request.path
        }]
    }));
}
