## Fundamentación 
Escala de Calificaciones Documentada
Escala Aplicada: Numérica de 1.00 a 10.00 inclusive, permitiendo hasta dos decimales (ej: 8.50).

Justificación: Es la escala habitual en el sistema universitario argentino. Se valida mediante isFloat({ min: 1, max: 10 }) en express-validator para descartar notas negativas, mayores a 10 o valores no numéricos.

Unicidad de Alumno por Materia
Nivel Base de Datos: Se definió la restricción CONSTRAINT uk_alumno_materia UNIQUE (alumno, materia_id).

Nivel API: Antes de realizar la inserción o actualización, se ejecuta una consulta con LOWER(TRIM(alumno)) filtrando por materia_id. Esto evita violaciones imprevistas de la restricción a nivel SQL y devuelve respuestas de error 400 Bad Request claras y estructuradas.

Modelo Relacional e Integridad Referencial
Separación de Entidades: La tabla materias es independiente para evitar redundancias de texto.

Clave Foránea (materia_id): Garantiza que no puedan registrarse notas sobre asignaturas inexistentes. Se aplica la restricción ON DELETE RESTRICT para evitar borrar una materia si tiene calificaciones asociadas.

Diseño RESTful y Cálculo Auxiliar
Recursos Separados: Endpoints /materias y /calificaciones para aislar las responsabilidades de cada recurso.