# Ejercicio 2 - Tareas (persistido en MySQL)

## Decisiones de diseño

- **Recurso**: `tareas`, persistido en una tabla MySQL con `id` autoincremental
  como clave primaria.

- **Criterio de unicidad de nombre**: dos nombres se consideran iguales si,
  tras sacarles los espacios de los extremos y pasarlos a minúsculas, son
  idénticos (`LOWER(TRIM(nombre))`). Así, "Lavar platos" y "  lavar PLATOS  "
  se tratan como el mismo nombre y no se permite duplicarlo. Esta validación
  se hace con un validador asíncrono personalizado (`.custom()`) de
  express-validator, que consulta la base antes de aceptar la creación.

- **Métodos HTTP**:
  - `GET /tareas` — listar todas.
  - `GET /tareas?completada=true` / `?completada=false` — filtrar por estado.
  - `GET /tareas/:id` — consultar una puntual.
  - `POST /tareas` — crear una tarea nueva (nace como pendiente).
  - `PATCH /tareas/:id` — marcar como completada o pendiente. Se usa `PATCH`
    porque modifica parcialmente el recurso (solo el estado), no lo reemplaza
    entero.
  - `DELETE /tareas/:id` — eliminar una tarea.

- **Validaciones con express-validator**:
  - `nombre` es obligatorio, de hasta 255 caracteres, y único según el
    criterio descripto arriba.
  - `completada` debe ser un valor booleano válido al modificar el estado.
  - El filtro `completada` en query, cuando se usa, debe ser exactamente
    `"true"` o `"false"`.
  - El `:id` en los params debe ser un entero válido.
  - Ante datos inválidos, la API responde `400 Bad Request` con el detalle.
  - Si se consulta, modifica o borra un `id` inexistente, responde
    `404 Not Found`.