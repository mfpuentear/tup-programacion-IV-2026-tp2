-- ==========================================================
-- Base de datos y tablas para Ejercicio 3: Calificaciones
-- ==========================================================

CREATE DATABASE IF NOT EXISTS tp2_ejercicio3 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tp2_ejercicio3;

DROP TABLE IF EXISTS calificaciones;
DROP TABLE IF EXISTS materias;

-- Tabla independiente de Materias
CREATE TABLE materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de Calificaciones relacionada por clave foránea
CREATE TABLE calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno VARCHAR(100) NOT NULL,
  materia_id INT NOT NULL,
  nota1 DECIMAL(4, 2) NOT NULL,
  nota2 DECIMAL(4, 2) NOT NULL,
  nota3 DECIMAL(4, 2) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_calificaciones_materia FOREIGN KEY (materia_id)
    REFERENCES materias(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  -- Restricción estricta de unicidad: un alumno no puede tener duplicados en la misma materia
  UNIQUE KEY uq_alumno_materia (alumno, materia_id)
) ENGINE=InnoDB;

-- Datos iniciales de prueba: Materias de la carrera
INSERT INTO materias (id, nombre, codigo) VALUES
(1, 'Programación IV', 'PROG-4'),
(2, 'Base de Datos II', 'BD-2'),
(3, 'Sistemas Operativos', 'SO-1'),
(4, 'Ingeniería de Software', 'ING-SOFT');

-- Calificaciones iniciales de prueba (Escala de 1.00 a 10.00)
INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES
('Federico Merlo Brac', 1, 9.50, 8.50, 10.00),
('Federico Merlo Brac', 2, 8.00, 9.00, 8.50),
('Juan Manuel Guerrero', 1, 7.00, 8.00, 7.50),
('Ana Clara Gómez', 3, 10.00, 9.00, 9.50);
