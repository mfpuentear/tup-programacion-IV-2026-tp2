# Ejercicio 3 - API de calificaciones con MySQL

## Que hace
API para gestionar calificaciones de alumnos en materias de una carrera, persistidas en MySQL. Las materias viven en su propia tabla y cada calificacion apunta a una materia con clave foranea.

## Modelo de datos
- Tabla materias: id y nombre, con nombre unico.
- Tabla calificaciones: id, alumno, materia_id (FK a materias), nota1, nota2 y nota3.
- UNIQUE KEY (alumno, materia_id): impide mas de un registro por alumno y materia, tanto al crear como al modificar.

## Escala de notas documentada
Notas de 0 a 10 inclusive, con hasta dos decimales. De ahi derivan dos datos de lectura que no se guardan: el promedio de las tres notas y la condicion (promocionada con promedio >= 8, regular con >= 6, desaprobada con menos de 6).

## Criterio de comparacion
Dos registros se consideran repetidos si el nombre del alumno coincide sin mayusculas y sin espacios extra (LOWER(TRIM(alumno))) y la materia es la misma. El nombre se guarda ya recortado.

## Recursos y metodos
- GET /materias y GET /materias/:id: listado y detalle de materias.
- POST /materias: crea materia. Responde 201.
- PUT /materias/:id: renombra materia.
- DELETE /materias/:id: elimina materia solo si no tiene calificaciones; si tiene, responde 409.
- GET /materias/:id/calificaciones: calificaciones de una materia.
- GET /calificaciones: listado con filtros opcionales por materiaId y por alumno.
- GET /calificaciones/:id: detalle de una calificacion.
- POST /calificaciones: crea con alumno, materiaId y las tres notas. Responde 201.
- PUT /calificaciones/:id: modifica la cursada completa.
- DELETE /calificaciones/:id: elimina la calificacion.

## Validaciones con express-validator
- Body calificaciones: alumno texto de 1 a 100 obligatorio; materiaId entero positivo; nota1, nota2 y nota3 obligatorias, numericas y entre 0 y 10.
- Body materias: nombre texto de 1 a 100 obligatorio.
- Params: id entero mayor a 0.
- Query: materiaId entero positivo y alumno texto, ambos opcionales.
- Respuestas: 400 datos invalidos, 404 materia o calificacion inexistente, 409 combinacion repetida o nombre de materia repetido, 201 creado.

## Decisiones de diseño
- Estructura modular como el ejemplo de clase: db.js, validaciones.js, un router por recurso (materias.js y calificaciones.js) e index.js que monta todo.
- La existencia de la materia y la unicidad alumno+materia se controlan antes del INSERT y del UPDATE, para responder 404 y 409 con mensaje claro; el UNIQUE KEY y la FOREIGN KEY de la tabla actuan como ultimo candado.
- El JOIN con materias permite devolver el nombre de la materia en cada calificacion, y el promedio y la condicion se calculan al responder como datos derivados.
- No se incluye PATCH en calificaciones: una cursada se corrige completa, no tiene sentido modificar una nota suelta sin revalidar el resto.
- El DELETE de materias se protege con 409 si tiene calificaciones, para no romper la clave foranea.