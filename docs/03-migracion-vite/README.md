# Migración y uso de Vite

El frontend está aislado en `frontend/` y Vite utiliza esa carpeta como raíz de
la aplicación.

Comandos disponibles desde la raíz:

```bash
npm run dev:frontend
npm run build:frontend
npm run preview:frontend
```

- `dev:frontend` inicia el servidor de desarrollo con recarga automática.
- `build:frontend` genera la salida optimizada en `frontend/dist/`.
- `preview:frontend` sirve localmente el último build generado.

`frontend/dist/` es contenido generado. No debe editarse manualmente y está
excluido del control de versiones.
