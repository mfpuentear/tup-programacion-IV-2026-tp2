# Ejercicio 2: Gestión de Tareas

API REST desarrollada con ExpressJS y MySQL para gestionar tareas.

## Tecnologías

- Node.js
- ExpressJS
- MySQL
- mysql2
- express-validator
- dotenv

## Modelo de datos

La base de datos utilizada es `db_tareas` y contiene la tabla `tareas`.

La tabla almacena:

- `id`: identificador único de la tarea.
- `nombre`: nombre de la tarea.
- `completada`: indica si la tarea está completada o pendiente.

El diagrama de la base de datos se encuentra en `diagrama_tareas.png`.

## Diseño de la API

La API utiliza los siguientes recursos y métodos:

| Método | Recurso | Descripción |
|--------|---------|-------------|
| GET | `/tareas` | Obtiene todas las tareas. |
| GET | `/tareas?estado=pendiente` | Obtiene solamente las tareas pendientes. |
| GET | `/tareas?estado=completada` | Obtiene solamente las tareas completadas. |
| GET | `/tareas/:id` | Obtiene una tarea por su ID. |
| POST | `/tareas` | Crea una nueva tarea. |
| PUT | `/tareas/:id` | Modifica una tarea existente. |
| DELETE | `/tareas/:id` | Elimina una tarea. |

## Validaciones

El nombre de la tarea es obligatorio y no puede estar vacío.

El campo `completada` es obligatorio y debe ser un valor booleano.

También se valida que el ID utilizado en las operaciones que lo requieren sea un número entero positivo.

El parámetro de consulta `estado` solamente puede tomar los valores `pendiente` o `completada`.

Las validaciones se realizan utilizando `express-validator`.

## Control de nombres duplicados

No se permiten tareas con nombres duplicados.

Para realizar la comparación se utiliza un criterio consistente que no diferencia entre mayúsculas y minúsculas y que ignora los espacios al principio y al final del nombre.

Por ejemplo, los siguientes nombres se consideran iguales:

- `Comprar pan`
- `comprar pan`
- `  Comprar pan  `

La comprobación se realiza tanto al crear como al modificar una tarea.

## Filtrado por estado

Las tareas pueden consultarse según su estado mediante el parámetro de consulta `estado`.

Ejemplos:

```text
GET /tareas?estado=pendiente
GET /tareas?estado=completada