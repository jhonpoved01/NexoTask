import { migrateDatabase } from '../../src/database/migrationRunner.js';
import { closePool } from '../../src/database/pool.js';

try {
    const result = await migrateDatabase();

    for (const version of result.skipped) {
        console.log(`${version}: ya aplicada`);
    }

    for (const version of result.applied) {
        console.log(`${version}: aplicada`);
    }

    console.log(`Total aplicado ahora: ${result.applied.length}`);
} catch (error) {
    const isChecksumError = error.message?.startsWith('Checksum inconsistente:');

    console.error(
        isChecksumError
            ? error.message
            : 'No fue posible aplicar las migraciones'
    );
    process.exitCode = 1;
} finally {
    await closePool().catch(() => {
        process.exitCode = 1;
    });
}
