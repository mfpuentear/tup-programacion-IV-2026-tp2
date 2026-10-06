import pool from '../config/db.js';

const calcularPerimetroYSuperficie = (lado1, lado2) => {
  const l1 = Number(lado1);
  const l2 = Number(lado2);
  const perimetro = Number((2 * (l1 + l2)).toFixed(2));
  const superficie = Number((l1 * l2).toFixed(2));
  return { perimetro, superficie };
};

export const crearRectangulo = async (req, res) => {
  try {
    const { lado1, lado2 } = req.body;
    const { perimetro, superficie } = calcularPerimetroYSuperficie(lado1, lado2);

    const [result] = await pool.query(
      'INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)',
      [lado1, lado2, perimetro, superficie]
    );

    res.status(201).json({
      status: 'success',
      data: {
        id: result.insertId,
        lado1: Number(lado1),
        lado2: Number(lado2),
        perimetro,
        superficie
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const obtenerRectangulos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rectangulos');
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const obtenerRectanguloPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM rectangulos WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
    }

    res.status(200).json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const actualizarRectangulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { lado1, lado2 } = req.body;

    const [existing] = await pool.query('SELECT * FROM rectangulos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
    }

    const { perimetro, superficie } = calcularPerimetroYSuperficie(lado1, lado2);

    await pool.query(
      'UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?',
      [lado1, lado2, perimetro, superficie, id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        id: Number(id),
        lado1: Number(lado1),
        lado2: Number(lado2),
        perimetro,
        superficie
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const eliminarRectangulo = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM rectangulos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
    }

    res.status(200).json({ status: 'success', message: 'Rectángulo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};