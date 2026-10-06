# Ejercicio 2 - API de Tareas

## Descripción

API REST desarrollada con ExpressJS para administrar una lista de tareas persistida en una base de datos MySQL.

Cada tarea contiene:

- ID
- Nombre
- Estado de completada

## Tecnologías utilizadas

- Node.js
- ExpressJS
- MySQL
- mysql2
- express-validator

## Modelo de datos

La información se almacena en la tabla `tareas`.

### Tabla tareas

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT | Identificador único |
| nombre | VARCHAR(255) | Nombre de la tarea |
| completada | BOOLEAN | Indica si la tarea está completada |

El campo `id` es la clave primaria y se genera automáticamente.

## Criterio de comparación de nombres

Para impedir tareas duplicadas se utiliza un criterio consistente:

- Se eliminan los espacios al principio y al final.
- No se diferencian mayúsculas y minúsculas.

Por ejemplo:

`Estudiar JavaScript`

` estudiar javascript `

son considerados el mismo nombre.

## Endpoints

### GET /tareas

Obtiene todas las tareas.

### GET /tareas/:id

Obtiene una tarea específica mediante su ID.

### GET /tareas?completada=true

Obtiene solamente las tareas completadas.

### GET /tareas?completada=false

Obtiene solamente las tareas pendientes.

### POST /tareas

Crea una nueva tarea.

Ejemplo:

```json
{
    "nombre": "Estudiar JavaScript",
    "completada": false
}