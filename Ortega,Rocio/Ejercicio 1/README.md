# Ejercicio 1 - API de Rectángulos

## Descripción

En este ejercicio se realizo una API REST con ExpressJS y MySQL para poder administrar rectangulos.
Cada rectángulo tiene una base, una altura, un perimetro y una superficie. La base y la altura son los datos que ingresa el usuario, mientras que el perímetro y la superficie son calculados por el servidor.

## Modelo de datos

Se utilizó una tabla llamada `rectangulos` con los siguientes campos:

- `id`: identificador del rectángulo.
- `base`: medida de la base.
- `altura`: medida de la altura.
- `perimetro`: perimetro calculado.
- `superficie`: superficie calculada.

El campo `id` es la clave primaria y se genera automáticamente.

Elegí este modelo porque es simple y contiene todos los datos necesarios para representar un rectángulo. Ademas, guardar el perímetro y la superficie permite tener registrados los resultados calculados.

## Diseño de la API

La API está organizada utilizando el recurso `rectangulos` y los métodos HTTP correspondientes:

- `GET /rectangulos`: obtiene todos los rectángulos.
- `GET /rectangulos/:id`: obtiene un rectángulo por su ID.
- `POST /rectangulos`: crea un nuevo rectángulo.
- `PUT /rectangulos/:id`: modifica un rectángulo.
- `DELETE /rectangulos/:id`: elimina un rectángulo.


## Calculos

El perímetro se calcula de la siguiente manera:

`2 * (base + altura)`

La superficie se calcula:

`base * altura`

## Validaciones

Se utilizó `express-validator` para controlar los datos que recibe la API.

Se verifica que:

- La base y la altura sean obligatorias.
- Sean valores numéricos.
- Sean mayores a cero.
- El ID sea un numero entero positivo.
- No se pueda enviar el perimetro desde el cliente.
- No se pueda enviar la superficie desde el cliente.

También se controlan los casos en los que el rectangulo no existe y los errores que puedan ocurrir en el servidor.