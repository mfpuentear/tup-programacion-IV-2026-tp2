const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const sql = `
      SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3, c.promedio, c.created_at 
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
    `;
    const [rows] = await db.query(sql);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT c.id, c.alumno, c.materia_id, m.nombre AS materia, c.nota1, c.nota2, c.nota3, c.promedio
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
      WHERE c.id = ?
    `;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    }

    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;
    const alumnoLimpio = alumno.trim();
    
    const n1 = parseFloat(nota1);
    const n2 = parseFloat(nota2);
    const n3 = parseFloat(nota3);
    const promedio = Number(((n1 + n2 + n3) / 3).toFixed(2));

    const [result] = await db.query(
      'INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3, promedio) VALUES (?, ?, ?, ?, ?, ?)',
      [alumnoLimpio, materia_id, n1, n2, n3, promedio]
    );

    res.status(201).json({
      status: 'success',
      message: 'Calificación registrada correctamente',
      data: {
        id: result.insertId,
        alumno: alumnoLimpio,
        materia_id,
        nota1: n1,
        nota2: n2,
        nota3: n3,
        promedio
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { alumno, materia_id, nota1, nota2, nota3 } = req.body;

    const alumnoLimpio = alumno.trim();
    const n1 = parseFloat(nota1);
    const n2 = parseFloat(nota2);
    const n3 = parseFloat(nota3);
    const promedio = Number(((n1 + n2 + n3) / 3).toFixed(2));

    const [result] = await db.query(
      'UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ?, promedio = ? WHERE id = ?',
      [alumnoLimpio, materia_id, n1, n2, n3, promedio, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    }

    res.json({
      status: 'success',
      message: 'Calificación actualizada correctamente',
      data: { id: Number(id), alumno: alumnoLimpio, materia_id, nota1: n1, nota2: n2, nota3: n3, promedio }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM calificaciones WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    }

    res.json({ status: 'success', message: 'Calificación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};