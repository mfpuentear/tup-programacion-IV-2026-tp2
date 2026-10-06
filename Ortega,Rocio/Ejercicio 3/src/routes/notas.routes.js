const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const pool = require('../db');

const router = express.Router();

// Ver todas las notas o filtrar por estudiante o materia
router.get(
    '/',
    query('estudiante_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El estudiante_id debe ser un número entero positivo'),

    query('materia_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El materia_id debe ser un número entero positivo'),

    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        try {
            let sql = `
                SELECT
                    notas.id,
                    estudiantes.id AS estudiante_id,
                    estudiantes.nombre AS estudiante,
                    materias.id AS materia_id,
                    materias.nombre AS materia,
                    notas.nota1,
                    notas.nota2,
                    notas.nota3
                FROM notas
                INNER JOIN estudiantes
                    ON notas.estudiante_id = estudiantes.id
                INNER JOIN materias
                    ON notas.materia_id = materias.id
            `;

            const condiciones = [];
            const valores = [];

            if (req.query.estudiante_id !== undefined) {
                condiciones.push('notas.estudiante_id = ?');
                valores.push(req.query.estudiante_id);
            }

            if (req.query.materia_id !== undefined) {
                condiciones.push('notas.materia_id = ?');
                valores.push(req.query.materia_id);
            }

            if (condiciones.length > 0) {
                sql += ' WHERE ' + condiciones.join(' AND ');
            }

            const [notas] = await pool.query(sql, valores);

            res.status(200).json(notas);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al obtener las notas'
            });
        }
    }
);


// Obtener una nota por ID
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
            const [notas] = await pool.query(`
                SELECT
                    notas.id,
                    estudiantes.id AS estudiante_id,
                    estudiantes.nombre AS estudiante,
                    materias.id AS materia_id,
                    materias.nombre AS materia,
                    notas.nota1,
                    notas.nota2,
                    notas.nota3
                FROM notas
                INNER JOIN estudiantes
                    ON notas.estudiante_id = estudiantes.id
                INNER JOIN materias
                    ON notas.materia_id = materias.id
                WHERE notas.id = ?
            `, [req.params.id]);

            if (notas.length === 0) {
                return res.status(404).json({
                    mensaje: 'El registro de notas no existe'
                });
            }

            res.status(200).json(notas[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al obtener las notas'
            });
        }
    }
);


