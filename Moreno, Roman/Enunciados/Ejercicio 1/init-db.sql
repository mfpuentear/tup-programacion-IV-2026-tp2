-- Crear base de datos
CREATE DATABASE IF NOT EXISTS rectangulos_db;

-- Usar la base de datos
USE rectangulos_db;

-- Crear tabla de rectángulos
CREATE TABLE IF NOT EXISTS rectangulos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lado1 DECIMAL(10,2) NOT NULL,
  lado2 DECIMAL(10,2) NOT NULL,
  perimetro DECIMAL(10,2) NOT NULL,
  superficie DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
