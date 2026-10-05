-- ==========================================================
-- Base de datos y tabla para Ejercicio 2: Tareas
-- ==========================================================

CREATE DATABASE IF NOT EXISTS tp2_ejercicio2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tp2_ejercicio2;

DROP TABLE IF EXISTS tareas;

CREATE TABLE tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  estado BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tarea_nombre (nombre)
) ENGINE=InnoDB;

-- Datos iniciales de prueba
INSERT INTO tareas (nombre, estado) VALUES
('Configurar entorno de desarrollo', TRUE),
('Diseñar base de datos MySQL', TRUE),
('Implementar validaciones con express-validator', FALSE),
('Redactar documentación y pruebas http', FALSE);
