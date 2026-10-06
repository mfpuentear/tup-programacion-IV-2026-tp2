const pool = require('../config/db');

const getCalificaciones = async (req, res) => {
    try {
        const { materia_id, alumno } = req.query;
        let querySql = `
            SELECT 
                c.id,
                c.alumno,
                c.materia_id,
                m.nombre AS materia_nombre,
                c.nota1,
                c.nota2,
                c.nota3,
                ROUND((c.nota1 + c.nota2 + c.nota3) / 3, 2) AS promedio,
                c.created_at,
                c.updated_at
            FROM calificaciones c
            JOIN materias m ON c.materia_id = m.id
        `;
        const params = [];
        const conditions = [];

        if (materia_id) {
            conditions.push('c.materia_id = ?');
            params.push(materia_id);
        }

        if (alumno) {
            conditions.push('LOWER(c.alumno) LIKE LOWER(?)');
            params.push(`%${alumno}%`);
        }

        if (conditions.length > 0) {
            querySql += ' WHERE ' + conditions.join(' AND ');
        }

        querySql += ' ORDER BY c.created_at DESC';

        const [rows] = await pool.query(querySql, params);

        return res.status(200).json({
            status: 'success',
            count: rows.length,
            data: rows
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener las calificaciones',
            error: error.message
        });
    }
};

const getCalificacionById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT 
                c.id,
                c.alumno,
                c.materia_id,
                m.nombre AS materia_nombre,
                c.nota1,
                c.nota2,
                c.nota3,
                ROUND((c.nota1 + c.nota2 + c.nota3) / 3, 2) AS promedio,
                c.created_at,
                c.updated_at
            FROM calificaciones c
            JOIN materias m ON c.materia_id = m.id
            WHERE c.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `No se encontró ningún registro de calificación con el ID ${id}`
            });
        }

        return res.status(200).json({
            status: 'success',
            data: rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el registro de calificación',
            error: error.message
        });
    }
};

const createCalificacion = async (req, res) => {
    try {
        const { alumno, materia_id, nota1, nota2, nota3 } = req.body;

        const [result] = await pool.query(
            'INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
            [alumno.trim(), materia_id, nota1, nota2, nota3]
        );

        const promedio = Number(((nota1 + nota2 + nota3) / 3).toFixed(2));

        return res.status(201).json({
            status: 'success',
            message: 'Registro de calificación creado exitosamente',
            data: {
                id: result.insertId,
                alumno: alumno.trim(),
                materia_id,
                nota1,
                nota2,
                nota3,
                promedio
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al guardar la calificación',
            error: error.message
        });
    }
};

const updateCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { alumno, materia_id, nota1, nota2, nota3 } = req.body;

        const [existing] = await pool.query('SELECT id FROM calificaciones WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `No existe una calificación registrada con el ID ${id}`
            });
        }

        await pool.query(
            'UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
            [alumno.trim(), materia_id, nota1, nota2, nota3, id]
        );

        const promedio = Number(((nota1 + nota2 + nota3) / 3).toFixed(2));

        return res.status(200).json({
            status: 'success',
            message: 'Registro de calificación actualizado exitosamente',
            data: {
                id: Number(id),
                alumno: alumno.trim(),
                materia_id,
                nota1,
                nota2,
                nota3,
                promedio
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar la calificación',
            error: error.message
        });
    }
};

const deleteCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM calificaciones WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: `No existe un registro de calificación con el ID ${id}`
            });
        }

        return res.status(200).json({
            status: 'success',
            message: `Registro de calificación con ID ${id} eliminado correctamente`
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el registro de calificación',
            error: error.message
        });
    }
};

module.exports = {
    getCalificaciones,
    getCalificacionById,
    createCalificacion,
    updateCalificacion,
    deleteCalificacion
};
