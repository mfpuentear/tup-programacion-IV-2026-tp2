const { validationResult } = require('express-validator');
const db = require('../config/db');


exports.getAll = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { completada } = req.query;

  try {
    let sql = 'SELECT * FROM tareas';
    const params = [];

    if (completada !== undefined) {
      sql += ' WHERE completada = ?';
      params.push(completada);
    }

    const [rows] = await db.query(sql, params);
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener las tareas.' });
  }
};


exports.getById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [rows] = await db.query('SELECT * FROM tareas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener la tarea.' });
  }
};


exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, completada = false } = req.body;
  const nombreLimpio = nombre.trim();

  try {
    
    const [existentes] = await db.query('SELECT id FROM tareas WHERE LOWER(nombre) = LOWER(?)', [nombreLimpio]);
    if (existentes.length > 0) {
      return res.status(409).json({ message: 'Ya existe una tarea con este nombre.' });
    }

    const [result] = await db.query(
      'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
      [nombreLimpio, completada]
    );

    return res.status(201).json({
      id: result.insertId,
      nombre: nombreLimpio,
      completada: Boolean(completada)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear la tarea.' });
  }
};


exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { nombre, completada } = req.body;

  if (nombre === undefined && completada === undefined) {
    return res.status(400).json({ message: 'Debe enviar al menos un campo para actualizar (nombre o completada).' });
  }

  try {
    const [tareaActual] = await db.query('SELECT * FROM tareas WHERE id = ?', [id]);
    if (tareaActual.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    let nuevoNombre = tareaActual[0].nombre;
    let nuevoEstado = tareaActual[0].completada;

    if (nombre !== undefined) {
      nuevoNombre = nombre.trim();
      // Verificar que el nuevo nombre no colisione con otra tarea existente
      const [duplicados] = await db.query(
        'SELECT id FROM tareas WHERE LOWER(nombre) = LOWER(?) AND id != ?',
        [nuevoNombre, id]
      );
      if (duplicados.length > 0) {
        return res.status(409).json({ message: 'Ya existe otra tarea con ese nombre.' });
      }
    }

    if (completada !== undefined) {
      nuevoEstado = completada;
    }

    await db.query(
      'UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?',
      [nuevoNombre, nuevoEstado, id]
    );

    return res.status(200).json({
      id: parseInt(id),
      nombre: nuevoNombre,
      completada: Boolean(nuevoEstado)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar la tarea.' });
  }
};


exports.delete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [result] = await db.query('DELETE FROM tareas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }
    return res.status(200).json({ message: 'Tarea eliminada exitosamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar la tarea.' });
  }
};