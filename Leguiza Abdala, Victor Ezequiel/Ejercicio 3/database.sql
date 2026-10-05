CREATE DATABASE IF NOT EXISTS tp2_calificaciones;
USE tp2_calificaciones;

DROP TABLE IF EXISTS calificaciones;
DROP TABLE IF EXISTS materias;

CREATE TABLE materias (
  id_materia INT AUTO_INCREMENT PRIMARY KEY,
  nombre_materia VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE calificaciones (
  id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
  nombre_alumno VARCHAR(255) NOT NULL,
  id_materia INT NOT NULL,
  nota_1 DECIMAL(4,2) NOT NULL,
  nota_2 DECIMAL(4,2) NOT NULL,
  nota_3 DECIMAL(4,2) NOT NULL,
  FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE
);

INSERT INTO materias (nombre_materia) VALUES 
('Programación IV'), 
('Probabilidad y Estadística'), 
('Bases de Datos');