CREATE DATABASE IF NOT EXISTS programacion4
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE programacion4;

-- Ejercicio 2: Tareas
CREATE TABLE IF NOT EXISTS tareas (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(150) NOT NULL,
  nombre_normalizado VARCHAR(150) NOT NULL,
  completada        BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_tareas_nombre_normalizado UNIQUE (nombre_normalizado)
);
