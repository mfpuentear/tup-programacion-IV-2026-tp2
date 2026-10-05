const db = require('../db');

// Obtener todas las tareas o filtrar por estado
const obtenerTareas = async (req, res) => {
    try {
        const { estado } = req.query;
        let queryStr = 'SELECT * FROM tareas';
        let queryParams = [];

        if (estado === 'completadas') {
            queryStr += ' WHERE completada = ?';
            queryParams.push(true);
        } else if (estado === 'pendientes') {
            queryStr += ' WHERE completada = ?';
            queryParams.push(false);
        }

        const [rows] = await db.query(queryStr, queryParams);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las tareas.' });
    }
};

// Crear nueva tarea con validación estricta de unicidad
const crearTarea = async (req, res) => {
    try {
        let { nombre, completada } = req.body;
        const nombreNormalizado = nombre.trim();
        const estadoFinal = completada !== undefined ? completada : false;

        // Criterio de comparación consistente para evitar duplicados
        const [existente] = await db.query(
            'SELECT * FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))',
            [nombreNormalizado]
        );

        if (existente.length > 0) {
            return res.status(400).json({ error: 'Ya existe una tarea con ese nombre.' });
        }

        const [resultado] = await db.query(
            'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
            [nombreNormalizado, estadoFinal]
        );

        res.status(201).json({
            id: resultado.insertId,
            nombre: nombreNormalizado,
            completada: estadoFinal
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la tarea.' });
    }
};

// Actualizar tarea
const actualizarTarea = async (req, res) => {
    try {
        const { id } = req.params;
        let { nombre, completada } = req.body;
        const nombreNormalizado = nombre.trim();

        const [current] = await db.query('SELECT * FROM tareas WHERE id = ?', [id]);
        if (current.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada.' });
        }

        // Verificar unicidad excluyendo el ID actual
        const [existente] = await db.query(
            'SELECT * FROM tareas WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND id != ?',
            [nombreNormalizado, id]
        );

        if (existente.length > 0) {
            return res.status(400).json({ error: 'Ya existe otra tarea con ese nombre.' });
        }

        const estadoFinal = completada !== undefined ? completada : current[0].completada;

        await db.query(
            'UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?',
            [nombreNormalizado, estadoFinal, id]
        );

        res.json({ id: Number(id), nombre: nombreNormalizado, completada: estadoFinal });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la tarea.' });
    }
};

// Eliminar tarea
const eliminarTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado] = await db.query('DELETE FROM tareas WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada.' });
        }

        res.json({ mensaje: 'Tarea eliminada correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la tarea.' });
    }
};

module.exports = { obtenerTareas, crearTarea, actualizarTarea, eliminarTarea };