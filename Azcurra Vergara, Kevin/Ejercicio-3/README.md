# Ejercicio 3 — API de calificaciones

API realizada con ExpressJS para poder administrar las calificaciones de los alumnos y las materias. Los datos se guardan en una base de datos MySQL llamada `Notas_Alumnos`.

Cada calificación tiene un alumno, una materia y tres notas. Las materias se guardan en una tabla separada y cada calificación se relaciona con su materia mediante una clave foránea.

Además, no se permite que un mismo alumno tenga más de una calificación para la misma materia.

## Decisiones de diseño

### 1. Modelo de datos

La base de datos tiene dos tablas principales: `materias` y `calificaciones`.

```sql
CREATE DATABASE IF NOT EXISTS Notas_Alumnos;

USE Notas_Alumnos;

CREATE TABLE materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_es_0900_ai_ci NOT NULL,
  UNIQUE KEY nombre_materia (nombre)
);

CREATE TABLE calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_es_0900_ai_ci NOT NULL,
  materia_id INT NOT NULL,
  nota1 DECIMAL(4, 2) NOT NULL,
  nota2 DECIMAL(4, 2) NOT NULL,
  nota3 DECIMAL(4, 2) NOT NULL,
  UNIQUE KEY alumno_materia (alumno, materia_id),
  CONSTRAINT materia_calificacion FOREIGN KEY (materia_id)
    REFERENCES materias (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT nota1_valida CHECK (nota1 BETWEEN 0 AND 10),
  CONSTRAINT nota2_valida CHECK (nota2 BETWEEN 0 AND 10),
  CONSTRAINT nota3_valida CHECK (nota3 BETWEEN 0 AND 10)
);
```

Las materias están separadas de las calificaciones porque una misma materia puede aparecer en muchos registros.

Por ejemplo, si varios alumnos tienen calificaciones de `Programación IV`, todos pueden apuntar a la misma materia mediante `materia_id`.

De esta forma no hace falta repetir el nombre de la materia en cada calificación y se evita que se creen materias diferentes por errores de escritura.

El alumno, en cambio, se guarda directamente como texto en la tabla `calificaciones`, ya que el enunciado solamente pide trabajar con su nombre.

### 2. Las tres notas

Las notas están guardadas en tres columnas:

* `nota1`
* `nota2`
* `nota3`

Se decidió hacerlo de esta manera porque el ejercicio pide exactamente tres notas.

En la API las notas se reciben como un arreglo:

```json
{
  "alumno": "Ezequiel Leguiza",
  "materiaId": 1,
  "notas": [7, 8.5, 9]
}
```

Después, la API separa los tres valores para guardarlos en las columnas correspondientes de la base de datos.

Cuando se devuelve una calificación, las tres columnas vuelven a convertirse en un arreglo.

### 3. Notas

Las notas tienen que estar entre `0` y `10`, incluyendo ambos valores.

También se permiten hasta dos decimales. Por ejemplo:

* `0`
* `6.5`
* `8.75`
* `10`

No se acepta una nota como `7.555`.

La validación se realiza en la API y también en la base de datos mediante `CHECK`. De esta forma, aunque por algún motivo se intentara guardar directamente en la base una nota fuera del rango, la base también la rechazaría.

### 4. Un alumno no puede repetir una materia

No puede existir más de una calificación para la misma combinación de alumno y materia.

Por ejemplo, esto no estaría permitido:

```text
Ezequiel Leguiza - Programación IV
Ezequiel Leguiza - Programación IV
```

Pero sí puede existir:

```text
Ezequiel Leguiza - Programación IV
Ezequiel Leguiza - Base de Datos II
```

La regla se controla de dos maneras.

Primero, desde la API se comprueba si ya existe la combinación.

Segundo, la base tiene una clave única:

```sql
UNIQUE KEY alumno_materia (alumno, materia_id)
```

Esto sirve como segunda protección en caso de que dos solicitudes intenten crear el mismo registro al mismo tiempo.

