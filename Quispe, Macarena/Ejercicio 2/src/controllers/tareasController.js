const pool = require('../db');
const {
  normalizarNombre,
  parseEstadoBooleano,
  serializarTarea
} = require('../services/tareaService');

async function listarTareas(req, res) {
  try {
    const { estado } = req.query;
    let query = 'SELECT * FROM tareas';
    const params = [];

    if (estado) {
      query += ' WHERE completada = ?';
      params.push(estado === 'completada' ? 1 : 0);
    }

    query += ' ORDER BY id DESC';

    const [rows] = await pool.execute(query, params);
    const tareas = rows.map(serializarTarea);

    res.status(200).json(tareas);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar tareas', error: error.message });
  }
}

async function obtenerTarea(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute('SELECT * FROM tareas WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.status(200).json(serializarTarea(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener tarea', error: error.message });
  }
}

async function crearTarea(req, res) {
  try {
    const { nombre, completada } = req.body;
    const nombreNormalizado = normalizarNombre(nombre);
    const completadaValue = parseEstadoBooleano(completada);

    const [existente] = await pool.execute(
      'SELECT id FROM tareas WHERE nombre_normalizado = ?',
      [nombreNormalizado]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        message: 'Ya existe una tarea con ese nombre, considerando mayúsculas, espacios y tildes de forma normalizada.'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO tareas (nombre, nombre_normalizado, completada) VALUES (?, ?, ?)',
      [nombre.trim(), nombreNormalizado, completadaValue ? 1 : 0]
    );

    return res.status(201).json({
      id: result.insertId,
      nombre: nombre.trim(),
      nombreNormalizado,
      completada: completadaValue
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function actualizarTarea(req, res) {
  try {
    const { id } = req.params;
    const { nombre, completada } = req.body;
    const nombreNormalizado = normalizarNombre(nombre);
    const completadaValue = parseEstadoBooleano(completada);

    const [duplicado] = await pool.execute(
      'SELECT id FROM tareas WHERE nombre_normalizado = ? AND id != ?',
      [nombreNormalizado, id]
    );

    if (duplicado.length > 0) {
      return res.status(409).json({
        message: 'Ya existe otra tarea con ese nombre, considerando la normalización establecida.'
      });
    }

    const [result] = await pool.execute(
      'UPDATE tareas SET nombre = ?, nombre_normalizado = ?, completada = ? WHERE id = ?',
      [nombre.trim(), nombreNormalizado, completadaValue ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.status(200).json({
      id: Number(id),
      nombre: nombre.trim(),
      nombreNormalizado,
      completada: completadaValue
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function eliminarTarea(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM tareas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.status(200).json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar tarea', error: error.message });
  }
}

module.exports = {
  listarTareas,
  obtenerTarea,
  crearTarea,
  actualizarTarea,
  eliminarTarea
};
