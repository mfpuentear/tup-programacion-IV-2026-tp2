import mysql from "mysql2/promise";

export let db = null;

export async function conectarDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log("Conectado a MySQL para el Ejercicio 2");
  } catch (e) {
    console.error("Error al conectar a la base de datos:", e.message);
    process.exit(1);
  }
}