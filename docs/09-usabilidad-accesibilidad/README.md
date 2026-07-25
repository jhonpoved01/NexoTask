# Usabilidad y accesibilidad de NexoTask

## Objetivo

Reestructurar progresivamente la interfaz de NexoTask para reducir errores y carga cognitiva, preservar las funciones existentes y alcanzar WCAG 2.2 nivel AA.

## Alcance

Los incrementos implementados comprenden:

- Fase 1A: seguridad del renderizado, integridad de IDs y descripciones, errores HTTP y confirmaciones destructivas.
- Fase 1B: base semántica, formularios accesibles, controles nativos, tabla, regiones dinámicas, teclado, foco, filtros y movimiento reducido.
- Fase 2: navegación por hash, separación entre usuarios, catálogo y consulta global, estado independiente y jerarquía visual inicial.

No incluye el sistema visual definitivo, tarjetas móviles, backend real ni cambios de endpoints.

## Fases previstas

1. Estabilización de seguridad e integridad.
2. Base semántica y accesibilidad.
3. Navegación y jerarquía visual. **Implementada.**
4. Formularios y prevención avanzada de errores.
5. Tablas, filtros y adaptación responsive.
6. Contraste, movimiento y sistema visual.
7. Pruebas de usabilidad y accesibilidad.

## Estado actual

Las fases 1A, 1B y 2 están implementadas en código y sujetas a verificación manual en navegador y tecnologías de asistencia. La aplicación dispone de tres vistas principales exclusivas, navegación mediante hash y contexto independiente durante la sesión. Las pruebas automatizadas existentes se limitan a build y detección de ciclos.

## Meta

La meta es WCAG 2.2 AA. Las herramientas automáticas complementarán, pero no sustituirán, pruebas manuales con teclado, lector de pantalla, zoom y movimiento reducido.
