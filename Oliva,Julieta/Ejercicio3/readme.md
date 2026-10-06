# Ejercicio 3: API de Gestión de Calificaciones

API REST implementada con Node.js, Express y MySQL para registrar materias y administrar tres calificaciones numéricas por alumno, evitando duplicados en una misma materia.

---

## 🛠️ Tecnologías Utilizadas

* **Node.js**
* **Express.js**
* **MySQL** (`mysql2/promise` con Pool de conexiones)
* **express-validator**

---

## 🗄️ Esquema de Base de Datos

El diseño utiliza la base de datos `tp2_ejercicio3` con dos tablas asociadas mediante clave foránea:

```sql
CREATE DATABASE IF NOT EXISTS tp2_ejercicio3;
USE tp2_ejercicio3;

CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS alumnos_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_nombre VARCHAR(150) NOT NULL,
    materia_id INT NOT NULL,
    nota1 DECIMAL(4,2) NOT NULL,
    nota2 DECIMAL(4,2) NOT NULL,
    nota3 DECIMAL(4,2) NOT NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    UNIQUE KEY uq_alumno_materia (alumno_nombre, materia_id)
);