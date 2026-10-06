const pool = require('./db');

async function probarConexion() {
    try {
        const [resultado] = await pool.query('SELECT 1 AS conexion');
        console.log(resultado);
        console.log('Conexión a MySQL correcta');
    } catch (error) {
        console.error('Error de conexión:', error.message);
    } finally {
        await pool.end();
    }
}

probarConexion();