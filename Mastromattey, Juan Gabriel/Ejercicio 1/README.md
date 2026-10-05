# Ejercicio 1 - API de Rectangulos

## Descripcion

API desarrollada con ExpressJS para administrar rectangulos y almacenar la informacion en una base de datos MySQL.

## Tecnologias

- Node.js
- ExpressJS
- MySQL
- express-validator

## Recursos y métodos

- `GET /rectangulos` → obtiene todos los rectangulos.
- `GET /rectangulos/:id` → obtiene un rectangulo por su ID.
- `POST /rectangulos` → crea un rectangulo.
- `PUT /rectangulos/:id` → modifica un rectangulo.
- `DELETE /rectangulos/:id` → elimina un rectangulo.

## Validaciones

Se utiliza `express-validator` para verificar:

- Que los lados sean valores numéricos mayores que cero.
- Que el ID sea un número entero mayor que cero.

## Calculos

Al crear o modificar un rectangulo, el cliente solamente envia los valores de sus lados.

El servidor calcula:

- Perimetro: `2 × (lado_a + lado_b)`
- Superficie: `lado_a × lado_b`

El perimetro y la superficie no son recibidos desde el cliente.

## Diseño de la base de datos

La tabla `rectangulos` contiene un ID, los dos lados, el perimetro y la superficie.

Se decidio almacenar los resultados calculados para que la informacion del rectangulo quede registrada en la base de datos y pueda consultarse directamente.

## Diagrama

La tabla utilizada es:

`RECTANGULOS`

- `id` → clave primaria
- `lado_a`
- `lado_b`
- `perimetro`
- `superficie`
