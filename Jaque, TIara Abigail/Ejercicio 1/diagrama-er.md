# Diagrama Entidad-Relación - Ejercicio 1: Rectángulos

## Entidad: `rectangulos`
La tabla almacena las propiedades geométricas de los rectángulos gestionados por la API.

| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment | Identificador único del rectángulo. |
| `base` | DECIMAL(10,2) | NOT NULL, > 0 | Longitud de la base ingresada por el cliente. |
| `altura` | DECIMAL(10,2) | NOT NULL, > 0 | Longitud de la altura ingresada por el cliente. |
| `perimetro` | DECIMAL(10,2) | NOT NULL | Perímetro calculado automáticamente en el servidor. |
| `superficie` | DECIMAL(10,2) | NOT NULL | Superficie calculada automáticamente en el servidor. |