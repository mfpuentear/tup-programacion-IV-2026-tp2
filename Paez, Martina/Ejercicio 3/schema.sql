CREATE DATABASE IF NOT EXISTS programacion4
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE programacion4;

-- Ejercicio 3: Calificaciones
CREATE TABLE IF NOT EXISTS materias (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(150) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_materias_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS calificaciones (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  alumno             VARCHAR(150) NOT NULL,
  alumno_normalizado VARCHAR(150) NOT NULL,
  materia_id         INT NOT NULL,
  nota1              DECIMAL(4,2) NOT NULL,
  nota2              DECIMAL(4,2) NOT NULL,
  nota3              DECIMAL(4,2) NOT NULL,
  creado_en          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_calificaciones_materia
    FOREIGN KEY (materia_id) REFERENCES materias(id)
    ON DELETE RESTRICT,

  CONSTRAINT uq_alumno_materia UNIQUE (alumno_normalizado, materia_id),

  CONSTRAINT chk_nota1_rango CHECK (nota1 BETWEEN 1 AND 10),
  CONSTRAINT chk_nota2_rango CHECK (nota2 BETWEEN 1 AND 10),
  CONSTRAINT chk_nota3_rango CHECK (nota3 BETWEEN 1 AND 10)
);
