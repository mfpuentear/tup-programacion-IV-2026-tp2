CREATE DATABASE ejercicio1;

USE ejercicio1;

CREATE TABLE rectangulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lado_a DECIMAL(10,2) NOT NULL,
    lado_b DECIMAL(10,2) NOT NULL,
    perimetro DECIMAL(10,2) NOT NULL,
    superficie DECIMAL(10,2) NOT NULL
);