# Arquitectura del proyecto

El repositorio utiliza una estructura monorepo basada en npm workspaces:

- `frontend/`: aplicación web construida con HTML, CSS, JavaScript modular y Vite.
- `backend/`: API temporal basada en JSON Server.
- `database/`: preparación para la futura persistencia en MySQL.
- `docs/`: documentación técnica, académica y operativa.

El frontend consume la API mediante una URL configurable. JSON Server es un
mock temporal y no representa el backend definitivo. El backend real y la
integración con MySQL se incorporarán en fases posteriores.
