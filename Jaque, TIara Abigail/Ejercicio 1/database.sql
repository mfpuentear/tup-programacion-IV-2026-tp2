CREATE DATABASE IF NOT EXISTS tp2_programacion;
USE tp2_programacion;

CREATE TABLE rectangulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    base DECIMAL(10,2) NOT NULL,
    altura DECIMAL(10,2) NOT NULL,
    perimetro DECIMAL(10,2) NOT NULL,
    superficie DECIMAL(10,2) NOT NULL
);