CREATE DATABASE IF NOT EXISTS calificaciones_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE calificaciones_db;

CREATE TABLE IF NOT EXISTS alumnos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  nombre_clave VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_alumnos_nombre_clave (nombre_clave)
);

CREATE TABLE IF NOT EXISTS materias (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  nombre_clave VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_materias_nombre_clave (nombre_clave)
);

CREATE TABLE IF NOT EXISTS calificaciones (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  alumno_id INT UNSIGNED NOT NULL,
  materia_id INT UNSIGNED NOT NULL,
  nota_1 DECIMAL(4, 2) NOT NULL,
  nota_2 DECIMAL(4, 2) NOT NULL,
  nota_3 DECIMAL(4, 2) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_calificaciones_alumno_materia (alumno_id, materia_id),
  CONSTRAINT fk_calificaciones_alumno FOREIGN KEY (alumno_id)
    REFERENCES alumnos (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_calificaciones_materia FOREIGN KEY (materia_id)
    REFERENCES materias (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_nota_1 CHECK (nota_1 BETWEEN 0 AND 10),
  CONSTRAINT chk_nota_2 CHECK (nota_2 BETWEEN 0 AND 10),
  CONSTRAINT chk_nota_3 CHECK (nota_3 BETWEEN 0 AND 10)
);