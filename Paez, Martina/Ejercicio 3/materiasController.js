const pool = require('./db');

async function listar(req, res) {
  const [rows] = await pool.query('SELECT id, nombre FROM materias ORDER BY id');
  res.status(200).json(rows);
}

async function obtenerPorId(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT id, nombre FROM materias WHERE id = ?', [id]);
  if (rows.length === 0) {
    return res.status(404).json({ mensaje: `No existe una materia con id ${id}` });
  }
  res.status(200).json(rows[0]);
}

async function crear(req, res) {
  const { nombre } = req.body;
  const [resultado] = await pool.query(
    'INSERT INTO materias (nombre) VALUES (?)',
    [nombre]
  );
  res.status(201).json({ id: resultado.insertId, nombre });
}

async function eliminar(req, res) {
  const { id } = req.params;
  const [resultado] = await pool.query('DELETE FROM materias WHERE id = ?', [id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensaje: `No existe una materia con id ${id}` });
  }
  res.status(204).send();
}

module.exports = { listar, obtenerPorId, crear, eliminar };
