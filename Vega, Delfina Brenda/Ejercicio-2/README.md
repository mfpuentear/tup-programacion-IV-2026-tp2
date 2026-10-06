# Ejercicio 2: API de tareas

Recursos y metodos
Metodo, Ruta, Descripcion y Respuestas 

GET  /tareas - Lista; filtro opcional "?estado=completadas" o "pendientes" - 200, 400
GET  /tareas/:id - Detalle - 200, 400, 404
POST  /tareas - Crea (nombre, completada opcional) - 201, 400, 409
PUT  /tareas/:id - Modifica nombre y estado - 200, 400, 404, 409
PATCH  /tareas/:id - Cambia solo el estado - 200, 400, 404
DELETE  /tareas/:id - Elimina - 204, 400, 404

Diseño:
Modelo de datos
- Una sola tabla "tareas", porque hay una unica entidad.
- "completada" es TINYINT(1) (booleano de MySQL) con valor por defecto 0 ya que toda tarea nueva nace pendiente.
- Criterio de igualdad de nombres: se ignoran mayusculas, tildes y espacios sobrantes. Se logra con "utf8mb4_0900_ai_ci" y con la normalizacion del nombre en el servidor.
- La unicidad esta garantizada por un indice UNIQUE en la base, que es la defensa definitiva contra duplicados aunque lleguen pedidos simultaneos. La API ademas la verifica antes de guardar para dar un mensaje claro

API:
Recurso en plural ("/tareas"), la accion la define el metodo HTTP
El filtro es un query param ("estado") y no una ruta aparte, porque filtra la misma coleccion. Solo admite "completadas" y "pendientes".
PUT reemplaza la tarea completa; PATCH existe para marcar una tarea como completada sin reenviar el nombre.
Codigos: 201 al crear, 204 al eliminar, 400 por datos invalidos, 404 si no existe y 409 si el nombre ya existe (los datos son válidos pero chocan con otra tarea).
"completada" solo acepta los booleanos "true" y "false".
Las consultas SQL usan parámetros ( ? ) para evitar inyección SQL.
