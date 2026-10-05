const express = require('express');
const router = express.Router();
const db = require('./db');
const { validarTarea, validarId } = require('./validaciones');

// GET: Obtener todas las tareas
router.get('/', async (req, res) => {
  try {
    const [filas] = await db.query('SELECT * FROM tareas ORDER BY id DESC');
    res.json(filas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
});

// GET: Obtener una tarea por ID
router.get('/:id', validarId, async (req, res) => {
  const { id } = req.params;
  try {
    const [filas] = await db.query('SELECT * FROM tareas WHERE id = ?', [id]);
    if (filas.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la tarea' });
  }
});

// POST: Crear una nueva tarea
router.post('/', validarTarea, async (req, res) => {
  const { titulo, descripcion, completada } = req.body;
  const estadoCompletada = completada !== undefined ? completada : false;

  try {
    const [resultado] = await db.query(
      'INSERT INTO tareas (titulo, descripcion, completada) VALUES (?, ?, ?)',
      [titulo, descripcion || null, estadoCompletada]
    );

    res.status(201).json({
      id: resultado.insertId,
      titulo,
      descripcion: descripcion || null,
      completada: estadoCompletada
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

// PUT: Actualizar una tarea existente
router.put('/:id', [...validarId, ...validarTarea], async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, completada } = req.body;
  const estadoCompletada = completada !== undefined ? completada : false;

  try {
    const [resultado] = await db.query(
      'UPDATE tareas SET titulo = ?, descripcion = ?, completada = ? WHERE id = ?',
      [titulo, descripcion || null, estadoCompletada, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada para actualizar' });
    }

    res.json({
      id: Number(id),
      titulo,
      descripcion: descripcion || null,
      completada: estadoCompletada
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

// DELETE: Eliminar una tarea por ID
router.delete('/:id', validarId, async (req, res) => {
  const { id } = req.params;
  try {
    const [resultado] = await db.query('DELETE FROM tareas WHERE id = ?', [id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada para eliminar' });
    }
    res.json({ mensaje: `Tarea con ID ${id} eliminada correctamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

module.exports = router;
