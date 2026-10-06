import pool from '../config/db.js';

const calcularPromedio = (n1, n2, n3) => {
  const p = (Number(n1) + Number(n2) + Number(n3)) / 3;
  return Number(p.toFixed(2));
};

export const crearCalificacion = async (req, res) => {
  try {
    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;
    const alumnoLimpio = alumno.trim();
    const promedio = calcularPromedio(nota1, nota2, nota3);

    const [result] = await pool.query(
      'INSERT INTO alumno_materia (alumno, materia_id, nota1, nota2, nota3, promedio) VALUES (?, ?, ?, ?, ?, ?)',
      [alumnoLimpio, materia_id, nota1, nota2, nota3, promedio]
    );

    res.status(201).json({
      status: 'success',
      data: {
        id: result.insertId,
        alumno: alumnoLimpio,
        materia_id: Number(materia_id),
        nota1: Number(nota1),
        nota2: Number(nota2),
        nota3: Number(nota3),
        promedio
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const obtenerCalificaciones = async (req, res) => {
  try {
    const { materia_id } = req.query;
    let querySQL = `
      SELECT am.id, am.alumno, am.materia_id, m.nombre AS materia,
             am.nota1, am.nota2, am.nota3, am.promedio, am.created_at
      FROM alumno_materia am
      JOIN materias m ON am.materia_id = m.id
    `;
    const params = [];

    if (materia_id) {
      querySQL += ' WHERE am.materia_id = ?';
      params.push(materia_id);
    }

    querySQL += ' ORDER BY am.alumno ASC';

    const [rows] = await pool.query(querySQL, params);
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const obtenerCalificacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT am.id, am.alumno, am.materia_id, m.nombre AS materia,
             am.nota1, am.nota2, am.nota3, am.promedio, am.created_at
      FROM alumno_materia am
      JOIN materias m ON am.materia_id = m.id
      WHERE am.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Registro de calificación no encontrado' });
    }

    res.status(200).json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const actualizarCalificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;

    const [existing] = await pool.query('SELECT * FROM alumno_materia WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Registro de calificación no encontrado' });
    }

    const prev = existing[0];
    const nuevoAlumno = alumno !== undefined ? alumno.trim() : prev.alumno;
    const nuevaMateriaId = materia_id !== undefined ? materia_id : prev.materia_id;
    const n1 = nota1 !== undefined ? nota1 : prev.nota1;
    const n2 = nota2 !== undefined ? nota2 : prev.nota2;
    const n3 = nota3 !== undefined ? nota3 : prev.nota3;
    const nuevoPromedio = calcularPromedio(n1, n2, n3);

    await pool.query(
      'UPDATE alumno_materia SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ?, promedio = ? WHERE id = ?',
      [nuevoAlumno, nuevaMateriaId, n1, n2, n3, nuevoPromedio, id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        id: Number(id),
        alumno: nuevoAlumno,
        materia_id: Number(nuevaMateriaId),
        nota1: Number(n1),
        nota2: Number(n2),
        nota3: Number(n3),
        promedio: nuevoPromedio
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const eliminarCalificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM alumno_materia WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Registro de calificación no encontrado' });
    }

    res.status(200).json({ status: 'success', message: 'Registro de calificación eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};