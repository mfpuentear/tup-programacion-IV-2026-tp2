const pool = require('../db');

async function listarAlumnos(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM alumnos ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar alumnos', error: error.message });
  }
}

async function obtenerAlumno(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute('SELECT * FROM alumnos WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener alumno', error: error.message });
  }
}

async function crearAlumno(req, res) {
  try {
    const { nombre } = req.body;
    const nombreTrim = nombre.trim();

    const [result] = await pool.execute('INSERT INTO alumnos (nombre) VALUES (?)', [nombreTrim]);

    return res.status(201).json({ id: result.insertId, nombre: nombreTrim });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function actualizarAlumno(req, res) {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const [result] = await pool.execute('UPDATE alumnos SET nombre = ? WHERE id = ?', [nombre.trim(), id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    return res.status(200).json({ id: Number(id), nombre: nombre.trim() });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function eliminarAlumno(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM alumnos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }
    return res.status(200).json({ message: 'Alumno eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar alumno', error: error.message });
  }
}

module.exports = {
  listarAlumnos,
  obtenerAlumno,
  crearAlumno,
  actualizarAlumno,
  eliminarAlumno
};
