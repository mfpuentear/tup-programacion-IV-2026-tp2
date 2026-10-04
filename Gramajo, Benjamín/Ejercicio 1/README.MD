# Ejercicio 1 - API de Rectángulos

API desarrollada con Express y MySQL para administrar rectángulos.

## Modelo de datos

```sql
CREATE TABLE rectangulos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lado1 DECIMAL(10,2) NOT NULL,
  lado2 DECIMAL(10,2) NOT NULL,
  perimetro DECIMAL(10,2) NOT NULL,
  superficie DECIMAL(10,2) NOT NULL
);
```

### Diagrama de entidad

```
┌─────────────────────┐
│     rectangulos      │
├─────────────────────┤
│ id (PK)       INT     │
│ lado1         DECIMAL │
│ lado2         DECIMAL │
│ perimetro     DECIMAL │
│ superficie    DECIMAL │
└─────────────────────┘
```

También se adjunta el Diagrama generado por MySQL Workbench en formato PNG

## Decisiones de diseño

- **Tipo de dato `DECIMAL(10,2)` para los lados y los valores calculados**: se eligió `DECIMAL` en lugar de `FLOAT` para evitar errores de redondeo propios de la representación de punto flotante, ya que los lados de un rectángulo pueden tener valores decimales (ej: 3.5).
- **Perímetro y superficie se calculan en el servidor, nunca se reciben del cliente**: esto evita que el cliente pueda enviar valores inconsistentes con los lados reales del rectángulo (por ejemplo, un perímetro que no corresponda matemáticamente a los lados informados). El servidor es la única fuente de verdad para estos valores derivados.
- **Validación con `express-validator`**: se validan los lados como números de punto flotante mayores a 0 (`isFloat({ gt: 0 })`), y el `id` de los parámetros de ruta como entero positivo (`isInt({ gt: 0 })`), rechazando con status `400` cualquier solicitud que no cumpla estas condiciones antes de llegar a tocar la base de datos.
- **Separación de validaciones (`validaciones.js`) y rutas (`index.js`)**: se separan por responsabilidad, facilitando la lectura y el mantenimiento del código.

## Recursos y métodos HTTP

| Método | Endpoint           | Descripción                                  | Respuestas                        |
| ------ | ------------------ | -------------------------------------------- | --------------------------------- |
| GET    | `/rectangulos`     | Lista todos los rectángulos                  | `200 OK`                          |
| GET    | `/rectangulos/:id` | Obtiene un rectángulo por id                 | `200 OK` / `404 Not Found`        |
| POST   | `/rectangulos`     | Crea un rectángulo (recibe `lado1`, `lado2`) | `201 Created` / `400 Bad Request` |
| PUT    | `/rectangulos/:id` | Actualiza un rectángulo existente            | `200 OK` / `404` / `400`          |
| DELETE | `/rectangulos/:id` | Elimina un rectángulo                        | `200 OK` / `404 Not Found`        |

## Pruebas

Ver `rectangulos.http` para los casos de prueba, incluyendo casos de validación fallida (lado negativo, lado faltante, lado no numérico, id inválido, recurso inexistente).
