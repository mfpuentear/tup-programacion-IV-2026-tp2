CREATE DATABASE IF NOT EXISTS tp2_calificaciones
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE tp2_calificaciones;

CREATE TABLE IF NOT EXISTS materias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT uq_materias_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS calificaciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  alumno VARCHAR(100) NOT NULL,
  materia_id INT UNSIGNED NOT NULL,
  nota1 TINYINT UNSIGNED NOT NULL,
  nota2 TINYINT UNSIGNED NOT NULL,
  nota3 TINYINT UNSIGNED NOT NULL,
  CONSTRAINT fk_calificaciones_materia
    FOREIGN KEY (materia_id) REFERENCES materias(id),
  CONSTRAINT uq_calificaciones_alumno_materia
    UNIQUE (alumno, materia_id),
  CONSTRAINT chk_nota1 CHECK (nota1 BETWEEN 1 AND 10),
  CONSTRAINT chk_nota2 CHECK (nota2 BETWEEN 1 AND 10),
  CONSTRAINT chk_nota3 CHECK (nota3 BETWEEN 1 AND 10)
);

-- Materias de ejemplo
INSERT IGNORE INTO materias (nombre) VALUES
  ('Programación I'),
  ('Programación IV'),
  ('Base de Datos'),
  ('Matemática');