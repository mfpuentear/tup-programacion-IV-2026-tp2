const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const pool = require('../db');

const router = express.Router();

// Mostrar todas las tareas o filtrar por estado
router.get(
    '/',
    query('completada')
        .optional()
        .isBoolean()
        .withMessage('El filtro completada debe ser true o false'),
    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        try {
            let sql = 'SELECT id, nombre, completada FROM tareas';
            let valores = [];

            if (req.query.completada !== undefined) {
                sql += ' WHERE completada = ?';
                valores.push(req.query.completada === 'true');
            }

            const [tareas] = await pool.query(sql, valores);

            const resultado = tareas.map(tarea => ({
                id: tarea.id,
                nombre: tarea.nombre,
                completada: Boolean(tarea.completada)
            }));

            res.status(200).json(resultado);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al obtener las tareas'
            });
        }
    }
);

// Obtener una tarea por ID
router.get(
    '/:id',
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        try {
            const [tareas] = await pool.query(
                'SELECT id, nombre, completada FROM tareas WHERE id = ?',
                [req.params.id]
            );

            if (tareas.length === 0) {
                return res.status(404).json({
                    mensaje: 'La tarea no existe'
                });
            }

            const tarea = tareas[0];

            res.status(200).json({
                id: tarea.id,
                nombre: tarea.nombre,
                completada: Boolean(tarea.completada)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al obtener la tarea'
            });
        }
    }
);

// Crear una tarea
router.post(
    '/',
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ max: 255 })
        .withMessage('El nombre no puede superar los 255 caracteres'),

    body('completada')
        .isBoolean()
        .withMessage('El estado completada debe ser true o false'),

    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const nombre = req.body.nombre.trim();
        const completada = req.body.completada;

        try {
            const nombreNormalizado = nombre.toLowerCase();

            const [duplicados] = await pool.query(
                'SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ?',
                [nombreNormalizado]
            );

            if (duplicados.length > 0) {
                return res.status(400).json({
                    mensaje: 'Ya existe una tarea con ese nombre'
                });
            }

            const [resultado] = await pool.query(
                'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
                [nombre, completada]
            );

            res.status(201).json({
                id: resultado.insertId,
                nombre: nombre,
                completada: Boolean(completada)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al crear la tarea'
            });
        }
    }
);

// Modificar una tarea
router.put(
    '/:id',
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),

    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ max: 255 })
        .withMessage('El nombre no puede superar los 255 caracteres'),

    body('completada')
        .isBoolean()
        .withMessage('El estado completada debe ser true o false'),

    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const id = req.params.id;
        const nombre = req.body.nombre.trim();
        const completada = req.body.completada;

        try {
            const [tarea] = await pool.query(
                'SELECT id FROM tareas WHERE id = ?',
                [id]
            );

            if (tarea.length === 0) {
                return res.status(404).json({
                    mensaje: 'La tarea no existe'
                });
            }

            const nombreNormalizado = nombre.toLowerCase();

            const [duplicados] = await pool.query(
                'SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ? AND id <> ?',
                [nombreNormalizado, id]
            );

            if (duplicados.length > 0) {
                return res.status(400).json({
                    mensaje: 'Ya existe otra tarea con ese nombre'
                });
            }

            await pool.query(
                'UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?',
                [nombre, completada, id]
            );

            res.status(200).json({
                id: Number(id),
                nombre: nombre,
                completada: Boolean(completada)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al modificar la tarea'
            });
        }
    }
);

// Eliminar una tarea
router.delete(
    '/:id',
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        try {
            const [resultado] = await pool.query(
                'DELETE FROM tareas WHERE id = ?',
                [req.params.id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'La tarea no existe'
                });
            }

            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al eliminar la tarea'
            });
        }
    }
);

module.exports = router;