import { loadDatabaseConfig } from '../../src/config/database.config.js';
import { checkDatabaseConnection } from '../../src/database/connection.js';
import { closePool } from '../../src/database/pool.js';

try {
    const config = loadDatabaseConfig();
    const connected = await checkDatabaseConnection();

    if (!connected) {
        throw new Error('La consulta de comprobación no devolvió el resultado esperado');
    }

    console.log(
        `Conexión MySQL correcta: ${config.host}:${config.port}/${config.database}`
    );
} catch {
    console.error('No fue posible conectar con MySQL. Verifica la configuración y disponibilidad del servicio');
    process.exitCode = 1;
} finally {
    await closePool().catch(() => {
        process.exitCode = 1;
    });
}
