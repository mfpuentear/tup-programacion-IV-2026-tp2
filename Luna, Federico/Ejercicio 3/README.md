# Ejercicio 3 - API de Calificaciones

## Descripción

API REST desarrollada con ExpressJS para gestionar las calificaciones de alumnos en materias de una carrera.

La información se persiste en una base de datos MySQL.

Cada calificación contiene:

- Nombre del alumno.
- Materia.
- Tres notas.
- Las notas utilizan una escala de 0 a 10 inclusive.

## Tecnologías utilizadas

- Node.js
- ExpressJS
- MySQL
- mysql2
- express-validator

## Modelo de datos

La base de datos utiliza dos tablas:

### materias

Contiene las materias disponibles.

- `id`: identificador único.
- `nombre`: nombre de la materia.

### calificaciones

Contiene las calificaciones de los alumnos.

- `id`: identificador único.
- `alumno`: nombre del alumno.
- `materia_id`: clave foránea que referencia a `materias`.
- `nota1`: primera nota.
- `nota2`: segunda nota.
- `nota3`: tercera nota.

La relación entre las tablas es:

`materias (1) ---- (N) calificaciones`

Una materia puede tener muchas calificaciones, mientras que cada calificación corresponde a una única materia.

## Criterio de unicidad

No se permite registrar más de una calificación para la misma combinación de alumno y materia.

Para comparar el nombre del alumno se ignoran:

- Mayúsculas y minúsculas.
- Espacios al principio y al final.

Por ejemplo:

`Federico Luna`

y

` federico luna `

se consideran el mismo alumno.

## Validaciones

La API utiliza `express-validator` para validar los datos recibidos.

Se valida:

- Que el nombre del alumno sea obligatorio.
- Que el nombre del alumno tenga una longitud válida.
- Que `materia_id` sea un número entero mayor que cero.
- Que la materia exista.
- Que las tres notas sean numéricas.
- Que las notas estén entre 0 y 10.
- Que no exista otra calificación para el mismo alumno y materia.
- Que los parámetros `id` sean válidos.
- Que el filtro por alumno sea válido.

## Endpoints

### Materias

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/materias` | Obtener todas las materias |
| POST | `/materias` | Crear una materia |
| GET | `/materias/:id` | Obtener una materia por ID |

### Calificaciones

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/calificaciones` | Obtener todas las calificaciones |
| GET | `/calificaciones?alumno=...` | Filtrar por alumno |
| POST | `/calificaciones` | Crear una calificación |
| GET | `/calificaciones/:id` | Obtener una calificación |
| PUT | `/calificaciones/:id` | Modificar una calificación |
| DELETE | `/calificaciones/:id` | Eliminar una calificación |

## Decisiones de diseño

Se decidió utilizar una tabla independiente para las materias porque la consigna requiere que sean entidades independientes y relacionadas mediante una clave foránea.

Las notas se almacenan directamente en la tabla `calificaciones` porque cada registro representa las tres calificaciones de un alumno para una materia.

El cálculo de la información y las validaciones se realizan en el servidor para evitar recibir datos inválidos desde el cliente.

La API utiliza códigos HTTP adecuados según el resultado de cada operación:

- `200`: operación exitosa.
- `201`: recurso creado correctamente.
- `400`: datos inválidos.
- `404`: recurso no encontrado.
- `409`: conflicto por duplicación.