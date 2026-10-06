\# Ejercicio 3 - API de Calificaciones



API desarrollada con ExpressJS y MySQL para gestionar materias y calificaciones de alumnos.



\## Modelo de datos



Se utilizan dos tablas relacionadas:



\### Materias



\- `id`: identificador único.

\- `nombre`: nombre de la materia.



\### Calificaciones



\- `id`: identificador único.

\- `alumno`: nombre del alumno.

\- `alumno\_normalizado`: nombre utilizado para controlar la unicidad.

\- `materia\_id`: clave foránea que referencia a la materia.

\- `nota1`: primera nota.

\- `nota2`: segunda nota.

\- `nota3`: tercera nota.



La relación entre `materias` y `calificaciones` es de uno a muchos: una materia puede tener muchas calificaciones.



\## Escala de notas



Se definió una escala de \*\*0 a 10\*\*.



Cada registro debe contener exactamente tres notas numéricas y cada una debe estar entre 0 y 10.



\## Regla de unicidad



Un alumno solamente puede tener un registro de calificaciones por materia.



El nombre del alumno se normaliza eliminando espacios al principio y al final y convirtiéndolo a minúsculas.



La base de datos utiliza:



`UNIQUE (alumno\_normalizado, materia\_id)`



Esto impide que exista más de un registro para la misma combinación de alumno y materia, tanto al crear como al modificar información.



\## Endpoints de materias



\- `GET /materias`: obtiene todas las materias.

\- `GET /materias/:id`: obtiene una materia.

\- `POST /materias`: crea una materia.

\- `PUT /materias/:id`: modifica una materia.

\- `DELETE /materias/:id`: elimina una materia.



\## Endpoints de calificaciones



\- `GET /calificaciones`: obtiene todas las calificaciones.

\- `GET /calificaciones/:id`: obtiene una calificación.

\- `POST /calificaciones`: crea una calificación.

\- `PUT /calificaciones/:id`: modifica una calificación.

\- `DELETE /calificaciones/:id`: elimina una calificación.



\## Validaciones



Se utiliza `express-validator` para comprobar:



\- Que los identificadores sean enteros positivos.

\- Que el nombre del alumno esté presente y sea válido.

\- Que `materia\_id` sea un entero positivo.

\- Que se informen exactamente tres notas.

\- Que todas las notas sean numéricas.

\- Que cada nota esté entre 0 y 10.



También se comprueba que la materia exista antes de crear o modificar una calificación.



La restricción `UNIQUE` de MySQL garantiza que no se repita la combinación alumno-materia.



\## Respuestas HTTP



\- `200`: operación realizada correctamente.

\- `201`: recurso creado correctamente.

\- `204`: recurso eliminado correctamente.

\- `400`: datos inválidos o materia inexistente.

\- `404`: recurso no encontrado.

\- `409`: registro duplicado o conflicto.

\- `500`: error interno del servidor.



\## Decisiones de diseño



Las materias se almacenan en una tabla independiente para evitar repetir información y se relacionan con las calificaciones mediante una clave foránea.



La API se divide en rutas, controladores y configuración de base de datos para separar responsabilidades y facilitar el mantenimiento.

