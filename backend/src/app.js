import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';
import { apiRouter } from './routes/index.js';
import { AppError } from './utils/AppError.js';

function createCorsOptions() {
    return {
        origin(origin, callback) {
            if (!origin || env.corsOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new AppError({
                code: 'CORS_ORIGIN_DENIED',
                message: 'El origen de la solicitud no está permitido',
                status: 403
            }));
        }
    };
}

export function createApp() {
    const app = express();

    app.disable('x-powered-by');
    app.use(cors(createCorsOptions()));
    app.use(express.json({ limit: env.jsonLimit }));
    app.use('/api', apiRouter);
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

export const app = createApp();
