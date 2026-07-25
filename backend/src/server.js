import { app } from './app.js';
import { loadDatabaseConfig } from './config/database.config.js';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './database/connection.js';
import { closePool } from './database/pool.js';

let server;
let isShuttingDown = false;

async function shutdown(signal) {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;
    console.log(`Cerrando NexoTask API por ${signal}`);

    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });
        }
    } catch {
        console.error('No fue posible cerrar el servidor HTTP correctamente');
        process.exitCode = 1;
    } finally {
        try {
            await closePool();
        } catch {
            console.error('No fue posible cerrar el pool de MySQL correctamente');
            process.exitCode = 1;
        }
    }
}

async function startServer() {
    try {
        loadDatabaseConfig();
        const isConnected = await checkDatabaseConnection();

        if (!isConnected) {
            throw new Error('La comprobación de MySQL no fue satisfactoria');
        }

        server = app.listen(env.port, env.host, () => {
            console.log(`NexoTask API disponible en http://${env.host}:${env.port}`);
        });
    } catch {
        console.error('No fue posible iniciar NexoTask API: verifica la configuración y disponibilidad de MySQL');
        process.exitCode = 1;
        await closePool();
    }
}

process.on('SIGINT', () => {
    void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});

await startServer();
