require("dotenv").config();

const mysql = require("mysql2");

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

conexion.connect((error) => {
  if (error) {
    console.log("Error al conectar con MySQL:", error);
    return;
  }

  console.log("Conectado a MySQL");
});

module.exports = conexion;
