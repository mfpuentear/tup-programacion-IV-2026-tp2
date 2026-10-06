const pool = require('./db');
const { normalizarNombre } = require('./validators');

function mapRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    completada: Boolean(row.completada),
  };
}

async function listar(req, res) {
  const { completada } = req.query;

  let sql = 'SELECT id, nombre, completada FROM tareas';
  const params = [];

  // El filtro es un query param opcional: si no viene, se listan todas.
  if (completada !== undefined) {
    sql += ' WHERE completada = ?';
    params.push(completada === 'true' ? 1 : 0);
  }

  sql += ' ORDER BY id';

  const [rows] = await pool.query(sql, params);
  res.status(200).json(rows.map(mapRow));
}

async function obtenerPorId(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    'SELECT id, nombre, completada FROM tareas WHERE id = ?',
    [id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ mensaje: `No existe una tarea con id ${id}` });
  }
  res.status(200).json(mapRow(rows[0]));
}

async function crear(req, res) {
  const { nombre } = req.body;
  const nombreNormalizado = normalizarNombre(nombre);

  const [resultado] = await pool.query(
    'INSERT INTO tareas (nombre, nombre_normalizado, completada) VALUES (?, ?, FALSE)',
    [nombre, nombreNormalizado]
  );

  res.status(201).json({
    id: resultado.insertId,
    nombre,
    completada: false,
  });
}

async function modificar(req, res) {
  const { id } = req.params;
  const { nombre, completada } = req.body;

  // Se arma el UPDATE dinamicamente porque nombre y completada son
  // ambos opcionales (se puede cambiar uno sin tocar el otro).
  const campos = [];
  const valores = [];

  if (nombre !== undefined) {
    campos.push('nombre = ?', 'nombre_normalizado = ?');
    valores.push(nombre, normalizarNombre(nombre));
  }
  if (completada !== undefined) {
    campos.push('completada = ?');
    valores.push(completada);
  }

  if (campos.length === 0) {
    return res.status(400).json({
      mensaje: 'Debe enviar al menos uno de: nombre, completada',
    });
  }

  valores.push(id);
  const [resultado] = await pool.query(
    `UPDATE tareas SET ${campos.join(', ')} WHERE id = ?`,
    valores
  );

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensaje: `No existe una tarea con id ${id}` });
  }

  const [rows] = await pool.query(
    'SELECT id, nombre, completada FROM tareas WHERE id = ?',
    [id]
  );
  res.status(200).json(mapRow(rows[0]));
}

async function eliminar(req, res) {
  const { id } = req.params;
  const [resultado] = await pool.query('DELETE FROM tareas WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensaje: `No existe una tarea con id ${id}` });
  }

  res.status(204).send();
}

module.exports = { listar, obtenerPorId, crear, modificar, eliminar };
