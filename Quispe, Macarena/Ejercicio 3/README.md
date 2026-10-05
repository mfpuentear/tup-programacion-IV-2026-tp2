# API de Calificaciones

## Descripción
Esta API REST permite administrar calificaciones de alumnos en materias de una carrera. La información se guarda en MySQL con una relación entre alumnos y materias.

## Requisitos
- Node.js
- MySQL
- npm

## Instalación
1. Crear la base de datos MySQL.
2. Configurar `.env` con tus credenciales.
3. Ejecutar:

```bash
npm install
```

4. Crear la base de datos y tablas:

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

### Alumnos
- GET /alumnos
- GET /alumnos/:id
- POST /alumnos
- PUT /alumnos/:id
- DELETE /alumnos/:id

### Materias
- GET /materias
- GET /materias/:id
- POST /materias
- PUT /materias/:id
- DELETE /materias/:id

### Calificaciones
- GET /calificaciones
- GET /calificaciones/:id
- POST /calificaciones
- PUT /calificaciones/:id
- DELETE /calificaciones/:id

## Regla de unicidad
No puede existir más de una calificación para la misma combinación de alumno y materia. La restricción `UNIQUE (alumno_id, materia_id)` se aplica en la base de datos para evitar duplicados.

## Validaciones
- nombre del alumno obligatorio y válido
- nombre de la materia obligatorio y válido
- materia existente
- alumno existente
- exactamente tres notas numéricas
- cada nota debe estar en el rango 0 a 10
- validación por `express-validator`

## Diseño de la base de datos
Se separaron en tablas distintas:
- `alumnos`
- `materias`
- `calificaciones`

`calificaciones` tiene una relación con `alumnos` y `materias` usando claves foráneas.

Esto permite evitar redundancia y mantener un modelo relacional correcto.
