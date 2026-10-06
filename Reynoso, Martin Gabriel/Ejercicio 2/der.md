# Diagrama Entidad-Relación - Ejercicio 2: Tareas

## Representación Mermaid

```mermaid
erDiagram
    TAREAS {
        int id PK "AUTO_INCREMENT"
        string nombre "UNIQUE, NOT NULL"
        boolean completada "DEFAULT FALSE"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }