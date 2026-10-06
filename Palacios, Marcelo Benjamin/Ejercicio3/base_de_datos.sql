SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS tp2_calificaciones
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tp2_calificaciones;

CREATE TABLE IF NOT EXISTS materias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Escala de notas: de 1 a 10, con hasta 2 decimales
CREATE TABLE IF NOT EXISTS calificaciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  alumno VARCHAR(100) NOT NULL,
  materia_id INT UNSIGNED NOT NULL,
  nota1 DECIMAL(4,2) NOT NULL,
  nota2 DECIMAL(4,2) NOT NULL,
  nota3 DECIMAL(4,2) NOT NULL,
  UNIQUE (alumno, materia_id),
  FOREIGN KEY (materia_id) REFERENCES materias(id),
  CHECK (nota1 BETWEEN 1 AND 10),
  CHECK (nota2 BETWEEN 1 AND 10),
  CHECK (nota3 BETWEEN 1 AND 10)
);

-- Materias de ejemplo
INSERT IGNORE INTO materias (nombre) VALUES
  ('Programación'),
  ('Base de Datos'),
  ('Inglés');