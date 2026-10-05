# Diagrama Entidad-Relación - Ejercicio 3: Calificaciones

## Entidad: `materias`
Catálogo independiente de las materias de la carrera.
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment | Identificador único de la materia. |
| `nombre` | VARCHAR(100) | NOT NULL, UNIQUE | Nombre de la materia. |

## Entidad: `calificaciones`
Almacena el registro de calificaciones de los alumnos relacionado con una materia.
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment | Identificador único del registro. |
| `alumno_nombre` | VARCHAR(255) | NOT NULL | Nombre del alumno. |
| `materia_id` | INT | NOT NULL, Foreign Key (`materias.id`) | Referencia a la materia cursada. |
| `nota1`, `nota2`, `nota3` | DECIMAL(4,2) | NOT NULL | Notas obtenidas en la escala de 1.00 a 10.00. |

> **Restricción de Unicidad**: Se implementó una clave única compuesta (`CONSTRAINT uk_alumno_materia UNIQUE (alumno_nombre, materia_id)`) para impedir la duplicación de registros por alumno en una misma materia.