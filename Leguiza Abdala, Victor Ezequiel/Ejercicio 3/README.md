# Ejercicio 3: Calificaciones

---

## Descripción
Esta API permite administrar las calificaciones de alumnos universitarios en distintas materias, persistiendo la información en una base de datos MySQL. Se implementó un sistema relacional completo con validaciones estrictas para garantizar el cumplimiento de las reglas de negocio académicas, evitando duplicidades y notas fuera de escala.

## Fundamentación de Decisiones de Diseño
Para cumplir con los requisitos planteados en la consigna, se adoptaron las siguientes decisiones:

1. **Modelo de Datos Relacional:**
   * La base de datos se estructuró en dos tablas: `materias` (entidad fuerte) y `calificaciones` (entidad dependiente). Esto normaliza la información y utiliza una clave foránea (`id_materia`) con la restricción `ON DELETE CASCADE` para asegurar la integridad referencial. Si una materia se elimina, sus calificaciones asociadas se borran en cascada.

2. **Estructura Estricta de Notas:**
   * Para cumplir la regla que exige *exactamente tres notas* por registro, en lugar de crear una tabla paralela de "notas" que permitiría N cantidad de calificaciones, se definieron tres columnas específicas (`nota_1`, `nota_2`, `nota_3`) de tipo `DECIMAL(4,2)` con restricción `NOT NULL`. Esto garantiza a nivel estructural en MySQL que no puedan existir registros incompletos ni excesos de notas.

3. **Criterio de Unicidad Académica:**
   * Se determinó que un alumno no puede estar inscripto dos veces en la misma materia. Se implementó una validación asíncrona (`custom`) mediante `express-validator` que verifica en la base de datos si ya existe la combinación exacta de `nombre_alumno` y `id_materia` antes de permitir un `POST` o un `PUT`.

4. **Validación de Escala y Tipado:**
   * Se aplicaron reglas para asegurar que las notas sean valores estrictamente numéricos comprendidos entre 1 y 10. Si un cliente envía texto o números fuera de este rango (ej. 11 o -2), el validador lo rechaza automáticamente respondiendo con un `400 Bad Request`.

## Tecnologías usadas
* Node.js + Express
* MySQL2 (con Pool de conexiones)
* Express-Validator

## Estructura de archivos
* **`src/`**
  * **`routes/`**
    * `calificaciones.routes.js`: Rutas del CRUD y vinculación con controladores.
  * **`validators/`**
    * `validators.js`: Reglas de validación, unicidad de alumno-materia y escala de notas.
  * `db.js`: Conexión al pool de MySQL, creación automática de la base de datos, tablas y precarga de materias base.
* `database.sql`: Script original de creación de las tablas relacionales.
* `der.md`: Diagrama Entidad-Relación.
* `index.js`: Archivo principal de entrada.
* `pruebas.http`: Pruebas exhaustivas que demuestran el funcionamiento correcto y la captura de errores.
* `.env` y `.env.example`: Variables de entorno.

## Pasos para levantarlo

1. Instalar las dependencias:
   ```bash
   npm install