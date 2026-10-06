const pool = require('../config/db');

const getMaterias = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM materias ORDER BY id ASC');
        return res.status(200).json({
            status: 'success',
            count: rows.length,
            data: rows
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener las materias',
            error: error.message
        });
    }
};

module.exports = { getMaterias };
