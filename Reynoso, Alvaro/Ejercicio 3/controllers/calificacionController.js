const db = require('../config/db');


// Obtener todas las calificaciones
const obtenerTodas = async (req, res) => {
    try {
        const [resultado] = await db.promise().query(
            `SELECT
                c.id,
                c.nombre_alumno,
                m.nombre AS materia,
                c.nota1,
                c.nota2,
                c.nota3
             FROM calificaciones c
             INNER JOIN materias m ON c.materia_id = m.id
             ORDER BY c.nombre_alumno, m.nombre`
        );

        res.status(200).json(resultado);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener las calificaciones'
        });
    }
};


// Obtener una calificación
const obtenerUna = async (req, res) => {
    try {
        const [resultado] = await db.promise().execute(
            `SELECT
                c.id,
                c.nombre_alumno,
                m.nombre AS materia,
                c.nota1,
                c.nota2,
                c.nota3
             FROM calificaciones c
             INNER JOIN materias m ON c.materia_id = m.id
             WHERE c.id = ?`,
            [req.params.id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                error: 'Calificación no encontrada'
            });
        }

        res.status(200).json(resultado[0]);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener la calificación'
        });
    }
};


// Crear calificación
const crear = async (req, res) => {
    try {
        const nombreAlumno = req.body.nombreAlumno.trim();
        const materiaId = req.body.materiaId;
        const { nota1, nota2, nota3 } = req.body;

        // Verificar que exista la materia
        const [materia] = await db.promise().execute(
            'SELECT id FROM materias WHERE id = ?',
            [materiaId]
        );

        if (materia.length === 0) {
            return res.status(404).json({
                error: 'La materia no existe'
            });
        }

        // Verificar que no exista la combinación alumno + materia
        const [existente] = await db.promise().execute(
            `SELECT id
             FROM calificaciones
             WHERE LOWER(nombre_alumno) = LOWER(?)
             AND materia_id = ?`,
            [nombreAlumno, materiaId]
        );

        if (existente.length > 0) {
            return res.status(409).json({
                error: 'El alumno ya tiene una calificación registrada para esa materia'
            });
        }

        const [resultado] = await db.promise().execute(
            `INSERT INTO calificaciones
            (nombre_alumno, materia_id, nota1, nota2, nota3)
            VALUES (?, ?, ?, ?, ?)`,
            [
                nombreAlumno,
                materiaId,
                nota1,
                nota2,
                nota3
            ]
        );

        res.status(201).json({
            mensaje: 'Calificación creada correctamente',
            id: resultado.insertId
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al crear la calificación'
        });
    }
};


// Modificar calificación
const modificar = async (req, res) => {
    try {
        const nombreAlumno = req.body.nombreAlumno.trim();
        const materiaId = req.body.materiaId;
        const { nota1, nota2, nota3 } = req.body;

        // Verificar materia
        const [materia] = await db.promise().execute(
            'SELECT id FROM materias WHERE id = ?',
            [materiaId]
        );

        if (materia.length === 0) {
            return res.status(404).json({
                error: 'La materia no existe'
            });
        }

        // Verificar unicidad
        const [existente] = await db.promise().execute(
            `SELECT id
             FROM calificaciones
             WHERE LOWER(nombre_alumno) = LOWER(?)
             AND materia_id = ?
             AND id <> ?`,
            [
                nombreAlumno,
                materiaId,
                req.params.id
            ]
        );

        if (existente.length > 0) {
            return res.status(409).json({
                error: 'El alumno ya tiene una calificación para esa materia'
            });
        }

        const [resultado] = await db.promise().execute(
            `UPDATE calificaciones
             SET nombre_alumno = ?,
                 materia_id = ?,
                 nota1 = ?,
                 nota2 = ?,
                 nota3 = ?
             WHERE id = ?`,
            [
                nombreAlumno,
                materiaId,
                nota1,
                nota2,
                nota3,
                req.params.id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Calificación no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Calificación modificada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al modificar la calificación'
        });
    }
};


// Eliminar calificación
const eliminar = async (req, res) => {
    try {
        const [resultado] = await db.promise().execute(
            'DELETE FROM calificaciones WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Calificación no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Calificación eliminada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar la calificación'
        });
    }
};


module.exports = {
    obtenerTodas,
    obtenerUna,
    crear,
    modificar,
    eliminar
};