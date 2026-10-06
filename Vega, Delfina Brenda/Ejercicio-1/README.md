# Ejercicio 1: API de rectangulos

Recursos y metodos:
Metodo, Ruta, Descripcion y Respuestas 

GET  /rectangulos - Lista (filtros opcionales superficieMin y superficieMax) - 200, 400 
GET  /rectangulos/:id - muestra detalle - 200, 400, 404 
POST  /rectangulos - crea (recibe ladoA y ladoB) - 201, 400
PUT  /rectangulos/:id - modifica (recibe ladoA y ladoB) - 200, 400, 404
DELETE  /rectangulos/:id - Elimina - 204, 400, 404

Diseño:
Modelo de datos
Una sola tabla "rectangulos", porque solo hay una entidad y no se relaciona con otras.
- "id" autoincremental como clave primaria.
- Los lados son "DECIMAL(10,2)": evita errores de redondeo y coincide con la validacion de la API (hasta 2 decimales).
- "perimetro" es "DECIMAL(12,2)" y "superficie" es "DECIMAL(20,4)"  porque multiplicar dos numeros de 2 decimales puede dar hasta 4 decimales.
- Se almacenan perimetro y superficie porque el enunciado lo pide, aunque son datos derivados. Se mantienen consistentes porque solo el servidor los calcula, al crear y al modificar.

API:
Recurso en plural "/rectangulos" ; la accion la define el metodo HTTP.
El usuario envia solo "ladoA" y "ladoB". Si envia "perimetro" o "superficie", se rechaza con 400 en lugar de ignorarse, para que el error sea explicito.
Se usa PUT y no PATCH porque siempre hacen falta ambos lados para recalcular perimetro y superficie.

Validaciones con express-validator: lados obligatorios, numuricos, mayores que cero y con hasta 2 decimales; "id" entero positivo; filtros numericos.
Codigos de respuesta: 201 al crear, 204 al eliminar, 400 por datos invalidos, 404 si el rectangulo no existe.
Las consultas SQL usan parámetros ( ? ) para evitar inyeccion SQL.