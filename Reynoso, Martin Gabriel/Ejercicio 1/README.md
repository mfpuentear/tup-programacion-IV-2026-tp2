======================================================================
EJERCICIO 1: API REST DE RECTANGULOS (ExpressJS + MySQL)
======================================================================

Backend para administrar rectángulos. El cliente envía únicamente las medidas de los lados; el servidor calcula automáticamente el perímetro y la superficie antes de guardar o actualizar en MySQL.

ESTRUCTURA DE ARCHIVOS

Reynoso, Martin Gabriel/
└── Ejercicio 1/
├── config/
│   └── db.js
├── controllers/
│   └── rectanguloController.js
├── middlewares/
│   └── validator.js
├── routes/
│   └── rectanguloRoutes.js
├── .env
├── .env.example
├── der.md
├── index.js
├── package-lock.json
├── package.json
├── rectangulos.http
├── README.md
└── schema.sql

BASE DE DATOS (schema.sql)

CREATE DATABASE IF NOT EXISTS rectangulos_db;
USE rectangulos_db;

CREATE TABLE IF NOT EXISTS rectangulos (
id INT AUTO_INCREMENT PRIMARY KEY,
lado1 DECIMAL(10, 2) NOT NULL,
lado2 DECIMAL(10, 2) NOT NULL,
perimetro DECIMAL(10, 2) NOT NULL,
superficie DECIMAL(10, 2) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

FUNDAMENTACIÓN DE DISEÑO

Tipo DECIMAL(10, 2): Evita errores de redondeo en punto flotante propios de FLOAT/DOUBLE.

Atributos Calculados: Se persisten el perímetro y la superficie para acelerar lecturas masivas sin recalcular en cada consulta.

Seguridad e Integridad: Se bloquea cualquier intento del cliente de enviar "perimetro" o "superficie" en el body. El servidor es la única fuente de verdad.

ENDPOINTS

GET    /api/rectangulos       -> Lista todos los rectángulos (200 OK)

GET    /api/rectangulos/:id   -> Obtiene un rectángulo por ID (200 OK | 404 Not Found)

POST   /api/rectangulos       -> Crea un rectángulo (201 Created | 400 Bad Request)
Body: { "lado1": 10.5, "lado2": 5.0 }

PUT    /api/rectangulos/:id   -> Modifica un rectángulo (200 OK | 400 Bad Request | 404 Not Found)
Body: { "lado1": 12.0, "lado2": 8.0 }

DELETE /api/rectangulos/:id   -> Elimina un rectángulo por ID (200 OK | 404 Not Found)

VALIDACIONES (express-validator)

ID (:id): Debe ser un entero positivo.

Lados (lado1, lado2): Requeridos y mayores a cero (> 0).

Prohibición de Entrada: Si la petición incluye "perimetro" o "superficie", el middleware retorna HTTP 400.

INSTALACIÓN Y EJECUCIÓN

npm install

Cargar schema.sql en MySQL.

Crear el archivo .env basándose en .env.example.

Iniciar servidor: npm run dev (o npm start)

Probar con el archivo rectangulos.http mediante REST Client en VS Code.