import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const validarNombreUnico = async (value, { req }) => {
    if (!value) return true; 
    
    const nombreLimpio = value.trim().toLowerCase(); 
    let sql = 'SELECT id FROM tarea WHERE LOWER(TRIM(nombre)) = ?';
    let params = [nombreLimpio];

    if (req.params && req.params.id) {
        sql += ' AND id != ?';
        params.push(req.params.id);
    }

    const [rows] = await db.query(sql, params);
    if (rows.length > 0) throw new Error('Ya existe una tarea con exactamente este nombre');
    return true;
};

const validacionesTarea = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre de la tarea es obligatorio')
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .custom(validarNombreUnico),
    body('completada')
        .optional()
        .isBoolean().withMessage('El estado completada debe ser un booleano (true/false)')
];

const validacionId = [
    param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo')
];

app.get('/api/tareas', 
    query('estado').optional().isIn(['completada', 'pendiente']).withMessage('Estado inválido. Use "completada" o "pendiente"'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

        const estado = req.query.estado;
        let sql = 'SELECT * FROM tarea';
        let params = [];

        if (estado === 'completada') {
            sql += ' WHERE completada = true';
        } else if (estado === 'pendiente') {
            sql += ' WHERE completada = false';
        }

        try {
            const [rows] = await db.query(sql, params);
            const tareas = rows.map(t => ({ ...t, completada: !!t.completada }));
            res.json(tareas);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las tareas' });
        }
    }
);

app.post('/api/tareas', validacionesTarea, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

    const nombre = req.body.nombre.trim();
    const completada = req.body.completada !== undefined ? req.body.completada : false;

    try {
        const [result] = await db.execute(
            'INSERT INTO tarea (nombre, completada) VALUES (?, ?)', 
            [nombre, completada]
        );
        res.status(201).json({ id: result.insertId, nombre, completada });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la tarea' });
    }
});

app.put('/api/tareas/:id', [...validacionId, ...validacionesTarea], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

    const id = req.params.id;
    const nombre = req.body.nombre.trim();
    const completada = req.body.completada !== undefined ? req.body.completada : false;

    try {
        const [result] = await db.execute(
            'UPDATE tarea SET nombre = ?, completada = ? WHERE id = ?',
            [nombre, completada, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json({ id: parseInt(id), nombre, completada });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
});

app.delete('/api/tareas/:id', validacionId, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

    try {
        const [result] = await db.execute('DELETE FROM tarea WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

app.listen(PORT, () => {    
    console.log(`API de Tareas corriendo en http://localhost:${PORT}`);
});