CREATE DATABASE IF NOT EXISTS tp2_notas;

USE tp2_notas;

CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE notas_alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno VARCHAR(100) NOT NULL,
    materia_id INT NOT NULL,
    nota1 DECIMAL(4,2) NOT NULL,
    nota2 DECIMAL(4,2) NOT NULL,
    nota3 DECIMAL(4,2) NOT NULL,

    CONSTRAINT fk_notas_materia
        FOREIGN KEY (materia_id)
        REFERENCES materias(id),

    CONSTRAINT uq_alumno_materia
        UNIQUE (alumno, materia_id)
);

INSERT INTO materias (nombre) VALUES
('Programacion IV'),
('Base de Datos'),
('Matematica'),
('Ingles');