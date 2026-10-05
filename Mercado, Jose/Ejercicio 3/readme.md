# Ejercicio 3 - API de Calificaciones Universitarias 🎓

Esta API implementa un sistema de registro de calificaciones relacionando alumnos con materias. Destaca por el uso de tablas relacionales en MySQL (Claves Foráneas) y consultas complejas mediante `JOIN`.

## Reglas de Negocio Implementadas
* **Escala de Notas:** Validación estricta para que las notas ingresadas estén dentro del rango permitido (1 al 10).
* **Integridad Relacional:** Las calificaciones se asocian a materias existentes (`materia_id`).
* **Unicidad:** Un alumno no puede tener más de un registro de calificaciones para la misma materia (`CONSTRAINT unica_alumno_materia`).

## Estructura de Base de Datos
* Tabla `materias`: Almacena el catálogo de asignaturas disponibles.
* Tabla `calificaciones`: Almacena el nombre del alumno, sus tres notas y la referencia (FK) a la materia.

## Configuración del Entorno
1. Ejecutar el script SQL provisto en DBeaver para crear la base de datos `tp2_ejercicio3`, las tablas relacionadas y los datos iniciales de las materias.
2. Crear el archivo `.env` con las credenciales de conexión:
