# Ejercicio 3: API de calificaciones

API desarrollada con Express y MySQL para consultar y administrar las notas de
alumnos por materia. Cada calificación guarda el nombre del alumno, una materia
y tres notas de 0 a 10. No se permite repetir alumno y materia.

## Archivos

- **`db.js`**: configura y exporta el pool de conexiones a MySQL. Si es
  necesario, modificar allí las credenciales.
- **`script.sql`**: crea la base de datos y las tablas `materias` y
  `calificaciones`, y agrega tres materias iniciales. La clave foránea vincula
  cada calificación con una materia.
- **`index.js`**: inicia la API en el puerto 3003. Valida los datos recibidos,
  consulta MySQL y administra las calificaciones.
- **`pruebas.http`**: contiene ejemplos para probar las rutas, incluyendo casos
  válidos y errores de validación.

## Rutas

| Método | Ruta | Acción |
| --- | --- | --- |
| `GET` | `/materias` | Lista las materias. |
| `GET` | `/materias/:id` | Consulta una materia por ID. |
| `GET` | `/calificaciones` | Lista las calificaciones con el nombre de la materia. |
| `GET` | `/calificaciones/:id` | Consulta una calificación por ID. |
| `POST` | `/calificaciones` | Crea una calificación. |
| `PUT` | `/calificaciones/:id` | Modifica una calificación. |
| `DELETE` | `/calificaciones/:id` | Elimina una calificación. |

La API valida el ID, el nombre del alumno, la materia y las tres notas usando
`express-validator`. Las notas deben ser números entre 0 y 10. Si los datos no
son válidos, responde con `400`; si el recurso no existe, responde con `404`.

## Ejecutar y probar

1. Ejecutar `script.sql` en MySQL.
2. Verificar la configuración de conexión en `db.js`.
3. En esta carpeta, instalar dependencias con `npm install`.
4. Iniciar la API con `node index.js`.
5. Ejecutar las solicitudes de `pruebas.http` con una extensión HTTP de VS Code.

Las pruebas de creación y eliminación cambian los datos de la base. Ejecutarlas
en orden puede ser necesario para que los ejemplos de error y consulta den el
resultado esperado.

### Diagrama Entidad-Relación

![Diagrama Entidad-Relación](./Relaciones%20SQL%203.png)