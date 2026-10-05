# Ejercicio 3

# API REST - Gestión de Calificaciones y Materias

API backend desarrollada con **Node.js**, **Express.js** y **MySQL** para la gestión de alumnos, materias y calificaciones universitarias. Cumple con reglas de validación estricta, restricciones de unicidad e integridad referencial.

### Tecnologías Utilizadas

* **Node.js** - Entorno de ejecución para JavaScript.
* **Express.js** - Framework web para Node.js.
* **MySQL (mysql2)** - Base de datos relacional y cliente de conexión.
* **Express-Validator** - Librería para la validación de parámetros, consultas y cuerpos de solicitudes.
* **Dotenv** - Manejo de variables de entorno.
* **Nodemon** - Herramienta de desarrollo para reinicio automático.

---

### Estructura del Proyecto

```text
/
├── src/
│   ├── config/
│   │   └── db.js               # Configuración de la conexión al pool de MySQL
│   ├── middlewares/
│   │   └── validarCampos.js    # Middleware para interceptar errores de express-validator
│   ├── routes/
│   │   ├── materias.routes.js  # Endpoints para la gestión de materias
│   │   └── calificaciones.routes.js # Endpoints para la gestión de calificaciones y notas
│   └── index.js                # Archivo principal de inicialización de Express
├── .env                        # Variables de entorno
├── calificaciones.http         # Archivo de pruebas con extension REST Client
└── package.json
