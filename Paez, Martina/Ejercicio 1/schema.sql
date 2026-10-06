
CREATE DATABASE IF NOT EXISTS programacion4
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE programacion4;

-- Ejercicio 1: Rectangulos
CREATE TABLE IF NOT EXISTS rectangulos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  lado_a     DECIMAL(10,2) NOT NULL,
  lado_b     DECIMAL(10,2) NOT NULL,
  perimetro  DECIMAL(10,2) NOT NULL,
  superficie DECIMAL(10,2) NOT NULL,
  creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_lado_a_positivo CHECK (lado_a > 0),
  CONSTRAINT chk_lado_b_positivo CHECK (lado_b > 0)
);
