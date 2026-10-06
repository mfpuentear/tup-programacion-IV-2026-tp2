# Ejercicio 2 - API de Tareas

API REST desarrollada con ExpressJS y MySQL para administrar una lista de tareas.

## Modelo de datos

Se utiliza la tabla `tareas` con los siguientes campos:

- `id`: identificador único de la tarea y clave primaria.
- `nombre`: nombre de la tarea.
- `completada`: estado booleano que indica si la tarea está completada o pendiente.

El nombre se define como único para evitar tareas duplicadas.

## Criterio para nombres duplicados

Los nombres de las tareas se comparan sin distinguir entre mayúsculas y
minúsculas mediante `LOWER()`.

Por ejemplo, `Estudiar` y `estudiar` se consideran el mismo nombre.

La validación se realiza tanto al crear como al modificar una tarea. Al
modificar, se excluye de la comparación la propia tarea que se está editando.

## Recursos y métodos HTTP

El recurso utilizado es `/tareas`.

| Método | Recurso | Descripción |
|---|---|---|
| GET | `/tareas` | Obtiene todas las tareas |
| GET | `/tareas/:id` | Obtiene una tarea por su ID |
| POST | `/tareas` | Crea una nueva tarea |
| PUT | `/tareas/:id` | Modifica una tarea existente |
| DELETE | `/tareas/:id` | Elimina una tarea |

## Filtro por estado

El endpoint `GET /tareas` permite filtrar las tareas mediante el parámetro
de consulta `estado`.

Ejemplos:

- `/tareas?estado=completadas`
- `/tareas?estado=pendientes`

Si no se especifica el parámetro `estado`, se obtienen todas las tareas.

## Validaciones

Las validaciones se realizan utilizando `express-validator`.

- El nombre es obligatorio y no puede estar vacío.
- El nombre no puede superar los 100 caracteres.
- `completada` debe ser un valor booleano.
- Los ID deben ser números enteros mayores que cero.
- El filtro `estado` solamente admite `completadas` o `pendientes`.
- No se permiten tareas con nombres duplicados.

## Respuestas HTTP

La API utiliza, entre otros, los siguientes códigos:

- `200 OK`: operación realizada correctamente.
- `201 Created`: tarea creada correctamente.
- `400 Bad Request`: datos, parámetros o filtros inválidos.
- `404 Not Found`: tarea no encontrada.
- `409 Conflict`: ya existe otra tarea con el mismo nombre.
- `500 Internal Server Error`: error al realizar una operación con la base de datos.

## Base de datos

El archivo `database.sql` contiene las instrucciones necesarias para crear
la base de datos y la tabla.

El diagrama entidad-relación se encuentra en `DER_tareas.png`.

## Pruebas

El archivo `pruebas.http` contiene solicitudes para probar los métodos,
filtros y validaciones de la API.