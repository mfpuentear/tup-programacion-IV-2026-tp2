import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tp2_ejercicio3',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones a la base de datos
export const pool = mysql.createPool(dbConfig);

/**
 * Inicializa la base de datos y las tablas materias y calificaciones si aún no existen
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

    // Crear tabla materias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`materias\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nombre\` VARCHAR(100) NOT NULL UNIQUE,
        \`codigo\` VARCHAR(20) NOT NULL UNIQUE,
        \`fecha_creacion\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Crear tabla calificaciones con clave foránea y clave única
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`calificaciones\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`alumno\` VARCHAR(100) NOT NULL,
        \`materia_id\` INT NOT NULL,
        \`nota1\` DECIMAL(4, 2) NOT NULL,
        \`nota2\` DECIMAL(4, 2) NOT NULL,
        \`nota3\` DECIMAL(4, 2) NOT NULL,
        \`fecha_registro\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_calificaciones_materia\` FOREIGN KEY (\`materia_id\`)
          REFERENCES \`materias\` (\`id\`)
          ON DELETE RESTRICT
          ON UPDATE CASCADE,
        UNIQUE KEY \`uq_alumno_materia\` (\`alumno\`, \`materia_id\`)
      ) ENGINE=InnoDB;
    `);

    // Insertar materias iniciales si la tabla está vacía
    const [materiasRows] = await pool.query('SELECT COUNT(*) as total FROM materias');
    if (materiasRows[0].total === 0) {
      await pool.query(`
        INSERT INTO materias (id, nombre, codigo) VALUES
        (1, 'Programación IV', 'PROG-4'),
        (2, 'Base de Datos II', 'BD-2'),
        (3, 'Sistemas Operativos', 'SO-1'),
        (4, 'Ingeniería de Software', 'ING-SOFT');
      `);
    }

    // Insertar calificaciones iniciales si está vacía
    const [califRows] = await pool.query('SELECT COUNT(*) as total FROM calificaciones');
    if (califRows[0].total === 0) {
      await pool.query(`
        INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES
        ('Federico Merlo Brac', 1, 9.50, 8.50, 10.00),
        ('Federico Merlo Brac', 2, 8.00, 9.00, 8.50),
        ('Juan Manuel Guerrero', 1, 7.00, 8.00, 7.50);
      `);
    }

    console.log(`[DB] Base de datos '${dbConfig.database}', tablas 'materias' y 'calificaciones' verificadas exitosamente.`);
  } catch (error) {
    const errorMsg = error.message || error.code || (error.errors && error.errors[0]?.message) || String(error);
    console.error(`[DB Error] No se pudo inicializar la base de datos: ${errorMsg}`);
    if (error.code === 'ECONNREFUSED' || (error.errors && error.errors[0]?.code === 'ECONNREFUSED')) {
      console.error(`[DB Error] El servicio de MySQL está DETENIDO o no responde en el puerto ${dbConfig.port}.`);
    }
    console.error(`[DB Sugerencia] Verifica que MySQL esté en ejecución y los datos de conexión en el archivo .env sean correctos.`);
  }
}
