const pool = require('../db');

const SELECT = `
  SELECT c.id, c.alumno, c.nota1, c.nota2, c.nota3,
         m.id AS materia_id, m.nombre AS materia
  FROM calificaciones c
  JOIN materias m ON m.id = c.materia_id`;

const formatear = (r) => ({
  id: r.id,
  alumno: r.alumno,
  materia: { id: r.materia_id, nombre: r.materia },
  notas: [Number(r.nota1), Number(r.nota2), Number(r.nota3)],
});

const buscarPorId = async (id) => {
  const [rows] = await pool.query(`${SELECT} WHERE c.id = ?`, [id]);
  return rows.length ? formatear(rows[0]) : null;
};

const listar = async (req, res, next) => {
  try {
    const condiciones = [];
    const params = [];
    if (req.query.alumno) { condiciones.push('c.alumno LIKE ?'); params.push(`%${req.query.alumno}%`); }
    if (req.query.materia_id) { condiciones.push('c.materia_id = ?'); params.push(req.query.materia_id); }
    const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
    const [rows] = await pool.query(`${SELECT}${where} ORDER BY c.alumno, m.nombre`, params);
    res.json(rows.map(formatear));
  } catch (e) { next(e); }
};

const obtener = async (req, res, next) => {
  try {
    const cal = await buscarPorId(req.params.id);
    if (!cal) return res.status(404).json({ error: 'Calificación no encontrada' });
    res.json(cal);
  } catch (e) { next(e); }
};

const crear = async (req, res, next) => {
  try {
    const { alumno, materia_id, notas } = req.body;
    const [r] = await pool.query(
      'INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
      [alumno, materia_id, notas[0], notas[1], notas[2]]
    );
    res.status(201).json(await buscarPorId(r.insertId));
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un registro para ese alumno en esa materia' });
    next(e);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const { alumno, materia_id, notas } = req.body;
    const [r] = await pool.query(
      'UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
      [alumno, materia_id, notas[0], notas[1], notas[2], req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Calificación no encontrada' });
    res.json(await buscarPorId(req.params.id));
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un registro para ese alumno en esa materia' });
    next(e);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM calificaciones WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Calificación no encontrada' });
    res.status(204).send();
  } catch (e) { next(e); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
