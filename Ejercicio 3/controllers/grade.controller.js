const db = require('../database');

// Obtener todas las materias
const getSubjects = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subjects ORDER BY name ASC');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
  }
};

// Obtener todas las calificaciones
const getAllGrades = async (req, res) => {
  try {
    const sql = `
      SELECT 
        g.id,
        g.student_name,
        g.subject_id,
        s.name AS subject_name,
        g.note1,
        g.note2,
        g.note3,
        ROUND((g.note1 + g.note2 + g.note3) / 3, 2) AS average,
        g.created_at,
        g.updated_at
      FROM grades g
      INNER JOIN subjects s ON g.subject_id = s.id
      ORDER BY g.id DESC
    `;
    const [rows] = await db.query(sql);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
  }
};

// Obtener calificación por ID
const getGradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        g.id,
        g.student_name,
        g.subject_id,
        s.name AS subject_name,
        g.note1,
        g.note2,
        g.note3,
        ROUND((g.note1 + g.note2 + g.note3) / 3, 2) AS average,
        g.created_at,
        g.updated_at
      FROM grades g
      INNER JOIN subjects s ON g.subject_id = s.id
      WHERE g.id = ?
    `;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Registro de calificación no encontrado.' });
    }

    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
  }
};

// Crear nueva calificación
const createGrade = async (req, res) => {
  try {
    const { student_name, subject_id, note1, note2, note3 } = req.body;

    const sql = `
      INSERT INTO grades (student_name, subject_id, note1, note2, note3)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [student_name.trim(), subject_id, note1, note2, note3]);

    const [newRecord] = await db.query(`
      SELECT g.id, g.student_name, s.name AS subject_name, g.note1, g.note2, g.note3,
             ROUND((g.note1 + g.note2 + g.note3) / 3, 2) AS average
      FROM grades g
      INNER JOIN subjects s ON g.subject_id = s.id
      WHERE g.id = ?
    `, [result.insertId]);

    res.status(201).json({ status: 'success', data: newRecord[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al registrar calificaciones.' });
  }
};

// Actualizar calificación
const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_name, subject_id, note1, note2, note3 } = req.body;

    const [current] = await db.query('SELECT * FROM grades WHERE id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Registro de calificación no encontrado.' });
    }

    const updatedStudent = student_name !== undefined ? student_name.trim() : current[0].student_name;
    const updatedSubject = subject_id !== undefined ? subject_id : current[0].subject_id;
    const updatedNote1 = note1 !== undefined ? note1 : current[0].note1;
    const updatedNote2 = note2 !== undefined ? note2 : current[0].note2;
    const updatedNote3 = note3 !== undefined ? note3 : current[0].note3;

    const sql = `
      UPDATE grades 
      SET student_name = ?, subject_id = ?, note1 = ?, note2 = ?, note3 = ?
      WHERE id = ?
    `;
    await db.query(sql, [updatedStudent, updatedSubject, updatedNote1, updatedNote2, updatedNote3, id]);

    const [updatedRecord] = await db.query(`
      SELECT g.id, g.student_name, s.name AS subject_name, g.note1, g.note2, g.note3,
             ROUND((g.note1 + g.note2 + g.note3) / 3, 2) AS average
      FROM grades g
      INNER JOIN subjects s ON g.subject_id = s.id
      WHERE g.id = ?
    `, [id]);

    res.json({ status: 'success', data: updatedRecord[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al actualizar calificaciones.' });
  }
};

// Eliminar calificación
const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM grades WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'fail', message: 'Registro de calificación no encontrado.' });
    }

    res.json({ status: 'success', message: 'Registro eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al eliminar el registro.' });
  }
};

module.exports = {
  getSubjects,
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade
};