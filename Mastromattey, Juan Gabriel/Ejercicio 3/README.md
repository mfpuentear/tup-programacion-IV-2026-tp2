# Ejercicio 3 - API de Calificaciones

## Descripcion

API desarrollada con ExpressJS para administrar materias y calificaciones de alumnos utilizando MySQL.

Cada calificacion contiene el nombre del alumno, la materia y tres notas.

## Tecnologías

- Node.js
- ExpressJS
- MySQL
- express-validator

## Recursos y metodos

### Materias

- `GET /materias` → obtiene todas las materias.
- `GET /materias/:id` → obtiene una materia.
- `POST /materias` → crea una materia.
- `PUT /materias/:id` → modifica una materia.
- `DELETE /materias/:id` → elimina una materia.

### Calificaciones

- `GET /calificaciones` → obtiene todas las calificaciones.
- `GET /calificaciones/:id` → obtiene una calificacion.
- `POST /calificaciones` → crea una calificacion.
- `PUT /calificaciones/:id` → modifica una calificacion.
- `DELETE /calificaciones/:id` → elimina una calificacion.

## Escala de notas

Se utiliza una escala de 0 a 10, permitiendo valores decimales.

Por ejemplo:

- 0 → valido
- 7.5 → valido
- 10 → valido
- -1 → invalido
- 11 → invalido

## Validaciones

Se utiliza `express-validator` para validar:

- Nombre del alumno.
- ID de la materia.
- Existencia de la materia.
- Las tres notas.
- Que las notas esten entre 0 y 10.
- Los IDs utilizados en las URLs.
- Que no exista mas de una calificacion para la misma combinacion de alumno y materia.

## Diseño de la base de datos

Se utilizan dos tablas:

### Materias

Contiene el listado de materias.

### Calificaciones

Contiene el alumno, la materia y sus tres notas.

La tabla `calificaciones` posee una clave foranea `materia_id` que referencia a `materias.id`.

Tambien posee una restriccion `UNIQUE` sobre `(alumno, materia_id)` para impedir que un alumno tenga mas de una calificacion para la misma materia.

No se creo una tabla independiente para alumnos porque el enunciado solamente exige que las materias sean modeladas como una tabla independiente.

## Diagrama

```text
┌────────────────────┐
│      MATERIAS      │
├────────────────────┤
│ PK id              │
│    nombre          │
└─────────┬──────────┘
          │
          │ 1:N
          │
┌─────────▼──────────┐
│   CALIFICACIONES   │
├────────────────────┤
│ PK id              │
│    alumno          │
│ FK materia_id      │
│    nota1           │
│    nota2           │
│    nota3           │
└────────────────────┘
```
