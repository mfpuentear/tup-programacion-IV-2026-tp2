CREATE DATABASE IF NOT EXISTS tp2_ejercicio1;
USE tp2_ejercicio1;

CREATE TABLE IF NOT EXISTS rectangulos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lado1 DECIMAL(10,2) NOT NULL,
  lado2 DECIMAL(10,2) NOT NULL,
  perimetro DECIMAL(11,2) NOT NULL,
  superficie DECIMAL(20,4) NOT NULL,
  CONSTRAINT chk_rectangulos_lado1 CHECK (lado1 > 0),
  CONSTRAINT chk_rectangulos_lado2 CHECK (lado2 > 0)
);
