# Actividad 1 - API de Rectángulos

## ¿De qué trata?
Este ejercicio consiste en crear una API con ExpressJS para administrar rectángulos y guardar sus datos en una base de datos MySQL.
La API permite crear, consultar, modificar y eliminar rectángulos.

## Tecnologías utilizadas
* Node.js
* ExpressJS
* MySQL
* mysql2
* express-validator
* dotenv

## Instalación

1. Instalar las dependencias:

   `npm install express mysql2 express-validator dotenv`

2. Crear la base de datos ejecutando el archivo `database.sql` en MySQL.

3. Configurar las credenciales de MySQL en el archivo `.env`.

4. Iniciar el servidor:

   `node index.js`

El servidor se inicia en `http://localhost:3000`, siempre que la conexión con MySQL se realice correctamente.

## Rutas disponibles
* GET `/rectangulos`: muestra todos los rectángulos.
* GET `/rectangulos/:id`: busca un rectángulo por su ID.
* POST `/rectangulos`: crea un rectángulo.
* PUT `/rectangulos/:id`: modifica un rectángulo.
* DELETE `/rectangulos/:id`: elimina un rectángulo.

También se pueden filtrar los rectángulos por sus lados usando los parámetros `lado1` y `lado2` en la ruta GET.

## Validaciones
Los lados son obligatorios y deben ser números mayores que cero. No se permite enviar el perímetro ni la superficie en el cuerpo de la solicitud.
El servidor calcula ambos valores antes de guardar o modificar un rectángulo. También se validan los identificadores y los filtros de consulta.

## Pruebas
Las solicitudes para probar la API se encuentran en el archivo `rectangulos.http`. Se incluyen pruebas de creación, consulta, modificación, eliminación y casos con datos incorrectos.

## Cálculos
* Perímetro = 2 × (lado1 + lado2)
* Superficie = lado1 × lado2

Los cálculos se realizan en el servidor para que los valores guardados sean generados por la propia API.