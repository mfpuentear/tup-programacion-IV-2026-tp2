# Ejercicio 2 - API de Tareas

## Descripción

En este ejercicio se realizó una API REST con ExpressJS y MySQL para administrar una lista de tareas.
Cada tarea tiene un nombre y un estado que indica si está completada o pendiente.

## Modelo de datos

Se utilizó una tabla llamada `tareas` con los siguientes campos:

- `id`: identificador de la tarea.
- `nombre`: nombre de la tarea.
- `completada`: indica si la tarea está terminada o pendiente.

El campo `id` es la clave primaria y se genera automáticamente.

Elegí este modelo porque es simple y tiene los datos necesarios para guardar y administrar las tareas.

## Diseño de la API

La API utiliza el recurso `tareas` y los métodos HTTP correspondientes:

- `GET /tareas`: muestra todas las tareas.
- `GET /tareas/:id`: muestra una tarea por su ID.
- `POST /tareas`: crea una nueva tarea.
- `PUT /tareas/:id`: modifica una tarea.
- `DELETE /tareas/:id`: elimina una tarea.

También se puede filtrar las tareas según su estado:

- `GET /tareas?completada=true`: muestra las tareas completadas.
- `GET /tareas?completada=false`: muestra las tareas pendientes.

Se eligieron estos métodos porque corresponden a las operaciones que necesitamos realizar sobre las tareas.

## Nombres repetidos

La API no permite crear dos tareas con el mismo nombre.

Para comparar los nombres se ignoran las mayúsculas y minúsculas y también los espacios que pueda tener el nombre al principio o al final.

Por ejemplo, `Hacer ejercicio` y `hacer ejercicio` se consideran el mismo nombre.

Esta misma regla se utiliza cuando se modifica una tarea.

## Validaciones

Se utilizó `express-validator` para validar los datos recibidos por la API.

Se controla que:

- El nombre sea obligatorio.
- El nombre no esté vacío.
- El nombre no supere los 255 caracteres.
- No existan dos tareas con el mismo nombre.
- El estado `completada` sea `true` o `false`.
- El ID sea un número entero positivo.
- El filtro `completada` solamente acepte `true` o `false`.

También se controlan los casos en los que una tarea no existe y los errores del servidor.

## Pruebas

En el archivo `tareas.http` se dejaron diferentes pruebas para comprobar el funcionamiento de la API, incluyendo creación, modificación, eliminación, consultas, filtros y casos con datos inválidos.