Cuando se modifica una calificación también se hace esta comprobación, pero no se tiene en cuenta el propio registro que se está modificando.

### 5. Cómo se comparan los nombres

Para los nombres de alumnos y materias se normalizan los espacios y se utiliza la colación:

```text
utf8mb4_es_0900_ai_ci
```

Por eso se consideran iguales casos como:

| Nombre 1           | Nombre 2                  |
| ------------------ | ------------------------- |
| `Ezequiel Leguiza` | `ezequiel leguiza`        |
| `Ezequiel Leguiza` | `EZEQUIEL LEGUIZA`        |
| `Ezequiel Leguiza` | `  Ezequiel    Leguiza  ` |
| `Maria Maturano`   | `María Maturano`          |

Los espacios de más se eliminan o se normalizan desde la API antes de guardar el dato.

La `ñ` sí se considera diferente de la `n`. Por ejemplo:

```text
Peña
Pena
```

son nombres diferentes.

### 6. Validación del nombre del alumno

El nombre del alumno tiene que:

* Ser un texto.
* Estar presente.
* No estar vacío.
* Tener como máximo 100 caracteres.
* Comenzar con una letra.
* Permitir letras, espacios, puntos, apóstrofes y guiones.

Por ejemplo, estos nombres son válidos:

```text
María José
O'Connor
Núñez-Pérez
Ezequiel Leguiza
```

En cambio, no se aceptan nombres como:

```text
Marta D1az
123
```

porque contienen números u otros caracteres que no corresponden al formato definido para los nombres.

### 7. La materia tiene que existir

Cuando se crea o modifica una calificación, se verifica que el `materiaId` enviado corresponda a una materia existente.

Por ejemplo, si se manda:

```json
{
  "alumno": "Ezequiel Leguiza",
  "materiaId": 999,
  "notas": [7, 8, 9]
}
```

se devuelve `400`, porque la materia no existe.

Además, la base de datos tiene una clave foránea que evita guardar una calificación apuntando a una materia inexistente.

También se utiliza:

```sql
ON DELETE RESTRICT
```

Esto significa que no se puede eliminar una materia que tenga calificaciones relacionadas.

De esta forma se evita borrar una materia y que desaparezcan sus calificaciones como consecuencia de esa operación.

### 8. Orden de las validaciones

Las solicitudes para crear o modificar calificaciones siguen este orden:

1. Se comprueba que los datos tengan el formato correcto.
2. Se comprueba que la materia exista.
3. Se comprueba que la combinación alumno-materia no esté repetida.
4. Se guarda el registro en la base de datos.

Primero se valida el formato porque no tendría sentido consultar la base de datos, por ejemplo, con un `materiaId` que ni siquiera es un número.

Las validaciones se realizan utilizando `express-validator`.

### 9. Respuesta de las calificaciones

Cuando se consulta una calificación, se devuelve también la información de la materia.

Por ejemplo:

```json
{
  "id": 1,
  "alumno": "Ezequiel Leguiza",
  "materia": {
    "id": 1,
    "nombre": "Programación IV"
  },
  "notas": [7, 8.5, 9]
}
```

Para obtener estos datos se utiliza un `JOIN` entre `calificaciones` y `materias`.

En las solicitudes se utiliza `materiaId` porque alcanza con enviar el id de la materia.

### 10. Consultas por alumno y materia

Se pueden consultar todas las calificaciones o utilizar filtros.

```text
GET /calificaciones
```

Devuelve todas las calificaciones.

```text
GET /calificaciones?alumno=Ezequiel%20Leguiza
```

Devuelve las calificaciones de un alumno.

```text
GET /calificaciones?materiaId=1
```

Devuelve las calificaciones de una materia.

También se pueden utilizar los dos filtros juntos:

```text
GET /calificaciones?alumno=Ezequiel%20Leguiza&materiaId=1
```

