CREATE DATABASE IF NOT EXISTS tp2_ejercicio3;

USE tp2_ejercicio3;

CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    nombre_normalizado VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS calificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_nombre VARCHAR(60) NOT NULL,
    alumno_normalizado VARCHAR(60) NOT NULL,
    materia_id INT NOT NULL,
    nota_1 DECIMAL(4,2) NOT NULL,
    nota_2 DECIMAL(4,2) NOT NULL,
    nota_3 DECIMAL(4,2) NOT NULL,
    CONSTRAINT fk_calificaciones_materias
        FOREIGN KEY (materia_id)
        REFERENCES materias(id),
    CONSTRAINT uq_alumno_materia
        UNIQUE (alumno_normalizado, materia_id)
);

INSERT INTO materias (nombre, nombre_normalizado)
VALUES
    ('Programacion IV', 'programacion iv'),
    ('Base de Datos', 'base de datos'),
    ('Ingles', 'ingles');