# Ejercicio 3: Gestión de Notas

API REST desarrollada con ExpressJS y MySQL para gestionar alumnos, materias y sus calificaciones.

## Tecnologías

- Node.js
- ExpressJS
- MySQL
- mysql2
- express-validator
- dotenv

## Modelo de datos

La base de datos utilizada es `db_notas` y contiene las tablas:

- `alumnos`: almacena los alumnos.
- `materias`: almacena las materias.
- `notas`: almacena las tres calificaciones de un alumno para una materia.

La tabla `notas` posee relaciones mediante claves foráneas con las tablas `alumnos` y `materias`.

El diagrama de la base de datos se encuentra en `diagrama_notas.png`.

## Escala de calificaciones

Las calificaciones utilizan una escala de 0 a 10.

Cada registro contiene exactamente tres notas:

- `nota1`
- `nota2`
- `nota3`

Todas deben ser valores numéricos entre 0 y 10.

## Diseño de la API

### Alumnos

| Método | Recurso | Descripción |
|--------|---------|-------------|
| GET | `/alumnos` | Obtiene todos los alumnos. |
| POST | `/alumnos` | Crea un nuevo alumno. |

### Materias

| Método | Recurso | Descripción |
|--------|---------|-------------|
| GET | `/materias` | Obtiene todas las materias. |
| POST | `/materias` | Crea una nueva materia. |

### Notas

| Método | Recurso | Descripción |
|--------|---------|-------------|
| GET | `/notas` | Obtiene todos los registros de notas. |
| GET | `/notas/:id` | Obtiene un registro de notas por su ID. |
| POST | `/notas` | Crea un registro de notas. |
| PUT | `/notas/:id` | Modifica un registro de notas. |
| DELETE | `/notas/:id` | Elimina un registro de notas. |

## Validaciones

Los nombres de alumnos y materias son obligatorios y no pueden estar vacíos.

Los identificadores de alumno y materia deben ser números enteros positivos.

Las tres calificaciones son obligatorias y deben ser valores numéricos entre 0 y 10.

También se valida que los identificadores de alumno y materia correspondan a registros existentes.

Las validaciones se realizan utilizando `express-validator`.

## Registros duplicados

No se permite que un alumno tenga más de un registro de calificaciones para la misma materia.

Antes de crear o modificar un registro se verifica que no exista otro registro con la misma combinación de alumno y materia.

## Relaciones entre tablas

La tabla `notas` utiliza claves foráneas:

- `alumno_id` referencia a `alumnos.id`.
- `materia_id` referencia a `materias.id`.

Esto permite relacionar cada conjunto de calificaciones con un alumno y una materia existentes.

## Justificación del diseño

Se separaron alumnos, materias y notas en diferentes tablas para representar correctamente las relaciones entre los datos.

Las notas se almacenan en una tabla independiente porque cada registro representa las calificaciones de un alumno en una materia determinada.

Se utilizan claves foráneas para garantizar que los registros de notas solamente puedan relacionarse con alumnos y materias existentes.

La API utiliza los métodos HTTP según la operación que se desea realizar: GET para consultar, POST para crear, PUT para modificar y DELETE para eliminar.

La conexión con MySQL se encuentra separada en el archivo `db.js`, mientras que las rutas de alumnos, materias y notas se encuentran organizadas en módulos independientes.

Las consultas a MySQL utilizan parámetros para evitar incorporar directamente los valores recibidos por el cliente en las consultas SQL.

## Instalación y ejecución

Instalar las dependencias:

```bash
npm install