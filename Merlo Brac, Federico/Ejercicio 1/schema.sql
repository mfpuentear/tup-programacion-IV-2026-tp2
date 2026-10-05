-- ==========================================================
-- Base de datos y tabla para Ejercicio 1: Rectángulos
-- ==========================================================

CREATE DATABASE IF NOT EXISTS tp2_ejercicio1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tp2_ejercicio1;

DROP TABLE IF EXISTS rectangulos;

CREATE TABLE rectangulos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lado1 DECIMAL(10, 2) NOT NULL,
  lado2 DECIMAL(10, 2) NOT NULL,
  perimetro DECIMAL(10, 2) NOT NULL,
  superficie DECIMAL(10, 2) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Datos iniciales de prueba
INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES
(10.00, 5.00, 30.00, 50.00),
(6.00, 6.00, 24.00, 36.00),
(14.00, 8.00, 44.00, 112.00),
(4.00, 4.00, 16.00, 16.00);
