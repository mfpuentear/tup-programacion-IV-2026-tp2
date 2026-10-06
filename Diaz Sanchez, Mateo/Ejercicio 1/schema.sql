CREATE DATABASE IF NOT EXISTS rectangulos_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE rectangulos_db;

CREATE TABLE IF NOT EXISTS rectangulos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  lado_a DECIMAL(12, 4) NOT NULL,
  lado_b DECIMAL(12, 4) NOT NULL,
  perimetro DECIMAL(13, 4) NOT NULL,
  superficie DECIMAL(24, 8) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT chk_rectangulos_lado_a CHECK (lado_a > 0),
  CONSTRAINT chk_rectangulos_lado_b CHECK (lado_b > 0)
);