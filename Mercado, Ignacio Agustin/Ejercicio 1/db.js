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
    console.log("Conectado a la base de datos MySQL");
  } catch (e) {
    console.error("Error al conectar a la base de datos:", e.message);
    process.exit(1);
  }
}