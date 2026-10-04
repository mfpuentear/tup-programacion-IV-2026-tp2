# Ejercicio 2 - API de Tareas

API desarrollada con Express y MySQL para administrar una lista de tareas.

## Modelo de datos

```sql
CREATE TABLE `tareas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `completada` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `nombre_UNIQUE` (`nombre` ASC) VISIBLE
);
```

### Diagrama de entidad

```
┌───────────────────────┐
│         tareas          │
├───────────────────────┤
│ id (PK)         INT      │
│ nombre (UNIQUE) VARCHAR  │
│ completada      TINYINT  │
└───────────────────────┘
```

También se adjunta el Diagrama generado por MySQL Workbench en formato PNG

## Decisiones de diseño

- **`completada` como `TINYINT`**: en MySQL, `BOOLEAN` es un alias de `TINYINT(1)`, por lo que se usa directamente este tipo para representar el estado de la tarea (0 = pendiente, 1 = completada).

- **Criterio de unicidad del nombre**: dos nombres de tarea se consideran **iguales** si, al eliminar los espacios en blanco al principio y al final, y convertir el texto a minúsculas, resultan idénticos. Por ejemplo, `"Lavar los platos"`, `"  lavar LOS platos  "` y `"LAVAR LOS PLATOS"` se consideran la misma tarea.
  - Este criterio se aplica explícitamente en el código, mediante una consulta `SELECT ... WHERE LOWER(TRIM(nombre)) = ?` antes de insertar o actualizar una tarea, en lugar de depender únicamente del comportamiento por defecto (collation) de MySQL. Esto permite documentar y controlar el criterio de forma explícita, además de devolver un mensaje de error claro al cliente.
  - Como respaldo adicional a nivel de base de datos, la columna `nombre` tiene una restricción `UNIQUE`, que actúa como una segunda barrera de seguridad ante condiciones de carrera (dos solicitudes simultáneas intentando crear la misma tarea).
  - Se eligió devolver el status `409 Conflict` (en lugar de `400`) para el caso de nombre duplicado, ya que semánticamente representa mejor una solicitud válida que entra en conflicto con el estado actual del recurso, a diferencia de un `400` que indicaría datos mal formados.

- **Validación con `express-validator`**:
  - `nombre`: obligatorio, no vacío, entre 1 y 100 caracteres.
  - `completada`: debe ser un valor booleano válido (`true`/`false`).
  - Filtro de consulta `completada` (query param): opcional, pero si está presente debe ser un booleano válido.

## Recursos y métodos HTTP

| Método | Endpoint                   | Descripción                                    | Respuestas                                |
| ------ | -------------------------- | ---------------------------------------------- | ----------------------------------------- |
| GET    | `/tareas`                  | Lista todas las tareas                         | `200 OK`                                  |
| GET    | `/tareas?completada=true`  | Lista solo las tareas completadas              | `200 OK` / `400 Bad Request`              |
| GET    | `/tareas?completada=false` | Lista solo las tareas pendientes               | `200 OK` / `400 Bad Request`              |
| GET    | `/tareas/:id`              | Obtiene una tarea por id                       | `200 OK` / `404 Not Found`                |
| POST   | `/tareas`                  | Crea una tarea (recibe `nombre`, `completada`) | `201 Created` / `400` / `409 Conflict`    |
| PUT    | `/tareas/:id`              | Actualiza una tarea existente                  | `200 OK` / `404` / `400` / `409 Conflict` |
| DELETE | `/tareas/:id`              | Elimina una tarea                              | `200 OK` / `404 Not Found`                |

## Pruebas

Ver `tareas.http` para los casos de prueba, incluyendo casos de validación fallida (nombre duplicado con distintas mayúsculas/espacios, nombre faltante, estado no booleano, filtro inválido, id inválido, recurso inexistente).
