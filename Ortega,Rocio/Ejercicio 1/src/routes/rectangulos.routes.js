const express = require('express');
const pool = require('../db');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

// Obtener todos los rectangulos
router.get('/', async (req, res) => {
    try {
        const [rectangulos] = await pool.query(
            'SELECT * FROM rectangulos'
        );

        res.status(200).json(rectangulos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al obtener los rectangulos'
        });
    }
});

// Obtener un rectángulo por ID
router.get(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un número entero positivo')
    ],
    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        try {
            const [rectangulos] = await pool.query(
                'SELECT * FROM rectangulos WHERE id = ?',
                [req.params.id]
            );

            if (rectangulos.length === 0) {
                return res.status(404).json({
                    error: 'Rectángulo no encontrado'
                });
            }

            res.status(200).json(rectangulos[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al obtener el rectángulo'
            });
        }
    }
);

// Crear un rectángulo
router.post(
    '/',
    [
        body('base')
            .exists()
            .withMessage('La base es obligatoria')
            .isNumeric()
            .withMessage('La base debe ser numérica')
            .custom(value => Number(value) > 0)
            .withMessage('La base debe ser mayor a 0'),

        body('altura')
            .exists()
            .withMessage('La altura es obligatoria')
            .isNumeric()
            .withMessage('La altura debe ser numérica')
            .custom(value => Number(value) > 0)
            .withMessage('La altura debe ser mayor a 0'),

        body('perimetro')
            .not().exists()
            .withMessage('No se debe enviar el perímetro'),

        body('superficie')
            .not().exists()
            .withMessage('No se debe enviar la superficie')
    ],
    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        try {
            const base = Number(req.body.base);
            const altura = Number(req.body.altura);

            // El servidor calcula estos valores
            const perimetro = 2 * (base + altura);
            const superficie = base * altura;

            const [resultado] = await pool.query(
                `INSERT INTO rectangulos
                (base, altura, perimetro, superficie)
                VALUES (?, ?, ?, ?)`,
                [base, altura, perimetro, superficie]
            );

            res.status(201).json({
                id: resultado.insertId,
                base,
                altura,
                perimetro,
                superficie
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al crear el rectángulo'
            });
        }
    }
);

// Modificar un rectángulo
router.put(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un número entero positivo'),

        body('base')
            .exists()
            .withMessage('La base es obligatoria')
            .isNumeric()
            .withMessage('La base debe ser numerica')
            .custom(value => Number(value) > 0)
            .withMessage('La base debe ser mayor a 0'),

        body('altura')
            .exists()
            .withMessage('La altura es obligatoria')
            .isNumeric()
            .withMessage('La altura debe ser numérica')
            .custom(value => Number(value) > 0)
            .withMessage('La altura debe ser mayor a 0'),

        body('perimetro')
            .not().exists()
            .withMessage('No se debe enviar el perimetro'),

        body('superficie')
            .not().exists()
            .withMessage('No se debe enviar la superficie')
    ],
    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        try {
            const base = Number(req.body.base);
            const altura = Number(req.body.altura);

            const perimetro = 2 * (base + altura);
            const superficie = base * altura;

            const [resultado] = await pool.query(
                `UPDATE rectangulos
                SET base = ?, altura = ?, perimetro = ?, superficie = ?
                WHERE id = ?`,
                [base, altura, perimetro, superficie, req.params.id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Rectangulo no encontrado'
                });
            }

            res.status(200).json({
                id: Number(req.params.id),
                base,
                altura,
                perimetro,
                superficie
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al modificar el rectangulo'
            });
        }
    }
);

// Eliminar un rectangulo
router.delete(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un numero entero positivo')
    ],
    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        try {
            const [resultado] = await pool.query(
                'DELETE FROM rectangulos WHERE id = ?',
                [req.params.id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Rectangulo no encontrado'
                });
            }

            res.status(204).send();

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al eliminar el rectángulo'
            });
        }
    }
);

module.exports = router;