const db = require('../db');

// Obtener todas las calificaciones con datos de su materia
const obtenerCalificaciones = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.id, c.alumno_nombre, m.nombre AS materia, c.nota1, c.nota2, c.nota3 
            FROM calificaciones c
            JOIN materias m ON c.materia_id = m.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las calificaciones.' });
    }
};

// Crear calificación validando la unicidad de alumno + materia
const crearCalificacion = async (req, res) => {
    try {
        const { alumno_nombre, materia_id, nota1, nota2, nota3 } = req.body;
        const nombreNormalizado = alumno_nombre.trim();

        // Validar unicidad explícita para la combinación
        const [existente] = await db.query(
            'SELECT * FROM calificaciones WHERE LOWER(TRIM(alumno_nombre)) = LOWER(TRIM(?)) AND materia_id = ?',
            [nombreNormalizado, materia_id]
        );

        if (existente.length > 0) {
            return res.status(400).json({ error: 'Ya existe un registro de calificaciones para este alumno en la materia seleccionada.' });
        }

        const [resultado] = await db.query(
            'INSERT INTO calificaciones (alumno_nombre, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
            [nombreNormalizado, materia_id, nota1, nota2, nota3]
        );

        res.status(201).json({
            id: resultado.insertId,
            alumno_nombre: nombreNormalizado,
            materia_id,
            nota1,
            nota2,
            nota3
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar la calificación.' });
    }
};

module.exports = { obtenerCalificaciones, crearCalificacion };

// Actualizar calificación validando unicidad de alumno + materia (excluyendo el registro actual)
const actualizarCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { alumno_nombre, materia_id, nota1, nota2, nota3 } = req.body;
        const nombreNormalizado = alumno_nombre.trim();

        // Verificar si la calificación existe
        const [current] = await db.query('SELECT * FROM calificaciones WHERE id = ?', [id]);
        if (current.length === 0) {
            return res.status(404).json({ error: 'Registro de calificación no encontrado.' });
        }

        // Verificar unicidad para la combinación alumno + materia excluyendo este ID
        const [existente] = await db.query(
            'SELECT * FROM calificaciones WHERE LOWER(TRIM(alumno_nombre)) = LOWER(TRIM(?)) AND materia_id = ? AND id != ?',
            [nombreNormalizado, materia_id, id]
        );

        if (existente.length > 0) {
            return res.status(400).json({ error: 'Ya existe otro registro para este alumno en la materia seleccionada.' });
        }

        await db.query(
            'UPDATE calificaciones SET alumno_nombre = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
            [nombreNormalizado, materia_id, nota1, nota2, nota3, id]
        );

        res.json({ id: Number(id), alumno_nombre: nombreNormalizado, materia_id, nota1, nota2, nota3 });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la calificación.' });
    }
};