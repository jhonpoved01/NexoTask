# Sistema de Registro de Tareas

Aplicación académica para buscar usuarios, administrar tareas disponibles,
asignar tareas, editar asignaciones, filtrar resultados y exportar información
en formato JSON.

El proyecto utiliza HTML, CSS, JavaScript modular y Vite en el frontend. La API
actual funciona con JSON Server como solución temporal mientras se prepara una
implementación futura de backend real y persistencia con MySQL.

## Arquitectura actual

El repositorio está organizado como un monorepo con npm workspaces:

```text
Proyecto_JS/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── mock/
│   │   └── db.json
│   └── package.json
├── database/
│   ├── migrations/
│   ├── schema.sql
│   └── seed.sql
├── docs/
├── .github/
├── package.json
└── package-lock.json
```

### `frontend/`

Contiene la aplicación web y su configuración de Vite.

- `src/main.js`: punto de entrada.
- `src/config/`: configuración del frontend y URL de la API.
- `src/services/`: consumo de endpoints.
- `src/ui/`: interacción con el DOM y presentación.
- `src/utils/`: utilidades reutilizables.
- `src/styles/`: estilos de la aplicación.
- `public/`: recursos estáticos copiados directamente al build.

### `backend/`

Contiene la API temporal basada en JSON Server. El archivo
`backend/mock/db.json` almacena los datos usados durante el desarrollo.

JSON Server no es el backend definitivo y no debe considerarse una solución de
producción. En una fase posterior se implementará un backend real.

### `database/`

Prepara la futura migración a MySQL:

- `schema.sql`: definición futura del esquema.
- `seed.sql`: datos iniciales controlados.
- `migrations/`: cambios versionados del esquema.

Estos archivos todavía no contienen un modelo SQL completo.

### `docs/`

Centraliza la documentación académica, técnica, arquitectónica, metodológica y
de soporte. Consulta [docs/README.md](docs/README.md) para conocer su
organización.

`.github/` permanece en la raíz porque GitHub utiliza esa ubicación para sus
plantillas y configuraciones.

## Estado actual

- Frontend modular funcionando con Vite.
- API temporal funcionando con JSON Server.
- Monorepo configurado mediante npm workspaces.
- Estructura preparada para incorporar un backend real.
- Carpeta de base de datos preparada para una futura migración a MySQL.
- Backend real y conexión MySQL todavía no implementados.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`.
- npm compatible con workspaces.

Puedes comprobar las versiones instaladas con:

```bash
node --version
npm --version
```

## Instalación

Desde la raíz del repositorio:

```bash
npm install
```

La instalación raíz resuelve las dependencias de `frontend/` y `backend/`
mediante npm workspaces. El archivo `package-lock.json` de la raíz debe
conservarse para mantener instalaciones reproducibles.

## Configuración de la API

El frontend utiliza la variable:

```env
VITE_API_URL=http://localhost:3000
```

La configuración de ejemplo está en `frontend/.env.example`. Para usar una URL
distinta, crea localmente `frontend/.env` y define `VITE_API_URL`. Los archivos
`.env` locales no deben subirse al repositorio.

## Ejecución en desarrollo

Abre dos terminales en la raíz del proyecto.

### 1. Iniciar el backend temporal

```bash
npm run dev:backend
```

JSON Server queda disponible normalmente en:

```text
http://localhost:3000
```

Endpoints actuales:

```text
/usuarios
/tareasDisponibles
/tareasAsignadas
```

Advertencia: las operaciones `POST`, `PATCH` y `DELETE` modifican directamente
`backend/mock/db.json`.

### Backend accesible desde la red local

```bash
npm run dev:backend:network
```

Este comando expone JSON Server mediante `0.0.0.0`. Debe utilizarse solamente
en una red controlada, porque el mock no implementa autenticación ni
autorización.

### 2. Iniciar el frontend

```bash
npm run dev:frontend
```

Vite muestra en la terminal la URL local del frontend, normalmente:

```text
http://localhost:5173
```

## Desarrollo, build y preview

### Desarrollo

```bash
npm run dev:frontend
```

Inicia Vite con recarga automática. Está pensado para programar y probar
cambios rápidamente; no genera una entrega final.

### Build

```bash
npm run build:frontend
```

Genera una versión optimizada del frontend dentro de:

```text
frontend/dist/
```

`dist/` es contenido generado, está excluido de Git y puede regenerarse. No
debe editarse manualmente.

### Preview

```bash
npm run preview:frontend
```

Sirve localmente el contenido de `frontend/dist/` para comprobar el resultado
del build. Antes de usarlo debe existir un build actualizado.

## Verificación de dependencias circulares

```bash
npm run lint:cycles
```

Analiza los módulos JavaScript del frontend mediante Madge.

## Flujo recomendado de trabajo

1. Sincronizar la rama de trabajo según las reglas del equipo.
2. Ejecutar `npm install` cuando cambien las dependencias o el lock.
3. Iniciar JSON Server con `npm run dev:backend`.
4. Iniciar Vite con `npm run dev:frontend`.
5. Implementar y probar los cambios en una rama dedicada.
6. Ejecutar `npm run lint:cycles`.
7. Ejecutar `npm run build:frontend`.
8. Validar el build mediante `npm run preview:frontend`.
9. Revisar los cambios antes de solicitar un Pull Request.

Las reglas detalladas de Git y GitHub se encuentran en
[docs/04-git-github/](docs/04-git-github/).

## Evolución prevista

La siguiente evolución arquitectónica reemplazará o complementará JSON Server
con una API backend real. Esa API será responsable de validación, reglas de
negocio, seguridad y acceso a MySQL.

El frontend no se conectará directamente a MySQL; continuará comunicándose con
el backend mediante HTTP.

## Documentación

- [Índice de documentación](docs/README.md)
- [Arquitectura](docs/02-arquitectura/README.md)
- [Migración y uso de Vite](docs/03-migracion-vite/README.md)
- [Git y GitHub](docs/04-git-github/README.md)
- [Preparación de base de datos](docs/05-base-datos/README.md)
- [Acuerdo del equipo](docs/00-entrega-academica/TEAM_AGREEMENT.md)
