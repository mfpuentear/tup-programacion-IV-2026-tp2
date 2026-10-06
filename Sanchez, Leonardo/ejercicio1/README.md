Diseño de la API

Estándar REST: Se usa la ruta /rectangulos y los métodos habituales (GET para pedir, POST para crear, PUT para editar y DELETE para borrar). 
Cálculos en el servidor: El usuario solo envía las medidas (lado1 y lado2). El servidor hace la matemática del perímetro y superficie automáticamente antes de guardar.   
Validación de datos: Si alguien envía un número negativo, un texto o un ID que no existe, la API rechaza la solicitud y avisa el error. 
Consultas seguras: Usamos variables preparadas en MySQL para proteger la base de datos frente a posibles ataques o fallos de seguridad.

Base de Datos

Una sola tabla (rectangulos): Como solo manejamos rectángulos y no dependen de otros datos (como usuarios o categorías), no hace falta el uso de mas datos con más tablas en la base de datos.
IDs automáticos: Usamos un ID incremental (AUTO_INCREMENT) para que cada rectángulo tenga un identificador único sin tener que generarlo a mano.
Números precisos (DECIMAL): Guardamos las medidas con dos decimales para que las operaciones con comas y centésimas sean exactas.
Guardar resultados (Perímetro y Superficie): Al tener el perímetro y la superficie guardados en la tabla, las búsquedas para listar los rectángulos son más rápidas porque no hay que recalcular las fórmulas cada vez.