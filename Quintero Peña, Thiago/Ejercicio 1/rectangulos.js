const express = require('express');
const router = express.Router();
const pool = require('./db');
const { validarRectangulo } = require('./validaciones');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM rectangulos');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM rectangulos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Rectángulo no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
});

router.post('/', validarRectangulo, async (req, res) => {
    const { lado1, lado2 } = req.body;
    const l1 = parseFloat(lado1);
    const l2 = parseFloat(lado2);

    const perimetro = 2 * (l1 + l2);
    const superficie = l1 * l2;

    try {
        const [result] = await pool.query(
            'INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)',
            [l1, l2, perimetro, superficie]
        );
        res.status(201).json({
            id: result.insertId,
            lado1: l1,
            lado2: l2,
            perimetro,
            superficie
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
});

router.put('/:id', validarRectangulo, async (req, res) => {
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
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rectángulo no encontrado' });
        }
        res.json({ id: Number(id), lado1: l1, lado2: l2, perimetro, superficie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM rectangulos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rectángulo no encontrado' });
        }
        res.json({ mensaje: 'Rectángulo eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
});

module.exports = router;
