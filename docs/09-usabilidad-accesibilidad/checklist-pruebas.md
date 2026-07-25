# Checklist de pruebas

Las casillas requieren validación manual salvo que indiquen lo contrario.

## Navegación de fase 2

- [ ] Cambiar entre Usuarios, Catálogo y Vista general.
- [ ] Confirmar que solo una vista principal está visible y operable.
- [ ] Recargar con `#usuarios`, `#catalogo` y `#general`.
- [ ] Usar Atrás y Adelante del navegador.
- [ ] Confirmar `aria-current="page"` en el enlace activo.
- [ ] Confirmar foco en el título al cambiar de vista.
- [ ] Abrir cada vista usando únicamente teclado.
- [ ] Verificar navegación apilada a 320 px y 375 px.

## Contexto por vista

- [ ] Seleccionar usuario, visitar otra vista y volver sin perderlo.
- [ ] Aplicar filtros del usuario, cambiar de vista y comprobar que se conservan.
- [ ] Aplicar filtros globales, cambiar de vista y comprobar que se conservan.
- [ ] Confirmar que la vista de usuario no ofrece filtro de usuario.
- [ ] Confirmar que la vista global no muestra usuario activo.
- [ ] Confirmar que una respuesta tardía solo actualiza su propia vista.

## Catálogo de fase 2

- [ ] Entrar directamente con `#catalogo` sin buscar usuario.
- [ ] Buscar tareas por título.
- [ ] Abrir y cerrar el panel de creación.
- [ ] Editar y conservar descripción.
- [ ] Cancelar con botón y Escape.
- [ ] Usar “Más acciones” con teclado.
- [ ] Comprobar estado vacío y búsqueda sin resultados.

## Vista general de fase 2

- [ ] Cargar todas las asignaciones al activar la vista.
- [ ] Filtrar por usuario, estado y tarea.
- [ ] Ordenar por cada criterio.
- [ ] Exportar exactamente los resultados visibles.
- [ ] Confirmar resumen y cantidad global.

## Seguridad e integridad

- [ ] Renderizar `<img src=x onerror=alert('XSS')>` como texto sin ejecución.
- [ ] Probar ID numérico.
- [ ] Probar ID numérico almacenado como string.
- [ ] Probar ID alfanumérico.
- [ ] Probar ID inexistente.
- [ ] Confirmar que ninguna petición contiene `/NaN`.
- [ ] Editar solo el título y comprobar que la descripción se conserva.
- [ ] Provocar error al guardar y comprobar que título y descripción permanecen.

## HTTP

- [ ] Backend apagado: mostrar error de conexión, no “usuario no encontrado”.
- [ ] Usuario inexistente: mostrar mensaje específico.
- [ ] Endpoint con 400/422: informar datos inválidos.
- [ ] Endpoint con 404: informar recurso no encontrado.
- [ ] Endpoint con 500: informar error del servidor.
- [ ] Respuesta no JSON o estructura inesperada: informar respuesta inesperada.
- [ ] Respuesta válida: completar la operación.

## Acciones destructivas

- [ ] Cancelar no elimina.
- [ ] Escape no elimina.
- [ ] Confirmar sí elimina.
- [ ] El diálogo identifica tarea y usuario cuando corresponde.
- [ ] El diálogo informa que no se puede deshacer.
- [ ] El foco inicial está en Cancelar.
- [ ] El foco vuelve al activador.
- [ ] Eliminar una tarea disponible no elimina asignaciones existentes.

## Teclado y foco

- [ ] Recorrer controles con Tab.
- [ ] Retroceder con Shift+Tab.
- [ ] Activar botones con Enter.
- [ ] Activar botones con Espacio.
- [ ] Cerrar diálogo y panel del catálogo con Escape.
- [ ] Usar todos los formularios sin ratón.
- [ ] Abrir y cerrar filtros y comprobar `aria-expanded`.
- [ ] Confirmar foco visible en todos los controles.
- [ ] Usar el enlace “Saltar al contenido principal”.

## Formularios

- [ ] Enviar cada campo obligatorio vacío.
- [ ] Comprobar mensaje específico y `aria-invalid`.
- [ ] Comprobar foco en el primer campo inválido.
- [ ] Confirmar que los valores válidos se conservan.
- [ ] Confirmar que un error del servidor no cierra el formulario.
- [ ] Confirmar estado inicial “Pendiente”.

## Lectores de pantalla

- [ ] Probar NVDA con Firefox.
- [ ] Probar VoiceOver con Safari si está disponible.
- [ ] Escuchar labels, ayudas y errores.
- [ ] Escuchar notificaciones de estado sin cambio forzado de foco.
- [ ] Escuchar errores importantes como alerta.
- [ ] Navegar la tabla por encabezados.
- [ ] Verificar nombres contextuales de Editar y Eliminar.
- [ ] Confirmar anuncio no excesivo de resultados.

## Contraste

- [ ] Medir texto normal con relación mínima 4.5:1.
- [ ] Medir texto grande y componentes con relación mínima 3:1.
- [ ] Medir foco, errores y botones sobre el fondo efectivo.
- [ ] Confirmar que ningún estado depende solo del color.

## Responsive y zoom

- [ ] Probar 320 px.
- [ ] Probar 375 px.
- [ ] Probar 768 px.
- [ ] Probar 1024 px.
- [ ] Probar zoom al 200 %.
- [ ] Confirmar que solo el contenedor de tabla desplaza horizontalmente.
- [ ] Confirmar que notificaciones y diálogo no ocultan controles.

## Movimiento reducido

- [ ] Activar `prefers-reduced-motion: reduce`.
- [ ] Confirmar que no se inician partículas.
- [ ] Confirmar ausencia de desplazamiento de botones.
- [ ] Confirmar reducción de transiciones.
- [ ] Confirmar que no hay scroll suave forzado.

## Regresión funcional

- [ ] Buscar usuario.
- [ ] Consultar sus asignaciones.
- [ ] Crear y editar tarea disponible.
- [ ] Eliminar tarea disponible.
- [ ] Asignar tarea.
- [ ] Editar asignación.
- [ ] Cambiar tarea asociada.
- [ ] Reasignar usuario.
- [ ] Eliminar una asignación.
- [ ] Eliminar todas las asignaciones.
- [ ] Aplicar, limpiar y cerrar filtros.
- [ ] Ordenar por fecha, nombre y estado.
- [ ] Exportar resultados y validar cantidad anunciada.
