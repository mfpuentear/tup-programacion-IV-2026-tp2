## Fundamentación de las Decisiones de Diseño

Modelo de Datos y Cálculo de Atributos

Atributos Derivados (perimetro y superficie): Se decidió calcular automáticamente el perímetro ($2 \times (\text{lado1} + \text{lado2})$) y la superficie ($\text{lado1} \times \text{lado2}$) en el servidor durante las operaciones de creación (POST) y modificación (PUT). De esta forma se garantiza la consistencia matemática de la información y se simplifica el contrato de la API, evitando que el cliente deba enviar valores calculados.

Persistencia en MySQL: Se utilizó una tabla rectangulos con clave primaria numérica e incremental (id INT AUTO_INCREMENT), asegurando un identificador único e inmutable para cada entidad.

Validaciones y Control de Errores

Dominio de los Datos: Se implementaron validaciones stictas sobre los lados utilizando express-validator para asegurar que los valores sean exclusivamente números positivos mayores a cero (isFloat({ gt: 0 })). Se descartan cadenas no numéricas, ceros o dimensiones negativas.

Tratamiento del Parámetro ID: Para los endpoints que operan sobre un recurso específico (GET /:id, PUT /:id, DELETE /:id), se valida que el parámetro de ruta sea un entero mayor a cero (isInt({ gt: 0 })). Si el recurso no existe en la base de datos, la API responde con código 404 Not Found.

Arquitectura de la API RESTRecurso Plural /rectangulos: Sigue las convenciones RESTful estándar para la gestión de colecciones.

Códigos de Estado HTTP Semánticos:
200 OK para consultas, actualizaciones y eliminaciones exitosas.
201 Created al registrar un nuevo rectángulo.
400 Bad Request para errores de validación de sintaxis o dominio.
404 Not Found cuando el ID consultado no coincide con ningún registro.
500 Internal Server Error ante fallos imprevistos de la base de datos.