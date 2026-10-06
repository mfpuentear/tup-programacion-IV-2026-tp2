-- Creamos la base de datos para el ejercicio 2
CREATE DATABASE IF NOT EXISTS tp2_ejercicio2;
USE tp2_ejercicio2;

-- Tabla para guardar la lista de tareas
CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    completada TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);