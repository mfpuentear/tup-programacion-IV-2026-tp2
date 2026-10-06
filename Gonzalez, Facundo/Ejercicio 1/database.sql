CREATE DATABASE IF NOT EXISTS tp2_rectangulos;
USE tp2_rectangulos;

CREATE TABLE IF NOT EXISTS rectangulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lado1 DECIMAL(10,2) NOT NULL,
    lado2 DECIMAL(10,2) NOT NULL,
    perimetro DECIMAL(10,2) NOT NULL,
    superficie DECIMAL(20,4) NOT NULL,
    CHECK (lado1 > 0),
    CHECK (lado2 > 0)
);