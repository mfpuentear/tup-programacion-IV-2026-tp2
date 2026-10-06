======================================================================
EJERCICIO 2: API REST PARA LISTA DE TAREAS (ExpressJS + MySQL)
======================================================================

Backend para administrar una lista de tareas con estados (pendientes / completadas), garantizando unicidad de nombres y filtrado directo desde MySQL.

ESTRUCTURA DE ARCHIVOS

Reynoso, Martin Gabriel/
└── Ejercicio 2/
├── config/
│   └── db.js
├── controllers/
│   └── tareaController.js
├── middlewares/
│   └── validator.js
├── routes/
│   └── tareaRoutes.js
├── .env
├── .env.example
├── der.md
├── index.js
├── package.json
├── README.txt
├── schema.sql
└── tareas.http

BASE DE DATOS (schema.sql)

CREATE DATABASE IF NOT EXISTS tareas_db;
USE tareas_db;

CREATE TABLE IF NOT EXISTS tareas (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(255) NOT NULL,
completada BOOLEAN NOT NULL DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT uq_tarea_nombre UNIQUE (nombre)
);

FUNDAMENTACIÓN DE DISEÑO

Criterio de Unicidad: Se aplica comparacion insensible a mayúsculas y espacios (LOWER + TRIM) tanto a nivel middleware como base de datos, impidiendo duplicados como "Estudiar" y "estudiar ".

Tipo BOOLEAN: MySQL mapea el tipo BOOLEAN a TINYINT(1). La API se encarga de convertir y exponer la propiedad siempre como tipo Boolean en JSON.

Filtrado Eficiente: Las consultas de filtrado por estado (completada=true/false) se ejecutan directamente en MySQL con cláusula WHERE en la query SQL.

ENDPOINTS

GET    /api/tareas                 -> Lista todas las tareas (200 OK)

GET    /api/tareas?completada=true -> Lista tareas filtradas (200 OK | 400 Bad Request)

GET    /api/tareas/:id             -> Obtiene una tarea por ID (200 OK | 404 Not Found)

POST   /api/tareas                 -> Crea una nueva tarea (201 Created | 400 Bad Request)
Body: { "nombre": "Comprar insumos", "completada": false }

PUT    /api/tareas/:id             -> Modifica una tarea (200 OK | 400 Bad Request | 404 Not Found)
Body: { "nombre": "Nuevo nombre", "completada": true }

DELETE /api/tareas/:id             -> Elimina una tarea por ID (200 OK | 404 Not Found)

VALIDACIONES (express-validator)

ID (:id): Debe ser un número entero positivo.

Nombre: Obligatorio para creación, texto de 3 a 255 caracteres sin estar vacío.

Estado (completada): Debe ser un valor booleano estricto (true/false).

Query Filter (completada): Valida que la consulta sea un booleano válido en la URL.

INSTALACIÓN Y EJECUCIÓN

npm install

Cargar schema.sql en MySQL.

Crear el archivo .env basándose en .env.example.

Iniciar servidor: npm run dev (o npm start)

Probar endpoints abriendo tareas.http con la extensión REST Client.