# Diagrama Entidad-Relación - Ejercicio 3

![Diagrama ER](diagrama-er.png)

```mermaid
erDiagram
    MATERIAS ||--o{ CALIFICACIONES : "tiene"
    MATERIAS {
        int id PK
        varchar nombre UK
    }
    CALIFICACIONES {
        int id PK
        varchar alumno
        int materia_id FK
        decimal nota1
        decimal nota2
        decimal nota3
    }
```

- Una materia puede tener muchos registros de calificaciones; cada registro pertenece a una sola materia (1:N).
- Restricción `UNIQUE (alumno, materia_id)`: un alumno no puede tener dos registros para la misma materia.
