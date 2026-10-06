const pool = require('../config/db');

const getTareas = async (req, res) => {
    try {
        const { estado } = req.query;
        let querySql = 'SELECT * FROM tareas';
        const params = [];

        if (estado === 'completadas') {
            querySql += ' WHERE estado = TRUE';
        } else if (estado === 'pendientes') {
            querySql += ' WHERE estado = FALSE';
        }

        querySql += ' ORDER BY created_at DESC';

        const [rows] = await pool.query(querySql, params);

        return res.status(200).json({
            status: 'success',
            count: rows.length,
            data: rows
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener las tareas',
            error: error.message
        });
    }
};

const getTareaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM tareas WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `No se encontró ninguna tarea con el ID ${id}`
            });
        }

        return res.status(200).json({
            status: 'success',
            data: rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener la tarea',
            error: error.message
        });
    }
};

const createTarea = async (req, res) => {
    try {
        const { nombre, estado = false } = req.body;

        const [result] = await pool.query(
            'INSERT INTO tareas (nombre, estado) VALUES (?, ?)',
            [nombre.trim(), estado]
        );

        return res.status(201).json({
            status: 'success',
            message: 'Tarea creada exitosamente',
            data: {
                id: result.insertId,
                nombre: nombre.trim(),
                estado
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al crear la tarea',
            error: error.message
        });
    }
};

const updateTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, estado } = req.body;

        const [existing] = await pool.query('SELECT id FROM tareas WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `No existe una tarea con el ID ${id}`
            });
        }

        await pool.query(
            'UPDATE tareas SET nombre = ?, estado = ? WHERE id = ?',
            [nombre.trim(), estado, id]
        );

        return res.status(200).json({
            status: 'success',
            message: 'Tarea actualizada exitosamente',
            data: {
                id: Number(id),
                nombre: nombre.trim(),
                estado
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar la tarea',
            error: error.message
        });
    }
};

const deleteTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM tareas WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: `No existe una tarea con el ID ${id}`
            });
        }

        return res.status(200).json({
            status: 'success',
            message: `Tarea con ID ${id} eliminada correctamente`
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar la tarea',
            error: error.message
        });
    }
};

module.exports = {
    getTareas,
    getTareaById,
    createTarea,
    updateTarea,
    deleteTarea
};
