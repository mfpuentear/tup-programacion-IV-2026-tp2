# Fundamentación - Ejercicio 3: Calificaciones

## Modelo de datos
- **materias** (`id`, `nombre`): tabla independiente, con nombre único.
- **calificaciones** (`id`, `alumno`, `materia_id`, `nota1`, `nota2`, `nota3`): cada fila es el registro de un alumno en una materia. `materia_id` es clave foránea hacia `materias`.
- Las tres notas se guardan en columnas separadas (`nota1..nota3`) porque la cantidad es fija y así se pueden aplicar `NOT NULL` y `CHECK`.
- `ON DELETE RESTRICT`: no se puede borrar una materia que tenga calificaciones.

## Escala de notas
Las notas son numéricas, de **0 a 10** (decimales permitidos, hasta 2 decimales). Se valida en la API (`express-validator`) y también en la base (`CHECK`).

## Regla de unicidad
No puede haber más de un registro para la misma combinación **alumno + materia**:
- Se valida en la API al crear (POST) y al modificar (PUT, excluyendo el propio registro).
- Se refuerza en la base con `UNIQUE (alumno, materia_id)`; si igualmente falla, se responde 409.
- La comparación del nombre del alumno ignora mayúsculas/minúsculas y acentos (collation `utf8mb4_unicode_ci`), y se limpian espacios sobrantes antes de validar. Así, "Perez, Juan" y "perez,  juan" son el mismo alumno.

## Recursos y métodos HTTP
| Recurso | Método | Descripción | Respuestas |
|---|---|---|---|
| `/materias` | GET | Lista materias | 200 |
| `/materias/:id` | GET | Obtiene una materia | 200, 404 |
| `/materias` | POST | Crea materia | 201, 400, 409 |
| `/materias/:id` | PUT | Modifica materia | 200, 400, 404, 409 |
| `/materias/:id` | DELETE | Elimina materia (si no tiene calificaciones) | 204, 404, 409 |
| `/calificaciones` | GET | Lista; filtros `?alumno=` y `?materia_id=` | 200, 400 |
| `/calificaciones/:id` | GET | Obtiene un registro | 200, 400, 404 |
| `/calificaciones` | POST | Crea registro | 201, 400, 409 |
| `/calificaciones/:id` | PUT | Reemplaza el registro | 200, 400, 404, 409 |
| `/calificaciones/:id` | DELETE | Elimina registro | 204, 404 |

Cuerpo de ejemplo: `{ "alumno": "Perez, Juan", "materia_id": 1, "notas": [7, 8.5, 9] }`

## Validaciones (express-validator)
- **params**: `id` entero positivo.
- **query**: `alumno` (texto no vacío) y `materia_id` (entero positivo), opcionales.
- **body**: `alumno` presente, texto válido (letras, espacios, `.`, `,`, `'`, `-`; 2 a 100 caracteres); `materia_id` entero que exista en `materias`; `notas` arreglo de **exactamente 3** números entre 0 y 10; combinación alumno-materia no repetida.

## Códigos de estado
400 datos inválidos, 404 recurso inexistente, 409 conflicto (duplicado o materia con calificaciones), 500 error interno.
