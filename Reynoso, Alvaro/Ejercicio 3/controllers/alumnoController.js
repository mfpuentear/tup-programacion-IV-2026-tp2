const db = require('../config/db');


// Obtener todos los alumnos
const obtenerTodos = async (req, res) => {
    try {
        const [resultado] = await db.promise().query(
            'SELECT DISTINCT nombre_alumno FROM calificaciones ORDER BY nombre_alumno'
        );

        res.status(200).json(resultado);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener los alumnos'
        });
    }
};


// Obtener las calificaciones de un alumno
const obtenerUno = async (req, res) => {
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
             WHERE c.nombre_alumno = ?`,
            [req.params.nombre]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                error: 'Alumno no encontrado'
            });
        }

        res.status(200).json(resultado);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener el alumno'
        });
    }
};


module.exports = {
    obtenerTodos,
    obtenerUno
};