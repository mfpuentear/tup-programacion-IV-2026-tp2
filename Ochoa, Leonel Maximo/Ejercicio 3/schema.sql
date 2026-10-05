CREATE DATABASE IF NOT EXISTS tp2_ejercicio3
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tp2_ejercicio3;

CREATE TABLE IF NOT EXISTS alumnos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_nombre (nombre)
);

CREATE TABLE IF NOT EXISTS materias (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_nombre (nombre)
);

CREATE TABLE IF NOT EXISTS calificaciones (
  id INT NOT NULL AUTO_INCREMENT,
  alumno_id INT NOT NULL,
  materia_id INT NOT NULL,
  nota1 DECIMAL(4, 2) NOT NULL,
  nota2 DECIMAL(4, 2) NOT NULL,
  nota3 DECIMAL(4, 2) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_alumno_materia (alumno_id, materia_id),
  CONSTRAINT fk_calificaciones_alumno
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  CONSTRAINT fk_calificaciones_materia
    FOREIGN KEY (materia_id) REFERENCES materias(id)
);
