import { env } from '../config/env.js';
import { sendSuccess } from '../utils/response.js';

export function getHealth(_request, response) {
    return sendSuccess(response, {
        data: {
            service: 'nexotask-api',
            status: 'ok',
            environment: env.nodeEnv,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        },
        message: 'La API está disponible'
    });
}
