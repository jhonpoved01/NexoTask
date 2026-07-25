const CREATE_MIGRATIONS_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) NOT NULL,
        checksum CHAR(64) NOT NULL,
        applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        CONSTRAINT pk_schema_migrations PRIMARY KEY (version)
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
`;

export async function ensureMigrationTable(connection) {
    await connection.query(CREATE_MIGRATIONS_TABLE_SQL);
}

export async function findAppliedMigrations(
    connection,
    { allowMissingTable = false } = {}
) {
    try {
        const [rows] = await connection.query(
            `SELECT version, checksum, applied_at
             FROM schema_migrations
             ORDER BY version`
        );

        return rows;
    } catch (error) {
        if (allowMissingTable && error.code === 'ER_NO_SUCH_TABLE') {
            return [];
        }

        throw error;
    }
}

export async function recordMigration(connection, migration) {
    await connection.execute(
        `INSERT INTO schema_migrations (version, checksum)
         VALUES (?, ?)`,
        [migration.version, migration.checksum]
    );
}