Los filtros tienen validaciones. Por ejemplo, `materiaId` tiene que ser un número entero positivo y el nombre del alumno no puede estar vacío.

También se rechazan parámetros que no estén definidos para esta consulta.

### 11. Tipos de datos

La API valida que cada dato tenga el tipo correspondiente.

Por ejemplo:

```json
{
  "alumno": "Ezequiel Leguiza",
  "materiaId": 1,
  "notas": [7, 8.5, 9]
}
```

es correcto.

Pero esto no:

```json
{
  "alumno": "Ezequiel Leguiza",
  "materiaId": "1",
  "notas": ["7", 8.5, 9]
}
```

porque `materiaId` tiene que ser un número y las notas también.

Las notas se almacenan en MySQL como `DECIMAL(4,2)`. Al obtenerlas desde la base se convierten nuevamente a números para enviarlas correctamente en el JSON.

### 12. Manejo de errores

Los errores se manejan desde un middleware centralizado en `index.js`.

De esta manera no es necesario repetir el mismo código de manejo de errores en cada ruta.

Los principales códigos utilizados son:

| Situación           | Código |
| ------------------- | -----: |
| Datos inválidos     |  `400` |
| Recurso inexistente |  `404` |
| Registro duplicado  |  `409` |
| Error interno       |  `500` |

Cuando ocurre un error interno, se registra el detalle en el servidor pero no se muestra información interna de la base de datos al usuario.

Las rutas que no existen también devuelven una respuesta en formato JSON.

### 13. Organización del proyecto

La estructura del proyecto es:

```text
Ejercicio 3/
├── src/
│   ├── db.js
│   ├── validators.js
│   ├── materias.js
│   └── calificaciones.js
├── index.js
├── database.sql
├── der.md
├── calificaciones.http
└── .env.example
```

Cada archivo tiene una función:

* `db.js`: conexión con MySQL.
* `validators.js`: validaciones.
* `materias.js`: rutas relacionadas con materias.
* `calificaciones.js`: rutas relacionadas con calificaciones.
* `index.js`: configuración del servidor y manejo de errores.
* `database.sql`: creación de la base y las tablas.
* `der.md`: diagrama entidad-relación.
* `calificaciones.http`: pruebas de los endpoints.
* `.env.example`: variables necesarias para conectarse a la base.

## Endpoints

### Materias

| Método   | Ruta            | Descripción               | Éxito |
| -------- | --------------- | ------------------------- | ----: |
| `POST`   | `/materias`     | Crear una materia         | `201` |
| `GET`    | `/materias`     | Listar las materias       | `200` |
| `GET`    | `/materias/:id` | Buscar una materia por id | `200` |
| `PUT`    | `/materias/:id` | Modificar el nombre       | `200` |
| `DELETE` | `/materias/:id` | Eliminar una materia      | `200` |

El cuerpo para crear o modificar una materia es:

```json
{
  "nombre": "Programación IV"
}
```

### Calificaciones

| Método   | Ruta                  | Descripción                | Éxito |
| -------- | --------------------- | -------------------------- | ----: |
| `POST`   | `/calificaciones`     | Crear una calificación     | `201` |
| `GET`    | `/calificaciones`     | Listar las calificaciones  | `200` |
| `GET`    | `/calificaciones/:id` | Buscar una calificación    | `200` |
| `PUT`    | `/calificaciones/:id` | Modificar una calificación | `200` |
| `DELETE` | `/calificaciones/:id` | Eliminar una calificación  | `200` |

El cuerpo utilizado es:

```json
{
  "alumno": "Ezequiel Leguiza",
  "materiaId": 1,
  "notas": [7, 8.5, 9]
}
```

Los errores de validación se devuelven de esta forma:

```json
{
  "errores": []
}
```

Los demás errores utilizan:

```json
{
  "error": "Mensaje del error"
}
```

## Validaciones

