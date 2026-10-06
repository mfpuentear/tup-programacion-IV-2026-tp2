import mysql from "mysql2/promise"

export let db = null

export const conectarDB = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    })
    console.log("Base de datos conectada")
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error)
    process.exit(1)
  }
}
