const pool = require('../db');
const normalizeTitle = require('../utils/normalizeTitle');

const getTasks = async (req, res, next) => {
  try {
    const { completed } = req.query;
    let queryStr = 'SELECT id, title, completed, created_at, updated_at FROM tasks';
    const queryParams = [];

    if (completed !== undefined) {
      queryStr += ' WHERE completed = ?';
      queryParams.push(completed);
    }

    queryStr += ' ORDER BY created_at DESC';

    const [tasks] = await pool.query(queryStr, queryParams);
    return res.status(200).json({ status: 'success', data: tasks });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Tarea no encontrada.' });
    }

    return res.status(200).json({ status: 'success', data: rows[0] });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, completed = false } = req.body;
    const formattedTitle = title.trim().replace(/\s+/g, ' ');
    const canonicalTitle = normalizeTitle(title);

    const [result] = await pool.query(
      'INSERT INTO tasks (title, title_canonical, completed) VALUES (?, ?, ?)',
      [formattedTitle, canonicalTitle, completed]
    );

    const [newTask] = await pool.query('SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?', [result.insertId]);

    return res.status(201).json({ status: 'success', message: 'Tarea creada correctamente.', data: newTask[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'Ya existe una tarea con este mismo nombre.' });
    }
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Tarea no encontrada.' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      const formattedTitle = title.trim().replace(/\s+/g, ' ');
      const canonicalTitle = normalizeTitle(title);
      updates.push('title = ?', 'title_canonical = ?');
      values.push(formattedTitle, canonicalTitle);
    }

    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed);
    }

    values.push(id);

    await pool.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);
    const [updatedTask] = await pool.query('SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?', [id]);

    return res.status(200).json({ status: 'success', message: 'Tarea actualizada correctamente.', data: updatedTask[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'Ya existe otra tarea con este mismo nombre.' });
    }
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Tarea no encontrada.' });
    }

    return res.status(200).json({ status: 'success', message: 'Tarea eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};