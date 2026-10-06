# Ejercicio 2: API REST para Gestión de Tareas

API desarrollada con Node.js, Express y MySQL para la administración de tareas pendientes y completadas, incluyendo validaciones avanzadas, control de duplicados y filtros por estado.

---

## 🛠️ Tecnologías Utilizadas

* **Node.js** (ES Modules)
* **Express.js** (Framework web)
* **MySQL** (Persistencia de datos)
* **mysql2/promise** (Cliente MySQL con soporte para async/await y Pool de conexiones)
* **express-validator** (Saneamiento y validación de datos)

---

## 🗄️ Esquema de la Base de Datos

El modelo utiliza la base de datos `tp2_ejercicio2` con la siguiente estructura en la tabla `tareas`:

```sql
CREATE DATABASE IF NOT EXISTS tp2_ejercicio2;
USE tp2_ejercicio2;

CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    completada TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);