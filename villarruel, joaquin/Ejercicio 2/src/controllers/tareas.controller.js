const db = require('../config/database');

const obtenerTareas = async (req, res) => {
    try {
        const { estado } = req.query;

        let sql = 'SELECT id, nombre, completada FROM tareas';
        let valores = [];

        if (estado !== undefined) {
            sql += ' WHERE completada = ?';
            valores.push(estado === 'true');
        }

        const [tareas] = await db.query(sql, valores);

        res.json(tareas);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener las tareas'
        });
    }
};

const obtenerTarea = async (req, res) => {
    try {
        const { id } = req.params;

        const [tareas] = await db.query(
            'SELECT id, nombre, completada FROM tareas WHERE id = ?',
            [id]
        );

        if (tareas.length === 0) {
            return res.status(404).json({
                error: 'Tarea no encontrada'
            });
        }

        res.json(tareas[0]);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener la tarea'
        });
    }
};

const crearTarea = async (req, res) => {
    try {
        const { nombre, completada } = req.body;

        const nombreLimpio = nombre.trim();
        const nombreNormalizado = nombreLimpio.toLowerCase();

        const [resultado] = await db.query(
            `INSERT INTO tareas 
            (nombre, nombre_normalizado, completada)
            VALUES (?, ?, ?)`,
            [nombreLimpio, nombreNormalizado, completada]
        );

        res.status(201).json({
            id: resultado.insertId,
            nombre: nombreLimpio,
            completada
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe una tarea con ese nombre'
            });
        }

        res.status(500).json({
            error: 'Error al crear la tarea'
        });
    }
};

const modificarTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, completada } = req.body;

        const nombreLimpio = nombre.trim();
        const nombreNormalizado = nombreLimpio.toLowerCase();

        const [resultado] = await db.query(
            `UPDATE tareas
             SET nombre = ?, nombre_normalizado = ?, completada = ?
             WHERE id = ?`,
            [nombreLimpio, nombreNormalizado, completada, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Tarea no encontrada'
            });
        }

        res.json({
            id: Number(id),
            nombre: nombreLimpio,
            completada
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe una tarea con ese nombre'
            });
        }

        res.status(500).json({
            error: 'Error al modificar la tarea'
        });
    }
};

const eliminarTarea = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            'DELETE FROM tareas WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Tarea no encontrada'
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar la tarea'
        });
    }
};

module.exports = {
    obtenerTareas,
    obtenerTarea,
    crearTarea,
    modificarTarea,
    eliminarTarea
};