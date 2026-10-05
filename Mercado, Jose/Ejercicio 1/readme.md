# Ejercicio 1 - API de Rectángulos 📐

Este proyecto es una API RESTful desarrollada con Node.js y Express para la gestión de rectángulos. Permite realizar operaciones CRUD (Crear, Leer, Actualizar y Eliminar) validando estrictamente que los valores de base y altura sean numéricos y positivos.

## Tecnologías Utilizadas
* **Backend:** Node.js, Express
* **Base de Datos:** MySQL (paquete `mysql2`)
* **Validaciones:** `express-validator`
* **Entorno:** `dotenv`

## Requisitos Previos y Configuración
1. Crear la base de datos `tp2_ejercicio1` en MySQL/DBeaver y ejecutar el script SQL correspondiente para crear la tabla `rectangulos`.
2. Renombrar o crear un archivo `.env` en la raíz de este ejercicio con las siguientes variables:
