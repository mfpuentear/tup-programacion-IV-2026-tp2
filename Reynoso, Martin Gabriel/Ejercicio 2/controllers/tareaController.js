import pool from '../config/db.js';

export const crearTarea = async (req, res) => {
  try {
    const { nombre, completada = false } = req.body;
    const nombreNormalizado = nombre.trim();

    const [result] = await pool.query(
      'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
      [nombreNormalizado, completada]
    );

    res.status(201).json({
      status: 'success',
      data: {
        id: result.insertId,
        nombre: nombreNormalizado,
        completada: Boolean(completada)
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const obtenerTareas = async (req, res) => {
  try {
    const { completada } = req.query;
    let querySQL = 'SELECT id, nombre, completada, created_at, updated_at FROM tareas';
    const queryParams = [];

    if (completada !== undefined) {
      querySQL += ' WHERE completada = ?';
      queryParams.push(completada === 'true' || completada === '1');
    }

    querySQL += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(querySQL, queryParams);

    const dataFormatted = rows.map(t => ({
      ...t,
      completada: Boolean(t.completada)
    }));

    res.status(200).json({ status: 'success', data: dataFormatted });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const obtenerTareaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tareas WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Tarea no encontrada' });
    }

    const tarea = {
      ...rows[0],
      completada: Boolean(rows[0].completada)
    };

    res.status(200).json({ status: 'success', data: tarea });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const actualizarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, completada } = req.body;

    const [existing] = await pool.query('SELECT * FROM tareas WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Tarea no encontrada' });
    }

    const currentTarea = existing[0];
    const nuevoNombre = nombre !== undefined ? nombre.trim() : currentTarea.nombre;
    const nuevoEstado = completada !== undefined ? completada : currentTarea.completada;

    await pool.query(
      'UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?',
      [nuevoNombre, nuevoEstado, id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        id: Number(id),
        nombre: nuevoNombre,
        completada: Boolean(nuevoEstado)
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};

export const eliminarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tareas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Tarea no encontrada' });
    }

    res.status(200).json({ status: 'success', message: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor', detail: error.message });
  }
};