const express = require('express');
const { body, param, validationResult } = require('express-validator');
const pool = require('./db');

const app = express();
app.use(express.json());
const PORT = 3000;

// Validaciones reutilizables
const validarLados = [
  body('lado1')
    .isFloat({ gt: 0 })
    .withMessage('lado1 debe ser un número mayor a 0'),
  body('lado2')
    .isFloat({ gt: 0 })
    .withMessage('lado2 debe ser un número mayor a 0')
];

const validarId = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('id debe ser un número entero válido')
];

function manejarErrores(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
}

// Listar todos los rectángulos
app.get('/rectangulos', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM rectangulos');
  res.json(rows);
});

// Consultar un rectángulo puntual
app.get('/rectangulos/:id', validarId, manejarErrores, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM rectangulos WHERE id = ?',
    [req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Rectángulo no encontrado' });
  }
  res.json(rows[0]);
});

// Crear un rectángulo
app.post('/rectangulos', validarLados, manejarErrores, async (req, res) => {
  const lado1 = Number(req.body.lado1);
  const lado2 = Number(req.body.lado2);
  const perimetro = 2 * (lado1 + lado2);
  const superficie = lado1 * lado2;

  const [resultado] = await pool.query(
    'INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)',
    [lado1, lado2, perimetro, superficie]
  );

  res.status(201).json({
    id: resultado.insertId,
    lado1,
    lado2,
    perimetro,
    superficie
  });
});

// Modificar los lados de un rectángulo
app.put(
  '/rectangulos/:id',
  [...validarId, ...validarLados],
  manejarErrores,
  async (req, res) => {
    const lado1 = Number(req.body.lado1);
    const lado2 = Number(req.body.lado2);
    const perimetro = 2 * (lado1 + lado2);
    const superficie = lado1 * lado2;

    const [resultado] = await pool.query(
      'UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?',
      [lado1, lado2, perimetro, superficie, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Rectángulo no encontrado' });
    }

    res.json({ id: Number(req.params.id), lado1, lado2, perimetro, superficie });
  }
);

// Borrar un rectángulo
app.delete('/rectangulos/:id', validarId, manejarErrores, async (req, res) => {
  const [resultado] = await pool.query(
    'DELETE FROM rectangulos WHERE id = ?',
    [req.params.id]
  );

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ error: 'Rectángulo no encontrado' });
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});