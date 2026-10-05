# Ejercicio 3

## Descripcion

Se desarrollo una API con ExpressJS para gestionar calificaciones de alumnos en materias de una carrera, persistiendo la informacion en una base de datos MySQL.

Cada calificacion tiene el nombre del alumno, la materia cursada y tres notas. Las materias se guardan en una tabla independiente y se relacionan con las calificaciones mediante una clave foranea.

## Recursos elegidos

Se utilizan dos recursos principales:

- `materias`
- `calificaciones`

El recurso `materias` representa las materias disponibles de la carrera.

El recurso `calificaciones` representa los registros academicos de alumnos en una materia determinada.

## Modelo de datos

La informacion se guarda en dos tablas: `materias` y `calificaciones`.

Tabla `materias`:

- id: clave primaria autoincremental.
- nombre: nombre visible de la materia.
- nombre_normalizado: nombre usado para evitar materias duplicadas.

Tabla `calificaciones`:

- id: clave primaria autoincremental.
- alumno_nombre: nombre visible del alumno.
- alumno_normalizado: nombre usado para comparar duplicados.
- materia_id: clave foranea que referencia a `materias.id`.
- nota_1: primera nota.
- nota_2: segunda nota.
- nota_3: tercera nota.

La relacion entre ambas tablas se realiza mediante `materia_id`.

Una materia puede tener muchas calificaciones asociadas, pero cada calificacion pertenece a una sola materia.

## Regla de unicidad

La API impide que exista mas de un registro para la misma combinacion de alumno y materia.

Para comparar alumnos se utiliza un criterio consistente: se eliminan espacios al principio y al final del nombre y se convierte a minusculas.

Ejemplo:

- `Ana Perez`
- ` ana perez `
- `ANA PEREZ`

Se consideran el mismo alumno.

Por eso, no puede existir mas de una calificacion para ese alumno en la misma materia.

## Escala de notas

La escala definida para las notas es de `1` a `10`.

Cada calificacion debe tener exactamente tres notas numericas dentro de esa escala.

## Datos derivados

El promedio y la condicion academica se calculan al momento de responder la consulta.

No se almacenan en la base de datos porque se pueden obtener a partir de las tres notas.

La condicion se calcula asi:

- `reprobado`: promedio menor a 6.
- `aprobado`: promedio igual o mayor a 6 y menor a 8.
- `promocionado`: promedio igual o mayor a 8.

## Rutas y metodos HTTP

### GET /materias

Lista todas las materias.

Se usa `GET` porque solo consulta informacion.

### GET /materias/:id

Consulta una materia especifica.

Se usa `id` como parametro porque identifica una materia concreta.

### POST /materias

Crea una nueva materia.

Se usa `POST` porque agrega un nuevo registro en la tabla `materias`.

### GET /calificaciones

Lista todas las calificaciones.

Se usa `GET` porque solo consulta informacion y no modifica la base de datos.

### GET /calificaciones/:id

Consulta una calificacion especifica.

Se usa `id` como parametro porque identifica un registro concreto.

### GET /calificaciones?alumno=Ana

Filtra calificaciones por nombre de alumno.

Se usa query param porque es una consulta filtrada sobre el recurso `calificaciones`.

### GET /calificaciones?materiaId=1

Filtra calificaciones por materia.

Tambien se usa query param porque no se crea un recurso nuevo, solo se filtra la consulta.

### POST /calificaciones

Crea una nueva calificacion.

Se usa `POST` porque agrega un nuevo registro en la tabla `calificaciones`.

El cliente debe enviar:

{
  "alumnoNombre": "Ana Perez",
  "materiaId": 1,
  "notas": [8, 9, 10]
}

### PUT /calificaciones/:id

Modifica completamente una calificacion existente.

Se usa `PUT` porque se reemplazan los datos principales del registro: alumno, materia y notas.

### DELETE /calificaciones/:id

Elimina una calificacion existente.

Se usa `DELETE` porque quita un registro de la base de datos.

## Metodos no utilizados

No se usa `PATCH` porque no se implementan modificaciones parciales de calificaciones. Para modificar una calificacion se deben enviar todos los datos necesarios con `PUT`.

No se usa `POST` para consultar porque las consultas corresponden a `GET`.

No se usa `GET` para crear, modificar o eliminar porque `GET` no debe cambiar la informacion almacenada.

## Validaciones

Las validaciones se realizan con `express-validator`.

Se valida que:

- `alumnoNombre` sea obligatorio.
- `alumnoNombre` sea texto.
- `alumnoNombre` tenga entre 2 y 60 caracteres.
- `materiaId` sea obligatorio.
- `materiaId` sea un entero mayor que cero.
- La materia indicada exista.
- `notas` sea obligatorio.
- `notas` sea un arreglo.
- Se informen exactamente tres notas.
- Cada nota sea numerica.
- Cada nota este entre 1 y 10.
- No exista otra calificacion para la misma combinacion alumno-materia.
- El parametro `id` sea un entero mayor que cero.
- Los filtros por query, si se envian, tengan valores validos.

Estas validaciones evitan guardar datos incompletos, invalidos, duplicados o relacionados con materias inexistentes.

## Codigos de estado

- `200 OK`: consulta, modificacion o eliminacion correcta.
- `201 Created`: materia o calificacion creada correctamente.
- `400 Bad Request`: datos invalidos enviados por el cliente.
- `404 Not Found`: materia o calificacion no encontrada.

## Base de datos

La base de datos se entrega mediante el archivo `schema.sql`.

No se envia la base de datos fisica, sino el script necesario para crear la base, las tablas y las materias iniciales.

## Diagrama entidad-relacion

Se incluye una imagen con el diagrama entidad-relacion del ejercicio.

El diagrama muestra la relacion entre `materias` y `calificaciones`, donde `calificaciones.materia_id` referencia a `materias.id`.

## Archivo de pruebas

Se incluye el archivo `calificaciones.http` para probar la API con REST Client.

Incluye pruebas para listar materias, crear calificaciones, listar, filtrar, consultar por id, modificar, eliminar y validar errores.