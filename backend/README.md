# Backend de NexoTask

## Propósito y estado

Este workspace contiene dos servidores independientes durante la transición:

- JSON Server conserva el backend temporal utilizado por el frontend.
- La API Express establece la base del backend profesional de NexoTask.

La API Express comprueba MySQL antes de iniciar, pero todavía no persiste
usuarios ni tareas. Autenticación, autorización, asignaciones y reglas de
negocio pertenecen a fases posteriores. El frontend continúa consumiendo JSON
Server.

## Estructura

```text
backend/
├── mock/db.json
├── scripts/database/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   └── utils/
├── tests/
├── .env.example
└── vitest.config.js
```

`app.js` configura Express y se puede importar en las pruebas sin abrir un
puerto. `server.js` es el único módulo que inicia la escucha HTTP.

## Requisitos e instalación

- Node.js `^20.19.0` o `>=22.12.0`.
- npm con soporte para workspaces.
- MySQL 8 con una base `nexotask` y un usuario técnico distinto de `root`.

Desde la raíz del monorepo:

```bash
npm install
```

## Variables de entorno

Copia localmente `backend/.env.example` como `backend/.env` si necesitas
sobrescribir los valores predeterminados. El archivo `.env` no se versiona.

| Variable | Valor predeterminado | Propósito |
|---|---|---|
| `NODE_ENV` | `development` | Entorno de ejecución |
| `HOST` | `127.0.0.1` | Interfaz de la API |
| `PORT` | `3001` | Puerto de Express |
| `CORS_ORIGINS` | Frontend local en 5173 | Allowlist CORS |
| `JSON_LIMIT` | `100kb` | Límite de cuerpos JSON |
| `DB_HOST` | `localhost` | Host de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `DB_NAME` | `nexotask` | Base de datos |
| `DB_USER` | `nexotask_app` | Usuario técnico sin privilegios de root |
| `DB_PASSWORD` | Sin valor real en Git | Contraseña del usuario técnico |
| `DB_CONNECTION_LIMIT` | `10` | Máximo de conexiones del pool |

Para permitir un frontend en otro equipo de una red controlada:

```env
CORS_ORIGINS=http://localhost:5173,http://192.168.1.10:5173
```

No se debe usar `*` ni hardcodear la IP actual del equipo.

## Preparación y mantenimiento de MySQL

La base y el usuario técnico se crean manualmente con una cuenta
administrativa. La aplicación se conecta exclusivamente con el usuario técnico
y sus permisos mínimos. No deben documentarse ni versionarse contraseñas
reales.

Desde la raíz del monorepo:

```bash
npm run db:check
npm run db:migrate
npm run db:status
npm run db:seed
```

- `db:check` valida la configuración y ejecuta una consulta mínima.
- `db:migrate` aplica, en orden, migraciones pendientes.
- `db:status` informa migraciones aplicadas, pendientes o inconsistentes.
- `db:seed` carga datos ficticios repetibles y se bloquea en producción.

Las migraciones de `database/migrations/` son la fuente autoritativa. Una
migración aplicada no debe editarse: `schema_migrations` conserva su nombre,
checksum SHA-256 y fecha de aplicación, y detiene el proceso si detecta cambios.
`database/schema.sql` es solo una instantánea legible.

La semilla es distinta de una migración: aporta datos ficticios para desarrollo
y puede repetirse sin duplicarlos. Nunca sustituye la evolución estructural del
esquema.

`legacy_id` facilitará una migración posterior desde JSON Server sin convertir
los identificadores heredados a números. Los IDs `BIGINT` se reciben en Node.js
como strings. Usuarios y tareas incluyen `deleted_at` para eliminación lógica;
el progreso individual se almacena únicamente en `task_assignments`.

MySQL Workbench puede utilizarse para inspeccionar tablas, restricciones e
índices con el usuario apropiado. Antes de cambios estructurales o migraciones
en entornos compartidos debe generarse y verificarse una copia de seguridad.

## Ejecución

Todos los comandos siguientes se pueden ejecutar desde la raíz.

### Mock temporal

```bash
npm run dev:backend
```

JSON Server continúa disponible en `http://localhost:3000`. Sus escrituras
modifican `backend/mock/db.json`.

Para exponer el mock en una red local controlada:

```bash
npm run dev:backend:network
```

### API Express

Desarrollo con reinicio automático:

```bash
npm run dev:api
```

Inicio normal:

```bash
npm run start:api
```

Antes de escuchar, Express valida la configuración y comprueba MySQL. No aplica
migraciones automáticamente. Express queda disponible por defecto en
`http://127.0.0.1:3001`. Para escuchar en una red local se puede definir
`HOST=0.0.0.0` y agregar el origen exacto del frontend a `CORS_ORIGINS`. La API
aún no debe exponerse en una red no confiable.

## Pruebas

```bash
npm run test:backend
```

Las pruebas usan Supertest y no abren un puerto real.

## Endpoints disponibles

| Método | Endpoint | Estado |
|---|---|---|
| GET | `/api/health` | Salud de la API |
| GET | `/api/users` | Listado temporal vacío |
| POST | `/api/users` | Disponibilidad de la ruta, sin persistencia |
| GET | `/api/tasks` | Listado temporal vacío |
| POST | `/api/tasks` | Disponibilidad de la ruta, sin persistencia |

Ejemplos:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/users
curl -X POST http://localhost:3001/api/users -H "Content-Type: application/json" -d '{}'
curl http://localhost:3001/api/tasks
```

## Contratos de respuesta

Éxito individual o mensaje:

```json
{
  "data": null,
  "message": "Mensaje descriptivo"
}
```

Listado:

```json
{
  "data": [],
  "meta": {
    "total": 0
  },
  "message": "Mensaje descriptivo"
}
```

Error:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje comprensible",
    "details": []
  }
}
```

Las respuestas no exponen stack traces. Los errores inesperados se registran
en el servidor y se presentan al cliente como `INTERNAL_SERVER_ERROR`.

## Limitaciones y próximas fases

- No existe persistencia en Express.
- Los cuerpos enviados a POST se descartan deliberadamente.
- MySQL dispone del esquema inicial, pero no hay repositorios ni servicios de
  negocio.
- No hay autenticación, JWT ni roles.
- No hay endpoints funcionales de asignaciones ni dashboard.
- El frontend todavía utiliza el mock del puerto 3000.

La siguiente fase debe implementar el CRUD real de usuarios mediante
validadores, repositorio, servicio y controladores, sin reemplazar el mock ni
conectar todavía el frontend hasta estabilizar el contrato.
