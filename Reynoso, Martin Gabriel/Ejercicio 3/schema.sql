CREATE DATABASE IF NOT EXISTS calificaciones_db;
USE calificaciones_db;

-- Tabla de Materias (Entidad independiente)
CREATE TABLE IF NOT EXISTS materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Calificaciones / Cursadas de Alumnos
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

-- Datos iniciales para pruebas
INSERT INTO materias (nombre) VALUES 
('Programación IV'),
('Bases de Datos II'),
('Ingeniería de Software')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);