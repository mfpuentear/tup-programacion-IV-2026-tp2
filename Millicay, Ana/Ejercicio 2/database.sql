CREATE DATABASE IF NOT EXISTS tp2_ejercicio2;
USE tp2_ejercicio2;

CREATE TABLE IF NOT EXISTS tareas (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  nombre             VARCHAR(100) NOT NULL,
  nombre_normalizado VARCHAR(100) NOT NULL,
  completada         BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_tareas_nombre UNIQUE (nombre_normalizado)
);