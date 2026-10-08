const db = require('../database');

exports.getAllRectangles = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rectangles');
    return res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getRectangleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM rectangles WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
    }
    return res.status(200).json({ status: 'success', data: rows[0] });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createRectangle = async (req, res) => {
  try {
    const base = parseFloat(req.body.base);
    const height = parseFloat(req.body.height);

    const perimeter = 2 * (base + height);
    const surface = base * height;

    const [result] = await db.query(
      'INSERT INTO rectangles (base, height, perimeter, surface) VALUES (?, ?, ?, ?)',
      [base, height, perimeter, surface]
    );

    return res.status(201).json({
      status: 'success',
      data: { id: result.insertId, base, height, perimeter, surface }
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateRectangle = async (req, res) => {
  try {
    const { id } = req.params;
    const base = parseFloat(req.body.base);
    const height = parseFloat(req.body.height);

    const [existing] = await db.query('SELECT * FROM rectangles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
    }

    const perimeter = 2 * (base + height);
    const surface = base * height;

    await db.query(
      'UPDATE rectangles SET base = ?, height = ?, perimeter = ?, surface = ? WHERE id = ?',
      [base, height, perimeter, surface, id]
    );

    return res.status(200).json({
      status: 'success',
      data: { id: Number(id), base, height, perimeter, surface }
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.deleteRectangle = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM rectangles WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};