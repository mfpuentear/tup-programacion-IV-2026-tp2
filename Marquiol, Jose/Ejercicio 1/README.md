# Ejercicio 1: Gestión de Rectángulos

API REST desarrollada con ExpressJS y MySQL para gestionar rectángulos.

## Tecnologías

- Node.js
- ExpressJS
- MySQL
- mysql2
- express-validator
- dotenv

## Modelo de datos

La base de datos utilizada es `db_rectangulos` y contiene la tabla `rectangulos`.

La tabla almacena:

- `id`: identificador único del rectángulo.
- `lado1`: primer lado del rectángulo.
- `lado2`: segundo lado del rectángulo.
- `perimetro`: perímetro calculado por el servidor.
- `superficie`: superficie calculada por el servidor.

El diagrama de la base de datos se encuentra en `diagrama_rectangulos.png`.

## Diseño de la API

La API utiliza los siguientes recursos y métodos:

| Método | Recurso | Descripción |
|--------|---------|-------------|
| GET | `/rectangulos` | Obtiene todos los rectángulos. |
| GET | `/rectangulos/:id` | Obtiene un rectángulo por su ID. |
| POST | `/rectangulos` | Crea un nuevo rectángulo. |
| PUT | `/rectangulos/:id` | Modifica un rectángulo existente. |
| DELETE | `/rectangulos/:id` | Elimina un rectángulo. |

## Validaciones

Los lados del rectángulo son obligatorios y deben ser valores numéricos mayores que cero.

También se valida que el ID utilizado en las operaciones que lo requieren sea un número entero positivo.

Las validaciones se realizan utilizando `express-validator`.

## Cálculo del perímetro y la superficie

Al crear o modificar un rectángulo, el cliente solamente envía los valores de `lado1` y `lado2`.

El perímetro y la superficie son calculados por el servidor:

- Perímetro = 2 × (lado1 + lado2)
- Superficie = lado1 × lado2

Estos valores no son recibidos desde el cliente, evitando que pueda enviar valores incorrectos.

## Justificación del diseño

Se decidió almacenar los lados, el perímetro y la superficie del rectángulo en la base de datos para mantener disponible la información calculada.

Los cálculos se realizan en el servidor para garantizar que el perímetro y la superficie siempre correspondan con los lados enviados por el cliente.

La API utiliza métodos HTTP según la operación que se desea realizar: GET para consultar, POST para crear, PUT para modificar y DELETE para eliminar.

Las consultas a MySQL utilizan parámetros para evitar incorporar directamente los valores recibidos por el cliente en las consultas SQL.

## Instalación y ejecución

Instalar las dependencias:

```bash
npm install