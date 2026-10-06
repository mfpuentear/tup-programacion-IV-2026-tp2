const { validationResult } = require('express-validator');
const db = require('../config/db');


exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM materias ORDER BY nombre ASC');
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener la lista de materias.' });
  }
};


exports.getById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [rows] = await db.query('SELECT * FROM materias WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Materia no encontrada.' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener la materia.' });
  }
};


exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre } = req.body;
  const nombreLimpio = nombre.trim();

  try {
    
    const [existentes] = await db.query('SELECT id FROM materias WHERE LOWER(nombre) = LOWER(?)', [nombreLimpio]);
    if (existentes.length > 0) {
      return res.status(409).json({ message: 'Ya existe una materia registrada con este nombre.' });
    }

    const [result] = await db.query('INSERT INTO materias (nombre) VALUES (?)', [nombreLimpio]);

    return res.status(201).json({
      id: result.insertId,
      nombre: nombreLimpio
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear la materia.' });
  }
};


exports.delete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [result] = await db.query('DELETE FROM materias WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Materia no encontrada.' });
    }
    return res.status(200).json({ message: 'Materia eliminada exitosamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar la materia.' });
  }
};