import mysql from 'mysql2/promise';

export const conexionBD = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const inicializarBaseDeDatos = async () => {
  try {
    await conexionBD.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
    
    await conexionBD.query(`USE ${process.env.DB_NAME};`);
    
    const crearTablaQuery = `
      CREATE TABLE IF NOT EXISTS tabla_tareas (
        id_tarea INT AUTO_INCREMENT PRIMARY KEY,
        titulo_tarea VARCHAR(255) NOT NULL,
        esta_completada BOOLEAN NOT NULL DEFAULT FALSE
      );
    `;
    await conexionBD.query(crearTablaQuery);
    
    console.log("tabla 'tabla_tareas'creada");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
};

inicializarBaseDeDatos();