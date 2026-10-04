# Ejercicio 2

## Descripcion

Se desarrollo una API con ExpressJS para administrar tareas, persistiendo la informacion en una base de datos MySQL.

Cada tarea tiene un nombre y un estado que indica si esta completada. La API permite crear, consultar, modificar y eliminar tareas. Tambien permite filtrar las tareas segun su estado: completadas o pendientes.

## Recurso elegido

El recurso elegido es `tareas`, porque la API administra una coleccion de tareas.

Se usa en plural porque representa varios registros dentro de la tabla.

## Modelo de datos

La informacion se guarda en la tabla `tareas`.

Estructura:

tareas

- id: clave primaria autoincremental.
- nombre: nombre visible de la tarea.
- completada: estado de avance de la tarea.
- nombre_normalizado: nombre usado para comparar duplicados.

Se utiliza `id` para identificar cada tarea de forma unica.

Se utiliza `nombre_normalizado` para aplicar un criterio consistente de comparacion. Dos tareas se consideran iguales si sus nombres, luego de quitar espacios al principio y al final y pasarlos a minusculas, coinciden.

Ejemplo:

- `Leer apuntes`
- ` leer apuntes `
- `LEER APUNTES`

Esos nombres se consideran iguales, por lo tanto no pueden cargarse como tareas diferentes.

## Rutas y metodos HTTP

### GET /tareas

Lista todas las tareas guardadas.

Se usa `GET` porque solo consulta informacion y no modifica la base de datos.

### GET /tareas/:id

Consulta una tarea especifica por su id.

Se usa el `id` como parametro porque identifica un registro concreto de la tabla.

### GET /tareas?estado=completadas

Filtra las tareas completadas.

Se usa query param porque es una consulta filtrada sobre el mismo recurso.

### GET /tareas?estado=pendientes

Filtra las tareas pendientes.

Tambien se usa query param porque no se crea un recurso nuevo, solo se filtra la consulta.

### POST /tareas

Crea una nueva tarea.

Se usa `POST` porque agrega un nuevo registro en la base de datos.

El cliente debe enviar:

{
  "nombre": "Leer apuntes",
  "completada": false
}

### PUT /tareas/:id

Modifica completamente una tarea existente.

Se usa `PUT` porque se reemplazan los datos principales de la tarea: `nombre` y `completada`.

### PATCH /tareas/:id/estado

Modifica solamente el estado de una tarea.

Se usa `PATCH` porque se actualiza parcialmente el recurso, cambiando solo el campo `completada`.

### DELETE /tareas/:id

Elimina una tarea existente.

Se usa `DELETE` porque quita un registro de la base de datos.

## Metodos no utilizados

No se usa `POST` para consultar tareas porque las consultas corresponden a `GET`.

No se usa `PUT` para cambiar solamente el estado porque `PUT` representa una modificacion completa. Para cambiar solo el estado se usa `PATCH`.

No se usa `PATCH` para crear tareas porque `PATCH` se utiliza para modificar parcialmente un recurso existente.

No se usa `GET` para crear, modificar o eliminar porque `GET` no debe cambiar la informacion almacenada.

## Validaciones

Las validaciones se realizan con `express-validator`.

Se valida que:

- `nombre` sea obligatorio.
- `nombre` sea texto.
- `nombre` tenga entre 3 y 60 caracteres.
- No exista otra tarea con el mismo nombre normalizado.
- `completada` sea obligatoria al crear o modificar una tarea.
- `completada` sea un valor booleano valido.
- El parametro `id` sea un entero mayor que cero.
- El query param `estado`, si se envia, sea `completadas` o `pendientes`.

Estas validaciones evitan guardar datos incompletos, invalidos o duplicados.

## Codigos de estado

- `200 OK`: consulta, modificacion o eliminacion correcta.
- `201 Created`: tarea creada correctamente.
- `400 Bad Request`: datos invalidos enviados por el cliente.
- `404 Not Found`: tarea no encontrada.
- `409 Conflict`: nombre de tarea duplicado.

## Base de datos

La base de datos se entrega mediante el archivo `schema.sql`.

No se envia la base de datos fisica, sino el script necesario para crear la base y la tabla.

## Diagrama entidad-relacion

Se incluye una imagen con el diagrama entidad-relacion del ejercicio.

El modelo contiene una unica entidad: `tareas`.

Como solo se necesita una tabla, no hay relaciones con otras entidades.

## Archivo de pruebas

Se incluye el archivo `tareas.http` para probar la API con REST Client.

Incluye pruebas para crear, listar, filtrar por estado, consultar por id, modificar, actualizar estado, eliminar y validar errores.