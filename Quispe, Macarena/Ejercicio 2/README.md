# API de Tareas

## Descripción
Esta API REST permite administrar una lista de tareas persistidas en MySQL. Cada tarea tiene un nombre y un estado que indica si está completada o pendiente.

## Regla de unicidad
Para evitar duplicados, se utiliza una comparación consistente:

- se elimina espacios al inicio y al final
- se convierte el nombre a minúsculas
- se compara con el valor normalizado

Esto hace que `Comprar leche`, `comprar leche` y `  COMPRAR LECHE  ` se consideren la misma tarea.

## Requisitos
- Node.js
- MySQL
- npm

## Instalación
1. Crear la base de datos MySQL.
2. Configurar el archivo `.env` con tus datos.
3. Ejecutar:

```bash
npm install
```

4. Crear la estructura de la base de datos:

```bash
mysql -u root -p < schema.sql
```

## Ejecución
```bash
npm start
```

La API estará disponible en:

```bash
http://localhost:3000
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /tareas | Lista todas las tareas |
| GET | /tareas?estado=completada | Lista tareas completadas |
| GET | /tareas?estado=pendiente | Lista tareas pendientes |
| GET | /tareas/:id | Obtiene una tarea por id |
| POST | /tareas | Crea una tarea |
| PUT | /tareas/:id | Actualiza una tarea |
| DELETE | /tareas/:id | Elimina una tarea |

## Ejemplo de creación
```bash
curl -X POST http://localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Comprar leche","completada":false}'
```

## Validaciones
- el nombre es obligatorio
- el nombre debe tener entre 2 y 100 caracteres
- el estado debe ser booleano
- la consulta de filtro solo acepta `completada` o `pendiente`
- la comparación de nombres se hace con una normalización consistente

## Diseño
Se eligió una tabla `tareas` con los campos:`id`, `nombre`, `nombre_normalizado`, `completada`, `created_at`, `updated_at`.

La columna `nombre_normalizado` permite mantener una comparación uniforme y evitar duplicados, incluso si el cliente cambia mayúsculas o añade espacios.
