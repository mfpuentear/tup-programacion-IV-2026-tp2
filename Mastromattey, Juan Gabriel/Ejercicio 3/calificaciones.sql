CREATE DATABASE ejercicio3;

USE ejercicio3;

CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE calificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno VARCHAR(150) NOT NULL,
    materia_id INT NOT NULL,
    nota1 DECIMAL(4,2) NOT NULL,
    nota2 DECIMAL(4,2) NOT NULL,
    nota3 DECIMAL(4,2) NOT NULL,

    FOREIGN KEY (materia_id) REFERENCES materias(id),

    UNIQUE (alumno, materia_id)
);