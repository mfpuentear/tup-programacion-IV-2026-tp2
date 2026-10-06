Diseño de la API

Estándar REST: Operaciones CRUD en /tareas con los métodos HTTP correspondientes (GET, POST, PUT, DELETE).   
Conversion de tipos: Transforma el 0/1 de MySQL a booleano real (true/false) al responder en JSON.   
Filtros URL: Soporta GET /tareas?estado=completadas o pendientes traduciendo el texto a booleano en la consulta.   
Manejo de duplicados (409 Conflict): Comprueba si el nombre ya existe antes de guardar/editar y captura cualquier duplicado de la base de datos.   
Validación y seguridad: Usa express-validator para asegurar textos válidos y booleanos correctos, e implementa consultas preparadas (?) contra inyecciones SQL.  

Modelo de Datos

Tabla única (tareas): Suficiente para gestionar tareas de forma aislada sin tablas adicionales.   
Llave primaria: Campo id incremental (AUTO_INCREMENT) para identificar cada tarea de manera única.   Estado eficiente (TINYINT): MySQL almacena los booleanos como 0 (false) o 1 (true), ahorrando espacio.   
Sin nombres duplicados (UNIQUE): El campo nombre tiene una restricción única para evitar tareas repetidas en la base de datos.   