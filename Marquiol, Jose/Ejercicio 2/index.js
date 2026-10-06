import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import pool from './db.js';

const app = express();

app.use(express.json());

const validarResultados = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
};

// GET - Obtener todas las tareas o filtrar por estado
app.get(
    '/tareas',
    query('estado')
        .optional()
        .isIn(['pendiente', 'completada'])
        .withMessage('El estado debe ser pendiente o completada'),

    validarResultados,

    async (req, res) => {
        try {
            const { estado } = req.query;

            let consulta = 'SELECT * FROM tareas';
            let parametros = [];

            if (estado === 'pendiente') {
                consulta += ' WHERE completada = ?';
                parametros.push(false);
            }

            if (estado === 'completada') {
                consulta += ' WHERE completada = ?';
                parametros.push(true);
            }

            const [tareas] = await pool.query(consulta, parametros);

            res.json(tareas);
        } catch (error) {
            res.status(500).json({
                error: 'Error al obtener las tareas'
            });
        }
    }
);

// GET - Obtener tarea por ID
app.get(
    '/tareas/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),

    validarResultados,

    async (req, res) => {
        try {
            const [tareas] = await pool.query(
                'SELECT * FROM tareas WHERE id = ?',
                [req.params.id]
            );

            if (tareas.length === 0) {
                return res.status(404).json({
                    error: 'Tarea no encontrada'
                });
            }

            res.json(tareas[0]);
        } catch (error) {
            res.status(500).json({
                error: 'Error al obtener la tarea'
            });
        }
    }
);

// POST - Crear tarea
app.post(
    '/tareas',

    body('nombre')
        .exists()
        .withMessage('El nombre es obligatorio')
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío'),

    body('completada')
        .exists()
        .withMessage('El campo completada es obligatorio')
        .isBoolean()
        .withMessage('El campo completada debe ser booleano'),

    validarResultados,

    async (req, res) => {
        try {
            const nombre = req.body.nombre.trim();
            const completada = req.body.completada;

            const [duplicados] = await pool.query(
                `SELECT id FROM tareas
                 WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))`,
                [nombre]
            );

            if (duplicados.length > 0) {
                return res.status(409).json({
                    error: 'Ya existe una tarea con ese nombre'
                });
            }

            const [resultado] = await pool.query(
                `INSERT INTO tareas (nombre, completada)
                 VALUES (?, ?)`,
                [nombre, completada]
            );

            res.status(201).json({
                id: resultado.insertId,
                nombre,
                completada
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error al crear la tarea'
            });
        }
    }
);

// PUT - Modificar tarea
app.put(
    '/tareas/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),

    body('nombre')
        .exists()
        .withMessage('El nombre es obligatorio')
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío'),

    body('completada')
        .exists()
        .withMessage('El campo completada es obligatorio')
        .isBoolean()
        .withMessage('El campo completada debe ser booleano'),

    validarResultados,

    async (req, res) => {
        try {
            const id = req.params.id;
            const nombre = req.body.nombre.trim();
            const completada = req.body.completada;

            const [duplicados] = await pool.query(
                `SELECT id FROM tareas
                 WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))
                 AND id <> ?`,
                [nombre, id]
            );

            if (duplicados.length > 0) {
                return res.status(409).json({
                    error: 'Ya existe otra tarea con ese nombre'
                });
            }

            const [resultado] = await pool.query(
                `UPDATE tareas
                 SET nombre = ?, completada = ?
                 WHERE id = ?`,
                [nombre, completada, id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Tarea no encontrada'
                });
            }

            res.json({
                id: Number(id),
                nombre,
                completada
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error al modificar la tarea'
            });
        }
    }
);

// DELETE - Eliminar tarea
app.delete(
    '/tareas/:id',

    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),

    validarResultados,

    async (req, res) => {
        try {
            const [resultado] = await pool.query(
                'DELETE FROM tareas WHERE id = ?',
                [req.params.id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Tarea no encontrada'
                });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({
                error: 'Error al eliminar la tarea'
            });
        }
    }
);

app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});