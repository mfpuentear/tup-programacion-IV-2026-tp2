# Diagrama Entidad-Relación - Ejercicio 3

A continuación se detalla el modelo de datos relacional utilizado.

```mermaid
erDiagram
    MATERIAS {
        INT id_materia PK "Autoincremental"
        VARCHAR(255) nombre_materia "UNIQUE, NOT NULL"
    }
    
    CALIFICACIONES {
        INT id_calificacion PK "Autoincremental"
        VARCHAR(255) nombre_alumno "NOT NULL"
        INT id_materia FK "Referencia a MATERIAS"
        DECIMAL(4_2) nota_1 "Rango 1.00 a 10.00"
        DECIMAL(4_2) nota_2 "Rango 1.00 a 10.00"
        DECIMAL(4_2) nota_3 "Rango 1.00 a 10.00"
    }

    MATERIAS ||--o{ CALIFICACIONES : "tiene"