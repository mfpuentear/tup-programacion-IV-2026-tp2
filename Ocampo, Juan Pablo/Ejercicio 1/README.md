# Ejercicio 1 – API Rectangulos

## Descripcion
Este ejercicio implementa una API REST con ExpressJS para administrar rectangulos, persistiendo la informacion en una base de datos MySQL.  
La API permite crear, listar, consultar, modificar y eliminar rectangulos de manera facil

## Modelo de datos
La tabla "rectangulos" contiene los siguientes campos:

- "id" (INT, AUTO_INCREMENT, PRIMARY KEY)  
- "ladoA" (FLOAT, NOT NULL)  
- "ladoB" (FLOAT, NOT NULL)  
- "perimetro" (FLOAT, NOT NULL)  
- "superficie" (FLOAT, NOT NULL)  

Se utiliza "express-validator" para garantizar la integridad de los datos:

- Ambos lados ("ladoA", "ladoB") deben estar presentes.  
- Deben ser valores numericos mayores que cero.  
- El parámetro "id" en las rutas debe ser un numero entero positivo.  

Si alguna validación falla, la API responde con un error 400 y un JSON con detalles del error.

## Decisiones de diseño
Separacion de modulos: se dividió el proyecto en "db.js" (conexión a MySQL), "rectangulos.js" (donde contiene las rutas y codigo),"validaciones.js" (reglas de validacion) e "index.js" (configuracion principal).  

Calculo en servidor: perimetro y superficie se calculan en el backend para evitar inconsistencias y asegurar que los datos sean correctos.  

Uso de express-validator: se usa este paquete para centralizar las validaciones y devolver mensajes claros en formato JSON.  

Respuestas JSON: todas las operaciones devuelven objetos JSON con información util (ID creado, mensaje de error, objeto actualizado).  

CRUD completo: se implementaron los métodos HTTP  para gestionar rectangulos de forma clara 