const db = require('../config/database');

const obtenerMaterias = async (req, res) => {
    try {
        const [materias] = await db.query(
            'SELECT id, nombre FROM materias ORDER BY id'
        );

        res.json(materias);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener las materias'
        });
    }
};

const obtenerMateria = async (req, res) => {
    try {
        const { id } = req.params;

        const [materias] = await db.query(
            'SELECT id, nombre FROM materias WHERE id = ?',
            [id]
        );

        if (materias.length === 0) {
            return res.status(404).json({
                error: 'Materia no encontrada'
            });
        }

        res.json(materias[0]);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener la materia'
        });
    }
};

const crearMateria = async (req, res) => {
    try {
        const nombre = req.body.nombre.trim();

        const [resultado] = await db.query(
            'INSERT INTO materias (nombre) VALUES (?)',
            [nombre]
        );

        res.status(201).json({
            id: resultado.insertId,
            nombre
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe una materia con ese nombre'
            });
        }

        res.status(500).json({
            error: 'Error al crear la materia'
        });
    }
};

const modificarMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const nombre = req.body.nombre.trim();

        const [resultado] = await db.query(
            'UPDATE materias SET nombre = ? WHERE id = ?',
            [nombre, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Materia no encontrada'
            });
        }

        res.json({
            id: Number(id),
            nombre
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe una materia con ese nombre'
            });
        }

        res.status(500).json({
            error: 'Error al modificar la materia'
        });
    }
};

const eliminarMateria = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            'DELETE FROM materias WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Materia no encontrada'
            });
        }

        res.status(204).send();
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                error: 'No se puede eliminar una materia que tiene calificaciones'
            });
        }

        res.status(500).json({
            error: 'Error al eliminar la materia'
        });
    }
};

module.exports = {
    obtenerMaterias,
    obtenerMateria,
    crearMateria,
    modificarMateria,
    eliminarMateria
};