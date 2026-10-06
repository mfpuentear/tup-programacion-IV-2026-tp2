# Ejercicio 3 - API de Notas de Alumnos

API REST desarrollada con ExpressJS y MySQL para administrar las notas de
alumnos por materia.

## Modelo de datos

Se utilizan dos tablas:

### materias

- `id`: identificador único y clave primaria.
- `nombre`: nombre único de la materia.

### notas_alumnos

- `id`: identificador único del registro.
- `alumno`: nombre del alumno.
- `materia_id`: clave foránea que referencia a `materias`.
- `nota1`: primera nota.
- `nota2`: segunda nota.
- `nota3`: tercera nota.

La relación con la tabla `materias` permite almacenar las materias de forma
independiente y asegurar que cada registro de notas esté asociado a una
materia existente.

La combinación de alumno y materia debe ser única, evitando que un mismo
alumno tenga más de un registro para la misma materia.

## Escala de notas

La escala definida para este ejercicio es de 0 a 10.

Cada nota debe ser un valor numérico dentro del siguiente rango:

`0 <= nota <= 10`

Cada registro debe contener exactamente tres notas.

## Recursos y métodos HTTP

### Materias

| Método | Recurso | Descripción |
|---|---|---|
| GET | `/materias` | Obtiene las materias disponibles |

### Notas

| Método | Recurso | Descripción |
|---|---|---|
| GET | `/notas` | Obtiene todos los registros de notas |
| GET | `/notas/:id` | Obtiene un registro por ID |
| POST | `/notas` | Registra las notas de un alumno |
| PUT | `/notas/:id` | Modifica un registro existente |
| DELETE | `/notas/:id` | Elimina un registro |

## Validaciones

Las validaciones se realizan utilizando `express-validator`.

- El nombre del alumno es obligatorio.
- El nombre del alumno no puede superar los 100 caracteres.
- La materia debe existir.
- `materia_id` debe ser un número entero mayor que cero.
- Deben enviarse exactamente tres notas.
- Cada nota debe ser numérica y estar entre 0 y 10.
- Los ID utilizados como parámetros deben ser enteros mayores que cero.
- No puede existir más de un registro para la misma combinación de alumno y materia.

La comparación del nombre del alumno para comprobar duplicados no distingue
entre mayúsculas y minúsculas.

## Respuestas HTTP

- `200 OK`: operación realizada correctamente.
- `201 Created`: registro creado correctamente.
- `400 Bad Request`: datos o parámetros inválidos.
- `404 Not Found`: registro no encontrado.
- `409 Conflict`: ya existe la combinación alumno y materia.
- `500 Internal Server Error`: error al realizar una operación con la base de datos.

## Base de datos

El archivo `database.sql` contiene las instrucciones necesarias para crear
la base de datos, las tablas y las materias utilizadas para las pruebas.

El diagrama entidad-relación se encuentra en `DER_notas.png`.

## Pruebas

El archivo `pruebas.http` contiene solicitudes para probar los distintos
métodos y casos de validación de la API.