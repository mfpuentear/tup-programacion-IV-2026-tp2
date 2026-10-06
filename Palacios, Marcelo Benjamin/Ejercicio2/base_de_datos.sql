SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS tp2_tareas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tp2_tareas;

-- La colacion utf8mb4_unicode_ci compara sin distinguir mayusculas ni tildes,
-- asi que el UNIQUE usa el mismo criterio que la API.
CREATE TABLE IF NOT EXISTS tareas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  completada BOOLEAN NOT NULL DEFAULT FALSE
);
