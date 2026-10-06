require('dotenv').config();
const express = require('express');
const { body, param, validationResult } = require('express-validator');
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

// Validaciones reutilizables
const validacionesCalificacion = [
    body('alumno')
        .trim()
        .notEmpty().withMessage('El nombre del alumno es requerido')
        .isString().withMessage('El nombre debe ser texto'),
    body('materia_id')
        .isInt({ min: 1 }).withMessage('El ID de la materia debe ser un numero valido')
        .custom(async (value) => {
            const [rows] = await db.query('SELECT id FROM materias WHERE id = ?', [value]);
            if (rows.length === 0) {
                throw new Error('La materia indicada no existe');
            }
            return true;
        }),
    body('nota1').isFloat({ min: 1, max: 10 }).withMessage('La nota 1 debe estar entre 1 y 10'),
    body('nota2').isFloat({ min: 1, max: 10 }).withMessage('La nota 2 debe estar entre 1 y 10'),
    body('nota3').isFloat({ min: 1, max: 10 }).withMessage('La nota 3 debe estar entre 1 y 10')
];

// 1. OBTENER CALIFICACIONES (Hacemos JOIN para mostrar el nombre de la materia)
app.get('/calificaciones', async (req, res) => {
    try {
        const sql = `
            SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3 
            FROM calificaciones c
            JOIN materias m ON c.materia_id = m.id
        `;
        const [rows] = await db.query(sql);
        res.json({ status: 'Exito', datos: rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', mensaje: error.message });
    }
});

// 2. CREAR CALIFICACION
app.post('/calificaciones',
    [
        ...validacionesCalificacion,
        body().custom(async (value, { req }) => {
            const alumno = req.body.alumno ? req.body.alumno.trim().toLowerCase() : '';
            const materia_id = req.body.materia_id;
            const [rows] = await db.query(
                'SELECT * FROM calificaciones WHERE LOWER(TRIM(alumno)) = ? AND materia_id = ?', 
                [alumno, materia_id]
            );
            if (rows.length > 0) {
                throw new Error('El alumno ya tiene calificaciones registradas para esta materia');
            }
            return true;
        })
    ],
    validate,
    async (req, res) => {
        const { alumno, materia_id, nota1, nota2, nota3 } = req.body;
        const alumnoLimpio = alumno.trim();

        try {
            const [result] = await db.query(
                'INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)', 
                [alumnoLimpio, materia_id, nota1, nota2, nota3]
            );
            res.status(201).json({ status: 'Exito', mensaje: 'Calificacion creada', datos: { id: result.insertId, alumno: alumnoLimpio, materia_id, nota1, nota2, nota3 } });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

// 3. MODIFICAR CALIFICACION
app.put('/calificaciones/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un numero valido'),
        ...validacionesCalificacion,
        body().custom(async (value, { req }) => {
            const alumno = req.body.alumno ? req.body.alumno.trim().toLowerCase() : '';
            const materia_id = req.body.materia_id;
            const id = req.params.id;
            
            const [rows] = await db.query(
                'SELECT * FROM calificaciones WHERE LOWER(TRIM(alumno)) = ? AND materia_id = ? AND id != ?', 
                [alumno, materia_id, id]
            );
            if (rows.length > 0) {
                throw new Error('Ya existe otro registro de este alumno para esta materia');
            }
            return true;
        })
    ],
    validate,
    async (req, res) => {
        const { id } = req.params;
        const { alumno, materia_id, nota1, nota2, nota3 } = req.body;
        const alumnoLimpio = alumno.trim();

        try {
            const [result] = await db.query(
                'UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?', 
                [alumnoLimpio, materia_id, nota1, nota2, nota3, id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ status: 'Error', mensaje: 'Registro no encontrado' });
            res.json({ status: 'Exito', mensaje: 'Calificacion actualizada', datos: { id: parseInt(id), alumno: alumnoLimpio, materia_id, nota1, nota2, nota3 } });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

// 4. ELIMINAR CALIFICACION
app.delete('/calificaciones/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un numero valido')
    ],
    validate,
    async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await db.query('DELETE FROM calificaciones WHERE id = ?', [id]);
            if (result.affectedRows === 0) return res.status(404).json({ status: 'Error', mensaje: 'Registro no encontrado' });
            res.json({ status: 'Exito', mensaje: 'Registro eliminado' });
        } catch (error) {
            res.status(500).json({ status: 'Error', mensaje: error.message });
        }
    }
);

const PORT = 3002; // Usamos el puerto 3002 para que no choque con los ejercicios anteriores
app.listen(PORT, () => {
    console.log(`Servidor de Ejercicio 3 corriendo en http://localhost:${PORT}`);
});