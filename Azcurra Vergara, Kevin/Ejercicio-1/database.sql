CREATE DATABASE rectangulos_db;

USE rectangulos_db;

CREATE TABLE rectangulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ladoA DECIMAL(10,2) NOT NULL,
    ladoB DECIMAL(10,2) NOT NULL,
    perimetro DECIMAL(10,2) NOT NULL,
    superficie DECIMAL(10,2) NOT NULL
);