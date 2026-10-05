# Ejercicio 3 - Calificaciones

## Modelo de datos

Se utilizan dos tablas:

- `materias`: catálogo independiente de materias.
- `calificaciones`: cada fila representa las calificaciones de un alumno en una materia.

`calificaciones.materia_id` es una clave foránea hacia `materias.id`. De esta manera la materia no se repite como texto dentro de cada registro y se garantiza integridad referencial.

La combinación `(alumno_normalizado, materia_id)` tiene una restricción `UNIQUE`, por lo que no puede existir más de un registro para el mismo alumno y materia. La API verifica la misma regla tanto al crear como al modificar.

## Criterio para nombres

Los nombres se comparan quitando espacios externos, reduciendo espacios internos consecutivos a uno y convirtiendo a minúsculas. Los acentos se conservan.

## Escala de notas

Se define y documenta la escala `0 a 10`, inclusive. Deben informarse exactamente tres notas y cada una debe ser un número JSON real dentro de ese rango.

Se admiten números enteros o decimales con un máximo de dos cifras decimales, de acuerdo con la precisión `DECIMAL(4,2)` utilizada en la base de datos.

## Recursos y endpoints

### Materias

- `GET /materias`
- `GET /materias/:id`
- `POST /materias`
- `PUT /materias/:id`
- `DELETE /materias/:id`

No se permite eliminar una materia que todavía tenga calificaciones asociadas; se responde `409 Conflict`.

### Calificaciones

- `GET /calificaciones`
- `GET /calificaciones?materiaId=1`
- `GET /calificaciones/:id`
- `POST /calificaciones`
- `PUT /calificaciones/:id`
- `DELETE /calificaciones/:id`

El body de creación/modificación tiene esta forma:

```json
{
  "alumno": "Ana Perez",
  "materiaId": 1,
  "notas": [8, 7.5, 9]
}
```

La existencia de `materiaId` se verifica antes de insertar o modificar.

## Validaciones

Se utiliza `express-validator` para validar nombres, ids, `materiaId`, el arreglo de notas y el query de filtrado. También se rechazan campos de body y query no implementados.

## Códigos HTTP

- `200`: consulta o modificación exitosa.
- `201`: creación exitosa.
- `204`: eliminación exitosa.
- `400`: entrada inválida o materia inexistente indicada en un body.
- `404`: recurso solicitado inexistente.
- `409`: duplicado alumno-materia, materia duplicada o intento de borrar una materia referenciada.
- `500`: error inesperado.

## Instalación

1. Ejecutar `database.sql` en MySQL.
2. Copiar `.env.example` como `.env` y completar credenciales.
3. Ejecutar `npm install`.
4. Ejecutar `npm start`.
