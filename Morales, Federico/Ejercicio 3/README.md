# Ejercicio 3 - Calificaciones (alumnos, materias y notas en MySQL)

## Decisiones de diseño

- **Modelo relacional**: se usan dos tablas. `materias` guarda el nombre de
  cada materia con su propio `id`. `calificaciones` guarda el alumno, las
  tres notas, y una clave foránea `materia_id` que apunta a `materias.id`.
  Esto evita escribir el nombre de la materia repetido en cada registro y
  permite que la base valide la relación a nivel de integridad referencial.

- **Escala de notas**: se definió el rango **0 a 10** (escala habitual en
  Argentina). Se valida con `isFloat({ min: 0, max: 10 })` en las tres notas.

- **Unicidad alumno + materia**: no puede existir más de un registro para la
  misma combinación. Se compara el nombre del alumno normalizado (sin
  espacios en los extremos, sin distinguir mayúsculas/minúsculas) junto con
  el `materia_id` exacto, usando un validador asíncrono que consulta la tabla
  antes de aceptar la creación.

- **Unicidad de materias**: aunque no lo exige explícitamente el enunciado,
  se decidió impedir nombres de materia duplicados (mismo criterio de
  normalización), ya que permitir materias repetidas generaría ambigüedad
  sobre a cuál se refiere cada calificación.

- **Verificación de existencia de la materia**: al crear una calificación, se
  consulta la tabla `materias` para confirmar que el `materia_id` recibido
  exista antes de insertar el registro.

- **PUT solo modifica notas**: al actualizar una calificación, el cliente
  solo puede cambiar `nota1`, `nota2` y `nota3`. El alumno y la materia
  identifican conceptualmente al registro (son parte de la regla de
  unicidad), así que no tiene sentido "reasignarlos" vía PUT — para corregir
  un alumno o materia mal cargados, corresponde borrar el registro y crear
  uno nuevo.

- **Métodos HTTP**:
  - `GET /materias` — listar materias.
  - `GET /materias/:id` — consultar una materia puntual.
  - `POST /materias` — crear una materia.
  - `GET /calificaciones` — listar calificaciones.
  - `GET /calificaciones/:id` — consultar una puntual.
  - `POST /calificaciones` — crear una calificación nueva.
  - `PUT /calificaciones/:id` — modificar las notas de una existente.
  - `DELETE /calificaciones/:id` — eliminar una calificación.

- **Validaciones con express-validator**: nombre de materia obligatorio y
  único; nombre de alumno obligatorio; `materia_id` entero válido y
  existente; las tres notas numéricas dentro de la escala 0-10; unicidad de
  la combinación alumno+materia al crear; `:id` entero válido en los params.
  Ante datos inválidos la API responde `400 Bad Request`, y ante un `id`
  inexistente, `404 Not Found`.