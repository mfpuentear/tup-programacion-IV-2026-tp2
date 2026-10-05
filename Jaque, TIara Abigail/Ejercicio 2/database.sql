CREATE DATABASE IF NOT EXISTS tup_tp2_tareas;
USE tup_tp2_tareas;

CREATE TABLE tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    completada BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_nombre UNIQUE (nombre)
);