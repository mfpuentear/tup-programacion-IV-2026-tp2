const { validationResult } = require('express-validator');
const db = require('../config/db');


const calcularPerimetroYSuperficie = (lado_a, lado_b) => {
  const a = parseFloat(lado_a);
  const b = parseFloat(lado_b);
  const perimetro = 2 * (a + b);
  const superficie = a * b;
  return { perimetro, superficie };
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rectangulos');
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener los rectángulos.' });
  }
};

exports.getById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [rows] = await db.query('SELECT * FROM rectangulos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Rectángulo no encontrado.' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener el rectángulo.' });
  }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { lado_a, lado_b } = req.body;
  const { perimetro, superficie } = calcularPerimetroYSuperficie(lado_a, lado_b);

  try {
    const [result] = await db.query(
      'INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)',
      [lado_a, lado_b, perimetro, superficie]
    );

    return res.status(201).json({
      id: result.insertId,
      lado_a: parseFloat(lado_a),
      lado_b: parseFloat(lado_b),
      perimetro,
      superficie
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al guardar el rectángulo.' });
  }
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { lado_a, lado_b } = req.body;
  const { perimetro, superficie } = calcularPerimetroYSuperficie(lado_a, lado_b);

  try {
    const [result] = await db.query(
      'UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?',
      [lado_a, lado_b, perimetro, superficie, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rectángulo no encontrado.' });
    }

    return res.status(200).json({
      id: parseInt(id),
      lado_a: parseFloat(lado_a),
      lado_b: parseFloat(lado_b),
      perimetro,
      superficie
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar el rectángulo.' });
  }
};

exports.delete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [result] = await db.query('DELETE FROM rectangulos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rectángulo no encontrado.' });
    }
    return res.status(200).json({ message: 'Rectángulo eliminado exitosamente.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar el rectángulo.' });
  }
};