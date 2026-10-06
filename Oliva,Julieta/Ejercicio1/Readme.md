# Ejercicio 1 - API REST para Gestión de Rectángulos

En este ejercicio desarrollé una API REST con **Node.js** y **Express** que permite realizar las operaciones CRUD (Crear, Leer, Actualizar y Eliminar) sobre un conjunto de rectángulos, guardando la información en una base de datos **MySQL**.

---

## 🛠️ Herramientas utilizadas

* **Node.js**: Entorno para ejecutar el servidor JavaScript.
* **Express**: Framework para manejar las rutas y peticiones HTTP.
* **MySQL2**: Librería para la conexión a la base de datos MySQL (usando promesas para un código más limpio con `async/await`).
* **Express-Validator**: Middleware utilizado para validar que las entradas de datos sean correctas antes de procesarlas.

---

## 🗄️ Base de datos y Modelo (DER)

La base de datos se llama `tp2_ejercicio1` y contiene la tabla `rectangulos`.

### Tabla: `rectangulos`

| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `INT` | Clave primaria, autoincremental |
| `lado_a` | `DECIMAL(10, 2)` | Valor obligatorio (Lado A) |
| `lado_b` | `DECIMAL(10, 2)` | Valor obligatorio (Lado B) |
| `perimetro` | `DECIMAL(10, 2)` | Calculado en el servidor: $2 \times (lado\_a + lado\_b)$ |
| `superficie` | `DECIMAL(10, 2)` | Calculada en el servidor: $lado\_a \times lado\_b$ |

---

## 💡 Criterios de diseño y lógica del negocio

1. **Cálculos del lado del servidor**:  
   Siguiendo los requerimientos, las peticiones `POST` y `PUT` reciben únicamente los valores de `lado_a` y `lado_b`. El cálculo del **perímetro** y la **superficie** se realiza directamente en el backend antes de guardar o actualizar los registros, evitando que el usuario envíe datos inconsistentes.

2. **Validación de entradas**:  
   Con `express-validator` se verifica que tanto `lado_a` como `lado_b` existan y sean números positivos estrictamente mayores a cero (`gt: 0`). También se valida que los parámetros `:id` de las URLs sean enteros válidos mayores a cero.

---

## 🔗 Endpoints disponibles

| Método | Ruta | Descripción | Datos esperados (JSON) |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rectangulos` | Trae la lista completa de rectángulos | N/A |
| `GET` | `/api/rectangulos/:id` | Trae los datos de un solo rectángulo según su ID | N/A |
| `POST` | `/api/rectangulos` | Registra un nuevo rectángulo | `{ "lado_a": 5, "lado_b": 10 }` |
| `PUT` | `/api/rectangulos/:id` | Modifica un rectángulo existente | `{ "lado_a": 4, "lado_b": 8 }` |
| `DELETE` | `/api/rectangulos/:id` | Elimina un rectángulo | N/A |

---

## 🏁 Cómo ejecutar el proyecto

1. Abrir la consola dentro de la carpeta del ejercicio:
   ```bash
   cd "Ejercicio 1"