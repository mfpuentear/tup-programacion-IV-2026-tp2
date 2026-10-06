import express from 'express';
import { query, run } from './db.js';
import { validarMateria } from './validaciones.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM materias');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar materias' });
  }
});

router.post('/', async (req, res) => {
  const { error, value } = validarMateria(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const result = await run('INSERT INTO materias (nombre) VALUES (?)', [value.nombre]);
    res.status(201).json({ id: result.id, nombre: value.nombre });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear materia' });
  }
});

export default router;