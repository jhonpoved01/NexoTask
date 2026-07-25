# Flujo de navegación

## Mapa

```text
NexoTask
├── #usuarios  Usuarios y asignaciones
├── #catalogo  Catálogo de tareas
└── #general   Vista general
```

Solo una vista principal se muestra y permanece operable. El hash conserva el área activa al recargar y permite utilizar Atrás y Adelante sin incorporar un router.

## Usuarios y asignaciones

**Responsabilidad:** administrar las asignaciones de una persona seleccionada.

**Acción principal:** asignar tarea.

**Acciones secundarias:** buscar/cambiar usuario, filtrar, editar asignación, cambiar tarea, reasignar, exportar resultados y eliminar.

**Transiciones:**

1. Sin usuario → buscar documento.
2. Resultado válido → cabecera contextual, resumen y asignaciones.
3. Asignar → diálogo modal → guardar o cancelar.
4. Editar → diálogo modal → guardar o cancelar.
5. Cambiar usuario → vuelve al estado de búsqueda.

**Contexto conservado:** usuario activo, resultados, filtros y orden mientras no se active expresamente “Cambiar usuario”.

## Catálogo de tareas

**Responsabilidad:** administrar plantillas reutilizables.

**Acción principal:** crear tarea.

**Acciones secundarias:** buscar por título, editar y eliminar.

**Transiciones:** crear o editar abre un panel contextual; cancelar lo cierra y devuelve foco; eliminar utiliza confirmación modal.

**Contexto conservado:** consulta de búsqueda, lista cargada, panel abierto y datos introducidos durante la sesión.

## Vista general

**Responsabilidad:** consultar asignaciones de todos los usuarios.

**Acción principal:** aplicar filtros.

**Acciones secundarias:** limpiar filtros, ordenar y exportar resultados visibles.

**Contexto conservado:** usuario filtrado, estado, tarea, orden y resultados. Los datos se actualizan al volver a activar la vista.

## Teclado y foco

- Los enlaces de navegación son elementos `<a>` nativos.
- El enlace activo expone `aria-current="page"`.
- Al cambiar el hash, el foco pasa al `<h2>` de la vista activada.
- El enlace “Saltar al contenido principal” permanece disponible.
- Diálogos admiten Escape y retornan foco al activador.
- Panel de catálogo admite Escape cuando el foco está dentro.
- Filtros, menús mediante `<details>` y acciones usan controles nativos.

## Móvil

La navegación se apila sin depender de hover ni de un menú personalizado. Cada enlace ocupa el ancho disponible, la acción principal se coloca bajo la cabecera y la tabla mantiene desplazamiento horizontal dentro de su propio contenedor.
