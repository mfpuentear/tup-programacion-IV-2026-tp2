# Ejercicio 2 – API de Tareas

## Descripcion
Se desarrollo una API con ExpressJS para administrar una lista de tareas, persistiendo la informacion en una base de datos MySQL.  
Cada tarea incluye un nombre y un estado que indica si esta completada o pendiente.  
La API impide la creacion de dos tareas con el mismo nombre, validando consistentenemente para determinar la unicidad.

## Modelo de datos
Tabla "tareas":
-"id" (INT, AUTO_INCREMENT, PRIMARY KEY)  
 -"nombre" (VARCHAR, NOT NULL)  
 -"completada" (BOOLEAN / TINYINT(1), NOT NULL)  

## Decisiones de diseño
-Se separaron los modulos en:
  - "db.js": conexion a la base de datos.  
  - "validaciones.js": reglas de validacion con express-validator.  
  - "tareas.js": router con los endpoints CRUD.  
  - "index.js": archivo principal de la aplicacion.  

- La unicidad del nombre se controla en el backend comparando en minusculas ("LOWER(nombre)"), de modo que “Tarea1” y “tarea1” se consideran iguales.  

- Se validan parametros, body y consultas:
  - El nombre debe estar presente y tener al menos 2 caracteres.  
  - El estado debe ser booleano ("true" o "false").  
  - El ID debe ser un numero entero positivo.  
  - El filtro por estado ("?completada=true/false") debe ser booleano valido.  