# Ejercicio 1

## Descripción

API REST desarrollada con Express para administrar rectángulos y persistirlos
en MySQL. El cliente envía los dos lados; el servidor calcula el perímetro y la
superficie tanto al crear como al modificar un registro.

## Archivos y funcionamiento

- `script.sql`: crea la base de datos `tp2_programacion` si no existe, la
	selecciona y crea la tabla `rectangulos`. La tabla tiene un `id` entero
	autoincremental como clave primaria y guarda `lado1`, `lado2`, `perimetro` y
	`superficie` como valores `DECIMAL(10,2)` obligatorios.
- `db.js`: crea y exporta un pool de conexiones de `mysql2/promise`.
- `pruebas.http`: contiene solicitudes de ejemplo para ejecutar manualmente
	contra la API desde una extensión de cliente HTTP de VS Code. Las operaciones
	modifican la base configurada, por lo que conviene revisar los IDs antes de
	ejecutar las pruebas de modificación y eliminación.

## API

La API escucha en `http://localhost:3001`.

| Método y ruta | Comportamiento | Respuesta principal |
| --- | --- | --- |
| `GET /rectangulos` | Lista todos los rectángulos. | `200` con un arreglo JSON. |
| `GET /rectangulos/:id` | Busca un rectángulo por su ID. El ID debe ser un entero positivo. | `200` con el objeto o `404` si no existe. |
| `POST /rectangulos` | Crea un rectángulo a partir de `lado1` y `lado2`. | `201` con el registro creado y su ID. |
| `PUT /rectangulos/:id` | Verifica que exista y reemplaza sus lados; vuelve a calcular perímetro y superficie. | `200` con el registro actualizado o `404` si no existe. |
| `DELETE /rectangulos/:id` | Elimina el registro indicado. | `200` si se eliminó o `404` si no existe. |

Para `POST` y `PUT`, el cuerpo debe ser JSON con ambos lados, por ejemplo:

```json
{
	"lado1": 10,
	"lado2": 5
}
```

Los dos lados deben ser valores numéricos mayores que cero. Si no cumplen esa
condición, la respuesta es `400` e incluye los detalles en `errores`. El
perímetro se calcula como `2 * (lado1 + lado2)` y la superficie como
`lado1 * lado2`; esos valores no se reciben del cliente.

## Preparación y ejecución

1. Ejecutar `script.sql` en MySQL para crear la base y la tabla.
2. Desde esta carpeta, instalar las dependencias con `npm install`.
3. Iniciar el servidor con `node index.js`.
4. Ejecutar las solicitudes de `pruebas.http` con una extensión REST Client de
	 VS Code.

La conexión y sus credenciales se configuran en `db.js`; deben coincidir con
la configuración local de MySQL. No publicar credenciales reales en el
repositorio.

## Enunciado original

Desarrollar una API con ExpressJS para administrar rectángulos, persistiendo la
información en una base de datos MySQL. Para cada rectángulo se almacenan sus
dos lados, su perímetro y su superficie. Los valores derivados se calculan en
el servidor y no se aceptan desde el cliente. Los lados deben validarse como
valores numéricos mayores que cero y los parámetros de las solicitudes deben
validarse con `express-validator`.

### Diagrama Entidad-Relación

![Diagrama Entidad-Relación](./Relaciones%20SQL.png)