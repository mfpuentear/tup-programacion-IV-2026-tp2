Diseño de la API

Arquitectura REST Modular: Rutas separadas (/alumnos, /materias, /calificaciones) con respuestas HTTP semánticas (200, 201, 400, 404, 409, 500).   

Mapeo de Datos: Convierte las columnas nota1, nota2, nota3 de la BD en un array notas: [n1, n2, n3] para el cliente JSON.   

Validaciones Estrictas: express-validator verifica que el alumno/materia existan, que el array contenga exactamente 3 notas numéricas y que estén en el rango de 0 a 10.

Control de Duplicados e Inyecciones: Evita duplicar registros para la misma materia (409 Conflict) y usa consultas preparadas (?) contra Inyección SQL.   

Modelo de Datos

Normalización Relacional (1 a N): Entidades separadas (alumnos, materias y calificaciones).

La tabla calificaciones vincula ambas mediante claves foráneas (alumno_id, materia_id).   

Integridad Referencial: Claves foráneas con borrado en cascada para evitar registros huérfanos.   

Tipos de Datos Adecuados: Uso de DECIMAL(4,2) para las notas (evita errores de redondeo) e INT AUTO_INCREMENT para las claves primarias.   