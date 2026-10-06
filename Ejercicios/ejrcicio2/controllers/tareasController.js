const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { completada } = req.query;
    let sql = 'SELECT * FROM tareas';
    const params = [];

    if (completada !== undefined) {
      const isCompleted = completada === 'true' || completada === '1';
      sql += ' WHERE completada = ?';
      params.push(isCompleted ? 1 : 0);
    }

    const [rows] = await db.query(sql, params);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM tareas WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Tarea no encontrada' });
    }

    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, completada = false } = req.body;
    const nombreLimpio = nombre.trim();
    const estadoBooleano = Boolean(completada);

    const [result] = await db.query(
      'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
      [nombreLimpio, estadoBooleano]
    );

    res.status(201).json({
      status: 'success',
      message: 'Tarea creada con éxito',
      data: {
        id: result.insertId,
        nombre: nombreLimpio,
        completada: estadoBooleano
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, completada } = req.body;

    const [existing] = await db.query('SELECT * FROM tareas WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Tarea no encontrada' });
    }

    const nombreLimpio = nombre ? nombre.trim() : existing[0].nombre;
    const estadoFinal = completada !== undefined ? Boolean(completada) : existing[0].completada;

    await db.query(
      'UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?',
      [nombreLimpio, estadoFinal, id]
    );

    res.json({
      status: 'success',
      message: 'Tarea actualizada con éxito',
      data: {
        id: Number(id),
        nombre: nombreLimpio,
        completada: estadoFinal
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM tareas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Tarea no encontrada' });
    }

    res.json({ status: 'success', message: 'Tarea eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};