require('dotenv').config();
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const db = require('./database');

const app = express();
app.use(express.json());

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'Error', errores: errors.array() });
    }
    next();
};

// 1. OBTENER TAREAS (Filtro por query ?completada=true/false)
app.get('/tareas',
    [
        query('completada')
            .optional()
            .isBoolean().withMessage('El filtro completada debe ser un valor booleano (true o false)')
            .toBoolean()
    ],
    validate,
    async (req, res) => {
        try {
            // Traemos el created_at que agregamos en la base de datos
            let sql = 'SELECT id, nombre, completada, created_at FROM tareas';
            const params = [];

            if (req.query.completada !== undefined) {
                sql += ' WHERE completada = ?';
                params.push(req.query.completada);
            }

            const [rows] = await db.query(sql, params);
            // Convertimos el 1/0 de MySQL a true/false para la respuesta
            const tareas = rows.map(t => ({...t, completada: !!t.completada}));
            res.json({ status: 'Exito', datos: tareas });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

// 2. CREAR TAREA
app.post('/tareas',
    [
        body('nombre')
            .trim()
            .notEmpty().withMessage('El nombre es requerido')
            .isString().withMessage('El nombre debe ser texto')
            .custom(async (value) => {
                const nombreNormalizado = value.toLowerCase();
                const [rows] = await db.query('SELECT * FROM tareas WHERE LOWER(TRIM(nombre)) = ?', [nombreNormalizado]);
                if (rows.length > 0) {
                    throw new Error('Ya existe una tarea con ese nombre');
                }
                return true;
            }),
        body('completada')
            .optional()
            .isBoolean().withMessage('El estado completada debe ser booleano')
    ],
    validate,
    async (req, res) => {
        const { nombre, completada = false } = req.body;
        const nombreLimpio = nombre.trim();

        try {
            const [result] = await db.query('INSERT INTO tareas (nombre, completada) VALUES (?, ?)', [nombreLimpio, completada]);
            res.status(201).json({ status: 'Exito', mensaje: 'Tarea creada', datos: { id: result.insertId, nombre: nombreLimpio, completada } });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

// 3. MODIFICAR TAREA
app.put('/tareas/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El id debe ser un numero entero valido'),
        body('nombre')
            .trim()
            .notEmpty().withMessage('El nombre es requerido')
            .isString().withMessage('El nombre debe ser texto')
            .custom(async (value, { req }) => {
                const nombreNormalizado = value.toLowerCase();
                const [rows] = await db.query('SELECT * FROM tareas WHERE LOWER(TRIM(nombre)) = ? AND id != ?', [nombreNormalizado, req.params.id]);
                if (rows.length > 0) {
                    throw new Error('Ya existe otra tarea con ese nombre');
                }
                return true;
            }),
        body('completada').isBoolean().withMessage('El estado completada debe ser booleano y es obligatorio al modificar')
    ],
    validate,
    async (req, res) => {
        const { id } = req.params;
        const { nombre, completada } = req.body;
        const nombreLimpio = nombre.trim();

        try {
            const [result] = await db.query('UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?', [nombreLimpio, completada, id]);
            if (result.affectedRows === 0) return res.status(404).json({ status: 'Error', mensaje: 'Tarea no encontrada' });
            res.json({ status: 'Exito', mensaje: 'Tarea actualizada', datos: { id: parseInt(id), nombre: nombreLimpio, completada } });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

// 4. ELIMINAR TAREA
app.delete('/tareas/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El id debe ser un numero entero valido')
    ],
    validate,
    async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await db.query('DELETE FROM tareas WHERE id = ?', [id]);
            if (result.affectedRows === 0) return res.status(404).json({ status: 'Error', mensaje: 'Tarea no encontrada' });
            res.json({ status: 'Exito', mensaje: 'Tarea eliminada' });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

const PORT = 3001; // Sigue en 3001 para no chocar con el Ejercicio 1
app.listen(PORT, () => {
    console.log(`Servidor de Ejercicio 2 corriendo en http://localhost:${PORT}`);
});