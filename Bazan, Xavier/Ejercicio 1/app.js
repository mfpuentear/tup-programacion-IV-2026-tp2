const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

let rectangulos = [
  { id: 1, base: 4, altura: 3 },
  { id: 2, base: 5, altura: 2 },
];
let nextId = 3;

const validarRectangulo = [
  body('base').isFloat({ min: 1 }).withMessage('La base debe ser un número mayor a 0'),
  body('altura').isFloat({ min: 1 }).withMessage('La altura debe ser un número mayor a 0'),
];

const manejarValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const calcularDatos = (rectangulo) => {
  const base = Number(rectangulo.base);
  const altura = Number(rectangulo.altura);

  return {
    ...rectangulo,
    base,
    altura,
    perimetro: (base * 2) + (altura * 2),
    superficie: base * altura,
  };
};

app.get('/rectangulos', (req, res) => {
  res.json(rectangulos.map(calcularDatos));
});

app.get('/rectangulos/:id', (req, res) => {
  const id = Number(req.params.id);
  const rectangulo = rectangulos.find((item) => item.id === id);

  if (!rectangulo) {
    return res.status(404).json({ mensaje: 'Rectángulo no encontrado' });
  }

  res.json(calcularDatos(rectangulo));
});

app.post('/rectangulos', validarRectangulo, manejarValidacion, (req, res) => {
  const rectangulo = {
    id: nextId++,
    base: Number(req.body.base),
    altura: Number(req.body.altura),
  };

  rectangulos.push(rectangulo);
  res.status(201).json(calcularDatos(rectangulo));
});

app.put('/rectangulos/:id', validarRectangulo, manejarValidacion, (req, res) => {
  const id = Number(req.params.id);
  const index = rectangulos.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Rectángulo no encontrado' });
  }

  rectangulos[index] = {
    ...rectangulos[index],
    base: Number(req.body.base),
    altura: Number(req.body.altura),
  };

  res.json(calcularDatos(rectangulos[index]));
});

app.delete('/rectangulos/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = rectangulos.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Rectángulo no encontrado' });
  }

  const eliminado = rectangulos[index];
  rectangulos = rectangulos.filter((item) => item.id !== id);
  res.json({ mensaje: 'Rectángulo eliminado', rectangulo: calcularDatos(eliminado) });
});

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Ejercicio 1 escuchando en http://localhost:${PORT}`);
});
