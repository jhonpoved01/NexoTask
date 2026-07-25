# Auditoría de accesibilidad

## A11Y-001 — Controles personalizados no operables

- **Problema:** `div` y `span` funcionaban como selector, opción y botón.
- **WCAG:** 2.1.1 Teclado; 4.1.2 Nombre, función, valor.
- **Evidencia:** listeners exclusivos de `click` y control nativo oculto.
- **Corrección:** selectores nativos y botones fuera de sus opciones.
- **Prueba realizada:** inspección estática de elementos y listeners.
- **Estado:** corregido; prueba manual de navegador pendiente.

## A11Y-002 — Formularios sin asociaciones completas

- **Problema:** campos sin label y errores no asociados.
- **WCAG:** 1.3.1 Información y relaciones; 3.3.1 Identificación de errores; 3.3.2 Etiquetas o instrucciones.
- **Evidencia:** placeholders como único nombre y spans sin `aria-describedby`.
- **Corrección:** labels visibles, ayuda, errores asociados y actualización de `aria-invalid`.
- **Prueba realizada:** inspección estática de `for`, `id` y referencias.
- **Estado:** corregido; lector de pantalla pendiente.

## A11Y-003 — Regiones dinámicas no anunciadas

- **Problema:** notificaciones, errores y resultados cambiaban sin región viva.
- **WCAG:** 4.1.3 Mensajes de estado.
- **Evidencia:** contenedores genéricos sin rol.
- **Corrección:** `role="status"`, `role="alert"`, `aria-live` y resumen de resultados.
- **Prueba realizada:** inspección estática.
- **Estado:** corregido; validación con NVDA/VoiceOver pendiente.

## A11Y-004 — Tabla con semántica incompleta

- **Problema:** faltaban caption, scope y nombres contextuales en acciones repetidas.
- **WCAG:** 1.3.1 Información y relaciones; 2.4.6 Encabezados y etiquetas.
- **Corrección:** caption, `scope="col"`, botones con nombres accesibles y contenedor desplazable.
- **Prueba realizada:** inspección del DOM generado.
- **Estado:** corregido; comportamiento con zoom pendiente.

## A11Y-005 — Foco no gestionado

- **Problema:** paneles se abrían sin foco y no lo devolvían al cerrar.
- **WCAG:** 2.4.3 Orden del foco; 2.4.7 Foco visible; 2.4.11 Foco no oculto.
- **Corrección:** foco inicial, retorno al activador, enlace de salto y `:focus-visible`.
- **Prueba realizada:** revisión de manejadores.
- **Estado:** implementado; recorrido manual pendiente.

## A11Y-006 — Movimiento continuo

- **Problema:** partículas, transiciones y desplazamiento de hover sin alternativa.
- **WCAG:** 2.3.3 Animación de interacciones.
- **Corrección:** no iniciar partículas y reducir transiciones/desplazamientos con `prefers-reduced-motion`.
- **Prueba realizada:** inspección de media query y configuración.
- **Estado:** implementado; prueba del sistema operativo pendiente.

## A11Y-007 — Confirmaciones destructivas

- **Problema:** confirmaciones inexistentes o genéricas y sin estrategia de foco.
- **WCAG:** 3.3.4 Prevención de errores; 2.1.1 Teclado.
- **Corrección:** `<dialog>` nativo reutilizable, Cancelar como foco inicial, Escape y retorno de foco.
- **Prueba realizada:** revisión estática.
- **Estado:** implementado; compatibilidad manual pendiente.
