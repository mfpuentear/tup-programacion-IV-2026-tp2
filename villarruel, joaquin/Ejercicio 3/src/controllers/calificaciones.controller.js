const db = require('../config/database');

const obtenerCalificaciones = async (req, res) => {
    try {
        const [registros] = await db.query(`
            SELECT
                c.id,
                c.alumno,
                m.id AS materia_id,
                m.nombre AS materia,
                c.nota1,
                c.nota2,
                c.nota3
            FROM calificaciones c
            INNER JOIN materias m ON c.materia_id = m.id
            ORDER BY c.id
        `);

        res.json(registros);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener las calificaciones'
        });
    }
};

const obtenerCalificacion = async (req, res) => {
    try {
        const { id } = req.params;

        const [registros] = await db.query(`
            SELECT
                c.id,
                c.alumno,
                m.id AS materia_id,
                m.nombre AS materia,
                c.nota1,
                c.nota2,
                c.nota3
            FROM calificaciones c
            INNER JOIN materias m ON c.materia_id = m.id
            WHERE c.id = ?
        `, [id]);

        if (registros.length === 0) {
            return res.status(404).json({
                error: 'Calificación no encontrada'
            });
        }

        res.json(registros[0]);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener la calificación'
        });
    }
};

const crearCalificacion = async (req, res) => {
    try {
        const { alumno, materia_id, notas } = req.body;

        const alumnoLimpio = alumno.trim();
        const alumnoNormalizado = alumnoLimpio.toLowerCase();

        const [materias] = await db.query(
            'SELECT id FROM materias WHERE id = ?',
            [materia_id]
        );

        if (materias.length === 0) {
            return res.status(400).json({
                error: 'La materia indicada no existe'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO calificaciones
            (alumno, alumno_normalizado, materia_id, nota1, nota2, nota3)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                alumnoLimpio,
                alumnoNormalizado,
                materia_id,
                notas[0],
                notas[1],
                notas[2]
            ]
        );

        res.status(201).json({
            id: resultado.insertId,
            alumno: alumnoLimpio,
            materia_id,
            notas
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe una calificación para ese alumno y materia'
            });
        }

        res.status(500).json({
            error: 'Error al crear la calificación'
        });
    }
};

const modificarCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { alumno, materia_id, notas } = req.body;

        const alumnoLimpio = alumno.trim();
        const alumnoNormalizado = alumnoLimpio.toLowerCase();

        const [materias] = await db.query(
            'SELECT id FROM materias WHERE id = ?',
            [materia_id]
        );

        if (materias.length === 0) {
            return res.status(400).json({
                error: 'La materia indicada no existe'
            });
        }

        const [resultado] = await db.query(
            `UPDATE calificaciones
             SET alumno = ?,
                 alumno_normalizado = ?,
                 materia_id = ?,
                 nota1 = ?,
                 nota2 = ?,
                 nota3 = ?
             WHERE id = ?`,
            [
                alumnoLimpio,
                alumnoNormalizado,
                materia_id,
                notas[0],
                notas[1],
                notas[2],
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Calificación no encontrada'
            });
        }

        res.json({
            id: Number(id),
            alumno: alumnoLimpio,
            materia_id,
            notas
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe una calificación para ese alumno y materia'
            });
        }

        res.status(500).json({
            error: 'Error al modificar la calificación'
        });
    }
};

const eliminarCalificacion = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            'DELETE FROM calificaciones WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Calificación no encontrada'
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar la calificación'
        });
    }
};

module.exports = {
    obtenerCalificaciones,
    obtenerCalificacion,
    crearCalificacion,
    modificarCalificacion,
    eliminarCalificacion
};