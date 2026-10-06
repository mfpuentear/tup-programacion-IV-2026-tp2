const pool = require('./db');

// Calcula perimetro, superficie y si es cuadrado.
function calcularDerivados(ladoA, ladoB) {
  return {
    perimetro: Number((2 * (ladoA + ladoB)).toFixed(2)),
    superficie: Number((ladoA * ladoB).toFixed(2)),
    esCuadrado: ladoA === ladoB,
  };
}

function mapRow(row) {
  return {
    id: row.id,
    lado_a: Number(row.lado_a),
    lado_b: Number(row.lado_b),
    perimetro: Number(row.perimetro),
    superficie: Number(row.superficie),
    esCuadrado: Number(row.lado_a) === Number(row.lado_b),
  };
}

async function listar(req, res) {
  const [rows] = await pool.query(
    'SELECT id, lado_a, lado_b, perimetro, superficie FROM rectangulos ORDER BY id'
  );
  res.status(200).json(rows.map(mapRow));
}

async function obtenerPorId(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    'SELECT id, lado_a, lado_b, perimetro, superficie FROM rectangulos WHERE id = ?',
    [id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ mensaje: `No existe un rectangulo con id ${id}` });
  }
  res.status(200).json(mapRow(rows[0]));
}

async function crear(req, res) {
  const { lado_a, lado_b } = req.body;
  const { perimetro, superficie } = calcularDerivados(lado_a, lado_b);

  const [resultado] = await pool.query(
    'INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)',
    [lado_a, lado_b, perimetro, superficie]
  );

  res.status(201).json({
    id: resultado.insertId,
    lado_a,
    lado_b,
    perimetro,
    superficie,
    esCuadrado: lado_a === lado_b,
  });
}

async function modificar(req, res) {
  const { id } = req.params;
  const { lado_a, lado_b } = req.body;
  const { perimetro, superficie } = calcularDerivados(lado_a, lado_b);

  const [resultado] = await pool.query(
    'UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?',
    [lado_a, lado_b, perimetro, superficie, id]
  );

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensaje: `No existe un rectangulo con id ${id}` });
  }

  res.status(200).json({
    id: Number(id),
    lado_a,
    lado_b,
    perimetro,
    superficie,
    esCuadrado: lado_a === lado_b,
  });
}

async function eliminar(req, res) {
  const { id } = req.params;
  const [resultado] = await pool.query('DELETE FROM rectangulos WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensaje: `No existe un rectangulo con id ${id}` });
  }

  res.status(204).send();
}

module.exports = { listar, obtenerPorId, crear, modificar, eliminar };
