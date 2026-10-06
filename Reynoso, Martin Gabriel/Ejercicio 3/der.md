# Diagrama Entidad-Relación - Ejercicio 3: Calificaciones

## Representación Mermaid

```mermaid
erDiagram
    MATERIAS ||--o{ ALUMNO_MATERIA : "registra"
    MATERIAS {
        int id PK "AUTO_INCREMENT"
        string nombre "UNIQUE, NOT NULL"
        timestamp created_at
    }
    ALUMNO_MATERIA {
        int id PK "AUTO_INCREMENT"
        string alumno "NOT NULL"
        int materia_id FK "NOT NULL"
        decimal nota1 "NOT NULL (1.00 - 10.00)"
        decimal nota2 "NOT NULL (1.00 - 10.00)"
        decimal nota3 "NOT NULL (1.00 - 10.00)"
        decimal promedio "NOT NULL"
        timestamp created_at
        timestamp updated_at
    }