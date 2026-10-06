const db = require('../config/db');


// Obtener todos
const obtenerTodos = async (req, res) => {
    try {
        const [resultado] = await db.promise().query(
            'SELECT * FROM rectangulos'
        );

        res.status(200).json(resultado);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener los rectángulos'
        });
    }
};


// Obtener uno
const obtenerUno = async (req, res) => {
    try {
        const [resultado] = await db.promise().execute(
            'SELECT * FROM rectangulos WHERE id = ?',
            [req.params.id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                error: 'Rectángulo no encontrado'
            });
        }

        res.status(200).json(resultado[0]);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener el rectángulo'
        });
    }
};


// Crear
const crear = async (req, res) => {
    try {
        const ladoA = Number(req.body.ladoA);
        const ladoB = Number(req.body.ladoB);

        const perimetro = 2 * (ladoA + ladoB);
        const superficie = ladoA * ladoB;

        const [resultado] = await db.promise().execute(
            `INSERT INTO rectangulos
            (ladoA, ladoB, perimetro, superficie)
            VALUES (?, ?, ?, ?)`,
            [ladoA, ladoB, perimetro, superficie]
        );

        res.status(201).json({
            mensaje: 'Rectángulo creado correctamente',
            id: resultado.insertId,
            ladoA,
            ladoB,
            perimetro,
            superficie
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al crear el rectángulo'
        });
    }
};


// Modificar
const modificar = async (req, res) => {
    try {
        const ladoA = Number(req.body.ladoA);
        const ladoB = Number(req.body.ladoB);

        const perimetro = 2 * (ladoA + ladoB);
        const superficie = ladoA * ladoB;

        const [resultado] = await db.promise().execute(
            `UPDATE rectangulos
            SET ladoA = ?, ladoB = ?, perimetro = ?, superficie = ?
            WHERE id = ?`,
            [ladoA, ladoB, perimetro, superficie, req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Rectángulo no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Rectángulo modificado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al modificar el rectángulo'
        });
    }
};


// Eliminar
const eliminar = async (req, res) => {
    try {
        const [resultado] = await db.promise().execute(
            'DELETE FROM rectangulos WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Rectángulo no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Rectángulo eliminado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar el rectángulo'
        });
    }
};


module.exports = {
    obtenerTodos,
    obtenerUno,
    crear,
    modificar,
    eliminar
};