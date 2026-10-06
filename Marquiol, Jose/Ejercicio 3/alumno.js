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

// GET /alumnos
router.get('/', async (req, res) => {
    try {
        const [alumnos] = await pool.query(
            'SELECT * FROM alumnos'
        );

        res.json(alumnos);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener los alumnos'
        });
    }
});

// POST /alumnos
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
                'INSERT INTO alumnos (nombre) VALUES (?)',
                [nombre]
            );

            res.status(201).json({
                id: resultado.insertId,
                nombre
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error al crear el alumno'
            });
        }
    }
);

export default router;