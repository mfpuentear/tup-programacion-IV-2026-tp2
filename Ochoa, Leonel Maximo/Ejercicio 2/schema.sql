CREATE DATABASE IF NOT EXISTS tp2_ejercicio2
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tp2_ejercicio2;

CREATE TABLE IF NOT EXISTS tareas (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL,
  completada TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_nombre (nombre)
);
