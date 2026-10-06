const pool = require('./db');
const { normalizarNombre } = require('./validators');

// Se hace JOIN con materias para devolver el nombre de la materia, no
// solo su id, que es mas util para quien consume la API.
const SELECT_BASE = `
  SELECT c.id, c.alumno, c.materia_id, m.nombre AS materia_nombre,
         c.nota1, c.nota2, c.nota3
  FROM calificaciones c
  JOIN materias m ON m.id = c.materia_id
`;

function mapRow(row) {
  return {
    id: row.id,
    alumno: row.alumno,
    materia: { id: row.materia_id, nombre: row.materia_nombre },
    notas: [Number(row.nota1), Number(row.nota2), Number(row.nota3)],
  };
}

async function listar(req, res) {
  const [rows] = await pool.query(`${SELECT_BASE} ORDER BY c.id`);
  res.status(200).json(rows.map(mapRow));
}

async function obtenerPorId(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(`${SELECT_BASE} WHERE c.id = ?`, [id]);
  if (rows.length === 0) {
    return res.status(404).json({ mensaje: `No existe una calificacion con id ${id}` });
  }
  res.status(200).json(mapRow(rows[0]));
}

async function crear(req, res) {
  const { alumno, materiaId, notas } = req.body;
  const alumnoNormalizado = normalizarNombre(alumno);

  const [resultado] = await pool.query(
    `INSERT INTO calificaciones (alumno, alumno_normalizado, materia_id, nota1, nota2, nota3)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [alumno, alumnoNormalizado, materiaId, notas[0], notas[1], notas[2]]
  );

  const [rows] = await pool.query(`${SELECT_BASE} WHERE c.id = ?`, [resultado.insertId]);
  res.status(201).json(mapRow(rows[0]));
}

async function modificar(req, res) {
  const { id } = req.params;
  const { alumno, materiaId, notas } = req.body;

  const campos = [];
  const valores = [];

  if (alumno !== undefined) {
    campos.push('alumno = ?', 'alumno_normalizado = ?');
    valores.push(alumno, normalizarNombre(alumno));
  }
  if (materiaId !== undefined) {
    campos.push('materia_id = ?');
    valores.push(materiaId);
  }
  if (notas !== undefined) {
    campos.push('nota1 = ?', 'nota2 = ?', 'nota3 = ?');
    valores.push(notas[0], notas[1], notas[2]);
  }

  if (campos.length === 0) {
    return res.status(400).json({
      mensaje: 'Debe enviar al menos uno de: alumno, materiaId, notas',
    });
  }

  valores.push(id);
  const [resultado] = await pool.query(
    `UPDATE calificaciones SET ${campos.join(', ')} WHERE id = ?`,
    valores
  );

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensaje: `No existe una calificacion con id ${id}` });
  }

  const [rows] = await pool.query(`${SELECT_BASE} WHERE c.id = ?`, [id]);
  res.status(200).json(mapRow(rows[0]));
}

async function eliminar(req, res) {
  const { id } = req.params;
  const [resultado] = await pool.query('DELETE FROM calificaciones WHERE id = ?', [id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensaje: `No existe una calificacion con id ${id}` });
  }
  res.status(204).send();
}

module.exports = { listar, obtenerPorId, crear, modificar, eliminar };
