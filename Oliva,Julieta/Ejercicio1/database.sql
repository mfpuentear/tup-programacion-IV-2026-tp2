-- 1. Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS tp2_ejercicio1;

-- 2. Seleccionar la base de datos para usarla
USE tp2_ejercicio1;

-- 3. Crear la tabla 'rectangulos'
CREATE TABLE IF NOT EXISTS rectangulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lado_a DECIMAL(10, 2) NOT NULL,
    lado_b DECIMAL(10, 2) NOT NULL,
    perimetro DECIMAL(10, 2) NOT NULL,
    superficie DECIMAL(10, 2) NOT NULL
);