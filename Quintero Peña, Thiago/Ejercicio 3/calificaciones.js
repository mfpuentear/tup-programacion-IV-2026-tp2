const express = require('express');
const router = express.Router();
const db = require('./db');
const { validarCalificacion, validarId } = require('./validaciones');

// GET: Obtener todas las calificaciones con el nombre de la materia y promedio
router.get('/', async (req, res) => {
  try {
    const [filas] = await db.query(`
      SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3,
             ROUND((c.nota1 + c.nota2 + c.nota3) / 3, 2) AS promedio
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
      ORDER BY c.id DESC
    `);
    res.json(filas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las calificaciones' });
  }
});

// GET: Obtener una calificación por ID
router.get('/:id', validarId, async (req, res) => {
  const { id } = req.params;
  try {
    const [filas] = await db.query(`
      SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3,
             ROUND((c.nota1 + c.nota2 + c.nota3) / 3, 2) AS promedio
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
      WHERE c.id = ?
    `, [id]);

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Registro de calificación no encontrado' });
    }
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la calificación' });
  }
});

// POST: Registrar calificaciones para un alumno en una materia
router.post('/', validarCalificacion, async (req, res) => {
  const { alumno, materia_id, nota1, nota2, nota3 } = req.body;

  try {
    // 1. Verificar si la materia existe
    const [materia] = await db.query('SELECT * FROM materias WHERE id = ?', [materia_id]);
    if (materia.length === 0) {
      return res.status(400).json({ error: 'La materia especificada no existe' });
    }

    // 2. Verificar si ya existe registro para ese alumno en la misma materia
    const [existente] = await db.query(
      'SELECT * FROM calificaciones WHERE alumno = ? AND materia_id = ?',
      [alumno, materia_id]
    );

    if (existente.length > 0) {
      return res.status(400).json({ error: 'El alumno ya posee calificaciones cargadas en esta materia' });
    }

    // 3. Insertar registro
    const [resultado] = await db.query(
      'INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
      [alumno, materia_id, nota1, nota2, nota3]
    );

    const promedio = parseFloat(((nota1 + nota2 + nota3) / 3).toFixed(2));

    res.status(201).json({
      id: resultado.insertId,
      alumno,
      materia: materia[0].nombre,
      nota1,
      nota2,
      nota3,
      promedio
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la calificación' });
  }
});

// PUT: Actualizar calificaciones
router.put('/:id', [...validarId, ...validarCalificacion], async (req, res) => {
  const { id } = req.params;
  const { alumno, materia_id, nota1, nota2, nota3 } = req.body;

  try {
    const [resultado] = await db.query(
      'UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
      [alumno, materia_id, nota1, nota2, nota3, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro no encontrado para actualizar' });
    }

    const promedio = parseFloat(((nota1 + nota2 + nota3) / 3).toFixed(2));

    res.json({
      id: Number(id),
      alumno,
      materia_id,
      nota1,
      nota2,
      nota3,
      promedio
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la calificación' });
  }
});

// DELETE: Eliminar calificación por ID
router.delete('/:id', validarId, async (req, res) => {
  const { id } = req.params;
  try {
    const [resultado] = await db.query('DELETE FROM calificaciones WHERE id = ?', [id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro no encontrado para eliminar' });
    }
    res.json({ mensaje: `Calificación con ID ${id} eliminada correctamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la calificación' });
  }
});

module.exports = router;
