# Ejercicio 3: Calificaciones

## Decisiones de diseño

### Modelado de la información

Se usan dos tablas relacionadas:

- **`materias`**: `id` y `nombre` (único). Es una entidad independiente, administrable por sí misma.
- **`calificaciones`**: `id`, `alumno_nombre`, `materia_id` (clave foránea a `materias`), y tres notas (`nota_1`, `nota_2`, `nota_3`).

Las materias se modelan en su propia tabla, en vez de repetir el nombre de la materia como texto en cada calificación, para evitar inconsistencias (errores de tipeo, nombres distintos para la misma materia) y poder referenciarlas por `id`.

**Escala de notas:** se documenta la escala **0 a 10**, la habitual en nuestro sistema educativo. Cada nota debe ser un número dentro de ese rango.

**Promedio y condición son datos derivados** y no se almacenan: se calculan en cada consulta a partir de las tres notas, igual criterio que en el TP anterior. La condición se determina así:

| Promedio                    | Condición      |
| --------------------------- | -------------- |
| menor que 6                 | `reprobado`    |
| entre 6 y 8 (sin incluir 8) | `aprobado`     |
| 8 o más                     | `promocionado` |

### Recursos y endpoints

Se exponen dos recursos: `/materias` y `/calificaciones`.

| Método | Ruta                  | Descripción                                   | Respuestas         |
| ------ | --------------------- | --------------------------------------------- | ------------------ |
| GET    | `/materias`           | Lista materias                                | 200                |
| GET    | `/materias/:id`       | Consulta una materia                          | 200, 400, 404      |
| POST   | `/materias`           | Crea una materia                              | 201, 400, 409      |
| PUT    | `/materias/:id`       | Renombra una materia                          | 200, 400, 404, 409 |
| DELETE | `/materias/:id`       | Elimina una materia                           | 204, 400, 404, 409 |
| GET    | `/calificaciones`     | Lista calificaciones con promedio y condición | 200                |
| GET    | `/calificaciones/:id` | Consulta una calificación                     | 200, 400, 404      |
| POST   | `/calificaciones`     | Crea una calificación                         | 201, 400, 409      |
| PUT    | `/calificaciones/:id` | Reemplaza una calificación                    | 200, 400, 404, 409 |
| DELETE | `/calificaciones/:id` | Elimina una calificación                      | 204, 400, 404      |

`DELETE /materias/:id` devuelve `409 Conflict` si la materia tiene calificaciones asociadas, ya que eliminarla rompería la integridad referencial.

### Relación entre tablas

`calificaciones.materia_id` es clave foránea de `materias.id`. Antes de crear o modificar una calificación, un validador personalizado de `express-validator` consulta la base para confirmar que la materia exista; si no, responde `400 Bad Request`. La clave foránea en la base es además una segunda barrera de integridad.

### Regla de unicidad alumno-materia

No puede existir más de un registro para la misma combinación de alumno y materia. Se garantiza con una restricción `UNIQUE (alumno_nombre, materia_id)` en la base de datos, y también se verifica explícitamente en la API (al crear y al modificar, excluyendo el propio registro) para devolver `409 Conflict` con un mensaje claro en vez de un error genérico de base de datos.

### Validación con express-validator

- `alumno_nombre`: obligatorio, texto no vacío, hasta 100 caracteres.
- `materia_id`: obligatorio, entero positivo, y debe corresponder a una materia existente.
- `notas`: arreglo de exactamente 3 números, cada uno entre 0 y 10.
- `id` en los parámetros de ruta: entero positivo.
- `nombre` de materia: obligatorio, texto no vacío, hasta 100 caracteres, único.

### Manejo de errores

- `400 Bad Request`: datos inválidos o materia inexistente.
- `404 Not Found`: recurso o ruta inexistente.
- `409 Conflict`: nombre de materia repetido, combinación alumno-materia repetida, o intento de borrar una materia con calificaciones asociadas.
- `500 Internal Server Error`: errores inesperados.

### Pruebas

El archivo `calificaciones.http` incluye casos exitosos (crear materia, listar, crear calificaciones con distintas condiciones, consultar, modificar, eliminar) y casos de error (combinación repetida, materia inexistente, notas faltantes o fuera de escala, campos obligatorios faltantes, nombre de materia repetido, id inválido y recursos inexistentes).

## Diagrama entidad-relación

```
┌────────────────────┐          ┌───────────────────────────┐
│      materias      │          │       calificaciones      │
├────────────────────┤          ├───────────────────────────┤
│ id           PK INT│ 1      N │ id              PK  INT   │
│ nombre VARCHAR UNI │──────────│ alumno_nombre   VARCHAR   │
└────────────────────┘          │ materia_id      FK  INT   │
                                │ nota_1          DECIMAL   │
                                │ nota_2          DECIMAL   │
                                │ nota_3          DECIMAL   │
                                │ UNIQUE(alumno_nombre,     │
                                │        materia_id)        │
                                └───────────────────────────┘
```

Una materia puede tener muchas calificaciones (relación uno a muchos), pero para un mismo alumno no puede haber más de una calificación por materia.
