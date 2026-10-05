# Ejercicio 2 - Tareas

## Diseño

El recurso principal es `/tareas`. Cada registro posee un `id` autoincremental, un nombre y el estado `completada`.

Para la unicidad se adopta este criterio: antes de comparar nombres se eliminan espacios externos, se reducen espacios internos consecutivos a uno y se convierte el texto a minúsculas. Por ejemplo, `Hacer TP`, `hacer tp` y `  HACER   TP  ` se consideran iguales. Los acentos se conservan.

El valor normalizado se persiste en `nombre_normalizado` y tiene una restricción `UNIQUE` en MySQL. Además, la API verifica la regla antes de insertar o modificar y responde `409 Conflict` si hay duplicado.

## Endpoints

- `GET /tareas`: lista todas.
- `GET /tareas?estado=completadas|pendientes`: filtra por estado.
- `GET /tareas/:id`: obtiene una.
- `POST /tareas`: crea una.
- `PUT /tareas/:id`: reemplaza nombre y estado.
- `DELETE /tareas/:id`: elimina una.

## Validaciones

`express-validator` valida `id`, `nombre`, `completada` y el query `estado`. `completada` debe ser un booleano JSON real (`true` o `false`), no un string.

## Códigos HTTP

- `200`: consulta o modificación exitosa.
- `201`: creación exitosa.
- `204`: eliminación exitosa.
- `400`: entrada inválida.
- `404`: tarea inexistente.
- `409`: nombre duplicado.
- `500`: error inesperado.

## Instalación

1. Ejecutar `database.sql` en MySQL.
2. Copiar `.env.example` como `.env` y completar credenciales.
3. Ejecutar `npm install`.
4. Ejecutar `npm start`.
