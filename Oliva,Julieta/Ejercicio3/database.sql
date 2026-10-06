CREATE DATABASE IF NOT EXISTS tp2_ejercicio3;
USE tp2_ejercicio3;

Tabla para almacenar el catálogo de materias
CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

 Tabla para registrar las 3 notas del alumno por materia
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

-- Carga inicial de materias
INSERT IGNORE INTO materias (nombre) VALUES 
('Programación IV'),
('Base de Datos'),
('Matemática');