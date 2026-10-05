const db = require('../db');

// Obtener todas las materias
const obtenerMaterias = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM materias');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las materias.' });
    }
};

// Crear una materia nueva
const crearMateria = async (req, res) => {
    try {
        const { nombre } = req.body;
        const nombreNormalizado = nombre.trim();

        // Verificar unicidad
        const [existente] = await db.query(
            'SELECT * FROM materias WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))',
            [nombreNormalizado]
        );

        if (existente.length > 0) {
            return res.status(400).json({ error: 'Ya existe una materia con ese nombre.' });
        }

        const [resultado] = await db.query(
            'INSERT INTO materias (nombre) VALUES (?)',
            [nombreNormalizado]
        );

        res.status(201).json({ id: resultado.insertId, nombre: nombreNormalizado });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la materia.' });
    }
};

module.exports = { obtenerMaterias, crearMateria };