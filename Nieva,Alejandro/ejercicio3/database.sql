CREATE DATABASE IF NOT EXISTS tp2_programacion;
USE tp2_programacion;

-- Tabla de Materias
CREATE TABLE IF NOT EXISTS materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Poblado inicial de materias
INSERT INTO materias (nombre) VALUES 
('Programación IV'),
('Bases de Datos'),
('Matemática');

-- Tabla de Calificaciones / Alumnos por Materia
CREATE TABLE IF NOT EXISTS calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno VARCHAR(150) NOT NULL,
  materia_id INT NOT NULL,
  nota1 DECIMAL(4,2) NOT NULL,
  nota2 DECIMAL(4,2) NOT NULL,
  nota3 DECIMAL(4,2) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
  CONSTRAINT uk_alumno_materia UNIQUE (alumno, materia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;