======================================================================
EJERCICIO 3: API REST GESTIÓN DE CALIFICACIONES (ExpressJS + MySQL)
======================================================================

Backend para administrar calificaciones de alumnos por materia, garantizando la existencia de la materia, validación de exactamente 3 notas (escala de 1 a 10) y la regla de unicidad por combinación de alumno y materia.

ESTRUCTURA DE ARCHIVOS

Reynoso, Martin Gabriel/
└── Ejercicio 3
├── config/
│   └── db.js
├── controllers/
│   ├── alumnoMateriaController.js
│   └── materiaController.js
├── middlewares/
│   └── validator.js
├── routes/
│   ├── alumnoMateriaRoutes.js
│   └── materiaRoutes.js
├── .env
├── calificaciones.http
├── der.md
├── index.js
├── package.json
├── README.txt
└── schema.sql

BASE DE DATOS (schema.sql)

CREATE DATABASE IF NOT EXISTS calificaciones_db;
USE calificaciones_db;

CREATE TABLE IF NOT EXISTS materias (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL UNIQUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alumno_materia (
id INT AUTO_INCREMENT PRIMARY KEY,
alumno VARCHAR(150) NOT NULL,
materia_id INT NOT NULL,
nota1 DECIMAL(4, 2) NOT NULL,
nota2 DECIMAL(4, 2) NOT NULL,
nota3 DECIMAL(4, 2) NOT NULL,
promedio DECIMAL(4, 2) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
CONSTRAINT uq_alumno_materia UNIQUE (alumno, materia_id)
);

ESCALA Y REGLAS DE NEGOCIO

Escala de Calificaciones: Se define y documenta una escala numérica decimal de 1.00 a 10.00 inclusive.

Tres Notas Obligatorias: Se requiere obligatoriamente nota1, nota2 y nota3 para el alta.

Unicidad Compuesta: No puede existir más de una inscripción/registro para el mismo alumno en la misma materia (evaluado con LOWER + TRIM).

Promedio Automatizado: Calculado en el servidor backend al momento de guardar/actualizar.

ENDPOINTS PRINCIPALES

GET    /api/materias           -> Lista todas las materias (200 OK)

POST   /api/materias           -> Registra una materia (201 Created | 400 Bad Request)

GET    /api/calificaciones     -> Lista todas las calificaciones con JOIN a materias (200 OK)

GET    /api/calificaciones?materia_id=1 -> Filtra calificaciones por materia (200 OK)

GET    /api/calificaciones/:id -> Obtiene una calificación por ID (200 OK | 404 Not Found)

POST   /api/calificaciones     -> Registra notas de un alumno (201 Created | 400 Bad Request)
Body: { "alumno": "Juan", "materia_id": 1, "nota1": 8, "nota2": 9, "nota3": 10 }

PUT    /api/calificaciones/:id -> Actualiza notas/datos (200 OK | 400 Bad Request | 404 Not Found)

DELETE /api/calificaciones/:id -> Elimina un registro de calificación (200 OK | 404 Not Found)

INSTALACIÓN Y EJECUCIÓN

Abrir la terminal en la carpeta del ejercicio e instalar dependencias:
npm install

Importar el archivo schema.sql en MySQL.

Copiar .env.example a .env y configurar las credenciales de MySQL.

Iniciar servidor:
npm run dev (o npm start)

Probar con la extensión REST Client abriendo calificaciones.http.