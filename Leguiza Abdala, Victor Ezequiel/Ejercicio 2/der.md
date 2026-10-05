# Diagrama Entidad-Relación - Ejercicio 2

A continuación se detalla el modelo de datos utilizado para la persistencia de las tareas.

```mermaid
erDiagram
    TABLA_TAREAS {
        INT id_tarea PK "Autoincremental"
        VARCHAR(255) titulo_tarea "NOT NULL, Único (validado en backend)"
        BOOLEAN esta_completada "NOT NULL, Default FALSE"
    }