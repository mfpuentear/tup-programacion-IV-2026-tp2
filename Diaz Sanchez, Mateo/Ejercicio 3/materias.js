const express = require('express');
const pool = require('./db');
const { idParam, nameBody, resourceQuery } = require('./validaciones');

const router = express.Router();

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function registerNameResource(resource, table, label) {
  router.get(`/${resource}`, resourceQuery, async (req, res) => {
    const [rows] = await pool.execute(`SELECT id, nombre FROM ${table} ORDER BY nombre, id`);
    res.json({ data: rows });
  });

  router.get(`/${resource}/:id`, [...idParam.slice(0, -1), ...resourceQuery], async (req, res) => {
    const [rows] = await pool.execute(`SELECT id, nombre FROM ${table} WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: `${label} no encontrado` });
    res.json({ data: rows[0] });
  });

  router.post(`/${resource}`, [...resourceQuery.slice(0, -1), ...nameBody], async (req, res) => {
    const nombre = req.body.nombre.trim();
    const [result] = await pool.execute(
      `INSERT INTO ${table} (nombre, nombre_clave) VALUES (?, ?)`,
      [nombre, normalizeName(nombre)],
    );
    res.status(201).json({ data: { id: result.insertId, nombre } });
  });

  router.put(`/${resource}/:id`, [...idParam.slice(0, -1), ...resourceQuery.slice(0, -1), ...nameBody], async (req, res) => {
    const nombre = req.body.nombre.trim();
    const [result] = await pool.execute(
      `UPDATE ${table} SET nombre = ?, nombre_clave = ? WHERE id = ?`,
      [nombre, normalizeName(nombre), req.params.id],
    );
    if (!result.affectedRows) return res.status(404).json({ error: `${label} no encontrado` });
    res.json({ data: { id: Number(req.params.id), nombre } });
  });

  router.delete(`/${resource}/:id`, [...idParam.slice(0, -1), ...resourceQuery], async (req, res) => {
    const [result] = await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: `${label} no encontrado` });
    res.status(204).end();
  });
}

registerNameResource('alumnos', 'alumnos', 'Alumno');
registerNameResource('materias', 'materias', 'Materia');

module.exports = router;