| Dato                     | Validación                                           | Código |
| ------------------------ | ---------------------------------------------------- | -----: |
| `nombre` de materia      | Obligatorio, texto, no vacío y máximo 100 caracteres |  `400` |
| `nombre` de materia      | No puede estar repetido                              |  `409` |
| `alumno`                 | Obligatorio, texto, no vacío y máximo 100 caracteres |  `400` |
| `alumno`                 | Solo permite letras y determinados caracteres        |  `400` |
| `materiaId`              | Número entero positivo                               |  `400` |
| `materiaId`              | La materia debe existir                              |  `400` |
| `notas`                  | Arreglo de exactamente 3 elementos                   |  `400` |
| `notas`                  | Números entre 0 y 10                                 |  `400` |
| `notas`                  | Máximo dos decimales                                 |  `400` |
| `alumno + materiaId`     | No puede repetirse                                   |  `409` |
| `materiaId` en consultas | Entero positivo                                      |  `400` |
| `alumno` en consultas    | No puede estar vacío                                 |  `400` |
| Parámetros desconocidos  | No están permitidos                                  |  `400` |
| `id` de las rutas        | Entero positivo                                      |  `400` |

## Códigos de respuesta

| Código | Significado                       |
| -----: | --------------------------------- |
|  `200` | Operación realizada correctamente |
|  `201` | Registro creado correctamente     |
|  `400` | Datos enviados incorrectamente    |
|  `404` | Recurso o ruta inexistente        |
|  `409` | Conflicto o registro duplicado    |
|  `500` | Error interno del servidor        |

## Decisiones y alternativas

### No se creó una tabla de alumnos

Una alternativa sería crear tres tablas:

```text
alumnos
materias
calificaciones
```

y guardar un `alumno_id` en las calificaciones.

Eso permitiría tener los datos del alumno en un solo lugar. Sin embargo, para este ejercicio no hace falta porque el enunciado solamente trabaja con el nombre del alumno.

Por eso decidí guardar el nombre directamente en `calificaciones`.

Si en el futuro hubiera más información de los alumnos, como legajo, DNI, curso, correo, etc., sería mejor crear una tabla propia para ellos.

### Materia inexistente

Cuando se manda un `materiaId` que no existe se devuelve `400`.

Se podría utilizar `404`, pero en este proyecto se utiliza `400` porque la ruta sí existe y el problema está en el dato enviado dentro de la solicitud.

### PUT

El `PUT` recibe todos los datos de la calificación:

```json
{
  "alumno": "Ezequiel Leguiza",
  "materiaId": 1,
  "notas": [8, 8.5, 10]
}
```

No se utiliza `PATCH` porque no es necesario para este ejercicio.

Si solamente se quisiera cambiar una nota, podría utilizarse `PATCH`, pero eso no forma parte de los endpoints pedidos.

### Eliminar una materia

No se permite eliminar una materia que tenga calificaciones.

Esto se controla mediante:

```sql
ON DELETE RESTRICT
```

Se podría haber utilizado `ON DELETE CASCADE`, pero eso provocaría que las calificaciones también se eliminen automáticamente, algo que no se considera conveniente para este caso.

### DELETE

Cuando una eliminación se realiza correctamente se devuelve `200` junto con un mensaje de confirmación.

También podría utilizarse `204 No Content`, pero se decidió devolver un mensaje para que sea más fácil comprobar el resultado desde el archivo `.http`.

## Cómo ejecutar el proyecto

Primero se debe crear la base de datos y las tablas:

```bash
npm run db
```

Después se deben instalar las dependencias:

```bash
npm install
```

Copiar el archivo:

```text
.env.example
```

a:

```text
.env
```

y completar los datos necesarios para conectarse a MySQL.

Finalmente ejecutar:

```bash
npm run dev
```

El servidor queda disponible en:

```text
http://localhost:3000
```

Las peticiones del archivo `calificaciones.http` dependen del orden en el que se ejecutan. Por eso, si se quiere empezar nuevamente desde cero, hay que volver a ejecutar:

```bash
npm run db
```
