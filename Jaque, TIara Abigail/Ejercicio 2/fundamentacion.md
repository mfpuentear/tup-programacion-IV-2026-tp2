# Fundamentación de Decisiones de Diseño - Ejercicio 2

## 1. Arquitectura y Organización Modular
Se mantuvo el patrón MVC (Modelo-Vista-Controlador) con ExpressJS para garantizar la separación de responsabilidades:
- **`app.js`**: Configura el servidor principal y el middleware JSON.
- **`routes/`**: Define los endpoints para la gestión de tareas de forma limpia y escalable.
- **`controllers/`**: Contiene la lógica de negocio, manejo de parámetros de consulta y consultas asíncronas con MySQL.
- **`validators/`**: Centraliza las reglas de validación mediante `express-validator`.

## 2. Criterio de Comparación Consistente y Unicidad
Para cumplir con la regla de impedir la creación de tareas duplicadas con el mismo nombre, se implementó un criterio de comparación consistente a nivel de base de datos y de código:
- Se normalizan los nombres utilizando `LOWER(TRIM(...))` tanto al insertar como al actualizar, evitando conflictos por diferencias de mayúsculas, minúsculas o espacios adicionales.
- Se incorporó una restricción de unicidad (`CONSTRAINT uk_nombre UNIQUE`) a nivel de esquema en MySQL como segunda capa de seguridad.

## 3. Filtrado por Estado y Validaciones
- **Filtros**: El endpoint `GET /api/tareas` acepta un parámetro de consulta (`?estado=completadas` o `?estado=pendientes`) validado mediante `express-validator` para asegurar que solo se admitan valores permitidos.
- **Validación Estricta**: Se valida la obligatoriedad del nombre, el formato de cadena de texto y que el estado sea estrictamente un valor booleano, devolviendo códigos HTTP claros (`400` para errores de validación o duplicados, y `404` si no se encuentra el recurso).