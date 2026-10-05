CREATE DATABASE IF NOT EXISTS tp2_ejercicio1
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tp2_ejercicio1;

CREATE TABLE IF NOT EXISTS rectangulos (
  id INT NOT NULL AUTO_INCREMENT,
  lado_a DECIMAL(10, 2) NOT NULL,
  lado_b DECIMAL(10, 2) NOT NULL,
  perimetro DECIMAL(10, 2) NOT NULL,
  superficie DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id)
);
