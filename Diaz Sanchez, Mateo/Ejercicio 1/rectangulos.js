const express = require('express');
const pool = require('./db');
const { idParam, listQuery, noQuery, rectangleBody } = require('./validaciones');

const router = express.Router();

function calculateRectangle(ladoA, ladoB) {
  return {
    perimetro: 2 * (ladoA + ladoB),
    superficie: ladoA * ladoB,
  };
}

const toRectangleResource = (rectangle) => ({
  id: rectangle.id,
  ladoA: Number(rectangle.ladoA),
  ladoB: Number(rectangle.ladoB),
  perimetro: Number(rectangle.perimetro),
  superficie: Number(rectangle.superficie),
});

router.get('/', listQuery, async (req, res) => {
  const limit = req.query.limit || 50;
  const offset = req.query.offset || 0;
  const [rows] = await pool.execute(
    'SELECT id, lado_a AS ladoA, lado_b AS ladoB, perimetro, superficie FROM rectangulos ORDER BY id LIMIT ? OFFSET ?',
    [limit, offset],
  );
  res.json({ data: rows.map(toRectangleResource), pagination: { limit, offset } });
});

router.get('/:id', [...idParam.slice(0, -1), ...noQuery], async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, lado_a AS ladoA, lado_b AS ladoB, perimetro, superficie FROM rectangulos WHERE id = ?',
    [req.params.id],
  );
  if (!rows.length) return res.status(404).json({ error: 'Rectángulo no encontrado' });
  res.json({ data: toRectangleResource(rows[0]) });
});

router.post('/', [...noQuery, ...rectangleBody], async (req, res) => {
  const { ladoA, ladoB } = req.body;
  const { perimetro, superficie } = calculateRectangle(ladoA, ladoB);
  const [result] = await pool.execute(
    'INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)',
    [ladoA, ladoB, perimetro, superficie],
  );
  res.status(201).json({ data: { id: result.insertId, ladoA, ladoB, perimetro, superficie } });
});

router.put('/:id', [...idParam.slice(0, -1), ...noQuery, ...rectangleBody], async (req, res) => {
  const { ladoA, ladoB } = req.body;
  const { perimetro, superficie } = calculateRectangle(ladoA, ladoB);
  const [result] = await pool.execute(
    'UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?',
    [ladoA, ladoB, perimetro, superficie, req.params.id],
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Rectángulo no encontrado' });
  res.json({ data: { id: Number(req.params.id), ladoA, ladoB, perimetro, superficie } });
});

router.delete('/:id', [...idParam.slice(0, -1), ...noQuery], async (req, res) => {
  const [result] = await pool.execute('DELETE FROM rectangulos WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Rectángulo no encontrado' });
  res.status(204).end();
});

module.exports = { router, calculateRectangle };