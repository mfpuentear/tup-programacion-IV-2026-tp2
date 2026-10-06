CREATE DATABASE db_rectangulos;

USE db_rectangulos;

CREATE TABLE rectangulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lado1 DECIMAL(10,2) NOT NULL,
    lado2 DECIMAL(10,2) NOT NULL,
    perimetro DECIMAL(10,2) NOT NULL,
    superficie DECIMAL(10,2) NOT NULL
);