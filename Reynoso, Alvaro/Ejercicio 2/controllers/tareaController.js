const db = require('../config/db');


// Obtener todas las tareas
const obtenerTodas = async (req, res) => {
    try {
        const [resultado] = await db.promise().query(
            'SELECT * FROM tareas'
        );

        res.status(200).json(resultado);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener las tareas'
        });
    }
};


// Obtener una tarea por ID
const obtenerUna = async (req, res) => {
    try {
        const [resultado] = await db.promise().execute(
            'SELECT * FROM tareas WHERE id = ?',
            [req.params.id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                error: 'Tarea no encontrada'
            });
        }

        res.status(200).json(resultado[0]);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener la tarea'
        });
    }
};


// Crear una tarea
const crear = async (req, res) => {
    try {
        const nombre = req.body.nombre.trim();
        const completada = req.body.completada;

        const [existente] = await db.promise().execute(
            'SELECT id FROM tareas WHERE LOWER(nombre) = LOWER(?)',
            [nombre]
        );

        if (existente.length > 0) {
            return res.status(409).json({
                error: 'Ya existe una tarea con ese nombre'
            });
        }

        const [resultado] = await db.promise().execute(
            `INSERT INTO tareas (nombre, completada)
             VALUES (?, ?)`,
            [nombre, completada]
        );

        res.status(201).json({
            mensaje: 'Tarea creada correctamente',
            id: resultado.insertId,
            nombre,
            completada
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al crear la tarea'
        });
    }
};


// Modificar una tarea
const modificar = async (req, res) => {
    try {
        const nombre = req.body.nombre.trim();
        const completada = req.body.completada;

        const [existente] = await db.promise().execute(
            `SELECT id FROM tareas
             WHERE LOWER(nombre) = LOWER(?)
             AND id <> ?`,
            [nombre, req.params.id]
        );

        if (existente.length > 0) {
            return res.status(409).json({
                error: 'Ya existe otra tarea con ese nombre'
            });
        }

        const [resultado] = await db.promise().execute(
            `UPDATE tareas
             SET nombre = ?, completada = ?
             WHERE id = ?`,
            [nombre, completada, req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Tarea no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Tarea modificada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al modificar la tarea'
        });
    }
};


// Eliminar una tarea
const eliminar = async (req, res) => {
    try {
        const [resultado] = await db.promise().execute(
            'DELETE FROM tareas WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Tarea no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Tarea eliminada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar la tarea'
        });
    }
};


// Filtrar tareas por estado
const filtrarPorEstado = async (req, res) => {
    try {
        const completada = req.query.completada === 'true';

        const [resultado] = await db.promise().execute(
            'SELECT * FROM tareas WHERE completada = ?',
            [completada]
        );

        res.status(200).json(resultado);

    } catch (error) {
        res.status(500).json({
            error: 'Error al filtrar las tareas'
        });
    }
};


module.exports = {
    obtenerTodas,
    obtenerUna,
    crear,
    modificar,
    eliminar,
    filtrarPorEstado
};