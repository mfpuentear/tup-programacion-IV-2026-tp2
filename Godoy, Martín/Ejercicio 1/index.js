
import express from 'express';
import { body, param, validationResult } from 'express-validator';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const validarLados = [
    body('lado1')
        .exists().withMessage('El lado 1 es requerido')
        .isNumeric().withMessage('El lado 1 debe ser un número')
        .isFloat({ gt: 0 }).withMessage('El lado 1 debe ser mayor a cero'),
    body('lado2')
        .exists().withMessage('El lado 2 es requerido')
        .isNumeric().withMessage('El lado 2 debe ser un número')
        .isFloat({ gt: 0 }).withMessage('El lado 2 debe ser mayor a cero')
];

app.post('/api/rectangulos', validarLados, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const lado1 = parseFloat(req.body.lado1);
    const lado2 = parseFloat(req.body.lado2);

    const perimetro = (lado1 * 2) + (lado2 * 2);
    const superficie = lado1 * lado2;

    try {
        const query = 'INSERT INTO rectangulo (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)';
        const [resultado] = await db.execute(query, [lado1, lado2, perimetro, superficie]);
        
        res.status(201).json({
            id: resultado.insertId,
            lado1,
            lado2,
            perimetro,
            superficie
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar en la base de datos' });
    }
});

const validarId = [
    param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo')
];

app.get('/api/rectangulos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM rectangulo');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

app.get('/api/rectangulos/:id', validarId, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

    try {
        const [rows] = await db.query('SELECT * FROM rectangulo WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error de base de datos' });
    }
});

app.put('/api/rectangulos/:id', [...validarId, ...validarLados], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

    const lado1 = parseFloat(req.body.lado1);
    const lado2 = parseFloat(req.body.lado2);
    const perimetro = (lado1 * 2) + (lado2 * 2);
    const superficie = lado1 * lado2;
    const id = req.params.id;

    try {
        const [result] = await db.execute(
            'UPDATE rectangulo SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?',
            [lado1, lado2, perimetro, superficie, id]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
        
        res.json({ id: parseInt(id), lado1, lado2, perimetro, superficie });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

app.delete('/api/rectangulos/:id', validarId, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

    try {
        const [result] = await db.execute('DELETE FROM rectangulo WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
        
        res.status(204).send(); // 204 significa "No Content" (éxito, pero sin cuerpo de respuesta)
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de la API corriendo en http://localhost:${PORT}`);
});