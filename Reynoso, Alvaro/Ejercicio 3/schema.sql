CREATE DATABASE IF NOT EXISTS ejercicio3;

USE ejercicio3;


CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS calificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre_alumno VARCHAR(100) NOT NULL,

    materia_id INT NOT NULL,

    nota1 DECIMAL(4,2) NOT NULL,
    nota2 DECIMAL(4,2) NOT NULL,
    nota3 DECIMAL(4,2) NOT NULL,

    CONSTRAINT fk_calificaciones_materia
        FOREIGN KEY (materia_id)
        REFERENCES materias(id),

    CONSTRAINT chk_nota1
        CHECK (nota1 >= 0 AND nota1 <= 10),

    CONSTRAINT chk_nota2
        CHECK (nota2 >= 0 AND nota2 <= 10),

    CONSTRAINT chk_nota3
        CHECK (nota3 >= 0 AND nota3 <= 10),

    CONSTRAINT uq_alumno_materia
        UNIQUE (nombre_alumno, materia_id)
);