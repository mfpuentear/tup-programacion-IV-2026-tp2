\# Diagrama Entidad-Relación



```mermaid

erDiagram

&#x20;   MATERIAS ||--o{ CALIFICACIONES : tiene



&#x20;   MATERIAS {

&#x20;       INT id PK

&#x20;       VARCHAR nombre UK

&#x20;   }



&#x20;   CALIFICACIONES {

&#x20;       INT id PK

&#x20;       VARCHAR alumno

&#x20;       VARCHAR alumno\_normalizado

&#x20;       INT materia\_id FK

&#x20;       DECIMAL nota1

&#x20;       DECIMAL nota2

&#x20;       DECIMAL nota3

&#x20;   }

```



\## Relación



Una materia puede tener muchas calificaciones, mientras que cada registro de calificación pertenece a una sola materia mediante `materia\_id`.



La combinación de `alumno\_normalizado` y `materia\_id` es única para impedir que un alumno tenga más de un registro para la misma materia.

