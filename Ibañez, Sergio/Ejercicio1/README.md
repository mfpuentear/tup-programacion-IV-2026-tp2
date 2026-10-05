# Ejercicio 1 - API de rectangulos con MySQL

## Que hace
API para administrar rectangulos persistidos en MySQL. El cliente envia solo los lados; el perimetro y la superficie se calculan en el servidor antes de guardarlos.

## Modelo de datos
Tabla rectangulos con id, lado_a, lado_b, perimetro y superficie. Perimetro y superficie se persisten calculados para poder filtrar por esos valores directo en la base, sin recalcular en cada consulta.

## Recursos y metodos
- GET /rectangulos: listado con filtros opcionales por tipo (cuadrado/rectangulo) y rango de perimetro.
- GET /rectangulos/:id: detalle de un rectangulo.
- POST /rectangulos: crea con ladoA y ladoB, calcula y guarda los derivados. Responde 201.
- PUT /rectangulos/:id: modifica los lados y recalcula los derivados.
- DELETE /rectangulos/:id: elimina el rectangulo.

## Validaciones con express-validator
- Body: ladoA y ladoB obligatorios, numericos y mayores a 0.
- Params: id entero mayor a 0.
- Query: tipo solo cuadrado o rectangulo; perimetroMin y perimetroMax numericos positivos; todos opcionales.
- Respuestas: 400 datos invalidos, 404 no encontrado, 201 creado.

## Decisiones de diseño
- Estructura modular como el ejemplo de clase: db.js para la conexion, validaciones.js con las reglas, rectangulos.js con el router e index.js que monta todo.
- El calculo de perimetro y superficie vive en el router antes del INSERT y del UPDATE, asi el cliente nunca puede mandar esos valores.
- La API responde en camelCase (ladoA) y la base usa snake_case (lado_a), unificados con alias en los SELECT.