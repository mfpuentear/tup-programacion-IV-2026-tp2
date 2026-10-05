# Ejercicio 2 - API de Tareas

## Descripcion

API desarrollada con ExpressJS para administrar una lista de tareas y almacenar la informacion en MySQL.

Cada tarea tiene un nombre y un estado que indica si esta completada.

## Tecnologias

- Node.js
- ExpressJS
- MySQL
- express-validator

## Recursos y metodos

- `GET /tareas` → obtiene todas las tareas.
- `GET /tareas/:id` → obtiene una tarea por ID.
- `GET /tareas/filtrar?estado=completadas` → obtiene tareas completadas.
- `GET /tareas/filtrar?estado=pendientes` → obtiene tareas pendientes.
- `POST /tareas` → crea una tarea.
- `PUT /tareas/:id` → modifica una tarea.
- `DELETE /tareas/:id` → elimina una tarea.

## Validaciones

Se utiliza `express-validator` para validar los parametros, consultas y cuerpos de las solicitudes.

Se verifica que:

- El nombre este presente y no este vacio.
- El nombre sea texto.
- El nombre no supere los 255 caracteres.
- No existan dos tareas con el mismo nombre.
- El estado sea booleano.
- El ID sea un numero entero mayor que cero.
- El filtro solamente acepte `completadas` o `pendientes`.

## Criterio de igualdad

Se considera que dos nombres son iguales cuando, despues de quitar los espacios al principio y al final, tienen el mismo texto.

Por ejemplo, `"Comprar pan"` y `"  Comprar pan  "` representan la misma tarea.

## Diseño de la base de datos

La tabla `tareas` contiene:

- `id` → clave primaria.
- `nombre` → nombre de la tarea.
- `completada` → indica si esta terminada.

El campo `nombre` tiene una restriccion `UNIQUE` para evitar tareas duplicadas.

## Diagrama

`TAREAS`

- `id` → clave primaria
- `nombre`
- `completada`
