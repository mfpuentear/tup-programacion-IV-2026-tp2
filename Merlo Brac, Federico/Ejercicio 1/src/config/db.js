import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tp2_ejercicio1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones a la base de datos
export const pool = mysql.createPool(dbConfig);

/**
 * Inicializa la base de datos y la tabla si aún no existen
 */
export async function initDatabase() {
  try {
    // Conexión inicial sin especificar base de datos para crearla si no existe
    const adminConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminConnection.end();

    // Crear la tabla rectangulos si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`rectangulos\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`lado1\` DECIMAL(10, 2) NOT NULL,
        \`lado2\` DECIMAL(10, 2) NOT NULL,
        \`perimetro\` DECIMAL(10, 2) NOT NULL,
        \`superficie\` DECIMAL(10, 2) NOT NULL,
        \`fecha_creacion\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Comprobar si hay datos, si está vacía insertar iniciales
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM rectangulos');
    if (rows[0].total === 0) {
      await pool.query(`
        INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES
        (10.00, 5.00, 30.00, 50.00),
        (6.00, 6.00, 24.00, 36.00),
        (14.00, 8.00, 44.00, 112.00);
      `);
    }

    console.log(`[DB] Base de datos '${dbConfig.database}' y tabla 'rectangulos' verificadas exitosamente.`);
  } catch (error) {
    const errorMsg = error.message || error.code || (error.errors && error.errors[0]?.message) || String(error);
    console.error(`[DB Error] No se pudo inicializar la base de datos: ${errorMsg}`);
    if (error.code === 'ECONNREFUSED' || (error.errors && error.errors[0]?.code === 'ECONNREFUSED')) {
      console.error(`[DB Error] El servicio de MySQL está DETENIDO o no responde en el puerto ${dbConfig.port}.`);
    }
    console.error(`[DB Sugerencia] Verifica que MySQL esté en ejecución y los datos de conexión en el archivo .env sean correctos.`);
  }
}
