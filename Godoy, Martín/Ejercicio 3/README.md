Modelo Relacional (Tabla materia independiente): Se separa la entidad materia utilizando una clave foránea (materia_id). Esto evita redundancia (no se escribe "Programación I" en cada registro de alumno) y previene inconsistencias si en un futuro la materia cambia de nombre, respetando las formas normales de bases de datos.

Estructura del cuerpo de la petición (Array notas): Aunque en la base de datos guardamos las notas en tres columnas (nota1, nota2, nota3) para tener una estructura plana y fácil de consultar, en la API exigimos un arreglo ([8, 9, 7]). Esto obliga al cliente a mandar las tres notas en bloque (facilitando la validación del tamaño exacto) y genera un JSON más limpio.

Consultas enriquecidas (JOIN en GET): En el endpoint GET /api/calificaciones, en lugar de solo devolver el materia_id, se ejecuta un JOIN con la tabla materias. Esto hace que la respuesta de la API sea inmediatamente útil para el cliente, entregando el nombre real de la materia junto a las notas.

Escala documentada (1 a 10): Se implementó una función validadora (Custom Validator) que no solo comprueba que los datos sean numéricos, sino que impone la regla de negocio limitando los valores para impedir errores de tipeo o notas ilógicas.
