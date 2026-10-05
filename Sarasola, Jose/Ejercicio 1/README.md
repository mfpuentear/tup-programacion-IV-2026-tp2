# Ejercicio 1 - Rectángulos

## Diseño

Se utiliza el recurso `/rectangulos` y un identificador numérico autoincremental como clave primaria. La tabla almacena los dos lados, el perímetro y la superficie porque el enunciado exige persistir los cuatro valores.

El cliente solamente puede enviar `lado1` y `lado2`. Los campos adicionales se rechazan, por lo que no es posible enviar `perimetro` ni `superficie`. Ambos valores derivados se calculan en el servidor antes de ejecutar `INSERT` o `UPDATE`.
Los lados deben estar presentes, ser números JSON reales, finitos y mayores que cero.

Debido a que la base de datos utiliza `DECIMAL(10,2)` para almacenar los lados, se admiten como máximo dos cifras decimales y un valor máximo de `99999999.99`.

## Endpoints

- `GET /rectangulos`: lista todos los rectángulos.
- `GET /rectangulos?cuadrado=true|false`: filtra cuadrados o no cuadrados.
- `GET /rectangulos/:id`: obtiene uno.
- `POST /rectangulos`: crea uno recibiendo solamente los lados.
- `PUT /rectangulos/:id`: reemplaza los lados y recalcula datos derivados.
- `DELETE /rectangulos/:id`: elimina uno.

## Validaciones

Se utiliza `express-validator` para validar lados, `id` y el query `cuadrado`. Los lados deben estar presentes, ser números JSON reales, finitos y mayores que cero. Debido a que se almacenan como `DECIMAL(10,2)`, se admiten como máximo dos cifras decimales y un valor máximo de `99999999.99`. También se rechazan campos de body y query no implementados.

## Códigos HTTP

- `200`: consulta o modificación exitosa.
- `201`: creación exitosa.
- `204`: eliminación exitosa.
- `400`: entrada inválida.
- `404`: recurso inexistente.
- `500`: error inesperado.

## Instalación

1. Ejecutar `database.sql` en MySQL.
2. Copiar `.env.example` como `.env` y completar credenciales.
3. Ejecutar `npm install`.
4. Ejecutar `npm start`.
