## Ejercicio 1

---

## Definicion de Recursos y Endpoints

El recurso principal expuesto por la API es **`rectangulos`**.

| Método | Endpoint          | Descripción                        | Cód. Estado Éxito | Cód. Estado Error           |
| :---   | :---              | :---                               | :---              | :---                        |
| `GET`  | `/rectangulos`    | Obtener todos los rectángulos      | `200 OK`          | `500 Internal Server Error` |
| `GET`  | `/rectangulos/:id`| Obtener un rectángulo por su ID    | `200 OK`          | `400 Bad Request`, `404 Not Found` |
| `POST` | `/rectangulos`    | Crear un nuevo rectángulo          | `201 Created`     | `400 Bad Request`           |
| `PUT`  | `/rectangulos/:id`| Actualizar un rectángulo existente | `200 OK`          | `400 Bad Request`, `404 Not Found` |
| `DELETE`|`/rectangulos/:id`| Eliminar un rectángulo por su ID   | `204 No Content`  | `400 Bad Request`, `404 Not Found` |

---

## 2. Estructura de Peticiones y Respuestas

### POST `/rectangulos`
* **Body de entrada (JSON):**
  ```json
  {
    "lado1": 10.5,
    "lado2": 5
  }