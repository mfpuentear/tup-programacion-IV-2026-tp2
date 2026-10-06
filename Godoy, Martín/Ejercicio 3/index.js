import express from 'express';
import { body, param, validationResult } from 'express-validator';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const validarMateriaExiste = async (materia_id) => {
    if (!materia_id) return true;
    const [rows] = await db.query('SELECT id FROM materia WHERE id = ?', [materia_id]);
    if (rows.length === 0) throw new Error('La materia especificada no existe en la base de datos');
    return true;
};

const validarUnicidadRegistro = async (alumno, { req }) => {
    const materia_id = req.body.materia_id;
    if (!alumno || !materia_id) return true; 

    const nombreLimpio = alumno.trim().toLowerCase();
    let sql = 'SELECT id FROM calificacion WHERE LOWER(TRIM(alumno)) = ? AND materia_id = ?';
    let params = [nombreLimpio, materia_id];

    if (req.params && req.params.id) {
        sql += ' AND id != ?';
        params.push(req.params.id);
    }

    const [rows] = await db.query(sql, params);
    if (rows.length > 0) throw new Error('El alumno ya tiene un registro de calificaciones para esta materia');
    return true;
};

const validacionesCalificacion = [
    body('alumno')
        .trim().notEmpty().withMessage('El nombre del alumno es obligatorio')
        .isString().withMessage('El nombre debe ser texto')
        .custom(validarUnicidadRegistro),
    body('materia_id')
        .notEmpty().withMessage('El ID de la materia es obligatorio')
        .isInt().withMessage('El ID de la materia debe ser un número entero')
        .custom(validarMateriaExiste),
    body('notas')
        .isArray({ min: 3, max: 3 }).withMessage('Debe enviar exactamente un arreglo con tres notas')
        .custom((notas) => {
            for (let n of notas) {
                if (typeof n !== 'number' || n < 1 || n > 10) {
                    throw new Error('Todas las notas deben ser numéricas y estar en la escala del 1 al 10');
                }
            }
            return true;
        })
];

const validacionId = [
    param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo')
];

app.get('/api/materias', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM materia');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener materias' });
    }
});

app.get('/api/calificaciones', async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.alumno, m.nombre as materia, c.materia_id, c.nota1, c.nota2, c.nota3 
            FROM calificacion c 
            JOIN materia m ON c.materia_id = m.id
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
});

app.post('/api/calificaciones', validacionesCalificacion, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

    const { alumno, materia_id, notas } = req.body;

    try {
        const [result] = await db.execute(
            'INSERT INTO calificacion (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
            [alumno.trim(), materia_id, notas[0], notas[1], notas[2]]
        );
        res.status(201).json({ id: result.insertId, alumno, materia_id, notas });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar la calificación' });
    }
});

app.put('/api/calificaciones/:id', [...validacionId, ...validacionesCalificacion], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

    const { alumno, materia_id, notas } = req.body;
    const id = req.params.id;

    try {
        const [result] = await db.execute(
            'UPDATE calificacion SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
            [alumno.trim(), materia_id, notas[0], notas[1], notas[2], id]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
        res.json({ id: parseInt(id), alumno, materia_id, notas });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

app.delete('/api/calificaciones/:id', validacionId, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

    try {
        const [result] = await db.execute('DELETE FROM calificacion WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});