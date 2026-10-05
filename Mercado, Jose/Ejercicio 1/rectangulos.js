const express = require('express');
const router = express.Router();
const db = require('./db');
const { validarErrores, validacionesRectangulo } = require('./validaciones');

// GET: Obtener todos los rectángulos
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM rectangulos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener rectangulos' });
    }
});

// POST: Crear un nuevo rectángulo
router.post('/', validacionesRectangulo, validarErrores, async (req, res) => {
    const { base, altura } = req.body;
    try {
        const [result] = await db.query('INSERT INTO rectangulos (base, altura) VALUES (?, ?)', [base, altura]);
        res.status(201).json({ id: result.insertId, base, altura });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el rectangulo' });
    }
});

// PUT: Modificar un rectángulo existente
router.put('/:id', validacionesRectangulo, validarErrores, async (req, res) => {
    const { id } = req.params;
    const { base, altura } = req.body;
    try {
        const [result] = await db.query('UPDATE rectangulos SET base = ?, altura = ? WHERE id = ?', [base, altura, id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
        res.json({ id: parseInt(id), base, altura });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el rectángulo' });
    }
});

// DELETE: Eliminar un rectángulo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM rectangulos WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Rectángulo no encontrado' });
        res.json({ mensaje: 'Rectángulo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el rectángulo' });
    }
});

module.exports = router;