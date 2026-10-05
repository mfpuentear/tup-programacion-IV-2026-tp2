CREATE DATABASE IF NOT EXISTS tp2_ejercicio3;
USE tp2_ejercicio3;

CREATE TABLE IF NOT EXISTS materias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  nombre_normalizado VARCHAR(120) NOT NULL,
  CONSTRAINT uq_materias_nombre_normalizado UNIQUE (nombre_normalizado)
);

CREATE TABLE IF NOT EXISTS calificaciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  alumno VARCHAR(120) NOT NULL,
  alumno_normalizado VARCHAR(120) NOT NULL,
  materia_id INT UNSIGNED NOT NULL,
  nota1 DECIMAL(4,2) NOT NULL,
  nota2 DECIMAL(4,2) NOT NULL,
  nota3 DECIMAL(4,2) NOT NULL,
  CONSTRAINT fk_calificaciones_materia
    FOREIGN KEY (materia_id) REFERENCES materias(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT uq_calificaciones_alumno_materia
    UNIQUE (alumno_normalizado, materia_id),
  CONSTRAINT chk_nota1 CHECK (nota1 >= 0 AND nota1 <= 10),
  CONSTRAINT chk_nota2 CHECK (nota2 >= 0 AND nota2 <= 10),
  CONSTRAINT chk_nota3 CHECK (nota3 >= 0 AND nota3 <= 10)
);
