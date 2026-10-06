const express = require('express');
const pool = require('./db');
const { gradeBody, gradesQuery, idParam, resourceQuery } = require('./validaciones');

const router = express.Router();

const gradeSelect = `
  SELECT g.id, g.alumno_id AS alumnoId, a.nombre AS alumno,
         g.materia_id AS materiaId, m.nombre AS materia,
         g.nota_1, g.nota_2, g.nota_3
  FROM calificaciones g
  JOIN alumnos a ON a.id = g.alumno_id
  JOIN materias m ON m.id = g.materia_id`;

const toGradeResource = (row) => ({
  id: row.id,
  alumnoId: row.alumnoId,
  alumno: row.alumno,
  materiaId: row.materiaId,
  materia: row.materia,
  notas: [Number(row.nota_1), Number(row.nota_2), Number(row.nota_3)],
});

async function ensureStudentAndSubject(alumnoId, materiaId, res) {
  const [[students], [subjects]] = await Promise.all([
    pool.execute('SELECT id FROM alumnos WHERE id = ?', [alumnoId]),
    pool.execute('SELECT id FROM materias WHERE id = ?', [materiaId]),
  ]);
  if (!students.length) {
    res.status(404).json({ error: 'Alumno no encontrado' });
    return false;
  }
  if (!subjects.length) {
    res.status(404).json({ error: 'Materia no encontrada' });
    return false;
  }
  return true;
}

async function hasDuplicateGrade(alumnoId, materiaId, excludedId) {
  const sql = excludedId
    ? 'SELECT id FROM calificaciones WHERE alumno_id = ? AND materia_id = ? AND id <> ?'
    : 'SELECT id FROM calificaciones WHERE alumno_id = ? AND materia_id = ?';
  const values = excludedId ? [alumnoId, materiaId, excludedId] : [alumnoId, materiaId];
  const [rows] = await pool.execute(sql, values);
  return rows.length > 0;
}

router.get('/', gradesQuery, async (req, res) => {
  const conditions = [];
  const values = [];
  if (req.query.alumnoId) {
    conditions.push('g.alumno_id = ?');
    values.push(req.query.alumnoId);
  }
  if (req.query.materiaId) {
    conditions.push('g.materia_id = ?');
    values.push(req.query.materiaId);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = Number(req.query.limit || 50);
  const offset = Number(req.query.offset || 0);
  const [rows] = await pool.execute(
    `${gradeSelect} ${where} ORDER BY g.id LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );
  res.json({ data: rows.map(toGradeResource), pagination: { limit, offset } });
});

router.get('/:id', [...idParam.slice(0, -1), ...resourceQuery], async (req, res) => {
  const [rows] = await pool.execute(`${gradeSelect} WHERE g.id = ?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Calificación no encontrada' });
  res.json({ data: toGradeResource(rows[0]) });
});

router.post('/', [...resourceQuery.slice(0, -1), ...gradeBody], async (req, res) => {
  const { alumnoId, materiaId, notas } = req.body;
  if (!await ensureStudentAndSubject(alumnoId, materiaId, res)) return;
  if (await hasDuplicateGrade(alumnoId, materiaId)) return res.status(409).json({ error: 'Ya existe una calificación para ese alumno y materia' });
  const [result] = await pool.execute(
    'INSERT INTO calificaciones (alumno_id, materia_id, nota_1, nota_2, nota_3) VALUES (?, ?, ?, ?, ?)',
    [alumnoId, materiaId, ...notas],
  );
  res.status(201).json({ data: { id: result.insertId, alumnoId, materiaId, notas } });
});

router.put('/:id', [...idParam.slice(0, -1), ...resourceQuery.slice(0, -1), ...gradeBody], async (req, res) => {
  const { alumnoId, materiaId, notas } = req.body;
  if (!await ensureStudentAndSubject(alumnoId, materiaId, res)) return;
  if (await hasDuplicateGrade(alumnoId, materiaId, req.params.id)) return res.status(409).json({ error: 'Ya existe una calificación para ese alumno y materia' });
  const [result] = await pool.execute(
    'UPDATE calificaciones SET alumno_id = ?, materia_id = ?, nota_1 = ?, nota_2 = ?, nota_3 = ? WHERE id = ?',
    [alumnoId, materiaId, ...notas, req.params.id],
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Calificación no encontrada' });
  res.json({ data: { id: Number(req.params.id), alumnoId, materiaId, notas } });
});

router.delete('/:id', [...idParam.slice(0, -1), ...resourceQuery], async (req, res) => {
  const [result] = await pool.execute('DELETE FROM calificaciones WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Calificación no encontrada' });
  res.status(204).end();
});

module.exports = router;