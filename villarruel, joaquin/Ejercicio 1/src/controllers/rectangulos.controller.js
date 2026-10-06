const db = require('../config/database');

const obtenerRectangulos = async (req, res) => {
    try {
        const [rectangulos] = await db.query(
            'SELECT * FROM rectangulos'
        );

        res.json(rectangulos);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener los rectángulos'
        });
    }
};

const obtenerRectangulo = async (req, res) => {
    try {
        const { id } = req.params;

        const [rectangulos] = await db.query(
            'SELECT * FROM rectangulos WHERE id = ?',
            [id]
        );

        if (rectangulos.length === 0) {
            return res.status(404).json({
                error: 'Rectángulo no encontrado'
            });
        }

        res.json(rectangulos[0]);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener el rectángulo'
        });
    }
};

const crearRectangulo = async (req, res) => {
    try {
        const { lado_a, lado_b } = req.body;

        const perimetro = 2 * (lado_a + lado_b);
        const superficie = lado_a * lado_b;

        const [resultado] = await db.query(
            `INSERT INTO rectangulos 
            (lado_a, lado_b, perimetro, superficie)
            VALUES (?, ?, ?, ?)`,
            [lado_a, lado_b, perimetro, superficie]
        );

        res.status(201).json({
            id: resultado.insertId,
            lado_a,
            lado_b,
            perimetro,
            superficie
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error al crear el rectángulo'
        });
    }
};

const modificarRectangulo = async (req, res) => {
    try {
        const { id } = req.params;
        const { lado_a, lado_b } = req.body;

        const perimetro = 2 * (lado_a + lado_b);
        const superficie = lado_a * lado_b;

        const [resultado] = await db.query(
            `UPDATE rectangulos
             SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ?
             WHERE id = ?`,
            [lado_a, lado_b, perimetro, superficie, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Rectángulo no encontrado'
            });
        }

        res.json({
            id,
            lado_a,
            lado_b,
            perimetro,
            superficie
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error al modificar el rectángulo'
        });
    }
};

const eliminarRectangulo = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            'DELETE FROM rectangulos WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Rectángulo no encontrado'
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar el rectángulo'
        });
    }
};

module.exports = {
    obtenerRectangulos,
    obtenerRectangulo,
    crearRectangulo,
    modificarRectangulo,
    eliminarRectangulo
};