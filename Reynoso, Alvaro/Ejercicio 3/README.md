# API de Calificaciones

API desarrollada con ExpressJS para gestionar las calificaciones de alumnos en las materias de una carrera.

## Tecnologías utilizadas

- Node.js
- ExpressJS
- MySQL
- MySQL2
- Express Validator
- dotenv

## Escala de calificaciones

Se utiliza una escala numérica de 0 a 10, permitiendo valores decimales.

Cada registro contiene exactamente tres notas:

- nota1
- nota2
- nota3

## Modelo de datos

Se utilizan dos tablas:

### materias

Contiene las materias disponibles de la carrera.

### calificaciones

Contiene:

- nombre del alumno
- materia
- nota1
- nota2
- nota3

La materia se relaciona mediante una clave foránea con la tabla materias.

## Regla de unicidad

No puede existir más de un registro para la misma combinación de alumno y materia.

La restricción se implementa mediante:

UNIQUE(nombre_alumno, materia_id)

## Recursos

### Materias

GET /materias

GET /materias/:id

POST /materias

PUT /materias/:id

DELETE /materias/:id

### Alumnos

GET /alumnos

GET /alumnos/:nombre

### Calificaciones

GET /calificaciones

GET /calificaciones/:id

POST /calificaciones

PUT /calificaciones/:id

DELETE /calificaciones/:id

## Validaciones

La API utiliza express-validator para validar:

- Parámetros de las URLs.
- Nombre del alumno.
- Nombre de las materias.
- Existencia de la materia.
- Las tres notas.
- Rango de las notas.
- Identificadores.

Las notas deben estar entre 0 y 10.

## Decisiones de diseño

Se separaron las materias en una tabla independiente para evitar repetir información y permitir relacionarlas mediante una clave foránea.

Las calificaciones poseen un identificador propio y una restricción UNIQUE para evitar duplicaciones de alumno y materia.

Se utilizan códigos HTTP diferenciados según el resultado:

- 200: operación exitosa.
- 201: recurso creado.
- 400: datos inválidos.
- 404: recurso no encontrado.
- 409: conflicto por duplicación.
- 500: error interno del servidor.