# Ejercicio 3 - API de Calificaciones

API desarrollada con Express y MySQL para gestionar calificaciones de alumnos en las materias de una carrera.

## Modelo de datos

```sql
CREATE TABLE materias (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

CREATE TABLE calificaciones (
  id INT NOT NULL AUTO_INCREMENT,
  alumno VARCHAR(100) NOT NULL,
  materia_id INT NOT NULL,
  nota1 DECIMAL(4,2) NOT NULL,
  nota2 DECIMAL(4,2) NOT NULL,
  nota3 DECIMAL(4,2) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY alumno_materia_UNIQUE (alumno, materia_id),
  CONSTRAINT fk_calificacion_materia FOREIGN KEY (materia_id) REFERENCES materias(id)
);
```

### Diagrama de entidad-relación

```
┌───────────────────┐          ┌──────────────────────────┐
│      materias        │          │       calificaciones         │
├───────────────────┤          ├──────────────────────────┤
│ id (PK)       INT    │ 1    N │ id (PK)            INT      │
│ nombre (UNIQUE) VARCHAR │◄─────────│ alumno             VARCHAR  │
└───────────────────┘          │ materia_id (FK)    INT      │
                               │ nota1              DECIMAL  │
                               │ nota2              DECIMAL  │
                               │ nota3              DECIMAL  │
                               │                              │
                               │ UNIQUE (alumno, materia_id) │
                               └──────────────────────────┘
```

También se adjunta el Diagrama generado por MySQL Workbench en formato PNG

## Decisiones de diseño

- **`materias` como tabla independiente**, relacionada con `calificaciones` mediante la clave foránea `materia_id`. Esto evita repetir el nombre de la materia en cada registro de calificación y centraliza su administración.

- **Escala de notas: 1 a 10** (escala numérica estándar utilizada en instituciones educativas argentinas). Se almacena con `DECIMAL(4,2)` para permitir notas con decimales (ej: 7.50).

- **Restricción de unicidad compuesta (`alumno`, `materia_id`)**: se utiliza una clave `UNIQUE` sobre la combinación de ambas columnas, en lugar de sobre cada una por separado. Esto permite que:
  - Un mismo alumno tenga calificaciones en distintas materias.
  - Distintos alumnos tengan calificaciones en la misma materia.
  - Pero **no puede existir más de un registro para la misma combinación alumno + materia**, que es exactamente la regla pedida por el enunciado.
  - Esta restricción se verifica explícitamente en el código (mediante una consulta previa a `INSERT`/`UPDATE`, normalizando el nombre del alumno con `TRIM` y `LOWER` para evitar duplicados por mayúsculas o espacios), y queda respaldada también a nivel de base de datos como segunda barrera de seguridad.
  - Se devuelve el status `409 Conflict` en caso de violar esta regla.

- **Validación de existencia de la materia**: antes de crear o modificar una calificación, se verifica que el `materiaId` recibido corresponda a una materia existente, devolviendo `404 Not Found` en caso contrario. Esto evita calificaciones "huérfanas" que referencien una materia inexistente, además de la protección que ya brinda la foreign key a nivel de base de datos.

- **Validación con `express-validator`**:
  - `alumno`: obligatorio, no vacío, entre 1 y 100 caracteres.
  - `materiaId`: entero positivo.
  - `nota1`, `nota2`, `nota3`: exactamente tres notas numéricas, cada una dentro del rango 1 a 10.

## Recursos y métodos HTTP

| Método | Endpoint              | Descripción                                                  | Respuestas                                     |
| ------ | --------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| GET    | `/materias`           | Lista todas las materias                                     | `200 OK`                                       |
| GET    | `/materias/:id`       | Obtiene una materia por id                                   | `200 OK` / `404 Not Found`                     |
| POST   | `/materias`           | Crea una materia (recibe `nombre`)                           | `201 Created` / `400 Bad Request`              |
| GET    | `/calificaciones`     | Lista todas las calificaciones (con el nombre de la materia) | `200 OK`                                       |
| GET    | `/calificaciones/:id` | Obtiene una calificación por id                              | `200 OK` / `404 Not Found`                     |
| POST   | `/calificaciones`     | Crea una calificación (`alumno`, `materiaId`, 3 notas)       | `201 Created` / `400` / `404` / `409 Conflict` |
| PUT    | `/calificaciones/:id` | Actualiza una calificación existente                         | `200 OK` / `404` / `400` / `409 Conflict`      |
| DELETE | `/calificaciones/:id` | Elimina una calificación                                     | `200 OK` / `404 Not Found`                     |

## Pruebas

Ver `calificaciones.http` para los casos de prueba, incluyendo: creación de materias, calificación válida, calificación duplicada (mismo alumno/materia con distintas mayúsculas y espacios), materia inexistente, notas fuera de la escala, nota no numérica, y nombre de alumno faltante.
