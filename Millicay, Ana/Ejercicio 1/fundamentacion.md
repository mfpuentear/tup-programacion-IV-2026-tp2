# Fundamentación - Ejercicio 1: Rectángulos

## Recursos y métodos HTTP
El recurso es `/rectangulos`.

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| POST | /rectangulos | Crea un rectángulo a partir de sus lados | 201, 400 |
| GET | /rectangulos | Lista rectángulos (con `limit` y `offset`) | 200, 400 |
| GET | /rectangulos/:id | Obtiene un rectángulo | 200, 400, 404 |
| PUT | /rectangulos/:id | Reemplaza los lados de un rectángulo | 200, 400, 404 |
| DELETE | /rectangulos/:id | Elimina un rectángulo | 204, 400, 404 |

## Decisiones de diseño
- **El cliente solo envía los lados.** El perímetro y la superficie son datos derivados: si el cliente los enviara, podrían ser incoherentes con los lados. Se calculan en el servidor antes de persistir, tanto al crear como al modificar, y si llegan en el body la API responde 400.
- **PUT con ambos lados obligatorios.** PUT reemplaza el recurso completo, por lo que siempre se reciben los dos lados y se recalculan los valores derivados.
- **DECIMAL en lugar de FLOAT.** Evita errores de representación binaria. Los lados admiten hasta 2 decimales, por lo que la superficie necesita hasta 4.
- **Doble validación.** `express-validator` valida en la API (lados presentes, numéricos, mayores que 0, `id` entero positivo, `limit` y `offset`) y la tabla tiene un `CHECK` que impide lados menores o iguales a 0.
- **Códigos de estado.** 201 al crear (con cabecera `Location`), 200 en lectura y modificación, 204 al eliminar, 400 por datos inválidos, 404 si el recurso no existe y 500 para errores internos.
- **Estructura en capas.** Rutas, validadores y controladores separados para facilitar la lectura y el mantenimiento.