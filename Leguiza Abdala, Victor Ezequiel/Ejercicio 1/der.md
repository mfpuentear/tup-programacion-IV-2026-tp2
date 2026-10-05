# Diagrama Entidad-Relación - Ejercicio 1

A continuación se detalla el modelo de datos utilizado para la persistencia de los rectángulos.

```mermaid
erDiagram
    TABLA_RECTANGULOS {
        INT id_figura PK "Autoincremental"
        DECIMAL medida_base "NOT NULL"
        DECIMAL medida_altura "NOT NULL"
        DECIMAL valor_perimetro "Calculado en servidor, NOT NULL"
        DECIMAL valor_superficie "Calculado en servidor, NOT NULL"
    }