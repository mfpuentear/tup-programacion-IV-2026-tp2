const db = require('../config/db');

const calcularGeometria = (ladoA, ladoB) => {
  const a = parseFloat(ladoA);
  const b = parseFloat(ladoB);
  return {
    perimetro: 2 * (a + b),
    superficie: a * b
  };
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rectangulos');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM rectangulos WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
    }

    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { lado_a, lado_b } = req.body;
    
    const { perimetro, superficie } = calcularGeometria(lado_a, lado_b);

    const [result] = await db.query(
      'INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)',
      [lado_a, lado_b, perimetro, superficie]
    );

    res.status(201).json({
      status: 'success',
      message: 'Rectángulo creado con éxito',
      data: {
        id: result.insertId,
        lado_a: Number(lado_a),
        lado_b: Number(lado_b),
        perimetro,
        superficie
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { lado_a, lado_b } = req.body;

    const [existing] = await db.query('SELECT * FROM rectangulos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
    }

    const { perimetro, superficie } = calcularGeometria(lado_a, lado_b);

    await db.query(
      'UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?',
      [lado_a, lado_b, perimetro, superficie, id]
    );

    res.json({
      status: 'success',
      message: 'Rectángulo actualizado con éxito',
      data: {
        id: Number(id),
        lado_a: Number(lado_a),
        lado_b: Number(lado_b),
        perimetro,
        superficie
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM rectangulos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
    }

    res.json({ status: 'success', message: 'Rectángulo eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};