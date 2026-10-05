# Diagrama Entidad-Relación - Ejercicio 2: Tareas

## Entidad: `tareas`
La tabla almacena las tareas individuales administradas por la API y su estado de finalización.

| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment | Identificador único de la tarea. |
| `nombre` | VARCHAR(255) | NOT NULL, UNIQUE | Nombre o descripción corta de la tarea. |
| `completada` | BOOLEAN | NOT NULL, DEFAULT FALSE | Estado que indica si la tarea fue completada (`true`) o está pendiente (`false`). |