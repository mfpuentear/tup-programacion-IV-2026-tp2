# Fundamentación - Ejercicio 2: Tareas

## Recursos y métodos HTTP
El recurso es `/tareas`.

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| POST | /tareas | Crea una tarea (`completada` opcional, por defecto false) | 201, 400, 409 |
| GET | /tareas | Lista tareas; filtro opcional `?estado=completadas\|pendientes` | 200, 400 |
| GET | /tareas/:id | Obtiene una tarea | 200, 400, 404 |
| PUT | /tareas/:id | Reemplaza nombre y estado | 200, 400, 404, 409 |
| PATCH | /tareas/:id/estado | Cambia solo el estado | 200, 400, 404 |
| DELETE | /tareas/:id | Elimina una tarea | 204, 400, 404 |

## Criterio de comparación de nombres
Dos nombres se consideran iguales si coinciden ignorando mayúsculas y minúsculas, tildes y espacios sobrantes (al inicio, al final o repetidos). Por ejemplo, "Comprar pan", "  comprar   PAN " y "Comprar pán" son la misma tarea. El criterio se aplica siempre de la misma manera: al crear y al modificar.

## Decisiones de diseño
- **Columna `nombre_normalizado` con restricción UNIQUE.** La unicidad la garantiza la base de datos y no solo el código, así que dos pedidos simultáneos con el mismo nombre no pueden crear duplicados. La API traduce el error de MySQL a un 409 (Conflict).
- **Se guarda el nombre original (ya sin espacios sobrantes)** para mostrarlo tal como lo escribió el usuario, y aparte el normalizado para comparar.
- **Estado booleano estricto.** `completada` debe ser `true` o `false` en el JSON; se rechazan valores como `"si"` o `1`.
- **Filtro por estado con valores admitidos.** `?estado=completadas|pendientes`; cualquier otro valor responde 400.
- **PUT y PATCH.** PUT reemplaza la tarea completa; PATCH `/estado` permite marcarla como completada o pendiente sin reenviar el nombre.
- **Validación con `express-validator`** de nombre (presente, texto, máximo 100 caracteres, con al menos una letra o número), estado, `id` y filtro.
- **Códigos de estado.** 201 al crear, 200 en lectura y modificación, 204 al eliminar, 400 por datos inválidos, 404 si no existe, 409 por nombre duplicado y 500 por errores internos.