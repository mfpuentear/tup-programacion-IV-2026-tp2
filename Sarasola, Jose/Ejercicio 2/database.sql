CREATE DATABASE IF NOT EXISTS tp2_ejercicio2;
USE tp2_ejercicio2;

CREATE TABLE IF NOT EXISTS tareas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  nombre_normalizado VARCHAR(120) NOT NULL,
  completada BOOLEAN NOT NULL,
  CONSTRAINT uq_tareas_nombre_normalizado UNIQUE (nombre_normalizado)
);
