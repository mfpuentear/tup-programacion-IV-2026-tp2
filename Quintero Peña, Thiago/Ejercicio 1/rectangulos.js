import express from 'express';
import { query, run } from './db.js';
import { validarRectangulo } from './validaciones.js';

const router = express.Router();

// GET /api/rectangulos - Listar todos los rectángulos calculados
router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM rectangulos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los rectángulos' });
  }
});

// POST /api/rectangulos - Crear y calcular área y perímetro
router.post('/', async (req, res) => {
  const { error, value } = validarRectangulo(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { base, altura } = value;
  const area = base * altura;
  const perimetro = 2 * (base + altura);

  try {
    const result = await run(
      'INSERT INTO rectangulos (base, altura, area, perimetro) VALUES (?, ?, ?, ?)',
      [base, altura, area, perimetro]
    );
    res.status(201).json({
      id: result.id,
      base,
      altura,
      area,
      perimetro
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el rectángulo' });
  }
});

export default router;