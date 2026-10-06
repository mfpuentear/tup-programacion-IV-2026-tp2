require('dotenv').config();
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const db = require('./database');

const app = express();
app.use(express.json());

// Middleware de manejo de errores de express-validator
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'Error', errores: errors.array() });
    }
    next();
};

// Middleware para rechazar perimetro o superficie provenientes del cliente
const forbidCalculatedFields = (req, res, next) => {
    if (req.body.perimetro !== undefined || req.body.superficie !== undefined) {
        return res.status(400).json({
            status: 'Error',
            mensaje: 'No esta permitido enviar perimetro ni superficie. Se calculan en el servidor.'
        });
    }
    next();
};

// 1. LISTAR RECTANGULOS
app.get('/rectangulos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM rectangulos');
        res.json({ status: 'Exito', datos: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', mensaje: error.message });
    }
});

// 2. OBTENER RECTANGULO POR ID
app.get('/rectangulos/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El id debe ser un numero entero mayor a 0')
    ],
    validate,
    async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await db.query('SELECT * FROM rectangulos WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ status: 'Error', mensaje: 'Rectangulo no encontrado' });
            }
            res.json({ status: 'Exito', datos: rows[0] });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

// 3. CREAR RECTANGULO
app.post('/rectangulos',
    forbidCalculatedFields,
    [
        body('lado_a').isFloat({ gt: 0 }).withMessage('lado_a es requerido y debe ser un numero positivo mayor a 0'),
        body('lado_b').isFloat({ gt: 0 }).withMessage('lado_b es requerido y debe ser un numero positivo mayor a 0')
    ],
    validate,
    async (req, res) => {
        const { lado_a, lado_b } = req.body;
        
        // Calculos en servidor
        const a = parseFloat(lado_a);
        const b = parseFloat(lado_b);
        const perimetro = (a * 2) + (b * 2);
        const superficie = a * b;

        try {
            const [result] = await db.query(
                'INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)',
                [a, b, perimetro, superficie]
            );
            res.status(201).json({
                status: 'Exito',
                mensaje: 'Rectangulo creado correctamente',
                datos: { id: result.insertId, lado_a: a, lado_b: b, perimetro, superficie }
            });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

// 4. MODIFICAR RECTANGULO
app.put('/rectangulos/:id',
    forbidCalculatedFields,
    [
        param('id').isInt({ min: 1 }).withMessage('El id debe ser un numero entero mayor a 0'),
        body('lado_a').isFloat({ gt: 0 }).withMessage('lado_a es requerido y debe ser un numero positivo mayor a 0'),
        body('lado_b').isFloat({ gt: 0 }).withMessage('lado_b es requerido y debe ser un numero positivo mayor a 0')
    ],
    validate,
    async (req, res) => {
        const { id } = req.params;
        const { lado_a, lado_b } = req.body;

        const a = parseFloat(lado_a);
        const b = parseFloat(lado_b);
        const perimetro = (a * 2) + (b * 2);
        const superficie = a * b;

        try {
            const [result] = await db.query(
                'UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?',
                [a, b, perimetro, superficie, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ status: 'Error', mensaje: 'Rectangulo no encontrado' });
            }

            res.json({
                status: 'Exito',
                mensaje: 'Rectangulo actualizado correctamente',
                datos: { id: parseInt(id), lado_a: a, lado_b: b, perimetro, superficie }
            });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

// 5. ELIMINAR RECTANGULO
app.delete('/rectangulos/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El id debe ser un numero entero mayor a 0')
    ],
    validate,
    async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await db.query('DELETE FROM rectangulos WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ status: 'Error', mensaje: 'Rectangulo no encontrado' });
            }
            res.json({ status: 'Exito', mensaje: 'Rectangulo eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor del Ejercicio 1 corriendo en http://localhost:${PORT}`);
});