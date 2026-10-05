# Ejercicio 2

---

## Definición de Recursos y Endpoints

El recurso expuesto por la API es **`tareas`**.

| Método   | Endpoint               | Descripción                                       | Cód. Éxito | Cód. Error          |
| :---     | :---                   | :---                                              | :---       | :---                |
| `GET`    | `/tareas`              | Lista todas las tareas (permite filtro `?completada=true\|false`) | `200 OK`   | `400 Bad Request`, `500 Error` |
| `GET`    | `/tareas/:id`          | Obtiene una tarea específica por ID               | `200 OK`   | `400 Bad Request`, `404 Not Found` |
| `POST`   | `/tareas`              | Crea una nueva tarea (Aplica regla de unicidad)   | `201 Created` | `400 Bad Request` |
| `PUT`    | `/tareas/:id`          | Actualiza el nombre o el estado de una tarea      | `200 OK`   | `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/tareas/:id`          | Elimina una tarea por su ID                       | `204 No Content` | `400 Bad Request`, `404 Not Found` |

---

## 2. Fundamentación de las Decisiones de Diseño

### A. Criterio de Comparación para Unicidad de Nombres
Para garantizar que no existan tareas duplicadas con nombres semánticamente idénticos, se implementaron las siguientes reglas:
1. **Insensibilidad a Mayúsculas y Minúsculas (`Case-Insensitive`):** La validación compara las cadenas convirtiéndolas a minúsculas (`LOWER(nombre)`).
2. **Normalización de Espacios:** Mediante la sanitización con `express-validator` y la función `normalizarTexto`, se eliminan los espacios en blanco iniciales/finales (`trim`) y se reemplazan múltiples espacios consecutivos entre palabras por un solo espacio.
3. **Restricción a Nivel de BD:** Se definió un índice único (`UNIQUE KEY uk_tarea_nombre`) en MySQL como segunda capa de protección de datos.

### B. Modelo de Datos y Filtrado de Estados
* **Tipo de Dato del Estado:** Se utiliza un campo `TINYINT(1)` en MySQL para representar el estado `completada` ($0 = false, 1 = true$). El controlador convierte automáticamente este entero a tipo `Boolean` en la respuesta JSON para mantener la semántica estricta.
* **Filtrado Flexible por Query Params:** El endpoint `GET /tareas` admite el parámetro opcional `?completada=...`. Se aceptan valores booleanos reconocidos (`true`, `false`, `1`, `0`). Cualquier otro valor es rechazado con un código HTTP `400 Bad Request`.

### C. Arquitectura y Validaciones con `express-validator`
* **Capa Middleware Separada (`validaciones.js`):** Aísla las reglas de negocio de los controladores de ruta.
* **Separación de Códigos HTTP:**
  * `201 Created`: Creación exitosa.
  * `204 No Content`: Eliminación exitosa.
  * `400 Bad Request`: Parámetros inválidos, campos faltantes o nombres duplicados.
  * `404 Not Found`: Recurso inexistente al consultar, editar o borrar por ID.