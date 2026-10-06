import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from './db.js';

const router = express.Router();

const validarResultados = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
};

// GET /materias
router.get('/', async (req, res) => {
    try {
        const [materias] = await pool.query(
            'SELECT * FROM materias'
        );

        res.json(materias);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener las materias'
        });
    }
});

// POST /materias
router.post(
    '/',
    body('nombre')
        .exists()
        .withMessage('El nombre es obligatorio')
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío'),

    validarResultados,

    async (req, res) => {
        try {
            const nombre = req.body.nombre.trim();

            const [resultado] = await pool.query(
                'INSERT INTO materias (nombre) VALUES (?)',
                [nombre]
            );

            res.status(201).json({
                id: resultado.insertId,
                nombre
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error al crear la materia'
            });
        }
    }
);

export default router;