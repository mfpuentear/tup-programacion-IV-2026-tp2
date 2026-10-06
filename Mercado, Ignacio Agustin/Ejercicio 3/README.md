# Ejercicio 3

---

## Definición de Recursos y Endpoints

### Recurso `materias`
| Método | Endpoint    | Descripción                 | Cód. Éxito | Cód. Error |
| :---   | :---        | :---                        | :---       | :---       |
| `GET`  | `/materias` | Obtener listado de materias | `200 OK`   | `500 Error` |
| `POST` | `/materias` | Registrar nueva materia     | `201 Created` | `400 Bad Request` |

### Recurso `calificaciones`
| Método   | Endpoint              | Descripción                                     | Cód. Éxito | Cód. Error          |
| :---     | :---                  | :---                                            | :---       | :---                |
| `GET`    | `/calificaciones`     | Listar calificaciones con materia y promedio    | `200 OK`   | `500 Error`         |
| `GET`    | `/calificaciones/:id` | Consultar registro por ID                       | `200 OK`   | `400 Bad Request`, `404 Not Found` |
| `POST`   | `/calificaciones`     | Registrar calificaciones para alumno/materia    | `201 Created` | `400 Bad Request` |
| `PUT`    | `/calificaciones/:id` | Modificar notas o asignación                    | `200 OK`   | `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/calificaciones/:id` | Eliminar registro de calificaciones             | `204 No Content` | `400 Bad Request`, `404 Not Found` |

---

## 2. Definición de Escala de Calificaciones
* **Escala Aplicada:** Escala numérica del **1.00 al 10.00** (puntos flotantes con hasta dos decimales).
* **Criterio de Aprobación:** La calificación mínima válida es `1.00` y la máxima es `10.00`. Toda nota fuera de este rango es rechazada con un código HTTP `400 Bad Request`.

---

## 3. Fundamentación de las Decisiones de Diseño

### A. Modelo de Datos Relacional
* **Normalización mediante Clave Foránea (`FOREIGN KEY`):** Se separó la entidad `materias` en una tabla independiente para evitar redundancias de texto y permitir la integridad referencial. La tabla `calificaciones` utiliza `materia_id` vinculada con `ON DELETE CASCADE`.
* **Regla de Unicidad Compuesta (`UNIQUE KEY uk_alumno_materia`):** Se definió un índice único en MySQL sobre la combinación de las columnas `(alumno, materia_id)`. Esto garantiza a nivel de base de datos que un alumno no pueda ser matriculado más de una vez en la misma materia.

### B. Validaciones y Reglas de Negocio
* **Comprobación Existencial de Materias:** Antes de guardar o modificar un registro de notas, la API consulta asincrónicamente la tabla `materias` mediante `express-validator` para verificar que la materia asignada exista.
* **Unicidad de Alumno/Materia Insensible a Mayúsculas:** La validación normaliza el nombre del alumno (removiendo espacios sobrantes) y compara en minúsculas (`LOWER(alumno)`), impidiendo duplicados sintácticos (ej. `"Ignacio Mercado"` e `"ignacio mercado"` para la misma materia).
* **Cálculo Dinámico de Promedios:** La API calcula el promedio académico al realizar consultas `GET` utilizando funciones nativas de SQL (`ROUND((nota1 + nota2 + nota3) / 3, 2)`), manteniendo la base de datos libre de campos redundantes calculados.

### C. Códigos de Respuesta HTTP
* `201 Created`: Asignación y registro exitoso.
* `204 No Content`: Eliminación de registro completada.
* `400 Bad Request`: Datos de solicitud inválidos (materia no existente, notas fuera de la escala 1-10, o violación de la unicidad alumno-materia).
* `404 Not Found`: Búsqueda de registros inexistentes por ID.