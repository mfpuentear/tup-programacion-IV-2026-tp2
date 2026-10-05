const express = require('express');
const router = express.Router();
const db = require('./db');
const { validacionesTarea, validacionFiltro, validarErrores } = require('./validaciones');

router.get('/', validacionFiltro, validarErrores, async (req, res) => {
    const { estado } = req.query;
    let sql = 'SELECT * FROM tareas';
    let params = [];

    if (estado === 'completadas') {
        sql += ' WHERE completada = ?';
        params.push(true);
    } else if (estado === 'pendientes') {
        sql += ' WHERE completada = ?';
        params.push(false);
    }

    try {
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
});

router.post('/', validacionesTarea, validarErrores, async (req, res) => {
    const { nombre, completada = false } = req.body;
    try {
        const [result] = await db.query('INSERT INTO tareas (nombre, completada) VALUES (?, ?)', [nombre, completada]);
        res.status(201).json({ id: result.insertId, nombre, completada });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una tarea con ese nombre' });
        }
        res.status(500).json({ error: 'Error al crear la tarea' });
    }
});

router.put('/:id', validacionesTarea, validarErrores, async (req, res) => {
    const { id } = req.params;
    const { nombre, completada } = req.body;
    try {
        const [result] = await db.query('UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?', [nombre, completada, id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json({ id: parseInt(id), nombre, completada });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe otra tarea con ese nombre' });
        res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
});

module.exports = router;