const { validationResult } = require('express-validator');
const db = require('../config/db');


exports.getAll = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { materia_id } = req.query;

  try {
    let sql = `
      SELECT c.id, c.alumno_nombre, c.materia_id, m.nombre AS materia_nombre,
             c.nota_1, c.nota_2, c.nota_3,
             ROUND((c.nota_1 + c.nota_2 + c.nota_3) / 3, 2) AS promedio,
             c.created_at
      FROM calificaciones c
      INNER JOIN materias m ON c.materia_id = m.id
    `;
    const params = [];

    if (materia_id) {
      sql += ' WHERE c.materia_id = ?';
      params.push(materia_id);
    }

    const [rows] = await db.query(sql, params);
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener las calificaciones.' });
  }
};


exports.getById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const sql = `
      SELECT c.id, c.alumno_nombre, c.materia_id, m.nombre AS materia_nombre,
             c.nota_1, c.nota_2, c.nota_3,
             ROUND((c.nota_1 + c.nota_2 + c.nota_3) / 3, 2) AS promedio
      FROM calificaciones c
      INNER JOIN materias m ON c.materia_id = m.id
      WHERE c.id = ?
    `;
    const [rows] = await db.query(sql, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Registro de calificación no encontrado.' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener el registro.' });
  }
};


exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { alumno_nombre, materia_id, nota_1, nota_2, nota_3 } = req.body;
  const nombreLimpio = alumno_nombre.trim();

  try {
    
    const [materias] = await db.query('SELECT id FROM materias WHERE id = ?', [materia_id]);
    if (materias.length === 0) {
      return res.status(404).json({ message: 'La materia especificada no existe.' });
    }

    
    const [existentes] = await db.query(
      'SELECT id FROM calificaciones WHERE LOWER(alumno_nombre) = LOWER(?) AND materia_id = ?',
      [nombreLimpio, materia_id]
    );
    if (existentes.length > 0) {
      return res.status(409).json({ message: 'Ya existe un registro de este alumno para la materia seleccionada.' });
    }

    
    const [result] = await db.query(
      'INSERT INTO calificaciones (alumno_nombre, materia_id, nota_1, nota_2, nota_3) VALUES (?, ?, ?, ?, ?)',
      [nombreLimpio, materia_id, nota_1, nota_2, nota_3]
    );

    return res.status(201).json({
      id: result.insertId,
      alumno_nombre: nombreLimpio,
      materia_id: parseInt(materia_id),
      nota_1: parseFloat(nota_1),
      nota_2: parseFloat(nota_2),
      nota_3: parseFloat(nota_3),
      promedio: parseFloat(((parseFloat(nota_1) + parseFloat(nota_2) + parseFloat(nota_3)) / 3).toFixed(2))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al registrar la calificación.' });
  }
};


exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { alumno_nombre, materia_id, nota_1, nota_2, nota_3 } = req.body;

  try {
    const [actual] = await db.query('SELECT * FROM calificaciones WHERE id = ?', [id]);
    if (actual.length === 0) {
      return res.status(404).json({ message: 'Registro de calificación no encontrado.' });
    }

    const nuevoAlumno = alumno_nombre !== undefined ? alumno_nombre.trim() : actual[0].alumno_nombre;
    const nuevaMateriaId = materia_id !== undefined ? materia_id : actual[0].materia_id;
    const nuevaNota1 = nota_1 !== undefined ? nota_1 : actual[0].nota_1;
    const nuevaNota2 = nota_2 !== undefined ? nota_2 : actual[0].nota_2;
    const nuevaNota3 = nota_3 !== undefined ? nota_3 : actual[0].nota_3;

    
    if (materia_id !== undefined) {
      const [materiaExiste] = await db.query('SELECT id FROM materias WHERE id = ?', [nuevaMateriaId]);
      if (materiaExiste.length === 0) {
        return res.status(404).json({ message: 'La nueva materia especificada no existe.' });
      }
    }


    const [duplicados] = await db.query(
      'SELECT id FROM calificaciones WHERE LOWER(alumno_nombre) = LOWER(?) AND materia_id = ? AND id != ?',
      [nuevoAlumno, nuevaMateriaId, id]
    );
    if (duplicados.length > 0) {
      return res.status(409).json({ message: 'Ya existe otro registro para esta combinación de alumno y materia.' });
    }

    await db.query(
      'UPDATE calificaciones SET alumno_nombre = ?, materia_id = ?, nota_1 = ?, nota_2 = ?, nota_3 = ? WHERE id = ?',
      [nuevoAlumno, nuevaMateriaId, nuevaNota1, nuevaNota2, nuevaNota3, id]
    );

    return res.status(200).json({
      id: parseInt(id),
      alumno_nombre: nuevoAlumno,
      materia_id: parseInt(nuevaMateriaId),
      nota_1: parseFloat(nuevaNota1),
      nota_2: parseFloat(nuevaNota2),
      nota_3: parseFloat(nuevaNota3),
      promedio: parseFloat(((parseFloat(nuevaNota1) + parseFloat(nuevaNota2) + parseFloat(nuevaNota3)) / 3).toFixed(2))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar el registro.' });
  }
};


exports.delete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [result] = await db.query('DELETE FROM calificaciones WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Registro no encontrado.' });
    }
    return res.status(200).json({ message: 'Calificación eliminada correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar la calificación.' });
  }
};