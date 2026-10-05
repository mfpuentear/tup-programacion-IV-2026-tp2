const pool = require('../db');

async function listarMaterias(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM materias ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar materias', error: error.message });
  }
}

async function obtenerMateria(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute('SELECT * FROM materias WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener materia', error: error.message });
  }
}

async function crearMateria(req, res) {
  try {
    const { nombre } = req.body;
    const nombreTrim = nombre.trim();

    const [result] = await pool.execute('INSERT INTO materias (nombre) VALUES (?)', [nombreTrim]);

    return res.status(201).json({ id: result.insertId, nombre: nombreTrim });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function actualizarMateria(req, res) {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const [result] = await pool.execute('UPDATE materias SET nombre = ? WHERE id = ?', [nombre.trim(), id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    return res.status(200).json({ id: Number(id), nombre: nombre.trim() });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function eliminarMateria(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM materias WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }
    return res.status(200).json({ message: 'Materia eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar materia', error: error.message });
  }
}

module.exports = {
  listarMaterias,
  obtenerMateria,
  crearMateria,
  actualizarMateria,
  eliminarMateria
};
