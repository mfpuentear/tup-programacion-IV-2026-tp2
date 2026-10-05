# API de Rectángulos

## Descripción
Esta API REST permite gestionar rectángulos almacenados en MySQL. El cliente solo envía los dos lados; el servidor calcula automáticamente el perímetro y la superficie antes de persistir los datos.

## Requisitos
- Node.js
- MySQL
- npm

## Instalación
1. Crear una base de datos MySQL.
2. Configurar las variables de entorno en el archivo `.env`.
3. Ejecutar:

```bash
npm install
```

4. Crear la tabla con el archivo `schema.sql`:

```bash
mysql -u root -p < schema.sql
```

## Ejecución
```bash
npm start
```

La API quedará disponible en:
```bash
http://localhost:3000
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /rectangulos | Lista todos los rectángulos |
| GET | /rectangulos/:id | Obtiene un rectángulo por id |
| POST | /rectangulos | Crea un rectángulo con ladoA y ladoB |
| PUT | /rectangulos/:id | Actualiza un rectángulo |
| DELETE | /rectangulos/:id | Elimina un rectángulo |

## Ejemplo de creación
```bash
curl -X POST http://localhost:3000/rectangulos \
  -H "Content-Type: application/json" \
  -d '{"ladoA": 3, "ladoB": 4}'
```

## Validaciones
- ambos lados deben existir
- ambos lados deben ser numéricos
- ambos lados deben ser mayores que cero
- la validación se realiza con `express-validator`

## Cálculo realizado por el servidor
- perímetro = 2 × (ladoA + ladoB)
- superficie = ladoA × ladoB

## Notas de diseño
Se usó una tabla `rectangulos` con los atributos principales y los valores calculados. El cliente no puede enviar `perimetro` ni `superficie`, ya que esos valores deben generarse en el servidor para evitar inconsistencias.
