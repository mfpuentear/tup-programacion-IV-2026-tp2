# Ejercicio 1 - Rectángulos (persistido en MySQL)

## Decisiones de diseño

- **Recurso**: `rectangulos`, persistido en una tabla MySQL con `id` autoincremental
  como clave primaria (acá no hay un campo natural único como el nombre en el TP1).

- **Cálculo en el servidor**: el cliente solo envía `lado1` y `lado2` al crear o
  modificar. `perimetro` y `superficie` se calculan en el servidor antes de
  persistir, y nunca se aceptan como datos de entrada (ni se pueden sobrescribir
  manualmente vía la API).

- **Métodos HTTP**:
  - `GET /rectangulos` — listar todos.
  - `GET /rectangulos/:id` — consultar uno puntual.
  - `POST /rectangulos` — crear uno nuevo.
  - `PUT /rectangulos/:id` — reemplazar los lados de uno existente (recalculando
    perímetro y superficie).
  - `DELETE /rectangulos/:id` — eliminar uno.

- **Validaciones con express-validator**:
  - `lado1` y `lado2` deben ser números mayores a 0, tanto en `POST` como en `PUT`.
  - El `:id` en los params debe ser un entero válido en las rutas que lo usan.
  - Ante datos inválidos, la API responde `400 Bad Request` con el detalle del error.
  - Si se consulta, modifica o borra un `id` inexistente, responde `404 Not Found`.