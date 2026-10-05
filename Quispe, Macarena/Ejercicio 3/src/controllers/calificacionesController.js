const pool = require('../db');

async function listarCalificaciones(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT c.id, a.nombre AS alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3
      FROM calificaciones c
      INNER JOIN alumnos a ON a.id = c.alumno_id
      INNER JOIN materias m ON m.id = c.materia_id
      ORDER BY c.id DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar calificaciones', error: error.message });
  }
}

async function obtenerCalificacion(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(`
      SELECT c.id, a.nombre AS alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3
      FROM calificaciones c
      INNER JOIN alumnos a ON a.id = c.alumno_id
      INNER JOIN materias m ON m.id = c.materia_id
      WHERE c.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Calificación no encontrada' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener calificación', error: error.message });
  }
}

async function crearCalificacion(req, res) {
  try {
    const { alumnoId, materiaId, notas } = req.body;

    const [alumno] = await pool.execute('SELECT id FROM alumnos WHERE id = ?', [alumnoId]);
    const [materia] = await pool.execute('SELECT id FROM materias WHERE id = ?', [materiaId]);

    if (alumno.length === 0) {
      return res.status(404).json({ message: 'El alumno no existe' });
    }

    if (materia.length === 0) {
      return res.status(404).json({ message: 'La materia no existe' });
    }

    const [duplicado] = await pool.execute(
      'SELECT id FROM calificaciones WHERE alumno_id = ? AND materia_id = ?',
      [alumnoId, materiaId]
    );

    if (duplicado.length > 0) {
      return res.status(409).json({ message: 'Ya existe una calificación para ese alumno y esa materia' });
    }

    const [result] = await pool.execute(
      'INSERT INTO calificaciones (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
      [alumnoId, materiaId, notas[0], notas[1], notas[2]]
    );

    return res.status(201).json({
      id: result.insertId,
      alumnoId,
      materiaId,
      notas
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function actualizarCalificacion(req, res) {
  try {
    const { id } = req.params;
    const { alumnoId, materiaId, notas } = req.body;

    const [alumno] = await pool.execute('SELECT id FROM alumnos WHERE id = ?', [alumnoId]);
    const [materia] = await pool.execute('SELECT id FROM materias WHERE id = ?', [materiaId]);

    if (alumno.length === 0) {
      return res.status(404).json({ message: 'El alumno no existe' });
    }

    if (materia.length === 0) {
      return res.status(404).json({ message: 'La materia no existe' });
    }

    const [duplicado] = await pool.execute(
      'SELECT id FROM calificaciones WHERE alumno_id = ? AND materia_id = ? AND id != ?',
      [alumnoId, materiaId, id]
    );

    if (duplicado.length > 0) {
      return res.status(409).json({ message: 'Ya existe una calificación para ese alumno y esa materia' });
    }

    const [result] = await pool.execute(
      'UPDATE calificaciones SET alumno_id = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
      [alumnoId, materiaId, notas[0], notas[1], notas[2], id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Calificación no encontrada' });
    }

    return res.status(200).json({
      id: Number(id),
      alumnoId,
      materiaId,
      notas
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function eliminarCalificacion(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM calificaciones WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Calificación no encontrada' });
    }

    return res.status(200).json({ message: 'Calificación eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar calificación', error: error.message });
  }
}

module.exports = {
  listarCalificaciones,
  obtenerCalificacion,
  crearCalificacion,
  actualizarCalificacion,
  eliminarCalificacion
};
