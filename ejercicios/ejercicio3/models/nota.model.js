const db = require('../config/db');

class NotaModel {
  static async obtenerTodas(materiaId = null) {
    let query = `
      SELECT c.id, c.alumno_nombre, c.materia_id, m.nombre AS materia_nombre, 
             c.nota1, c.nota2, c.nota3,
             TRUNCATE((c.nota1 + c.nota2 + c.nota3) / 3, 2) AS promedio
      FROM calificaciones c
      INNER JOIN materias m ON c.materia_id = m.id
    `;
    const params = [];

    if (materiaId) {
      query += ' WHERE c.materia_id = ?';
      params.push(materiaId);
    }

    query += ' ORDER BY c.alumno_nombre ASC;';
    const [rows] = await db.query(query, params);
    return rows;
  }

  static async obtenerPorId(id) {
    const query = `
      SELECT c.*, m.nombre AS materia_nombre 
      FROM calificaciones c
      INNER JOIN materias m ON c.materia_id = m.id
      WHERE c.id = ?;
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // Verifica si ya existe la combinación alumno + materia
  static async buscarExistente(alumno_nombre, materia_id, idExcluir = null) {
    let query = 'SELECT id FROM calificaciones WHERE LOWER(alumno_nombre) = LOWER(?) AND materia_id = ?';
    const params = [alumno_nombre.trim(), materia_id];

    if (idExcluir) {
      query += ' AND id != ?';
      params.push(idExcluir);
    }

    const [rows] = await db.query(query, params);
    return rows[0];
  }

  static async crear({ alumno_nombre, materia_id, nota1, nota2, nota3 }) {
    const [result] = await db.query(
      'INSERT INTO calificaciones (alumno_nombre, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
      [alumno_nombre.trim(), materia_id, nota1, nota2, nota3]
    );
    return result.insertId;
  }

  static async actualizar(id, { alumno_nombre, materia_id, nota1, nota2, nota3 }) {
    const [result] = await db.query(
      'UPDATE calificaciones SET alumno_nombre = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
      [alumno_nombre.trim(), materia_id, nota1, nota2, nota3, id]
    );
    return result.affectedRows > 0;
  }

  static async eliminar(id) {
    const [result] = await db.query('DELETE FROM calificaciones WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = NotaModel;     