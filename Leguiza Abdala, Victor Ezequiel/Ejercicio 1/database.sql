CREATE DATABASE IF NOT EXISTS tp2_rectangulos;

USE tp2_rectangulos;

DROP TABLE IF EXISTS rectangulos;

CREATE TABLE rectangulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lado_a DECIMAL(10,2) NOT NULL,
    lado_b DECIMAL(10,2) NOT NULL,
    perimetro DECIMAL(12,2) NOT NULL,
    superficie DECIMAL(12,2) NOT NULL,

    CONSTRAINT lados_mayores_a_cero
        CHECK (lado_a > 0 AND lado_b > 0)
);