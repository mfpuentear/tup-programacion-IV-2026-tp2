# Trabajo Práctico Nº 2 - Programación IV (Ejercicio 3)

API RESTful para la gestión de calificaciones académicas desarrollada con **Express.js**, **MySQL** y **`express-validator`**.

---

## 🏛️ Recursos, Métodos HTTP y Respuestas

La API gestiona dos recursos relacionados: **Materias** (`/api/materias`) y **Calificaciones** (`/api/calificaciones`).

### 1. Endpoints

* **`GET /api/materias`**
  * Retorna el catálogo de materias registradas en la base de datos. (`200 OK`).

* **`GET /api/calificaciones`**
  * Lista todas las calificaciones almacenadas realizando un `JOIN` con la tabla de materias e incluyendo el promedio calculado de las 3 notas (`200 OK`).

* **`POST /api/calificaciones`**
  * Registra un nuevo conjunto de 3 notas para un alumno en una materia.
  * **Validaciones:**
    * Nombre de alumno obligatorio y no vacío.
    * La materia enviada debe existir en la BD.
    * Exactamente 3 notas numéricas en la escala definida (**1 a 10**).
    * Unicidad estricta: Impide duplicar la combinación (alumno + materia) considerando minúsculas/espacios (`TRIM/LOWER`).
  * **Respuestas:** `201 Created` / `400 Bad Request`.

* **`PUT /api/calificaciones/:id`**
  * Permite modificar un registro existente re-evaluando las validaciones y la regla de unicidad para evitar colisiones con otros registros.
  * **Respuestas:** `200 OK` / `400 Bad Request` / `404 Not Found`.

---

## 💡 Fundamentación de Decisiones de Diseño

### A. Modelo de Datos (`MySQL`)
1. **Modelado Relacional y FK:** Se separó la entidad `materias` en una tabla independiente con su propia clave primaria para asegurar la integridad referencial y evitar redundancia.
2. **Constraint de Unicidad Combinada:** Se aplicó una restricción `UNIQUE (alumno, materia_id)` a nivel de esquema de base de datos como segunda capa de defensa defensiva.
3. **Escala de Calificaciones:** Se utilizó el tipo de dato `DECIMAL(4,2)` para permitir calificaciones con decimales dentro del rango escalar numérico legal de **1.00 a 10.00**.

### B. Diseño de la API
1. **Validación Dinámica e Inexistencia de FK:** Antes de intentar insertar en la BD, `express-validator` realiza una consulta previa para confirmar la existencia de la `materia_id`, retornando un mensaje HTTP `400` amigable en lugar de un choque de Foreign Key de MySQL (`500`).
2. **Evaluación de Unicidad en Modificación (`PUT`):** En las peticiones `PUT`, la validación ignora el propio ID en la comprobación (`id != ?`), permitiendo actualizar las notas del mismo registro sin disparar una falsa alerta de duplicado.

---