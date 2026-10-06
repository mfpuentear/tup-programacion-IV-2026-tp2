import mysql from "mysql2/promise"

export let db = null

export async function conectarDb() {
    try {
        db = await mysql.createConnection ({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        })
        console.log ("conectado a la base de datos")
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
}