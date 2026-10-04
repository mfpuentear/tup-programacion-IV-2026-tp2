CREATE DATABASE IF NOT EXISTS tp2_tareas;
USE tp2_tareas;

-- utf8mb4_0900_ai_ci: no distingue mayúsculas ni acentos al comparar
CREATE TABLE IF NOT EXISTS tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (nombre)
);