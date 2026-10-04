CREATE DATABASE IF NOT EXISTS tp2_rectangulos;
USE tp2_rectangulos;

CREATE TABLE IF NOT EXISTS rectangulos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  base DECIMAL(10,2) NOT NULL,
  altura DECIMAL(10,2) NOT NULL,
  perimetro DECIMAL(12,2) NOT NULL,
  superficie DECIMAL(20,4) NOT NULL,
  CHECK (base > 0),
  CHECK (altura > 0)
);