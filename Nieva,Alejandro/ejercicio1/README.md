# Ejercicio 1 - API de Rectángulos

API REST desarrollada con Express.js y MySQL para la gestión y cálculo geométrico de rectángulos.

## Fundamentación de Diseño
- **Cálculos en el servidor:** El cálculo del perímetro y la superficie se realiza de forma centralizada en el servidor antes de persistir los datos. Esto garantiza la integridad de la información y evita manipulaciones o inconsistencias por parte del cliente.
- **Validaciones:** Se utiliza `express-validator` para verificar que los lados sean obligatorios y mayores a cero (`gt: 0`). Asimismo, se rechazan las peticiones que intenten enviar el perímetro o la superficie de forma manual.

## Requisitos
- Node.js (con soporte para ES Modules `"type": "module"`)
- MySQL Server

## Instalación y Configuración

1. Clonar o descargar el repositorio.
2. Crear la base de datos y la tabla ejecutando el script `database.sql` en MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS tp2_programacion;
   USE tp2_programacion;

   CREATE TABLE IF NOT EXISTS rectangulos (
       id INT AUTO_INCREMENT PRIMARY KEY,
       lado1 DECIMAL(10,2) NOT NULL,
       lado2 DECIMAL(10,2) NOT NULL,
       perimetro DECIMAL(10,2) NOT NULL,
       superficie DECIMAL(10,2) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );