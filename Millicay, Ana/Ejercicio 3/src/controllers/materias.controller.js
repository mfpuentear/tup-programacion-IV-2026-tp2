const pool = require('../db');

const listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM materias ORDER BY nombre');
    res.json(rows);
  } catch (e) { next(e); }
};

const obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM materias WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};

const crear = async (req, res, next) => {
  try {
    const [r] = await pool.query('INSERT INTO materias (nombre) VALUES (?)', [req.body.nombre]);
    res.status(201).json({ id: r.insertId, nombre: req.body.nombre });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe una materia con ese nombre' });
    next(e);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const [r] = await pool.query('UPDATE materias SET nombre = ? WHERE id = ?', [req.body.nombre, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json({ id: req.params.id, nombre: req.body.nombre });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe una materia con ese nombre' });
    next(e);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM materias WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Materia no encontrada' });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'No se puede eliminar: la materia tiene calificaciones asociadas' });
    }
    next(e);
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
