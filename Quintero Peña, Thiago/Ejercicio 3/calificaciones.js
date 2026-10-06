import express from 'express';
import { query, run } from './db.js';
import { validarCalificacion } from './validaciones.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT c.*, m.nombre AS materia 
      FROM calificaciones c 
      JOIN materias m ON c.materia_id = m.id
    `;
    const rows = await query(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar calificaciones' });
  }
});

router.post('/', async (req, res) => {
  const { error, value } = validarCalificacion(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { alumno, materia_id, nota1 = 0, nota2 = 0, nota3 = 0 } = value;

  try {
    const result = await run(
      'INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
      [alumno, materia_id, nota1, nota2, nota3]
    );
    res.status(201).json({ id: result.id, alumno, materia_id, nota1, nota2, nota3 });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar calificación' });
  }
});

export default router;