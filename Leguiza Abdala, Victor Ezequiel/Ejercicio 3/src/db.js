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
    
    await conexionBD.query(`
      CREATE TABLE IF NOT EXISTS materias (
        id_materia INT AUTO_INCREMENT PRIMARY KEY,
        nombre_materia VARCHAR(255) NOT NULL UNIQUE
      );
    `);
    
    await conexionBD.query(`
      CREATE TABLE IF NOT EXISTS calificaciones (
        id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
        nombre_alumno VARCHAR(255) NOT NULL,
        id_materia INT NOT NULL,
        nota_1 DECIMAL(4,2) NOT NULL,
        nota_2 DECIMAL(4,2) NOT NULL,
        nota_3 DECIMAL(4,2) NOT NULL,
        FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE
      );
    `);

    const [materias] = await conexionBD.query('SELECT * FROM materias');
    if (materias.length === 0) {
      await conexionBD.query(`
        INSERT INTO materias (nombre_materia) VALUES 
        ('Programacion'), 
        ('Metodologia de sistemas')
      `);
    }
    
    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la BD:", error);
  }
};

inicializarBaseDeDatos();