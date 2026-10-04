CREATE DATABASE IF NOT EXISTS tp2_programacion;
USE tp2_programacion;

CREATE TABLE IF NOT EXISTS tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE INDEX idx_nombre_unico (nombre)
);  