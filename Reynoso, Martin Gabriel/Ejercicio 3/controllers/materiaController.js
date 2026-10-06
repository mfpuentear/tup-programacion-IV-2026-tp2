import pool from '../config/db.js';

export const crearMateria = async (req, res) => {
  try {
    const { nombre } = req.body;
    const nombreLimpio = nombre.trim();

    const [result] = await pool.query(
      'INSERT INTO materias (nombre) VALUES (?)',
      [nombreLimpio]
    );

    res.status(201).json({
      status: 'success',
      data: { id: result.insertId, nombre: nombreLimpio }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};


export const obtenerMaterias = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM materias ORDER BY nombre ASC');
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};