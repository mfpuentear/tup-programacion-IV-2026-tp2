-- 1. Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS tp2_ejercicio3;
USE tp2_ejercicio3;

-- 2. Crear la tabla de materias
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Crear la tabla de calificaciones
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    subject_id INT NOT NULL,
    note1 DECIMAL(4,2) NOT NULL,
    note2 DECIMAL(4,2) NOT NULL,
    note3 DECIMAL(4,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_grades_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT unique_student_subject UNIQUE (student_name, subject_id)
);

-- 4. Insertar materias iniciales de prueba
INSERT INTO subjects (name) VALUES
('Programación IV'),
('Bases de Datos'),
('Ingeniería de Software')
ON DUPLICATE KEY UPDATE name=VALUES(name);