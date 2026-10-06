const pool = require('../db');
const { calcularPropiedades } = require('../utils/geogebra');


const getRectangulos = async (req, res, next) => {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 50;
    const [rows] = await pool.query(
      'SELECT id, lado_a, lado_b, perimetro, superficie, created_at, updated_at FROM rectangulos ORDER BY id DESC LIMIT ?',
      [limite]
    );

    return res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    next(error);
  }
};


const getRectanguloById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, lado_a, lado_b, perimetro, superficie, created_at, updated_at FROM rectangulos WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado.' });
    }

    return res.status(200).json({ status: 'success', data: rows[0] });
  } catch (error) {
    next(error);
  }
};


const createRectangulo = async (req, res, next) => {
  try {
    const { lado_a, lado_b } = req.body;

    
    const { perimetro, superficie } = calcularPropiedades(lado_a, lado_b);

    const [result] = await pool.query(
      'INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)',
      [lado_a, lado_b, perimetro, superficie]
    );

    const [newRecord] = await pool.query(
      'SELECT id, lado_a, lado_b, perimetro, superficie, created_at, updated_at FROM rectangulos WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Rectángulo creado correctamente.',
      data: newRecord[0]
    });
  } catch (error) {
    next(error);
  }
};


const updateRectangulo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lado_a, lado_b } = req.body;

    const [existing] = await pool.query('SELECT * FROM rectangulos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado.' });
    }

    const current = existing[0];
    const finalLadoA = lado_a !== undefined ? lado_a : Number(current.lado_a);
    const finalLadoB = lado_b !== undefined ? lado_b : Number(current.lado_b);

    
    const { perimetro, superficie } = calcularPropiedades(finalLadoA, finalLadoB);

    await pool.query(
      'UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?',
      [finalLadoA, finalLadoB, perimetro, superficie, id]
    );

    const [updatedRecord] = await pool.query(
      'SELECT id, lado_a, lado_b, perimetro, superficie, created_at, updated_at FROM rectangulos WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Rectángulo actualizado correctamente.',
      data: updatedRecord[0]
    });
  } catch (error) {
    next(error);
  }
};


const deleteRectangulo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM rectangulos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado.' });
    }

    return res.status(200).json({ status: 'success', message: 'Rectángulo eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRectangulos,
  getRectanguloById,
  createRectangulo,
  updateRectangulo,
  deleteRectangulo
};