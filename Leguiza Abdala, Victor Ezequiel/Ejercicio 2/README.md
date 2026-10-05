# Ejercicio 2: Tareas

---

## Descripción
Esta API permite administrar una lista de tareas persistidas en una base de datos MySQL. Se implementó un CRUD completo (Crear, Leer, Actualizar, Eliminar) con validaciones estrictas para garantizar la integridad de los datos y evitar duplicados.

## Fundamentación de Decisiones de Diseño
Para cumplir con los requisitos planteados en la consigna, se adoptaron las siguientes decisiones:

1. **Modelo de Datos:**
   * La entidad se estructuró con un `VARCHAR(255)` para el título de la tarea (`titulo_tarea`) y un campo de tipo `BOOLEAN` (por defecto `FALSE`) para su estado (`esta_completada`). El uso de valores booleanos nativos optimiza el almacenamiento en MySQL (TINYINT) y simplifica la lógica matemática en los filtros.

2. **Criterio de Comparación Consistente (Unicidad):**
   * Se determinó que dos tareas son idénticas si sus textos coinciden tras eliminar espacios en blanco en los extremos y convertir todo a minúsculas. Para esto se implementó una validación asíncrona (`custom`) con `express-validator` que consulta a la base de datos mediante la instrucción SQL `LOWER(TRIM(titulo_tarea)) = LOWER(TRIM(?))`. Esto evita que un usuario cree "Configurar Linux" y "  configurar linux " como tareas distintas.

3. **Filtrado por Estado:**
   * En lugar de crear rutas adicionales (como `/completadas` o `/pendientes`), se respetaron las convenciones REST utilizando un "Query Parameter" en la ruta principal: `?estado=completada` y `?estado=pendiente`. El validador rechaza automáticamente cualquier valor que no pertenezca a estos dos estados admitidos.

## Tecnologías usadas
* Node.js + Express
* MySQL2 (con Pool de conexiones)
* Express-Validator

## Estructura de archivos
* **`src/`**
  * **`routes/`**
    * `tareas.routes.js`: Rutas del CRUD y lógica de filtrado.
  * **`validators/`**
    * `validators.js`: Reglas de validación, unicidad y filtros por query.
  * `db.js`: Conexión al pool de MySQL y creación automática de la base/tabla.
* `database.sql`: Script original de creación de la base y tabla.
* `der.md`: Diagrama Entidad-Relación.
* `index.js`: Archivo principal de entrada.
* `pruebas.http`: Pruebas exhaustivas que demuestran el funcionamiento y manejo de errores.
* `.env` y `.env.example`: Variables de entorno.

## Pasos para levantarlo

1. Instalar las dependencias:
   ```bash
   npm install