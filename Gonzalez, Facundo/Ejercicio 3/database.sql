CREATE DATABASE IF NOT EXISTS tp2_calificaciones;

USE tp2_calificaciones;

CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    CONSTRAINT uk_materias_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS calificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno VARCHAR(100) NOT NULL,
    materia_id INT NOT NULL,
    nota1 DECIMAL(4,2) NOT NULL,
    nota2 DECIMAL(4,2) NOT NULL,
    nota3 DECIMAL(4,2) NOT NULL,

    CONSTRAINT fk_calificaciones_materia
        FOREIGN KEY (materia_id)
        REFERENCES materias(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uk_alumno_materia
        UNIQUE (alumno, materia_id),

    CONSTRAINT chk_nota1
        CHECK (nota1 >= 0 AND nota1 <= 10),

    CONSTRAINT chk_nota2
        CHECK (nota2 >= 0 AND nota2 <= 10),

    CONSTRAINT chk_nota3
        CHECK (nota3 >= 0 AND nota3 <= 10)
);