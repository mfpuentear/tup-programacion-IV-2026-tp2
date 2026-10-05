# Ejercicio 3 –API de Calificaciones

## Descripcion
API desarrollada con ExpressJS y MySQL para gestionar las calificaciones de alumnos en las materias asignadas.  
Cada registro almacena: alumno, materia y tres notas.

 ## Modelo de datos
- Alumnos: tabla "alumnos" con "id" y "nombre".
- Materias: tabla "materias" con "id" y `nombre".
- Notas: tabla "notas" con "id", "alumno_id", "materia_id", "nota1", "nota2", "nota3".  
  - "alumno_id" = clave foranea hacia "alumnos".  
  - "materia_id" = clave foranea hacia "materias".  
  - Regla de unicidad: no puede existir mas de un registro para la misma combinacion alumno–materia.

## Validaciones
- Nombre de alumno y materia: obligatorio y valido.
- Alumno y materia deben existir en la base.
- Tres notas numericas, dentro de la escala 1–10.
- Unicidad de alumno–materia en creacion y modificacion.
- Parametros "id" deben ser enteros positivos.


 ## Pruebas
Se incluyen archivos ".http" ("alumnos.http", "materias.http", "notas.http") para probar cada recurso y validar casos correctos y de error.
