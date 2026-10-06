import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { body, param, validationResult } from 'express-validator';

dotenv.config();

const app = express();
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const validarResultados = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
};

// GET - Obtener todos los rectángulos
app.get('/rectangulos', async (req, res) => {
    try {
        const [rectangulos] = await pool.query(
            'SELECT * FROM rectangulos'
        );

        res.json(rectangulos);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener los rectángulos'
        });
    }
});

// GET - Obtener un rectángulo por ID
app.get(
    '/rectangulos/:id',
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    validarResultados,
    async (req, res) => {
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

            res.json(rectangulos[0]);
        } catch (error) {
            res.status(500).json({
                error: 'Error al obtener el rectángulo'
            });
        }
    }
);

// POST - Crear un rectángulo
app.post(
    '/rectangulos',
    body('lado1')
        .exists()
        .withMessage('El lado1 es obligatorio')
        .isFloat({ gt: 0 })
        .withMessage('El lado1 debe ser un número mayor que 0'),

    body('lado2')
        .exists()
        .withMessage('El lado2 es obligatorio')
        .isFloat({ gt: 0 })
        .withMessage('El lado2 debe ser un número mayor que 0'),

    validarResultados,

    async (req, res) => {
        try {
            const { lado1, lado2 } = req.body;

            const perimetro = 2 * (Number(lado1) + Number(lado2));
            const superficie = Number(lado1) * Number(lado2);

            const [resultado] = await pool.query(
                `INSERT INTO rectangulos
                (lado1, lado2, perimetro, superficie)
                VALUES (?, ?, ?, ?)`,
                [lado1, lado2, perimetro, superficie]
            );

            res.status(201).json({
                id: resultado.insertId,
                lado1: Number(lado1),
                lado2: Number(lado2),
                perimetro,
                superficie
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error al crear el rectángulo'
            });
        }
    }
);

// PUT - Modificar un rectángulo
app.put(
    '/rectangulos/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),

    body('lado1')
        .exists()
        .withMessage('El lado1 es obligatorio')
        .isFloat({ gt: 0 })
        .withMessage('El lado1 debe ser un número mayor que 0'),

    body('lado2')
        .exists()
        .withMessage('El lado2 es obligatorio')
        .isFloat({ gt: 0 })
        .withMessage('El lado2 debe ser un número mayor que 0'),

    validarResultados,

    async (req, res) => {
        try {
            const { id } = req.params;
            const { lado1, lado2 } = req.body;

            const perimetro = 2 * (Number(lado1) + Number(lado2));
            const superficie = Number(lado1) * Number(lado2);

            const [resultado] = await pool.query(
                `UPDATE rectangulos
                SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ?
                WHERE id = ?`,
                [lado1, lado2, perimetro, superficie, id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Rectángulo no encontrado'
                });
            }

            res.json({
                id: Number(id),
                lado1: Number(lado1),
                lado2: Number(lado2),
                perimetro,
                superficie
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error al modificar el rectángulo'
            });
        }
    }
);

// DELETE - Eliminar un rectángulo
app.delete(
    '/rectangulos/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),

    validarResultados,

    async (req, res) => {
        try {
            const [resultado] = await pool.query(
                'DELETE FROM rectangulos WHERE id = ?',
                [req.params.id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Rectángulo no encontrado'
                });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({
                error: 'Error al eliminar el rectángulo'
            });
        }
    }
);

app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});