// Crear un registro de notas
router.post(
    '/',
    body('estudiante')
        .trim()
        .notEmpty()
        .withMessage('El nombre del estudiante es obligatorio')
        .isLength({ max: 255 })
        .withMessage('El nombre del estudiante no puede superar los 255 caracteres'),

    body('materia_id')
        .isInt({ min: 1 })
        .withMessage('El materia_id debe ser un número entero positivo'),

    body('notas')
        .isArray({ min: 3, max: 3 })
        .withMessage('Debe ingresar exactamente 3 notas'),

    body('notas.*')
        .isFloat({ min: 0, max: 10 })
        .withMessage('Cada nota debe ser un número entre 0 y 10'),

    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const nombreEstudiante = req.body.estudiante.trim();
        const materiaId = req.body.materia_id;
        const notas = req.body.notas;

        try {
            // Verificar que la materia exista
            const [materias] = await pool.query(
                'SELECT id, nombre FROM materias WHERE id = ?',
                [materiaId]
            );

            if (materias.length === 0) {
                return res.status(404).json({
                    mensaje: 'La materia no existe'
                });
            }

            // Buscar o crear el estudiante
            let [estudiantes] = await pool.query(
                'SELECT id, nombre FROM estudiantes WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))',
                [nombreEstudiante]
            );

            let estudianteId;

            if (estudiantes.length > 0) {
                estudianteId = estudiantes[0].id;
            } else {
                const [resultadoEstudiante] = await pool.query(
                    'INSERT INTO estudiantes (nombre) VALUES (?)',
                    [nombreEstudiante]
                );

                estudianteId = resultadoEstudiante.insertId;
            }

            // Verificar que el estudiante no tenga notas para esa materia
            const [duplicados] = await pool.query(
                'SELECT id FROM notas WHERE estudiante_id = ? AND materia_id = ?',
                [estudianteId, materiaId]
            );

            if (duplicados.length > 0) {
                return res.status(400).json({
                    mensaje: 'El estudiante ya tiene notas registradas para esa materia'
                });
            }

            const [resultado] = await pool.query(
                `INSERT INTO notas
                (estudiante_id, materia_id, nota1, nota2, nota3)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    estudianteId,
                    materiaId,
                    notas[0],
                    notas[1],
                    notas[2]
                ]
            );

            res.status(201).json({
                id: resultado.insertId,
                estudiante_id: estudianteId,
                estudiante: nombreEstudiante,
                materia_id: materiaId,
                materia: materias[0].nombre,
                notas: notas
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al crear el registro de notas'
            });
        }
    }
);


// Modificar un registro de notas
router.put(
    '/:id',
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),

    body('estudiante')
        .trim()
        .notEmpty()
        .withMessage('El nombre del estudiante es obligatorio')
        .isLength({ max: 255 })
        .withMessage('El nombre del estudiante no puede superar los 255 caracteres'),

    body('materia_id')
        .isInt({ min: 1 })
        .withMessage('El materia_id debe ser un número entero positivo'),

    body('notas')
        .isArray({ min: 3, max: 3 })
        .withMessage('Debe ingresar exactamente 3 notas'),

    body('notas.*')
        .isFloat({ min: 0, max: 10 })
        .withMessage('Cada nota debe ser un número entre 0 y 10'),

    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const id = req.params.id;
        const nombreEstudiante = req.body.estudiante.trim();
        const materiaId = req.body.materia_id;
        const notas = req.body.notas;

        try {
            // Verificar que el registro exista
            const [registro] = await pool.query(
                'SELECT id FROM notas WHERE id = ?',
                [id]
            );

            if (registro.length === 0) {
                return res.status(404).json({
                    mensaje: 'El registro de notas no existe'
                });
            }

            // Verificar que la materia exista
            const [materias] = await pool.query(
                'SELECT id, nombre FROM materias WHERE id = ?',
                [materiaId]
            );

            if (materias.length === 0) {
                return res.status(404).json({
                    mensaje: 'La materia no existe'
                });
            }

            // Buscar estudiante
            const [estudiantes] = await pool.query(
                'SELECT id FROM estudiantes WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))',
                [nombreEstudiante]
            );

            let estudianteId;

            if (estudiantes.length > 0) {
                estudianteId = estudiantes[0].id;
            } else {
                const [resultadoEstudiante] = await pool.query(
                    'INSERT INTO estudiantes (nombre) VALUES (?)',
                    [nombreEstudiante]
                );

                estudianteId = resultadoEstudiante.insertId;
            }

            // Verificar que no exista otro registro con el mismo estudiante y materia
            const [duplicados] = await pool.query(
                `SELECT id FROM notas
                 WHERE estudiante_id = ?
                 AND materia_id = ?
                 AND id <> ?`,
                [estudianteId, materiaId, id]
            );

            if (duplicados.length > 0) {
                return res.status(400).json({
                    mensaje: 'El estudiante ya tiene notas registradas para esa materia'
                });
            }

            await pool.query(
                `UPDATE notas
                 SET estudiante_id = ?,
                     materia_id = ?,
                     nota1 = ?,
                     nota2 = ?,
                     nota3 = ?
                 WHERE id = ?`,
                [
                    estudianteId,
                    materiaId,
                    notas[0],
                    notas[1],
                    notas[2],
                    id
                ]
            );

            res.status(200).json({
                id: Number(id),
                estudiante_id: estudianteId,
                estudiante: nombreEstudiante,
                materia_id: materiaId,
                materia: materias[0].nombre,
                notas: notas
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al modificar el registro de notas'
            });
        }
    }
);


// Eliminar un registro de notas
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
                'DELETE FROM notas WHERE id = ?',
                [req.params.id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'El registro de notas no existe'
                });
            }

            res.status(204).send();

        } catch (error) {
            console.error(error);
            res.status(500).json({
                mensaje: 'Error al eliminar el registro de notas'
            });
        }
    }
);

module.exports = router;