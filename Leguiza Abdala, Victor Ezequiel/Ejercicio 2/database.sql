CREATE DATABASE IF NOT EXISTS tp2_tareas;
USE tp2_tareas;

DROP TABLE IF EXISTS tabla_tareas;

CREATE TABLE tabla_tareas (
  id_tarea INT AUTO_INCREMENT PRIMARY KEY,
  titulo_tarea VARCHAR(255) NOT NULL,
  esta_completada BOOLEAN NOT NULL DEFAULT FALSE
);