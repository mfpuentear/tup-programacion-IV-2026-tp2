# Ejercicio 1: Rectángulos

---

## Descripción
Esta API sirve para administrar rectángulos. Cumpliendo con lo pedido en la rúbrica, la aplicación solo recibe la `medida_base` y `medida_altura`. El cálculo del perímetro y la superficie se hace de forma automática del lado del servidor antes de guardar los datos.

También le agregué validaciones con `express-validator` para evitar que se envíen datos incorrectos (como texto en vez de números) o que se intente mandar el perímetro/superficie a mano en el body.

## Tecnologías usadas
* Node.js + Express
* MySQL2
* Express-Validator

## Estructura de archivos
La organización del código dentro de la carpeta `Ejercicio 1` es la siguiente:

* **`src/`**
  * **`routes/`**
    * `rectangulos.routes.js`: Las rutas del CRUD (GET, POST, PUT, DELETE).
  * **`validators/`**
    * `validators.js`: Middlewares con las reglas de validación.
  * `db.js`: Conexión al pool de MySQL y creación automática de la tabla.
* `database.sql`: Script original de creación de la base de datos y la tabla.
* `der.md`: Diagrama Entidad-Relación de la base de datos.
* `index.js`: Archivo principal que levanta el servidor.
* `pruebas.http`: Archivo con las peticiones listas para probar.
* `.env` / `.env.example`: Archivos de configuración de variables de entorno.

## Pasos para levantarlo

1. Instalar los paquetes:
   ```bash
   npm install