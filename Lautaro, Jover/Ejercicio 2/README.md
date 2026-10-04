# Ejercicio 2: API de tareas

## Descripción

API REST construida con Express para crear, consultar, modificar y eliminar
tareas. Cada tarea tiene un identificador, un nombre y un estado que indica si
está completada. Los datos se guardan en MySQL.

## Funcionamiento de los archivos

- `script.sql`: crea la base `tp2_programacion` si todavía no existe y la
	selecciona. Después crea la tabla `tareas`: `id` es la clave primaria
	autoincremental, `nombre` es obligatorio y `completada` es un booleano
	obligatorio que vale `FALSE` por defecto. También define un índice único
	sobre `nombre`.
- `db.js`: configura y exporta un pool de conexiones usando
	`mysql2/promise`. Se conecta al servidor MySQL local y a la base
	`tp2_programacion`; `index.js` utiliza el pool para realizar las consultas.
- `index.js`: configura Express para recibir JSON, define las rutas y valida
	parámetros, filtros y cuerpos con `express-validator`. Las rutas consultan o
	modifican MySQL mediante consultas parametrizadas. En la creación y
	modificación también se comprueba que no haya otra tarea con el mismo nombre
	ignorando mayúsculas y espacios al principio o al final.
- `pruebas.http`: reúne solicitudes HTTP de ejemplo para ejecutar manualmente
	con una extensión REST Client de VS Code. Incluye casos válidos y casos de
	error de validación, duplicados, filtro inválido y recurso inexistente. Las
	pruebas de modificación y eliminación usan IDs fijos, por lo que el resultado
	depende de los datos que existan en la base.

## Rutas disponibles

El servidor escucha en `http://localhost:3002`.

| Método y ruta | Descripción | Respuesta esperada |
| --- | --- | --- |
| `GET /tareas` | Devuelve todas las tareas. | `200` y un arreglo JSON. |
| `GET /tareas?estado=completadas` | Devuelve solo tareas completadas. | `200` y un arreglo JSON. |
| `GET /tareas?estado=pendientes` | Devuelve solo tareas pendientes. | `200` y un arreglo JSON. |
| `GET /tareas/:id` | Busca una tarea por ID entero positivo. | `200` y la tarea, o `404` si no existe. |
| `POST /tareas` | Crea una tarea. | `201` y la tarea creada con su ID. |
| `PUT /tareas/:id` | Reemplaza el nombre y el estado de una tarea existente. | `200` y la tarea actualizada, o `404` si no existe. |
| `DELETE /tareas/:id` | Elimina una tarea existente. | `200` si se eliminó, o `404` si no existe. |

El filtro `estado` es opcional; si se envía, solo admite `completadas` o
`pendientes`. Otro valor produce una respuesta `400` con los errores de
validación.

## Datos de entrada y errores

Para crear una tarea, `nombre` es obligatorio y no puede quedar vacío después
de quitar los espacios exteriores. `completada` es opcional y, si se omite, se
guarda como `false`. Si se envía, debe ser booleano (`true` o `false`). Por
ejemplo:

```json
{
	"nombre": "Estudiar para Programacion IV",
	"completada": false
}
```

Para modificar una tarea, se requieren tanto `nombre` como `completada`. Los
nombres duplicados se rechazan con `400`; la API compara los nombres sin
distinguir mayúsculas y después de quitar espacios exteriores. Los errores de
validación también responden `400`, una tarea inexistente responde `404` y los
errores de consulta a MySQL responden `500` con un mensaje y el detalle del
error.

## Preparación y ejecución

1. Ejecutar `script.sql` en MySQL.
2. Desde esta carpeta, instalar las dependencias con `npm install`.
3. Revisar en `db.js` que el host, el usuario y la contraseña coincidan con la
	 configuración local de MySQL.
4. Iniciar la API con `node index.js`.
5. Ejecutar las solicitudes de `pruebas.http` desde VS Code mientras el
	 servidor esté activo.

### Diagrama Entidad-Relación

![Diagrama Entidad-Relación](./Relaciones%20SQL%202.png)