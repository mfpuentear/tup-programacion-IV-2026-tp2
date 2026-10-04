CREATE DATABASE IF NOT EXISTS tp2_programacion;
USE tp2_programacion;

CREATE TABLE IF NOT EXISTS materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno VARCHAR(120) NOT NULL,
  materia_id INT NOT NULL,
  nota1 DECIMAL(4,2) NOT NULL,
  nota2 DECIMAL(4,2) NOT NULL,
  nota3 DECIMAL(4,2) NOT NULL,
  CONSTRAINT fk_calificaciones_materia FOREIGN KEY (materia_id) 
    REFERENCES materias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uq_alumno_materia UNIQUE (alumno, materia_id)
);

INSERT IGNORE INTO materias (id, nombre) VALUES 
(1, 'Programación IV'),
(2, 'Bases de Datos'),
(3, 'Laboratorio de Computación');