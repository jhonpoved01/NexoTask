import { getMigrationStatus } from '../../src/database/migrationRunner.js';
import { closePool } from '../../src/database/pool.js';

try {
    const status = await getMigrationStatus();

    for (const migration of status.applied) {
        console.log(`${migration.version}: aplicada`);
    }

    for (const migration of status.pending) {
        console.log(`${migration.version}: pendiente`);
    }

    for (const migration of status.inconsistent) {
        console.log(`${migration.version}: checksum inconsistente`);
    }

    console.log(`Total aplicado: ${status.applied.length}`);
    console.log(`Total pendiente: ${status.pending.length}`);
    console.log(`Total inconsistente: ${status.inconsistent.length}`);

    if (status.inconsistent.length > 0) {
        process.exitCode = 1;
    }
} catch {
    console.error('No fue posible consultar el estado de las migraciones');
    process.exitCode = 1;
} finally {
    await closePool().catch(() => {
        process.exitCode = 1;
    });
}
