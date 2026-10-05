# Fundamentación de Decisiones de Diseño - Ejercicio 1

## 1. Arquitectura y Organización Modular
Se implementó una arquitectura basada en el patrón MVC (Modelo-Vista-Controlador) adaptada para APIs REST con ExpressJS, estructurando el proyecto en carpetas independientes (`controllers`, `routes`, `validators`). Esto garantiza el principio de responsabilidad única:
- **`app.js`**: Configura el servidor principal y los middlewares globales.
- **`routes/`**: Define los endpoints HTTP mediante `express.Router` de forma escalable.
- **`controllers/`**: Contiene la lógica de negocio y la interacción con la base de datos MySQL.
- **`db.js`**: Encapsula la conexión mediante un pool de conexiones (`mysql2/promise`) para un manejo eficiente de las consultas asíncronas.

## 2. Decisiones sobre el Modelo de Datos y Lógica de Negocio
- Conforme a los requisitos, la base de datos almacena la base, la altura, el perímetro y la superficie de cada rectángulo.
- **Cálculos en el Servidor**: Para evitar inconsistencias o manipulaciones malintencionadas por parte de los clientes, la API recibe únicamente la `base` y la `altura`. Los cálculos matemáticos del perímetro ($2 \times (\text{base} + \text{altura})$) y la superficie ($\text{base} \times \text{altura}$) se ejecutan estrictamente en el servidor antes de realizar la persistencia.

## 3. Validaciones con `express-validator`
Se implementó un middleware de validación riguroso que evalúa:
- La presencia obligatoria de la base y la altura, exigiendo que sean valores numéricos estrictamente mayores a cero (`isFloat({ gt: 0 })`).
- La prohibición explícita de enviar los campos `perimetro` o `superficie` en las peticiones del cliente, rechazando la solicitud con un código de error `400 Bad Request` si se intentan incluir.