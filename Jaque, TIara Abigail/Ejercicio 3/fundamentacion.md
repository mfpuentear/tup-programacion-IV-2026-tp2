# Fundamentación de Decisiones de Diseño - Ejercicio 3

## 1. Modelo Relacional e Independencia de Materias
- Se modeló una tabla independiente para las **materias** con el objetivo de evitar redundancia y garantizar la integridad referencial mediante claves foráneas (`FOREIGN KEY`) conectadas a la tabla de calificaciones con eliminación en cascada.

## 2. Unicidad Compuesta y Prevención de Duplicados
- Para cumplir con la restricción de que un alumno no posea más de un registro por materia, se estableció una restricción a nivel de base de datos (`UNIQUE (alumno_nombre, materia_id)`).
- A nivel de controlador, se implementó una normalización estricta (`LOWER(TRIM(...))`) combinada con validaciones previas para rechazar intentos de creación o modificación duplicados con un código HTTP `400`.

## 3. Escala y Validación Rigurosa de Notas
- Se definió y documentó una escala académica numérica estricta de **1.00 a 10.00** para las tres notas.
- Se utilizó `express-validator` para validar la obligatoriedad de los campos, la existencia previa de la materia en la base de datos y que las notas se encuentren dentro de los rangos permitidos.