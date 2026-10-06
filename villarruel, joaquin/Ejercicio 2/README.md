\# Ejercicio 2 - API de Tareas



API desarrollada con ExpressJS y MySQL para administrar una lista de tareas.



\## Modelo de datos



Cada tarea contiene:



\- `id`: identificador único de la tarea.

\- `nombre`: nombre original de la tarea.

\- `nombre\_normalizado`: nombre utilizado para controlar la unicidad.

\- `completada`: indica si la tarea está completada o pendiente.



Para evitar tareas duplicadas, el nombre se normaliza eliminando espacios al principio y al final y convirtiéndolo a minúsculas.



Por ejemplo:



`Comprar pan` y ` comprar PAN ` se consideran el mismo nombre.



El campo `nombre\_normalizado` posee una restricción `UNIQUE` en MySQL para garantizar que no existan dos tareas con el mismo nombre normalizado.



\## Endpoints



\- `POST /tareas`: crea una tarea.

\- `GET /tareas`: obtiene todas las tareas.

\- `GET /tareas?estado=true`: obtiene las tareas completadas.

\- `GET /tareas?estado=false`: obtiene las tareas pendientes.

\- `GET /tareas/:id`: obtiene una tarea por su ID.

\- `PUT /tareas/:id`: modifica una tarea.

\- `DELETE /tareas/:id`: elimina una tarea.



\## Validaciones



Se utiliza `express-validator` para validar:



\- Que el ID sea un número entero positivo.

\- Que el nombre esté presente y sea un texto válido.

\- Que el nombre no esté vacío ni supere los 255 caracteres.

\- Que `completada` sea un valor booleano.

\- Que el filtro `estado` solamente acepte `true` o `false`.



Además, la base de datos controla la unicidad del nombre mediante el campo `nombre\_normalizado`.



\## Respuestas HTTP



\- `200`: solicitud realizada correctamente.

\- `201`: tarea creada correctamente.

\- `204`: tarea eliminada correctamente.

\- `400`: datos enviados inválidos.

\- `404`: tarea no encontrada.

\- `409`: ya existe una tarea con el mismo nombre.

\- `500`: error interno del servidor.



\## Base de datos



Se utiliza MySQL y una tabla llamada `tareas`.



```sql

CREATE TABLE tareas (

&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,

&#x20;   nombre VARCHAR(255) NOT NULL,

&#x20;   nombre\_normalizado VARCHAR(255) NOT NULL UNIQUE,

&#x20;   completada BOOLEAN NOT NULL DEFAULT FALSE

);

