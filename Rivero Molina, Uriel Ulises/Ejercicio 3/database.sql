CREATE DATABASE IF NOT EXISTS tp2_ejercicio3;
USE tp2_ejercicio3;

CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno VARCHAR(150) NOT NULL,
    materia_id INT NOT NULL,
    nota1 DECIMAL(4,2) NOT NULL,
    nota2 DECIMAL(4,2) NOT NULL,
    nota3 DECIMAL(4,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    UNIQUE KEY uk_alumno_materia (alumno, materia_id)
);

INSERT INTO materias (id, nombre) VALUES
(1, 'Programación IV'),
(2, 'Bases de Datos'),
(3, 'Matemática');

INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES
('Uriel Rivero', 1, 9.00, 8.50, 10.00),
('Facundo De La Puente', 1, 8.00, 8.50, 9.00),
('Nitram Reynoso', 2, 7.50, 9.00, 8.00);