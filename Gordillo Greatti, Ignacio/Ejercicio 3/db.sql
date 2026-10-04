CREATE DATABASE IF NOT EXISTS tp2_calificaciones;
USE tp2_calificaciones;

CREATE TABLE IF NOT EXISTS materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS alumnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,
  materia_id INT NOT NULL,
  nota1 TINYINT NOT NULL,
  nota2 TINYINT NOT NULL,
  nota3 TINYINT NOT NULL,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  FOREIGN KEY (materia_id) REFERENCES materias(id),
  UNIQUE (alumno_id, materia_id),
  CHECK (nota1 BETWEEN 1 AND 10),
  CHECK (nota2 BETWEEN 1 AND 10),
  CHECK (nota3 BETWEEN 1 AND 10)
);