import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.port, env.host, () => {
    console.log(`NexoTask API disponible en http://${env.host}:${env.port}`);
});

let isShuttingDown = false;

function shutdown(signal) {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;
    console.log(`Cerrando NexoTask API por ${signal}`);

    server.close((error) => {
        if (error) {
            console.error('No fue posible cerrar la API correctamente:', error);
            process.exitCode = 1;
        }
    });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
