const express = require('express');
const router = express.Router();
const db = require('./db');
const { validarErrores, validacionesCalificacion, validacionId } = require('./validaciones');

// GET: Obtener todas las calificaciones con el nombre de la materia
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.id, c.alumno_nombre, m.nombre AS materia, c.nota1, c.nota2, c.nota3 
            FROM calificaciones c 
            JOIN materias m ON c.materia_id = m.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
});

// POST: Crear registro de calificaciones
router.post('/', validacionesCalificacion, validarErrores, async (req, res) => {
    const { alumno_nombre, materia_id, nota1, nota2, nota3 } = req.body;
    try {
        const [materiaCheck] = await db.query('SELECT * FROM materias WHERE id = ?', [materia_id]);
        if (materiaCheck.length === 0) return res.status(404).json({ error: 'La materia no existe' });

        const [result] = await db.query(
            'INSERT INTO calificaciones (alumno_nombre, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
            [alumno_nombre, materia_id, nota1, nota2, nota3]
        );
        res.status(201).json({ id: result.insertId, alumno_nombre, materia_id, nota1, nota2, nota3 });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Registro duplicado para este alumno en la materia' });
        res.status(500).json({ error: 'Error al guardar la calificación' });
    }
});

// PUT: Modificar calificaciones
router.put('/:id', [...validacionId, ...validacionesCalificacion], validarErrores, async (req, res) => {
    const { id } = req.params;
    const { alumno_nombre, materia_id, nota1, nota2, nota3 } = req.body;
    try {
        const [materiaCheck] = await db.query('SELECT * FROM materias WHERE id = ?', [materia_id]);
        if (materiaCheck.length === 0) return res.status(404).json({ error: 'La materia no existe' });

        const [result] = await db.query(
            'UPDATE calificaciones SET alumno_nombre = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
            [alumno_nombre, materia_id, nota1, nota2, nota3, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
        res.json({ id: parseInt(id), alumno_nombre, materia_id, nota1, nota2, nota3 });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Registro duplicado' });
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

// DELETE: Eliminar calificación
router.delete('/:id', validacionId, validarErrores, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM calificaciones WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
        res.json({ mensaje: 'Calificación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

module.exports = router;