# Ejercicio 3: API de calificaciones

Escala de notas:
Las notas son numeros entre "0 y 10 "(inclusive), con hasta 2 decimales. Cada calificacion tiene exactamente 3 notas.

Recursos y metodos:
Metodo, Ruta, Descripcion y Respuestas 

GET  /materias - Lista de materias - 200 
GET  /materias/:id - Detalle - 200, 400, 404 
POST  /materias - Crea (nombre) - 201, 400, 409 
PUT  /materias/:id - Modifica - 200, 400, 404, 409 
DELETE  /materias/:id - Elimina (si no tiene calificaciones) - 204, 400, 404, 409 
GET  /calificaciones - Lista; filtros opcionales "alumno" y "materiaId" - 200, 400 
GET  /calificaciones/:id - Detalle - 200, 400, 404 
POST  /calificaciones - Crea (alumno, materiaId, notas) - 201, 400, 409 
PUT  /calificaciones/:id - Modifica - 200, 400, 404, 409 
DELETE  /calificaciones/:id - Elimina - 204, 400, 404 


Decisiones de diseño:

Modelo de datos:
- Dos tablas: "materias" y "calificaciones". La materia es una tabla independiente y cada calificacion la referencia con la clave foránea "materia_id", asi el nombre de la materia se guarda una sola vez y no se repite ni se escribe distinto en cada registro.
- El alumno no es una tabla: el enunciado solo pide su nombre, por lo que se guarda en cada calificacion. Esto implica que dos alumnos con el mismo nombre se consideran la misma persona; si se agregaran datos como legajo o DNI, convendria crear una tabla "alumnos".
- Las tres notas se guardan en tres columnas ("nota1", "nota2", "nota3") porque la cantidad es fija. Son "DECIMAL(4,2)", que evita errores de redondeo y admite la escala 0–10 con 2 decimales.
- Unicidad: indice UNIQUE sobre ("alumno", "materia_id"). Los nombres se comparan sin distinguir mayúsculas, tildes ni espacios sobrantes (collation "utf8mb4_0900_ai_ci" y normalizacion en el servidor).
- La clave foranea usa ON DELETE RESTRICT: no se puede borrar una materia que tenga calificaciones.

API:
- Recursos en plural ("/materias", "/calificaciones"); la acción la define el método HTTP. "Gestionar alumnos" se resuelve con el filtro "?alumno= "del listado de calificaciones.
- La API recibe las notas como una lista ("notas": [7, 8.5, 9]) para poder validar que sean exactamente 3. Cada nota debe ser un numero entre 0 y 10 con hasta 2 decimales.
- Se valida con express-validator: nombre del alumno (obligatorio, solo letras, espacios, apostrofes y guiones), existencia de la materia, notas, unicidad y los parametros y filtros de las rutas.
- Codigos: 201 al crear, 204 al eliminar, 400 por datos invalidos (incluida una materia inexistente), 404 si el recurso no existe y 409 si ya existe un registro para ese alumno y materia (o una materia con ese nombre) o si se intenta borrar una materia con calificaciones.
- La unicidad se verifica antes de guardar para dar un mensaje claro, y el indice UNIQUE de la base la garantiza aunque lleguen pedidos simultaneos.
- Las consultas SQL usan parametros ( ? ) para evitar inyeccion SQL.