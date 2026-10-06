# Ejercicio 1 - API de Rectángulos

API REST desarrollada con ExpressJS y MySQL para administrar rectángulos.

## Modelo de datos

Se utiliza la tabla `rectangulos` con los siguientes campos:

- `id`: identificador único del rectángulo y clave primaria.
- `lado1`: longitud del primer lado.
- `lado2`: longitud del segundo lado.
- `perimetro`: perímetro calculado por el servidor.
- `superficie`: superficie calculada por el servidor.

Los campos `lado1`, `lado2`, `perimetro` y `superficie` utilizan el tipo
`DECIMAL(10,2)` para permitir valores con decimales.

El perímetro y la superficie se almacenan en la base de datos, pero no son
recibidos desde el cliente. Se calculan en el servidor a partir de los lados:

- Perímetro: `2 * (lado1 + lado2)`
- Superficie: `lado1 * lado2`

## Recursos y métodos HTTP

El recurso utilizado es `/rectangulos`.

| Método | Recurso | Descripción |
|---|---|---|
| GET | `/rectangulos` | Obtiene todos los rectángulos |
| GET | `/rectangulos/:id` | Obtiene un rectángulo por su ID |
| POST | `/rectangulos` | Crea un nuevo rectángulo |
| PUT | `/rectangulos/:id` | Modifica un rectángulo existente |
| DELETE | `/rectangulos/:id` | Elimina un rectángulo |

Se utiliza el nombre del recurso en plural y los métodos HTTP indican la
operación que se realiza sobre dicho recurso.

## Validaciones

Las validaciones se realizan utilizando `express-validator`.

- Los dos lados son obligatorios.
- Los lados deben ser valores numéricos mayores que cero.
- Los ID enviados como parámetros deben ser enteros mayores que cero.
- En la creación y modificación solamente se permiten `lado1` y `lado2`.
- El cliente no puede establecer manualmente el perímetro ni la superficie.

## Respuestas HTTP

La API utiliza los siguientes códigos de estado:

- `200 OK`: consulta o modificación realizada correctamente.
- `201 Created`: rectángulo creado correctamente.
- `400 Bad Request`: datos o parámetros inválidos.
- `404 Not Found`: rectángulo no encontrado.
- `500 Internal Server Error`: error al realizar una operación con la base de datos.

## Base de datos

El archivo `database.sql` contiene las instrucciones necesarias para crear la
base de datos y la tabla utilizada por el ejercicio.

El diagrama entidad-relación se encuentra en `DER_rectangulos.png`.

## Pruebas

El archivo `pruebas.http` contiene solicitudes para probar los distintos
métodos y casos de validación de la API.