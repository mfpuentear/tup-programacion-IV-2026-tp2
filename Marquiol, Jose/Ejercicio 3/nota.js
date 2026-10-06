import express from 'express';
import { body, param, validationResult } from 'express-validator';
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

// GET /notas
router.get('/', async (req, res) => {
    try {
        const [notas] = await pool.query(`
            SELECT
                notas.id,
                alumnos.nombre AS alumno,
                materias.nombre AS materia,
                notas.nota1,
                notas.nota2,
                notas.nota3
            FROM notas
            INNER JOIN alumnos
                ON notas.alumno_id = alumnos.id
            INNER JOIN materias
                ON notas.materia_id = materias.id
        `);

        res.json(notas);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener las notas'
        });
    }
});

// GET /notas/:id
router.get(
    '/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),

    validarResultados,

    async (req, res) => {
        try {
            const [notas] = await pool.query(`
                SELECT
                    notas.id,
                    alumnos.nombre AS alumno,
                    materias.nombre AS materia,
                    notas.nota1,
                    notas.nota2,
                    notas.nota3
                FROM notas
                INNER JOIN alumnos
                    ON notas.alumno_id = alumnos.id
                INNER JOIN materias
                    ON notas.materia_id = materias.id
                WHERE notas.id = ?
            `, [req.params.id]);

            if (notas.length === 0) {
                return res.status(404).json({
                    error: 'Registro de notas no encontrado'
                });
            }

            res.json(notas[0]);
        } catch (error) {
            res.status(500).json({
                error: 'Error al obtener las notas'
            });
        }
    }
);

// POST /notas
router.post(
    '/',

    body('alumno_id')
        .exists()
        .withMessage('El alumno es obligatorio')
        .isInt({ min: 1 })
        .withMessage('El alumno debe ser un ID válido'),

    body('materia_id')
        .exists()
        .withMessage('La materia es obligatoria')
        .isInt({ min: 1 })
        .withMessage('La materia debe ser un ID válido'),

    body('nota1')
        .exists()
        .withMessage('La nota1 es obligatoria')
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota1 debe estar entre 0 y 10'),

    body('nota2')
        .exists()
        .withMessage('La nota2 es obligatoria')
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota2 debe estar entre 0 y 10'),

    body('nota3')
        .exists()
        .withMessage('La nota3 es obligatoria')
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota3 debe estar entre 0 y 10'),

    validarResultados,

    async (req, res) => {
        try {
            const {
                alumno_id,
                materia_id,
                nota1,
                nota2,
                nota3
            } = req.body;

            const [alumnos] = await pool.query(
                'SELECT id FROM alumnos WHERE id = ?',
                [alumno_id]
            );

            if (alumnos.length === 0) {
                return res.status(404).json({
                    error: 'El alumno no existe'
                });
            }

            const [materias] = await pool.query(
                'SELECT id FROM materias WHERE id = ?',
                [materia_id]
            );

            if (materias.length === 0) {
                return res.status(404).json({
                    error: 'La materia no existe'
                });
            }

            const [duplicados] = await pool.query(
                `SELECT id FROM notas
                 WHERE alumno_id = ?
                 AND materia_id = ?`,
                [alumno_id, materia_id]
            );

            if (duplicados.length > 0) {
                return res.status(409).json({
                    error: 'El alumno ya tiene notas registradas para esta materia'
                });
            }

            const [resultado] = await pool.query(
                `INSERT INTO notas
                (alumno_id, materia_id, nota1, nota2, nota3)
                VALUES (?, ?, ?, ?, ?)`,
                [alumno_id, materia_id, nota1, nota2, nota3]
            );

            res.status(201).json({
                id: resultado.insertId,
                alumno_id,
                materia_id,
                nota1,
                nota2,
                nota3
            });

        } catch (error) {
            res.status(500).json({
                error: 'Error al crear el registro de notas'
            });
        }
    }
);

// PUT /notas/:id
router.put(
    '/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),

    body('alumno_id')
        .exists()
        .withMessage('El alumno es obligatorio')
        .isInt({ min: 1 })
        .withMessage('El alumno debe ser un ID válido'),

    body('materia_id')
        .exists()
        .withMessage('La materia es obligatoria')
        .isInt({ min: 1 })
        .withMessage('La materia debe ser un ID válido'),

    body('nota1')
        .exists()
        .withMessage('La nota1 es obligatoria')
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota1 debe estar entre 0 y 10'),

    body('nota2')
        .exists()
        .withMessage('La nota2 es obligatoria')
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota2 debe estar entre 0 y 10'),

    body('nota3')
        .exists()
        .withMessage('La nota3 es obligatoria')
        .isFloat({ min: 0, max: 10 })
        .withMessage('La nota3 debe estar entre 0 y 10'),

    validarResultados,

    async (req, res) => {
        try {
            const id = req.params.id;

            const {
                alumno_id,
                materia_id,
                nota1,
                nota2,
                nota3
            } = req.body;

            const [alumnos] = await pool.query(
                'SELECT id FROM alumnos WHERE id = ?',
                [alumno_id]
            );

            if (alumnos.length === 0) {
                return res.status(404).json({
                    error: 'El alumno no existe'
                });
            }

            const [materias] = await pool.query(
                'SELECT id FROM materias WHERE id = ?',
                [materia_id]
            );

            if (materias.length === 0) {
                return res.status(404).json({
                    error: 'La materia no existe'
                });
            }

            const [duplicados] = await pool.query(
                `SELECT id FROM notas
                 WHERE alumno_id = ?
                 AND materia_id = ?
                 AND id <> ?`,
                [alumno_id, materia_id, id]
            );

            if (duplicados.length > 0) {
                return res.status(409).json({
                    error: 'El alumno ya tiene notas registradas para esta materia'
                });
            }

            const [resultado] = await pool.query(
                `UPDATE notas
                 SET alumno_id = ?,
                     materia_id = ?,
                     nota1 = ?,
                     nota2 = ?,
                     nota3 = ?
                 WHERE id = ?`,
                [
                    alumno_id,
                    materia_id,
                    nota1,
                    nota2,
                    nota3,
                    id
                ]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Registro de notas no encontrado'
                });
            }

            res.json({
                id: Number(id),
                alumno_id,
                materia_id,
                nota1,
                nota2,
                nota3
            });

        } catch (error) {
            res.status(500).json({
                error: 'Error al modificar el registro de notas'
            });
        }
    }
);

// DELETE /notas/:id
router.delete(
    '/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),

    validarResultados,

    async (req, res) => {
        try {
            const [resultado] = await pool.query(
                'DELETE FROM notas WHERE id = ?',
                [req.params.id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Registro de notas no encontrado'
                });
            }

            res.status(204).send();

        } catch (error) {
            res.status(500).json({
                error: 'Error al eliminar el registro de notas'
            });
        }
    }
);

export default router;