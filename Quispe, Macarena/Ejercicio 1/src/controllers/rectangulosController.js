const pool = require('../db');
const { calcularMetricas } = require('../services/rectanguloService');

async function listarRectangulos(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM rectangulos ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar rectángulos', error: error.message });
  }
}

async function obtenerRectangulo(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute('SELECT * FROM rectangulos WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Rectángulo no encontrado' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener rectángulo', error: error.message });
  }
}

async function crearRectangulo(req, res) {
  try {
    const { ladoA, ladoB } = req.body;
    const metricas = calcularMetricas(ladoA, ladoB);

    const [result] = await pool.execute(
      'INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)',
      [metricas.ladoA, metricas.ladoB, metricas.perimetro, metricas.superficie]
    );

    return res.status(201).json({
      id: result.insertId,
      ladoA: metricas.ladoA,
      ladoB: metricas.ladoB,
      perimetro: metricas.perimetro,
      superficie: metricas.superficie
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function actualizarRectangulo(req, res) {
  try {
    const { id } = req.params;
    const { ladoA, ladoB } = req.body;
    const metricas = calcularMetricas(ladoA, ladoB);

    const [result] = await pool.execute(
      'UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?',
      [metricas.ladoA, metricas.ladoB, metricas.perimetro, metricas.superficie, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rectángulo no encontrado' });
    }

    return res.status(200).json({
      id: Number(id),
      ladoA: metricas.ladoA,
      ladoB: metricas.ladoB,
      perimetro: metricas.perimetro,
      superficie: metricas.superficie
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function eliminarRectangulo(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM rectangulos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rectángulo no encontrado' });
    }

    return res.status(200).json({ message: 'Rectángulo eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar rectángulo', error: error.message });
  }
}

module.exports = {
  listarRectangulos,
  obtenerRectangulo,
  crearRectangulo,
  actualizarRectangulo,
  eliminarRectangulo
};
