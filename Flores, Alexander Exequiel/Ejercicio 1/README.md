# Ejercicio 1: Rectángulos

## Decisiones de diseño

### Modelado de la información

La tabla `rectangulos` persiste cuatro datos numéricos: `lado_a`, `lado_b`, `perimetro` y `superficie`, todos como `DECIMAL(10,2)` para evitar los errores de redondeo típicos de los números de punto flotante en medidas.

El **perímetro y la superficie se calculan en el servidor** antes de insertar o actualizar el registro, y nunca se aceptan como datos de entrada del cliente. Si el cliente los envía en el cuerpo de la petición, se ignoran: solo se leen `lado_a` y `lado_b`. Esto garantiza que esos valores siempre sean coherentes con los lados almacenados.

### Recurso y endpoints

El recurso es `/rectangulos` (sustantivo en plural, según las convenciones REST).

| Método | Ruta               | Descripción                                                             | Respuestas    |
| ------ | ------------------ | ----------------------------------------------------------------------- | ------------- |
| GET    | `/rectangulos`     | Lista todos los rectángulos                                             | 200           |
| GET    | `/rectangulos/:id` | Consulta un rectángulo                                                  | 200, 400, 404 |
| POST   | `/rectangulos`     | Crea un rectángulo a partir de sus lados                                | 201, 400      |
| PUT    | `/rectangulos/:id` | Reemplaza los lados de un rectángulo (recalcula perímetro y superficie) | 200, 400, 404 |
| DELETE | `/rectangulos/:id` | Elimina un rectángulo                                                   | 204, 400, 404 |

### Elección de métodos HTTP

- `GET` para consultas (seguro e idempotente).
- `POST` para crear, ya que el servidor asigna el `id`. Responde `201 Created` con el encabezado `Location`.
- `PUT` para modificar, porque el cliente envía los dos lados completos y es idempotente.
- `DELETE` para eliminar, respondiendo `204 No Content`.

### Validación con express-validator

Se valida con `express-validator`:

- **Body** (`POST` y `PUT`): `lado_a` y `lado_b` son obligatorios, deben ser numéricos y mayores que 0.
- **Params** (`GET /:id`, `PUT /:id`, `DELETE /:id`): `id` debe ser un entero positivo.

Si falla alguna validación, se responde `400 Bad Request` con la lista de errores encontrados.

### Persistencia en MySQL

Se usa `mysql2/promise` con un _pool_ de conexiones, más eficiente que abrir una conexión nueva en cada petición. Las credenciales de conexión se leen desde variables de entorno (`.env`), que no se suben al repositorio, para no exponer contraseñas en el código.

### Manejo de errores

- `400 Bad Request`: datos inválidos.
- `404 Not Found`: rectángulo o ruta inexistente.
- `500 Internal Server Error`: errores inesperados (por ejemplo, de conexión a la base de datos).

### Pruebas

El archivo `rectangulos.http` incluye casos exitosos (listar, crear rectángulo y cuadrado, consultar, modificar, eliminar) y casos de error (datos faltantes, inválidos o fuera de rango, intento de forzar perímetro/superficie desde el cliente, id inválido y recurso inexistente).

## Diagrama entidad-relación

```
┌──────────────────────┐
│     rectangulos      │
├──────────────────────┤
│ id          PK  INT  │
│ lado_a      DECIMAL  │
│ lado_b      DECIMAL  │
│ perimetro   DECIMAL  │
│ superficie  DECIMAL  │
└──────────────────────┘
```

Es una entidad única y autónoma, sin relaciones con otras tablas, ya que el enunciado no requiere vincular los rectángulos con ningún otro dato.
