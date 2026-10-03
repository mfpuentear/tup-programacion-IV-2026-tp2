const express = require('express');
const mysql = require('mysql2/promise');
const { body, param, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Ajusta tu contraseña de MySQL si corresponde
    database: 'tp2_ejercicio1'
});

// Middleware para capturar errores de express-validator
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    next();
};

// GET /api/rectangulos - Listar todos
app.get('/api/rectangulos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM rectangulos');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error en la base de datos' });
    }
});

// GET /api/rectangulos/:id - Obtener uno por ID
app.get('/api/rectangulos/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
        handleValidation
    ],
    async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM rectangulos WHERE id = ?', [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }
);

// POST /api/rectangulos - Crear un rectángulo
app.post('/api/rectangulos',
    [
        body('lado1').isFloat({ gt: 0 }).withMessage('El lado 1 debe ser un número mayor a 0'),
        body('lado2').isFloat({ gt: 0 }).withMessage('El lado 2 debe ser un número mayor a 0'),
        handleValidation
    ],
    async (req, res) => {
        const { lado1, lado2 } = req.body;
        const l1 = parseFloat(lado1);
        const l2 = parseFloat(lado2);

        // Cálculos realizados del lado del servidor
        const perimetro = 2 * (l1 + l2);
        const superficie = l1 * l2;

        try {
            const [result] = await pool.query(
                'INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)',
                [l1, l2, perimetro, superficie]
            );
            res.status(201).json({ id: result.insertId, lado1: l1, lado2: l2, perimetro, superficie });
        } catch (err) {
            res.status(500).json({ error: 'Error al insertar en la base de datos' });
        }
    }
);

// PUT /api/rectangulos/:id - Modificar un rectángulo
app.put('/api/rectangulos/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
        body('lado1').isFloat({ gt: 0 }).withMessage('El lado 1 debe ser un número mayor a 0'),
        body('lado2').isFloat({ gt: 0 }).withMessage('El lado 2 debe ser un número mayor a 0'),
        handleValidation
    ],
    async (req, res) => {
        const { id } = req.params;
        const { lado1, lado2 } = req.body;
        const l1 = parseFloat(lado1);
        const l2 = parseFloat(lado2);

        const perimetro = 2 * (l1 + l2);
        const superficie = l1 * l2;

        try {
            const [result] = await pool.query(
                'UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?',
                [l1, l2, perimetro, superficie, id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
            res.json({ id: Number(id), lado1: l1, lado2: l2, perimetro, superficie });
        } catch (err) {
            res.status(500).json({ error: 'Error al actualizar' });
        }
    }
);

// DELETE /api/rectangulos/:id - Eliminar
app.delete('/api/rectangulos/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
        handleValidation
    ],
    async (req, res) => {
        try {
            const [result] = await pool.query('DELETE FROM rectangulos WHERE id = ?', [req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
            res.json({ mensaje: 'Rectángulo eliminado correctamente' });
        } catch (err) {
            res.status(500).json({ error: 'Error al eliminar' });
        }
    }
);

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));