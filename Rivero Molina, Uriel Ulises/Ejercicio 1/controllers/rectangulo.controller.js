const pool = require('../config/db');

const getAllRectangulos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM rectangulos');
        return res.status(200).json({
            status: 'success',
            data: rows
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener los rectángulos',
            error: error.message
        });
    }
};

const getRectanguloById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM rectangulos WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `No se encontró ningún rectángulo con el id ${id}`
            });
        }

        return res.status(200).json({
            status: 'success',
            data: rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el rectángulo',
            error: error.message
        });
    }
};

const createRectangulo = async (req, res) => {
    try {
        const { lado1, lado2 } = req.body;

        // Cálculos realizados exclusivamente en el servidor
        const perimetro = 2 * (lado1 + lado2);
        const superficie = lado1 * lado2;

        const [result] = await pool.query(
            'INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)',
            [lado1, lado2, perimetro, superficie]
        );

        return res.status(201).json({
            status: 'success',
            message: 'Rectángulo creado exitosamente',
            data: {
                id: result.insertId,
                lado1,
                lado2,
                perimetro,
                superficie
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al crear el rectángulo',
            error: error.message
        });
    }
};

const updateRectangulo = async (req, res) => {
    try {
        const { id } = req.params;
        const { lado1, lado2 } = req.body;

        const [existing] = await pool.query('SELECT id FROM rectangulos WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `No existe el rectángulo con ID ${id}`
            });
        }

        // Recálculo en servidor ante modificación
        const perimetro = 2 * (lado1 + lado2);
        const superficie = lado1 * lado2;

        await pool.query(
            'UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?',
            [lado1, lado2, perimetro, superficie, id]
        );

        return res.status(200).json({
            status: 'success',
            message: 'Rectángulo actualizado exitosamente',
            data: {
                id: Number(id),
                lado1,
                lado2,
                perimetro,
                superficie
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el rectángulo',
            error: error.message
        });
    }
};

const deleteRectangulo = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM rectangulos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: `No existe un rectángulo con ID ${id}`
            });
        }

        return res.status(200).json({
            status: 'success',
            message: `Rectángulo con ID ${id} eliminado correctamente`
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el rectángulo',
            error: error.message
        });
    }
};

module.exports = {
    getAllRectangulos,
    getRectanguloById,
    createRectangulo,
    updateRectangulo,
    deleteRectangulo
};