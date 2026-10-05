import mysql from "mysql2/promise";

export let db = null;

export async function conectarDB() {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
    });

    console.log("Conectado a la base de datos");
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error.message);
        process.exit(1);
    }
}