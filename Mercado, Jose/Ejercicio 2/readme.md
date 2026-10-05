# Ejercicio 2 - API de Tareas (To-Do List) ✅

Esta API RESTful está diseñada para administrar una lista de tareas. Incluye validaciones personalizadas, sanitización de datos (normalización a minúsculas) y soporte para filtrado por parámetros de consulta (Query Params).

## Características Principales
* **CRUD de Tareas:** Creación, lectura y modificación del estado de las tareas.
* **Restricción de Unicidad:** La base de datos impide la creación de tareas duplicadas.
* **Filtros:** Permite obtener tareas específicas según su estado mediante el query `?estado=completadas` o `?estado=pendientes`.

## Tecnologías Utilizadas
* Node.js, Express, MySQL2, Express-Validator, Dotenv.

## Instalación y Configuración
1. Crear la base de datos `tp2_ejercicio2` en MySQL e inicializar la tabla `tareas` asegurando la restricción `UNIQUE` en la columna nombre.
2. Configurar las variables de entorno en el archivo `.env`:
 