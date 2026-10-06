SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS tp2_rectangulos
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tp2_rectangulos;

CREATE TABLE IF NOT EXISTS rectangulos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  base DECIMAL(10,2) NOT NULL,
  altura DECIMAL(10,2) NOT NULL,
  perimetro DECIMAL(11,2) NOT NULL,
  superficie DECIMAL(17,4) NOT NULL,
  CHECK (base > 0),
  CHECK (altura > 0)
);