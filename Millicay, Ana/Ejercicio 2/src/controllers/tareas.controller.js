const { matchedData } = require('express-validator');
const pool = require('../db');

// Criterio de comparación de nombres: dos nombres son iguales si coinciden
// ignorando mayúsculas/minúsculas, tildes y espacios sobrantes (el validador
// ya recorta y colapsa los espacios antes de llegar acá).
const normalizar = (nombre) =>
  nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const aDto = (r) => ({
  id: r.id,
  nombre: r.nombre,
  completada: Boolean(r.completada),
});

const nombreDuplicado = (res) =>
  res.status(409).json({
    error: 'Ya existe una tarea con ese nombre (se comparan sin mayúsculas, tildes ni espacios sobrantes)',
  });

exports.crear = async (req, res, next) => {
  try {
    const { nombre, completada = false } = matchedData(req);
    const [result] = await pool.execute(
      'INSERT INTO tareas (nombre, nombre_normalizado, completada) VALUES (?, ?, ?)',
      [nombre, normalizar(nombre), completada ? 1 : 0]
    );
    const [rows] = await pool.execute('SELECT * FROM tareas WHERE id = ?', [result.insertId]);
    res.status(201).location(`/tareas/${result.insertId}`).json(aDto(rows[0]));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return nombreDuplicado(res);
    next(err);
  }
};

exports.listar = async (req, res, next) => {
  try {
    const { estado } = matchedData(req);
    let sql = 'SELECT * FROM tareas';
    const params = [];
    if (estado) {
      sql += ' WHERE completada = ?';
      params.push(estado === 'completadas' ? 1 : 0);
    }
    sql += ' ORDER BY id';
    const [rows] = await pool.execute(sql, params);
    res.json(rows.map(aDto));
  } catch (err) { next(err); }
};

exports.obtener = async (req, res, next) => {
  try {
    const { id } = matchedData(req);
    const [rows] = await pool.execute('SELECT * FROM tareas WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(aDto(rows[0]));
  } catch (err) { next(err); }
};

exports.actualizar = async (req, res, next) => {
  try {
    const { id, nombre, completada } = matchedData(req);
    await pool.execute(
      'UPDATE tareas SET nombre = ?, nombre_normalizado = ?, completada = ? WHERE id = ?',
      [nombre, normalizar(nombre), completada ? 1 : 0, id]
    );
    const [rows] = await pool.execute('SELECT * FROM tareas WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(aDto(rows[0]));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return nombreDuplicado(res);
    next(err);
  }
};

exports.cambiarEstado = async (req, res, next) => {
  try {
    const { id, completada } = matchedData(req);
    await pool.execute('UPDATE tareas SET completada = ? WHERE id = ?', [completada ? 1 : 0, id]);
    const [rows] = await pool.execute('SELECT * FROM tareas WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(aDto(rows[0]));
  } catch (err) { next(err); }
};

exports.eliminar = async (req, res, next) => {
  try {
    const { id } = matchedData(req);
    const [result] = await pool.execute('DELETE FROM tareas WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
};