# Ejercicio 2: Tareas

## Decisiones de diseño

### Modelado de la información

La tabla `tareas` tiene tres columnas: `id` (autoincremental), `nombre` (`VARCHAR(100)`) y `completada` (`BOOLEAN`, equivalente a `TINYINT(1)` en MySQL, con valor por defecto `false`).

### Criterio de unicidad del nombre

La unicidad se garantiza en **dos capas**:

1. En la base de datos, la columna `nombre` tiene la restricción `UNIQUE`, usando el _collation_ por defecto de MySQL 8 (`utf8mb4_0900_ai_ci`), que compara ignorando mayúsculas/minúsculas y tildes. Así, "Entregar el TP2" y "entregar el tp2" se consideran el mismo nombre.
2. En la API, antes de insertar o actualizar, se consulta si ya existe una tarea con ese nombre (excluyendo la propia tarea al modificar) y se responde `409 Conflict` si hay coincidencia, en vez de dejar que falle la restricción de la base con un error menos claro para el cliente.

Además, el nombre se recorta de espacios sobrantes (`trim`) antes de guardarse o compararse.

### Recurso y endpoints

El recurso es `/tareas` (sustantivo en plural).

| Método | Ruta                     | Descripción                                                       | Respuestas         |
| ------ | ------------------------ | ----------------------------------------------------------------- | ------------------ |
| GET    | `/tareas`                | Lista las tareas. Admite `?completada=true` o `?completada=false` | 200, 400           |
| GET    | `/tareas/:id`            | Consulta una tarea                                                | 200, 400, 404      |
| POST   | `/tareas`                | Crea una tarea (`completada` es `false` por defecto)              | 201, 400, 409      |
| PUT    | `/tareas/:id`            | Reemplaza nombre y estado completos                               | 200, 400, 404, 409 |
| PATCH  | `/tareas/:id/completada` | Cambia solo el estado de completada/pendiente                     | 200, 400, 404      |
| DELETE | `/tareas/:id`            | Elimina una tarea                                                 | 204, 400, 404      |

### Elección de métodos HTTP

- `GET` para consultas.
- `POST` para crear, con `201 Created` y encabezado `Location`.
- `PUT` para reemplazar nombre y estado juntos (idempotente).
- `PATCH /tareas/:id/completada` para la operación más habitual sobre una tarea: marcarla como completada o pendiente, sin tener que reenviar el nombre. Se modela como un sub-recurso del estado, en vez de un `PATCH` genérico sobre toda la tarea, para dejar explícito qué se puede modificar parcialmente.
- `DELETE` para eliminar, con `204 No Content`.

### Consultas por estado

Se resuelve con un filtro por _query string_ (`?completada=true` / `?completada=false`) sobre la misma colección, en lugar de crear rutas separadas como `/tareas/completadas`. Es una operación de filtrado sobre el recurso, no un recurso distinto, y permite combinarse con otros filtros en el futuro sin romper la estructura de la API.

### Validación con express-validator

- **Body:** `nombre` obligatorio en `POST` y `PUT` (texto no vacío, hasta 100 caracteres); `completada` obligatorio en `PUT` y en `PATCH /:id/completada`, opcional en `POST` (con `false` por defecto); siempre debe ser un booleano real.
- **Params:** `id` debe ser un entero positivo.
- **Query:** `completada`, si se envía como filtro, debe ser `true` o `false`.

### Persistencia en MySQL

Se usa el mismo _pool_ de conexiones (`db.js`) compartido con el resto del TP, configurado con variables de entorno para no exponer credenciales en el código.

### Manejo de errores

- `400 Bad Request`: datos inválidos.
- `404 Not Found`: tarea o ruta inexistente.
- `409 Conflict`: nombre repetido.
- `500 Internal Server Error`: errores inesperados.

### Pruebas

El archivo `tareas.http` incluye casos exitosos (listar, filtrar, crear, consultar, marcar como completada, reemplazar, eliminar) y casos de error (nombre repetido al crear y modificar, nombre faltante, estado inválido, filtro inválido, id inválido y tarea inexistente).

## Diagrama entidad-relación

```
┌─────────────────────────┐
│          tareas         │
├─────────────────────────┤
│ id          PK  INT     │
│ nombre      VARCHAR UNIQUE│
│ completada  BOOLEAN     │
└─────────────────────────┘
```

Entidad única y autónoma, sin relaciones con otras tablas.
