const db = require('../database');

// Obtener todas las tareas (con filtro opcional por estado completed)
exports.getAllTasks = async (req, res) => {
  try {
    const { completed } = req.query;
    let query = 'SELECT * FROM tasks';
    const params = [];

    if (completed !== undefined) {
      query += ' WHERE completed = ?';
      params.push(completed === 'true' ? 1 : 0);
    }

    const [rows] = await db.query(query, params);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Obtener tarea por ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Tarea no encontrada' });
    }

    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Crear una nueva tarea (validando título duplicado)
exports.createTask = async (req, res) => {
  try {
    const { title, description, completed = false } = req.body;

    // Verificar duplicados ignorando mayúsculas/minúsculas y espacios
    const [existing] = await db.query(
      'SELECT id FROM tasks WHERE LOWER(TRIM(title)) = LOWER(TRIM(?))',
      [title]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Ya existe una tarea con el mismo nombre'
      });
    }

    const [result] = await db.query(
      'INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)',
      [title.trim(), description || null, completed ? 1 : 0]
    );

    const [newTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json({ status: 'success', data: newTask[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Actualizar una tarea por ID
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const [existingTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existingTask.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Tarea no encontrada' });
    }

    // Si se envía un título nuevo, verificar que no esté duplicado en otra tarea
    if (title) {
      const [duplicate] = await db.query(
        'SELECT id FROM tasks WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND id != ?',
        [title, id]
      );
      if (duplicate.length > 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Ya existe otra tarea con el mismo nombre'
        });
      }
    }

    const updatedTitle = title !== undefined ? title.trim() : existingTask[0].title;
    const updatedDesc = description !== undefined ? description : existingTask[0].description;
    const updatedCompleted = completed !== undefined ? (completed ? 1 : 0) : existingTask[0].completed;

    await db.query(
      'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?',
      [updatedTitle, updatedDesc, updatedCompleted, id]
    );

    const [updatedTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json({ status: 'success', data: updatedTask[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Eliminar tarea por ID
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'fail', message: 'Tarea no encontrada' });
    }

    res.json({ status: 'success', message: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};