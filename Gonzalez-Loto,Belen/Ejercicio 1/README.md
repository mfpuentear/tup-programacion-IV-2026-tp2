# Ejercicio 1

## Descripcion

Se desarrollo una API con ExpressJS para administrar rectangulos, persistiendo la informacion en una base de datos MySQL.

Cada rectangulo tiene dos lados, perimetro y superficie. Al crear o modificar un rectangulo, la API recibe solamente los lados. El perimetro y la superficie se calculan en el servidor antes de guardar los datos, para evitar que el cliente envie valores incorrectos o inconsistentes.

## Modelo de datos

La informacion se guarda en la tabla `rectangulos`.

Estructura:

rectangulos

- id: clave primaria autoincremental.
- lado_a: primer lado del rectangulo.
- lado_b: segundo lado del rectangulo.
- perimetro: valor calculado en el servidor.
- superficie: valor calculado en el servidor.

Se utiliza `id` para identificar cada rectangulo de forma unica.

Se almacenan `perimetro` y `superficie` porque la consigna pide persistirlos, pero no se reciben desde el cliente porque son datos calculados a partir de los lados.

## Calculos

El perimetro se calcula asi:

perimetro = 2 * (ladoA + ladoB)

La superficie se calcula asi:

superficie = ladoA * ladoB

Estos calculos se realizan antes de crear o modificar un registro en la base de datos.

## Rutas y metodos HTTP

### GET /rectangulos

Lista todos los rectangulos guardados.

Se usa `GET` porque solo consulta informacion y no modifica la base de datos.

### GET /rectangulos/:id

Consulta un rectangulo especifico por su id.

Se usa el `id` como parametro porque identifica un registro concreto de la tabla.

### GET /rectangulos?ladoMin=5

Filtra rectangulos cuyos lados sean mayores o iguales al valor indicado.

Se usa query param porque es una consulta filtrada sobre el mismo recurso.

### GET /rectangulos?ladoMax=20

Filtra rectangulos cuyos lados sean menores o iguales al valor indicado.

Tambien se usa query param porque no se crea un recurso nuevo, solo se filtra la consulta.

### POST /rectangulos

Crea un nuevo rectangulo.

Se usa `POST` porque agrega un nuevo registro en la base de datos.

El cliente debe enviar solamente:

{
  "ladoA": 10,
  "ladoB": 5
}

No debe enviar `perimetro` ni `superficie`, porque esos valores se calculan en el servidor.

### PUT /rectangulos/:id

Modifica completamente un rectangulo existente.

Se usa `PUT` porque se reemplazan los lados del rectangulo. Luego el servidor vuelve a calcular el perimetro y la superficie antes de guardar los cambios.

### DELETE /rectangulos/:id

Elimina un rectangulo existente.

Se usa `DELETE` porque quita un registro de la base de datos.

## Metodos no utilizados

No se usa `PATCH` porque no se implementa una modificacion parcial del rectangulo. Para modificarlo se deben enviar nuevamente ambos lados con `PUT`.

No se usa `POST` para consultar porque las consultas corresponden a `GET`.

No se usa `GET` para crear, modificar o eliminar porque `GET` no debe cambiar la informacion almacenada.

## Validaciones

Las validaciones se realizan con `express-validator`.

Se valida que:

- `ladoA` sea obligatorio.
- `ladoB` sea obligatorio.
- Ambos lados sean numericos.
- Ambos lados sean mayores que cero.
- No se envie `perimetro` en el body.
- No se envie `superficie` en el body.
- El parametro `id` sea un entero mayor que cero.
- El query param `ladoMin`, si se envia, sea numerico y mayor que cero.
- El query param `ladoMax`, si se envia, sea numerico y mayor que cero.

Estas validaciones evitan guardar datos incompletos, invalidos o inconsistentes.

## Codigos de estado

- `200 OK`: consulta, modificacion o eliminacion correcta.
- `201 Created`: rectangulo creado correctamente.
- `400 Bad Request`: datos invalidos enviados por el cliente.
- `404 Not Found`: rectangulo no encontrado.

## Base de datos

La base de datos se entrega mediante el archivo `schema.sql`.

No se envia la base de datos fisica, sino el script necesario para crear la base y la tabla.

## Diagrama entidad-relacion

Se incluye una imagen con el diagrama entidad-relacion del ejercicio.

El modelo contiene una unica entidad: `rectangulos`.

Como solo se necesita una tabla, no hay relaciones con otras entidades.

## Archivo de pruebas

Se incluye el archivo `rectangulos.http` para probar la API con REST Client.

Incluye pruebas para crear, listar, filtrar, consultar, modificar, eliminar y validar errores.