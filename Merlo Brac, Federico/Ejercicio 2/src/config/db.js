import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tp2_ejercicio2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones a la base de datos
export const pool = mysql.createPool(dbConfig);

/**
 * Inicializa la base de datos y la tabla tareas si aún no existen
 */
export async function initDatabase() {
  try {
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`tareas\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nombre\` VARCHAR(150) NOT NULL,
        \`estado\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`fecha_creacion\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`uq_tarea_nombre\` (\`nombre\`)
      ) ENGINE=InnoDB;
    `);

    const [rows] = await pool.query('SELECT COUNT(*) as total FROM tareas');
    if (rows[0].total === 0) {
      await pool.query(`
        INSERT INTO tareas (nombre, estado) VALUES
        ('Configurar entorno de desarrollo', TRUE),
        ('Diseñar base de datos MySQL', TRUE),
        ('Implementar validaciones con express-validator', FALSE),
        ('Redactar documentación y pruebas http', FALSE);
      `);
    }

    console.log(`[DB] Base de datos '${dbConfig.database}' y tabla 'tareas' verificadas exitosamente.`);
  } catch (error) {
    console.error(`[DB Error] No se pudo inicializar la base de datos: ${error.message}`);
    console.error(`[DB Sugerencia] Verifica que MySQL esté en ejecución y los datos de conexión en el archivo .env sean correctos.`);
  }
}
