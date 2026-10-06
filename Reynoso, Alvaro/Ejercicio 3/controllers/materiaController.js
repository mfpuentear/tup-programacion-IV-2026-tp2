const db = require('../config/db');


// Obtener todas las materias
const obtenerTodas = async (req, res) => {
    try {
        const [resultado] = await db.promise().query(
            'SELECT * FROM materias ORDER BY nombre'
        );

        res.status(200).json(resultado);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener las materias'
        });
    }
};


// Obtener una materia
const obtenerUna = async (req, res) => {
    try {
        const [resultado] = await db.promise().execute(
            'SELECT * FROM materias WHERE id = ?',
            [req.params.id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                error: 'Materia no encontrada'
            });
        }

        res.status(200).json(resultado[0]);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener la materia'
        });
    }
};


// Crear materia
const crear = async (req, res) => {
    try {
        const nombre = req.body.nombre.trim();

        const [existente] = await db.promise().execute(
            'SELECT id FROM materias WHERE LOWER(nombre) = LOWER(?)',
            [nombre]
        );

        if (existente.length > 0) {
            return res.status(409).json({
                error: 'La materia ya existe'
            });
        }

        const [resultado] = await db.promise().execute(
            'INSERT INTO materias (nombre) VALUES (?)',
            [nombre]
        );

        res.status(201).json({
            mensaje: 'Materia creada correctamente',
            id: resultado.insertId,
            nombre
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al crear la materia'
        });
    }
};


// Modificar materia
const modificar = async (req, res) => {
    try {
        const nombre = req.body.nombre.trim();

        const [existente] = await db.promise().execute(
            `SELECT id
             FROM materias
             WHERE LOWER(nombre) = LOWER(?)
             AND id <> ?`,
            [nombre, req.params.id]
        );

        if (existente.length > 0) {
            return res.status(409).json({
                error: 'Ya existe otra materia con ese nombre'
            });
        }

        const [resultado] = await db.promise().execute(
            'UPDATE materias SET nombre = ? WHERE id = ?',
            [nombre, req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Materia no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Materia modificada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al modificar la materia'
        });
    }
};


// Eliminar materia
const eliminar = async (req, res) => {
    try {
        const [resultado] = await db.promise().execute(
            'DELETE FROM materias WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Materia no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Materia eliminada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar la materia'
        });
    }
};


module.exports = {
    obtenerTodas,
    obtenerUna,
    crear,
    modificar,
    eliminar
};