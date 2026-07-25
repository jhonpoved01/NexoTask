# Auditoría de usabilidad

## UX-001 — Catálogo mezclado con la asignación

- **Problema:** seleccionar, crear, editar y eliminar tareas compartían un dropdown.
- **Impacto:** aumentaba decisiones y facilitaba acciones sobre el catálogo por error.
- **Severidad:** alta.
- **Archivos:** `frontend/index.html`, `frontend/src/ui/tareas.ui.js`.
- **Recomendación:** usar el selector exclusivamente para asignar y presentar temporalmente la administración fuera de él.
- **Estado:** corregido en fase 1B; separación definitiva pendiente.

## UX-002 — Eliminaciones sin contexto suficiente

- **Problema:** la eliminación masiva y la del catálogo no tenían confirmación adecuada.
- **Impacto:** pérdida accidental de datos sin posibilidad de deshacer.
- **Severidad:** crítica.
- **Archivos:** `frontend/index.html`, `frontend/src/ui/confirmaciones.ui.js`, `frontend/src/ui/tareas.ui.js`, `frontend/src/ui/tareasTabla.ui.js`.
- **Recomendación:** diálogo reutilizable con elemento, usuario, irreversibilidad y foco seguro.
- **Estado:** corregido.

## UX-003 — Descripción perdida al editar el catálogo

- **Problema:** el formulario de edición abría la descripción vacía.
- **Impacto:** una edición del título podía borrar datos válidos.
- **Severidad:** alta.
- **Archivo:** `frontend/src/ui/tareas.ui.js`.
- **Recomendación:** precargar ambos campos y cerrarlos solo después de una respuesta correcta.
- **Estado:** corregido.

## UX-004 — Filtros ambiguos

- **Problema:** “Cancelar” limpiaba filtros, cerraba el panel y cambiaba resultados.
- **Impacto:** resultado inesperado y pérdida de contexto.
- **Severidad:** media.
- **Archivos:** `frontend/index.html`, `frontend/src/ui/filtros.ui.js`.
- **Recomendación:** separar “Limpiar filtros” y “Cerrar filtros”.
- **Estado:** corregido.

## UX-005 — Ausencia de estados de carga

- **Problema:** solicitudes sin indicación ni prevención de envíos repetidos.
- **Impacto:** incertidumbre y duplicación potencial de operaciones.
- **Severidad:** alta.
- **Archivos:** `frontend/src/main.js`, `frontend/src/ui/tareas.ui.js`.
- **Recomendación:** texto de progreso, controles deshabilitados y `aria-busy`.
- **Estado:** corregido en flujos principales; revisión integral pendiente.

## UX-006 — Contexto global y de usuario poco diferenciado

- **Problema:** aplicar filtros globales desde una vista iniciada por usuario cambia el alcance.
- **Impacto:** puede confundirse el conjunto consultado o exportado.
- **Severidad:** alta.
- **Archivos:** `frontend/index.html`, `frontend/src/ui/navegacion.ui.js`, `frontend/src/ui/usuariosAsignaciones.ui.js`, `frontend/src/ui/vistaGeneral.ui.js`.
- **Recomendación:** separar vistas, tablas, filtros y estado.
- **Estado:** corregido en fase 2.

## UX-007 — Exceso de controles simultáneos

- **Problema:** después de buscar un usuario aparecían catálogo, asignación, filtros, exportación y acciones destructivas al mismo tiempo.
- **Impacto:** aumentaba la carga cognitiva y dificultaba reconocer la acción principal.
- **Severidad:** alta.
- **Archivos:** `frontend/index.html`, `frontend/src/styles/main.css`.
- **Recomendación:** mostrar una sola vista principal, abrir formularios bajo demanda y agrupar acciones secundarias.
- **Estado:** corregido en fase 2.

## UX-008 — Formularios persistentes

- **Problema:** asignación y edición ocupaban espacio aunque no fueran necesarios.
- **Impacto:** desplazamiento adicional y pérdida de jerarquía.
- **Severidad:** media.
- **Archivos:** `frontend/index.html`, `frontend/src/ui/usuariosAsignaciones.ui.js`, `frontend/src/ui/catalogo.ui.js`.
- **Recomendación:** diálogo para operaciones transaccionales y panel contextual para catálogo.
- **Estado:** corregido en fase 2.

## UX-009 — Catálogo condicionado por búsqueda de usuario

- **Problema:** no se podía administrar el catálogo sin seleccionar antes un usuario.
- **Impacto:** dependencia conceptual y pasos innecesarios.
- **Severidad:** alta.
- **Archivos:** `frontend/index.html`, `frontend/src/ui/catalogo.ui.js`.
- **Recomendación:** vista autónoma disponible desde navegación principal.
- **Estado:** corregido en fase 2.
