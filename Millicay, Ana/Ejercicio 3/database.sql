CREATE DATABASE IF NOT EXISTS tp2_ejercicio3
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tp2_ejercicio3;

CREATE TABLE IF NOT EXISTS materias (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_materias_nombre (nombre)
);

CREATE TABLE IF NOT EXISTS calificaciones (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  alumno     VARCHAR(100) NOT NULL,
  materia_id INT NOT NULL,
  nota1      DECIMAL(4,2) NOT NULL,
  nota2      DECIMAL(4,2) NOT NULL,
  nota3      DECIMAL(4,2) NOT NULL,
  CONSTRAINT fk_calificaciones_materia FOREIGN KEY (materia_id)
    REFERENCES materias (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT uq_alumno_materia UNIQUE (alumno, materia_id),
  CONSTRAINT chk_notas CHECK (
    nota1 BETWEEN 0 AND 10 AND nota2 BETWEEN 0 AND 10 AND nota3 BETWEEN 0 AND 10
  )
);
