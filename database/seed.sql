-- Datos ficticios e idempotentes para desarrollo local.
-- No contiene personas reales, credenciales ni contraseñas.

INSERT INTO users (
    legacy_id,
    name,
    email,
    password_hash,
    role,
    status
) VALUES
    ('seed-user-admin', 'Admin Ficticio', 'admin@nexotask.example.com', NULL, 'admin', 'active'),
    ('seed-user-member', 'Usuario Ficticio', 'user@nexotask.example.com', NULL, 'user', 'active')
ON DUPLICATE KEY UPDATE
    legacy_id = VALUES(legacy_id);

INSERT INTO tasks (
    legacy_id,
    title,
    description,
    priority,
    due_date,
    created_by
)
SELECT
    'seed-task-review',
    'Revisar documentación ficticia',
    'Tarea ficticia para validar la infraestructura local.',
    'medium',
    NULL,
    users.id
FROM users
WHERE users.legacy_id = 'seed-user-admin'
ON DUPLICATE KEY UPDATE
    legacy_id = VALUES(legacy_id);

INSERT INTO tasks (
    legacy_id,
    title,
    description,
    priority,
    due_date,
    created_by
)
SELECT
    'seed-task-tests',
    'Preparar pruebas ficticias',
    'Tarea ficticia sin información de producción.',
    'high',
    NULL,
    users.id
FROM users
WHERE users.legacy_id = 'seed-user-admin'
ON DUPLICATE KEY UPDATE
    legacy_id = VALUES(legacy_id);

INSERT INTO task_assignments (
    legacy_id,
    task_id,
    user_id,
    status
)
SELECT
    'seed-assignment-review',
    tasks.id,
    users.id,
    'pending'
FROM tasks
INNER JOIN users
    ON users.legacy_id = 'seed-user-member'
WHERE tasks.legacy_id = 'seed-task-review'
ON DUPLICATE KEY UPDATE
    legacy_id = VALUES(legacy_id);

INSERT INTO task_assignments (
    legacy_id,
    task_id,
    user_id,
    status
)
SELECT
    'seed-assignment-tests',
    tasks.id,
    users.id,
    'in_progress'
FROM tasks
INNER JOIN users
    ON users.legacy_id = 'seed-user-admin'
WHERE tasks.legacy_id = 'seed-task-tests'
ON DUPLICATE KEY UPDATE
    legacy_id = VALUES(legacy_id);
