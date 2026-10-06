import express from 'express';
import mysql from 'mysql2/promise';
import { body, param, validationResult } from 'express-validator';

const app = express();
app.use(express.json());

// Conexión a la base de datos MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'altapaja', 
    database: 'tp2_programacion',
    port: 3306
});

// Función auxiliar para calcular perímetro y superficie en el servidor
const calcularPropiedades = (l1, l2) => {
    const lado1 = parseFloat(l1);
    const lado2 = parseFloat(l2);
    const perimetro = 2 * (lado1 + lado2);
    const superficie = lado1 * lado2;
    return { lado1, lado2, perimetro, superficie };
};

// Middleware para capturar errores de validación
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    next();
};

// Reglas de validación con express-validator
const rectanguloRules = [
    body('lado1')
        .exists().withMessage('El lado1 es obligatorio')
        .isFloat({ gt: 0 }).withMessage('El lado1 debe ser un número mayor a 0'),
    body('lado2')
        .exists().withMessage('El lado2 es obligatorio')
        .isFloat({ gt: 0 }).withMessage('El lado2 debe ser un número mayor a 0'),
    body('perimetro')
        .not().exists().withMessage('El perímetro no debe enviarse, se calcula automáticamente'),
    body('superficie')
        .not().exists().withMessage('La superficie no debe enviarse, se calcula automáticamente')
];

const idParamRule = [
    param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo')
];



// GET: Obtener todos los rectángulos
app.get('/api/rectangulos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM rectangulos');
        res.json({ status: 'success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// GET: Obtener un rectángulo por ID
app.get('/api/rectangulos/:id', idParamRule, validate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM rectangulos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
        }
        res.json({ status: 'success', data: rows[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// POST: Crear un nuevo rectángulo
app.post('/api/rectangulos', rectanguloRules, validate, async (req, res) => {
    try {
        const { lado1, lado2, perimetro, superficie } = calcularPropiedades(req.body.lado1, req.body.lado2);
        
        const [result] = await pool.query(
            'INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)',
            [lado1, lado2, perimetro, superficie]
        );

        res.status(201).json({
            status: 'success',
            message: 'Rectángulo creado correctamente',
            data: { id: result.insertId, lado1, lado2, perimetro, superficie }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// PUT: Modificar un rectángulo por ID
app.put('/api/rectangulos/:id', idParamRule, rectanguloRules, validate, async (req, res) => {
    try {
        const { id } = req.params;
        const [exists] = await pool.query('SELECT * FROM rectangulos WHERE id = ?', [id]);
        
        if (exists.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
        }

        const { lado1, lado2, perimetro, superficie } = calcularPropiedades(req.body.lado1, req.body.lado2);

        await pool.query(
            'UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?',
            [lado1, lado2, perimetro, superficie, id]
        );

        res.json({
            status: 'success',
            message: 'Rectángulo actualizado correctamente',
            data: { id: parseInt(id), lado1, lado2, perimetro, superficie }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// DELETE: Eliminar un rectángulo por ID
app.delete('/api/rectangulos/:id', idParamRule, validate, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM rectangulos WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Rectángulo no encontrado' });
        }
        res.json({ status: 'success', message: 'Rectángulo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});