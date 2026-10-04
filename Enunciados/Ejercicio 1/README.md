# Ejercicio 1

Desarrollar una API con ExpressJS para administrar rectángulos, persistiendo la
información en una base de datos MySQL.

Para cada rectángulo se deben almacenar sus dos lados, su perímetro y su
superficie. Al crear o modificar un rectángulo, la API debe recibir únicamente
los valores de sus lados. El perímetro y la superficie deben calcularse en el
servidor antes de persistir los datos; no deben aceptarse como valores enviados
por el cliente.

La API debe validar, como mínimo, que ambos lados estén presentes y sean valores
numéricos mayores que cero. También debe validar los parámetros, consultas y
cuerpo de las solicitudes que implemente, utilizando `express-validator`.

Definir los recursos, los métodos HTTP y las respuestas que considere
necesarios para gestionar los rectángulos. Fundamentar las decisiones de diseño
adoptadas para el modelo de datos y para la API.
