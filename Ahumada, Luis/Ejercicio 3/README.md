# Ejercicio 3

Desarrollar una API con ExpressJS para gestionar las calificaciones de alumnos
en las materias de una carrera, persistiendo la información en una base de datos
MySQL.

Para cada registro se debe almacenar el nombre del alumno, la materia cursada y
tres notas. Las materias deben modelarse en una tabla independiente y
relacionarse con los registros de alumnos mediante una clave foránea.

La API debe impedir que exista más de un registro para la misma combinación de
alumno y materia, tanto al crear como al modificar información. Debe validar,
como mínimo, que el nombre del alumno esté presente y sea válido; que la materia
exista; que se informen exactamente tres notas numéricas dentro de la escala
definida y documentada por el estudiante; y que se cumpla la regla de unicidad.
Validar además los parámetros, consultas y cuerpo de las solicitudes que
implemente utilizando `express-validator`.

Definir los recursos, los métodos HTTP y las respuestas que considere
necesarios para gestionar alumnos, materias y calificaciones. Fundamentar las
decisiones de diseño adoptadas para el modelo de datos y para la API.
