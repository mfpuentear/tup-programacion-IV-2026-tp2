const { matchedData } = require('express-validator');
const pool = require('../db');

const redondear = (n, dec) => Math.round(n * 10 ** dec) / 10 ** dec;

// El perímetro y la superficie se calculan en el servidor antes de guardar
const calcular = (a, b) => ({
  perimetro: redondear(2 * (a + b), 2),
  superficie: redondear(a * b, 4),
});

const aDto = (r) => ({
  id: r.id,
  ladoA: Number(r.lado_a),
  ladoB: Number(r.lado_b),
  perimetro: Number(r.perimetro),
  superficie: Number(r.superficie),
});

exports.crear = async (req, res, next) => {
  try {
    const { ladoA, ladoB } = matchedData(req);
    const { perimetro, superficie } = calcular(ladoA, ladoB);
    const [result] = await pool.execute(
      'INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)',
      [ladoA, ladoB, perimetro, superficie]
    );
    const [rows] = await pool.execute('SELECT * FROM rectangulos WHERE id = ?', [result.insertId]);
    res.status(201).location(`/rectangulos/${result.insertId}`).json(aDto(rows[0]));
  } catch (err) { next(err); }
};

exports.listar = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = matchedData(req);
    const [rows] = await pool.query(
      'SELECT * FROM rectangulos ORDER BY id LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json(rows.map(aDto));
  } catch (err) { next(err); }
};

exports.obtener = async (req, res, next) => {
  try {
    const { id } = matchedData(req);
    const [rows] = await pool.execute('SELECT * FROM rectangulos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
    res.json(aDto(rows[0]));
  } catch (err) { next(err); }
};

exports.actualizar = async (req, res, next) => {
  try {
    const { id, ladoA, ladoB } = matchedData(req);
    const { perimetro, superficie } = calcular(ladoA, ladoB);
    await pool.execute(
      'UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?',
      [ladoA, ladoB, perimetro, superficie, id]
    );
    const [rows] = await pool.execute('SELECT * FROM rectangulos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
    res.json(aDto(rows[0]));
  } catch (err) { next(err); }
};

exports.eliminar = async (req, res, next) => {
  try {
    const { id } = matchedData(req);
    const [result] = await pool.execute('DELETE FROM rectangulos WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
};