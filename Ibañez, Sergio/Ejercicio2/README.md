# Ejercicio 2 - API de tareas con MySQL

## Que hace
API para administrar tareas persistidas en MySQL. Cada tarea tiene nombre y un estado de avance, y no pueden existir dos tareas con el mismo nombre.

## Modelo de datos
Tabla tareas con id, nombre y completada (booleano). En las respuestas se agrega el campo estado en texto (completada/pendiente) como dato derivado para facilitar la lectura.

## Criterio de comparacion de nombres
Dos nombres se consideran iguales si coinciden sin mayusculas y sin espacios extra (LOWER(TRIM(nombre))). Al guardar, el nombre se guarda ya recortado, asi el dato queda normalizado. La tabla tiene ademas un UNIQUE KEY como respaldo a nivel base.

## Recursos y metodos
- GET /tareas: listado con filtro opcional por estado (?estado=completada o pendiente).
- GET /tareas/:id: detalle de una tarea.
- POST /tareas: crea la tarea; si no se envia completada, nace pendiente. Responde 201.
- PUT /tareas/:id: reemplazo completo, nombre y completada obligatorios.
- PATCH /tareas/:id: modificacion parcial, por ejemplo marcar completada sin reenviar el nombre.
- DELETE /tareas/:id: elimina la tarea.

## Validaciones con express-validator
- Body: nombre obligatorio, texto de 1 a 100 caracteres; completada booleano, obligatorio en PUT y opcional en POST y PATCH; en PATCH al menos un campo presente.
- Params: id entero mayor a 0.
- Query: estado solo completada o pendiente, opcional.
- Respuestas: 400 datos invalidos, 404 no encontrada, 409 nombre repetido, 201 creada.

## Decisiones de diseño
- Estructura modular como el ejemplo de clase: db.js, validaciones.js, tareas.js e index.js.
- La unicidad se controla en el codigo para responder 409 con mensaje claro, y el UNIQUE KEY de la tabla actua como ultimo candado.
- El filtro por estado se traduce a completada = 1 o 0 en el WHERE, con el valor validado contra la lista admitida.
- PATCH ademas de PUT porque marcar una tarea como completada es la operacion mas comun y no deberia exigir reenviar el nombre.