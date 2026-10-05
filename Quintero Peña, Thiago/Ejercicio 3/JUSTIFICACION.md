# Justificación de Diseño y Arquitectura - Ejercicio 3

## 1. Modularización y Separación de Responsabilidades
Se aplicó un enfoque modular para mantener el código mantenible y escalable:
- **`db.js`**: Centraliza la conexión a la base de datos MySQL mediante un pool de conexiones con `mysql2/promise`.
- **`validaciones.js`**: Contiene middlewares independientes con `express-validator` para aislar las reglas de negocio y validaciones de datos antes de llegar a los controladores.
- **`calificaciones.js`**: Define las rutas y la lógica de controladores para la gestión de alumnos, materias y notas.
- **`index.js`**: Punto de entrada de la aplicación Express, configurando la carga de variables de entorno y los endpoints principales.

## 2. Decisiones de Base de Datos y Modelo
- **Integridad Referencial**: Se implementó una clave foránea (`FOREIGN KEY`) entre la tabla `calificaciones` y `materias` para garantizar que no se registren notas para materias inexistentes.
- **Unicidad de Registros**: Se aplicó la restricción `UNIQUE (alumno, materia_id)` para impedir registros duplicados de un mismo alumno en la misma materia.
- **Validación de Escala de Notas**: Se restringe la carga a exactamente tres notas en una escala válida de 1 a 10 desde el middleware de validación.

## 3. Manejo de Errores e Indicadores HTTP
- **`200 OK`**: Respuestas exitosas para consultas, actualizaciones y eliminaciones.
- **`201 Created`**: Retornado al insertar con éxito un nuevo registro de calificaciones.
- **`400 Bad Request`**: Disparado ante fallos de validación o intentos de duplicar alumno/materia.
- **`404 Not Found`**: Para recursos solicitados que no existen en la base de datos.
- **`500 Internal Server Error`**: Ante fallos imprevistos de la base de datos o del servidor.
