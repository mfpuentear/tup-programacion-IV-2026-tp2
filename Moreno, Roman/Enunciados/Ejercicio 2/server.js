const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { pool, initDatabase, normalizeTaskName } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

app.get('/api/tareas', [
  query('estado')
    .optional()
    .isIn(['pendiente', 'completada'])
    .withMessage('El estado debe ser pendiente o completada')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { estado } = req.query;

  try {
    let sql = 'SELECT id, nombre, completada FROM tareas';
    const params = [];

    if (estado) {
      sql += ' WHERE completada = ?';
      params.push(estado === 'completada');
    }

    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

app.post('/api/tareas', [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('completada')
    .isBoolean()
    .withMessage('El estado debe ser booleano')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, completada } = req.body;
  const nombreNormalizado = normalizeTaskName(nombre);

  try {
    const [existing] = await pool.query(
      'SELECT id FROM tareas WHERE nombre_normalizado = ?',
      [nombreNormalizado]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ya existe una tarea con ese nombre' });
    }

    const [result] = await pool.query(
      'INSERT INTO tareas (nombre, nombre_normalizado, completada) VALUES (?, ?, ?)',
      [nombre, nombreNormalizado, completada]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      completada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

app.put('/api/tareas/:id', [
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('completada')
    .optional()
    .isBoolean()
    .withMessage('El estado debe ser booleano')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { nombre, completada } = req.body;

  try {
    const [existingTask] = await pool.query(
      'SELECT nombre, completada FROM tareas WHERE id = ?',
      [id]
    );

    if (existingTask.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const tarea = existingTask[0];
    const nuevoNombre = nombre !== undefined ? nombre : tarea.nombre;
    const nuevoEstado = completada !== undefined ? completada : tarea.completada;
    const nuevoNombreNormalizado = normalizeTaskName(nuevoNombre);

    if (nombre !== undefined) {
      const [sameName] = await pool.query(
        'SELECT id FROM tareas WHERE nombre_normalizado = ? AND id != ?',
        [nuevoNombreNormalizado, id]
      );

      if (sameName.length > 0) {
        return res.status(409).json({ error: 'Ya existe otra tarea con ese nombre' });
      }
    }

    await pool.query(
      'UPDATE tareas SET nombre = ?, nombre_normalizado = ?, completada = ? WHERE id = ?',
      [nuevoNombre, nuevoNombreNormalizado, nuevoEstado, id]
    );

    res.status(200).json({
      id: Number(id),
      nombre: nuevoNombre,
      completada: nuevoEstado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

app.delete('/api/tareas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM tareas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.status(200).json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

app.listen(port, async () => {
  try {
    await initDatabase();
    console.log(`Servidor corriendo en http://localhost:${port}`);
  } catch (error) {
    console.error('Error al iniciar la base de datos:', error);
    process.exit(1);
  }
});
