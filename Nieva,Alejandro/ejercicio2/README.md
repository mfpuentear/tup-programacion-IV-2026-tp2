# Trabajo Práctico Nº 2 - Programación IV

Repositorio correspondiente al desarrollo del Trabajo Práctico Nº 2, centrado en la construcción de una API REST para la gestión de **Tareas**, utilizando **Node.js**, **Express**, **MySQL** y validaciones estrictas con `express-validator`.

---

## 🏛️ Definición de Recursos, Métodos HTTP y Respuestas

La API está diseñada bajo una arquitectura RESTful orientada al recurso de **Tareas** (`/api/tareas`).

### 1. Recursos y Endpoints

* **`GET /api/tareas`**
  * **Descripción:** Permite obtener el listado completo de tareas almacenadas o filtrar opcionalmente por su estado mediante query params (`?completada=true` o `?completada=false`).
  * **Respuestas:**
    * `200 OK`: Retorna un objeto JSON con el estado `success` y el array de tareas normalizadas (convirtiendo los tipos de datos de MySQL a booleanos limpios en JavaScript).
    * `400 Bad Request`: Si el parámetro `completada` enviado no es un booleano válido.
    * `500 Internal Server Error`: Ante fallas imprevistas de conexión o servidor.

* **`POST /api/tareas`**
  * **Descripción:** Permite registrar una nueva tarea en el sistema.
  * **Cuerpo de la petición (`Body` JSON):** Requiere un campo `nombre` (string no vacío) y opcionalmente un campo booleano `completada`.
  * **Respuestas:**
    * `201 Created`: Tarea creada exitosamente en la base de datos.
    * `400 Bad Request`: Si el nombre está vacío, no es un string, o si **ya existe una tarea con el mismo nombre** (evaluando unicidad de manera insensible a mayúsculas, minúsculas y espacios sobrantes mediante sanitización).

---

## 💡 Fundamentación de Decisiones de Diseño

### A. Modelo de Datos (`MySQL`)
* **Uso de tipos nativos y autoincrementales:** Se utilizó un campo `id` como `INT AUTO_INCREMENT PRIMARY KEY` para garantizar la identificación unívoca e independiente de cada tarea.
* **Control de Unicidad y Normalización:** Se implementó una lógica de negocio y sanitización estricta (`LOWER(TRIM(nombre))`) para evitar registros duplicados por variaciones de formato tipográfico (como mayúsculas, minúsculas o espacios accidentales al tipear).
* **Manejo de Tiempos y Estados:** Se incorporó un campo `completada` de tipo `BOOLEAN` (por defecto `FALSE`) y un `fecha_creacion` con `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` para la trazabilidad temporal de los registros.

### B. Diseño de la API (`Node.js, Express y Express-Validator`)
* **Separación de Responsabilidades y Validaciones Centralizadas:** Se programó un middleware genérico (`manejarErroresValidacion`) utilizando `express-validator` para interceptar cualquier dato malformado antes de que impacte en las consultas a la base de datos, devolviendo un mensaje descriptivo y un código HTTP `400`.
* **Consistencia en las Respuestas JSON:** Todos los endpoints devuelven una estructura estandarizada que incluye un atributo `status` (`success`, `fail` o `error`), facilitando el consumo por parte de cualquier cliente web o móvil.

---