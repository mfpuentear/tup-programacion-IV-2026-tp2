# Ejercicio 1 - API de Rectángulos

## Descripción

API REST desarrollada con ExpressJS para administrar rectángulos, utilizando MySQL como sistema de persistencia.

La API permite crear, consultar, modificar y eliminar rectángulos.

Al crear o modificar un rectángulo, el cliente solamente envía los valores de la base y la altura. El perímetro y la superficie son calculados por el servidor antes de guardar la información en la base de datos.

## Tecnologías utilizadas

- Node.js
- ExpressJS
- MySQL
- mysql2
- express-validator

## Modelo de datos

La tabla `rectangulos` contiene los siguientes campos:

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT | Identificador único |
| base | DECIMAL(10,2) | Base del rectángulo |
| altura | DECIMAL(10,2) | Altura del rectángulo |
| perimetro | DECIMAL(10,2) | Perímetro calculado por el servidor |
| superficie | DECIMAL(10,2) | Superficie calculada por el servidor |

El campo `id` es la clave primaria y se genera automáticamente.

El diagrama entidad-relación se encuentra en el archivo `diagrama-er.png`.

## Cálculos

El perímetro se calcula mediante:

`perimetro = 2 * (base + altura)`

La superficie se calcula mediante:

`superficie = base * altura`

Estos valores no son recibidos como datos válidos desde el cliente, sino que son calculados por el servidor.

## Endpoints

### GET /rectangulos

Obtiene todos los rectángulos almacenados.

Respuesta exitosa: `200 OK`.

### GET /rectangulos/:id

Obtiene un rectángulo específico mediante su identificador.

Respuesta exitosa: `200 OK`.

Si el rectángulo no existe: `404 Not Found`.

El parámetro `id` es validado mediante `express-validator`.

### POST /rectangulos

Crea un nuevo rectángulo.

El cuerpo de la solicitud debe contener:

```json
{
    "base": 10,
    "altura": 5
}