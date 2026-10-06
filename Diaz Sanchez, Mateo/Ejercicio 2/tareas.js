const express = require('express');
const pool = require('./db');
const { createBody, idParam, listQuery, noQuery, updateBody } = require('./validaciones');

const router = express.Router();

function normalizeTaskName(name) {
  return name.trim().toLowerCase();
}

router.get('/', listQuery, async (req, res) => {
  const conditions = [];
  const values = [];
  if (req.query.estado) {
    conditions.push('completada = ?');
    values.push(req.query.estado === 'completada');
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = Number(req.query.limit || 50);
  const offset = Number(req.query.offset || 0);
  const [rows] = await pool.execute(
    `SELECT id, nombre, completada FROM tareas ${where} ORDER BY id LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );
  res.json({ data: rows.map((task) => ({ ...task, completada: Boolean(task.completada) })), pagination: { limit, offset } });
});

router.get('/:id', [...idParam.slice(0, -1), ...noQuery], async (req, res) => {
  const [rows] = await pool.execute('SELECT id, nombre, completada FROM tareas WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Tarea no encontrada' });
  rows[0].completada = Boolean(rows[0].completada);
  res.json({ data: rows[0] });
});

router.post('/', [...noQuery, ...createBody], async (req, res) => {
  const nombre = req.body.nombre.trim();
  const completada = req.body.completada ?? false;
  const nameKey = normalizeTaskName(nombre);
  const [result] = await pool.execute(
    'INSERT INTO tareas (nombre, nombre_clave, completada) VALUES (?, ?, ?)',
    [nombre, nameKey, completada],
  );
  res.status(201).json({ data: { id: result.insertId, nombre, completada } });
});

router.put('/:id', [...idParam.slice(0, -1), ...noQuery, ...updateBody], async (req, res) => {
  const nombre = req.body.nombre.trim();
  const completada = req.body.completada;
  const [result] = await pool.execute(
    'UPDATE tareas SET nombre = ?, nombre_clave = ?, completada = ? WHERE id = ?',
    [nombre, normalizeTaskName(nombre), completada, req.params.id],
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json({ data: { id: Number(req.params.id), nombre, completada } });
});

router.delete('/:id', [...idParam.slice(0, -1), ...noQuery], async (req, res) => {
  const [result] = await pool.execute('DELETE FROM tareas WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.status(204).end();
});

module.exports = { router, normalizeTaskName };