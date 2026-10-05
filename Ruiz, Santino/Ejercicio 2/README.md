## Fundamentación

Criterio de Comparación e Unicidad de Nombres
Normalización de Texto: Se definió un criterio consistente donde dos nombres de tareas se consideran iguales si coinciden tras remover espacios en blanco al inicio y al final (TRIM) e ignorar la diferencia entre mayúsculas y minúsculas (LOWER). Por ejemplo, " Estudiar " y "estudiar" se consideran idénticos.

Nivel API (Aplicación): En los endpoints POST y PUT se consulta preventivamente LOWER(TRIM(nombre)). Esto intercepta duplicados antes de la ejecución del INSERT/UPDATE SQL y permite devolver una respuesta 400 Bad Request estructurada indicando exactamente el campo en conflicto.

Modelo de Datos y Mapeo Booleano
Mapeo MySQL / JavaScript: En MySQL las columnas de tipo BOOLEAN se representan internamente como TINYINT(1) (0 o 1). Para mantener un contrato de API transparente y compatible con JSON, la API convierte explícitamente estos enteros a valores primitivos booleanos nativos de JavaScript (true/false) al construir las respuestas.

Manejo del Filtro en Consultas SQL: En el filtro por estado (GET /tareas?completada=true), se parsea explícitamente el valor recibido de la query string a un entero numérico (1 o 0) antes de enviarlo al driver de MySQL, evitando inconsistencias causadas por el formateo de cadenas de texto en SQL.

Diseño RESTful y Filtrado Dinámico
Colección /tareas y Query Parameters: En lugar de crear rutas redundantes (como /tareas/completadas), el filtrado se resuelve mediante parámetros de consulta sobre el recurso raíz (GET /tareas?completada=true|false). Si el parámetro no se proporciona, se retorna la totalidad de la lista.

Validación Centralizada con express-validator: Se aplican reglas sobre params (ID numérico positivo), query (validando que el filtro pertenezca únicamente a los estados permitidos) y body (verificando la presencia, longitud y tipo del nombre y el booleano del estado).